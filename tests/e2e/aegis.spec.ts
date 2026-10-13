// tests/e2e/aegis.spec.ts — the Aegis rebrand is complete: renamed repository, canonical captures (2026-09-26).
import { test, expect, type Page } from "playwright/test";
const REPO = "https://github.com/taysh123/aegis";
const skip = async (page: Page) => { await page.goto("/"); };

test("Aegis links its renamed repository from the chapter and the case study", async ({ page }) => {
  await skip(page);
  await expect(page.locator(`#work-aegis a[href="${REPO}"]`)).toHaveCount(1);
  const opener = page.locator("button[data-case-study='aegis']"); await opener.scrollIntoViewIfNeeded(); await opener.click();
  const panel = page.getByRole("dialog");
  await expect(panel.getByRole("heading", { name: "Aegis", exact: true })).toBeVisible();
  await expect(panel.locator(`a[href="${REPO}"]`).first()).toBeAttached();
});

test("no SentinelAI branding and no 'Formerly' on any current surface; new captures decode", async ({ page }) => {
  await skip(page);
  const aegis = page.locator("#work-aegis"); await aegis.scrollIntoViewIfNeeded(); await page.waitForTimeout(600);
  const imgs = await aegis.locator("img").evaluateAll((els) => els.map((i) => ({ src: (i as HTMLImageElement).currentSrc, ok: (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0 })));
  expect(imgs.length).toBeGreaterThan(0);
  for (const i of imgs) { expect(i.ok, i.src).toBe(true); expect(decodeURIComponent(i.src)).toMatch(/\/work\/aegis-alerts(-phone)?-\d+\.(avif|webp)$/); }
  const opener = page.locator("button[data-case-study='aegis']"); await opener.scrollIntoViewIfNeeded(); await opener.click();
  const panel = page.getByRole("dialog"); await expect(panel).toBeVisible();
  await expect(panel).not.toContainText(/formerly|sentinel/i);
  // One capture, the clean crop of the Incidents board; the gallery of full captures is gone, and so is its heading.
  const shots = panel.locator("img");
  await expect(shots).toHaveCount(1);
  await expect(shots).toHaveAttribute("alt", /^The Aegis Incidents page/);
  await expect.poll(() => shots.evaluate((i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0)).toBe(true);
  expect(decodeURIComponent(await shots.evaluate((i) => (i as HTMLImageElement).currentSrc))).toMatch(/incident-board-open\.webp/);
  await expect(panel.getByText("Inside the product")).toHaveCount(0);
  await page.keyboard.press("Escape");
  const text = await page.evaluate(() => document.body.innerText + " " + [...document.querySelectorAll("[alt],[aria-label],[title]")].map((e) => `${e.getAttribute("alt") ?? ""} ${e.getAttribute("aria-label") ?? ""} ${e.getAttribute("title") ?? ""}`).join(" "));
  expect(text).not.toMatch(/sentinel/i);
  expect(await page.content()).not.toMatch(/github\.com\/taysh123\/sentinelai/i);
});
