// tests/e2e/launcher-focus.spec.ts — #21 (F1): a control focused from the keyboard never stays under the chat launcher.
// New in S27, approved in advance by Tay in the S27 brief. Firefox's own focus scroll skips the page's bottom scroll
// padding (#16) for a control already on screen; ChatLauncher.tsx moves such a control up once that scroll has settled.
// Each stop is read after the page stops moving, so the check holds in every engine, whatever its own Tab model.
import { test, expect } from "playwright/test";
import { open } from "../support/page";

for (const vp of [[320, 568], [390, 844]] as const) for (const motion of [false, true]) {
  test(`${vp[0]}×${vp[1]}, motion ${motion ? "on" : "reduced"}: a focused control is never under the launcher`, async ({ browser }) => {
    test.setTimeout(120_000);   // every stop waits for the page to settle, smooth scrolls included
    const { ctx, page } = await open(browser, vp, { motion });
    const stops: { name: string; under: boolean }[] = [];
    for (let i = 0; i < 90; i++) {
      await page.keyboard.press("Tab");
      const s = await page.evaluate(async () => {
        // Settled: scrollY has held for 10 frames in a row.
        let y = -1, still = 0, n = 0;
        while (still < 10 && n++ < 300) { await new Promise((r) => requestAnimationFrame(r)); if (scrollY === y) still++; else { y = scrollY; still = 0; } }
        const e = document.activeElement as HTMLElement | null, chat = document.querySelector<HTMLElement>("[data-chat-launcher]")!;
        if (!e || e === document.body) return null;
        const r = e.getBoundingClientRect(), c = chat.getBoundingClientRect();
        return { name: (e.getAttribute("aria-label") || e.textContent || e.tagName).trim().replace(/\s+/g, " ").slice(0, 40),
          launcher: chat.contains(e),
          under: !chat.contains(e) && r.right > c.left + 1 && r.left < c.right - 1 && r.bottom > c.top + 1 && r.top < c.bottom - 1 };
      });
      // The walk ends at the page's last stop (the launcher itself: Firefox's Tab then leaves the page), or back at the start.
      if (!s || s.launcher || (stops.length > 5 && s.name === stops[0].name)) break;
      stops.push({ name: s.name, under: s.under });
    }
    expect(stops.length, JSON.stringify(stops.map((s) => s.name))).toBeGreaterThan(10);
    expect(stops.filter((s) => s.under).map((s) => s.name)).toEqual([]);
    await ctx.close();
  });
}
