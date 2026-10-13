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
  // An id only CaseStudyPanel's code contains. (Its interface strings, "Close case study" among them, now ship with the
  // shared client strings in lib/dict-client.ts, so they no longer mark the panel's code.)
  expect(js.some((t) => t.includes("case-study-title"))).toBe(false);
  // …and the marker is real: it arrives with the panel's chunk on the first open.
  await page.locator("button[data-case-study='aegis']").click(); await page.getByRole("dialog").waitFor();
  await expect.poll(() => js.some((t) => t.includes("case-study-title"))).toBe(true);
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

test("no 3D runtime or palette is shipped at all — first load or lazily — and the chat panel only on first use", async ({ page, request, baseURL }) => {
  // The launcher is first-load (it must be visible at once); the panel, its strings and framer-motion are not.
  const html = await (await request.get("/")).text();
  for (const s of [...new Set([...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]))])
    expect((await (await request.get(new URL(s, baseURL!).toString())).text()).includes("chat-transcript"), s).toBe(false);
  const js: [string, string][] = [];
  page.on("response", async (r) => { if (r.url().endsWith(".js")) js.push([r.url(), await r.text().catch(() => "")]); });
  await page.goto("/", { waitUntil: "networkidle" });
  // Open every lazy surface so its chunk is fetched too.
  await page.locator("button[data-case-study='aegis']").click(); await expect(page.getByRole("dialog")).toBeVisible(); await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Accessibility settings" }).click(); await expect(page.getByRole("dialog")).toBeVisible();
  await page.locator("[data-chat-launcher]").click(); await expect(page.getByRole("dialog", { name: "Ask Tay AI" })).toBeVisible();
  // (The assistant's own name, "Ask Tay AI", is back with the restored original chat, so it is no longer a marker here.)
  for (const [u, t] of js) expect(/WebGLRenderer|ShaderMaterial|uBakeVP|Search commands|lenis|GROQ_API_KEY|api\.groq\.com/i.test(t), u).toBe(false);
});
