// tests/e2e/review-final.spec.ts — regressions for the final pre-PR review (findings #2–#8).
import { test, expect, type Page } from "playwright/test";
const skip = async (page: Page) => { await page.goto("/"); await page.locator("[data-skip-intro]").click(); await expect(page.locator("html")).toHaveAttribute("data-entrance-done", "true"); };

test("#2 chat and accessibility never stack: opening one closes the other", async ({ page }) => {
  await skip(page);
  await page.getByRole("button", { name: "Ask Tay AI" }).first().click();
  await expect(page.getByRole("dialog")).toHaveCount(1);
  await page.getByRole("button", { name: "Accessibility settings" }).first().click();
  await expect(page.getByRole("dialog", { name: "Accessibility settings" })).toBeVisible();
  await expect(page.getByRole("dialog", { name: "Ask Tay AI" })).toHaveCount(0);   // closed, not stacked beneath
  await expect(page.getByRole("dialog")).toHaveCount(1);
  await page.getByRole("button", { name: "Ask Tay AI" }).first().click();          // and back the other way
  await expect(page.getByRole("dialog", { name: "Ask Tay AI" })).toBeVisible();
  await expect(page.getByRole("dialog", { name: "Accessibility settings" })).toHaveCount(0);
});

test("#2 one Escape closes only the top overlay: palette over a case study", async ({ page }) => {
  await skip(page);
  const opener = page.locator("button[data-case-study='aegis']"); await opener.scrollIntoViewIfNeeded(); await opener.click();
  await expect(page.getByRole("dialog")).toHaveCount(1);
  await page.keyboard.press("Control+k");
  await expect(page.getByRole("dialog")).toHaveCount(2);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(1);                 // the case study is still open
  await expect(page.locator("[role=dialog]")).toContainText("Aegis");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("#3 the first wheel notch after an idle moment glides rather than snapping", async ({ page }) => {
  await skip(page);
  await page.mouse.move(700, 450);
  await page.waitForTimeout(1500);                                         // the loop has stopped: idle
  const y0 = await page.evaluate(() => scrollY);
  const sampled = page.evaluate(() => new Promise<number[]>((resolve) => {
    const ys: number[] = []; const tick = () => { ys.push(scrollY); if (ys.length < 40) requestAnimationFrame(tick); else resolve(ys); };
    requestAnimationFrame(tick);
  }));
  await page.mouse.wheel(0, 300);
  const ys = (await sampled).map((y) => y - y0);
  const final = ys.at(-1)!;
  expect(final).toBeGreaterThan(200);
  // A glide passes through intermediate positions; a snap goes 0 → final in one frame.
  expect(ys.filter((d) => d > 10 && d < final - 10).length, JSON.stringify(ys)).toBeGreaterThanOrEqual(3);
});

test("#4 the wheel does not scroll the page behind the open palette", async ({ page }) => {
  await skip(page);
  await page.evaluate(() => document.getElementById("about")!.scrollIntoView({ behavior: "instant" as ScrollBehavior }));
  await page.waitForTimeout(300);
  const before = await page.evaluate(() => scrollY);
  await page.keyboard.press("Control+k");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.mouse.move(40, 450);                                          // over the scrim, not the list
  for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, 200); await page.waitForTimeout(40); }
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => scrollY)).toBe(before);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.mouse.wheel(0, 400); await page.waitForTimeout(800);
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(before);      // unlocked again
});

test("#5 no overlay chunk is fetched until the visitor asks for one", async ({ page }) => {
  const js: string[] = []; page.on("request", (r) => { if (r.resourceType() === "script") js.push(r.url()); });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const settled = js.length;
  await page.waitForTimeout(1500);
  expect(js.length).toBe(settled);                                         // nothing trickles in on idle
  expect(await page.getByRole("dialog").count()).toBe(0);
  await page.keyboard.press("Control+k");                                  // before the palette exists
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(js.length).toBeGreaterThan(settled);                              // its chunk arrived on request
});

test("#6 revealing the phone number keeps keyboard focus on it", async ({ page }) => {
  await skip(page);
  const btn = page.getByRole("button", { name: /Tap to reveal/ });
  await btn.scrollIntoViewIfNeeded(); await btn.focus(); await page.keyboard.press("Enter");
  const focused = page.locator(":focus");
  await expect(focused).toHaveAttribute("href", /^tel:\+?\d+/);
});

test("#7 #8 metrics read value above label; case-study groups are dt then dd", async ({ page }) => {
  await skip(page);
  const order = await page.locator("#work-poker .flagship__copy dl > div").first().evaluate((d) =>
    d.querySelector("dd")!.getBoundingClientRect().top < d.querySelector("dt")!.getBoundingClientRect().top);
  expect(order).toBe(true);
  const opener = page.locator("button[data-case-study='poker']"); await opener.scrollIntoViewIfNeeded(); await opener.click();
  const groups = page.locator("[role=dialog] dl > div");
  await expect(groups.first()).toBeVisible();
  for (const g of await groups.all()) {
    const r = await g.evaluate((d) => ({ first: d.firstElementChild!.tagName, valueAbove: d.querySelector("dd")!.getBoundingClientRect().top < d.querySelector("dt")!.getBoundingClientRect().top }));
    expect(r).toEqual({ first: "DT", valueAbove: true });
  }
});
