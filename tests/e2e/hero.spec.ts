// tests/e2e/hero.spec.ts — the first screen (M10): headline, range, and the four plates as navigation.
import { test, expect } from "playwright/test";
import { open, PHONES, CHAPTERS } from "../support/page";

test("the plates link the four products to their chapters, each with its verified state", async ({ page }) => {
  await page.goto("/");
  const plates = page.getByRole("navigation", { name: "Flagship projects" }).getByRole("link");
  await expect(plates).toHaveCount(4);
  expect(await plates.evaluateAll((as) => as.map((a) => a.getAttribute("href")))).toEqual(CHAPTERS.map((c) => `#work-${c}`));
  const text = (await plates.allTextContents()).map((t) => t.replace(/\s+/g, " ").trim());
  expect(text).toEqual(["T PokerLive on iOS & Android", "AegisSource on GitHub", "DeveloperOSReleased · v1.0.0", "GRAVITY FLOWRelease candidate"]);
  expect(text.join(" ")).not.toMatch(/open source/i);
});

const tiles = (page: import("playwright/test").Page) => page.locator(".plates .tile").evaluateAll((ts) => ts.map((t) => {
  const r = t.getBoundingClientRect(), lines = (e: Element) => { const g = document.createRange(); g.selectNodeContents(e); return new Set([...g.getClientRects()].map((x) => Math.round(x.top))).size; };
  const cap = t.querySelector(".tile__cap > span:last-child")!;
  return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), bottom: r.bottom,
    nameLines: lines(cap.querySelector("b")!), stateLines: lines(cap.querySelector("b + span")!) };
}));

test("from 1240px: one row, T Poker (the shipped product) widest, every plate wide enough to read, captions on one line", async ({ browser }) => {
  for (const vp of [[1240, 800], [1280, 700], [1280, 720], [1440, 900], [1920, 1080]] as const) {
    const { ctx, page } = await open(browser, vp);
    const t = await tiles(page);
    expect(new Set(t.map((x) => x.y)).size, `${vp[0]}: one row`).toBe(1);
    const w = t.map((x) => x.w);
    expect(w[0], `${vp[0]}: ${w}`).toBe(Math.max(...w));
    expect(new Set(w).size, `${vp[0]}: ${w}`).toBe(4);
    expect(Math.min(...w), `${vp[0]}: narrowest plate ${Math.min(...w)}`).toBeGreaterThanOrEqual(190);
    expect(Math.min(w[1], w[2]), `${vp[0]}: the two windows' plates`).toBeGreaterThanOrEqual(260);
    for (const x of t) { expect(x.nameLines, `${vp[0]} name`).toBe(1); expect(x.stateLines, `${vp[0]} state`).toBe(1); }
    await ctx.close();
  }
});

test("640–1239px: an intentional 2×2 of equal landscape plates (not four squeezed into a row), captions on one line", async ({ browser }) => {
  for (const vp of [[1024, 768], [1180, 820], [768, 1024], [1236, 900]] as const) {
    const { ctx, page } = await open(browser, vp);
    const t = await tiles(page);
    expect(new Set(t.map((x) => x.x)).size, `${vp[0]}: two columns`).toBe(2);
    expect(new Set(t.map((x) => x.y)).size, `${vp[0]}: two rows`).toBe(2);
    expect(new Set(t.map((x) => x.w)).size, `${vp[0]}: equal widths`).toBe(1);
    for (const x of t) { expect(x.w / x.h, `${vp[0]}: landscape`).toBeGreaterThan(1.2); expect(x.nameLines).toBe(1); expect(x.stateLines).toBe(1); }
    // The first row is whole in the first screen at 1024×768.
    if (vp[0] === 1024) expect(t[0].bottom).toBeLessThanOrEqual(vp[1]);
    await ctx.close();
  }
});

test("a short landscape screen sets the copy and the 2×2 side by side, all of it inside the first screen", async ({ browser }) => {
  for (const vp of [[844, 390], [932, 430], [740, 360]] as const) {
    const { ctx, page } = await open(browser, vp);
    const copy = await page.locator(".hero__copy").boundingBox(), cta = await page.locator("[data-hero-ctas]").boundingBox();
    const t = await tiles(page);
    expect(t.every((x) => x.x > copy!.x + copy!.width - 1), `${vp[0]}: plates beside the copy`).toBe(true);
    expect(cta!.y + cta!.height, `${vp[0]}: the action`).toBeLessThanOrEqual(vp[1]);
    for (const x of t) expect(x.bottom, `${vp[0]}: plate bottom`).toBeLessThanOrEqual(vp[1]);
    expect(new Set(t.map((x) => x.x)).size).toBe(2); expect(new Set(t.map((x) => x.y)).size).toBe(2);
    await ctx.close();
  }
});

test("the plates' windows show their captures whole across: fitted to the window's width, never cropped sideways", async ({ browser }) => {
  for (const vp of [[1440, 900], [1280, 700], [1024, 768], [844, 390], [390, 844]] as const) {
    const { ctx, page } = await open(browser, vp);
    const r = await page.locator(".plates .tile__win").evaluateAll((ws) => ws.map((w) => {
      const img = w.querySelector("img") as HTMLImageElement, ir = img.getBoundingClientRect(), wr = w.getBoundingClientRect();
      return { left: ir.left - wr.left, right: wr.right - ir.right, aspect: ir.width / ir.height, natural: img.naturalWidth / img.naturalHeight };
    }));
    expect(r).toHaveLength(2);
    for (const x of r) {
      expect(Math.abs(x.left), `${vp[0]} left`).toBeLessThanOrEqual(1.5);
      expect(Math.abs(x.right), `${vp[0]} right`).toBeLessThanOrEqual(1.5);
      expect(Math.abs(x.aspect - x.natural) / x.natural, `${vp[0]} aspect`).toBeLessThan(0.02);
    }
    await ctx.close();
  }
});

test("desktop: the plates end where the hero ends — the first screen's bottom edge, or the hero's cap on tall screens", async ({ browser }) => {
  for (const vp of [[1440, 900], [1280, 720], [1280, 700], [1920, 1080], [2560, 1440]] as const) {
    const { ctx, page } = await open(browser, vp);
    const [plates, hero] = await page.evaluate(() => [".plates", "#hero"].map((s) => Math.round(document.querySelector(s)!.getBoundingClientRect().bottom)));
    expect(Math.abs(plates - hero), `${vp[0]}×${vp[1]}: plates end at ${plates}, the hero at ${hero}`).toBeLessThanOrEqual(2);
    // The hero is the first screen up to its cap (60rem); past that the page simply continues below it.
    expect(Math.abs(hero - Math.min(vp[1], 960)), `${vp[0]}×${vp[1]}: hero ends at ${hero}`).toBeLessThanOrEqual(2);
    // The captions never fall outside their tile.
    const out = await page.locator(".plates .tile").evaluateAll((ts) => ts.filter((t) => { const c = t.querySelector(".tile__cap")!.getBoundingClientRect(), r = t.getBoundingClientRect(); return c.bottom > r.bottom + 0.5 || c.top < r.top - 0.5; }).length);
    expect(out, `${vp[0]}×${vp[1]}`).toBe(0);
    await ctx.close();
  }
});

for (const vp of PHONES) {
  test(`${vp[0]}×${vp[1]}: the action comes before the mosaic, inside the first screen, with room between them`, async ({ browser }) => {
    const { ctx, page } = await open(browser, vp);
    const cta = await page.locator("[data-hero-ctas]").boundingBox(), plates = await page.locator(".plates").boundingBox();
    expect(cta!.y + cta!.height).toBeLessThanOrEqual(vp[1]);
    expect(plates!.y - (cta!.y + cta!.height)).toBeGreaterThanOrEqual(16);
    // A 2×2 mosaic: two columns, two rows, equal tiles.
    const tiles = await page.locator(".plates .tile").evaluateAll((ts) => ts.map((t) => { const r = t.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width)]; }));
    expect(new Set(tiles.map((t) => t[0])).size).toBe(2); expect(new Set(tiles.map((t) => t[1])).size).toBe(2); expect(new Set(tiles.map((t) => t[2])).size).toBe(1);
    // The headline sets in two lines.
    expect(await page.locator("#hero-title").evaluate((h) => { const r = document.createRange(); r.selectNodeContents(h); return new Set([...r.getClientRects()].map((x) => Math.round(x.top))).size; })).toBe(2);
    await ctx.close();
  });
}

test("following a plate lands its chapter right under the header", async ({ browser }) => {
  for (const vp of [[1440, 900], [390, 844]] as const) {
    const { ctx, page } = await open(browser, vp);
    for (const id of CHAPTERS) {
      await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }));
      await page.locator(`.plates a[href="#work-${id}"]`).click();
      await expect.poll(() => page.evaluate((id) => { const nav = document.querySelector("header[data-site-nav]")!.getBoundingClientRect().bottom;
        return Math.abs(document.getElementById(`work-${id}`)!.getBoundingClientRect().top - nav); }, id), { message: `${vp[0]} ${id}` }).toBeLessThan(1);
    }
    await ctx.close();
  }
});

test("the hero's first-screen images load eagerly with real dimensions; only the two largest-paint candidates jump the queue", async ({ page }) => {
  await page.goto("/");
  const imgs = await page.locator(".plates img").evaluateAll((is) => is.map((i) => ({ loading: i.getAttribute("loading"), fp: i.getAttribute("fetchpriority"), w: i.getAttribute("width"), h: i.getAttribute("height"),
    tile: i.closest(".tile")!.className })));
  // Lighthouse's LCP element: Aegis's window on wide screens, DeveloperOS's window on phones.
  expect(imgs.filter((i) => i.fp === "high").map((i) => i.tile.split(" ")[1])).toEqual(["tile--aegis", "tile--dos"]);
  expect(imgs.length).toBe(6);                                         // five captures and T Poker's icon
  for (const i of imgs) { expect(i.loading).toBe("eager"); expect(Number(i.w)).toBeGreaterThan(0); expect(Number(i.h)).toBeGreaterThan(0); }
  // AVIF is offered first.
  expect(await page.locator(".plates picture source").first().getAttribute("type")).toBe("image/avif");
});
