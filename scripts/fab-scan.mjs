// Scan for floating-control collisions: step through the page at rest and report every interactive element or
// text block a visible floating button overlaps. usage: node scripts/fab-scan.mjs [WxH ...]
import { chromium } from "playwright";
const sizes = (process.argv.slice(2).length ? process.argv.slice(2) : ["375x667", "390x844", "844x390", "1280x720", "1440x900"]).map((s) => s.split("x").map(Number));
const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || "/opt/pw-browsers/chromium" });
let total = 0;
for (const [w, h] of sizes) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto("http://localhost:3400/"); await p.locator("[data-skip-intro]").click(); await p.waitForTimeout(500);
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  const hits = new Map();
  for (let y = await p.evaluate(() => scrollY); y < H; y += Math.round(h * 0.5)) {
    await p.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), y); await p.waitForTimeout(1100);  // controls retract while scrolling and re-appear 700ms after it stops
    const r = await p.evaluate(() => {
      const fabs = [...document.querySelectorAll("[data-floating-control] > button, [data-floating-control] button[aria-label]")]
        .filter((e) => { const cs = getComputedStyle(e.closest("[data-floating-control]")); return cs.visibility !== "hidden" && +cs.opacity > 0.5; })
        .map((e) => e.getBoundingClientRect()).filter((r) => r.width > 0 && r.bottom > 0 && r.top < innerHeight);
      const els = [...document.querySelectorAll("main a[href], main button, footer a[href], main p, main h1, main h2, main h3, main dd, main dt, main li")]
        .filter((e) => !e.closest("[data-floating-control]") && e.offsetParent && getComputedStyle(e).visibility !== "hidden" && +getComputedStyle(e).opacity > 0.3 && !e.closest("[aria-hidden='true']"));
      const out = [];
      for (const e of els) { const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue;
        for (const f of fabs) { const ix = Math.min(r.right, f.right) - Math.max(r.left, f.left), iy = Math.min(r.bottom, f.bottom) - Math.max(r.top, f.top);
          if (ix > 2 && iy > 2) out.push(`${/^(A|BUTTON)$/.test(e.tagName) ? "TAP " : "text "}${e.tagName.toLowerCase()}:${(e.getAttribute("aria-label") || e.textContent || "").trim().replace(/\s+/g, " ").slice(0, 28)}`); } }
      return out;
    });
    for (const x of r) hits.set(x, (hits.get(x) || 0) + 1);
  }
  total += hits.size;
  console.log(`${w}x${h}: ${hits.size} distinct collisions`, hits.size ? JSON.stringify([...hits.keys()].slice(0, 14)) : "");
  await p.close();
}
await b.close(); process.exit(total ? 1 : 0);
