// Entrance playback profiler: real input (wheel through Lenis on desktop, CDP touch-scroll gestures on mobile)
// against a production build, with the stage's opt-in hooks (lib/entrance/profile.ts) plus page-level probes.
// usage: PW_CHROMIUM=/opt/pw-browsers/chromium node scripts/profile-entrance.mjs [--base URL] [--runs N]
//        [--only name,name] [--out file.json]
// Headless Chromium rasterises the canvas in software, so absolute costs run high next to a GPU-backed device;
// the numbers are for like-for-like comparison between builds.
import fs from "node:fs";
import { chromium } from "playwright";

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg("base", "http://localhost:3400");
const RUNS = Number(arg("runs", 3));
const ONLY = arg("only", "")?.split(",").filter(Boolean);
const OUT = arg("out", "");
// --variant '{"backing":2}' etc.: passed to the stage as window.__ENTRANCE_EXP__ (lib/entrance/profile.ts).
const VARIANT = JSON.parse(arg("variant", "null"));

const DESKTOP_NET = { latency: 20, downloadThroughput: (30e6 / 8), uploadThroughput: (10e6 / 8) };
const MOBILE_NET = { latency: 60, downloadThroughput: (12e6 / 8), uploadThroughput: (4e6 / 8) };
const SCENARIOS = [
  { name: "desktop-1440-dpr1", w: 1440, h: 900, dpr: 1, net: DESKTOP_NET, cpu: 1 },
  { name: "desktop-1440-dpr2", w: 1440, h: 900, dpr: 2, net: DESKTOP_NET, cpu: 1 },
  { name: "desktop-1280x720", w: 1280, h: 720, dpr: 1, net: DESKTOP_NET, cpu: 1 },
  { name: "mobile-390x844", w: 390, h: 844, dpr: 3, mobile: true, net: MOBILE_NET, cpu: 4 },
  { name: "mobile-844x390", w: 844, h: 390, dpr: 3, mobile: true, net: MOBILE_NET, cpu: 4 },
];
const PATTERNS = ["slow", "fast", "reversal", "cold-fast"];

const INIT = () => {
  const P = (window.__prof = { fetch: {}, decodes: [], renders: [], playheads: [], evicts: 0, frames: [], long: [], scrolls: [], rec: false });
  window.__ENTRANCE_PROF__ = {
    fetchStart: (i, t) => { (P.fetch[i] ||= {}).start = t; },
    fetchEnd: (i, t, bytes) => { Object.assign((P.fetch[i] ||= {}), { end: t, bytes }); },
    decode: (i, ms, w, h) => { P.decodes.push({ i, ms, w, h, t: performance.now() }); },
    evict: () => { P.evicts++; },
    playhead: (i, decoded, near, bytes) => { if (P.rec) P.playheads.push({ i, decoded, near, bytes }); },
    render: (r) => { if (P.rec) P.renders.push({ ...r, y: scrollY }); },
  };
  const loop = (t) => { if (P.rec) P.frames.push(t); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
  new PerformanceObserver((l) => { for (const e of l.getEntries()) if (P.rec) P.long.push(e.duration); }).observe({ type: "longtask", buffered: false });
  addEventListener("scroll", () => { if (P.rec) P.scrolls.push({ t: performance.now(), y: scrollY }); }, { passive: true, capture: true });
};

const pct = (a, q) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return +s[Math.min(s.length - 1, Math.floor(q * s.length))].toFixed(2); };

async function drive(page, cdp, sc, pattern, L) {
  if (sc.mobile) {
    // Real touch scrolling (Lenis leaves touch native): swipes of raw CDP touch events, one move per frame.
    const span = Math.round(sc.h * 0.6);
    const swipe = async (dy, pxPerFrame) => {
      const x = Math.round(sc.w / 2); let y = dy > 0 ? Math.round(sc.h * 0.8) : Math.round(sc.h * 0.2);
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
      for (let k = 0, n = Math.max(1, Math.round(Math.abs(dy) / pxPerFrame)); k < n; k++) { y -= dy / n; await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: Math.round(y) }] }); await page.waitForTimeout(16); }
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    };
    const travel = async (dist, pxPerFrame) => { let left = Math.abs(dist); while (left > 1) { const d = Math.min(span, left); await swipe(Math.sign(dist) * d, pxPerFrame); left -= d; } };
    if (pattern === "slow") await travel(L, 8);
    else if (pattern === "fast" || pattern === "cold-fast") await travel(L, 60);
    else { await travel(L * 0.6, 25); await travel(-L * 0.35, 25); await travel(L * 0.8, 25); }
  } else {
    await page.mouse.move(sc.w / 2, sc.h / 2);
    // Headless Chromium applies synthetic wheel deltas in device pixels; a real trackpad's are CSS pixels.
    const wheel = async (total, step) => { const n = Math.ceil(Math.abs(total) / step); for (let k = 0; k < n; k++) { await page.mouse.wheel(0, Math.sign(total) * step * sc.dpr); await page.waitForTimeout(16); } };
    if (pattern === "slow") await wheel(L, 12);
    else if (pattern === "fast" || pattern === "cold-fast") await wheel(L, 120);
    else { await wheel(L * 0.6, 40); await wheel(-L * 0.35, 40); await wheel(L * 0.8, 40); }
  }
  await page.waitForTimeout(900);
}

async function run(browser, sc, pattern) {
  const ctx = await browser.newContext({ viewport: { width: sc.w, height: sc.h }, deviceScaleFactor: sc.dpr, isMobile: !!sc.mobile, hasTouch: !!sc.mobile });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", { offline: false, ...sc.net });
  await page.addInitScript(INIT);
  if (VARIANT) await page.addInitScript((v) => { window.__ENTRANCE_EXP__ = v; }, VARIANT);
  const errors = []; page.on("pageerror", (e) => errors.push(String(e)));
  if (pattern === "cold-fast") {
    await page.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(300);
  } else {
    await page.goto(BASE + "/", { waitUntil: "load", timeout: 60000 });
    await page.waitForTimeout(2500);         // frames arrive; the viewer reads the first beat
  }
  if (sc.cpu > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: sc.cpu });
  const L = await page.evaluate(() => { const c = document.getElementById("entrance"); return c.offsetHeight - innerHeight; });
  const top = await page.evaluate(() => document.getElementById("entrance").offsetTop);
  const t0 = await page.evaluate(() => { window.__prof.rec = true; return performance.now(); });
  await drive(page, cdp, sc, pattern, L);
  const P = await page.evaluate(() => { window.__prof.rec = false; return window.__prof; });
  const endY = await page.evaluate(() => { const c = document.getElementById("entrance"); return (scrollY - c.offsetTop) / (c.offsetHeight - innerHeight); });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  await ctx.close();

  // Frame cadence while the entrance is on screen and moving (from the first scroll to the last render).
  const tEnd = P.renders.length ? P.renders.at(-1).start + 50 : t0;
  const tStart = P.scrolls[0]?.t ?? t0;
  const fr = P.frames.filter((t) => t >= tStart && t <= tEnd);
  const deltas = fr.slice(1).map((t, i) => t - fr[i]);
  const missed = deltas.reduce((a, d) => a + Math.max(0, Math.round(d / 16.667) - 1), 0);
  const R = P.renders;
  // How far the drawn position trails the page: the render's p against the scroll position when it ran.
  const lag = R.map((r) => Math.abs(Math.min(1, Math.max(0, (r.y - top) / L)) - r.p) * L);
  const misses = R.filter((r) => r.path === "near" || r.path === "fallback" || r.path === "hold");
  const lateFetch = R.filter((r) => r.want >= 0 && !(P.fetch[r.want]?.end <= r.start)).length;
  const wantSeen = new Set(R.map((r) => r.want)), reachedUnfetched = [...wantSeen].filter((w) => { const f = P.fetch[w]; const first = R.find((r) => r.want === w); return !(f?.end <= first.start); }).length;
  return {
    renders: R.length, frames: fr.length, missedFrames: missed, dropRate: fr.length ? +(missed / (fr.length + missed)).toFixed(3) : null,
    raf: { p50: pct(deltas, 0.5), p95: pct(deltas, 0.95), p99: pct(deltas, 0.99) },
    renderMs: { p50: pct(R.map((r) => r.ms), 0.5), p95: pct(R.map((r) => r.ms), 0.95), p99: pct(R.map((r) => r.ms), 0.99) },
    drawMs: { p50: pct(R.map((r) => r.drawMs), 0.5), p95: pct(R.map((r) => r.drawMs), 0.95) },
    queueToRenderMs: { p50: pct(R.map((r) => r.start - r.queuedAt), 0.5), p95: pct(R.map((r) => r.start - r.queuedAt), 0.95) },
    lagPx: { p50: pct(lag, 0.5), p95: pct(lag, 0.95) },
    longTasks: { n: P.long.length, over50: P.long.filter((d) => d > 50).length, max: P.long.length ? +Math.max(...P.long).toFixed(1) : 0 },
    decode: { n: P.decodes.length, p50: pct(P.decodes.map((d) => d.ms), 0.5), p95: pct(P.decodes.map((d) => d.ms), 0.95) },
    paths: R.reduce((a, r) => ((a[r.path] = (a[r.path] || 0) + 1), a), {}),
    misses: misses.length, missRate: R.length ? +(misses.length / R.length).toFixed(3) : null,
    missDist: { p50: pct(misses.filter((r) => r.drawn !== null).map((r) => Math.abs(r.drawn - r.want)), 0.5), max: misses.filter((r) => r.drawn !== null).reduce((a, r) => Math.max(a, Math.abs(r.drawn - r.want)), 0) },
    rendersWantingUnfetched: lateFetch, framesReachedBeforeFetched: reachedUnfetched,
    decodedNearPlayhead: { p50: pct(P.playheads.map((x) => x.near), 0.5), min: P.playheads.length ? Math.min(...P.playheads.map((x) => x.near)) : null },
    bitmapMB: { max: P.playheads.length ? +(Math.max(...P.playheads.map((x) => x.bytes)) / 1e6).toFixed(1) : 0 },
    fetched: Object.values(P.fetch).filter((f) => f.end).length, fetchKB: Math.round(Object.values(P.fetch).reduce((a, f) => a + (f.bytes || 0), 0) / 1024),
    endP: +endY.toFixed(3), overflow, errors,
  };
}

const med = (xs) => { const v = xs.filter((x) => typeof x === "number").sort((a, b) => a - b); return v.length ? v[Math.floor(v.length / 2)] : null; };
const merge = (rs) => { // median of every numeric leaf across runs
  const o = {}; for (const k of Object.keys(rs[0])) {
    const v = rs.map((r) => r[k]);
    if (typeof v[0] === "number" || v[0] === null) o[k] = med(v);
    else if (Array.isArray(v[0])) o[k] = v.flat();
    else if (typeof v[0] === "object") { o[k] = {}; const keys = new Set(v.flatMap((x) => Object.keys(x || {}))); for (const kk of keys) o[k][kk] = med(v.map((x) => x?.[kk])); }
    else o[k] = v[0];
  } return o;
};

const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
const results = {};
for (const sc of SCENARIOS.filter((s) => !ONLY.length || ONLY.includes(s.name))) {
  for (const pattern of PATTERNS) {
    // One retry per run: a transient navigation timeout must not abort a 20-minute comparison.
    const rs = []; for (let k = 0; k < RUNS; k++) rs.push(await run(browser, sc, pattern).catch(() => run(browser, sc, pattern)));
    results[`${sc.name}/${pattern}`] = merge(rs);
    const m = results[`${sc.name}/${pattern}`];
    console.log(`${sc.name.padEnd(18)} ${pattern.padEnd(9)} drop ${String(m.dropRate).padEnd(5)} missedFr ${String(m.missedFrames).padEnd(4)} render p95 ${String(m.renderMs.p95).padEnd(6)} draw p95 ${String(m.drawMs.p95).padEnd(6)} lag p50/95 ${m.lagPx.p50}/${m.lagPx.p95}px misses ${String(m.misses).padEnd(4)} (${m.missRate}) dist≤${m.missDist.max} unfetched ${m.framesReachedBeforeFetched} decode p95 ${m.decode.p95} long>50 ${m.longTasks.over50} max ${m.longTasks.max} bmp ${m.bitmapMB.max}MB endP ${m.endP}`);
  }
}
await browser.close();
if (OUT) fs.writeFileSync(OUT, JSON.stringify(results, null, 2));
