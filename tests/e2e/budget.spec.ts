// tests/e2e/budget.spec.ts — hard budgets (spec §9), asserted in every e2e run.
import { test, expect } from "playwright/test";
import zlib from "node:zlib";

// Tightened in M5 from 286 KB; M9 held the M8 baseline (206.1 KB). M10: the budget is the fresh M9 measurement,
// 205.7 KB — the redesign may not add a byte to first load.
test("first-load JS for / ≤ 205.7 KB gzip (the M9 baseline) and HTML ≤ 568 KB", async ({ request, baseURL }) => {
  const html = await (await request.get("/")).text();
  const srcs = [...new Set([...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]))];
  let gz = 0;
  for (const s of srcs) gz += zlib.gzipSync(await (await request.get(new URL(s, baseURL).toString())).body()).length;
  expect(gz / 1024, `JS ${(gz / 1024).toFixed(1)} KB over ${srcs.length} scripts`).toBeLessThanOrEqual(205.7);
  expect(Buffer.byteLength(html) / 1024).toBeLessThanOrEqual(568);
});

test("the case-study panel is not part of first-load JS", async ({ page }) => {
  const js: string[] = [];
  page.on("response", async (r) => { if (r.url().endsWith(".js")) js.push(await r.text().catch(() => "")); });
  await page.goto("/", { waitUntil: "networkidle" });
  // A string that only CaseStudyPanel renders:
  expect(js.some((t) => t.includes("Close case study"))).toBe(false);
});

test("project data (case-study bodies) is not in first-load JS (review I2)", async ({ request, baseURL }) => {
  const html = await (await request.get("/")).text();
  const srcs = [...new Set([...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]))];
  for (const s of srcs) {
    const js = await (await request.get(new URL(s, baseURL).toString())).text();
    // A sentence that only a case-study body (data/projects.ts, Orders & Delivery honestNote) contains:
    expect(js.includes("listing it as such"), s).toBe(false);
  }
});

test("the animation library is not on the first-load path (M5): it arrives with the overlays that use it", async ({ request, baseURL, page }) => {
  const html = await (await request.get("/")).text();
  const srcs = [...new Set([...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]))];
  for (const s of srcs) expect((await (await request.get(new URL(s, baseURL).toString())).text()).includes("AnimatePresence"), s).toBe(false);
  // …and still works where it is used: the case study opens (its chunk brings framer-motion with it).
  await page.goto("/"); await page.locator("button[data-case-study='aegis']").click();
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("M10: no 3D runtime, palette or chat code is shipped at all — first load or lazily", async ({ page }) => {
  const js: [string, string][] = [];
  page.on("response", async (r) => { if (r.url().endsWith(".js")) js.push([r.url(), await r.text().catch(() => "")]); });
  await page.goto("/", { waitUntil: "networkidle" });
  // Open every lazy surface so its chunk is fetched too.
  await page.locator("button[data-case-study='aegis']").click(); await expect(page.getByRole("dialog")).toBeVisible(); await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Accessibility settings" }).click(); await expect(page.getByRole("dialog")).toBeVisible();
  for (const [u, t] of js) expect(/WebGLRenderer|ShaderMaterial|uBakeVP|Search commands|Ask Tay|lenis/i.test(t), u).toBe(false);
});
