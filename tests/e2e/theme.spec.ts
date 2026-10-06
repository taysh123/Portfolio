// tests/e2e/theme.spec.ts — Review Focus 5.
import { test, expect } from "playwright/test";
test("light theme: the dark spine stays dark, theme sections are light, a toggle shifts no layout", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addCookies([{ name: "theme", value: "light", url: "http://localhost:3400" }]);
  const page = await ctx.newPage(); await page.goto("/"); await page.locator("[data-skip-intro]").click();
  const bg = (sel: string) => page.locator(sel).first().evaluate((el) => getComputedStyle(el).getPropertyValue("--bg").trim());
  expect(await bg(".entrance__stage")).toBe("#05070a");
  expect(await bg(".work__stage")).toBe("#05070a");
  expect(await bg("#contact")).toBe("#05070a");
  expect(await bg("#about")).toBe("#f5f6f8");
  expect(await bg("#skills")).toBe("#f5f6f8");
  await page.evaluate(() => { (window as unknown as { __cls: number }).__cls = 0; new PerformanceObserver((l) => { for (const e of l.getEntries() as PerformanceEntry[] & { value: number; hadRecentInput: boolean }[]) if (!e.hadRecentInput) (window as unknown as { __cls: number }).__cls += e.value; }).observe({ type: "layout-shift" }); });
  await page.evaluate(() => document.getElementById("about")!.scrollIntoView());
  await page.getByRole("button", { name: /dark mode|light mode|theme/i }).first().click(); await page.waitForTimeout(500);
  expect(await page.evaluate(() => (window as unknown as { __cls: number }).__cls)).toBeLessThan(0.02);
  await ctx.close();
});

for (const theme of ["dark", "light"]) {
  test(`hero at identity has the dark stage background in the ${theme} theme (spec §10, decision 3)`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies([{ name: "theme", value: theme, url: "http://localhost:3400" }]);
    const page = await ctx.newPage(); await page.goto("/"); await page.locator("[data-skip-intro]").click();
    await expect.poll(() => page.locator("#hero").evaluate((el) => getComputedStyle(el.parentElement!).backgroundColor)).toBe("rgb(5, 7, 10)");
    await ctx.close();
  });
}
