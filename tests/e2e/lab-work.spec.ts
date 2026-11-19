// tests/e2e/lab-work.spec.ts — the Work slice in the cinematic language (PROTOTYPE, rounds 5–6; D1 reopened by Tay,
// 2026-11-18; D2 not reopened, so no WebGL). Branch proto/hero-a-cinematic only, never merged. main's guards still run
// against /, unchanged.
import { test, expect, type Browser, type BrowserContextOptions, type Page } from "playwright/test";
import zlib from "node:zlib";
import { createHash } from "node:crypto";
import { COUNT_WEBGL } from "../support/page";
import { privateRepoLeaks } from "../support/private-repo";

const ROUTE = "/lab/work";
const AXE = require.resolve("axe-core/axe.min.js");
const NAMES = ["T Poker", "Aegis", "DeveloperOS", "GRAVITY FLOW"];
/** About's three links (P3.3): the live site's own targets, and each one's accessible name. */
const ABOUT_LINKS = [
  ["/resume/Tay-Shofer-Software-Engineer-Resume.pdf", "Download résumé (PDF · two pages, 79 KB)"],
  ["https://github.com/taysh123", "GitHub (opens in a new tab)"],
  ["https://www.linkedin.com/in/tay-shofer-1b2b54287", "LinkedIn (opens in a new tab)"],
] as const;

async function at(browser: Browser, [w, h]: readonly [number, number], opts: BrowserContextOptions = {}) {
  const mobile = w < 900;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile, ...opts });
  await ctx.addInitScript(COUNT_WEBGL);
  const page = await ctx.newPage();
  const errors: string[] = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(ROUTE, { waitUntil: "networkidle" });
  return { ctx, page, errors };
}
const panel = (page: Page, id: string) => page.locator(`[data-panel="${id}"]`);
const stage = (page: Page, id: string) => panel(page, id).locator(".wk__stage");
const lift = (page: Page, id: string) => stage(page, id).evaluate((e) => { const cs = getComputedStyle(e); return { translate: cs.translate, halo: cs.boxShadow, edge: cs.borderTopColor }; });
/** Each slide of a panel's carousel: its offset from the front, whether it is drawn, and its computed placement. */
const slides = (page: Page, id: string) => panel(page, id).locator(".wk__slide").evaluateAll((ss) => ss.map((s) => {
  const cs = getComputedStyle(s), dim = getComputedStyle(s.querySelector(".wk__device")!, "::after");
  return { offset: s.getAttribute("data-offset"), shown: s.hasAttribute("data-shown"), seen: cs.visibility === "visible", placed: cs.getPropertyValue("transform"), dim: dim.opacity, img: !!s.querySelector("img") };
}));
const selected = (page: Page, id: string) => panel(page, id).locator('[role="tab"]').evaluateAll((ts) => ts.findIndex((t) => t.getAttribute("aria-selected") === "true"));
const scrollAll = async (page: Page) => { for (const img of await page.locator(".wk__stage").all()) { await img.scrollIntoViewIfNeeded(); await page.waitForTimeout(120); } };

test("budget: first-load JS ≤ 205.7 KB gzip and HTML ≤ 568 KB; the carousel is the only client code; no canvas, no WebGL", async ({ request, baseURL, page }) => {
  const html = await (await request.get(ROUTE)).text();
  const srcs = [...new Set([...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]))];
  const bodies = await Promise.all(srcs.map(async (s) => (await request.get(new URL(s, baseURL).toString())).body()));
  const gz = bodies.reduce((a, b) => a + zlib.gzipSync(b).length, 0);
  const own = bodies.filter((b) => b.toString().includes("wk__reel"));
  console.log(`/lab/work JS ${(gz / 1024).toFixed(2)} KiB over ${srcs.length} scripts (the carousel's own: ${(own.reduce((a, b) => a + zlib.gzipSync(b).length, 0) / 1024).toFixed(2)} KiB), HTML ${(Buffer.byteLength(html) / 1024).toFixed(2)} KB`);
  expect(gz / 1024).toBeLessThanOrEqual(205.7);
  expect(Buffer.byteLength(html) / 1024).toBeLessThanOrEqual(568);
  expect(own).toHaveLength(1);
  // The project data stays on the server: no script carries a tagline or the panel markup.
  for (const b of bodies) { expect(b.toString()).not.toContain("A poker study platform"); expect(b.toString()).not.toContain("wk__panel"); }
  await page.addInitScript(COUNT_WEBGL);
  await page.goto(ROUTE);
  await expect(page.locator("canvas")).toHaveCount(0);
  expect(await page.evaluate(() => (window as unknown as { __gl: number }).__gl)).toBe(0);
});

test("never indexed, and no private repository leaks into what the browser gets", async ({ request }) => {
  const html = await (await request.get(ROUTE, { headers: { Accept: "text/html" } })).text();
  expect(html).toMatch(/<meta name="robots" content="noindex, nofollow, nocache"\/>/);
  expect(html).not.toMatch(/rel="canonical"/);
  expect(privateRepoLeaks(html)).toEqual([]);
  expect(await (await request.get("/")).text()).not.toMatch(/href="\/lab/);
});

// Tailwind scans app/, data/, tests/ and scripts/ for class-name candidates, comments and object keys included, so a word
// in a lab file can add a rule to the live page's stylesheet. It happened twice on this branch (a utility name in a test
// comment, then an object key in this file). This pins /'s stylesheets to origin/main's bytes (a7a89fd): any leak fails
// here. (If main's CSS changes, rebase this branch and re-pin.)
test("the live page's stylesheets are byte-identical to origin/main's: nothing from the lab leaks into /", async ({ request, baseURL }) => {
  const html = await (await request.get("/")).text();
  const css = [...new Set([...html.matchAll(/<link[^>]+href="([^"]+\.css)"/g)].map((m) => m[1]))];
  const digests = await Promise.all(css.map(async (u) => createHash("sha256").update(await (await request.get(new URL(u, baseURL).toString())).body()).digest("hex")));
  expect(digests.sort()).toEqual([
    "4b84cc35188533f9c889b626444fdf124c1874c29ed309e39f82a6a82064a88c",   // 31,805 bytes
    "868e8b988b371b4cdc0b6ec71578c0c09fa9b67ab41b41245f4374b0f6197f3d",   // 44,530 bytes: the Tailwind sheet
  ]);
});

test("without JavaScript: every word and link, and each project's first real capture alone, with no dead controls", async ({ browser }) => {
  const { ctx, page } = await at(browser, [1440, 900], { javaScriptEnabled: false });
  await expect(page.locator(".wk__name")).toHaveText(NAMES);
  for (const [i, el] of (await page.locator(".wk__panel").all()).entries()) {
    await expect(el.locator(".wk__line")).not.toBeEmpty();
    await expect(el.locator(".wk__status")).toContainText("Status");
    expect(await el.locator(".wk__chips li").count(), NAMES[i]).toBeGreaterThanOrEqual(2);
    await expect(el.locator("img")).toHaveCount(1);                                   // the first capture only
    await expect(el.locator("img")).toHaveAttribute("alt", /.{20,}/);
    await expect(el.locator("[data-more]")).toHaveAttribute("href", /^\/#work-/);
  }
  expect(await page.locator(".wk__panel img").evaluateAll((is) => is.map((i) => (i as HTMLImageElement).src.split("/").pop()!.replace(/-\d+\.\w+$/, ""))))
    .toEqual(["poker-home", "aegis-alerts", "dos-search", "gf-gameplay"]);
  // The carousels' controls would do nothing without script, so they are not shown.
  for (const c of await page.locator(".wk__controls").all()) expect(await c.evaluate((e) => getComputedStyle(e).visibility)).toBe("hidden");
  expect(await page.locator("[data-primary]").evaluateAll((as) => as.map((a) => a.getAttribute("href")))).toEqual([
    "https://app.tpoker.app/", "https://github.com/taysh123/aegis", "https://github.com/taysh123/DeveloperOS"]);
  await expect(page.locator("[data-private-repo]")).toHaveCount(2);
  // Every first capture arrives without script once near the viewport (native lazy loading; scrolled from outside).
  await scrollAll(page);
  await expect.poll(() => page.locator(".wk img").evaluateAll((is) => is.every((i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0)), { timeout: 15000 }).toBe(true);
  for (const sel of [".wk__eyebrow", ".wk__title", ".wk__lede"]) expect(await page.locator(sel).evaluate((e) => getComputedStyle(e).opacity), sel).toBe("1");
  await ctx.close();
});

test("captures: the page's first is eager and high priority; every other capture is lazy and waits until it is near", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const fetched: string[] = [];
  page.on("request", (r) => { if (/\/work\/[\w-]+-\d+\.(avif|webp)$/.test(r.url())) fetched.push(r.url().split("/").pop()!); });
  // Headless Chromium starts a lazy image well before it nears the viewport (its margin covers this whole page), so the
  // deferral is shown on the same markup pushed 6000px down: the lazy captures must wait for the scroll.
  await page.route(ROUTE, async (r) => { const res = await r.fetch(); await r.fulfill({ response: res, body: (await res.text()).replace("</head>", "<style>.wk__head{padding-top:6000px}</style></head>") }); });
  await page.goto(ROUTE, { waitUntil: "networkidle" });
  const attrs = await page.locator(".wk img").evaluateAll((is) => is.map((i) => [i.getAttribute("loading"), i.getAttribute("fetchpriority")]));
  expect(attrs[0]).toEqual(["eager", "high"]);
  for (const a of attrs.slice(1)) expect(a).toEqual(["lazy", null]);
  expect(fetched.some((f) => f.startsWith("poker-home")), fetched.join(", ")).toBe(true);                     // eager: fetched anyway
  expect(fetched.filter((f) => /^(poker-live|poker-settle|poker-podium|poker-stats|aegis-alerts|hero-aegis|dos-search|dos-learning|dos-career|dos-dashboard|gf-gameplay|gf-boss|gf-gravity-run|gf-cosmetics|gf-win)-/.test(f)), "lazy, far away").toEqual([]);
  await panel(page, "gravity-flow").scrollIntoViewIfNeeded();
  await expect.poll(() => fetched.some((f) => f.startsWith("gf-gameplay"))).toBe(true);
  await ctx.close();
});

test("lazy at any count: a carousel mounts only the front capture and its two neighbours; the rest load only when they come next to the front", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });
  const page = await ctx.newPage();
  const fetched: string[] = [];
  page.on("request", (r) => { if (/\/work\/[\w-]+-\d+\.(avif|webp)$/.test(r.url())) fetched.push(r.url().split("/").pop()!); });
  await page.goto(ROUTE, { waitUntil: "networkidle" });
  await scrollAll(page);
  await page.waitForLoadState("networkidle");
  const mounted = (id: string) => panel(page, id).locator(".wk__slide").evaluateAll((ss) => ss.map((s) => !!s.querySelector("img")));
  // Circular: the front (0), the next (1) and the last (the left neighbour).
  expect(await mounted("poker")).toEqual([true, true, false, false, true]);
  expect(await mounted("aegis")).toEqual([true, true]);
  expect(await mounted("developeros")).toEqual([true, true, false, true]);
  expect(await mounted("gravity-flow")).toEqual([true, true, false, false, true]);
  const away = ["poker-settle", "poker-podium", "dos-career", "gf-gravity-run", "gf-cosmetics"];
  expect(fetched.filter((f) => away.some((n) => f.startsWith(`${n}-`))), "two steps from the front: never fetched").toEqual([]);
  await panel(page, "poker").getByRole("button", { name: "Next capture" }).click();
  await expect.poll(() => fetched.some((f) => f.startsWith("poker-settle-"))).toBe(true);   // now beside the front
  expect(fetched.some((f) => f.startsWith("poker-podium-"))).toBe(false);                    // still two away
  await ctx.close();
});

test("mixed shapes never shift the page: every track holds its tallest capture's box from the first paint, with or without JS, through every move", async ({ browser }) => {
  const heights = (page: Page) => page.locator(".wk__track").evaluateAll((ts) => ts.map((t) => Math.round(t.getBoundingClientRect().height * 10) / 10));
  for (const vp of [[1440, 900], [390, 844]] as const) {
    const off = await at(browser, vp, { javaScriptEnabled: false });
    const still = await heights(off.page);
    await off.ctx.close();
    const ctx = await browser.newContext({ viewport: { width: vp[0], height: vp[1] }, isMobile: vp[0] < 900, hasTouch: vp[0] < 900, reducedMotion: "no-preference" });
    // Shifts are split by where they happen. The site's own chat launcher (components/chat, shared with /) folds its
    // label as the page scrolls and unfolds it at the top: about 0.0076 here, the same on the build before this change
    // (session 11, measured). The slice's own boxes must not move at all.
    // Locally the carousels hydrate before the first paint, which would hide a hydration shift (measured: with the box
    // reservation removed, the Aegis track grows 89 → 281px at 89 ms, first paint at 100 ms, CLS 0). So the scripts are
    // held back 1.2 s, as on a slow phone, and the page opens at Aegis, the mixed-shape gallery, in view. Red/green: with
    // the reservation removed this reads 0.064 at Aegis (0.068 at DeveloperOS, pushed down by Aegis).
    await ctx.route(/\/_next\/static\/chunks\/.*\.js$/, async (r) => { await new Promise((res) => setTimeout(res, 1200)); await r.continue(); });
    await ctx.addInitScript(() => {
      const w = window as unknown as { __wk: number; __other: number }; w.__wk = 0; w.__other = 0;
      new PerformanceObserver((l) => l.getEntries().forEach((e) => {
        const s = e as PerformanceEntry & { value: number; hadRecentInput: boolean; sources?: { node?: Node | null }[] };
        if (s.hadRecentInput) return;
        const ours = !s.sources?.length || s.sources.some((x) => !x.node || (x.node as Element).closest?.(".wk"));
        if (ours) w.__wk += s.value; else w.__other += s.value;
      })).observe({ type: "layout-shift", buffered: true });
    });
    const page = await ctx.newPage();
    await page.goto(`${ROUTE}#wk-aegis`, { waitUntil: "networkidle" });
    await expect(page.locator(".wk__reel[data-ready]")).toHaveCount(4);   // hydrated, after the first paint
    await page.waitForTimeout(300);
    await scrollAll(page);
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(500);
    const cls = await page.evaluate(() => { const w = window as unknown as { __wk: number; __other: number }; return { wk: w.__wk, other: w.__other }; });
    console.log(`CLS ${vp[0]}: the slice ${cls.wk}, the site's chat launcher ${cls.other.toFixed(4)}`);
    expect(cls.wk, `${vp[0]}: CLS inside the slice through load, hydration and every capture arriving`).toBe(0);
    // Within a pixel: an empty slide reserves its box from the largest encode's exact ratio (900 × 506), while a loaded
    // smaller one keeps its own whole-pixel size (600 × 337), 0.27px shorter at 1440 (measured). Sub-pixel, and the same for
    // every capture since round 6; the slice's CLS above stays 0.
    const near = (a: number[], b: number[]) => a.every((x, j) => Math.abs(x - b[j]) < 1);
    expect(near(await heights(page), still), `${vp[0]}: hydrated ${await heights(page)} = without JS ${still}`).toBe(true);
    for (const [i, id] of ["poker", "aegis", "developeros", "gravity-flow"].entries()) {
      const n = await panel(page, id).locator('[role="tab"]').count();
      for (let k = 1; k <= n; k++) {
        await panel(page, id).getByRole("button", { name: "Next capture" }).click();
        expect(Math.abs((await heights(page))[i] - still[i]), `${vp[0]} ${id}, step ${k}`).toBeLessThan(1);
      }
    }
    // Aegis's track is its board's height (900 × 506), not the alert row's in front of it.
    const aegis = await panel(page, "aegis").locator(".wk__slide").first().evaluate((s) => s.getBoundingClientRect().width);
    expect(Math.abs(still[1] - ((aegis - 2) * 506) / 900 - 2), `${vp[0]}: Aegis holds the board's box`).toBeLessThan(1);
    await ctx.close();
  }
});

test("the coverflow: the front capture flat and whole, its neighbours turned in 3D, smaller and dimmed", async ({ browser }) => {
  const { ctx, page, errors } = await at(browser, [1440, 900], { reducedMotion: "no-preference" });
  await expect.poll(async () => (await slides(page, "poker")).filter((s) => s.shown && s.img).length).toBe(3);
  const s = await slides(page, "poker");
  const [front, right, left] = [s[0], s[1], s[4]];
  expect(s.map((x) => x.offset)).toEqual(["0", "1", "2", "-2", "-1"]);
  expect(front.placed).toBe("none");
  expect(front.dim).toBe("0");
  for (const side of [right, left]) {
    expect(side.placed, "a 3D turn").toMatch(/^matrix3d\(/);
    expect(Number(side.dim), "dimmed").toBeGreaterThan(0.4);
  }
  for (const away of [s[2], s[3]]) { expect(away.shown, "two steps away").toBe(false); expect(away.seen).toBe(false); expect(away.img).toBe(false); }
  // Every project is a carousel now: five, two, four and five captures. Two captures: one neighbour.
  for (const [id, n] of [["poker", 5], ["aegis", 2], ["developeros", 4], ["gravity-flow", 5]] as const) await expect(panel(page, id).locator('[role="tab"]'), id).toHaveCount(n);
  expect((await slides(page, "aegis")).map((x) => x.offset)).toEqual(["0", "1"]);
  expect((await slides(page, "developeros")).map((x) => x.offset)).toEqual(["0", "1", "2", "-1"]);
  // The windows' neighbours turn too: the coverflow is the same for phones and windows.
  expect((await slides(page, "developeros"))[1].placed).toMatch(/^matrix3d\(/);
  // It never moves on its own.
  await page.waitForTimeout(3000);
  expect(await selected(page, "poker")).toBe(0);
  expect(await page.evaluate(() => (window as unknown as { __gl: number }).__gl)).toBe(0);
  expect(errors).toEqual([]);
  await ctx.close();
});

test("the carousel answers the keyboard (arrows, Home, End, focus following), its buttons, a side capture, and says so", async ({ browser }) => {
  const { ctx, page } = await at(browser, [1440, 900], { reducedMotion: "no-preference" });
  const tab = (i: number) => panel(page, "poker").locator('[role="tab"]').nth(i);
  await tab(0).focus();
  await page.keyboard.press("ArrowRight");
  await expect(tab(1)).toBeFocused();
  expect(await selected(page, "poker")).toBe(1);
  expect((await slides(page, "poker")).map((s) => s.offset)).toEqual(["-1", "0", "1", "2", "-2"]);
  await expect(panel(page, "poker").locator('[aria-live="polite"]')).toHaveText(/^T Poker: capture 2 of 5\. T Poker live tournament dashboard/);
  await page.keyboard.press("End"); await expect(tab(4)).toBeFocused();
  await expect(panel(page, "poker").locator('[aria-live="polite"]')).toHaveText("T Poker: capture 5 of 5. Lifetime statistics and profit/loss");
  await page.keyboard.press("ArrowRight"); await expect(tab(0)).toBeFocused();   // wraps around
  await page.keyboard.press("ArrowLeft"); await expect(tab(4)).toBeFocused();    // and back
  await page.keyboard.press("Home"); expect(await selected(page, "poker")).toBe(0);
  await panel(page, "poker").getByRole("button", { name: "Next capture" }).click(); expect(await selected(page, "poker")).toBe(1);
  await panel(page, "poker").getByRole("button", { name: "Previous capture" }).click(); expect(await selected(page, "poker")).toBe(0);
  await panel(page, "poker").locator('.wk__slide[data-offset="-1"]').click({ position: { x: 20, y: 200 } });   // the left neighbour
  expect(await selected(page, "poker")).toBe(4);
  // The front slide is the one assistive tech reads; the others are hidden from it.
  expect(await panel(page, "poker").locator(".wk__slide").evaluateAll((ss) => ss.map((s) => s.getAttribute("aria-hidden")))).toEqual(["true", "true", "true", "true", null]);
  // A window carousel answers the same way: each DeveloperOS capture in turn, announced with its own alt text.
  const dos = (i: number) => panel(page, "developeros").locator('[role="tab"]').nth(i);
  await dos(0).focus();
  for (const [i, alt] of ["Learning centre generated from indexed code", "Career tools—leads, CV match, interview prep", "DeveloperOS dashboard overview"].entries()) {
    await page.keyboard.press("ArrowRight");
    await expect(dos(i + 1)).toBeFocused();
    await expect(panel(page, "developeros").locator('[aria-live="polite"]')).toHaveText(`DeveloperOS: capture ${i + 2} of 4. ${alt}`);
    await expect(panel(page, "developeros").locator('.wk__slide[data-offset="0"] img')).toHaveAttribute("alt", alt);
  }
  await ctx.close();
});

test("touch: a sideways swipe moves the carousel; a vertical one scrolls the page instead", async ({ browser }) => {
  const { ctx, page } = await at(browser, [390, 844], { reducedMotion: "no-preference" });
  const track = panel(page, "poker").locator(".wk__track");
  await track.scrollIntoViewIfNeeded();
  const box = (await track.boundingBox())!;
  const cdp = await ctx.newCDPSession(page);
  const swipe = async (dx: number, dy: number) => {
    const x = box.x + box.width / 2, y = box.y + box.height / 2;
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
    for (let k = 1; k <= 6; k++) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x + (dx * k) / 6, y: y + (dy * k) / 6 }] });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await page.waitForTimeout(200);
  };
  await swipe(-140, 0); expect(await selected(page, "poker")).toBe(1);
  await swipe(140, 0); expect(await selected(page, "poker")).toBe(0);
  await swipe(0, -120); expect(await selected(page, "poker")).toBe(0);
  expect(await track.evaluate((e) => getComputedStyle(e).touchAction)).toBe("pan-y");
  await ctx.close();
});

for (const [label, opts, cookie] of [["the OS setting", { reducedMotion: "reduce" as const }, false], ["the site's own switch", {}, true]] as const) {
  test(`reduced motion (${label}): a flat slider, one capture at a time, no turn and no movement`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...opts });
    if (cookie) await ctx.addCookies([{ name: "a11y", value: encodeURIComponent(JSON.stringify({ reducedMotion: true, highContrast: false, largeText: false })), url: "http://localhost:3400" }]);
    const page = await ctx.newPage();
    await page.goto(ROUTE, { waitUntil: "networkidle" });
    const still = async () => {
      const s = await slides(page, "poker");
      expect(s.filter((x) => x.seen).length, "one capture shown").toBe(1);
      for (const x of s) expect(x.placed, "no turn").toBe("none");
      for (const d of await panel(page, "poker").locator(".wk__slide").evaluateAll((ss) => ss.map((e) => getComputedStyle(e).transitionDuration)))
        expect(parseFloat(d), "no movement").toBeLessThan(0.01);
    };
    await still();
    await panel(page, "poker").getByRole("button", { name: "Next capture" }).click();
    expect(await selected(page, "poker")).toBe(1);
    await still();
    expect((await slides(page, "poker"))[1].seen).toBe(true);
    expect(await page.locator(".wk__title").evaluate((e) => e.getAnimations().length)).toBe(0);
    await ctx.close();
  });
}

test("keyboard: every control in reading order, each with a solid 2px cyan ring; focus lifts its panel", async ({ browser }) => {
  const { ctx, page } = await at(browser, [1440, 900], { reducedMotion: "no-preference" });
  const seen: { at: string; ring: string }[] = [];
  for (let i = 0; i < 24; i++) {
    await page.keyboard.press("Tab");
    seen.push(await page.evaluate(() => {
      const e = document.activeElement as HTMLElement, cs = getComputedStyle(e);
      return { at: e.getAttribute("href") ?? e.getAttribute("aria-label") ?? "", ring: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}` };
    }));
  }
  expect(seen.map((s) => s.at)).toEqual(["#main",
    "https://app.tpoker.app/", "/#work-poker", "Previous capture", "Capture 1 of 5", "Next capture",
    "https://github.com/taysh123/aegis", "/#work-aegis", "Previous capture", "Capture 1 of 2", "Next capture",
    "https://github.com/taysh123/DeveloperOS", "/#work-developeros", "Previous capture", "Capture 1 of 4", "Next capture",
    "/#work-gravity-flow", "Previous capture", "Capture 1 of 5", "Next capture",
    ...ABOUT_LINKS.map(([href]) => href),
    "Chat with the assistant"]);
  for (const s of seen) expect(s.ring, s.at).toBe("solid 2px rgb(46, 230, 214)");
  await panel(page, "aegis").locator("[data-more]").focus();
  await page.waitForTimeout(300);
  expect((await lift(page, "aegis")).translate).toBe("0px -4px");
  expect((await lift(page, "aegis")).halo).not.toBe("none");
  expect((await lift(page, "developeros")).translate).toBe("none");
  await ctx.close();
});

test("hover and touch lift a stage too; reduced motion keeps it still (the edge and halo still answer)", async ({ browser }) => {
  const { ctx, page } = await at(browser, [1440, 900], { reducedMotion: "no-preference" });
  await stage(page, "aegis").hover();
  await page.waitForTimeout(300);
  expect((await lift(page, "aegis")).translate).toBe("0px -4px");
  await ctx.close();
  const phone = await at(browser, [390, 844], { reducedMotion: "no-preference" });
  await stage(phone.page, "aegis").scrollIntoViewIfNeeded();
  await stage(phone.page, "aegis").tap();
  await phone.page.waitForTimeout(300);
  expect((await lift(phone.page, "aegis")).translate).toBe("0px -4px");
  await phone.ctx.close();
  const calm = await at(browser, [1440, 900], { reducedMotion: "reduce" });
  const rest = await lift(calm.page, "aegis");
  await stage(calm.page, "aegis").hover();
  const hovered = await lift(calm.page, "aegis");
  expect(hovered.translate).toBe("none");
  expect(hovered.edge).not.toBe(rest.edge);
  expect(hovered.halo).not.toBe("none");
  await calm.ctx.close();
});

test("phones reserve every capture's box before a byte of it arrives (no layout shift)", async ({ browser }) => {
  // A blanket aspect-ratio rule once dropped the reservation that width and height give (CLS 0.017 on phones,
  // measured). With every capture still on its way (held, not failed: a failed image draws its alt text, which has a
  // height of its own), each image must already hold its height.
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "no-preference" });
  const page = await ctx.newPage();
  let release!: () => void;
  const held = new Promise<void>((r) => { release = r; });
  await page.route(/\/work\/[\w-]+-\d+\.(avif|webp)$/, async (r) => { await held; await r.abort().catch(() => {}); });
  await page.goto(ROUTE, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);
  const boxes = await page.locator(".wk__slide[data-offset='0'] img, .wk__stage > .wk__device img").evaluateAll((is) => is.map((i) => ({ src: i.getAttribute("srcset")!.split(" ")[0].split("/").pop(), h: i.getBoundingClientRect().height, loaded: (i as HTMLImageElement).naturalWidth > 0 })));
  expect(boxes).toHaveLength(4);
  for (const b of boxes) { expect(b.loaded, b.src).toBe(false); expect(b.h, b.src).toBeGreaterThan(40); }
  release();
  await ctx.close();
});

for (const vp of [[390, 844], [320, 568]] as const) {
  test(`${vp[0]}×${vp[1]}: a phone capture is capped (at most 45% of the screen tall, 190px wide)`, async ({ browser }) => {
    const { ctx, page } = await at(browser, vp, { reducedMotion: "no-preference" });
    for (const id of ["poker", "gravity-flow"]) {
      const r = (await panel(page, id).locator('.wk__slide[data-offset="0"] .wk__device').boundingBox())!;
      expect(r.width, `${id} width`).toBeLessThanOrEqual(190.5);
      expect(r.height, `${id} height`).toBeLessThanOrEqual(vp[1] * 0.45 + 1);
    }
    await ctx.close();
  });
}

for (const vp of [[1440, 900], [1024, 768], [390, 844], [320, 568]] as const) {
  test(`${vp[0]}×${vp[1]}: no horizontal overflow, targets ≥ 44px, every capture decodes, no console errors`, async ({ browser }) => {
    const { ctx, page, errors } = await at(browser, vp, { reducedMotion: "no-preference" });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(vp[0]);
    const small = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>(".wk a[href], .wk button")]
      .map((el) => ({ t: (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 24), h: el.getBoundingClientRect().height, w: el.getBoundingClientRect().width }))
      .filter((r) => r.h < 44 || r.w < 44));
    expect(small).toEqual([]);
    // Five dots and two arrows are seven 44px targets: below 390px they take two rows. None may be cut by the stage.
    const cut = await page.locator(".wk__panel").evaluateAll((ps) => ps.flatMap((p) => {
      const st = p.querySelector(".wk__stage")!.getBoundingClientRect();
      return [...p.querySelectorAll<HTMLElement>(".wk__step, .wk__dot")].map((b) => ({ id: (p as HTMLElement).dataset.panel, b: b.getAttribute("aria-label"), r: b.getBoundingClientRect() }))
        .filter(({ r }) => r.left < st.left + 1 || r.right > st.right - 1).map(({ id, b }) => `${id}: ${b}`);
    }));
    expect(cut).toEqual([]);
    await scrollAll(page);
    await expect.poll(() => page.locator(".wk img").evaluateAll((is) => is.every((i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0)), { timeout: 15000 }).toBe(true);
    expect(errors).toEqual([]);
    await ctx.close();
  });
}

test("structure: one h1, four product h2s, a landmark, four carousels, and four empty hidden P4 demo slots", async ({ page }) => {
  await page.goto(ROUTE);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("article h2")).toHaveText(NAMES);
  await expect(page.locator("h2")).toHaveCount(NAMES.length + 1);
  await expect(page.getByRole("region", { name: "Engineer by training. Builder by nature." }).locator("h2")).toHaveCount(1);
  await expect(page.getByRole("main")).toHaveCount(1);
  for (const n of NAMES) await expect(page.getByRole("article", { name: n })).toHaveCount(1);
  for (const n of NAMES) await expect(page.getByRole("region", { name: `${n}: captures` })).toHaveCount(1);
  const slots = await page.locator("[data-demo-slot]").evaluateAll((s) => s.map((e) => ({ id: e.getAttribute("data-demo-slot"), hidden: (e as HTMLElement).hidden, empty: e.childNodes.length === 0, shown: (e as HTMLElement).offsetParent !== null })));
  expect(slots).toEqual(["poker", "aegis", "developeros", "gravity-flow"].map((id) => ({ id, hidden: true, empty: true, shown: false })));
});

// About (P3.3, session 12): who, in about ten seconds, under the panels. Every word server-rendered, the live site's
// own links, no photo, and it holds still.
test("About without JavaScript: every word and the three live links, no photo, nothing hidden", async ({ browser }) => {
  const { ctx, page } = await at(browser, [1440, 900], { javaScriptEnabled: false });
  const ab = page.locator("[data-about]");
  await expect(ab.locator("h2")).toHaveText("Engineer by training. Builder by nature.");
  await expect(ab.locator(".wk__about-eyebrow")).toHaveText("About");
  await expect(ab.locator(".wk__about-lede")).toHaveText("I'm a Computer Science graduate who enjoys turning complex ideas into useful, dependable software. Today, I work with C#/.NET, TypeScript, and Python, taking projects from an initial idea to working software.");
  await expect(ab.locator(".wk__about-facts li")).toHaveText(["B.Sc. in Computer Science", "Full-stack: web, mobile, and backend", "Based in Israel", "Working in English and Hebrew"]);
  await expect(ab.locator(".wk__about-open")).toHaveText("Available for software engineering roles: on-site, hybrid, or remote.");
  await expect(ab.locator("img, picture, canvas, svg:not([aria-hidden='true'])")).toHaveCount(0);
  const links = ab.locator("a");
  await expect(links).toHaveCount(3);
  for (const [i, [href, name]] of ABOUT_LINKS.entries()) {
    await expect(links.nth(i)).toHaveAttribute("href", href);
    await expect(links.nth(i)).toHaveAccessibleName(name);
  }
  await expect(links.nth(0)).toHaveAttribute("download", "Tay-Shofer-Software-Engineer-Resume.pdf");
  await expect(links.nth(0)).toHaveAttribute("type", "application/pdf");
  for (const k of [1, 2]) { await expect(links.nth(k)).toHaveAttribute("target", "_blank"); await expect(links.nth(k)).toHaveAttribute("rel", "noopener noreferrer"); }
  for (const el of await ab.locator("*").all()) expect(await el.evaluate((e) => getComputedStyle(e).opacity)).toBe("1");
  await ctx.close();
});

test("About: the résumé link serves the same PDF as the live page's", async ({ request }) => {
  const res = await request.get(ABOUT_LINKS[0][0]);
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("application/pdf");
  expect((await res.body()).length).toBe(80593);   // tests/e2e/lower.spec.ts pins the same bytes
});

for (const [label, motion] of [["motion on", "no-preference"], ["reduced motion", "reduce"]] as const) {
  test(`About holds still (${label}): no animation on any of it, and a link answers a hover only in colour`, async ({ browser }) => {
    const { ctx, page } = await at(browser, [1440, 900], { reducedMotion: motion });
    const ab = page.locator("[data-about]");
    await ab.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    expect(await ab.evaluate((e) => [e, ...e.querySelectorAll("*")].reduce((n, x) => n + x.getAnimations().length, 0))).toBe(0);
    const cv = ab.locator("[data-resume]");
    const before = await cv.evaluate((e) => ({ y: e.getBoundingClientRect().top, bg: getComputedStyle(e).backgroundColor }));
    await cv.hover();
    await page.waitForTimeout(300);
    const after = await cv.evaluate((e) => ({ y: e.getBoundingClientRect().top, bg: getComputedStyle(e).backgroundColor }));
    expect(after.y).toBe(before.y);
    expect(after.bg).not.toBe(before.bg);
    await ctx.close();
  });
}

for (const vp of [[1440, 900], [1024, 768], [390, 844], [320, 568]] as const) {
  test(`About at ${vp[0]}×${vp[1]}: the title beside the words from 1024px, stacked below; nothing clipped`, async ({ browser }) => {
    const { ctx, page } = await at(browser, vp, { reducedMotion: "no-preference" });
    const ab = page.locator("[data-about]");
    await ab.scrollIntoViewIfNeeded();
    const head = (await ab.locator(".wk__about-head").boundingBox())!, body = (await ab.locator(".wk__about-body").boundingBox())!;
    if (vp[0] >= 1024) { expect(body.x).toBeGreaterThan(head.x + head.width); expect(Math.abs(body.y - head.y)).toBeLessThan(2); }
    else { expect(body.y).toBeGreaterThanOrEqual(head.y + head.height); expect(Math.abs(body.x - head.x)).toBeLessThan(2); }
    // Each half of the title holds its own line wherever it fits (320px is the one width where a half may wrap).
    const lines = await ab.locator(".wk__about-title span").evaluateAll((ss) => ss.map((s) => Math.round(s.getBoundingClientRect().height / parseFloat(getComputedStyle(s).lineHeight))));
    if (vp[0] >= 390) expect(lines).toEqual([1, 1]);
    const out = await ab.evaluate((e) => { const r = e.getBoundingClientRect(); return [...e.querySelectorAll<HTMLElement>("*")].filter((x) => { const b = x.getBoundingClientRect(); return b.right > r.right + 0.5 || b.left < r.left - 0.5; }).length; });
    expect(out).toBe(0);
    await ctx.close();
  });
}

for (const [label, vp, opts] of [
  ["1440, motion on", [1440, 900], { reducedMotion: "no-preference" }],
  ["390, motion on", [390, 844], { reducedMotion: "no-preference" }],
  ["1440, reduced motion", [1440, 900], { reducedMotion: "reduce" }],
  ["390, reduced motion", [390, 844], { reducedMotion: "reduce" }],
] as const) {
  test(`axe (WCAG 2.2 A/AA): no violations, after every carousel has moved — ${label}`, async ({ browser }) => {
    const { ctx, page } = await at(browser, vp, opts);
    await scrollAll(page);
    for (const id of ["poker", "aegis", "developeros", "gravity-flow"]) await panel(page, id).getByRole("button", { name: "Next capture" }).click();
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(1400);
    await page.addScriptTag({ path: AXE });
    const r = await page.evaluate(() => (window as unknown as { axe: { run: (c: unknown, o: unknown) => Promise<{ violations: { id: string; nodes: unknown[] }[]; incomplete: { id: string; nodes: unknown[] }[]; passes: unknown[] }> } })
      .axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] } }));
    console.log(`axe work ${label}: violations ${r.violations.length}, passes ${r.passes.length}, incomplete ${r.incomplete.map((i) => `${i.id}×${i.nodes.length}`).join(", ") || "none"}`);
    expect(r.violations.map((v) => `${v.id}×${v.nodes.length}`)).toEqual([]);
    await ctx.close();
  });
}
