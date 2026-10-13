// The About photograph (M10): one crop of the Night Studio 2.0 render (scene_b.py), graded for a light page and
// written to public/work/ as AVIF with a WebP fallback. Crop and grade only: nothing is painted in.
//
//   node design/studio/about-photo.mjs <render.png>
//
// The render: scene_b.py at 2880×1800, 40 spp, with
//   B_CAM='{"loc":[0.18,-1.40,0.70],"target":[0.70,0.12,0.27],"lens":31,"shift":[-0.20,0.03]}' B_SA=2.6 B_SD=2.4 B_LAMP=34
// (screens' emission 2.6 / 2.4, desk lamp 34 W; the T Poker plaque from sign_b.json, unlit).
import sharp from "sharp";
import fs from "node:fs";

const src = process.argv[2];
if (!src) { console.error("usage: node design/studio/about-photo.mjs <render.png>"); process.exit(1); }
// The products and the plaque; the empty wall the hero composition kept for its copy is cut away.
const CROP = { left: 900, top: 330, width: 1960, height: 1470 };
const grade = () => sharp(src).extract(CROP)
  .linear([1.31, 1.29, 1.26], [5, 5, 6])      // lift the night a stop, a touch warm, blacks to ~#05
  .modulate({ saturation: 0.96 });
fs.mkdirSync("public/work", { recursive: true });
for (const w of [800, 1200, 1600]) {
  const avif = await grade().resize({ width: w }).avif({ quality: 62, effort: 6 }).toBuffer();
  const webp = await grade().resize({ width: w }).webp({ quality: 80, effort: 6 }).toBuffer();
  fs.writeFileSync(`public/work/about-studio-${w}.avif`, avif);
  fs.writeFileSync(`public/work/about-studio-${w}.webp`, webp);
  console.log(`about-studio-${w}`, `${w}×${Math.round((w * CROP.height) / CROP.width)}`, `avif ${(avif.length / 1024).toFixed(1)} KiB`, `webp ${(webp.length / 1024).toFixed(1)} KiB`);
}
