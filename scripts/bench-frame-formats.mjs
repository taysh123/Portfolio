// Frame-format benchmark for the entrance sequence, from the final PNG masters (no re-render).
// For each set: the shipped AVIF (or an AVIF at the shipped settings for a new tier), and WebP / JPEG at the
// lowest quality whose mean SSIM against the tier-sized master matches the AVIF's. Reports payload, fidelity
// (PSNR, SSIM) and createImageBitmap decode cost in Chromium — sequential and 4 in flight, unthrottled and at
// 4x CPU throttling (the mobile stand-in). Safari/WebKit is not available in this environment.
// usage: PW_CHROMIUM=/opt/pw-browsers/chromium node scripts/bench-frame-formats.mjs [--sets landscape:1280,...] [--out f.json]
import fs from "node:fs";
import sharp from "sharp";
import { chromium } from "playwright";

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const SETS = arg("sets", "landscape:1280,landscape:1920,portrait:720,portrait:600,portrait:540").split(",").map((s) => { const [kind, t] = s.split(":"); return { kind, tier: Number(t) }; });
const MASTERS = "design/render/blender/out-final";
const manifest = JSON.parse(fs.readFileSync("public/entrance/manifest.json", "utf8"));

// SSIM on luma, 8x8 blocks (the classic constants); PSNR on RGB.
function luma(buf, ch) { const n = buf.length / ch, y = new Float64Array(n); for (let i = 0; i < n; i++) y[i] = 0.299 * buf[i * ch] + 0.587 * buf[i * ch + 1] + 0.114 * buf[i * ch + 2]; return y; }
function ssim(a, b, w, h) {
  const C1 = (0.01 * 255) ** 2, C2 = (0.03 * 255) ** 2; let sum = 0, n = 0;
  for (let y = 0; y + 8 <= h; y += 8) for (let x = 0; x + 8 <= w; x += 8) {
    let ma = 0, mb = 0; for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) { const k = (y + j) * w + x + i; ma += a[k]; mb += b[k]; }
    ma /= 64; mb /= 64; let va = 0, vb = 0, cv = 0;
    for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) { const k = (y + j) * w + x + i; const da = a[k] - ma, db = b[k] - mb; va += da * da; vb += db * db; cv += da * db; }
    va /= 63; vb /= 63; cv /= 63;
    sum += ((2 * ma * mb + C1) * (2 * cv + C2)) / ((ma * ma + mb * mb + C1) * (va + vb + C2)); n++;
  }
  return sum / n;
}
function psnr(a, b) { let se = 0; for (let i = 0; i < a.length; i++) { const d = a[i] - b[i]; se += d * d; } const mse = se / a.length; return 10 * Math.log10((255 * 255) / mse); }

async function fidelity(refRaw, encoded, w, h) {
  const { data } = await sharp(encoded).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return { psnr: psnr(refRaw, data), ssim: ssim(luma(refRaw, 3), luma(data, 3), w, h) };
}

const results = {};
for (const { kind, tier } of SETS) {
  const set = manifest[kind]; const files = set.frames.map((f) => f.file);
  // Every 4th frame for fidelity (the sequence is smooth; this keeps the run short), every frame for payload/decode.
  const refs = await Promise.all(files.map(async (f) => {
    const img = sharp(`${MASTERS}/${kind}/${f}.png`).resize(tier).removeAlpha();
    const { data, info } = await img.clone().raw().toBuffer({ resolveWithObject: true });
    return { f, raw: data, w: info.width, h: info.height, png: `${MASTERS}/${kind}/${f}.png` };
  }));
  const shipped = fs.existsSync(`public/entrance/${kind}/${tier}`);
  const enc = { avif: [], webp: {}, jpeg: {} };
  for (const r of refs) enc.avif.push(shipped ? fs.readFileSync(`public/entrance/${kind}/${tier}/${r.f}.avif`) : await sharp(r.png).resize(tier).avif({ quality: 52, effort: 6 }).toBuffer());
  const sample = refs.map((r, i) => i).filter((i) => i % 4 === 0);
  const meanFid = async (bufs) => { const f = await Promise.all(sample.map((i) => fidelity(refs[i].raw, bufs[i], refs[i].w, refs[i].h))); return { psnr: f.reduce((a, x) => a + x.psnr, 0) / f.length, ssim: f.reduce((a, x) => a + x.ssim, 0) / f.length }; };
  const avifFid = await meanFid(enc.avif);
  // Lowest quality that reaches the AVIF's SSIM (visually equivalent), searched upward.
  const match = async (fmt) => {
    for (const q of [60, 65, 70, 75, 80, 85, 88, 90, 92, 95]) {
      const bufs = await Promise.all(refs.map((r) => (fmt === "webp" ? sharp(r.png).resize(tier).webp({ quality: q, effort: 5 }) : sharp(r.png).resize(tier).jpeg({ quality: q, mozjpeg: true })).toBuffer()));
      const fid = await meanFid(bufs);
      if (fid.ssim >= avifFid.ssim) return { q, bufs, fid };
      if (q === 95) return { q, bufs, fid };
    }
  };
  const webp = await match("webp"), jpeg = await match("jpeg");
  results[`${kind}/${tier}`] = { frames: files.length, w: refs[0].w, h: refs[0].h,
    avif: { kb: Math.round(enc.avif.reduce((a, b) => a + b.length, 0) / 1024), ...avifFid, shipped },
    webp: { q: webp.q, kb: Math.round(webp.bufs.reduce((a, b) => a + b.length, 0) / 1024), ...webp.fid },
    jpeg: { q: jpeg.q, kb: Math.round(jpeg.bufs.reduce((a, b) => a + b.length, 0) / 1024), ...jpeg.fid } };
  results[`${kind}/${tier}`]._bufs = { avif: enc.avif, webp: webp.bufs, jpeg: jpeg.bufs };
  console.error(`encoded ${kind}/${tier}`);
}

// Decode cost in Chromium.
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
for (const cpu of [1, 4]) {
  const page = await browser.newPage(); const cdp = await page.context().newCDPSession(page);
  await page.goto("about:blank");
  for (const [key, r] of Object.entries(results)) {
    for (const fmt of ["avif", "webp", "jpeg"]) {
      const b64 = r._bufs[fmt].map((b) => b.toString("base64"));
      if (cpu > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpu });
      const t = await page.evaluate(async ({ b64, fmt }) => {
        const type = `image/${fmt}`;
        const blobs = b64.map((s) => new Blob([Uint8Array.from(atob(s), (c) => c.charCodeAt(0))], { type }));
        const seq = [];
        for (let pass = 0; pass < 2; pass++) for (const bl of blobs) { const t0 = performance.now(); const bm = await createImageBitmap(bl); if (pass) seq.push(performance.now() - t0); bm.close(); }
        const t0 = performance.now(); let next = 0;
        await Promise.all(Array.from({ length: 4 }, async () => { while (next < blobs.length) { const bm = await createImageBitmap(blobs[next++]); bm.close(); } }));
        const par = (performance.now() - t0) / blobs.length;
        seq.sort((a, b) => a - b);
        return { seqP50: seq[Math.floor(seq.length / 2)], seqP95: seq[Math.floor(seq.length * 0.95)], parMsPerFrame: par };
      }, { b64, fmt });
      if (cpu > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
      r[fmt][cpu === 1 ? "decode" : "decode4x"] = Object.fromEntries(Object.entries(t).map(([k, v]) => [k, +v.toFixed(2)]));
    }
    console.error(`decoded ${key} @${cpu}x`);
  }
  await page.close();
}
await browser.close();
for (const r of Object.values(results)) delete r._bufs;
const out = arg("out", "");
if (out) fs.writeFileSync(out, JSON.stringify(results, null, 2));
for (const [k, r] of Object.entries(results)) {
  console.log(`\n${k}  (${r.frames} frames, ${r.w}×${r.h})`);
  for (const fmt of ["avif", "webp", "jpeg"]) {
    const x = r[fmt];
    console.log(`  ${fmt.padEnd(5)} ${x.q ? `q${x.q}`.padEnd(4) : "    "} ${String(x.kb).padStart(5)} KB  PSNR ${x.psnr.toFixed(2)}  SSIM ${x.ssim.toFixed(4)}  decode seq p50/p95 ${x.decode.seqP50}/${x.decode.seqP95} ms, ${x.decode.parMsPerFrame} ms/frame ×4  |  @4x CPU ${x.decode4x.seqP50}/${x.decode4x.seqP95}, ${x.decode4x.parMsPerFrame} ms/frame ×4`);
  }
}
