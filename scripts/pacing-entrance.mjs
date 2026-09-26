// Desktop entrance pacing: how far one gesture carries the cinematic, with real wheel events through Lenis.
// usage: PW_CHROMIUM=/opt/pw-browsers/chromium node scripts/pacing-entrance.mjs [--base URL] [--variant '{"runway":{"desktop":400},"pacing":"linear"}']
//
// Gestures (modelled, not recorded from hardware): mouse-wheel notches of 100 px (Chrome/Edge on Windows) at a
// human cadence, and trackpad momentum as an exponentially decaying stream of per-frame deltas totalling ~500 /
// ~1,000 / ~2,500 px (a gentle, an ordinary and a fast two-finger swipe). Each starts at the start of a beat and
// is measured once Lenis has settled: progress travelled (Δp) and beat edges crossed. `?entrancePerf=1` reports
// the same numbers for a real wheel or trackpad.
import { chromium } from "playwright";

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg("base", "http://localhost:3400");
const VARIANT = JSON.parse(arg("variant", "null"));
const EDGES = [0.12, 0.38, 0.53, 0.68, 0.88];
const STARTS = { lid: 0.12, wake: 0.38, push: 0.68 };

const momentum = (total, tau) => { const d0 = (total * 16) / tau, out = []; for (let k = 0; ; k++) { const d = d0 * Math.exp((-k * 16) / tau); if (d < 1) break; out.push([Math.round(d), 16]); } return out; };
const GESTURES = {
  "mouse 3 notches": [[100, 70], [100, 70], [100, 70]],
  "mouse 6 notches": Array.from({ length: 6 }, () => [100, 60]),
  "trackpad gentle ~500": momentum(500, 200),
  "trackpad normal ~1000": momentum(1000, 220),
  "trackpad fast ~2500": momentum(2500, 280),
};

const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.addInitScript(() => { window.__lastP = 0; window.__ENTRANCE_PROF__ = { render: (r) => { window.__lastP = r.p; } }; });
if (VARIANT) await page.addInitScript((v) => { window.__ENTRANCE_EXP__ = v; }, VARIANT);
await page.goto(BASE + "/", { waitUntil: "load" }); await page.waitForTimeout(1500);
await page.mouse.move(720, 450);
const runway = await page.evaluate(() => { const c = document.getElementById("entrance"); return c.offsetHeight - innerHeight; });
console.log(`runway ${runway} px${VARIANT ? ` variant ${JSON.stringify(VARIANT)}` : ""}`);

// Jump to the scroll position whose progress is p (bisection on the stage's own reported progress).
const goTo = async (p) => {
  let lo = 0, hi = 1;
  for (let k = 0; k < 24; k++) {
    const mid = (lo + hi) / 2;
    await page.evaluate((f) => { const c = document.getElementById("entrance"); scrollTo({ top: c.offsetTop + f * (c.offsetHeight - innerHeight), behavior: "instant" }); }, mid);
    await page.waitForTimeout(40);
    const got = await page.evaluate(() => window.__lastP);
    if (got < p) lo = mid; else hi = mid;
  }
  await page.waitForTimeout(400);
};

const rows = [];
for (const [startName, p0] of Object.entries(STARTS)) {
  for (const [name, events] of Object.entries(GESTURES)) {
    await goTo(p0);
    const a = await page.evaluate(() => window.__lastP), y0 = await page.evaluate(() => scrollY);
    for (const [d, wait] of events) { await page.mouse.wheel(0, d); await page.waitForTimeout(wait); }
    await page.waitForTimeout(1500);                       // Lenis settles
    const b = await page.evaluate(() => window.__lastP), y1 = await page.evaluate(() => scrollY);
    const edges = EDGES.filter((e) => e > a + 0.003 && e <= b).length;   // not the edge it started on
    rows.push({ start: startName, gesture: name, px: y1 - y0, dp: +(b - a).toFixed(3), edges });
    console.log(`${startName.padEnd(5)} ${name.padEnd(22)} scroll ${String(Math.round(y1 - y0)).padStart(5)} px  Δp ${(b - a).toFixed(3)}  beat edges crossed ${edges}`);
  }
}
await browser.close();
