// tests/e2e/page.spec.ts — the whole page (M10): structure, targets, errors, no WebGL anywhere, eight viewports.
import { test, expect } from "playwright/test";
import fs from "node:fs";
import { open, VIEWPORTS, COUNT_WEBGL, scrollThrough, decodedImages } from "../support/page";

test("landmarks and heading outline: one h1, then each product and section as an h2", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("main")).toHaveCount(1); await expect(page.locator("footer")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveText("I build software end to end.");
  const outline = await page.evaluate(() => [...document.querySelectorAll("main h1, main h2, main h3")].map((h) => Number(h.tagName[1])));
  for (let i = 1; i < outline.length; i++) expect(outline[i] - outline[i - 1], `h${outline[i - 1]} → h${outline[i]} at ${i}`).toBeLessThanOrEqual(1);
  expect(await page.locator("main h2").allTextContents()).toEqual([
    "T Poker: Your home game, handled.", "Aegis", "DeveloperOS", "GRAVITY FLOW", "Two more",
    "Engineer by training.Builder by nature.", "Tools behind the work.", "Think. Build. Ship.", "Let's build somethingpeople use."]);
});

test("no eyebrow, no chapter numbers, no metric tiles, no tracked monospace labels on the page", async ({ page }) => {
  await page.goto("/");
  const tracked = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>("main *, header *, footer *")]
    .filter((e) => e.offsetParent && e.childElementCount === 0 && e.textContent!.trim())
    .filter((e) => { const cs = getComputedStyle(e); return /mono/i.test(cs.fontFamily) && (cs.textTransform === "uppercase" || parseFloat(cs.letterSpacing) > 0.5) && !e.closest("code"); })
    .map((e) => e.textContent!.trim().slice(0, 30)));
  expect(tracked).toEqual([]);
  await expect(page.locator("[data-chapter-num], .work-intro__n, .flagship__metrics, .about__fact dd, .stack-row__lead")).toHaveCount(0);
  expect(await page.locator("main").textContent()).not.toMatch(/6,210|8,117|CI jobs|Available for work/);
});

for (const vp of VIEWPORTS) {
  test(`${vp[0]}×${vp[1]}: no horizontal overflow, no WebGL context, every image decodes`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: vp[0], height: vp[1] }, isMobile: vp[0] < 900, hasTouch: vp[0] < 900, reducedMotion: "reduce" });
    await ctx.addInitScript(COUNT_WEBGL);
    const page = await ctx.newPage();
    const failed: string[] = []; page.on("requestfailed", (r) => failed.push(r.url()));
    page.on("response", (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });
    await page.goto("/", { waitUntil: "networkidle" });
    await scrollThrough(page); await page.waitForLoadState("networkidle");
    // Against the configured width, not innerWidth: mobile emulation widens the layout viewport to fit an overflow
    // (and zooms out), so innerWidth would hide exactly the bug this guards against.
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(vp[0]);
    expect(await page.evaluate(() => innerWidth)).toBe(vp[0]);
    expect(await page.evaluate(() => (window as unknown as { __gl: number }).__gl)).toBe(0);
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect.poll(async () => { const r = await decodedImages(page, "main"); return r.length > 0 && r.every((x) => x.ok); }, { timeout: 20000 }).toBe(true);
    expect(failed).toEqual([]);
    await ctx.close();
  });
}

test("every interactive element is ≥ 44px tall below lg (390 and 320)", async ({ browser }) => {
  for (const vp of [[390, 844], [320, 568]] as const) {
    const { ctx, page } = await open(browser, vp);
    const small = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>("header a[href], header button, main a[href], main button, main label, footer a[href]")]
      .filter((el) => el.offsetParent && getComputedStyle(el).visibility !== "hidden" && !el.closest(".plates"))
      .map((el) => ({ t: (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 30), h: el.getBoundingClientRect().height }))
      .filter((r) => r.h < 44));
    expect(small, `${vp[0]}`).toEqual([]);
    await ctx.close();
  }
});

test("zero console errors while wheel-scrolling from the top to the footer", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("/", { waitUntil: "networkidle" });
  await page.mouse.move(700, 450);
  const bottom = () => page.evaluate(() => scrollY + innerHeight >= document.documentElement.scrollHeight - 2);
  for (let i = 0; i < 400 && !(await bottom()); i++) { await page.mouse.wheel(0, 700); await page.waitForTimeout(30); }
  expect(await bottom()).toBe(true);
  await page.waitForTimeout(500);
  expect(errors).toEqual([]);
});

test("no animation-frame loop runs once the page is still (top, middle, bottom)", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  for (const at of [0, 0.5, 1]) {
    await page.evaluate((at) => scrollTo({ top: (document.documentElement.scrollHeight - innerHeight) * at, behavior: "instant" as ScrollBehavior }), at);
    await page.waitForTimeout(700);
    const n = await page.evaluate(async () => { let n = 0; const o = window.requestAnimationFrame; window.requestAnimationFrame = (cb) => o((t) => { n++; cb(t); }); await new Promise((r) => setTimeout(r, 1000)); window.requestAnimationFrame = o; return n; });
    expect(n, `at ${at}`).toBe(0);
  }
});

test("axe: no WCAG 2.2 A/AA or best-practice violations — light and dark, 1440 and 390, chat open too", async ({ browser }) => {
  test.setTimeout(180_000);
  const AXE = fs.readFileSync("node_modules/axe-core/axe.min.js", "utf8");
  const run = (page: import("playwright/test").Page) => page.evaluate(async () => {
    const r = await (window as unknown as { axe: { run: (d: Document, o: object) => Promise<{ violations: { id: string; nodes: { target: string[] }[] }[] }> } }).axe.run(document,
      { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa", "best-practice"] } });
    return r.violations.map((x) => `${x.id}: ${x.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`);
  });
  for (const theme of ["light", "dark"] as const) for (const vp of [[1440, 900], [390, 844]] as const) {
    const { ctx, page } = await open(browser, vp, { theme });
    await scrollThrough(page);
    await page.addScriptTag({ content: AXE });
    expect(await run(page), `${theme} ${vp[0]}`).toEqual([]);
    // The assistant's panel, open, with the offline answer in it.
    await page.setExtraHTTPHeaders({ "x-real-ip": `axe-${theme}-${vp[0]}-${Date.now()}` });
    await page.locator("[data-chat-launcher]").click();
    await page.locator("[data-chat-panel] input").fill("Aegis?"); await page.keyboard.press("Enter");
    await expect(page.locator("[data-chat-transcript]")).toContainText("offline right now");
    // The offline reply comes back within the panel's 240 ms fade-in; measure contrast once it has fully appeared.
    await expect.poll(() => page.locator("[data-chat-panel]").evaluate((e) => getComputedStyle(e).opacity)).toBe("1");
    expect(await run(page), `${theme} ${vp[0]} chat open`).toEqual([]);
    await ctx.close();
  }
});

// Carried over from M9's suite (images.spec, polish.spec), where the feature still exists in M10.
test("every image is a pre-encoded file: nothing goes through the on-demand image optimiser", async ({ page }) => {
  const optimised: string[] = []; page.on("request", (r) => { if (r.url().includes("/_next/image")) optimised.push(r.url()); });
  await page.goto("/", { waitUntil: "networkidle" });
  await scrollThrough(page); await page.waitForLoadState("networkidle");
  expect(optimised).toEqual([]);
  const srcs = await page.locator("main img").evaluateAll((is) => is.map((i) => (i as HTMLImageElement).currentSrc).filter(Boolean));
  for (const s of srcs) expect(s, s).toMatch(/\/(work|projects)\/[\w.-]+\.(avif|webp|png|jpg)$/);
});

test("no visible text renders below 12px, at 1440 and 390", async ({ browser }) => {
  for (const vp of [[1440, 900], [390, 844]] as const) {
    const { ctx, page } = await open(browser, vp);
    const tiny = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>("body *")].filter((e) => {
      if (![...e.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim())) return false;
      const cs = getComputedStyle(e), r = e.getBoundingClientRect();
      if (r.width === 0 || r.height === 0 || cs.visibility === "hidden" || e.closest(".sr-only, [aria-hidden=true]")) return false;
      return parseFloat(cs.fontSize) < 12;
    }).map((e) => `${e.tagName}.${e.className}: ${getComputedStyle(e).fontSize} "${e.textContent!.trim().slice(0, 30)}"`));
    expect(tiny, `${vp[0]}`).toEqual([]);
    await ctx.close();
  }
});
