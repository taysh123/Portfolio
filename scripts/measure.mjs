// Budget measurement against a running production server (spec §9). Exits 1 on a hard-budget failure.
// usage: npm run measure [-- http://localhost:3400]
import zlib from "node:zlib";
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:3400";
const BUDGET = { jsGzipKB: 286, htmlKB: 568, cls: 0.02, lcpMs: 1200 };
const html = await (await fetch(BASE + "/")).text();
const srcs = [...new Set([...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]))];
let gz = 0;
for (const s of srcs) gz += zlib.gzipSync(Buffer.from(await (await fetch(new URL(s, BASE))).arrayBuffer())).length;
const out = { scripts: srcs.length, jsGzipKB: +(gz / 1024).toFixed(1), htmlKB: +(Buffer.byteLength(html) / 1024).toFixed(1), runs: [] };

const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(() => {
    window.__cls = 0; window.__lcp = 0;
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
  });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  const lcpMs = await page.evaluate(() => window.__lcp);
  // Walk the whole page, not just the entrance: every section's reveals count toward CLS.
  for (let i = 0; i < 600; i++) {
    const atEnd = await page.evaluate(() => innerHeight + scrollY >= document.documentElement.scrollHeight - 2);
    if (atEnd) break;
    await page.mouse.wheel(0, h * 0.3); await page.waitForTimeout(40);
  }
  await page.waitForTimeout(600);
  out.runs.push({ viewport: `${w}x${h}`, lcpMs: Math.round(lcpMs), cls: +(await page.evaluate(() => window.__cls)).toFixed(4) });
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(out));
const fail = out.jsGzipKB > BUDGET.jsGzipKB || out.htmlKB > BUDGET.htmlKB || out.runs.some((r) => r.cls >= BUDGET.cls || r.lcpMs > BUDGET.lcpMs);
process.exit(fail ? 1 : 0);
