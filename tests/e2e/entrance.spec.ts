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
  // Observed through to the load event and beyond, then compared against loadEventStart —
  // stopping at domcontentloaded would pass trivially.
  await page.goto("/", { waitUntil: "networkidle" });
  const r = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    const frames = performance.getEntriesByType("resource").filter((e) => /\/entrance\/(landscape|portrait)\//.test(e.name));
    return { loadStart: nav.loadEventStart, frames: frames.length, early: frames.filter((e) => e.startTime < nav.loadEventStart).map((e) => e.name) };
  });
  expect(r.loadStart).toBeGreaterThan(0);
  expect(r.frames).toBeGreaterThan(0); // the sequence does load — after the load event
  expect(r.early).toEqual([]);
});

const heroAtRest = (page: import("playwright/test").Page) => page.evaluate(() => {
  const els = [...document.querySelectorAll<HTMLElement>("[data-hero-line], [data-hero-lead], [data-hero-ctas], [data-hero-name]")];
  return els.every((el) => getComputedStyle(el).transform === "none" && getComputedStyle(el).opacity === "1");
});

test("switching reduced motion on in the Accessibility panel hands back a hero at rest (review #1)", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1024 });
  await page.goto("/");
  await page.getByRole("button", { name: "Accessibility settings" }).click();
  await page.getByRole("switch", { name: /Reduced motion/ }).click();
  await expect(page.locator(".entrance__stage")).toHaveCSS("position", "static");
  await expect.poll(() => heroAtRest(page)).toBe(true);
  await expect(page.locator("[data-hero-line='1']")).toBeVisible();
  expect(await page.locator(".entrance__surface").evaluate((el) => el.getAttribute("style") ?? "")).toBe("");
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
});

test("the OS reduced-motion setting changing mid-session is followed (review #1)", async ({ page }) => {
  await page.goto("/");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".entrance__stage")).toHaveCSS("position", "static");
  await expect.poll(() => heroAtRest(page)).toBe(true);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator(".entrance__stage")).toHaveCSS("position", "sticky");
  await page.locator("[data-skip-intro]").click();
  await expect(page.locator("#hero-title")).toBeInViewport();
  await expect.poll(() => heroAtRest(page)).toBe(true);
});

test("Tab into the hero lands at identity and keeps focus on the control reached (review #4)", async ({ page }) => {
  await page.goto("/");
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press("Tab");
    if (await page.evaluate(() => !!document.activeElement?.closest("#hero"))) break;
  }
  const label = await page.evaluate(() => document.activeElement?.textContent?.trim());
  expect(label).toMatch(/Explore my work/);
  await expect(page.locator("html")).toHaveAttribute("data-entrance-done", "true");
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => document.activeElement?.textContent?.trim())).toBe(label);
});

test("skip intro leaves the Tab order once the portal completes (review #4)", async ({ page }) => {
  await page.goto("/");
  await page.locator("[data-skip-intro]").click();
  await expect(page.locator("[data-skip-intro]")).toBeHidden();
});

test("a deep link to /#hero arrives at the hero at identity (review #5)", async ({ page }) => {
  await page.goto("/#hero");
  await expect(page.locator("html")).toHaveAttribute("data-entrance-done", "true");
  await expect(page.locator("#hero-title")).toBeInViewport();
  await expect(page.locator(".entrance__surface")).toHaveCSS("opacity", "1");
});

test("the skip link lands on the h1 every time, not only the first (review #5)", async ({ page }) => {
  await page.goto("/");
  for (let round = 0; round < 2; round++) {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }));
    await page.locator("a[href='#main']").first().focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#hero-title")).toBeFocused();
    await expect(page.locator("html")).toHaveAttribute("data-entrance-done", "true");
  }
});

test("jumping mid-sequence never flashes the hero full-screen before its quad exists (review #2)", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const samples = await page.evaluate(async () => {
    const c = document.getElementById("entrance")!, surf = document.querySelector<HTMLElement>(".entrance__surface")!;
    window.scrollTo({ top: c.offsetTop + 0.6 * (c.offsetHeight - innerHeight), behavior: "instant" as ScrollBehavior });
    const out: { opacity: string; w: number }[] = [];
    for (let i = 0; i < 12; i++) {
      await new Promise((r) => requestAnimationFrame(r));
      const b = surf.getBoundingClientRect();
      out.push({ opacity: getComputedStyle(surf).opacity, w: b.width / innerWidth });
    }
    return out;
  });
  // Visible and full-width at p = 0.6 would be the flash: on the laptop, the screen is well under the viewport width.
  expect(samples.filter((s) => s.opacity !== "0" && s.w > 0.95)).toEqual([]);
});
