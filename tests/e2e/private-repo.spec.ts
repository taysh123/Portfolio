// tests/e2e/private-repo.spec.ts — T Poker's repository is private (user decision, 2026-09-26).
import { test, expect } from "playwright/test";

const PRIVATE = /poker-home-games(?!-three)/;

test("no page HTML or client script carries the private repository address", async ({ page }) => {
  await page.goto("/"); await page.locator("[data-skip-intro]").click();
  expect(await page.content()).not.toMatch(PRIVATE);
  await expect(page.locator('a[href*="poker-home-games"]')).toHaveCount(0);
  const scripts = await page.locator("script[src]").evaluateAll((els) => els.map((e) => (e as HTMLScriptElement).src));
  expect(scripts.length).toBeGreaterThan(0);
  for (const s of scripts) expect(await (await page.request.get(s)).text(), s).not.toMatch(PRIVATE);
});

test("T Poker shows a non-clickable 'Private repository' label and keeps its live link", async ({ page }) => {
  await page.goto("/"); await page.locator("[data-skip-intro]").click();
  const label = page.locator("[data-private-repo]").first();
  await label.scrollIntoViewIfNeeded(); await expect(label).toHaveText("Private repository");
  expect(await label.evaluate((el) => el.closest("a,button") === null)).toBe(true);
  await expect(page.locator('a[href="https://app.tpoker.app/"]').first()).toBeAttached();
});

test("the command palette offers no T Poker source entry, but keeps the live app", async ({ page }) => {
  await page.goto("/"); await page.locator("[data-skip-intro]").click();
  await page.locator("header[data-entrance-nav] nav").getByRole("button", { name: /command palette/i }).click();
  await page.getByRole("combobox", { name: "Search commands" }).fill("T Poker");
  const list = page.getByRole("listbox", { name: "Commands" });
  await expect(list.getByRole("option", { name: /T Poker — live/ })).toBeVisible();
  await expect(list.getByRole("option", { name: /Source on GitHub/ }).filter({ hasText: /^T Poker/ })).toHaveCount(0);
  await expect(list.getByRole("option").filter({ hasText: "Source on GitHub" })).toHaveCount(0);
});

test("the T Poker case study shows the label, no source link, and keeps the live and App Store links", async ({ page }) => {
  await page.goto("/"); await page.locator("[data-skip-intro]").click();
  await page.locator("#work").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: /case study/i }).filter({ hasText: /case study/i }).first().click();
  const panel = page.getByRole("dialog");
  await expect(panel.getByRole("heading", { name: "T Poker" })).toBeVisible();
  await expect(panel.locator("[data-private-repo]").first()).toHaveText("Private repository");
  await expect(panel.getByRole("link", { name: /source/i })).toHaveCount(0);
  await expect(panel.locator('a[href="https://app.tpoker.app/"]').first()).toBeVisible();
  await expect(panel.locator('a[href*="apps.apple.com"]').first()).toBeVisible();
});
