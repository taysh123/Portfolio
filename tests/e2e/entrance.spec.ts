import { test, expect } from "playwright/test";

const identity = "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)";
const surfaceTransform = (page: import("playwright/test").Page) =>
  page.locator(".entrance__surface").evaluate((el) => getComputedStyle(el).transform);

test("skip intro lands on the hero at identity, focuses the h1, shows the nav", async ({ page }) => {
  await page.goto("/");
  await page.locator("[data-skip-intro]").click();
  await expect(page.locator("#hero-title")).toBeFocused();
  await expect.poll(() => surfaceTransform(page)).toMatch(/^(none|matrix\(1, 0, 0, 1, 0, 0\)|matrix3d\(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1\))$/);
  await expect(page.locator("html")).toHaveAttribute("data-entrance-done", "true");
});

test("jumping to #work from the top leaves the hero at identity (Review Focus 1)", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("/");
  await page.evaluate(() => document.getElementById("work")!.scrollIntoView({ behavior: "instant" as ScrollBehavior }));
  await expect(page.locator("html")).toHaveAttribute("data-entrance-done", "true");
  expect(errors).toEqual([]);
});

test("resize mid-entrance re-derives framing (Review Focus 2)", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, document.getElementById("entrance")!.offsetHeight * 0.45));
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator("#entrance")).toHaveAttribute("data-framing", "portrait");
});

test("in-app reduced motion switches to static mode immediately (Review Focus 3)", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.documentElement.setAttribute("data-reduced-motion", "true"));
  const h = await page.locator("#entrance").evaluate((el) => el.getBoundingClientRect().height);
  expect(h).toBeLessThan(await page.evaluate(() => window.innerHeight * 2.5));
  await expect(page.locator("header[data-entrance-nav]")).toHaveCSS("opacity", "1");
});

test("OS reduced motion: not pinned, hero in flow", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage(); await page.goto("/");
  await expect(page.locator(".entrance__stage")).toHaveCSS("position", "static");
  await expect(page.locator("h1")).toHaveCount(1);
  await ctx.close();
});

test("missing manifest: poster stays and skip still works (Review Focus 4)", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", (e) => errors.push(String(e)));
  await page.route("**/entrance/manifest.json", (r) => r.fulfill({ status: 404, body: "" }));
  await page.goto("/");
  await page.locator("[data-skip-intro]").click();
  await expect(page.locator("#hero-title")).toBeFocused();
  expect(errors).toEqual([]);
});

test("reload restored mid-entrance renders consistently (Review Focus 5)", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, document.getElementById("entrance")!.offsetHeight * 0.5));
  await page.reload();
  await page.waitForTimeout(500);
  expect(errors).toEqual([]);
});

for (const [w, h] of [[375, 667], [390, 844], [768, 1024], [1366, 768], [1440, 900], [844, 390]] as const) {
  test(`no horizontal overflow at ${w}x${h}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h }); await page.goto("/");
    const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(over).toBeLessThanOrEqual(0);
  });
}

test("no JavaScript: static entrance, hero in flow, nav usable, content without the runtime", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const frameRequests: string[] = [];
  page.on("request", (r) => { if (/\/entrance\/(landscape|portrait)\/|manifest\.json/.test(r.url())) frameRequests.push(r.url()); });
  await page.goto("/");
  // not pinned
  await expect(page.locator(".entrance__stage")).toHaveCSS("position", "static");
  const entranceH = await page.locator("#entrance").evaluate((el) => el.getBoundingClientRect().height);
  expect(entranceH).toBeLessThan(900 * 2.5);
  // static still renders (the poster/canvas layers are hidden)
  const still = page.locator(".entrance__still img");
  await expect(still).toBeVisible();
  expect(await still.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  await expect(page.locator(".entrance__canvas")).toBeHidden();
  // the real Hero in normal flow, visible, below the still
  const hero = page.locator("#hero");
  await expect(hero).toBeVisible();
  await expect(page.locator("#hero-title")).toBeVisible();
  const heroPos = await page.locator(".entrance__surface").evaluate((el) => getComputedStyle(el).position);
  expect(heroPos).toBe("static");
  await expect(page.locator("h1")).toHaveCount(1);
  // nav visible from first paint
  await expect(page.locator("header[data-entrance-nav]")).toHaveCSS("opacity", "1");
  // nav links work without JS (plain anchors)
  for (const [label, id] of [["Work", "work"], ["About", "about"], ["Stack", "skills"], ["Contact", "contact"]] as const) {
    const link = page.locator("header[data-entrance-nav] nav a", { hasText: label }).first();
    await expect(link).toHaveAttribute("href", `#${id}`);
    await link.click();
    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    await expect(page.locator(`#${id}`)).toBeInViewport();
  }
  // no horizontal overflow
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  // content never depended on the canvas/frame runtime
  expect(frameRequests).toEqual([]);
  await ctx.close();
});

test("no frames are requested before load except the poster", async ({ page }) => {
  const early: string[] = [];
  page.on("request", (r) => { if (/\/entrance\/(landscape|portrait)\//.test(r.url())) early.push(r.url()); });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  expect(early).toEqual([]);
});
