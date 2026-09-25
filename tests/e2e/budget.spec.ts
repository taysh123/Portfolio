// tests/e2e/budget.spec.ts — hard budgets (spec §9), asserted in every e2e run.
import { test, expect } from "playwright/test";
import zlib from "node:zlib";

test("first-load JS for / ≤ 286 KB gzip and HTML ≤ 568 KB", async ({ request, baseURL }) => {
  const html = await (await request.get("/")).text();
  const srcs = [...new Set([...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]))];
  let gz = 0;
  for (const s of srcs) gz += zlib.gzipSync(await (await request.get(new URL(s, baseURL).toString())).body()).length;
  expect(gz / 1024, `JS ${(gz / 1024).toFixed(1)} KB over ${srcs.length} scripts`).toBeLessThanOrEqual(286);
  expect(Buffer.byteLength(html) / 1024).toBeLessThanOrEqual(568);
});

// un-fixme in Task 12 (August's Projects.tsx still imports the panel statically)
test.fixme("the case-study panel is not part of first-load JS", async ({ page }) => {
  const js: string[] = [];
  page.on("response", async (r) => { if (r.url().endsWith(".js")) js.push(await r.text().catch(() => "")); });
  await page.goto("/", { waitUntil: "networkidle" });
  // A string that only CaseStudyPanel renders:
  expect(js.some((t) => t.includes("Close case study"))).toBe(false);
});
