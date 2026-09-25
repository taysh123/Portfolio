// Real-browser screenshots for visual passes. Writes PNGs and a contact sheet per theme.
// usage: npm run shoot -- --out shots/x --theme dark --sizes 1440x900,390x844 --entrance 0,0.45,1 --sections work,about
import fs from "node:fs";
import { chromium } from "playwright";
import sharp from "sharp";

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const out = arg("out", "shots"), theme = arg("theme", "dark"), base = arg("base", "http://localhost:3400");
const sizes = arg("sizes", "1440x900,1366x768,768x1024,390x844,375x667,844x390").split(",");
const beats = arg("entrance", "").split(",").filter(Boolean).map(Number);
const sections = arg("sections", "").split(",").filter(Boolean);
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
const files = [], report = [];
for (const size of sizes) {
  const [w, h] = size.split("x").map(Number);
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addCookies([{ name: "theme", value: theme, url: base }]);
  const page = await ctx.newPage();
  page.on("pageerror", (e) => report.push(`${size} pageerror ${e}`));
  await page.goto(base + "/", { waitUntil: "networkidle" });
  const shots = [...beats.map((p) => ({ kind: "entrance", key: p })), ...sections.map((s) => ({ kind: "section", key: s }))];
  for (const s of shots) {
    await page.evaluate(({ kind, key }) => {
      if (kind === "entrance") { const c = document.getElementById("entrance"); window.scrollTo({ top: c.offsetTop + key * (c.offsetHeight - innerHeight), behavior: "instant" }); }
      else { const el = document.getElementById(key); window.scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: "instant" }); }
    }, s);
    await page.waitForTimeout(1100);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    if (overflow > 0) report.push(`${size} ${s.key} horizontal overflow ${overflow}px`);
    const file = `${out}/${theme}-${size}-${s.kind === "entrance" ? "p" + s.key : s.key}.png`;
    await page.screenshot({ path: file }); files.push(file);
  }
  await ctx.close();
}
await browser.close();
// Contact sheet: 4 across, 480 px thumbnails, labelled by filename order.
const thumbs = await Promise.all(files.map((f) => sharp(f).resize(480).png().toBuffer()));
const metas = await Promise.all(thumbs.map((t) => sharp(t).metadata()));
const rowH = Math.max(...metas.map((m) => m.height)), cols = 4, rows = Math.ceil(files.length / cols);
await sharp({ create: { width: cols * 486, height: rows * (rowH + 6), channels: 3, background: "#282828" } })
  .composite(thumbs.map((input, i) => ({ input, left: (i % cols) * 486, top: Math.floor(i / cols) * (rowH + 6) })))
  .png().toFile(`${out}/sheet-${theme}.png`);
console.log(files.join("\n")); if (report.length) { console.error(report.join("\n")); process.exitCode = 1; }
