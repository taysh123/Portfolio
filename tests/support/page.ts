// Shared helpers for the M10 e2e suite.
import type { Browser, Page } from "playwright/test";

export const PHONES = [[320, 568], [360, 780], [390, 844], [430, 932]] as const;
export const VIEWPORTS = [[1920, 1080], [1440, 900], [1280, 720], [1280, 700], [1024, 768], [844, 390], [430, 932], [390, 844], [360, 780], [320, 568]] as const;
export const CHAPTERS = ["poker", "aegis", "developeros", "gravity-flow"] as const;

/** A fresh page at a size, in a theme, with motion reduced unless asked otherwise (so jumps and steps are instant). */
export async function open(browser: Browser, [w, h]: readonly [number, number], opts: { theme?: "light" | "dark"; motion?: boolean; js?: boolean; hash?: string } = {}) {
  const mobile = w < 900;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile,
    reducedMotion: opts.motion ? "no-preference" : "reduce", javaScriptEnabled: opts.js ?? true });
  if (opts.theme) await ctx.addCookies([{ name: "theme", value: opts.theme, url: "http://localhost:3400" }]);
  const page = await ctx.newPage();
  await page.goto("/" + (opts.hash ?? ""), { waitUntil: "networkidle" });
  return { ctx, page };
}

/** Every <img> under a scope that is rendered finishes decoding. */
export const decodedImages = (page: Page, scope: string) => page.locator(`${scope} img`).evaluateAll((imgs) =>
  imgs.filter((i) => i.getClientRects().length > 0).map((i) => ({ src: (i as HTMLImageElement).currentSrc, ok: (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0 })));

/** Scroll the whole page in steps so every lazy image is requested. */
export const scrollThrough = (page: Page) => page.evaluate(async () => {
  for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.7) { scrollTo({ top: y, behavior: "instant" as ScrollBehavior }); await new Promise((r) => setTimeout(r, 50)); }
  scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
});

/** Installed before any page script: counts WebGL and WebGL2 context requests. */
export const COUNT_WEBGL = `(() => { window.__gl = 0; const o = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (t, ...a) { if (/webgl/i.test(String(t))) window.__gl++; return o.call(this, t, ...a); };
  if (window.OffscreenCanvas) { const p = OffscreenCanvas.prototype.getContext; OffscreenCanvas.prototype.getContext = function (t, ...a) { if (/webgl/i.test(String(t))) window.__gl++; return p.call(this, t, ...a); }; } })();`;
