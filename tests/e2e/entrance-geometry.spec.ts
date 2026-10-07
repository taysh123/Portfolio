// tests/e2e/entrance-geometry.spec.ts
import { test, expect, type Page } from "playwright/test";
import fs from "node:fs";
import sharp from "sharp";
import { coverFit, quadToViewport } from "../../lib/entrance/surface";
import type { Manifest, Quad } from "../../lib/entrance/types";
import { resolveFrame, lerpQuad } from "../../lib/entrance/frames";
import { progressAt } from "../../lib/entrance/pacing";

const manifest = JSON.parse(fs.readFileSync("public/entrance/manifest.json", "utf8")) as Manifest;

async function gotoP(page: Page, p: number) {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.evaluate((p) => {
    const c = document.getElementById("entrance")!;
    window.scrollTo({ top: c.offsetTop + p * (c.offsetHeight - innerHeight), behavior: "instant" as ScrollBehavior });
  }, p);
}

/** The surface element's four transformed corners in viewport px (transform-origin 0 0). */
const surfaceCorners = (page: Page) => page.locator(".entrance__surface").evaluate((el: HTMLElement) => {
  const m = new DOMMatrix(getComputedStyle(el).transform);
  const x0 = parseFloat(el.style.left), y0 = parseFloat(el.style.top), w = el.offsetWidth, h = el.offsetHeight;
  return [[0, 0], [w, 0], [w, h], [0, h]].map(([x, y]) => { const q = m.transformPoint(new DOMPoint(x, y)); return { x: q.x / q.w + x0, y: q.y / q.w + y0 }; });
});

const maxErr = (a: { x: number; y: number }[], b: Quad) => Math.max(...a.map((p, i) => Math.hypot(p.x - b[i].x, p.y - b[i].y)));

/** The screen quad the stage interpolates at progress p (the camera keeps moving through every beat). */
const quadAt = (kind: "landscape" | "portrait", p: number) => {
  const set = manifest[kind], r = resolveFrame(p, set.frames);
  return lerpQuad(set.frames[r.a].quad, set.frames[r.b].quad, r.w)!;
};

test("landscape: mid-identity the hero surface sits exactly on the rendered screen quad", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoP(page, 0.6);
  const set = manifest.landscape, q = quadAt("landscape", progressAt(0.6, "desktop"));
  const want = quadToViewport(q, set.width, set.height, coverFit(set.width, set.height, 1440, 900, 1));
  await expect.poll(async () => maxErr(await surfaceCorners(page), want), { timeout: 8000 }).toBeLessThan(1.5);
});

test("portrait: mid-identity the band maps onto the rendered screen quad", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoP(page, 0.6);
  // Phones scrub the video: the surface follows the presented sample — the rendered frame nearest p.
  const set = manifest.portrait, vq = set.video ?? null;
  const near = set.frames.reduce((a, f) => (Math.abs(f.p - 0.6) < Math.abs(a.p - 0.6) ? f : a));
  const q = vq ? near.quad! : quadAt("portrait", 0.6);
  const want = quadToViewport(q, vq ? vq.width : set.width, vq ? vq.height : set.height, coverFit(vq ? vq.width : set.width, vq ? vq.height : set.height, 390, 844, 1));
  // The band is the centred 16:10 strip of the full-viewport surface.
  const band = () => page.locator(".entrance__surface").evaluate((el: HTMLElement) => {
    const m = new DOMMatrix(getComputedStyle(el).transform), w = el.offsetWidth, bh = w / 1.6, by = (el.offsetHeight - bh) / 2;
    return [[0, by], [w, by], [w, by + bh], [0, by + bh]].map(([x, y]) => { const q = m.transformPoint(new DOMPoint(x, y)); return { x: q.x / q.w, y: q.y / q.w }; });
  });
  // Polled like the landscape case: the stage renders in a later frame, after frames decode.
  await expect.poll(async () => maxErr(await band(), want), { timeout: 8000 }).toBeLessThan(1.5);
});

test("the canvas brightens across p 0 → 0.12 (spec §10), measured through the veil", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const mean = async (p: number) => { await gotoP(page, p); await page.waitForTimeout(700);
    const png = await page.screenshot({ clip: { x: 360, y: 225, width: 720, height: 450 } });
    const { data } = await sharp(png).greyscale().raw().toBuffer({ resolveWithObject: true });
    return data.reduce((a, b) => a + b, 0) / data.length; };
  expect(await mean(0.12)).toBeGreaterThan(await mean(0));
});

for (const [w, h] of [[1440, 900], [390, 844]] as const) {
  test(`${w}x${h}: at p = 1 the surface is exactly identity and fills the viewport`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await gotoP(page, 1);
    await expect.poll(() => page.locator(".entrance__surface").evaluate((el) => getComputedStyle(el).transform)).toMatch(/^(none|matrix\(1, 0, 0, 1, 0, 0\)|matrix3d\(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1\))$/);
    const r = await page.locator("#hero").evaluate((el) => el.getBoundingClientRect().toJSON());
    expect(Math.abs(r.left)).toBeLessThan(1); expect(Math.abs(r.width - w)).toBeLessThan(1);
  });
}
