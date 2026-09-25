// tests/e2e/idle.spec.ts — spec §9 "Idle work": 0 animation-frame loops when nothing loops in view.
import { test, expect, type Page } from "playwright/test";

const countRaf = async (page: Page, ms: number) => page.evaluate(async (ms) => {
  let n = 0; const orig = window.requestAnimationFrame;
  window.requestAnimationFrame = (cb) => orig((t) => { n++; cb(t); });
  await new Promise((r) => setTimeout(r, ms));
  window.requestAnimationFrame = orig; return n;
}, ms);

test("no animation-frame loop runs once scrolling settles at the bottom of the page", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" as ScrollBehavior }));
  await page.waitForTimeout(1200);  // let Lenis and any reveals finish
  expect(await countRaf(page, 1000)).toBe(0);
});

test("wheel scrolling still animates smoothly (the loop restarts on input)", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.mouse.move(700, 450);
  const before = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, 600); await page.waitForTimeout(700);
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(before + 300);
});
