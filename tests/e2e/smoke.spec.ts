import { test, expect } from "playwright/test";

test("home renders exactly one h1", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveCount(1);
});
