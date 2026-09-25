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

test("nav anchors glide the section to just under the fixed header (Lenis-aware, Plan 2 Task 23)", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/"); await page.locator("[data-skip-intro]").click();
  await page.locator("header[data-entrance-nav] nav").getByRole("link", { name: "About", exact: true }).click();
  // Lands (after the glide) with the section's top just below the header: 40–140px from the viewport top.
  await expect.poll(async () => page.locator("#about").evaluate((el) => { const t = el.getBoundingClientRect().top; return t >= 40 && t < 140; }), { timeout: 5000 }).toBe(true);
  await expect(page).toHaveURL(/#about$/);
});

for (const [w, h] of [[844, 390], [667, 375]] as const) {
  test(`floating controls never cover the hero CTAs at ${w}x${h} (Plan 1 open item)`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto("/"); await page.locator("[data-skip-intro]").click();
    await expect(page.locator("[data-floating-control]").first()).toBeVisible();
    const hits = await page.evaluate(() => {
      const fab = [...document.querySelectorAll("[data-floating-control] button")].map((e) => e.getBoundingClientRect()).filter((r) => r.width > 0);
      const ctas = [...document.querySelectorAll<HTMLElement>("#hero a, #hero button")].filter((e) => e.offsetParent).map((e) => ({ t: e.textContent?.trim(), r: e.getBoundingClientRect() }));
      return ctas.filter((c) => fab.some((f) => f.left < c.r.right && f.right > c.r.left && f.top < c.r.bottom && f.bottom > c.r.top)).map((c) => c.t);
    });
    expect(hits).toEqual([]);
  });
}

for (const [w, h] of [[844, 390], [390, 844]] as const) {
  test(`the accessibility panel fits the viewport at ${w}x${h} (every control reachable)`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto("/"); await page.locator("[data-skip-intro]").click();
    await page.getByRole("button", { name: /accessibility/i }).first().click();
    const box = (await page.getByRole("dialog").boundingBox())!;
    expect(box.y).toBeGreaterThanOrEqual(0); expect(box.y + box.height).toBeLessThanOrEqual(h);
  });
}

test("a palette request made before its chunk loads is honoured when it arrives (Plan 2 Task 24)", async ({ page }) => {
  // Hold back the palette's dynamic chunk (the only script that renders "Search commands") for 2s.
  await page.route(/\/_next\/static\/chunks\/.*\.js$/, async (route) => {
    const res = await route.fetch(); const body = await res.text();
    if (body.includes("Search commands")) await new Promise((r) => setTimeout(r, 2000));
    await route.fulfill({ response: res, body });
  });
  await page.goto("/"); await page.locator("[data-skip-intro]").click();
  await page.locator("header[data-entrance-nav] nav").getByRole("button", { name: /command palette/i }).click();
  await expect(page.getByRole("combobox", { name: "Search commands" })).toBeVisible({ timeout: 10_000 });
});

test("the palette is a real overlay: fixed in the viewport, and opening/closing it never moves the page (Plan 2 Task 24)", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/"); await page.locator("[data-skip-intro]").click();
  await page.evaluate(() => document.getElementById("about")!.scrollIntoView({ behavior: "instant" as ScrollBehavior }));
  await page.waitForTimeout(300);
  const y0 = await page.evaluate(() => Math.round(scrollY));
  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog", { name: "Command palette" });
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate((el) => getComputedStyle(el).position)).toBe("fixed");
  await expect(dialog).toBeInViewport({ ratio: 0.9 });
  expect(await page.evaluate(() => Math.round(scrollY))).toBe(y0);
  await page.keyboard.press("Escape"); await expect(dialog).toBeHidden();
  expect(await page.evaluate(() => Math.round(scrollY))).toBe(y0);
});
