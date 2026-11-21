// tests/e2e/lab-work.spec.ts — everything under the hero on /, in the cinematic language: Work's four panels and their
// carousels, Two more, About, Stack, Think · Build · Ship and Contact (the release, R1–R15; D1 reopened by Tay,
// 2026-11-18; D2 not reopened, so no WebGL). Ported in S20 from the prototype's /lab/work spec (the file keeps its name:
// docs/CINEMATIC_SYSTEM.md points here). The page-wide guards stay in budget.spec.ts and page.spec.ts, unchanged.
import { test, expect, type Browser, type BrowserContextOptions, type Page } from "playwright/test";
import zlib from "node:zlib";
import { COUNT_WEBGL, PHONES } from "../support/page";
import { privateRepoLeaks } from "../support/private-repo";
import { namesAny } from "../support/institution";
import { socials } from "../../data/socials";

const ROUTE = "/";
const AXE = require.resolve("axe-core/axe.min.js");
const NAMES = ["T Poker", "Aegis", "DeveloperOS", "GRAVITY FLOW"];
/** Contact's four links (P3.6): the live Contact's own targets, in its order, and each one's accessible name. Fixed
 *  values: the Product Plates Contact had exactly these (product-plates-final:components/sections/Contact.tsx). */
const CONTACT_LINKS = [
  [`mailto:${socials.email}?subject=Hello%20Tay`, "Email me"],
  ["https://www.linkedin.com/in/tay-shofer-1b2b54287", "LinkedIn (opens in a new tab)"],
  ["https://github.com/taysh123", "GitHub (opens in a new tab)"],
  ["/resume/Tay-Shofer-Software-Engineer-Resume.pdf", "Download résumé (PDF)"],
] as const;
/** Stack's filter (Tay, session 13): All and the four flagships, in Work order. */
const STACK_FILTER = ["All", ...NAMES];
/** Stack's groups (P3.4): the live Stack's, with Security after Services and APIs (Tay, session 13). */
const STACK_GROUPS = ["Languages", "Product and interface", "Services and APIs", "Security", "Data, search and models",
  "Delivery and testing", "Everyday tools"];

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

test("budget: first-load JS ≤ 205.7 KB gzip and HTML ≤ 568 KB; the carousel is one chunk, the project data stays on the server; one 2D canvas, no WebGL", async ({ request, baseURL, page }) => {
  const html = await (await request.get(ROUTE)).text();
  const srcs = [...new Set([...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]))];
  const bodies = await Promise.all(srcs.map(async (s) => (await request.get(new URL(s, baseURL).toString())).body()));
  const gz = bodies.reduce((a, b) => a + zlib.gzipSync(b).length, 0);
  const own = bodies.filter((b) => b.toString().includes("wk__reel"));
  console.log(`/ JS ${(gz / 1024).toFixed(2)} KiB over ${srcs.length} scripts (the carousel's own: ${(own.reduce((a, b) => a + zlib.gzipSync(b).length, 0) / 1024).toFixed(2)} KiB), HTML ${(Buffer.byteLength(html) / 1024).toFixed(2)} KB`);
  expect(gz / 1024).toBeLessThanOrEqual(205.7);
  expect(Buffer.byteLength(html) / 1024).toBeLessThanOrEqual(568);
  expect(own).toHaveLength(1);
  // The project data stays on the server: no script carries a tagline or the panel markup.
  for (const b of bodies) { expect(b.toString()).not.toContain("A poker study platform"); expect(b.toString()).not.toContain("wk__panel"); }
  await page.addInitScript(COUNT_WEBGL);
  await page.goto(ROUTE);
  // R12 (Tay, session 16): the page's one canvas is the hero's 2D field; nothing under the hero draws one.
  await expect(page.locator("canvas")).toHaveCount(1);
  await expect(page.locator(".wk canvas")).toHaveCount(0);
  expect(await page.evaluate(() => (window as unknown as { __gl: number }).__gl)).toBe(0);
});

// The prototype's "never indexed" half is page.spec.ts's guard now (R12: / is index, follow with its canonical).
test("no private repository leaks into what the browser gets", async ({ request }) => {
  const html = await (await request.get(ROUTE, { headers: { Accept: "text/html" } })).text();
  expect(privateRepoLeaks(html)).toEqual([]);
  expect(html).not.toMatch(/href="\/lab/);
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
    // R4: its case study is a script-driven dialog, so without JavaScript the button is not offered.
    await expect(el.locator(".case-study-trigger")).toHaveText("Case study");
    await expect(el.locator(".case-study-trigger")).toBeHidden();
  }
  await expect(page.locator(".case-study-trigger:visible")).toHaveCount(0);           // Two more's two as well
  await expect(page.locator(".case-study-trigger")).toHaveCount(6);
  expect(await page.locator(".wk__panel img").evaluateAll((is) => is.map((i) => (i as HTMLImageElement).src.split("/").pop()!.replace(/-\d+\.\w+$/, ""))))
    .toEqual(["poker-home", "aegis-alerts", "dos-search", "gf-gameplay"]);
  // The carousels' controls would do nothing without script, so they are not shown.
  for (const c of await page.locator(".wk__controls").all()) expect(await c.evaluate((e) => getComputedStyle(e).visibility)).toBe("hidden");
  expect(await page.locator(".wk__lens").evaluate((e) => getComputedStyle(e).visibility)).toBe("hidden");   // Stack's filter
  expect(await page.locator("[data-primary]").evaluateAll((as) => as.map((a) => a.getAttribute("href")))).toEqual([
    "https://app.tpoker.app/", "https://github.com/taysh123/aegis", "https://github.com/taysh123/DeveloperOS"]);
  await expect(page.locator(".wk__panel [data-private-repo]")).toHaveCount(2);
  // Every first capture arrives without script once near the viewport (native lazy loading; scrolled from outside).
  await scrollAll(page);
  await expect.poll(() => page.locator(".wk img").evaluateAll((is) => is.every((i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0)), { timeout: 15000 }).toBe(true);
  for (const sel of [".wk__eyebrow", ".wk__title"]) expect(await page.locator(sel).evaluate((e) => getComputedStyle(e).opacity), sel).toBe("1");
  await ctx.close();
});

test("captures: every one is lazy on / (the hero fills the first screen), and none is fetched until it is near", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const fetched: string[] = [];
  page.on("request", (r) => { if (/\/work\/[\w-]+-\d+\.(avif|webp)$/.test(r.url())) fetched.push(r.url().split("/").pop()!); });
  // Headless Chromium starts a lazy image well before it nears the viewport (its margin covers much of this page), so
  // the deferral is shown on the same markup pushed 6000px down: the lazy captures must wait for the scroll.
  await page.route(ROUTE, async (r) => { const res = await r.fetch(); await r.fulfill({ response: res, body: (await res.text()).replace("</head>", "<style>.wk__head{padding-top:6000px}</style></head>") }); });
  await page.goto(ROUTE, { waitUntil: "networkidle" });
  const attrs = await page.locator(".wk img").evaluateAll((is) => is.map((i) => [i.getAttribute("loading"), i.getAttribute("fetchpriority")]));
  expect(attrs.length).toBeGreaterThanOrEqual(4);
  for (const a of attrs) expect(a).toEqual(["lazy", null]);
  expect(fetched, "lazy, far away").toEqual([]);
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
    // Shifts are split by where they happen. The site's own chat launcher (components/chat) folds its label as the page
    // scrolls and unfolds it at the top: about 0.0076 (session 11, measured). The region's own boxes must not move at all.
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
    console.log(`CLS ${vp[0]}: under the hero ${cls.wk}, elsewhere (the site's chat launcher) ${cls.other.toFixed(4)}`);
    expect(cls.wk, `${vp[0]}: CLS under the hero through load, hydration and every capture arriving`).toBe(0);
    // Within a pixel: an empty slide reserves its box from the largest encode's exact ratio (900 × 506), while a loaded
    // smaller one keeps its own whole-pixel size (600 × 337), 0.27px shorter at 1440 (measured). Sub-pixel, and the same for
    // every capture since round 6; the region's CLS above stays 0.
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
  await panel(page, "poker").scrollIntoViewIfNeeded();
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

test("keyboard: every control under the hero in reading order, each with a solid 2px cyan ring; focus lifts its panel", async ({ browser }) => {
  const { ctx, page } = await at(browser, [1440, 900], { reducedMotion: "no-preference" });
  // Start from the hero's last control, Featured work's GRAVITY FLOW, and walk to the end of Contact.
  await page.locator('.hxa__flink[data-featured="gravity-flow"]').focus();
  const order = [
    "https://app.tpoker.app/", "Case study", "Previous capture", "Capture 1 of 5", "Next capture",
    "https://github.com/taysh123/aegis", "Case study", "Previous capture", "Capture 1 of 2", "Next capture",
    "https://github.com/taysh123/DeveloperOS", "Case study", "Previous capture", "Capture 1 of 4", "Next capture",
    "Case study", "Previous capture", "Capture 1 of 5", "Next capture",
    "https://github.com/taysh123/job-assistant", "Case study", "Case study",   // Two more (R5); About has no link (R10)
    ...STACK_FILTER,
    ...CONTACT_LINKS.map(([href]) => href)];
  const seen: { at: string; ring: string }[] = [];
  for (let i = 0; i < order.length; i++) {
    await page.keyboard.press("Tab");
    seen.push(await page.evaluate(async () => {
      const e = document.activeElement as HTMLElement;
      await Promise.all(e.getAnimations().map((a) => a.finished));   // a ring that eases in is read once it has settled
      const cs = getComputedStyle(e);
      return { at: e.getAttribute("href") ?? e.getAttribute("aria-label") ?? e.textContent ?? "", ring: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}` };
    }));
  }
  expect(seen.map((s) => s.at)).toEqual(order);
  // Contact's last link hands focus on to the footer, outside the layer (it keeps the site's own ring).
  await page.keyboard.press("Tab");
  expect(await page.evaluate(() => !!document.activeElement?.closest("footer"))).toBe(true);
  for (const s of seen) expect(s.ring, s.at).toBe("solid 2px rgb(46, 230, 214)");
  await panel(page, "aegis").locator(".case-study-trigger").focus();
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

test("structure: the hero's one h1, four product h3s under Work's h2, the sections' h2s, four carousels, and one P4 slot per panel as its last child: Aegis's and DeveloperOS's explainers, the other two empty and hidden", async ({ page }) => {
  await page.goto(ROUTE);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator(".wk__panel h3")).toHaveText(NAMES);
  await expect(page.locator("#work > header h2")).toHaveText("Four projects, built end to end.");
  // Work, Two more (R5), About, Stack, Think · Build · Ship and Contact.
  await expect(page.locator(".wk h2")).toHaveCount(6);
  await expect(page.getByRole("region", { name: "Two more" }).locator("h3")).toHaveText(["Job Assistant", "Orders & Delivery"]);
  await expect(page.getByRole("region", { name: "Engineer by training. Builder by nature." }).locator("h2")).toHaveCount(1);
  await expect(page.getByRole("region", { name: "Tools behind the work." }).locator("h2")).toHaveCount(1);
  await expect(page.getByRole("region", { name: "Tools behind the work." }).locator("h3")).toHaveCount(STACK_GROUPS.length);
  await expect(page.getByRole("region", { name: "Think. Build. Ship." }).locator("h2")).toHaveCount(1);
  await expect(page.getByRole("region", { name: "Think. Build. Ship." }).locator("h3")).toHaveCount(3);
  await expect(page.getByRole("region", { name: "Let's build something people use." }).locator("h2")).toHaveCount(1);
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(page.getByRole("main").locator(".wk")).toHaveCount(1);
  for (const n of NAMES) await expect(page.getByRole("article", { name: n })).toHaveCount(1);
  for (const n of NAMES) await expect(page.getByRole("region", { name: `${n}: captures` })).toHaveCount(1);
  // Tay, 2026-11-21, P4 plan decisions (docs/P4_PLAN.md, Q2 and §6): each slot is its panel's last child, a row of its
  // own; it holds the explainer once P4 has built it (DeveloperOS, S30; Aegis, S31), and stays empty and hidden until
  // then.
  const slots = await page.locator("[data-demo-slot]").evaluateAll((s) => s.map((e) => ({ id: e.getAttribute("data-demo-slot"), hidden: (e as HTMLElement).hidden, empty: e.childNodes.length === 0, shown: (e as HTMLElement).offsetParent !== null, last: e.parentElement!.matches(".wk__panel") && e === e.parentElement!.lastElementChild })));
  expect(slots).toEqual(["poker", "aegis", "developeros", "gravity-flow"].map((id) => id === "aegis" || id === "developeros"
    ? { id, hidden: false, empty: false, shown: true, last: true }
    : { id, hidden: true, empty: true, shown: false, last: true }));
});

// P4 (docs/P4_PLAN.md §3.3): DeveloperOS, cite or decline, in its panel's own row. Restored from the Product Plates
// chapter's tests (product-plates-final:tests/e2e/chapters.spec.ts:181, :187 and :200), adapted to the panel: the
// sequence and the refusal live in the slot, and the citation boxes on the carousel's first slide.
// Tay, 2026-11-21, P4 plan decisions.
const dos = (page: Page) => panel(page, "developeros");
test("DeveloperOS: index → retrieve → evidence → cite, or decline, as a readable sequence", async ({ page }) => {
  await page.goto(ROUTE);
  await expect(dos(page).locator(".wk__dos-flow > li > b")).toHaveText(["Index", "Retrieve", "Evidence", "Cite", "Or decline"]);
  await expect(dos(page).locator(".wk__dos-flow")).toContainText("declines before calling a model");
});

test("DeveloperOS: the refusal is real text, in the app's own words, shown once, not a picture of text", async ({ page }) => {
  await page.goto(ROUTE);
  const ui = dos(page).locator(".wk__dos-says");
  await expect(ui).toContainText("I don't have enough indexed material to teach that. Try devos index <path>, give a file path, or rephrase the topic. (Not guessing.)");
  // One refusal, not two: the Learning Center's notice above it is the same refusal on the same surface.
  await expect(ui).not.toContainText("Not enough of your indexed code matched this.");
  expect(await page.evaluate(() => document.body.innerText.split("I don't have enough indexed material").length - 1)).toBe(1);
  // The placeholder reads as words to a screen reader: only its angle brackets are hidden.
  expect(await ui.locator("code [aria-hidden=true]").allTextContents()).toEqual(["<", ">"]);
  await expect(ui.locator("img")).toHaveCount(0);
  await expect(ui.locator("code")).toHaveText("devos index <path>");
});

for (const vp of [[1440, 900], [390, 844]] as const) {
  test(`DeveloperOS at ${vp[0]}px: each citation box sits on a file:line chip of the real capture, on the carousel's first slide (its phone crop below 640px)`, async ({ browser }) => {
    const { ctx, page } = await at(browser, vp);
    const device = dos(page).locator('.wk__slide[data-offset="0"] .wk__device');
    await device.scrollIntoViewIfNeeded();
    await expect.poll(() => device.locator("img").evaluate((i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0)).toBe(true);
    const boxes = await device.evaluate((d) => {
      const img = d.querySelector("img") as HTMLImageElement, ir = img.getBoundingClientRect(), phone = img.currentSrc.includes("dos-search-phone");
      const H = phone ? 612 : 1027;
      return { phone, b: [...d.querySelectorAll(".wk__mark")].map((c) => { const r = c.getBoundingClientRect(); return ((r.top + r.bottom) / 2 - ir.top) / ir.height * H; }) };
    });
    expect(boxes.phone).toBe(vp[0] < 640);
    expect(boxes.b).toHaveLength(3);
    // The chips' centres on the 1600×1027 capture (the phone crop starts at its top-left, so the pixels are shared).
    for (const [i, c] of [195.5, 351.5, 507.5].entries()) expect(Math.abs(boxes.b[i] - c), `box ${i}`).toBeLessThan(6);
    await ctx.close();
  });
}

// New in S30 (docs/P4_PLAN.md §3.3, "the slot-row test"; Tay, 2026-11-21, P4 plan decisions).
for (const vp of [[320, 568], [390, 844], [1024, 768], [1440, 900]] as const) {
  test(`DeveloperOS at ${vp[0]}px: the explainer is the panel's own row under the first, on both columns from 1024px and after the carousel on phones; nothing in it takes focus`, async ({ browser }) => {
    const { ctx, page } = await at(browser, vp);
    const r = await dos(page).evaluate((p) => {
      const box = (s: string) => { const b = p.querySelector(s)!.getBoundingClientRect(); return { left: b.left, right: b.right, top: b.top, bottom: b.bottom, width: b.width }; };
      return { body: box(".wk__body"), stage: box(".wk__stage"), demo: box(".wk__demo"), rail: box(".wk__dos-rail"), refusal: box(".wk__dos-refusal"),
        focusable: p.querySelectorAll(".wk__demo :is(a, button, input, select, textarea, [tabindex])").length };
    });
    const near = (a: number, b: number, what: string) => expect(Math.abs(a - b), `${vp[0]}: ${what}`).toBeLessThan(1);
    expect(r.demo.top, "under the first row").toBeGreaterThanOrEqual(Math.max(r.body.bottom, r.stage.bottom));
    if (vp[0] >= 1024) {
      // Under both columns, on the first row's own column lines: the rail under the capture (DeveloperOS shows it on
      // the left), the refusal under the words, side by side.
      near(r.demo.left, r.stage.left, "the row starts at the capture's column"); near(r.demo.right, r.body.right, "and ends at the words' column");
      near(r.rail.left, r.stage.left, "rail left"); near(r.rail.width, r.stage.width, "rail width");
      near(r.refusal.left, r.body.left, "refusal left"); near(r.refusal.width, r.body.width, "refusal width");
      near(r.rail.top, r.refusal.top, "side by side");
    } else {
      // One column: the words, the capture, then the rail and the refusal, each the column's full width.
      expect(r.stage.top).toBeGreaterThanOrEqual(r.body.bottom);
      expect(r.refusal.top).toBeGreaterThanOrEqual(r.rail.bottom);
      near(r.demo.width, r.body.width, "full width"); near(r.refusal.width, r.body.width, "the refusal too");
    }
    expect(r.focusable).toBe(0);
    await ctx.close();
  });
}

// New in S30 (docs/P4_PLAN.md §3.3, "axe at 1440 and 390, with motion on and off"; Tay, 2026-11-21, P4 plan
// decisions). The page-wide axe test below moves every carousel first; this one reads the panel with its marked
// capture in front.
for (const [label, vp, opts] of [
  ["1440, motion on", [1440, 900], { reducedMotion: "no-preference" }],
  ["390, motion on", [390, 844], { reducedMotion: "no-preference" }],
  ["1440, reduced motion", [1440, 900], { reducedMotion: "reduce" }],
  ["390, reduced motion", [390, 844], { reducedMotion: "reduce" }],
] as const) {
  test(`DeveloperOS, axe (WCAG 2.2 A/AA): no violations in the panel and its explainer, with the boxed capture in front — ${label}`, async ({ browser }) => {
    const { ctx, page } = await at(browser, vp, opts);
    const front = dos(page).locator('.wk__slide[data-offset="0"]');
    await front.scrollIntoViewIfNeeded();
    await expect.poll(() => front.locator("img").evaluate((i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0)).toBe(true);
    await expect(front.locator('.wk__mark[aria-hidden="true"]')).toHaveCount(3);   // decoration: the alt text names the chips
    await page.waitForTimeout(400);
    await page.addScriptTag({ path: AXE });
    const r = await page.evaluate(() => (window as unknown as { axe: { run: (c: unknown, o: unknown) => Promise<{ violations: { id: string; nodes: unknown[] }[]; incomplete: { id: string; nodes: unknown[] }[]; passes: unknown[] }> } })
      .axe.run({ include: [["#work-developeros"]] }, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] } }));
    console.log(`axe developeros ${label}: violations ${r.violations.length}, passes ${r.passes.length}, incomplete ${r.incomplete.map((i) => `${i.id}×${i.nodes.length}`).join(", ") || "none"}`);
    expect(r.violations.map((v) => `${v.id}×${v.nodes.length}`)).toEqual([]);
    await ctx.close();
  });
}

// P4 (docs/P4_PLAN.md §3.2): Aegis, one alert start to finish, in its panel's own row. Restored from the Product Plates
// chapter's tests (product-plates-final:tests/e2e/chapters.spec.ts:96, :107, :118 and :155), adapted to the panel: the
// trace lives in the slot, and the ring on the carousel's first slide; the note beside the console doesn't come back
// (Q6), so the row's words are checked where a reader gets them, in the capture's alt text.
// Tay, 2026-11-21, P4 plan decisions.
const aegis = (page: Page) => panel(page, "aegis");
const rectOf = (page: Page, sel: string) => aegis(page).locator(sel).evaluate((e) => { const r = e.getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom }; });
test("Aegis: one alert, start to finish: ingest → normalise → detect, then the parallel fork, then live", async ({ page }) => {
  await page.goto(ROUTE);
  const trace = aegis(page).getByRole("figure", { name: "One alert, start to finish" }).locator(".wk__aegis-flow");
  expect(await trace.locator(":scope > li").evaluateAll((ls) => ls.map((l) => l.querySelector(".wk__aegis-then")?.textContent ?? l.querySelector("b")?.textContent))).toEqual(
    ["Ingest", "Normalise", "Detect", "Then, in parallel", "Live"]);
  await expect(trace.locator(".wk__aegis-branches > li > b")).toHaveText(["Threat scoring", "Alert stream"]);
  // In the explainer itself: the panel's tagline and chips already name both.
  await expect(aegis(page).locator(".wk__demo")).toContainText("RabbitMQ");
  await expect(aegis(page).locator(".wk__demo")).toContainText("PostgreSQL schema");
  await expect(aegis(page)).not.toContainText(/open source/i);
});

test("Aegis, wide: the fork is drawn — both branches start on the main line's row, the alert stream and Live share the row below", async ({ browser }) => {
  const { ctx, page } = await at(browser, [1440, 900]);
  const box = async (k: string) => { const r = await rectOf(page, `[data-k="${k}"]`); return { top: Math.round(r.top), left: Math.round(r.left) }; };
  const detect = await box("detect"), score = await box("score"), alert = await box("alert"), live = await box("live");
  expect(score.top).toBe(detect.top);
  expect(alert.top).toBeGreaterThan(score.top); expect(alert.left).toBe(score.left);
  expect(live.top).toBe(alert.top); expect(live.left).toBeGreaterThan(alert.left);
  await ctx.close();
});

for (const vp of [[1440, 900], [390, 844]] as const) {
  test(`Aegis at ${vp[0]}px: the ring frames the real port-scan row on the carousel's first slide (its phone crop below 640px), and the Detect step says what it counted`, async ({ browser }) => {
    const { ctx, page } = await at(browser, vp);
    const device = aegis(page).locator('.wk__slide[data-offset="0"] .wk__device');
    await device.scrollIntoViewIfNeeded();
    await expect.poll(() => device.locator("img").evaluate((i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0)).toBe(true);
    const r = await device.evaluate((d) => {
      const img = d.querySelector("img") as HTMLImageElement, ir = img.getBoundingClientRect(), frame = d.getBoundingClientRect();
      const phone = img.currentSrc.includes("aegis-alerts-phone");
      // The row's card in the capture's pixels (left 528, 644–775 of 2160) mapped through the crop the browser picked
      // (data/images.ts AEGIS_CROPS: desktop 492,612 1148×200; phone 500,612 1060×200).
      const crop = phone ? { left: 500, width: 1060 } : { left: 492, width: 1148 };
      const y = (v: number) => ir.top + ((v - 612) / 200) * ir.height, x = (v: number) => ir.left + ((v - crop.left) / crop.width) * ir.width;
      const rings = [...d.querySelectorAll(".wk__mark")].map((m) => m.getBoundingClientRect());
      return { phone, n: rings.length, ring: rings[0], rowTop: y(644), rowBottom: y(775), rowLeft: x(528), frameRight: frame.right, alt: img.alt };
    });
    expect(r.phone).toBe(vp[0] < 640);
    expect(r.n).toBe(1);
    expect(r.ring.top).toBeLessThanOrEqual(r.rowTop + 1); expect(r.ring.bottom).toBeGreaterThanOrEqual(r.rowBottom - 1);
    expect(r.ring.bottom - r.ring.top).toBeLessThan((r.rowBottom - r.rowTop) * 1.4);
    expect(r.ring.left).toBeLessThan(r.rowLeft);
    // It runs past the frame's right edge, as the row's card does (the crop ends there, the row doesn't); the frame clips it.
    expect(r.ring.right).toBeGreaterThan(r.frameRight);
    // What a screen reader gets instead of the ring: the row's own words, in the capture's alt text.
    expect(r.alt).toContain("Port scan detected from 10.10.10.2 (20 distinct ports in 60s)");
    await expect(aegis(page).locator('[data-k="detect"]')).toContainText("fires when the estimate reaches 20");
    await ctx.close();
  });
}

test("Aegis at 390px: the trace is a single column with the fork as two branches side by side, and Live follows the alert stream", async ({ browser }) => {
  const { ctx, page } = await at(browser, [390, 844]);
  const xs = await aegis(page).locator(".wk__aegis-flow > li:not([data-k=live])").evaluateAll((ls) => ls.map((l) => Math.round(l.getBoundingClientRect().left)));
  expect(new Set(xs).size).toBe(1);
  const br = await aegis(page).locator(".wk__aegis-branches > li").evaluateAll((ls) => ls.map((l) => Math.round(l.getBoundingClientRect().top)));
  expect(br[0]).toBe(br[1]);
  // Live sits under the alert stream's branch (the right-hand one), not under threat scoring.
  const alert = await rectOf(page, '[data-k="alert"]'), score = await rectOf(page, '[data-k="score"]'), live = await rectOf(page, '[data-k="live"]');
  expect(alert.left).toBeGreaterThan(score.right);
  expect(Math.abs(live.left - alert.left)).toBeLessThanOrEqual(2);
  expect(live.top).toBeGreaterThan(alert.bottom);
  await ctx.close();
});

// New in S31 (docs/P4_PLAN.md §3.2, "at 320, the branches stack and Live follows the alert stream"; Tay, 2026-11-21,
// P4 plan decisions: the stacked branches below about 400px, subject to his review of the screenshots).
test("Aegis at 320px: the branches stack, threat scoring then the alert stream, still joined by the rail; Live follows the alert stream", async ({ browser }) => {
  const { ctx, page } = await at(browser, [320, 568]);
  const r = await aegis(page).evaluate((p) => {
    const q = (s: string) => p.querySelector(s) as HTMLElement, rect = (s: string) => q(s).getBoundingClientRect();
    const after = (s: string) => getComputedStyle(q(s), "::after");
    // Where a pseudo-element's line sits, from its box's own edge and its computed offsets.
    const fork = rect(".wk__aegis-fork"), rail = after(".wk__aegis-fork");
    const tick = (s: string) => { const b = rect(s), a = after(s), edge = parseFloat(getComputedStyle(q(s)).borderTopWidth);
      return { x: b.left + edge + parseFloat(a.left), y: b.top + edge + parseFloat(a.top), end: b.top + edge + parseFloat(a.top) + parseFloat(a.height) }; };
    return { score: rect('[data-k="score"]'), alert: rect('[data-k="alert"]'), live: rect('[data-k="live"]'), then: rect(".wk__aegis-then"),
      rail: { x: fork.left + parseFloat(rail.left), end: fork.top + parseFloat(rail.top) + parseFloat(rail.height) },
      first: tick('[data-k="score"]'), second: tick('[data-k="alert"]') };
  });
  const near = (a: number, b: number, what: string) => expect(Math.abs(a - b), what).toBeLessThan(1.5);
  // One column under the fork's label: the alert stream under threat scoring, on the same edges.
  expect(r.alert.top).toBeGreaterThanOrEqual(r.score.bottom);
  near(r.score.left, r.alert.left, "same left"); near(r.score.right, r.alert.right, "same right");
  near(r.score.left, r.then.left, "under the label");
  // The rail runs from the fork's node to threat scoring's line, and on (threat scoring's own line) to the alert
  // stream's: both branches leave the same rail.
  near(r.first.x, r.rail.x, "threat scoring meets the rail"); near(r.second.x, r.rail.x, "the alert stream meets it too");
  near(r.rail.end, r.first.y, "the rail reaches threat scoring"); near(r.first.end, r.second.y + 1, "and carries on to the alert stream");
  // Live under the alert stream, on its column.
  expect(Math.abs(r.live.left - r.alert.left)).toBeLessThanOrEqual(2);
  expect(r.live.top).toBeGreaterThan(r.alert.bottom);
  await ctx.close();
});

// New in S31 (docs/P4_PLAN.md §3.2 and §6, axe at 1440 and 390 with motion on and reduced, as S30's; Tay, 2026-11-21,
// P4 plan decisions). The panel and its explainer, with the ringed capture in front.
for (const [label, vp, opts] of [
  ["1440, motion on", [1440, 900], { reducedMotion: "no-preference" }],
  ["390, motion on", [390, 844], { reducedMotion: "no-preference" }],
  ["1440, reduced motion", [1440, 900], { reducedMotion: "reduce" }],
  ["390, reduced motion", [390, 844], { reducedMotion: "reduce" }],
] as const) {
  test(`Aegis, axe (WCAG 2.2 A/AA): no violations in the panel and its explainer, with the ringed capture in front — ${label}`, async ({ browser }) => {
    const { ctx, page } = await at(browser, vp, opts);
    const front = aegis(page).locator('.wk__slide[data-offset="0"]');
    await front.scrollIntoViewIfNeeded();
    await expect.poll(() => front.locator("img").evaluate((i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0)).toBe(true);
    await expect(front.locator('.wk__mark[aria-hidden="true"]')).toHaveCount(1);   // decoration: the alt text gives the row
    await page.waitForTimeout(400);
    await page.addScriptTag({ path: AXE });
    const r = await page.evaluate(() => (window as unknown as { axe: { run: (c: unknown, o: unknown) => Promise<{ violations: { id: string; nodes: unknown[] }[]; incomplete: { id: string; nodes: unknown[] }[]; passes: unknown[] }> } })
      .axe.run({ include: [["#work-aegis"]] }, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] } }));
    console.log(`axe aegis ${label}: violations ${r.violations.length}, passes ${r.passes.length}, incomplete ${r.incomplete.map((i) => `${i.id}×${i.nodes.length}`).join(", ") || "none"}`);
    expect(r.violations.map((v) => `${v.id}×${v.nodes.length}`)).toEqual([]);
    await ctx.close();
  });
}

// About (P3.3, session 12): who, in about ten seconds, under Work. Every word server-rendered, no photo, and it holds
// still. Since R10 (S18+S19) it ends on the facts: no availability line and no links.
test("About without JavaScript: every word, no link, no photo, nothing hidden", async ({ browser }) => {
  const { ctx, page } = await at(browser, [1440, 900], { javaScriptEnabled: false });
  const ab = page.locator("[data-about]");
  await expect(ab.locator("h2")).toHaveText("Engineer by training. Builder by nature.");
  await expect(ab.locator(".wk__about-eyebrow")).toHaveText("About");
  await expect(ab.locator(".wk__about-lede")).toHaveText("I'm a Computer Science graduate who enjoys turning complex ideas into useful, dependable software. Today, I work with C#/.NET, TypeScript, and Python, taking projects from an initial idea to working software.");
  await expect(ab.locator(".wk__about-facts li")).toHaveText(["B.Sc. in Computer Science", "Full-stack: web, mobile, and backend", "Based in Israel", "Working in English and Hebrew"]);
  await expect(ab.locator(".wk__about-open")).toHaveCount(0);
  await expect(ab.locator("img, picture, canvas, video, figcaption, svg:not([aria-hidden='true'])")).toHaveCount(0);
  await expect(ab.locator("a, button")).toHaveCount(0);
  for (const el of await ab.locator("*").all()) expect(await el.evaluate((e) => getComputedStyle(e).opacity)).toBe("1");
  await ctx.close();
});

// Ported in S20 from lower.spec.ts (the Product Plates About, retired).
test("About: the four live facts; no institution anywhere in the served page; the rejected render gone in every form", async ({ page }) => {
  await page.goto(ROUTE);
  await expect(page.locator("#about .wk__about-facts li")).toHaveText(["B.Sc. in Computer Science", "Full-stack: web, mobile, and backend", "Based in Israel", "Working in English and Hebrew"]);
  // No institution anywhere in the served page: copy, alt text, metadata, Open Graph or JSON-LD.
  expect(namesAny(await page.content())).toBe(false);
  expect(await page.content()).not.toMatch(/Where the work happens|A 3D render, built in code|about-studio/);
  await expect(page.locator("#about figcaption, #about canvas, #about video")).toHaveCount(0);
});

test("the résumé links on / (the hero's and Contact's) serve the same PDF", async ({ page, request }) => {
  await page.goto(ROUTE);
  const hrefs = await page.locator("#hero a[download], [data-contact] [data-resume]").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  expect(hrefs).toEqual(["/resume/Tay-Shofer-Software-Engineer-Resume.pdf", "/resume/Tay-Shofer-Software-Engineer-Resume.pdf"]);
  const res = await request.get(hrefs[0]!);
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("application/pdf");
  expect((await res.body()).length).toBe(80593);   // tests/e2e/lower.spec.ts pins the same bytes
});

for (const [label, motion] of [["motion on", "no-preference"], ["reduced motion", "reduce"]] as const) {
  test(`About holds still (${label}): no animation and no transition on any of it`, async ({ browser }) => {
    const { ctx, page } = await at(browser, [1440, 900], { reducedMotion: motion });
    const ab = page.locator("[data-about]");
    await ab.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    expect(await ab.evaluate((e) => [e, ...e.querySelectorAll("*")].reduce((n, x) => n + x.getAnimations().length, 0))).toBe(0);
    expect(await ab.evaluate((e) => [e, ...e.querySelectorAll("*")].filter((x) => parseFloat(getComputedStyle(x).transitionDuration) >= 0.01).length)).toBe(0);
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
  test(`axe (WCAG 2.2 A/AA): no violations, after every carousel has moved and Stack is filtered — ${label}`, async ({ browser }) => {
    const { ctx, page } = await at(browser, vp, opts);
    await scrollAll(page);
    for (const id of ["poker", "aegis", "developeros", "gravity-flow"]) await panel(page, id).getByRole("button", { name: "Next capture" }).click();
    await page.locator("[data-stack]").getByRole("button", { name: "Aegis", exact: true }).click();   // Stack's filtered tools, checked too
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

// Stack (P3.4, session 13, rebuilt on Tay's reviews): the live Stack under About, restyled. One row per group (name,
// its tools as pills, the evidence), and a "Filter by project" of the four flagships: a project shows only its tools,
// filled in the accent, and no empty group. Without JavaScript the full list shows; with reduced motion nothing eases.
const stack = (page: Page) => page.locator("[data-stack]");
const chip = (page: Page, name: string) => stack(page).getByRole("button", { name, exact: true });
/** Each tool: its label, its flagships (data-p), whether it shows, and its pill's fill and text colour. */
const toolsOf = (page: Page) => stack(page).locator("[data-tool]").evaluateAll((ls) => ls.map((l) => {
  const cs = getComputedStyle(l);
  return { label: l.firstChild!.textContent!, p: (l.getAttribute("data-p") ?? "").split(" ").filter(Boolean), shown: cs.display !== "none", fill: cs.backgroundColor, color: cs.color };
}));
const INK = "rgb(238, 242, 251)", CYAN = "rgb(46, 230, 214)", ON_CYAN = "rgb(4, 6, 13)";

test("Stack without JavaScript: every group, tool and evidence sentence, the full list as pills, and no dead filter", async ({ browser }) => {
  const { ctx, page } = await at(browser, [1440, 900], { javaScriptEnabled: false });
  await expect(stack(page).locator(".wk__stack-eyebrow")).toHaveText("Stack");
  await expect(stack(page).locator("h2")).toHaveText("Tools behind the work.");
  await expect(stack(page).locator("h3")).toHaveText(STACK_GROUPS);
  const tools = await toolsOf(page);
  expect(tools).toHaveLength(45);
  expect(tools.every((t) => t.shown && t.color === INK && t.fill !== CYAN), "the full list, every tool an outlined pill").toBe(true);
  expect(tools.slice(21, 24).map((t) => [t.label, t.p])).toEqual([["JWT", ["poker", "aegis"]], ["Body HMAC", ["aegis"]], ["CSRF token", ["developeros"]]]);
  await expect(stack(page).locator(".wk__stack-evidence")).toHaveCount(7);
  for (const e of await stack(page).locator(".wk__stack-evidence").all()) await expect(e).toBeVisible();
  await expect(stack(page).locator('[data-group="security"] .wk__stack-evidence')).toHaveText(
    "Aegis authenticates agent ingestion by body HMAC and uses JWT (RS256); DeveloperOS compares a per-instance CSRF token with hmac.compare_digest.");
  // Each tool says its flagships in its accessible text, as the live Stack does.
  await expect(page.getByRole("list", { name: "Security", exact: true }).getByRole("listitem")).toHaveText(["JWT (T Poker, Aegis)", "Body HMAC (Aegis)", "CSRF token (DeveloperOS)"]);
  // The filter would do nothing: not shown, and not reachable.
  expect(await stack(page).locator(".wk__lens").evaluate((e) => getComputedStyle(e).visibility)).toBe("hidden");
  await expect(stack(page).locator("a, img, picture, svg, canvas")).toHaveCount(0);
  expect(await stack(page).evaluate((e) => [e, ...e.querySelectorAll("*")].filter((x) => getComputedStyle(x).opacity !== "1").length)).toBe(0);
  await ctx.close();
});

// Ported in S20 from lower.spec.ts (the Product Plates Stack, retired).
test("Stack: each tool is typeset text naming its own flagships, in its accessible text and on hover; Everyday tools name none; never monospace", async ({ page }) => {
  await page.goto(ROUTE);
  const csharp = page.locator("#skills [data-tool]", { hasText: /^C#/ });
  await expect(csharp).toHaveAttribute("title", "T Poker, Aegis");
  expect(await csharp.textContent()).toBe("C# (T Poker, Aegis)");
  await expect(page.locator('#skills [data-group="workflow"] [data-tool][title]')).toHaveCount(0);
  const fonts = await page.locator("#skills [data-tool]").evaluateAll((ls) => [...new Set(ls.map((l) => getComputedStyle(l).fontFamily))]);
  for (const f of fonts) expect(f).not.toMatch(/mono/i);
});

test("Stack's filter: a project shows only its tools, filled, and no empty group or evidence; All brings everything back", async ({ browser }) => {
  const { ctx, page, errors } = await at(browser, [1440, 900], { reducedMotion: "reduce" });
  await stack(page).scrollIntoViewIfNeeded();
  await expect(stack(page).locator('[role="group"]')).toHaveAccessibleName("Filter by project");
  await expect(stack(page).locator('[role="group"] button')).toHaveText(STACK_FILTER);
  const pressed = () => stack(page).locator('[role="group"] button').evaluateAll((bs) => bs.map((b) => b.getAttribute("aria-pressed")));
  const groupsShown = () => stack(page).locator(".wk__stack-group").evaluateAll((gs) => gs.filter((g) => getComputedStyle(g).display !== "none").map((g) => g.getAttribute("data-group")));
  expect(await pressed()).toEqual(["true", "false", "false", "false", "false"]);
  for (const [i, [id, name, n, groups]] of ([
    ["poker", "T Poker", 18, ["languages", "interface", "service", "security", "data", "delivery"]],
    ["aegis", "Aegis", 19, ["languages", "interface", "service", "security", "data", "delivery"]],
    ["developeros", "DeveloperOS", 9, ["languages", "interface", "security", "data", "delivery"]],
    ["gravity-flow", "GRAVITY FLOW", 6, ["languages", "interface", "delivery"]],
  ] as const).entries()) {
    await chip(page, name).click();
    await expect(chip(page, name)).toBeFocused();   // focus stays on the pressed button
    expect(await pressed()).toEqual(STACK_FILTER.map((_, k) => String(k === i + 1)));
    const tools = await toolsOf(page);
    for (const t of tools) expect(t.shown, `${name}: ${t.label}`).toBe(t.p.includes(id));   // the live mapping, nothing else
    for (const t of tools.filter((t) => t.shown)) { expect(t.fill, t.label).toBe(CYAN); expect(t.color, t.label).toBe(ON_CYAN); }
    expect(tools.filter((t) => t.shown)).toHaveLength(n);
    expect(await groupsShown()).toEqual([...groups]);
    await expect(stack(page).locator(".wk__stack-evidence:visible")).toHaveCount(0);
    await expect(stack(page).locator(".wk__lens-status")).toHaveText(`Showing the ${n} tools ${name} uses.`);
    await expect(stack(page).locator(".wk__lens-status")).toHaveAttribute("aria-live", "polite");
    // The tools no flagship uses show under All only.
    for (const label of ["Java", "JavaFX", "C", "C++", "pytest", "Framer Motion", "Playwright", "Git"]) expect(tools.find((t) => t.label === label)!.shown, label).toBe(false);
  }
  // The status sits above the groups, at the lead size, in ink.
  const status = await stack(page).locator(".wk__lens-status").evaluate((e) => ({ size: parseFloat(getComputedStyle(e).fontSize), color: getComputedStyle(e).color, bottom: e.getBoundingClientRect().bottom }));
  expect(status.size).toBeGreaterThanOrEqual(18);
  expect(status.color).toBe(INK);
  expect(status.bottom).toBeLessThanOrEqual((await stack(page).locator(".wk__stack-groups").boundingBox())!.y);
  await chip(page, "All").click();
  await expect(chip(page, "All")).toBeFocused();
  expect(await pressed()).toEqual(["true", "false", "false", "false", "false"]);
  expect((await toolsOf(page)).every((t) => t.shown && t.color === INK && t.fill !== CYAN)).toBe(true);
  expect(await groupsShown()).toHaveLength(7);
  await expect(stack(page).locator(".wk__stack-evidence:visible")).toHaveCount(7);
  await expect(stack(page).locator(".wk__lens-status")).toHaveText("");
  expect(errors).toEqual([]);
  await ctx.close();
});

test("Stack's filter answers the keyboard: Tab reaches each button, Enter and Space press it, focus stays, with the cyan ring", async ({ browser }) => {
  const { ctx, page } = await at(browser, [1440, 900], { reducedMotion: "reduce" });
  await chip(page, "All").focus();
  for (const name of STACK_FILTER.slice(1)) {
    await page.keyboard.press("Tab");
    await expect(chip(page, name)).toBeFocused();
    const ring = await chip(page, name).evaluate((e) => { const cs = getComputedStyle(e); return `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`; });
    expect(ring, name).toBe("solid 2px rgb(46, 230, 214)");
  }
  await page.keyboard.press("Enter");
  await expect(chip(page, "GRAVITY FLOW")).toHaveAttribute("aria-pressed", "true");
  await expect(chip(page, "GRAVITY FLOW")).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Space");
  await expect(chip(page, "DeveloperOS")).toHaveAttribute("aria-pressed", "true");
  await expect(chip(page, "DeveloperOS")).toBeFocused();
  await expect(chip(page, "GRAVITY FLOW")).toHaveAttribute("aria-pressed", "false");
  for (const name of STACK_FILTER) {
    const b = (await chip(page, name).boundingBox())!;
    expect(b.height, name).toBeGreaterThanOrEqual(44);
    expect(b.width, name).toBeGreaterThanOrEqual(44);
  }
  await ctx.close();
});

// The hold (StackFilter.tsx): a shorter list must never pull the page up under the reader. Pressing a project must not
// move the view: not with the buttons near the top of it, and not at the very end of the page (pressed from the
// keyboard). Below Stack sit Think · Build · Ship, Contact and the footer (ROADMAP #14).
for (const vp of [[1440, 900], [390, 844]] as const) {
  test(`Stack at ${vp[0]}: pressing a project never scrolls the page, wherever the reader is`, async ({ browser }) => {
    const { ctx, page } = await at(browser, vp, { reducedMotion: "reduce" });
    const view = () => page.evaluate(() => ({ y: Math.round(scrollY), chip: Math.round(document.querySelector(".wk__lens-chip")!.getBoundingClientRect().top) }));
    // 1. The buttons near the top of the view, with the long list below them.
    await chip(page, "All").evaluate((e) => scrollTo(0, e.getBoundingClientRect().top + scrollY - 120));
    await page.waitForTimeout(200);
    const at1 = await view();
    for (const name of ["GRAVITY FLOW", "DeveloperOS", "Aegis", "All", "GRAVITY FLOW"]) {
      await chip(page, name).evaluate((e) => (e as HTMLElement).focus({ preventScroll: true }));
      await page.keyboard.press("Enter");
      await page.waitForTimeout(150);
      expect(await view(), `${name}: the view stays`).toEqual(at1);
    }
    await chip(page, "All").evaluate((e) => (e as HTMLElement).focus({ preventScroll: true }));
    await page.keyboard.press("Enter");
    // 2. At the very end of the page.
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(200);
    const at2 = await view();
    for (const name of ["GRAVITY FLOW", "T Poker", "All"]) {
      await chip(page, name).evaluate((e) => (e as HTMLElement).focus({ preventScroll: true }));
      await page.keyboard.press("Enter");
      await page.waitForTimeout(150);
      expect(await view(), `${name} at the end: the view stays`).toEqual(at2);
    }
    await ctx.close();
  });
}

// Session 14: with Think · Build · Ship below Stack, the page is taller and the violet glow (at a share of its height)
// sits in the view when the buttons are low in it. The browser's scroll anchoring took the glow as its anchor and moved
// the view up with it as the list shortened (220–462px, measured). A glow is never an anchor now.
for (const vp of [[1440, 900], [390, 844]] as const) {
  test(`Stack at ${vp[0]}: with the buttons low in the view, pressing a project never scrolls the page (no glow is a scroll anchor)`, async ({ browser }) => {
    const { ctx, page } = await at(browser, vp, { reducedMotion: "reduce" });
    const view = () => page.evaluate(() => ({ y: Math.round(scrollY), chip: Math.round(document.querySelector(".wk__lens-chip")!.getBoundingClientRect().top) }));
    await chip(page, "All").evaluate((e) => scrollTo(0, e.getBoundingClientRect().top + scrollY - innerHeight + 120));
    await page.waitForTimeout(200);
    const at1 = await view();
    for (const name of ["T Poker", "GRAVITY FLOW", "All", "DeveloperOS", "Aegis", "All"]) {
      await chip(page, name).evaluate((e) => (e as HTMLElement).focus({ preventScroll: true }));
      await page.keyboard.press("Enter");
      await page.waitForTimeout(150);
      expect(await view(), `${name}: the view stays`).toEqual(at1);
    }
    expect(await page.locator(".wk__glow").evaluateAll((gs) => gs.map((g) => getComputedStyle(g).overflowAnchor))).toEqual(["none", "none"]);
    await ctx.close();
  });
}

for (const [label, motion] of [["motion on", "no-preference"], ["reduced motion", "reduce"]] as const) {
  test(`Stack holds still (${label}): nothing animates, and the buttons stay put when a project is pressed${motion === "reduce" ? "; nothing eases" : ""}`, async ({ browser }) => {
    const { ctx, page } = await at(browser, [1440, 900], { reducedMotion: motion });
    await stack(page).scrollIntoViewIfNeeded();
    const above = () => stack(page).locator(".wk__lens-chip, .wk__lens-status, h2").evaluateAll((es) => es.map((e) => { const r = e.getBoundingClientRect(); return `${r.x},${r.y + scrollY},${r.width}`; }));
    const before = await above();
    await chip(page, "Aegis").click();
    await page.waitForTimeout(300);
    expect(await above(), "the buttons, the status line and the title keep their place").toEqual(before);
    expect(await stack(page).evaluate((e) => [e, ...e.querySelectorAll("*")].reduce((n, x) => n + x.getAnimations().length, 0))).toBe(0);
    if (motion === "reduce") {
      // The site sets every duration to 0.001ms under reduced motion (app/globals.css), and Stack's buttons to none.
      expect(await stack(page).evaluate((e) => [e, ...e.querySelectorAll("*")].filter((x) => parseFloat(getComputedStyle(x).transitionDuration) >= 0.01).length)).toBe(0);
    }
    await ctx.close();
  });
}

for (const vp of [[1440, 900], [1024, 768], [390, 844], [320, 568]] as const) {
  test(`Stack at ${vp[0]}×${vp[1]}: each group's name beside its tools from 1024px, stacked below; the pills wrap; nothing clipped`, async ({ browser }) => {
    const { ctx, page } = await at(browser, vp, { reducedMotion: "no-preference" });
    await stack(page).scrollIntoViewIfNeeded();
    for (const g of await stack(page).locator(".wk__stack-group").all()) {
      const name = (await g.locator("h3").boundingBox())!, body = (await g.locator(".wk__stack-body").boundingBox())!;
      if (vp[0] >= 1024) { expect(body.x).toBeGreaterThan(name.x + name.width); expect(Math.abs(body.y - name.y)).toBeLessThan(2); }
      else { expect(body.y).toBeGreaterThanOrEqual(name.y + name.height); expect(Math.abs(body.x - name.x)).toBeLessThan(2); }
      const list = (await g.locator("ul").boundingBox())!, ev = (await g.locator(".wk__stack-evidence").boundingBox())!;
      expect(ev.y).toBeGreaterThanOrEqual(list.y + list.height);   // the evidence under the pills
    }
    // The pills share a line: Languages' eight take fewer lines than eight.
    const tops = new Set(await stack(page).locator('[data-group="languages"] [data-tool]').evaluateAll((ls) => ls.map((l) => Math.round(l.getBoundingClientRect().top))));
    expect(tops.size).toBeLessThan(vp[0] >= 1024 ? 3 : 5);
    if (vp[0] >= 1024) {
      const words = (await page.locator(".wk__about-body").boundingBox())!.x;
      expect(Math.abs((await stack(page).locator(".wk__stack-body").first().boundingBox())!.x - words)).toBeLessThan(1);
    }
    for (const name of ["All", "GRAVITY FLOW"]) {   // the full list, and the longest name's status line
      await chip(page, name).click();
      const out = await stack(page).evaluate((e) => {
        const r = e.getBoundingClientRect();
        return [...e.querySelectorAll<HTMLElement>("*")].filter((x) => { const b = x.getBoundingClientRect(); return b.width > 0 && (b.right > r.right + 0.5 || b.left < r.left - 0.5); }).map((x) => x.className || x.textContent);
      });
      expect(out, name).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(vp[0]);
    }
    await ctx.close();
  });
}

// Think · Build · Ship (P3.5, session 14): the live section's title and rows under Stack, word for word, plus one
// DeveloperOS line (Tay's wording), so all four flagships appear. Server-rendered, no control, and it holds still.
const tbs = (page: Page) => page.locator("[data-tbs]");
const TBS = [
  ["Think", "Find the hard part.", "Usually, one constraint shapes everything else.",
    ["T Poker: the money has to be exact to the cent, even in a guest game on a phone with no signal."]],
  ["Build", "Make the safe path the easy one.", "Encode constraints in types, interfaces, and data models—not just in documentation.",
    ["GRAVITY FLOW: cosmetic items are defined by visual fields only, and every purchase grants cosmetics or ad removal—nothing that changes gameplay.",
      "DeveloperOS: it declines when the index doesn't support an answer—before the provider is ever reached."]],
  ["Ship", "Ship it honestly.", "Make the project reproducible, testable, and explicit about its known gaps.",
    ["Aegis starts from one launcher script, and its repository keeps an audit document that lists the work still open."]],
] as const;

test("Think · Build · Ship without JavaScript: the live title and rows, every word, each project's name in ink, nothing hidden", async ({ browser }) => {
  const { ctx, page } = await at(browser, [1440, 900], { javaScriptEnabled: false });
  await expect(tbs(page).locator("h2")).toHaveText("Think. Build. Ship.");
  await expect(tbs(page).locator("ol > li")).toHaveCount(3);
  await expect(tbs(page).locator("h3")).toHaveText(TBS.map((r) => `${r[0]}:`));   // the live screen-reader colon
  await expect(tbs(page).locator(".wk__tbs-line")).toHaveText(TBS.map((r) => r[1]));
  await expect(tbs(page).locator(".wk__tbs-summary")).toHaveText(TBS.map((r) => r[2]));
  await expect(tbs(page).locator(".wk__tbs-example")).toHaveText(TBS.flatMap((r) => [...r[3]]));
  await expect(tbs(page).locator(".wk__tbs-project")).toHaveText(["T Poker", "GRAVITY FLOW", "DeveloperOS", "Aegis"]);   // all four flagships
  for (const c of await tbs(page).locator(".wk__tbs-project").evaluateAll((es) => es.map((e) => getComputedStyle(e).color))) expect(c).toBe(INK);
  await expect(tbs(page).locator("a, button, img, picture, svg, canvas")).toHaveCount(0);
  expect(await tbs(page).evaluate((e) => [e, ...e.querySelectorAll("*")].filter((x) => getComputedStyle(x).opacity !== "1" || getComputedStyle(x).visibility === "hidden").length)).toBe(0);
  await ctx.close();
});

// Ported in S20 from lower.spec.ts (the Product Plates Think · Build · Ship, retired).
test("Think · Build · Ship is unpinned: three principles in the flow of the page", async ({ page }) => {
  await page.goto(ROUTE);
  const s = page.locator("#approach");
  expect(await s.evaluate((e) => [...e.querySelectorAll("*")].some((x) => /sticky|fixed/.test(getComputedStyle(x).position)))).toBe(false);
  expect(await s.evaluate((e) => e.getBoundingClientRect().height)).toBeLessThan(900 * 1.2);
});

for (const [label, motion] of [["motion on", "no-preference"], ["reduced motion", "reduce"]] as const) {
  test(`Think · Build · Ship holds still (${label}): no animation and no transition on any of it`, async ({ browser }) => {
    const { ctx, page } = await at(browser, [1440, 900], { reducedMotion: motion });
    await tbs(page).scrollIntoViewIfNeeded();
    const boxes = () => tbs(page).locator("*").evaluateAll((es) => es.map((e) => { const r = e.getBoundingClientRect(); return `${r.x},${r.y + scrollY},${r.width},${r.height}`; }));
    const before = await boxes();
    await page.waitForTimeout(300);
    expect(await tbs(page).evaluate((e) => [e, ...e.querySelectorAll("*")].reduce((n, x) => n + x.getAnimations().length, 0))).toBe(0);
    expect(await tbs(page).evaluate((e) => [e, ...e.querySelectorAll("*")].filter((x) => parseFloat(getComputedStyle(x).transitionDuration) >= 0.01).length)).toBe(0);
    await tbs(page).locator(".wk__tbs-example").first().hover();
    await page.waitForTimeout(200);
    expect(await boxes(), "nothing moves").toEqual(before);
    await ctx.close();
  });
}

for (const vp of [[1440, 900], [1024, 768], [390, 844], [320, 568]] as const) {
  test(`Think · Build · Ship at ${vp[0]}×${vp[1]}: each word and line beside the evidence from 1024px, stacked below; nothing clipped`, async ({ browser }) => {
    const { ctx, page } = await at(browser, vp, { reducedMotion: "no-preference" });
    await tbs(page).scrollIntoViewIfNeeded();
    for (const row of await tbs(page).locator(".wk__tbs-row").all()) {
      const head = (await row.locator(".wk__tbs-head").boundingBox())!, body = (await row.locator(".wk__tbs-body").boundingBox())!;
      if (vp[0] >= 1024) { expect(body.x).toBeGreaterThan(head.x + head.width); expect(Math.abs(body.y - head.y)).toBeLessThan(2); }
      else { expect(body.y).toBeGreaterThanOrEqual(head.y + head.height); expect(Math.abs(body.x - head.x)).toBeLessThan(2); }
      const word = (await row.locator("h3").boundingBox())!, line = (await row.locator(".wk__tbs-line").boundingBox())!;
      expect(line.y).toBeGreaterThanOrEqual(word.y + word.height);   // the line under its word
    }
    if (vp[0] >= 1024) {   // lined up under About's words and Stack's tools
      const words = (await page.locator(".wk__about-body").boundingBox())!.x;
      expect(Math.abs((await tbs(page).locator(".wk__tbs-body").first().boundingBox())!.x - words)).toBeLessThan(1);
    }
    const out = await tbs(page).evaluate((e) => {
      const r = e.getBoundingClientRect();
      return [...e.querySelectorAll<HTMLElement>("*")].filter((x) => { const b = x.getBoundingClientRect(); return b.width > 0 && (b.right > r.right + 0.5 || b.left < r.left - 0.5); }).map((x) => x.className || x.textContent);
    });
    expect(out).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(vp[0]);
    // Its last line clears the chat launcher at the end of the page (Contact and the footer follow it).
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(150);
    const last = (await tbs(page).locator(".wk__tbs-example").last().boundingBox())!;
    const launcher = (await page.locator("[data-chat-launcher]").boundingBox())!;
    expect(last.y + last.height).toBeLessThanOrEqual(launcher.y);
    await ctx.close();
  });
}

// Contact (P3.6, session 15): the live Contact section under Think · Build · Ship, the last section of the page (the
// footer follows). The live title, lead and four links at the live targets (Tay approved the copy). Server-rendered, no
// form, and it holds still.
const contact = (page: Page) => page.locator("[data-contact]");
/** Each link's target and attributes, in order: what a reader's browser does with it. */
const attrsOf = (links: ReturnType<Page["locator"]>) => links.evaluateAll((as) => as.map((a) =>
  ["href", "target", "rel", "download", "type"].map((k) => a.getAttribute(k))));

test("Contact without JavaScript: the eyebrow, the live title and lead, the four live links, nothing hidden", async ({ browser }) => {
  const { ctx, page } = await at(browser, [1440, 900], { javaScriptEnabled: false });
  await expect(contact(page).locator(".wk__contact-eyebrow")).toHaveText("Contact");
  await expect(contact(page).locator("h2")).toHaveText("Let's build something people use.");
  await expect(contact(page).locator(".wk__contact-lead")).toHaveText("I'm looking for a software engineering opportunity that fits my skills—on-site, hybrid, or remote.");
  const links = contact(page).locator("a");
  await expect(links).toHaveCount(CONTACT_LINKS.length);
  for (const [i, [href, name]] of CONTACT_LINKS.entries()) {
    await expect(links.nth(i)).toHaveAttribute("href", href);
    await expect(links.nth(i)).toHaveAccessibleName(name);
  }
  expect(await attrsOf(links)).toEqual([
    [CONTACT_LINKS[0][0], null, null, null, null],                                   // the mailto, in the same tab
    [CONTACT_LINKS[1][0], "_blank", "noopener noreferrer", null, null],
    [CONTACT_LINKS[2][0], "_blank", "noopener noreferrer", null, null],
    [CONTACT_LINKS[3][0], null, null, "Tay-Shofer-Software-Engineer-Resume.pdf", "application/pdf"],
  ]);
  await expect(contact(page).locator(".wk__contact-resume")).toHaveText("Download résumé (PDF) · two pages, 79 KB");
  await expect(contact(page).locator("form, input, textarea, button, img, picture, canvas, svg:not([aria-hidden='true'])")).toHaveCount(0);
  expect(await contact(page).evaluate((e) => [e, ...e.querySelectorAll("*")].filter((x) => getComputedStyle(x).opacity !== "1" || getComputedStyle(x).visibility === "hidden").length)).toBe(0);
  await ctx.close();
});

// Ported in S20 from lower.spec.ts (the Product Plates Contact, retired).
for (const vp of PHONES) {
  test(`${vp[0]}px: Contact keeps LinkedIn and GitHub on one line, and the résumé's size never breaks`, async ({ browser }) => {
    const { ctx, page } = await at(browser, vp, { reducedMotion: "reduce" });
    const tops = await contact(page).locator("[data-profile]").evaluateAll((as) => as.map((a) => Math.round(a.getBoundingClientRect().top)));
    expect(tops).toHaveLength(2); expect(tops[0]).toBe(tops[1]);
    expect(await contact(page).locator(".wk__contact-resume").textContent()).toContain("79 KB");
    expect(await contact(page).locator(".wk__contact-resume span").evaluate((e) => e.getClientRects().length)).toBe(1);   // the note, one run
    await ctx.close();
  });
}

test("Contact: the résumé is a quiet download there and in the footer, and never in the header", async ({ page }) => {
  await page.goto(ROUTE);
  await expect(contact(page).getByRole("link", { name: "Download résumé (PDF)" })).toHaveAttribute("href", "/resume/Tay-Shofer-Software-Engineer-Resume.pdf");
  await expect(page.locator("footer").getByRole("link", { name: "Résumé (PDF)" })).toHaveAttribute("href", "/resume/Tay-Shofer-Software-Engineer-Resume.pdf");
  await expect(page.locator("header[data-site-nav]").getByRole("link", { name: /résumé|resume|cv/i })).toHaveCount(0);
});

for (const [label, motion] of [["motion on", "no-preference"], ["reduced motion", "reduce"]] as const) {
  test(`Contact holds still (${label}): no animation on any of it, and a link answers a hover only in colour`, async ({ browser }) => {
    const { ctx, page } = await at(browser, [1440, 900], { reducedMotion: motion });
    await contact(page).scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const boxes = () => contact(page).locator("*").evaluateAll((es) => es.map((e) => { const r = e.getBoundingClientRect(); return `${r.x},${r.y + scrollY},${r.width},${r.height}`; }));
    const before = await boxes();
    expect(await contact(page).evaluate((e) => [e, ...e.querySelectorAll("*")].reduce((n, x) => n + x.getAnimations().length, 0))).toBe(0);
    const email = contact(page).locator("[data-email]");
    const bg = await email.evaluate((e) => getComputedStyle(e).backgroundColor);
    await email.hover();
    await page.waitForTimeout(300);
    expect(await email.evaluate((e) => getComputedStyle(e).backgroundColor)).not.toBe(bg);
    const cv = contact(page).locator("[data-resume]");
    const line = await cv.evaluate((e) => getComputedStyle(e).textDecorationColor);
    await cv.hover();
    await page.waitForTimeout(300);
    expect(await cv.evaluate((e) => getComputedStyle(e).textDecorationColor)).not.toBe(line);
    expect(await boxes(), "nothing moves").toEqual(before);
    await ctx.close();
  });
}

// Contact's two columns start at 1100px, not 1024 like the sections above (Tay, session 15): from 1024 to 1100 the
// words share is too narrow for "Let's build something", so Contact stacks and its title keeps its two lines.
for (const vp of [[1440, 900], [1100, 800], [1024, 768], [390, 844], [320, 568]] as const) {
  test(`Contact at ${vp[0]}×${vp[1]}: the title beside the words from 1100px, stacked below; the profiles a pair; clear of the chat launcher at the end`, async ({ browser }) => {
    const { ctx, page } = await at(browser, vp, { reducedMotion: "no-preference" });
    await contact(page).scrollIntoViewIfNeeded();
    const head = (await contact(page).locator(".wk__contact-head").boundingBox())!, body = (await contact(page).locator(".wk__contact-body").boundingBox())!;
    if (vp[0] >= 1100) {
      expect(body.x).toBeGreaterThan(head.x + head.width); expect(Math.abs(body.y - head.y)).toBeLessThan(2);
      expect(Math.abs(body.x - (await page.locator(".wk__about-body").boundingBox())!.x)).toBeLessThan(1);   // under About's words
    } else { expect(body.y).toBeGreaterThanOrEqual(head.y + head.height); expect(Math.abs(body.x - head.x)).toBeLessThan(2); }
    // At 1024 only Contact stacks: About above it keeps its two columns.
    if (vp[0] === 1024) {
      const aHead = (await page.locator(".wk__about-head").boundingBox())!, aBody = (await page.locator(".wk__about-body").boundingBox())!;
      expect(aBody.x).toBeGreaterThan(aHead.x + aHead.width);
    }
    // Each half of the title holds its own line wherever it fits: from 390px up, 1024 and 1100 included (at 320px a half
    // may wrap, as About's does).
    const lines = await contact(page).locator(".wk__contact-title span").evaluateAll((ss) => ss.map((s) => Math.round(s.getBoundingClientRect().height / parseFloat(getComputedStyle(s).lineHeight))));
    if (vp[0] >= 390) expect(lines).toEqual([1, 1]);
    // The two profiles never split (the live rule): LinkedIn and GitHub share a line.
    const tops = await contact(page).locator("[data-profile]").evaluateAll((as) => as.map((a) => Math.round(a.getBoundingClientRect().top)));
    expect(new Set(tops).size).toBe(1);
    const out = await contact(page).evaluate((e) => {
      const r = e.getBoundingClientRect();
      return [...e.querySelectorAll<HTMLElement>("*")].filter((x) => { const b = x.getBoundingClientRect(); return b.width > 0 && (b.right > r.right + 0.5 || b.left < r.left - 0.5); }).map((x) => x.className || x.textContent);
    });
    expect(out).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(vp[0]);
    // At the end of the page the chat launcher covers no Contact link: every link, and the résumé's note, sit above it.
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(150);
    const launcher = (await page.locator("[data-chat-launcher]").boundingBox())!;
    for (const box of [...await contact(page).locator("a").evaluateAll((as) => as.map((a) => a.getBoundingClientRect().toJSON() as DOMRect)),
      (await contact(page).locator(".wk__contact-resume").boundingBox())!]) expect(box.y + box.height).toBeLessThanOrEqual(launcher.y);
    await ctx.close();
  });
}
