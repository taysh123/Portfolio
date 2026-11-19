// tests/e2e/lab-hero-a.spec.ts — Concept A's cinematic hero, the first screen of / (the release, R1–R15; D1 reopened by
// Tay, 2026-11-18; D2 not reopened, so no WebGL). Ported in S20 from the prototype's /lab/hero-a spec (the file keeps
// its name: docs/CINEMATIC_SYSTEM.md points here). The page-wide guards stay in budget.spec.ts and page.spec.ts (the
// budget, no WebGL, one 2D canvas; / indexed and /lab gone). This file checks the hero's own share: where its code
// ships, its accessibility, the no-JS and reduced-motion paths, and its loop's pause behaviour.
import { test, expect, type Page, type Browser, type BrowserContextOptions } from "playwright/test";
import zlib from "node:zlib";
import { COUNT_WEBGL } from "../support/page";

const ROUTE = "/";
// axe-core is already installed (eslint-config-next → eslint-plugin-jsx-a11y); no new dependency.
const AXE = require.resolve("axe-core/axe.min.js");
const REVEAL_MS = 1400;   // the last block starts at 5 × 70ms and runs 700ms; with margin
const A11Y_REDUCED = encodeURIComponent(JSON.stringify({ reducedMotion: true, highContrast: false, largeText: false }));

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
/** rAF callbacks the page asks for over `ms` (the loop looks requestAnimationFrame up on every frame). */
const rafCount = (page: Page, ms = 1000) => page.evaluate(async (ms) => {
  let n = 0; const o = window.requestAnimationFrame;
  window.requestAnimationFrame = (cb) => o((t) => { n++; cb(t); });
  await new Promise((r) => setTimeout(r, ms)); window.requestAnimationFrame = o; return n;
}, ms);
const field = (page: Page) => page.locator("canvas.hxa__field");
const hero = (page: Page) => page.locator("#hero");
const firstLoadJs = async (request: import("playwright/test").APIRequestContext, baseURL: string, path: string) => {
  const html = await (await request.get(path)).text();
  const srcs = [...new Set([...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]))];
  const bodies = await Promise.all(srcs.map(async (s) => (await request.get(new URL(s, baseURL).toString())).body()));
  return { html, srcs, bodies, gz: bodies.reduce((a, b) => a + zlib.gzipSync(b).length, 0) };
};

test("budget: /'s first-load JS ≤ 205.7 KB gzip and HTML ≤ 568 KB; the field's code ships with / and no other page", async ({ request, baseURL }) => {
  const home = await firstLoadJs(request, baseURL!, ROUTE);
  const privacy = await firstLoadJs(request, baseURL!, "/privacy");
  test.info().annotations.push({ type: "measured", description:
    `/ JS ${(home.gz / 1024).toFixed(2)} KiB over ${home.srcs.length} scripts, HTML ${(Buffer.byteLength(home.html) / 1024).toFixed(2)} KB; ` +
    `/privacy JS ${(privacy.gz / 1024).toFixed(2)} KiB, HTML ${(Buffer.byteLength(privacy.html) / 1024).toFixed(2)} KB` });
  console.log(test.info().annotations.at(-1)!.description);
  expect(home.gz / 1024).toBeLessThanOrEqual(205.7);
  expect(Buffer.byteLength(home.html) / 1024).toBeLessThanOrEqual(568);
  // The field's code ships only with the page that draws it: no first-load script of /privacy carries it.
  expect(home.bodies.some((b) => b.toString().includes("hxa__field"))).toBe(true);
  expect(privacy.bodies.some((b) => b.toString().includes("hxa__field"))).toBe(false);
});

// The prototype's "never indexed" half is page.spec.ts's guard now (R12: / is index, follow with its canonical; /lab
// answers 404). What is left here is "never linked".
test("nothing points at /lab: the sitemap lists only /, robots.txt and / never mention it", async ({ request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])).toEqual(["https://tayshofer.dev"]);
  expect(await (await request.get("/robots.txt")).text()).not.toMatch(/\/lab/);
  expect(await (await request.get("/", { headers: { Accept: "text/html" } })).text()).not.toMatch(/href="\/lab/);
});

test("without JavaScript: every word and action is in the HTML, visible, and works", async ({ browser }) => {
  const { ctx, page } = await at(browser, [1440, 900], { javaScriptEnabled: false });
  await page.waitForTimeout(REVEAL_MS);   // the CSS reveal runs without JS and ends visible
  await expect(page.locator("h1")).toHaveText("Building software. Turning ideas into products.");
  // The locked hero's top line is the header's row now (R2): it rises first, and ends visible too.
  for (const sel of [".site-nav__row", ".hxa__eyebrow", ".hxa__title", ".hxa__lede", ".hxa__ctas", ".hxa__featured"])
    expect(await page.locator(sel).evaluate((e) => getComputedStyle(e).opacity), sel).toBe("1");
  // One pill is shown at any width: at 1440 it is the header's.
  await expect(page.locator(".hxa__pill:visible")).toHaveCount(1);
  await expect(page.locator("header .hxa__pill")).toHaveText("Available for opportunities");
  await expect(page.locator("header .hxa__pill")).toBeVisible();
  await expect(hero(page).getByText("Software Engineer", { exact: true })).toBeVisible();
  // R7: the hero's links are in-page.
  await expect(hero(page).getByRole("link", { name: "Explore my work" })).toHaveAttribute("href", "#work");
  const cv = hero(page).getByRole("link", { name: /^Download résumé/ });
  await expect(cv).toHaveAttribute("href", "/resume/Tay-Shofer-Software-Engineer-Resume.pdf");
  await expect(cv).toHaveAttribute("download", "Tay-Shofer-Software-Engineer-Resume.pdf");
  const nav = page.getByRole("navigation", { name: "Featured work" });
  expect(await nav.getByRole("link").evaluateAll((as) => as.map((a) => [a.querySelector("b")!.textContent, a.getAttribute("href")]))).toEqual([
    ["T Poker", "#work-poker"], ["Aegis", "#work-aegis"], ["DeveloperOS", "#work-developeros"], ["GRAVITY FLOW", "#work-gravity-flow"]]);
  await expect(field(page)).toHaveAttribute("data-state", "idle");   // an empty, transparent layer; nothing depends on it
  // The links really navigate with no client router: "Explore my work" lands on Work.
  await hero(page).getByRole("link", { name: "Explore my work" }).click();
  await expect(page).toHaveURL(/\/#work$/);
  await expect(page.locator("#work")).toBeAttached();
  await ctx.close();
});

test("the reveal never hides the largest paint: LCP is the headline, reported at first paint (motion on)", async ({ browser }) => {
  for (const vp of [[1440, 900], [390, 844]] as const) {
    const ctx = await browser.newContext({ viewport: { width: vp[0], height: vp[1] }, reducedMotion: "no-preference" });
    await ctx.addInitScript(`window.__lcp=[];window.__fcp=0;
      new PerformanceObserver(l=>l.getEntries().forEach(e=>__lcp.push([e.startTime,e.element&&e.element.className]))).observe({type:"largest-contentful-paint",buffered:true});
      new PerformanceObserver(l=>l.getEntries().forEach(e=>{if(e.name==="first-contentful-paint")__fcp=e.startTime})).observe({type:"paint",buffered:true});`);
    const page = await ctx.newPage();
    await page.goto(ROUTE, { waitUntil: "load" }); await page.waitForTimeout(REVEAL_MS);
    const { lcp, fcp } = await page.evaluate(() => ({ lcp: (window as unknown as { __lcp: [number, string][] }).__lcp, fcp: (window as unknown as { __fcp: number }).__fcp }));
    expect(lcp.length, `${vp[0]}: an LCP entry exists`).toBeGreaterThan(0);
    expect(lcp.at(-1)![1], `${vp[0]}`).toBe("hxa__title");
    expect(lcp.at(-1)![0], `${vp[0]}: LCP is the first contentful paint`).toBe(fcp);
    await ctx.close();
  }
});

for (const [name, opts] of [["the OS setting", { reducedMotion: "reduce" }], ["the site's own switch", {}]] as const) {
  test(`reduced motion (${name}): one still frame, no loop, no reveal`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...opts });
    if (name === "the site's own switch") await ctx.addCookies([{ name: "a11y", value: A11Y_REDUCED, url: "http://localhost:3400" }]);
    const page = await ctx.newPage();
    await page.goto(ROUTE, { waitUntil: "networkidle" });
    await expect(field(page)).toHaveAttribute("data-state", "static");
    expect(Number(await field(page).getAttribute("data-nodes"))).toBeGreaterThan(0);
    await page.waitForTimeout(2500);   // past the first signal's launch time, had the loop been running
    await expect(field(page)).toHaveAttribute("data-pulses", "0");
    await page.mouse.move(1000, 400); await page.mouse.move(1100, 450);
    expect(await rafCount(page)).toBe(0);
    expect(await page.locator(".hxa__title").evaluate((e) => e.getAnimations().length)).toBe(0);
    expect(await page.locator(".site-nav__row").evaluate((e) => e.getAnimations().length)).toBe(0);   // the header's row: no reveal either
    expect(await page.locator(".hxa__glow").evaluateAll((gs) => gs.map((g) => g.style.transform + g.style.opacity))).toEqual(["", ""]);   // the glows rest
    expect(await page.locator(".hxa__featured").evaluate((e) => getComputedStyle(e).opacity)).toBe("1");
    await ctx.close();
  });
}

test("motion on: the loop runs, and stops while the tab is hidden or the field is off screen", async ({ browser }) => {
  const { ctx, page, errors } = await at(browser, [1440, 900], { reducedMotion: "no-preference" });
  await expect(field(page)).toHaveAttribute("data-state", "running");
  expect(await rafCount(page, 600)).toBeGreaterThan(10);
  // The glows drift and breathe with the loop (transform and opacity, 5 Hz), and never run as a CSS animation.
  const sky = () => page.locator(".hxa__glow").evaluateAll((gs) => gs.map((g) => `${g.style.transform}|${g.style.opacity}`));
  const s0 = await sky(); await page.waitForTimeout(1200); const s1 = await sky();
  expect(s0.every((x) => x.startsWith("translate3d("))).toBe(true);
  expect(s1).not.toEqual(s0);
  expect(await page.locator(".hxa__glow").evaluateAll((gs) => gs.map((g) => g.getAnimations().length))).toEqual([0, 0]);
  for (const o of s1.map((x) => Number(x.split("|")[1]))) expect(o).toBeLessThanOrEqual(1);
  // Hidden tab.
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, get: () => true }); document.dispatchEvent(new Event("visibilitychange")); });
  await expect(field(page)).toHaveAttribute("data-state", "paused");
  expect(await rafCount(page, 600)).toBe(0);
  const held = await sky(); await page.waitForTimeout(600); expect(await sky()).toEqual(held);   // the sky stops with the loop
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, get: () => false }); document.dispatchEvent(new Event("visibilitychange")); });
  await expect(field(page)).toHaveAttribute("data-state", "running");
  // Off screen: scroll the hero away (to the end of the page), then come back.
  await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" as ScrollBehavior }));
  await expect(field(page)).toHaveAttribute("data-state", "paused");
  expect(await rafCount(page, 600)).toBe(0);
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }));
  await expect(field(page)).toHaveAttribute("data-state", "running");
  // The pointer is welcome and costs nothing visible to the page's structure.
  for (let i = 0; i < 12; i++) { await page.mouse.move(900 + i * 20, 300 + i * 12); await page.waitForTimeout(30); }
  expect(await page.evaluate(() => (window as unknown as { __gl: number }).__gl)).toBe(0);
  await expect(page.locator("canvas")).toHaveCount(1);
  expect(errors).toEqual([]);
  await ctx.close();
});

for (const [vp, cap] of [[[1440, 900], 4], [[390, 844], 2]] as const) {
  test(`${vp[0]}×${vp[1]}: signals travel now and then, never more than ${cap} at once`, async ({ browser }) => {
    const { ctx, page, errors } = await at(browser, vp, { reducedMotion: "no-preference" });
    const seen = await page.evaluate(async () => {
      const c = document.querySelector<HTMLCanvasElement>("canvas.hxa__field")!, out: number[] = [];
      for (let i = 0; i < 100; i++) { out.push(Number(c.dataset.pulses ?? 0)); await new Promise((r) => setTimeout(r, 100)); }
      return out;
    });
    expect(Math.max(...seen), "capped").toBeLessThanOrEqual(cap);
    expect(seen.some((n) => n > 0), "at least one signal in 10 s").toBe(true);
    expect(errors).toEqual([]);
    await ctx.close();
  });
}

for (const vp of [[1440, 900], [1024, 768], [390, 844], [320, 568]] as const) {
  test(`${vp[0]}×${vp[1]}: no horizontal overflow, targets ≥ 44px, the lighter field on phones`, async ({ browser }) => {
    const { ctx, page, errors } = await at(browser, vp, { reducedMotion: "no-preference" });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(vp[0]);
    const small = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>(".hxa a[href], .hxa button")]
      .map((el) => ({ t: el.textContent!.trim().slice(0, 24), h: el.getBoundingClientRect().height })).filter((r) => r.h < 44));
    expect(small).toEqual([]);
    const nodes = Number(await field(page).getAttribute("data-nodes"));
    if (vp[0] < 640) expect(nodes).toBeLessThanOrEqual(48); else expect(nodes).toBeGreaterThanOrEqual(40);
    // The essentials are in the first screen: the headline and both actions.
    for (const sel of [".hxa__title", ".hxa__ctas"]) expect(await page.locator(sel).evaluate((e) => e.getBoundingClientRect().bottom), sel).toBeLessThanOrEqual(vp[1]);
    expect(errors).toEqual([]);
    await ctx.close();
  });
}

test("keyboard: every control takes focus in reading order, each with a visible 2px ring", async ({ browser }) => {
  const { ctx, page } = await at(browser, [1440, 900]);
  const seen: { at: string; ring: string }[] = [];
  for (let i = 0; i < 15; i++) {
    await page.keyboard.press("Tab");
    seen.push(await page.evaluate(async () => {
      const e = document.activeElement as HTMLElement;
      // The header's four links ease their colours, the ring's included, over 150ms: read the ring once it has settled.
      await Promise.all(e.getAnimations().map((a) => a.finished));
      const cs = getComputedStyle(e);
      return { at: e.getAttribute("href") ?? e.getAttribute("aria-label") ?? e.textContent!.trim(), ring: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}` };
    }));
  }
  // The skip link, the header (R2: the wordmark, the four destinations, accessibility, "Get in touch"), the hero's two
  // actions and Featured work, then on into Work's first panel.
  expect(seen.map((s) => s.at)).toEqual(["#main", "#hero", "#work", "#about", "#skills", "#contact", "Accessibility settings", "#contact",
    "#work", "/resume/Tay-Shofer-Software-Engineer-Resume.pdf",
    "#work-poker", "#work-aegis", "#work-developeros", "#work-gravity-flow", "https://app.tpoker.app/"]);
  // Every control, the site chrome included: a solid 2px ring in the field's cyan (13:1 on the dark field).
  for (const s of seen) expect(s.ring, s.at).toBe("solid 2px rgb(46, 230, 214)");
  // Names as assistive tech computes them, separate words included.
  await expect(page.getByRole("link", { name: "Tay Shofer — home", exact: true })).toHaveCount(1);
  await expect(page.getByRole("link", { name: "Download résumé (PDF · two pages, 79 KB)", exact: true })).toHaveCount(1);
  await ctx.close();
});

test("structure: one h1, banner, main and a labelled nav; the canvas is hidden from assistive tech", async ({ page }) => {
  await page.goto(ROUTE);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByRole("banner")).toHaveCount(1);
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(page.getByRole("navigation", { name: "Featured work" })).toHaveCount(1);
  await expect(hero(page).locator("h2")).toHaveText(["Featured work"]);
  await expect(field(page)).toHaveAttribute("aria-hidden", "true");
  expect(await field(page).evaluate((e) => getComputedStyle(e).pointerEvents)).toBe("none");
  // The wordmark is the header's (R2), and it leads to the top of the page.
  await expect(page.getByRole("link", { name: "Tay Shofer — home", exact: true })).toHaveAttribute("href", "#hero");
});

for (const [label, vp, opts] of [
  ["1440, motion on", [1440, 900], { reducedMotion: "no-preference" }],
  ["390, motion on", [390, 844], { reducedMotion: "no-preference" }],
  ["1440, reduced motion", [1440, 900], { reducedMotion: "reduce" }],
] as const) {
  test(`axe (WCAG 2.2 A/AA): no violations — ${label}`, async ({ browser }) => {
    const { ctx, page } = await at(browser, vp, opts);
    await page.waitForTimeout(REVEAL_MS);
    await page.addScriptTag({ path: AXE });
    const r = await page.evaluate(() => (window as unknown as { axe: { run: (c: unknown, o: unknown) => Promise<{ violations: { id: string; nodes: unknown[] }[]; incomplete: { id: string; nodes: unknown[] }[]; passes: unknown[] }> } })
      .axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] } }));
    const incomplete = r.incomplete.map((i) => `${i.id}×${i.nodes.length}`).join(", ") || "none";
    test.info().annotations.push({ type: "axe", description: `${label}: ${r.passes.length} rules pass, 0 violations expected; needs review: ${incomplete}` });
    console.log(`axe ${label}: violations ${r.violations.length}, passes ${r.passes.length}, incomplete ${incomplete}`);
    expect(r.violations.map((v) => `${v.id}×${v.nodes.length}`)).toEqual([]);
    await ctx.close();
  });
}
