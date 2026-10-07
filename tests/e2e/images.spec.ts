// tests/e2e/images.spec.ts — project imagery must actually load, not merely exist as <img> elements.
// T Poker's phones rendered as black shells with their alt text on the Vercel Preview (failed loads).
import { test, expect, type Page } from "playwright/test";

const decoded = (page: Page, scope: string) => page.locator(`${scope} img`).evaluateAll((imgs) =>
  imgs.map((i) => ({ src: (i as HTMLImageElement).currentSrc, ok: (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0 })));

async function everyImageLoads(page: Page, scope: string) {
  const el = page.locator(scope).first();
  await el.scrollIntoViewIfNeeded();
  await expect.poll(async () => { const r = await decoded(page, scope); return r.length > 0 && r.every((x) => x.ok); }, { timeout: 15000, message: scope })
    .toBe(true);
}

for (const [label, viewport, dpr, mobile] of [["retina desktop", { width: 1440, height: 900 }, 2, false], ["phone", { width: 390, height: 844 }, 3, true]] as const) {
  test(`every flagship world image finishes loading — ${label}`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: dpr, isMobile: mobile, hasTouch: mobile });
    const page = await ctx.newPage();
    const failed: string[] = []; page.on("requestfailed", (r) => { if (/\/projects\//.test(r.url())) failed.push(r.url()); });
    const bad: string[] = []; page.on("response", (r) => { if (/\/projects\/|_next\/image/.test(r.url()) && r.status() >= 400) bad.push(`${r.status()} ${r.url()}`); });
    await page.goto("/");
    for (const id of ["poker", "aegis", "developeros", "gravity-flow"]) await everyImageLoads(page, `#work-${id} .flagship__world`);
    expect(failed).toEqual([]); expect(bad).toEqual([]);
    await ctx.close();
  });
}

test("T Poker's phones are served as the pre-encoded files, not through the image optimiser", async ({ page }) => {
  const urls: string[] = []; page.on("request", (r) => { if (/poker/.test(r.url()) && /\.webp|_next\/image/.test(r.url())) urls.push(r.url()); });
  await page.goto("/");
  await everyImageLoads(page, "#work-poker .flagship__world");
  expect(urls.length).toBeGreaterThan(0);
  expect(urls.filter((u) => u.includes("_next/image"))).toEqual([]);
  expect(urls.every((u) => /\/projects\/poker\/[\w-]+-640\.webp$/.test(u))).toBe(true);
});

test("case-study hero and gallery images finish loading for every project", async ({ page }) => {
  await page.goto("/");
  for (const id of ["poker", "aegis", "developeros", "gravity-flow", "job-assistant", "orders-delivery"]) {
    const opener = page.locator(`button[data-case-study='${id}']`); await opener.scrollIntoViewIfNeeded(); await opener.click();
    const dialog = page.getByRole("dialog"); await expect(dialog).toBeVisible();
    const imgs = dialog.locator("img");
    const n = await imgs.count();
    for (let k = 0; k < n; k++) {
      const img = imgs.nth(k); await img.scrollIntoViewIfNeeded();
      await expect.poll(() => img.evaluate((i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0), { timeout: 15000, message: `${id} image ${k}` }).toBe(true);
    }
    await page.keyboard.press("Escape"); await expect(page.getByRole("dialog")).toHaveCount(0);
  }
});
