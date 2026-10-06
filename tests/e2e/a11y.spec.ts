// tests/e2e/a11y.spec.ts — landmarks and heading outline for the whole page (spec §8).
import { test, expect } from "playwright/test";
test("landmarks and heading outline", async ({ page }) => {
  await page.goto("/"); await page.locator("[data-skip-intro]").click();
  await expect(page.locator("main")).toHaveCount(1); await expect(page.locator("footer")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveCount(1);
  const outline = await page.evaluate(() => [...document.querySelectorAll("main h1, main h2, main h3")].map((h) => Number(h.tagName[1])));
  for (let i = 1; i < outline.length; i++) expect(outline[i] - outline[i - 1], `h${outline[i - 1]} → h${outline[i]} at ${i}`).toBeLessThanOrEqual(1);
  expect(await page.locator("main h2").allTextContents()).toEqual(["Selected work", "Engineer by training.Builder by nature.", "The tools I build with.", "Think. Build. Ship.", "Let's buildsomething great."]);
});
test("every interactive element is ≥ 44px below lg", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto("/"); await page.locator("[data-skip-intro]").click();
  const small = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>("main a[href], main button, footer a[href]")]
    .filter((el) => el.offsetParent && getComputedStyle(el).visibility !== "hidden")
    .map((el) => ({ t: el.textContent?.trim().slice(0, 30), ...el.getBoundingClientRect().toJSON() }))
    .filter((r) => r.height < 44 && r.width > 0));
  expect(small).toEqual([]);
});

test("zero console errors while wheel-scrolling from the top to the footer (spec §10)", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("/", { waitUntil: "networkidle" });
  const bottom = () => page.evaluate(() => scrollY + innerHeight >= document.documentElement.scrollHeight - 2);
  for (let i = 0; i < 400 && !(await bottom()); i++) { await page.mouse.wheel(0, 600); await page.waitForTimeout(40); }
  expect(await bottom()).toBe(true);
  await page.waitForTimeout(500);
  expect(errors).toEqual([]);
});
