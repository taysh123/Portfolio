// tests/e2e/page.spec.ts — the whole page (M10): structure, targets, errors, no WebGL anywhere, eight viewports.
import { test, expect } from "playwright/test";
import fs from "node:fs";
import { open, VIEWPORTS, COUNT_WEBGL, scrollThrough, decodedImages } from "../support/page";

test("landmarks and heading outline: one h1, then each section as an h2 and each product as an h3", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("main")).toHaveCount(1); await expect(page.locator("footer")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveText("Building software. Turning ideas into products.");
  const outline = await page.evaluate(() => [...document.querySelectorAll("main h1, main h2, main h3")].map((h) => Number(h.tagName[1])));
  for (let i = 1; i < outline.length; i++) expect(outline[i] - outline[i - 1], `h${outline[i - 1]} → h${outline[i]} at ${i}`).toBeLessThanOrEqual(1);
  expect(await page.locator("main h2").allTextContents()).toEqual([
    "Featured work", "Four projects, built end to end.", "Two more",
    "Engineer by training. Builder by nature.", "Tools behind the work.", "Think. Build. Ship.", "Let's build something people use."]);
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
    // R12 (Tay, session 16): exactly one canvas, the hero's 2D field, hidden from assistive tech (D2: still no WebGL).
    await expect(page.locator("canvas")).toHaveCount(1);
    await expect(page.locator("#hero canvas")).toHaveAttribute("aria-hidden", "true");
    await expect.poll(async () => { const r = await decodedImages(page, "main"); return r.length > 0 && r.every((x) => x.ok); }, { timeout: 20000 }).toBe(true);
    expect(failed).toEqual([]);
    await ctx.close();
  });
}

// R12 (Tay, session 16), a new guard: the page's one canvas is the hero's field, drawn in 2D and hidden from assistive
// tech. Every context any canvas asks for is recorded: only "2d" may appear. The WebGL guards (the zero count above, and
// tests/unit/dead-code.test.ts) are unchanged: D2 is not reopened.
const COUNT_CONTEXTS = `(() => { window.__ctx = []; const o = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (t, ...a) { window.__ctx.push(String(t)); return o.call(this, t, ...a); }; })();`;
test("exactly one canvas: the hero's field, 2D and aria-hidden (1440 and 390, motion on and reduced)", async ({ browser }) => {
  for (const vp of [[1440, 900], [390, 844]] as const) for (const reducedMotion of ["no-preference", "reduce"] as const) {
    const label = `${vp[0]} ${reducedMotion}`;
    const ctx = await browser.newContext({ viewport: { width: vp[0], height: vp[1] }, isMobile: vp[0] < 900, hasTouch: vp[0] < 900, reducedMotion });
    await ctx.addInitScript(COUNT_WEBGL);
    await ctx.addInitScript(COUNT_CONTEXTS);
    const page = await ctx.newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    await scrollThrough(page);
    await expect(page.locator("canvas"), label).toHaveCount(1);
    const canvas = page.locator("#hero canvas");
    await expect(canvas, label).toHaveCount(1);
    await expect(canvas, label).toHaveAttribute("aria-hidden", "true");
    const contexts = () => page.evaluate(() => (window as unknown as { __ctx: string[] }).__ctx);
    await expect.poll(async () => (await contexts()).length, { message: `${label}: the field draws` }).toBeGreaterThan(0);
    expect([...new Set(await contexts())], label).toEqual(["2d"]);
    expect(await page.evaluate(() => (window as unknown as { __gl: number }).__gl), label).toBe(0);
    await ctx.close();
  }
});

// R12 (Tay, session 16), a new guard: / is the page search engines index. It says index, follow, names the site's
// origin as its one canonical, and carries no noindex in its markup or its headers.
test("/ is indexable: index, follow, the canonical https://tayshofer.dev, and no noindex anywhere", async ({ request }) => {
  const r = await request.get("/", { headers: { Accept: "text/html" } });
  expect(r.status()).toBe(200);
  expect(r.headers()["x-robots-tag"] ?? "").not.toMatch(/noindex|nofollow|\bnone\b/i);
  const html = await r.text();
  expect(html).toContain('<meta name="robots" content="index, follow"/>');
  expect(html).toMatch(/<meta name="googlebot" content="index, follow[,"]/);
  expect(html).toContain('<link rel="canonical" href="https://tayshofer.dev"/>');
  expect(html.match(/rel="canonical"/g)).toHaveLength(1);
  expect(html).not.toMatch(/noindex|nofollow/i);
});

// R12 (Tay, session 16), a new guard: the prototype's routes are not shipped (R1: /lab never reaches main).
test("/lab, /lab/hero-a and /lab/work answer 404", async ({ request }) => {
  for (const path of ["/lab", "/lab/hero-a", "/lab/work"]) {
    const r = await request.get(path, { headers: { Accept: "text/html" }, maxRedirects: 0 });
    expect(r.status(), path).toBe(404);
  }
});

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

// R12 (Tay, session 16): the hero's field is live at the top, so the top is measured with reduced motion (one still frame,
// no loop); in the middle and at the bottom the field is off screen and paused, so nothing may run there.
test("no animation-frame loop runs once the page is still (top with reduced motion, middle, bottom)", async ({ page }) => {
  for (const [at, reducedMotion] of [[0, "reduce"], [0.5, "no-preference"], [1, "no-preference"]] as const) {
    await page.emulateMedia({ reducedMotion });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.evaluate((at) => scrollTo({ top: (document.documentElement.scrollHeight - innerHeight) * at, behavior: "instant" as ScrollBehavior }), at);
    await page.waitForTimeout(700);
    const n = await page.evaluate(async () => { let n = 0; const o = window.requestAnimationFrame; window.requestAnimationFrame = (cb) => o((t) => { n++; cb(t); }); await new Promise((r) => setTimeout(r, 1000)); window.requestAnimationFrame = o; return n; });
    expect(n, `at ${at}`).toBe(0);
  }
});

test("axe: no WCAG 2.2 A/AA or best-practice violations — dark (the only theme), 1440 and 390, chat open too", async ({ browser }) => {
  test.setTimeout(180_000);
  const AXE = fs.readFileSync("node_modules/axe-core/axe.min.js", "utf8");
  const run = (page: import("playwright/test").Page) => page.evaluate(async () => {
    const r = await (window as unknown as { axe: { run: (d: Document, o: object) => Promise<{ violations: { id: string; nodes: { target: string[] }[] }[] }> } }).axe.run(document,
      { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa", "best-practice"] } });
    return r.violations.map((x) => `${x.id}: ${x.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`);
  });
  for (const theme of ["dark"] as const) for (const vp of [[1440, 900], [390, 844]] as const) {
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
