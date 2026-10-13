// The Hebrew social card (app/he/opengraph-image.png, app/he/twitter-image.png): the English card's layout
// (app/opengraph-image.tsx) set right-to-left. Satori, which draws the English card, has no bidi or RTL shaping, so
// this one is laid out by Chromium from HTML and saved as a static image, in the site's own faces — the Geist and
// Heebo files the build downloaded (.next/static). Re-run after a copy change, after a build:
//   npx next build && node scripts/og-he.mjs
import { chromium } from "playwright";
import fs from "node:fs";

const brand = { bg: "#f3f4f6", fg: "#0c0d10", muted: "#434852", poker: "#0a1322", aegis: "#e6e9ed", dos: "#17132a", gf: "#04191d" };
// Same words as the page (data/he/site.ts siteMetaHe, lib/dict.ts status.*); names stay in Latin script.
const plates = [
  { name: "T Poker", state: ["זמין ב־iOS, ב־Android", "ובווב"], bg: brand.poker, ink: "#ffffff", sub: "#a9b6cb", flex: 1.15 },
  { name: "Aegis", state: ["קוד המקור ב־GitHub"], bg: brand.aegis, ink: brand.fg, sub: brand.muted, flex: 1 },
  { name: "DeveloperOS", state: ["שוחרר"], bg: brand.dos, ink: "#ffffff", sub: "#a2a9b6", flex: 1 },
  { name: "GRAVITY FLOW", state: ["גרסה מועמדת לשחרור"], bg: brand.gf, ink: "#ffffff", sub: "#aeb8cc", flex: 1 },
];
// The build's @font-face rules: Geist's basic-Latin file and Heebo's Hebrew file, inlined so the page needs no network.
const css = fs.readdirSync(".next/static/chunks").filter((f) => f.endsWith(".css")).map((f) => fs.readFileSync(`.next/static/chunks/${f}`, "utf8")).join("");
const face = (family, range) => {
  const m = [...css.matchAll(/@font-face\{font-family:([^;]+);[^}]*?src:url\(\.\.\/media\/([^)]+)\)[^}]*?unicode-range:([^;}]+)/g)].find((x) => x[1] === family && range.test(x[3]));
  if (!m) throw new Error(`no ${family} face in the build — run \`npx next build\` first`);
  return `@font-face{font-family:${family};font-weight:100 900;src:url(data:font/woff2;base64,${fs.readFileSync(`.next/static/media/${m[2]}`).toString("base64")}) format("woff2");unicode-range:${m[3]}}`;
};
const fonts = face("Geist", /^U\+\?\?/) + face("Heebo", /U\+590-5FF/);
const html = `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8">
<style>${fonts}
  * { box-sizing: border-box; margin: 0; }
  body { width: 1200px; height: 630px; overflow: hidden; background: ${brand.bg}; color: ${brand.fg};
    font-family: "Geist", "Heebo", sans-serif; display: flex; flex-direction: column; justify-content: space-between; padding: 64px 72px 0; }
  .top { display: flex; justify-content: space-between; font-size: 24px; color: ${brand.muted}; }
  .top b { font-weight: 400; color: ${brand.fg}; }
  h1 { font-weight: 400; font-size: 84px; line-height: 1; letter-spacing: -0.5px; }
  .plates { display: flex; gap: 12px; height: 190px; }
  .plate { display: flex; flex-direction: column; padding: 22px 24px; border-radius: 20px 20px 0 0; }
  .plate b { font-weight: 400; font-size: 26px; }
  .plate span { font-size: 19px; line-height: 1.3; margin-top: 6px; }
</style></head><body>
  <div class="top"><b lang="en">Tay Shofer</b><span>מהנדס תוכנה · <bdi>tayshofer.dev</bdi></span></div>
  <h1>אני בונה תוכנה מקצה לקצה.</h1>
  <div class="plates">${plates.map((p) => `<div class="plate" style="flex:${p.flex};background:${p.bg}"><b lang="en" style="color:${p.ink}">${p.name}</b><span style="color:${p.sub}">${p.state.join("<br>")}</span></div>`).join("")}</div>
</body></html>`;

const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || "/opt/pw-browsers/chromium" });
const page = await b.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
const used = await page.evaluate(() => [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family));
if (!used.includes("Geist") || !used.includes("Heebo")) throw new Error(`fonts not loaded: ${used}`);
const png = await page.screenshot({ type: "png" });
fs.mkdirSync("app/he", { recursive: true });
for (const f of ["app/he/opengraph-image.png", "app/he/twitter-image.png"]) fs.writeFileSync(f, png);
fs.writeFileSync("app/he/opengraph-image.alt.txt", "Tay Shofer — אני בונה תוכנה מקצה לקצה.");
fs.writeFileSync("app/he/twitter-image.alt.txt", "Tay Shofer — אני בונה תוכנה מקצה לקצה.");
console.log("app/he/opengraph-image.png", `${(png.length / 1024).toFixed(1)} KiB`);
await b.close();
