// Final PNG masters → a scrub video per framing, for touch devices (lib/entrance/VideoPlayer.ts).
// usage: FFMPEG=/path/to/ffmpeg node scripts/encode-video.mjs [--src DIR] [--dst DIR] [--only portrait|landscape]
//        [--samples N] [--keyint K] [--crf C] [--no-webm] [--check-budget] [--check-only]
// Shipped with the defaults: 240 samples, a keyframe every 8, CRF 18 — SSIM ≈ 0.989 against the exact blends
// (the AVIF frames: 0.9915), 2.9 MB portrait / 3.1 MB landscape (MP4).
//
// Every video frame is the canvas's own approved picture at one progress value: the two neighbouring renders
// cross-faded exactly as FramePlayer draws them (A, then B at alpha w). Samples are uniform in progress between
// the first and last render, so video time is linear in p and the player seeks by arithmetic. The frames' own
// p values are recorded in the manifest (`video.p0`, `video.p1`, `video.samples`), so the surface quad is
// computed for the exact sample on screen. No Blender rerender: only the existing masters are read.
//
// Output: DST/<kind>/scrub.mp4 (H.264, for Safari/iOS and Chrome) and scrub.webm (VP9, for browsers without
// H.264, e.g. open-source Chromium). Short GOPs keep a seek to any frame cheap. Needs an ffmpeg with libx264
// and libvpx-vp9 (FFMPEG env var); it is a build-time tool only, not a dependency of the site.
import fs from "node:fs/promises";
import { spawn } from "node:child_process";
import sharp from "sharp";

const arg = (name, dflt) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : dflt; };
const SRC = arg("--src", "design/render/blender/out-final");
const DST = arg("--dst", "public/entrance");
const ONLY = arg("--only", null);
const SAMPLES = Number(arg("--samples", 240));
const KEYINT = Number(arg("--keyint", 8));
const CRF = Number(arg("--crf", 18));
const WEBM = !process.argv.includes("--no-webm");
const FFMPEG = process.env.FFMPEG || "ffmpeg";
const FPS = 30;
// Phones only (tablets and desktop keep the AVIF canvas): portrait at the phone tier's density, landscape (a
// phone held sideways, at most ~480 CSS px tall) at 960×540.
const SIZE = { portrait: [608, 1080], landscape: [960, 540] };

const resolve = (p, frames) => { // lib/entrance/frames.ts resolveFrame, verbatim
  const n = frames.length;
  if (p <= frames[0].p) return { a: 0, b: 0, w: 0 };
  if (p >= frames[n - 1].p) return { a: n - 1, b: n - 1, w: 0 };
  let lo = 0, hi = n - 1;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (frames[mid].p <= p) lo = mid; else hi = mid; }
  return { a: lo, b: hi, w: (p - frames[lo].p) / (frames[hi].p - frames[lo].p) };
};

const run = (args, input) => new Promise((ok, fail) => {
  const pr = spawn(FFMPEG, args, { stdio: ["pipe", "ignore", "pipe"] }); let err = "";
  pr.stderr.on("data", (d) => { err += d; });
  pr.on("close", (c) => (c === 0 ? ok() : fail(new Error(`ffmpeg ${c}\n${err.slice(-2000)}`))));
  input(pr.stdin);
});

async function encode(kind, manifest) {
  const set = manifest[kind], [W, H] = SIZE[kind];
  const cache = new Map(); // decoded renders at output size, raw RGB
  const raw = async (i) => {
    if (!cache.has(i)) cache.set(i, await sharp(`${SRC}/${kind}/${set.frames[i].file}.png`).resize(W, H, { fit: "fill" }).removeAlpha().raw().toBuffer());
    for (const k of cache.keys()) if (cache.size > 6 && k < i - 2) cache.delete(k);
    return cache.get(i);
  };
  const p0 = set.frames[0].p, p1 = set.frames.at(-1).p;
  const frameAt = async (s) => {
    const p = p0 + ((p1 - p0) * s) / (SAMPLES - 1), r = resolve(p, set.frames);
    const A = await raw(r.a); if (r.w === 0 || r.a === r.b) return A;
    const B = await raw(r.b), out = Buffer.allocUnsafe(A.length), w = r.w;
    // Canvas source-over with an opaque B at alpha w, rounded like an 8-bit compositor.
    for (let k = 0; k < A.length; k++) out[k] = Math.round(A[k] + (B[k] - A[k]) * w);
    return out;
  };
  const feed = async (stdin) => {
    for (let s = 0; s < SAMPLES; s++) { const f = await frameAt(s); if (!stdin.write(f)) await new Promise((r) => stdin.once("drain", r)); }
    stdin.end();
  };
  const input = ["-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", `${W}x${H}`, "-r", String(FPS), "-i", "-", "-an"];
  const out = `${DST}/${kind}`;
  await fs.mkdir(out, { recursive: true });
  // H.264 High, yuv420p, no B-frames (every frame decodes from what precedes it: cheap backward seeks too),
  // a keyframe every KEYINT frames, moov atom first so playback can start before the whole file arrives.
  await run([...input, "-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p", "-preset", "veryslow", "-tune", "film",
    "-crf", String(CRF), "-g", String(KEYINT), "-keyint_min", String(KEYINT), "-sc_threshold", "0", "-bf", "0",
    "-movflags", "+faststart", `${out}/scrub.mp4`], feed);
  if (WEBM) await run([...input, "-c:v", "libvpx-vp9", "-pix_fmt", "yuv420p", "-crf", String(CRF + 12), "-b:v", "0", "-g", String(KEYINT),
    "-deadline", "good", "-cpu-used", "2", "-row-mt", "1", `${out}/scrub.webm`], feed);
  return { width: W, height: H, samples: SAMPLES, fps: FPS, p0, p1, keyint: KEYINT };
}

const manifestPath = `${DST}/manifest.json`;
const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
const CHECK_ONLY = process.argv.includes("--check-only");   // budget check of the shipped files, no encoding
for (const kind of CHECK_ONLY ? [] : ONLY ? [ONLY] : ["portrait", "landscape"]) {
  const video = await encode(kind, manifest);
  manifest[kind].video = video;
  const sz = async (f) => (await fs.stat(`${DST}/${kind}/${f}`).catch(() => ({ size: 0 }))).size;
  console.log(kind, JSON.stringify(video), "mp4", await sz("scrub.mp4"), "webm", await sz("scrub.webm"));
}
if (!CHECK_ONLY && !process.argv.includes("--dry")) await fs.writeFile(manifestPath, JSON.stringify(manifest));

// Payload budget per phone video (one format per visitor): ~3× the WebP frames, bought for hardware decoding.
if (CHECK_ONLY || process.argv.includes("--check-budget")) {
  const BUDGET = 3.5e6, over = [];
  for (const kind of ONLY ? [ONLY] : ["portrait", "landscape"]) for (const ext of ["mp4", "webm"]) {
    const n = (await fs.stat(`${DST}/${kind}/scrub.${ext}`).catch(() => ({ size: 0 }))).size;
    if (n > BUDGET) over.push(`${kind} scrub.${ext}: ${n} > ${BUDGET}`);
  }
  if (over.length) { console.error("video payload budget exceeded:\n  " + over.join("\n  ")); process.exit(1); }
  console.log("video payload within budget");
}
