// scripts/lab-hero-a.mjs — Concept A prototype measurements (D1 reopened by Tay, 2026-11-18; D2 not reopened, so no
// WebGL; branch proto/hero-a-cinematic only). Lab numbers from a local production server, never field data.
//
// The live hero (/) and the prototype (/lab/hero-a) are measured the same way, so / is the baseline:
//   desktop  1440×900 @1x, no throttling, fine pointer
//   mobile   390×844 @3x, touch, CPU 4× slower and Lighthouse's "slow 4G" figures (150 ms RTT, 1.6 Mbps down,
//            750 kbps up), applied through DevTools (not Lighthouse's simulation)
// Each run is a fresh context (cold cache):
//   - LCP, FCP and CLS from PerformanceObservers, read 2.5 s after load (the reveal has finished);
//   - INP: the worst Event Timing duration over 6 interactions on empty space (desktop: 3 clicks and 3 Tab presses;
//     mobile: 6 taps). Under 50 interactions INP is the worst one. "<16" means none crossed the API's 16 ms floor;
//   - FPS: frames the browser delivered to an independent rAF counter over 3 s (with the pointer moving across the
//     field on desktop), plus the longest frame gap and main-thread busy time (CDP TaskDuration) in that window.
//
// usage: npm run build && npx next start --port 3401, then: node scripts/lab-hero-a.mjs [base] [runs] [routes, comma-separated]
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:3401";
const RUNS = Number(process.argv[3] ?? 5);
const ROUTES = (process.argv[4] ?? "/,/lab/hero-a").split(",");
const PROFILES = {
  desktop: { ctx: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }, cpu: 1, net: null },
  mobile: { ctx: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }, cpu: 4,
    net: { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 } },
};
const INIT = `(() => {
  const m = window.__m = { lcp: 0, lcpEl: "", fcp: 0, cls: 0, ev: {}, long: 0, longMs: 0 };
  const on = (type, fn, extra) => { try { new PerformanceObserver((l) => l.getEntries().forEach(fn)).observe({ type, buffered: true, ...extra }); } catch {} };
  on("largest-contentful-paint", (e) => { m.lcp = e.startTime; const el = e.element; m.lcpEl = el ? (el.className || el.tagName).toString().slice(0, 40) : ""; });
  on("paint", (e) => { if (e.name === "first-contentful-paint") m.fcp = e.startTime; });
  on("layout-shift", (e) => { if (!e.hadRecentInput) m.cls += e.value; });
  on("event", (e) => { if (e.interactionId) m.ev[e.interactionId] = Math.max(m.ev[e.interactionId] || 0, e.duration); }, { durationThreshold: 16 });
  on("longtask", (e) => { m.long++; m.longMs += e.duration; });
})();`;

const median = (xs) => { const s = [...xs].sort((a, b) => a - b); const k = s.length >> 1; return s.length % 2 ? s[k] : (s[k - 1] + s[k]) / 2; };
const metric = async (cdp, name) => (await cdp.send("Performance.getMetrics")).metrics.find((m) => m.name === name).value;

async function once(browser, route, p) {
  const ctx = await browser.newContext(p.ctx);
  await ctx.addInitScript(INIT);
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Performance.enable");
  if (p.cpu > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: p.cpu });
  if (p.net) { await cdp.send("Network.enable"); await cdp.send("Network.emulateNetworkConditions", p.net); }
  await page.goto(BASE + route, { waitUntil: "load", timeout: 120_000 });
  await page.waitForTimeout(2500);
  const load = await page.evaluate(() => ({ lcp: __m.lcp, lcpEl: __m.lcpEl, fcp: __m.fcp, cls: __m.cls, long: __m.long, longMs: __m.longMs }));

  // FPS window: an independent frame counter, with the pointer crossing the field on desktop.
  const { width: w, height: h } = p.ctx.viewport;
  const busy0 = await metric(cdp, "TaskDuration");
  const counting = page.evaluate(() => new Promise((res) => {
    let n = 0, last = 0, gap = 0; const t0 = performance.now();
    const f = (t) => { if (last) gap = Math.max(gap, t - last); last = t; n++; if (t - t0 < 3000) requestAnimationFrame(f); else res({ fps: (n * 1000) / (t - t0), gap }); };
    requestAnimationFrame(f);
  }));
  if (!p.ctx.hasTouch) for (let i = 0; i < 60; i++) { await page.mouse.move(w * 0.55 + (i % 30) * 14, h * 0.25 + (i % 20) * 12); await page.waitForTimeout(40); }
  const frames = await counting;
  const busyMs = ((await metric(cdp, "TaskDuration")) - busy0) * 1000;

  // INP: interactions on empty space (no link, no control).
  const spots = p.ctx.hasTouch ? [[w * 0.88, h * 0.17], [w * 0.9, h * 0.3], [w * 0.88, h * 0.17]] : [[w * 0.8, h * 0.2], [w * 0.85, h * 0.12], [w * 0.8, h * 0.2]];
  for (const [x, y] of spots) {
    if (p.ctx.hasTouch) { await page.touchscreen.tap(x, y); await page.waitForTimeout(250); await page.touchscreen.tap(x, y); }
    else { await page.mouse.click(x, y); await page.waitForTimeout(250); await page.keyboard.press("Tab"); }
    await page.waitForTimeout(250);
  }
  await page.waitForTimeout(400);
  const inter = await page.evaluate(() => Object.values(__m.ev));
  const nodes = await page.evaluate(() => document.querySelector("canvas")?.dataset.nodes ?? null);
  await ctx.close();
  return { ...load, fps: frames.fps, gap: frames.gap, busyPct: (busyMs / 3000) * 100, inp: inter.length ? Math.max(...inter) : null, interactions: inter.length, nodes };
}

const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
const out = [];
for (const [pname, p] of Object.entries(PROFILES)) for (const route of ROUTES) {
  const runs = [];
  for (let i = 0; i < RUNS; i++) runs.push(await once(browser, route, p));
  const inps = runs.map((r) => r.inp).filter((x) => x != null);
  const row = {
    profile: pname, route, runs: RUNS,
    lcpMs: Math.round(median(runs.map((r) => r.lcp))), lcpMaxMs: Math.round(Math.max(...runs.map((r) => r.lcp))), lcpEl: runs[0].lcpEl,
    fcpMs: Math.round(median(runs.map((r) => r.fcp))),
    cls: +Math.max(...runs.map((r) => r.cls)).toFixed(4),
    inpMs: inps.length ? Math.max(...inps) : "<16", inpCrossed16: `${inps.length}/${RUNS} runs`,
    fps: +median(runs.map((r) => r.fps)).toFixed(1), fpsMin: +Math.min(...runs.map((r) => r.fps)).toFixed(1),
    worstFrameGapMs: Math.round(Math.max(...runs.map((r) => r.gap))),
    mainThreadBusyPct: +median(runs.map((r) => r.busyPct)).toFixed(1),
    loadLongTasks: median(runs.map((r) => r.long)), loadLongTaskMs: Math.round(median(runs.map((r) => r.longMs))),
    nodesAtEnd: [...new Set(runs.map((r) => r.nodes))].join("/"),
  };
  out.push(row);
  console.log(JSON.stringify(row));
}
await browser.close();
