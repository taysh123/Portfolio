// Writes the M10 page's images to public/work/ — AVIF (8-bit) with a WebP fallback at each listed width — from the
// project's own captures (public/projects/**) and T Poker's brand artwork (design/studio/brand, prepared by
// design/studio/prep_brand.py). Crops only: nothing is redrawn, recoloured or composited.
//
//   M10_CAPTURES=<folder> node scripts/m10-images.mjs     prints each file and its size
//
// Aegis's full captures are not public: they show a seeded placeholder agent ID, mock-AI text and demo incidents whose
// technique tags do not match their titles, so only crops of them are. M10_CAPTURES names the folder that holds them
// (aegis/08-incident-kanban.png, the owner's 3840×2160 capture; aegis/05-live-alerts.webp); without it the Aegis jobs
// are skipped and their committed outputs stand.
//
// Crop boxes are in the source's own pixels, and every edge sits where no line of text crosses it (measured with
// scripts/textext.py): a crop may cut a box, never a sentence. The Aegis rows (card borders at y 500–631,
// 644–775, 788–919, x from 528) were measured on the 3840×2160 live-alerts capture; components/work/AegisChapter.tsx
// places its highlight from the same numbers (AEGIS_CROPS below is the single source, exported for the unit test).
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const OUT = "public/work";
const P = "public/projects";
const CAP = process.env.M10_CAPTURES;
const capture = (rel) => (CAP ? path.join(CAP, rel) : null);
const BRAND = "design/studio/brand";

// The port-scan row alone: from just under the row above (its text ends at y 596) to just over the row below (its
// badge box starts at y 819), so only those cards' borders show. The row's own text ends at x 1520.
export const AEGIS_CROPS = {
  desktop: { left: 492, top: 612, width: 1148, height: 200 },
  phone: { left: 500, top: 612, width: 1060, height: 200 },
};

// The Incidents board (3840×2160): columns OPEN x 528–1593, INVESTIGATING 1626–2693, RESOLVED 2726–3791, from y 300;
// the first cards end at y 617 and OPEN's second card starts at 634. The demo seed builds each incident from the newest
// or oldest N alerts, whatever their type, so only one card's title is borne out by its own alerts: OPEN's first,
// "Privilege escalation on workstation" (one alert: privilege escalation on WKSTN-042, T1548). Two others carry
// technique tags that contradict their titles, and INVESTIGATING's "lateral movement" has no alert of movement between
// hosts. The one crop — the page head and that card — serves the hero, the case study and the About photo's monitor.
export const AEGIS_BOARD = { left: 492, top: 0, width: 1108, height: 623 };

const jobs = [
  // The hero's plates.
  { name: "hero-poker-live", src: `${P}/poker/tournament-live.webp`, widths: [240, 400, 560] },
  { name: "hero-poker-home", src: `${P}/poker/home.webp`, widths: [240, 400, 560] },
  // Aegis: the Incidents page head and OPEN's first incident (AEGIS_BOARD).
  { name: "hero-aegis", src: capture("aegis/08-incident-kanban.png"), crop: AEGIS_BOARD, widths: [360, 600, 900] },
  // DeveloperOS: the app with Search & Ask open, from its left margin to the gap between the Career and Meeting tabs
  // (x 1631–1702); the longest result line ends at x 1656.
  { name: "hero-dos", src: `${P}/developeros/ai-features.webp`, crop: { left: 340, top: 30, width: 1328, height: 1590 }, widths: [360, 600, 900] },
  { name: "hero-gf", src: `${P}/gravity-flow/gameplay.webp`, widths: [240, 400, 640] },
  // T Poker's chapter: the three real screens.
  { name: "poker-home", src: `${P}/poker/home.webp`, widths: [320, 480, 640] },
  { name: "poker-live", src: `${P}/poker/tournament-live.webp`, widths: [320, 480, 640] },
  { name: "poker-settle", src: `${P}/poker/final-count.webp`, widths: [320, 480, 640] },
  // Aegis: the port-scan row of the live alert feed, the Detect step's own output.
  { name: "aegis-alerts", src: capture("aegis/05-live-alerts.webp"), crop: AEGIS_CROPS.desktop, widths: [600, 900, 1148] },
  { name: "aegis-alerts-phone", src: capture("aegis/05-live-alerts.webp"), crop: AEGIS_CROPS.phone, widths: [420, 700, 1060] },
  // DeveloperOS: search results with their file and line citations; on phones the top-left 820×612, which ends after
  // the third result (the longest line in it ends at x 780; the next result's snippet starts at y 665).
  { name: "dos-search", src: `${P}/developeros/search-citations.webp`, widths: [800, 1200, 1600] },
  { name: "dos-search-phone", src: `${P}/developeros/search-citations.webp`, crop: { left: 0, top: 0, width: 820, height: 612 }, widths: [400, 620, 820] },
  // GRAVITY FLOW: gameplay leads; a boss level behind it.
  { name: "gf-gameplay", src: `${P}/gravity-flow/gameplay.webp`, widths: [320, 480, 640] },
  { name: "gf-boss", src: `${P}/gravity-flow/boss.webp`, widths: [320, 480] },
  // T Poker's lockup, from the owner's artwork.
  { name: "tpoker-icon", src: `${BRAND}/tpoker-icon.png`, widths: [104, 156], alpha: true },
  { name: "tpoker-wordmark", src: `${BRAND}/tpoker-wordmark.png`, widths: [222, 333], alpha: true },
];

if (!fs.existsSync(`${BRAND}/tpoker-icon.png`) || !fs.existsSync(`${BRAND}/tpoker-wordmark.png`))
  execFileSync("python3", ["design/studio/prep_brand.py"], { stdio: "inherit" });

fs.mkdirSync(OUT, { recursive: true });
let total = 0;
for (const j of jobs) {
  if (!j.src || !fs.existsSync(j.src)) { console.log(`${j.name}`.padEnd(26), "skipped: set M10_CAPTURES to the folder of Aegis's full captures"); continue; }
  const meta = await sharp(j.src).metadata();
  for (const w of j.widths) {
    const base = () => { let s = sharp(j.src); if (j.crop) s = s.extract(j.crop); return s.resize({ width: w, withoutEnlargement: true }); };
    const avif = await base().avif({ quality: j.alpha ? 70 : 60, effort: 6 }).toBuffer();
    const webp = await base().webp({ quality: j.alpha ? 90 : 80, effort: 6 }).toBuffer();
    const m = await sharp(avif).metadata();
    for (const [ext, buf] of [["avif", avif], ["webp", webp]]) {
      fs.writeFileSync(path.join(OUT, `${j.name}-${w}.${ext}`), buf);
      total += buf.length;
    }
    console.log(`${j.name}-${w}`.padEnd(26), `${m.width}×${m.height}`.padEnd(10), `avif ${(avif.length / 1024).toFixed(1)} KiB`.padEnd(16), `webp ${(webp.length / 1024).toFixed(1)} KiB`, j.crop ? "" : `(src ${meta.width}×${meta.height})`);
  }
}
// The Aegis case study's capture, at the crop's own size: its panel serves it through next/image (AVIF, then WebP).
const board = capture("aegis/08-incident-kanban.png");
if (board && fs.existsSync(board)) {
  const buf = await sharp(board).extract(AEGIS_BOARD).webp({ quality: 90, effort: 6 }).toBuffer();
  fs.writeFileSync(`${P}/aegis/incident-board-open.webp`, buf); total += buf.length;
  console.log("aegis/incident-board-open".padEnd(26), `${AEGIS_BOARD.width}×${AEGIS_BOARD.height}`.padEnd(10), `webp ${(buf.length / 1024).toFixed(1)} KiB`);
}
console.log(`total ${(total / 1024).toFixed(0)} KiB`);
