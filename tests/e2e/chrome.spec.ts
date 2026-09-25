// tests/e2e/chrome.spec.ts
import { test, expect } from "playwright/test";

test("desktop nav: TS · Work · About · Stack · Contact · availability pill, palette and theme buttons", async ({ page }) => {
  await page.goto("/"); await page.locator("[data-skip-intro]").click();
  const nav = page.locator("header[data-entrance-nav] nav");
  for (const l of ["Work", "About", "Stack", "Contact"]) await expect(nav.getByRole("link", { name: l, exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: /Available for work/ })).toHaveAttribute("href", "#contact");
  await expect(nav.getByRole("button", { name: /command palette/i })).toBeVisible();
  await expect(nav.getByRole("button", { name: /theme|light mode|dark mode/i })).toBeVisible();
});

test("below lg: TS, the availability dot (with text for screen readers) and the menu button", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/"); await page.locator("[data-skip-intro]").click();
  await expect(page.locator("header[data-entrance-nav] [data-availability-dot]")).toBeVisible();
  await expect(page.locator("header[data-entrance-nav] [data-availability-dot]")).toHaveAccessibleName(/Available for work/);
  await page.getByRole("button", { name: "Open menu" }).click();
  const sheet = page.getByRole("dialog");
  for (const l of ["Work", "About", "Stack", "Contact"]) await expect(sheet.getByRole("link", { name: l, exact: true })).toBeVisible();
});

test("mobile sheet: keyboard reaches the theme toggle and palette, Escape restores focus (spec §10)", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/"); await page.locator("[data-skip-intro]").click();
  const menu = page.getByRole("button", { name: "Open menu" });
  await menu.focus(); await page.keyboard.press("Enter");
  const sheet = page.getByRole("dialog"); await expect(sheet).toBeVisible();
  const reached: string[] = [];
  for (let i = 0; i < 14; i++) { await page.keyboard.press("Tab"); reached.push((await page.evaluate(() => document.activeElement?.getAttribute("aria-label") ?? document.activeElement?.textContent ?? "")).trim()); }
  expect(reached.some((r) => /theme|light mode|dark mode/i.test(r))).toBe(true);
  expect(reached.some((r) => /palette|search/i.test(r))).toBe(true);
  await page.keyboard.press("Escape"); await expect(sheet).toBeHidden(); await expect(menu).toBeFocused();
});

test("floating controls hide during the entrance and appear at the portal", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-floating-control]").first()).toBeHidden();
  await page.locator("[data-skip-intro]").click();
  await expect(page.locator("[data-floating-control]").first()).toBeVisible();
});

test("static mode shows the floating controls from first paint", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" }); const page = await ctx.newPage();
  await page.goto("/");
  await expect(page.locator("[data-floating-control]").first()).toBeVisible();
  await ctx.close();
});

test("palette 'Home' lands on the hero at identity with the h1 focused (the removed #top regression)", async ({ page }) => {
  await page.goto("/"); await page.locator("[data-skip-intro]").click();
  // Start from a focused control far down the page, as a keyboard user would: the trap restores focus
  // here on close, and Home must still win.
  await page.locator("footer a").first().focus();
  await page.keyboard.press("Control+k");
  await page.getByRole("option", { name: "Home" }).click();
  await expect(page.locator("#hero-title")).toBeFocused();
  await expect(page.locator("#hero-title")).toBeInViewport();
});

test("every palette section target exists", async ({ page }) => {
  await page.goto("/");
  for (const id of ["hero", "work", "about", "skills", "approach", "contact"]) await expect(page.locator(`#${id}`)).toHaveCount(1);
});
