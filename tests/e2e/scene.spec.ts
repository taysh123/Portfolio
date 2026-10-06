// tests/e2e/scene.spec.ts
import { test, expect } from "playwright/test";
const probeY = (page: import("playwright/test").Page) => page.locator("[data-probe]").evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m42);

test("pins at 1440×900 and drives --assemble from scroll", async ({ page }) => {
  await page.goto("/e2e-fixtures/scene");
  await expect(page.locator("#fx")).toHaveAttribute("data-pinned", "true");
  await expect(page.locator("#fx .scene__stage")).toHaveCSS("position", "sticky");
  await page.evaluate(() => window.scrollTo({ top: document.getElementById("fx")!.getBoundingClientRect().top + scrollY, behavior: "instant" as ScrollBehavior }));
  await expect.poll(() => probeY(page)).toBeGreaterThan(90);   // p = 0 → assemble 0 → 100px
});

test("resizing below the threshold unpins live and clears every var (Review Focus 2)", async ({ page }) => {
  await page.goto("/e2e-fixtures/scene");
  await page.evaluate(() => window.scrollTo({ top: document.getElementById("fx")!.getBoundingClientRect().top + scrollY, behavior: "instant" as ScrollBehavior }));
  await page.setViewportSize({ width: 900, height: 700 });
  await expect(page.locator("#fx")).toHaveAttribute("data-pinned", "false");
  await expect(page.locator("#fx .scene__stage")).toHaveCSS("position", "relative");
  expect(await page.locator("#fx").evaluate((el) => el.getAttribute("style") ?? "")).not.toMatch(/--assemble/);
  await expect.poll(() => probeY(page)).toBe(0);                // settled composition
});

test("reduced motion mid-scene settles it (Review Focus 3)", async ({ page }) => {
  await page.goto("/e2e-fixtures/scene");
  await page.evaluate(() => window.scrollTo({ top: document.getElementById("fx")!.getBoundingClientRect().top + scrollY, behavior: "instant" as ScrollBehavior }));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("#fx")).toHaveAttribute("data-pinned", "false");
  await expect.poll(() => probeY(page)).toBe(0);
});

test("no JavaScript: settled composition, not pinned", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false }); const page = await ctx.newPage();
  await page.goto("/e2e-fixtures/scene");
  // Without JS the CSS still pins (media query) but the defaults are the settled state; the stage is legible.
  expect(await probeY(page)).toBe(0);
  await expect(page.locator("#fx .scene__stage")).toHaveCSS("position", "relative");   // never pinned without JS
  expect(await page.locator("#fx").evaluate((el) => el.getBoundingClientRect().height)).toBeLessThan(900 * 1.5);
  await ctx.close();
});

test("fit guard: a composition taller than the viewport is never pinned, so nothing is clipped (Plan 2 Task 12)", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/e2e-fixtures/scene");
  await expect(page.locator("#fx")).toHaveAttribute("data-fit", "true");
  await expect(page.locator("#fx")).toHaveAttribute("data-pinned", "true");
  await expect(page.locator("#fx-tall")).toHaveAttribute("data-fit", "false");
  await expect(page.locator("#fx-tall")).toHaveAttribute("data-pinned", "false");
  await expect(page.locator("#fx-tall .scene__stage")).toHaveCSS("position", "relative");
  await page.locator("#fx-tall [data-bottom]").click();             // reachable, not under the next block
});

test("pillars mode: data-lit is written while pinned and cleared when the scene unpins (Plan 2 Task 20)", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/e2e-fixtures/scene");
  await page.evaluate(() => { const s = document.getElementById("fx-pillars")!; window.scrollTo({ top: s.getBoundingClientRect().top + scrollY + (s.offsetHeight - innerHeight) * 0.5, behavior: "instant" as ScrollBehavior }); });
  await expect(page.locator("#fx-pillars")).toHaveAttribute("data-pinned", "true");
  await expect(page.locator("#fx-pillars")).toHaveAttribute("data-lit", /^[012]$/);
  await page.setViewportSize({ width: 900, height: 720 });
  await expect(page.locator("#fx-pillars")).toHaveAttribute("data-pinned", "false");
  await expect(page.locator("#fx-pillars")).not.toHaveAttribute("data-lit", /.*/);
});
