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

// Chat and accessibility live in the site chrome, not in floating corner buttons (final polish pass).
test("chat and accessibility are in the nav: hidden with it during the entrance, working at the portal", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("header[data-entrance-nav]")).toHaveCSS("opacity", "0");
  await page.locator("[data-skip-intro]").click();
  const nav = page.locator("header[data-entrance-nav] nav");
  for (const [name, dialog] of [["Ask Tay AI", "Ask Tay AI"], ["Accessibility settings", "Accessibility settings"]] as const) {
    const b = nav.getByRole("button", { name, exact: true }); await expect(b).toBeVisible();
    await expect(b).toHaveAttribute("aria-expanded", "false");
    await b.click(); await expect(page.getByRole("dialog", { name: dialog })).toBeVisible();
    await expect(b).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape"); await expect(page.getByRole("dialog", { name: dialog })).toBeHidden();
    await expect(b).toBeFocused();                                                  // focus returns to its opener
  }
  await expect(page.locator("[data-floating-control]")).toHaveCount(0);
});

test("static mode: chat and accessibility are reachable from first paint", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" }); const page = await ctx.newPage();
  await page.goto("/");
  await expect(page.locator("header[data-entrance-nav]")).toHaveCSS("opacity", "1");
  await expect(page.locator("header[data-entrance-nav] nav").getByRole("button", { name: "Ask Tay AI", exact: true })).toBeVisible();
  await ctx.close();
});

test("phones: chat in the header, accessibility in the menu sheet — focus returns to the menu button", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/"); await page.locator("[data-skip-intro]").click();
  await page.locator("header[data-entrance-nav]").getByRole("button", { name: "Ask Tay AI", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Ask Tay AI" })).toBeVisible();
  await page.keyboard.press("Escape");
  const menu = page.getByRole("button", { name: "Open menu" }); await menu.click();
  await page.getByRole("dialog", { name: "Navigation" }).getByRole("button", { name: "Accessibility settings" }).click();
  await expect(page.getByRole("dialog", { name: "Accessibility settings" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Accessibility settings" })).toBeHidden();
  await expect(menu).toBeFocused();
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

// Nothing but the header is fixed over the page at rest — no control can sit on copy or tap targets
// (scripts/fab-scan.mjs found 24–46 collisions per viewport with the old corner buttons).
for (const [w, h] of [[375, 667], [390, 844], [844, 390], [1280, 720]] as const) {
  test(`no fixed control overlaps the page at rest at ${w}x${h} (floating-control regression)`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto("/"); await page.locator("[data-skip-intro]").click();
    for (const f of [0, 0.35, 0.7, 1]) {
      await page.evaluate((f) => scrollTo({ top: (document.documentElement.scrollHeight - innerHeight) * f, behavior: "instant" as ScrollBehavior }), f);
      await page.waitForTimeout(900);
      const fixed = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>("body *")].filter((e) => {
        const cs = getComputedStyle(e); if (cs.position !== "fixed" || cs.visibility === "hidden" || +cs.opacity === 0) return false;
        if (e.closest("header[data-entrance-nav]") || e.closest("[role=dialog]")) return false;
        const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1 && r.bottom > 0 && r.top < innerHeight && cs.clip !== "rect(0px, 0px, 0px, 0px)";
      }).map((e) => e.tagName + "." + String(e.className).slice(0, 40)));
      expect(fixed, `at ${f}`).toEqual([]);
    }
  });
}

for (const [w, h] of [[844, 390], [390, 844]] as const) {
  test(`the accessibility panel fits the viewport at ${w}x${h} (every control reachable)`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto("/"); await page.locator("[data-skip-intro]").click();
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("dialog", { name: "Navigation" }).getByRole("button", { name: "Accessibility settings" }).click();
    const box = (await page.getByRole("dialog", { name: "Accessibility settings" }).boundingBox())!;
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

test("844×390: the menu sheet scrolls, so its last control is reachable by a real wheel scroll", async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto("/"); await page.locator("[data-skip-intro]").click();
  await page.getByRole("button", { name: "Open menu" }).click();
  const sheet = page.getByRole("dialog", { name: "Navigation" }); await expect(sheet).toBeVisible();
  const box = (await sheet.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  for (let i = 0; i < 8; i++) { await page.mouse.wheel(0, 200); await page.waitForTimeout(60); }
  await expect(sheet.getByRole("link", { name: "Get in touch" })).toBeInViewport();
});

test("the chat and accessibility panels are opaque (the page never shows through their text)", async ({ page }) => {
  await page.goto("/"); await page.locator("[data-skip-intro]").click();
  const nav = page.locator("header[data-entrance-nav] nav");
  for (const name of ["Ask Tay AI", "Accessibility settings"]) {
    await nav.getByRole("button", { name, exact: true }).click();
    const bg = await page.getByRole("dialog", { name }).evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg, name).toMatch(/^rgb\(/);                                       // rgb(), not rgba(…, <1)
    await page.keyboard.press("Escape");
  }
});
