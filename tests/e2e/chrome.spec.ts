// tests/e2e/chrome.spec.ts — header, menu, theme and keyboard (M10).
import { test, expect, type Page } from "playwright/test";
import { open, CHAPTERS } from "../support/page";

test("desktop header: name, four destinations, accessibility, theme and one Contact action — no language switch, no palette; the chat is not in the header", async ({ page }) => {
  await page.goto("/");
  const header = page.locator("header[data-site-nav]");
  await expect(header.getByRole("link", { name: "Tay Shofer — home" })).toBeVisible();
  for (const name of ["Work", "About", "Stack", "Contact"]) await expect(header.getByRole("link", { name, exact: true })).toBeVisible();
  await expect(header.getByRole("button", { name: "Accessibility settings" })).toBeVisible();
  await expect(header.getByRole("button", { name: /Switch to (dark|light) mode/ })).toBeVisible();
  await expect(header.getByRole("link", { name: "Get in touch" })).toHaveAttribute("href", "#contact");
  // English only (the owner's decision, 2026-10-13): no language switch, and nothing links to another language.
  await expect(page.getByRole("group", { name: /language/i })).toHaveCount(0);
  await expect(page.locator("a[hreflang], a[href='/he'], a[href^='/he/'], [data-lang-switch]")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /palette|search/i })).toHaveCount(0);
  // The assistant has its own floating launcher (chat.spec.ts), not a header button.
  await expect(header.getByRole("button", { name: /chat|ask|assistant/i })).toHaveCount(0);
  // Ctrl/⌘+K is the browser's again: nothing on the page claims it.
  for (const combo of ["Control+k", "Meta+k"]) { await page.keyboard.press(combo); await expect(page.locator("[role=dialog]")).toHaveCount(0); }
  // The restored chat endpoint validates before anything else: an empty body is refused, and no key reaches the page.
  expect((await page.request.post("/api/chat", { headers: { "x-real-ip": `chrome-${Date.now()}` }, data: {} })).status()).toBe(400);
  expect(await page.content()).not.toMatch(/GROQ|gsk_/);
});

test("light is the default; the dark theme is the visitor's choice and is remembered", async ({ browser }) => {
  const { ctx, page } = await open(browser, [1440, 900]);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe("rgb(243, 244, 246)");
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload(); await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await ctx.close();
});

test("a theme toggle shifts no layout", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => { (window as unknown as { __cls: number }).__cls = 0; new PerformanceObserver((l) => { for (const e of l.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) if (!e.hadRecentInput) (window as unknown as { __cls: number }).__cls += e.value; }).observe({ type: "layout-shift" }); });
  await page.evaluate(() => document.getElementById("about")!.scrollIntoView({ behavior: "instant" as ScrollBehavior }));
  await page.getByRole("button", { name: /Switch to (dark|light) mode/ }).click(); await page.waitForTimeout(400);
  expect(await page.evaluate(() => (window as unknown as { __cls: number }).__cls)).toBeLessThan(0.02);
});

const headerBg = (page: Page) => page.locator("header[data-site-nav]").evaluate((h) => getComputedStyle(h).backgroundColor);
const bgOf = (page: Page, id: string) => page.locator(`#${id}`).evaluate((e) => getComputedStyle(e).backgroundColor);
/** Puts the top of #id right under the header (plus `nudge` px), then waits for the next painted frame. */
async function under(page: Page, id: string, nudge = 0) {
  await page.evaluate(([id, nudge]) => { const nav = document.querySelector("header[data-site-nav]")!.getBoundingClientRect().height; const s = document.getElementById(id as string)!; scrollTo({ top: s.getBoundingClientRect().top + scrollY - nav + (nudge as number), behavior: "instant" as ScrollBehavior }); }, [id, nudge] as const);
  await page.screenshot({ clip: { x: 0, y: 0, width: 100, height: 40 } });
}
/** Contrast of every visible header control on what is behind it: link text at 4.5:1, an icon button's glyph at 3:1.
 *  The bar is translucent, so "behind it" is the bar's colour blended over the section beneath (`behind`); a control
 *  with a solid fill of its own (the "Get in touch" pill) is measured against that fill. */
const headerRatios = (page: Page, behind: string) => page.locator("header[data-site-nav]").evaluate((h, behind) => {
  // rgb()/rgba() in 0–255, or color(srgb r g b / a) in 0–1 (what color-mix() computes to).
  const rgba = (c: string) => { const v = c.match(/[\d.e-]+/g)!.map(Number), k = c.startsWith("color(") ? 255 : 1; return [v[0] * k, v[1] * k, v[2] * k, v.length > 3 ? v[3] : 1]; };
  const lumOf = ([r, g, b]: number[]) => { const f = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const [hr, hg, hb, ha] = rgba(getComputedStyle(h).backgroundColor), [sr, sg, sb] = rgba(behind);
  const bar = lumOf([ha * hr + (1 - ha) * sr, ha * hg + (1 - ha) * sg, ha * hb + (1 - ha) * sb]);
  const shown = (e: HTMLElement) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== "hidden"; };
  return [...h.querySelectorAll<HTMLElement>("a, button")].filter(shown).map((e) => {
    const fill = getComputedStyle(e).backgroundColor, solid = !/rgba\(.*,\s*0\)$/.test(fill) && fill !== "transparent";
    const glyph = e.tagName === "BUTTON" ? e.querySelector("svg") : null;
    const f = lumOf(rgba(getComputedStyle(glyph ?? e).color)), b = solid ? lumOf(rgba(fill)) : bar;
    return { t: (e.getAttribute("aria-label") || e.textContent || "").trim(), icon: !!glyph, r: (Math.max(f, b) + 0.05) / (Math.min(f, b) + 0.05) };
  });
}, behind);
const SECTIONS = ["work-poker", "work-aegis", "work-developeros", "work-gravity-flow", "more-work", "about", "skills", "approach", "contact"];

for (const theme of ["light", "dark"] as const) {
  test(`${theme}: the header is one neutral surface over every section — it never repaints, and its controls read on all of them`, async ({ browser }) => {
    const { ctx, page } = await open(browser, [1440, 900], { theme, motion: true });
    await page.evaluate(() => scrollTo({ top: 40, behavior: "instant" as ScrollBehavior })); await page.screenshot({ clip: { x: 0, y: 0, width: 100, height: 40 } });
    const surface = await headerBg(page);
    expect(surface, "translucent").toMatch(/(^rgba\(.*, |\/ )0\.8\d*\)$/);
    for (const id of SECTIONS) {
      await under(page, id, 4);
      expect(await headerBg(page), id).toBe(surface);
      expect(await page.locator("header[data-site-nav]").getAttribute("data-theme"), id).toBeNull();
      const ratios = await headerRatios(page, await bgOf(page, id));
      expect(ratios.filter((r) => r.icon).map((r) => r.t), id).toEqual(expect.arrayContaining(["Accessibility settings"]));
      for (const r of ratios) expect(r.r, `${id} ${r.t}`).toBeGreaterThanOrEqual(r.icon ? 3 : 4.5);
    }
    // Its one state: a hairline once the page has moved, faded in (box-shadow only, never `transition: all`).
    const tr = await page.locator("header[data-site-nav]").evaluate((h) => ({ p: getComputedStyle(h).transitionProperty, d: getComputedStyle(h).transitionDuration }));
    expect(tr).toEqual({ p: "box-shadow", d: "0.32s" });
    await ctx.close();
  });
}

test("reduced motion: the header's hairline appears without a transition", async ({ browser }) => {
  const { ctx, page } = await open(browser, [1440, 900]);                // the helper's default: prefers-reduced-motion
  expect(await page.locator("header[data-site-nav]").evaluate((h) => parseFloat(getComputedStyle(h).transitionDuration))).toBeLessThan(0.001);
  await ctx.close();
});

test("the current section is decided once, with hysteresis: down and back up the page, the underline never blanks or bounces", async ({ browser }) => {
  test.setTimeout(120_000);
  const { ctx, page } = await open(browser, [1440, 900]);
  await page.evaluate(() => { const w = window as unknown as { __act: string[] }; w.__act = [];
    const tick = () => { const a = document.querySelector<HTMLElement>("header[data-site-nav]")!.dataset.active ?? ""; if (w.__act.at(-1) !== a) w.__act.push(a); requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
  await page.mouse.move(720, 450);
  const end = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  while ((await page.evaluate(() => scrollY)) < end - 2) { await page.mouse.wheel(0, 90); await page.waitForTimeout(30); }
  await page.waitForTimeout(200);
  while ((await page.evaluate(() => scrollY)) > 0) { await page.mouse.wheel(0, -90); await page.waitForTimeout(30); }
  await page.waitForTimeout(200);
  const seq = await page.evaluate(() => (window as unknown as { __act: string[] }).__act);
  expect(seq).toEqual(["", "#work", "#about", "#skills", "#contact", "#skills", "#about", "#work", ""]);
  // Resting on a boundary and wobbling across it by less than the band changes nothing.
  for (const id of ["about", "skills"]) {
    const line = await page.evaluate((id) => { const s = document.getElementById(id)!; scrollTo({ top: s.getBoundingClientRect().top + scrollY - innerHeight * 0.4 - 40, behavior: "instant" as ScrollBehavior }); return s.id; }, id);
    await page.waitForTimeout(100);
    const before = await page.evaluate(() => document.querySelector<HTMLElement>("header[data-site-nav]")!.dataset.active);
    for (const dy of [20, -20, 25, -25, 20]) { await page.evaluate((dy) => scrollBy({ top: dy, behavior: "instant" as ScrollBehavior }), dy); await page.waitForTimeout(60); }
    expect(await page.evaluate(() => document.querySelector<HTMLElement>("header[data-site-nav]")!.dataset.active), line).toBe(before);
  }
  await ctx.close();
});

test("a jump from the nav makes that link current where it lands", async ({ browser }) => {
  const { ctx, page } = await open(browser, [1440, 900]);
  for (const [href, label] of [["#about", "About"], ["#contact", "Contact"], ["#work", "Work"], ["#skills", "Stack"]] as const) {
    const link = page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: label, exact: true });
    expect(await link.getAttribute("href")).toBe(href);
    await link.click();
    await expect(link).toHaveAttribute("aria-current", "true");
  }
  await ctx.close();
});

test("phones, both themes: the header's theme and menu buttons read on every section they pass over", async ({ browser }) => {
  for (const theme of ["light", "dark"] as const) {
    const { ctx, page } = await open(browser, [390, 844], { theme });
    for (const id of ["hero", ...SECTIONS]) {
      if (id === "hero") { await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" as ScrollBehavior })); await page.screenshot({ clip: { x: 0, y: 0, width: 100, height: 40 } }); }
      else await under(page, id, 4);
      const behind = id === "hero" ? await page.evaluate(() => getComputedStyle(document.body).backgroundColor) : await bgOf(page, id);
      const ratios = await headerRatios(page, behind);
      expect(ratios.filter((r) => r.icon).length, `${theme} ${id}`).toBe(2);                 // theme and menu
      for (const r of ratios) expect(r.r, `${theme} ${id} ${r.t}`).toBeGreaterThanOrEqual(r.icon ? 3 : 4.5);
    }
    await ctx.close();
  }
});

for (const theme of ["light", "dark"] as const) {
  test(`phones, ${theme}: during real touch swipes the header keeps one surface on every frame, and the current section only moves forward then back`, async ({ browser }) => {
    test.setTimeout(120_000);
    const { ctx, page } = await open(browser, [390, 844], { theme });
    await page.evaluate(() => {
      const w = window as unknown as { __frames: { y: number; bg: string; act: string }[] }; w.__frames = [];
      const tick = () => { const h = document.querySelector<HTMLElement>("header[data-site-nav]")!; w.__frames.push({ y: scrollY, bg: getComputedStyle(h).backgroundColor, act: h.dataset.active ?? "" }); requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    });
    const cdp = await ctx.newCDPSession(page);
    const touch = (type: "touchStart" | "touchMove" | "touchEnd", y = 0) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" ? [] : [{ x: 300, y }] });
    const swipe = async (dy: number) => {
      const y0 = dy > 0 ? 730 : 130, n = Math.round(Math.abs(dy) / 28);
      await touch("touchStart", y0);
      for (let i = 1; i <= n; i++) { await touch("touchMove", y0 - (dy * i) / n); await page.waitForTimeout(16); }
      await page.waitForTimeout(60); await touch("touchEnd");
    };
    const end = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    for (let i = 0; i < 60 && (await page.evaluate(() => scrollY)) < end - 40; i++) { await swipe(560); await page.waitForTimeout(100); }
    await page.waitForTimeout(300);
    for (let i = 0; i < 60 && (await page.evaluate(() => scrollY)) > 0; i++) { await swipe(-560); await page.waitForTimeout(60); }
    await page.waitForTimeout(300);
    const frames = await page.evaluate(() => (window as unknown as { __frames: { y: number; bg: string; act: string }[] }).__frames).then((f) => f.filter((x) => x.y > 8));
    expect(frames.length, `${theme}: frames`).toBeGreaterThan(100);
    expect(new Set(frames.map((f) => f.bg)).size, `${theme}: header colours seen`).toBe(1);
    const changes = frames.map((f) => f.act).filter((a, i, all) => i === 0 || a !== all[i - 1]);
    expect(changes, `${theme}: current section`).toEqual(["", "#work", "#about", "#skills", "#contact", "#skills", "#about", "#work", ""]);
    await ctx.close();
  });
}

test("desktop: after a jump to any chapter, its Case study button is whole in the first screen, below the header", async ({ browser }) => {
  for (const vp of [[1920, 1080], [1440, 900], [1366, 768], [1280, 720], [1280, 700], [1024, 768]] as const) {
    const { ctx, page } = await open(browser, vp);
    for (const id of CHAPTERS) {
      await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }));
      await page.evaluate((id) => { location.hash = `#work-${id}`; }, id);
      await expect.poll(() => page.evaluate((id) => Math.abs(document.getElementById(`work-${id}`)!.getBoundingClientRect().top - document.querySelector("header[data-site-nav]")!.getBoundingClientRect().bottom), id)).toBeLessThan(1);
      const [top, bottom, nav] = await page.evaluate((id) => { const b = document.querySelector(`#work-${id} .case-study-trigger`)!.getBoundingClientRect(); return [b.top, b.bottom, document.querySelector("header[data-site-nav]")!.getBoundingClientRect().bottom]; }, id);
      expect(top, `${vp[0]}×${vp[1]} ${id}`).toBeGreaterThanOrEqual(nav);
      expect(bottom, `${vp[0]}×${vp[1]} ${id}: ends at ${Math.round(bottom)}`).toBeLessThanOrEqual(vp[1]);
    }
    await ctx.close();
  }
});

test("phones: theme in the header, the rest in the menu sheet; Escape and the close button return focus to the menu button", async ({ browser }) => {
  const { ctx, page } = await open(browser, [390, 844]);
  const menu = page.getByRole("button", { name: "Open menu" });
  await expect(page.locator("header").getByRole("button", { name: /Switch to (dark|light) mode/ })).toBeVisible();
  await menu.click();
  const sheet = page.getByRole("dialog", { name: "Navigation" });
  await expect(sheet).toBeVisible();
  await expect(sheet.getByRole("button", { name: "Close menu" })).toBeFocused();
  for (const name of ["Work", "About", "Stack", "Contact"]) await expect(sheet.getByRole("link", { name: new RegExp(`^${name}`) })).toBeVisible();
  await expect(sheet.getByRole("link", { name: "Get in touch" })).toBeVisible();
  await expect(sheet.getByRole("button", { name: "Accessibility settings" })).toBeVisible();
  // English only: the sheet has no language row or switch.
  await expect(sheet.getByRole("group", { name: /language/i })).toHaveCount(0);
  await expect(sheet).not.toContainText(/Language|English|עברית/);
  // The focus trap keeps Tab inside the sheet.
  for (let i = 0; i < 12; i++) { await page.keyboard.press("Tab"); expect(await sheet.evaluate((s) => s.contains(document.activeElement))).toBe(true); }
  await page.keyboard.press("Escape"); await expect(sheet).toBeHidden(); await expect(menu).toBeFocused();
  await menu.click(); await sheet.getByRole("button", { name: "Close menu" }).click(); await expect(sheet).toBeHidden(); await expect(menu).toBeFocused();
  await ctx.close();
});

test("phones: picking a section in the menu closes it, lands there, and leaves the page scrollable", async ({ browser }) => {
  const { ctx, page } = await open(browser, [390, 844]);
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("dialog").getByRole("link", { name: /^Stack/ }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect.poll(() => page.locator("#skills").evaluate((e) => Math.round(e.getBoundingClientRect().top)), { timeout: 5000 }).toBeLessThan(120);
  expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toMatch(/hidden/);
  await ctx.close();
});

test("844×390 landscape: the menu sheet scrolls, so its last control is reachable", async ({ browser }) => {
  const { ctx, page } = await open(browser, [844, 390]);
  await page.getByRole("button", { name: "Open menu" }).click();
  const last = page.getByRole("dialog").getByRole("link", { name: "Get in touch" });
  await last.scrollIntoViewIfNeeded(); await expect(last).toBeInViewport();
  await ctx.close();
});

type Stop = { name: string; ring: boolean; obscured: boolean };
async function tabThrough(page: Page, max = 90): Promise<Stop[]> {
  const stops: Stop[] = [];
  for (let i = 0; i < max; i++) {
    await page.keyboard.press("Tab");
    const s = await page.evaluate(() => {
      const e = document.activeElement as HTMLElement | null; if (!e || e === document.body) return null;
      const cs = getComputedStyle(e), r = e.getBoundingClientRect(), nav = document.querySelector("header[data-site-nav]")!;
      const ringed = cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 2;
      // Radios and checkboxes are visually hidden; their visible part (the next sibling) carries the ring.
      const sib = e.matches("input") ? getComputedStyle(e.nextElementSibling!) : null;
      return { name: (e.getAttribute("aria-label") || e.textContent || (e as HTMLInputElement).value || "").trim().replace(/\s+/g, " ").slice(0, 40),
        ring: ringed || (!!sib && sib.outlineStyle !== "none" && parseFloat(sib.outlineWidth) >= 2),
        obscured: !nav.contains(e) && e.getAttribute("href") !== "#main" && r.top < nav.getBoundingClientRect().bottom - 1 };
    });
    if (!s) break;
    if (stops.length && stops[0].name === s.name && i > 5) break;
    stops.push(s);
  }
  return stops;
}

for (const vp of [[1440, 900], [390, 844]] as const) {
  test(`${vp[0]}×${vp[1]}: Tab runs skip link → header → hero → the four chapters → contact → footer, every stop ringed and unobscured`, async ({ browser }) => {
    const { ctx, page } = await open(browser, vp);
    const stops = await tabThrough(page);
    expect(stops[0].name).toBe("Skip to content");
    const at = (re: RegExp) => stops.findIndex((s) => re.test(s.name));
    const order = [at(/^See the work/), at(/^T Poker/), at(/^Case study/), at(/^Email me/), at(/^Download résumé/), at(/^Back to top/)];
    for (const i of order) expect(i, JSON.stringify(stops.map((s) => s.name))).toBeGreaterThan(0);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    for (const s of stops) { expect(s.ring, `focus ring on ${s.name}`).toBe(true); expect(s.obscured, `${s.name} under the header`).toBe(false); }
    await ctx.close();
  });
}

test("the focus ring is the solid accent: ink-blue on paper, light blue on a dark plate", async ({ page }) => {
  await page.goto("/");
  const hero = page.getByRole("link", { name: "See the work" }); await hero.focus();
  expect(await hero.evaluate((e) => getComputedStyle(e).outlineColor)).toBe("rgb(26, 79, 224)");
  const store = page.locator("#work-poker a[href*='apps.apple.com']"); await store.focus();
  expect(await store.evaluate((e) => getComputedStyle(e).outlineColor)).toBe("rgb(143, 180, 255)");
});

test("every external link opens safely and says so", async ({ page }) => {
  await page.goto("/");
  const links = await page.locator('a[target="_blank"]').evaluateAll((as) => as.map((a) => ({ rel: a.getAttribute("rel") ?? "", text: a.textContent ?? "", href: a.getAttribute("href") })));
  expect(links.length).toBeGreaterThan(8);
  for (const l of links) { expect(l.rel, l.href!).toMatch(/noopener/); expect(l.rel).toMatch(/noreferrer/); expect(l.text, l.href!).toMatch(/opens in a new tab/); }
  expect(await page.locator("main").textContent()).not.toContain("↗");
});

test("every in-page link points at an element that exists", async ({ page }) => {
  await page.goto("/");
  const missing = await page.evaluate(() => [...document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')].map((a) => a.getAttribute("href")!).filter((h) => h.length > 1 && !document.getElementById(h.slice(1))));
  expect(missing).toEqual([]);
});
