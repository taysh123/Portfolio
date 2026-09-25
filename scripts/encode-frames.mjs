// PNG masters (design/render/blender/out) → public/entrance AVIF tiers + manifest.json.
import fs from "node:fs/promises";
import { execSync } from "node:child_process";
import sharp from "sharp";

const SRC = "design/render/blender/out";
const DST = "public/entrance";
const TIERS = { landscape: [1280, 1920], portrait: [720] };
// Texture provenance always comes from the frozen screen textures (make_screens.py), whatever --src is.
const screens = JSON.parse(await fs.readFile("design/render/blender/out/screens.json", "utf8"));
const snapshot = screens.snapshot ?? execSync("git rev-parse --short HEAD").toString().trim();

const manifest = { version: 1, snapshot, ...(screens.sources && { sources: screens.sources }), ...(screens.verify_counts && { verifyCounts: screens.verify_counts }) };
for (const kind of ["landscape", "portrait"]) {
  const dir = `${SRC}/${kind}`;
  const names = (await fs.readdir(dir)).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5));
  const meta = await Promise.all(names.map(async (n) => ({ n, ...JSON.parse(await fs.readFile(`${dir}/${n}.json`, "utf8")) })));
  const seq = meta.filter((m) => m.n !== "still").sort((a, b) => a.p - b.p);
  // pushEndIndex is written as the last frame: K2 / P2 must end the sequence.
  if (!seq.at(-1).n.startsWith("push-")) throw new Error(`${kind}: the last frame is ${seq.at(-1).n}, not the push end`);
  const { width, height } = await sharp(`${dir}/${seq[0].n}.png`).metadata();
  const tiers = TIERS[kind].filter((t) => t <= width);
  if (!tiers.length) tiers.push(width); // preview masters are smaller than every tier; never upscale
  // 8-bit AVIF: the prebuilt sharp binaries reject bitdepth 10.
  for (const t of tiers) {
    await fs.mkdir(`${DST}/${kind}/${t}`, { recursive: true });
    for (const m of seq) await sharp(`${dir}/${m.n}.png`).resize(t).avif({ quality: 52, effort: 6 }).toFile(`${DST}/${kind}/${t}/${m.n}.avif`);
  }
  for (const [name, src] of [["poster", seq[0].n], ["still", "still"]]) {
    await sharp(`${dir}/${src}.png`).resize(tiers[0]).avif({ quality: 55 }).toFile(`${DST}/${name}-${kind}.avif`);
    await sharp(`${dir}/${src}.png`).resize(tiers[0]).jpeg({ quality: 80, mozjpeg: true }).toFile(`${DST}/${name}-${kind}.jpg`);
  }
  manifest[kind] = {
    width, height, tiers, poster: `poster-${kind}`, still: `still-${kind}`,
    frames: seq.map((m) => ({ file: m.n, p: Math.max(m.p, 0.0001), quad: m.quad })),
    pushEndIndex: seq.length - 1,
  };
}
await fs.writeFile(`${DST}/manifest.json`, JSON.stringify(manifest));
console.log("encoded", manifest.landscape.frames.length, "landscape,", manifest.portrait.frames.length, "portrait");
