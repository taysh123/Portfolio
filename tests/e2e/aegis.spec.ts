// tests/e2e/aegis.spec.ts — the Aegis rebrand is complete: renamed repository, canonical captures (2026-09-26).
import { test, expect, type Page } from "playwright/test";
const REPO = "https://github.com/taysh123/aegis";
const skip = async (page: Page) => { await page.goto("/"); await page.locator("[data-skip-intro]").click(); };

test("Aegis links its renamed repository from the flagship, the case study and the palette", async ({ page }) => {
  await skip(page);
  await expect(page.locator(`#work-aegis a[href="${REPO}"]`)).toHaveCount(1);
  const opener = page.locator("button[data-case-study='aegis']"); await opener.scrollIntoViewIfNeeded(); await opener.click();
  const panel = page.getByRole("dialog");
  await expect(panel.getByRole("heading", { name: "Aegis" })).toBeVisible();
  await expect(panel.locator(`a[href="${REPO}"]`).first()).toBeAttached();
  await page.keyboard.press("Escape"); await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.keyboard.press("Control+k");
  await page.getByRole("combobox", { name: "Search commands" }).fill("Aegis");
  await expect(page.getByRole("listbox", { name: "Commands" }).getByRole("option", { name: /Aegis/ }).first()).toBeVisible();
  // The palette opens links by script; its entry for Aegis's source must target the new URL (captured, not fetched).
  const opened: string[] = [];
  await page.context().route("https://github.com/**", (r) => { opened.push(r.request().url()); return r.fulfill({ status: 204, body: "" }); });
  await page.getByRole("listbox", { name: "Commands" }).getByRole("option", { name: /Aegis.*(source|GitHub)/i }).first().click();
  await expect.poll(() => opened).toContain(REPO);
});

test("no SentinelAI branding and no 'Formerly' on any current surface; new captures decode", async ({ page }) => {
  await skip(page);
  const aegis = page.locator("#work-aegis"); await aegis.scrollIntoViewIfNeeded(); await page.waitForTimeout(600);
  const imgs = await aegis.locator("img").evaluateAll((els) => els.map((i) => ({ src: (i as HTMLImageElement).currentSrc, ok: (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0 })));
  expect(imgs.length).toBeGreaterThan(0);
  for (const i of imgs) { expect(i.ok, i.src).toBe(true); expect(decodeURIComponent(i.src)).toMatch(/\/projects\/aegis\/0[45]-/); }
  const opener = page.locator("button[data-case-study='aegis']"); await opener.scrollIntoViewIfNeeded(); await opener.click();
  const panel = page.getByRole("dialog"); await expect(panel).toBeVisible();
  await expect(panel).not.toContainText(/formerly|sentinel/i);
  const figs = panel.locator("figure img");
  await expect(figs).toHaveCount(5);
  for (const f of await figs.all()) { await f.scrollIntoViewIfNeeded(); await expect.poll(() => f.evaluate((i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0)).toBe(true); }
  await page.keyboard.press("Escape");
  const text = await page.evaluate(() => document.body.innerText + " " + [...document.querySelectorAll("[alt],[aria-label],[title]")].map((e) => `${e.getAttribute("alt") ?? ""} ${e.getAttribute("aria-label") ?? ""} ${e.getAttribute("title") ?? ""}`).join(" "));
  expect(text).not.toMatch(/sentinel/i);
  expect(await page.content()).not.toMatch(/github\.com\/taysh123\/sentinelai/i);
});
