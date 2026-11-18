// tests/e2e/lab-work.spec.ts — the Work slice in the cinematic language (PROTOTYPE, round 5; D2 reopened by Tay,
// 2026-11-18). Branch proto/hero-a-cinematic only, never merged. main's guards still run against /, unchanged.
import { test, expect, type Browser, type BrowserContextOptions, type Page } from "playwright/test";
import zlib from "node:zlib";
import { createHash } from "node:crypto";
import { COUNT_WEBGL } from "../support/page";
import { privateRepoLeaks } from "../support/private-repo";

const ROUTE = "/lab/work";
const AXE = require.resolve("axe-core/axe.min.js");
const NAMES = ["T Poker", "Aegis", "DeveloperOS", "GRAVITY FLOW"];

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
const stage = (page: Page, id: string) => page.locator(`[data-panel="${id}"] .wk__stage`);
const lift = (page: Page, id: string) => stage(page, id).evaluate((e) => { const cs = getComputedStyle(e); return { translate: cs.translate, halo: cs.boxShadow, edge: cs.borderTopColor }; });

test("budget: first-load JS ≤ 205.7 KB gzip and HTML ≤ 568 KB; no canvas, no WebGL, and no client code of its own", async ({ request, baseURL, page }) => {
  const html = await (await request.get(ROUTE)).text();
  const srcs = [...new Set([...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]))];
  const bodies = await Promise.all(srcs.map(async (s) => (await request.get(new URL(s, baseURL).toString())).body()));
  const gz = bodies.reduce((a, b) => a + zlib.gzipSync(b).length, 0);
  console.log(`/lab/work JS ${(gz / 1024).toFixed(2)} KiB over ${srcs.length} scripts, HTML ${(Buffer.byteLength(html) / 1024).toFixed(2)} KB`);
  expect(gz / 1024).toBeLessThanOrEqual(205.7);
  expect(Buffer.byteLength(html) / 1024).toBeLessThanOrEqual(568);
  // Nothing in its scripts is the slice's own: its class names appear in no script (all of it is server-rendered).
  expect(bodies.some((b) => b.toString().includes("wk__panel"))).toBe(false);
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

// Tailwind scans app/, tests/ and scripts/ for class-name candidates, comments and object keys included, so a word in a
// lab file can add a rule to the live page's stylesheet. It happened twice on this branch (a utility name in a test
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

test("without JavaScript: every name, line, state, chip, capture and link is there and works", async ({ browser }) => {
  const { ctx, page } = await at(browser, [1440, 900], { javaScriptEnabled: false });
  await expect(page.locator(".wk__name")).toHaveText(NAMES);
  for (const [i, el] of (await page.locator(".wk__panel").all()).entries()) {
    await expect(el.locator(".wk__line")).not.toBeEmpty();
    await expect(el.locator(".wk__status")).toContainText("Status");
    expect(await el.locator(".wk__chips li").count(), NAMES[i]).toBeGreaterThanOrEqual(2);
    await expect(el.locator("img")).toHaveAttribute("alt", /.{20,}/);
    await expect(el.locator("[data-more]")).toHaveAttribute("href", /^\/#work-/);
  }
  expect(await page.locator("[data-primary]").evaluateAll((as) => as.map((a) => a.getAttribute("href")))).toEqual([
    "https://app.tpoker.app/", "https://github.com/taysh123/aegis", "https://github.com/taysh123/DeveloperOS"]);
  await expect(page.locator("[data-private-repo]")).toHaveCount(2);
  // Every capture arrives without script once it is near the viewport (native lazy loading). Scrolled from outside the
  // page: with JavaScript off, the page's own timers never run.
  for (const img of await page.locator(".wk img").all()) { await img.scrollIntoViewIfNeeded(); await page.waitForTimeout(150); }
  await expect.poll(() => page.locator(".wk img").evaluateAll((is) => is.every((i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0)), { timeout: 15000 }).toBe(true);
  // The opening ends visible without JS.
  for (const sel of [".wk__eyebrow", ".wk__title", ".wk__lede"]) expect(await page.locator(sel).evaluate((e) => getComputedStyle(e).opacity), sel).toBe("1");
  await ctx.close();
});

test("captures: the first is eager and high priority; the rest are lazy, and wait until they are near the viewport", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const fetched: string[] = [];
  page.on("request", (r) => { if (/\/work\/[\w-]+-\d+\.(avif|webp)$/.test(r.url())) fetched.push(r.url().split("/").pop()!); });
  // Headless Chromium starts a lazy image well before it nears the viewport (its margin covers this whole 3.3k px page),
  // so the deferral is shown on the same markup pushed 6000px down: the lazy captures must wait for the scroll.
  await page.route(ROUTE, async (r) => { const res = await r.fetch(); await r.fulfill({ response: res, body: (await res.text()).replace("</head>", "<style>.wk__head{padding-top:6000px}</style></head>") }); });
  await page.goto(ROUTE, { waitUntil: "networkidle" });
  expect(await page.locator(".wk img").evaluateAll((is) => is.map((i) => [i.getAttribute("loading"), i.getAttribute("fetchpriority")]))).toEqual([
    ["eager", "high"], ["lazy", null], ["lazy", null], ["lazy", null]]);
  expect(fetched.some((f) => f.startsWith("poker-live")), fetched.join(", ")).toBe(true);                       // eager: fetched anyway
  expect(fetched.filter((f) => /^(hero-aegis|dos-search|gf-gameplay)/.test(f)), "lazy, far away").toEqual([]);
  await page.locator('[data-panel="gravity-flow"]').scrollIntoViewIfNeeded();
  await expect.poll(() => fetched.some((f) => f.startsWith("gf-gameplay"))).toBe(true);
  await ctx.close();
});

test("keyboard: every link in reading order, each with a solid 2px cyan ring; focus lifts its panel", async ({ browser }) => {
  const { ctx, page } = await at(browser, [1440, 900], { reducedMotion: "no-preference" });
  const seen: { at: string; ring: string; panel: string | null }[] = [];
  for (let i = 0; i < 9; i++) {
    await page.keyboard.press("Tab");
    seen.push(await page.evaluate(() => {
      const e = document.activeElement as HTMLElement, cs = getComputedStyle(e);
      return { at: e.getAttribute("href") ?? e.getAttribute("aria-label") ?? "", ring: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`, panel: e.closest("[data-panel]")?.getAttribute("data-panel") ?? null };
    }));
  }
  expect(seen.map((s) => s.at)).toEqual(["#main", "https://app.tpoker.app/", "/#work-poker", "https://github.com/taysh123/aegis", "/#work-aegis",
    "https://github.com/taysh123/DeveloperOS", "/#work-developeros", "/#work-gravity-flow", "Chat with the assistant"]);
  for (const s of seen) expect(s.ring, s.at).toBe("solid 2px rgb(46, 230, 214)");
  // Focus on Aegis's link lifts Aegis's stage, and only it.
  await page.locator('[data-panel="aegis"] [data-more]').focus();
  await page.waitForTimeout(300);
  expect((await lift(page, "aegis")).translate).toBe("0px -4px");
  expect((await lift(page, "aegis")).halo).not.toBe("none");
  expect((await lift(page, "developeros")).translate).toBe("none");
  await ctx.close();
});

test("hover and touch lift a stage too; reduced motion keeps it still (the edge and halo still answer)", async ({ browser }) => {
  const { ctx, page } = await at(browser, [1440, 900], { reducedMotion: "no-preference" });
  await stage(page, "poker").hover();
  await page.waitForTimeout(300);
  expect((await lift(page, "poker")).translate).toBe("0px -4px");
  await ctx.close();
  const phone = await at(browser, [390, 844], { reducedMotion: "no-preference" });
  await stage(phone.page, "aegis").scrollIntoViewIfNeeded();
  await stage(phone.page, "aegis").tap();
  await phone.page.waitForTimeout(300);
  expect((await lift(phone.page, "aegis")).translate).toBe("0px -4px");
  await phone.ctx.close();
  const calm = await at(browser, [1440, 900], { reducedMotion: "reduce" });
  const rest = await lift(calm.page, "poker");
  await stage(calm.page, "poker").hover();
  const hovered = await lift(calm.page, "poker");
  expect(hovered.translate).toBe("none");
  expect(hovered.edge).not.toBe(rest.edge);
  expect(hovered.halo).not.toBe("none");
  // …and no opening animation runs at all.
  expect(await calm.page.locator(".wk__title").evaluate((e) => e.getAnimations().length)).toBe(0);
  await calm.ctx.close();
});

for (const vp of [[1440, 900], [1024, 768], [390, 844], [320, 568]] as const) {
  test(`${vp[0]}×${vp[1]}: no horizontal overflow, targets ≥ 44px, every capture decodes, no console errors`, async ({ browser }) => {
    const { ctx, page, errors } = await at(browser, vp, { reducedMotion: "no-preference" });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(vp[0]);
    const small = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>(".wk a[href]")]
      .map((el) => ({ t: el.textContent!.trim().slice(0, 24), h: el.getBoundingClientRect().height })).filter((r) => r.h < 44));
    expect(small).toEqual([]);
    await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 300) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } });
    await expect.poll(() => page.locator(".wk img").evaluateAll((is) => is.every((i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0)), { timeout: 15000 }).toBe(true);
    expect(errors).toEqual([]);
    await ctx.close();
  });
}

test("structure: one h1, four product h2s, a landmark, and four empty hidden P4 demo slots", async ({ page }) => {
  await page.goto(ROUTE);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("article h2")).toHaveText(NAMES);
  await expect(page.getByRole("main")).toHaveCount(1);
  for (const n of NAMES) await expect(page.getByRole("article", { name: n })).toHaveCount(1);
  const slots = await page.locator("[data-demo-slot]").evaluateAll((s) => s.map((e) => ({ id: e.getAttribute("data-demo-slot"), hidden: (e as HTMLElement).hidden, empty: e.childNodes.length === 0, shown: (e as HTMLElement).offsetParent !== null })));
  expect(slots).toEqual(["poker", "aegis", "developeros", "gravity-flow"].map((id) => ({ id, hidden: true, empty: true, shown: false })));
});

for (const [label, vp, opts] of [
  ["1440, motion on", [1440, 900], { reducedMotion: "no-preference" }],
  ["390, motion on", [390, 844], { reducedMotion: "no-preference" }],
  ["1440, reduced motion", [1440, 900], { reducedMotion: "reduce" }],
] as const) {
  test(`axe (WCAG 2.2 A/AA): no violations — ${label}`, async ({ browser }) => {
    const { ctx, page } = await at(browser, vp, opts);
    await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 300) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } scrollTo(0, 0); });
    await page.waitForTimeout(1400);
    await page.addScriptTag({ path: AXE });
    const r = await page.evaluate(() => (window as unknown as { axe: { run: (c: unknown, o: unknown) => Promise<{ violations: { id: string; nodes: unknown[] }[]; incomplete: { id: string; nodes: unknown[] }[]; passes: unknown[] }> } })
      .axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] } }));
    console.log(`axe work ${label}: violations ${r.violations.length}, passes ${r.passes.length}, incomplete ${r.incomplete.map((i) => `${i.id}×${i.nodes.length}`).join(", ") || "none"}`);
    expect(r.violations.map((v) => `${v.id}×${v.nodes.length}`)).toEqual([]);
    await ctx.close();
  });
}
