import { test, expect } from "playwright/test";
import sharp from "sharp";

// At rest the surface is untransformed: no transform, the 2D identity, or the 3D identity the stage writes.
const identity = /^(none|matrix\(1, 0, 0, 1, 0, 0\)|matrix3d\(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1\))$/;
const surfaceTransform = (page: import("playwright/test").Page) =>
  page.locator(".entrance__surface").evaluate((el) => getComputedStyle(el).transform);

test("skip intro lands on the hero at identity, focuses the h1, shows the nav", async ({ page }) => {
  await page.goto("/");
  await page.locator("[data-skip-intro]").click();
  await expect(page.locator("#hero-title")).toBeFocused();
  await expect.poll(() => surfaceTransform(page)).toMatch(identity);
  await expect(page.locator("html")).toHaveAttribute("data-entrance-done", "true");
});

test("jumping to #work from the top leaves the hero at identity (Review Focus 1)", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("/");
  await page.evaluate(() => document.getElementById("work")!.scrollIntoView({ behavior: "instant" as ScrollBehavior }));
  await expect(page.locator("html")).toHaveAttribute("data-entrance-done", "true");
  await expect.poll(() => surfaceTransform(page)).toMatch(identity);
  expect(errors).toEqual([]);
});

test("resize mid-entrance re-derives framing (Review Focus 2)", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, document.getElementById("entrance")!.offsetHeight * 0.45));
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator("#entrance")).toHaveAttribute("data-framing", "portrait");
});

test("in-app reduced motion switches to static mode immediately (Review Focus 3)", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.documentElement.setAttribute("data-reduced-motion", "true"));
  const h = await page.locator("#entrance").evaluate((el) => el.getBoundingClientRect().height);
  expect(h).toBeLessThan(await page.evaluate(() => window.innerHeight * 2.5));
  await expect(page.locator("header[data-entrance-nav]")).toHaveCSS("opacity", "1");
});

test("OS reduced motion: not pinned, hero in flow", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage(); await page.goto("/");
  await expect(page.locator(".entrance__stage")).toHaveCSS("position", "static");
  await expect(page.locator("h1")).toHaveCount(1);
  await ctx.close();
});

test("missing manifest: poster stays and skip still works (Review Focus 4)", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", (e) => errors.push(String(e)));
  await page.route("**/entrance/manifest.json", (r) => r.fulfill({ status: 404, body: "" }));
  await page.goto("/");
  await page.locator("[data-skip-intro]").click();
  await expect(page.locator("#hero-title")).toBeFocused();
  expect(errors).toEqual([]);
});

test("reload restored mid-entrance renders consistently (Review Focus 5)", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, document.getElementById("entrance")!.offsetHeight * 0.5));
  await page.reload();
  await page.waitForTimeout(500);
  expect(errors).toEqual([]);
});

for (const [w, h] of [[375, 667], [390, 844], [768, 1024], [1366, 768], [1440, 900], [844, 390]] as const) {
  test(`no horizontal overflow at ${w}x${h}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h }); await page.goto("/");
    const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(over).toBeLessThanOrEqual(0);
  });
}

test("no JavaScript: static entrance, hero in flow, nav usable, content without the runtime", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const frameRequests: string[] = [];
  page.on("request", (r) => { if (/\/entrance\/(landscape|portrait)\/|manifest\.json/.test(r.url())) frameRequests.push(r.url()); });
  await page.goto("/");
  // not pinned
  await expect(page.locator(".entrance__stage")).toHaveCSS("position", "static");
  const entranceH = await page.locator("#entrance").evaluate((el) => el.getBoundingClientRect().height);
  expect(entranceH).toBeLessThan(900 * 2.5);
  // static still renders (the poster/canvas layers are hidden)
  const still = page.locator(".entrance__still img");
  await expect(still).toBeVisible();
  expect(await still.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  await expect(page.locator(".entrance__canvas")).toBeHidden();
  // the real Hero in normal flow, visible, below the still
  const hero = page.locator("#hero");
  await expect(hero).toBeVisible();
  await expect(page.locator("#hero-title")).toBeVisible();
  const heroPos = await page.locator(".entrance__surface").evaluate((el) => getComputedStyle(el).position);
  expect(heroPos).toBe("static");
  await expect(page.locator("h1")).toHaveCount(1);
  // nav visible from first paint
  await expect(page.locator("header[data-entrance-nav]")).toHaveCSS("opacity", "1");
  // nav links work without JS (plain anchors)
  for (const [label, id] of [["Work", "work"], ["About", "about"], ["Stack", "skills"], ["Contact", "contact"]] as const) {
    const link = page.locator("header[data-entrance-nav] nav a", { hasText: label }).first();
    await expect(link).toHaveAttribute("href", `#${id}`);
    await link.click();
    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    await expect(page.locator(`#${id}`)).toBeInViewport();
  }
  // no horizontal overflow
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  // content never depended on the canvas/frame runtime
  expect(frameRequests).toEqual([]);
  await ctx.close();
});

test("no frames are requested before load except the poster", async ({ page }) => {
  // Observed through to the load event and beyond, then compared against loadEventStart —
  // stopping at domcontentloaded would pass trivially.
  await page.goto("/", { waitUntil: "networkidle" });
  // networkidle can land between the manifest/poster fetches and the first frame fetch: wait for the
  // sequence to actually start (it must, after load), then compare every frame's start with loadEventStart.
  await expect.poll(() => page.evaluate(() => performance.getEntriesByType("resource").filter((e) => /\/entrance\/(landscape|portrait)\//.test(e.name)).length), { timeout: 15000 }).toBeGreaterThan(0);
  const r = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    const frames = performance.getEntriesByType("resource").filter((e) => /\/entrance\/(landscape|portrait)\//.test(e.name));
    return { loadStart: nav.loadEventStart, frames: frames.length, early: frames.filter((e) => e.startTime < nav.loadEventStart).map((e) => e.name) };
  });
  expect(r.loadStart).toBeGreaterThan(0);
  expect(r.frames).toBeGreaterThan(0); // the sequence does load — after the load event
  expect(r.early).toEqual([]);
});

const heroAtRest = (page: import("playwright/test").Page) => page.evaluate(() => {
  const els = [...document.querySelectorAll<HTMLElement>("[data-hero-line], [data-hero-lead], [data-hero-ctas], [data-hero-name]")];
  return els.every((el) => getComputedStyle(el).transform === "none" && getComputedStyle(el).opacity === "1");
});

test("switching reduced motion on in the Accessibility panel hands back a hero at rest (review #1)", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1024 });
  await page.goto("/");
  // The nav (which carries the Accessibility button) is hidden until the entrance completes (spec §5), so the real
  // toggle is reachable only at the portal. There the stage has written its inline identity geometry — which must be cleared.
  await expect(page.locator("header[data-entrance-nav]")).toHaveCSS("opacity", "0");
  await page.locator("[data-skip-intro]").click();
  expect(await page.locator(".entrance__surface").evaluate((el) => el.getAttribute("style") ?? "")).toMatch(/width/);
  await page.locator("header[data-entrance-nav] nav").getByRole("button", { name: "Accessibility settings" }).click();
  await page.getByRole("switch", { name: /Reduced motion/ }).click();
  await expect(page.locator(".entrance__stage")).toHaveCSS("position", "static");
  await expect.poll(() => heroAtRest(page)).toBe(true);
  await expect(page.locator("[data-hero-line='1']")).toBeVisible();
  expect(await page.locator(".entrance__surface").evaluate((el) => el.getAttribute("style") ?? "")).toBe("");
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
});

test("the OS reduced-motion setting changing mid-session is followed (review #1)", async ({ page }) => {
  await page.goto("/");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".entrance__stage")).toHaveCSS("position", "static");
  await expect.poll(() => heroAtRest(page)).toBe(true);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator(".entrance__stage")).toHaveCSS("position", "sticky");
  await page.locator("[data-skip-intro]").click();
  await expect(page.locator("#hero-title")).toBeInViewport();
  await expect.poll(() => heroAtRest(page)).toBe(true);
});

test("Tab into the hero lands at identity and keeps focus on the control reached (review #4)", async ({ page }) => {
  await page.goto("/");
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press("Tab");
    if (await page.evaluate(() => !!document.activeElement?.closest("#hero"))) break;
  }
  const label = await page.evaluate(() => document.activeElement?.textContent?.trim());
  expect(label).toMatch(/Explore my work/);
  await expect(page.locator("html")).toHaveAttribute("data-entrance-done", "true");
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => document.activeElement?.textContent?.trim())).toBe(label);
  await expect.poll(() => surfaceTransform(page)).toMatch(identity);
});

test("skip intro leaves the Tab order once the portal completes (review #4)", async ({ page }) => {
  await page.goto("/");
  await page.locator("[data-skip-intro]").click();
  await expect(page.locator("[data-skip-intro]")).toBeHidden();
});

test("a deep link to /#hero arrives at the hero at identity (review #5)", async ({ page }) => {
  await page.goto("/#hero");
  await expect(page.locator("html")).toHaveAttribute("data-entrance-done", "true");
  await expect(page.locator("#hero-title")).toBeInViewport();
  await expect(page.locator(".entrance__surface")).toHaveCSS("opacity", "1");
  await expect.poll(() => surfaceTransform(page)).toMatch(identity);
});

test("the skip link lands on the h1 every time, not only the first (review #5)", async ({ page }) => {
  await page.goto("/");
  for (let round = 0; round < 2; round++) {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }));
    await page.locator("a[href='#main']").first().focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#hero-title")).toBeFocused();
    await expect(page.locator("html")).toHaveAttribute("data-entrance-done", "true");
  }
});

test("jumping mid-sequence never flashes the hero full-screen before its quad exists (review #2)", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const samples = await page.evaluate(async () => {
    const c = document.getElementById("entrance")!, surf = document.querySelector<HTMLElement>(".entrance__surface")!;
    window.scrollTo({ top: c.offsetTop + 0.6 * (c.offsetHeight - innerHeight), behavior: "instant" as ScrollBehavior });
    const out: { opacity: string; w: number }[] = [];
    for (let i = 0; i < 12; i++) {
      await new Promise((r) => requestAnimationFrame(r));
      const b = surf.getBoundingClientRect();
      out.push({ opacity: getComputedStyle(surf).opacity, w: b.width / innerWidth });
    }
    return out;
  });
  // Visible and full-width at p = 0.6 would be the flash: on the laptop, the screen is well under the viewport width.
  expect(samples.filter((s) => s.opacity !== "0" && s.w > 0.95)).toEqual([]);
});

// The phone's default (the scrub video), the canvas, and the canvas's reduced modes (single frame while
// moving, at a half-rate cadence).
for (const [label, exp] of [["", null], [" — canvas", { player: "canvas" }], [" — canvas, single-frame mode at 30 fps", { player: "canvas", mode: "single", cadence: "30" }]] as const)
test(`a fast jump settles on the picture a slow approach gives (adaptive cross-fade resolves at rest)${label}`, async ({ browser }) => {
  // A jump of > 1.25 frames draws the nearest frame alone (speed mode); once the scroll stops, the stage must
  // resolve to the exact blend for p. A phone: native scrolling, so each jump is one scroll event.
  const shoot = async (jump: boolean) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    if (exp) await page.addInitScript((x) => { (window as unknown as { __ENTRANCE_EXP__: unknown }).__ENTRANCE_EXP__ = x; }, exp);
    const to = (p: number) => page.evaluate((p) => { const c = document.getElementById("entrance")!; window.scrollTo({ top: c.offsetTop + p * (c.offsetHeight - innerHeight), behavior: "instant" as ScrollBehavior }); }, p);
    await page.goto("/", { waitUntil: "load" }); await page.waitForTimeout(2500);
    await to(0.75); await page.waitForTimeout(1800);
    if (jump) await to(0.85); else for (let k = 1; k <= 40; k++) { await to(0.75 + (0.1 * k) / 40); await page.waitForTimeout(34); }
    await page.waitForTimeout(1800);
    const raw = await sharp(await page.screenshot()).resize(390).removeAlpha().raw().toBuffer();
    await ctx.close(); return raw;
  };
  const [a, b] = [await shoot(true), await shoot(false)];
  let se = 0; for (let i = 0; i < a.length; i++) se += (a[i] - b[i]) ** 2;
  const psnr = 10 * Math.log10(65025 / Math.max(se / a.length, 1e-9));
  expect(psnr).toBeGreaterThan(40);                 // measured ~53 dB; a frame left mid-snap measured ~26 dB
});

// Phones scrub a video (MP4 where H.264 plays, else WebM — this open-source Chromium has no H.264); tablets and
// desktop keep the AVIF image sequence.
for (const [label, viewport, dpr, mobile, want] of [
  ["phone portrait", { width: 390, height: 844 }, 3, true, /\/entrance\/portrait\/scrub\.webm$/],
  ["phone landscape", { width: 844, height: 390 }, 3, true, /\/entrance\/landscape\/scrub\.webm$/],
  ["tablet portrait", { width: 768, height: 1024 }, 2, true, /\/entrance\/portrait\/720\/[\w-]+\.avif$/],
  ["retina desktop", { width: 1440, height: 900 }, 2, false, /\/entrance\/landscape\/1920\/[\w-]+\.avif$/],
] as const) {
  test(`entrance frame format — ${label}`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: dpr, isMobile: mobile, hasTouch: mobile });
    const page = await ctx.newPage();
    const frames: string[] = []; page.on("request", (r) => { if (/\/entrance\/(landscape|portrait)\//.test(r.url())) frames.push(r.url()); });
    await page.goto("/", { waitUntil: "load" });
    await expect.poll(() => frames.length, { timeout: 15000 }).toBeGreaterThan(label.startsWith("phone") ? 0 : 3);
    expect(frames.filter((u) => !want.test(u))).toEqual([]);
    await expect(page.locator("[data-entrance-perf]")).toHaveCount(0);   // diagnostics only on request
    await ctx.close();
  });
}

test("phone portrait on the canvas (A/B) fetches the whole WebP set while decoding only around the playhead", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    const w = window as unknown as { __ENTRANCE_PROF__: object; __ENTRANCE_EXP__: object; __d: { fetched: Set<number>; peak: number } };
    w.__ENTRANCE_EXP__ = { player: "canvas" };
    w.__d = { fetched: new Set(), peak: 0 };
    w.__ENTRANCE_PROF__ = { fetchEnd: (i: number) => w.__d.fetched.add(i), playhead: (_i: number, decoded: number) => { w.__d.peak = Math.max(w.__d.peak, decoded); } };
  });
  await page.goto("/", { waitUntil: "load" });
  const count = await page.evaluate(async () => (await (await fetch("/entrance/manifest.json")).json()).portrait.frames.length);
  // Every frame arrives without any scrolling…
  await expect.poll(() => page.evaluate(() => (window as unknown as { __d: { fetched: Set<number> } }).__d.fetched.size), { timeout: 20000 }).toBe(count);
  // …while decoded bitmaps stay a bounded window (plus keyframes), even after a pass through the whole sequence.
  for (let k = 1; k <= 20; k++) { await page.evaluate((p) => { const c = document.getElementById("entrance")!; scrollTo({ top: c.offsetTop + p * (c.offsetHeight - innerHeight), behavior: "instant" as ScrollBehavior }); }, k / 20); await page.waitForTimeout(80); }
  const peak = await page.evaluate(() => (window as unknown as { __d: { peak: number } }).__d.peak);
  expect(peak).toBeGreaterThan(0);
  expect(peak).toBeLessThan(count);
  await ctx.close();
});

test("?entrancePerf=1 shows the diagnostics panel with performance numbers only", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto("/?entrancePerf=1", { waitUntil: "load" });
  const panel = page.locator("[data-entrance-perf]");
  await expect(panel).toBeVisible();
  await expect(panel).toContainText("video · portrait · webm 608px", { timeout: 15000 });
  for (const p of [0.2, 0.4, 0.6]) { await page.evaluate((p) => { const c = document.getElementById("entrance")!; scrollTo({ top: c.offsetTop + p * (c.offsetHeight - innerHeight), behavior: "instant" as ScrollBehavior }); }, p); await page.waitForTimeout(300); }
  await expect(panel.getByRole("button", { name: "Copy" })).toBeVisible();
  const json = await page.evaluate(() => (window as unknown as { __entrancePerf: () => { json: Record<string, unknown> } }).__entrancePerf().json);
  expect(Object.keys(json).sort()).toEqual(["adapts", "cfg", "decodeMs", "decoded", "dist", "drawMs", "fetch", "fps", "gestures", "hints", "late", "misses", "paths", "raf", "renders", "seekMs", "skips", "video"]);
  expect(JSON.stringify(json)).not.toMatch(/Mozilla|AppleWebKit|http/);   // no user agent, no URLs
  // Experiment parameters are honoured only with the panel: the canvas, WebP and AVIF paths on the same phone.
  await page.goto("/?entrancePerf=1&entrancePlayer=canvas", { waitUntil: "load" });
  await expect(panel).toContainText("canvas · portrait · tier 600 · webp", { timeout: 15000 });
  await page.goto("/?entrancePerf=1&entrancePlayer=canvas&entranceFormat=avif", { waitUntil: "load" });
  await expect(panel).toContainText("canvas · portrait · tier 600 · avif", { timeout: 15000 });
  await ctx.close();
});

// The video's surface follows the frame on screen: at rest, wherever the scroll stops, the hero surface sits
// where the canvas (exact blend) puts it, within the video's sampling (≤ half a sample of progress).
test("phone video: the screen quad stays on the picture — surface matches the canvas at every stop", async ({ browser }) => {
  const rects: Record<string, number[][]> = {};
  for (const player of ["video", "canvas"]) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    await page.addInitScript((pl) => { (window as unknown as { __ENTRANCE_EXP__: unknown }).__ENTRANCE_EXP__ = { player: pl }; }, player);
    await page.goto("/", { waitUntil: "load" }); await page.waitForTimeout(2000);
    rects[player] = [];
    for (const p of [0.25, 0.3, 0.5, 0.7, 0.78, 0.83, 0.86, 0.87]) {
      await page.evaluate((p) => { const c = document.getElementById("entrance")!; scrollTo({ top: c.offsetTop + p * (c.offsetHeight - innerHeight), behavior: "instant" as ScrollBehavior }); }, p);
      await page.waitForTimeout(900);
      rects[player].push(await page.locator(".entrance__surface").evaluate((el) => { const r = el.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; }));
    }
    if (player === "video") await expect(page.locator(".entrance__video[data-drawn]")).toHaveCount(1);
    await ctx.close();
  }
  rects.video.forEach((r, i) => r.forEach((v, k) => expect(Math.abs(v - rects.canvas[i][k]), `stop ${i} coord ${k}`).toBeLessThan(8)));
});

test("phone video: a failing video hands over to the canvas", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.route(/\/entrance\/(portrait|landscape)\/scrub\./, (r) => r.fulfill({ status: 404, body: "" }));
  await page.goto("/", { waitUntil: "load" });
  await page.evaluate(() => { const c = document.getElementById("entrance")!; scrollTo({ top: c.offsetTop + 0.3 * (c.offsetHeight - innerHeight), behavior: "instant" as ScrollBehavior }); });
  await expect(page.locator(".entrance__canvas[data-drawn]:not(video)")).toHaveCount(1, { timeout: 15000 });
  await expect(page.locator(".entrance__video")).toHaveCount(0);
  await ctx.close();
});

// While scrolling, a seek can lag the finger by a few frames. The surface must then follow the frame on screen,
// not the scroll: every render showing the same video frame places the surface identically, however far the
// scroll has run ahead. (Placing it from the scroll position measured a spread of tens of px here.)
test("phone video: while seeks lag, the surface follows the frame on screen, not the scroll", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    const w = window as unknown as { __ENTRANCE_PROF__: object; __rec: { s: number; late: boolean; r: number[] }[] };
    w.__rec = [];
    w.__ENTRANCE_PROF__ = { render: (r: { path: string; drawn: number | null }) => {
      if (!r.path.startsWith("video") || r.drawn === null) return;
      const b = document.querySelector(".entrance__surface")!.getBoundingClientRect();
      w.__rec.push({ s: r.drawn, late: r.path === "video-late", r: [b.x, b.y, b.width, b.height] });
    } };
  });
  await page.goto("/", { waitUntil: "load" }); await page.waitForTimeout(2500);
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 6 });           // slow seeks: the picture falls behind
  await page.evaluate(async () => {
    const c = document.getElementById("entrance")!, L = c.offsetHeight - innerHeight;
    for (let k = 0; k <= 60; k++) { scrollTo({ top: c.offsetTop + (0.68 + (0.2 * k) / 60) * L, behavior: "instant" as ScrollBehavior }); await new Promise((r) => requestAnimationFrame(r)); }
  });
  await page.waitForTimeout(1500);
  const rec = await page.evaluate(() => (window as unknown as { __rec: { s: number; late: boolean; r: number[] }[] }).__rec);
  expect(rec.filter((x) => x.late).length, "the scroll must have outrun the video at least once").toBeGreaterThan(0);
  const bySample = new Map<number, number[][]>();
  for (const x of rec) (bySample.get(x.s) ?? bySample.set(x.s, []).get(x.s)!).push(x.r);
  for (const [s, rs] of bySample) for (const r of rs) r.forEach((v, k) => expect(Math.abs(v - rs[0][k]), `sample ${s}`).toBeLessThan(1.5));
  await ctx.close();
});

test("phone with reduced motion: static hero, no video and no frames requested", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  const media: string[] = []; page.on("request", (r) => { if (/\/entrance\/(landscape|portrait)\//.test(r.url())) media.push(r.url()); });
  await page.goto("/", { waitUntil: "load" }); await page.waitForTimeout(1500);
  await expect(page.locator(".entrance__video")).toHaveCount(0);
  expect(media).toEqual([]);
  await expect(page.locator("#hero-title")).toBeVisible();
  await ctx.close();
});
