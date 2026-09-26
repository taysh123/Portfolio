// PNG masters (design/render/blender/out) → public/entrance AVIF tiers + manifest.json.
// usage: node scripts/encode-frames.mjs [--src DIR] [--dst DIR] [--only-framing landscape|portrait] [--check-budget]
//   --only-framing  encode that framing's finished frames only (a partial batch chunk) into
//                   DST/manifest.<kind>.json; manifest.json is not written. Frames whose AVIF is
//                   newer than the master are skipped, so per-chunk runs stay incremental.
//   --check-budget  exit 1 when a payload budget (spec §9) fails.
import fs from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import { execSync } from "node:child_process";
import sharp from "sharp";

const arg = (name, dflt) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : dflt; };
const SRC = arg("--src", "design/render/blender/out");
const DST = arg("--dst", "public/entrance");
const ONLY = arg("--only-framing", null);
if (ONLY && !["landscape", "portrait"].includes(ONLY)) throw new Error(`--only-framing ${ONLY}`);
// Portrait 600 animates on phones (narrower than 480 CSS px): measured smoother than 720 with no visible
// difference at device resolution (scripts/profile-entrance.mjs). Posters keep their own tier (POSTER_TIER).
const TIERS = { landscape: [1280, 1920], portrait: [600, 720] };
const POSTER_TIER = { landscape: 1280, portrait: 720 };
// Texture provenance always comes from the frozen, committed screen textures, whatever --src is.
const screens = JSON.parse(await fs.readFile("design/render/blender/frozen/screens.json", "utf8"));
const snapshot = screens.snapshot ?? execSync("git rev-parse --short HEAD").toString().trim();

const fresh = (src, dst) => existsSync(dst) && statSync(dst).mtimeMs > statSync(src).mtimeMs;

async function encodeFraming(kind, partial) {
  const dir = `${SRC}/${kind}`;
  const names = (await fs.readdir(dir)).filter((f) => f.endsWith(".json") && existsSync(`${dir}/${f.slice(0, -5)}.png`)).map((f) => f.slice(0, -5));
  const meta = await Promise.all(names.map(async (n) => ({ n, ...JSON.parse(await fs.readFile(`${dir}/${n}.json`, "utf8")) })));
  const seq = meta.filter((m) => m.n !== "still").sort((a, b) => a.p - b.p);
  if (!seq.length) throw new Error(`${kind}: no frames in ${dir}`);
  // pushEndIndex is written as the last frame: K2 / P2 must end the sequence.
  if (!partial && !seq.at(-1).n.startsWith("push-")) throw new Error(`${kind}: the last frame is ${seq.at(-1).n}, not the push end`);
  const { width, height } = await sharp(`${dir}/${seq[0].n}.png`).metadata();
  const tiers = TIERS[kind].filter((t) => t <= width);
  if (!tiers.length) tiers.push(width); // preview masters are smaller than every tier; never upscale
  // 8-bit AVIF: the prebuilt sharp binaries reject bitdepth 10.
  for (const t of tiers) {
    await fs.mkdir(`${DST}/${kind}/${t}`, { recursive: true });
    for (const m of seq) {
      const src = `${dir}/${m.n}.png`, out = `${DST}/${kind}/${t}/${m.n}.avif`;
      if (!fresh(src, out)) await sharp(src).resize(t).avif({ quality: 52, effort: 6 }).toFile(out);
    }
    // Prune frames no longer in the set: they would still ship and still count toward the budget (review M1).
    const keep = new Set(seq.map((m) => `${m.n}.avif`));
    for (const f of await fs.readdir(`${DST}/${kind}/${t}`)) if (f.endsWith(".avif") && !keep.has(f)) await fs.rm(`${DST}/${kind}/${t}/${f}`);
  }
  for (const [name, src] of [["poster", seq[0].n], ["still", "still"]]) {
    if (!existsSync(`${dir}/${src}.png`)) continue; // a partial chunk may not have the still yet
    const pt = tiers.includes(POSTER_TIER[kind]) ? POSTER_TIER[kind] : tiers[0];
    await sharp(`${dir}/${src}.png`).resize(pt).avif({ quality: 55 }).toFile(`${DST}/${name}-${kind}.avif`);
    await sharp(`${dir}/${src}.png`).resize(pt).jpeg({ quality: 80, mozjpeg: true }).toFile(`${DST}/${name}-${kind}.jpg`);
  }
  return {
    width, height, tiers, poster: `poster-${kind}`, still: `still-${kind}`,
    frames: seq.map((m) => ({ file: m.n, p: Math.max(m.p, 0.0001), quad: m.quad })),
    pushEndIndex: seq.length - 1,
  };
}

await fs.mkdir(DST, { recursive: true });
const encoded = {};
if (ONLY) {
  const set = await encodeFraming(ONLY, true); encoded[ONLY] = set;
  await fs.writeFile(`${DST}/manifest.${ONLY}.json`, JSON.stringify(set));
  console.log("encoded", set.frames.length, ONLY, "(partial manifest)");
} else {
  const manifest = { version: 1, snapshot, ...(screens.sources && { sources: screens.sources }), ...(screens.verify_counts && { verifyCounts: screens.verify_counts }) };
  for (const kind of ["landscape", "portrait"]) encoded[kind] = manifest[kind] = await encodeFraming(kind, false);
  await fs.writeFile(`${DST}/manifest.json`, JSON.stringify(manifest));
  for (const kind of ["landscape", "portrait"]) await fs.rm(`${DST}/manifest.${kind}.json`, { force: true });
  console.log("encoded", manifest.landscape.frames.length, "landscape,", manifest.portrait.frames.length, "portrait");
}

if (process.argv.includes("--check-budget")) {
  // Budgets per named tier (spec §9); only the framings this run encoded, only the tiers they actually have
  // (a preview set's tiers are its master width and are reported, not budgeted).
  const BUDGET = { landscape: { 1280: 2.5e6, 1920: 4e6 }, portrait: { 600: 1.2e6, 720: 1.2e6 } };
  const size = async (d) => (await Promise.all((await fs.readdir(d)).map(async (f) => (await fs.stat(`${d}/${f}`)).size))).reduce((a, b) => a + b, 0);
  const b = {}, over = [];
  for (const [kind, set] of Object.entries(encoded)) {
    for (const t of set.tiers) {
      const n = await size(`${DST}/${kind}/${t}`); b[`${kind}_${t}`] = n;
      if (BUDGET[kind][t] !== undefined && n > BUDGET[kind][t]) over.push(`${kind} ${t}: ${n} > ${BUDGET[kind][t]}`);
    }
    if (existsSync(`${DST}/poster-${kind}.avif`)) {
      const n = (await fs.stat(`${DST}/poster-${kind}.avif`)).size; b[`poster_${kind}`] = n;
      if (n > 90e3) over.push(`poster ${kind}: ${n} > 90000`);
      if (n < 60e3) console.warn(`poster ${kind} under 60 KB — check it is not visibly degraded (spec §9 targets 60–90 KB)`);
    }
  }
  console.log(JSON.stringify(b));
  if (over.length) { console.error("payload budget exceeded (spec §9) — apply the §4.7 levers in order:\n  " + over.join("\n  ")); process.exit(1); }
}
