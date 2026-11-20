// tests/e2e/focus-ring.spec.ts — S21+S22: every keyboard stop on / rings at once. A colour transition that also eases
// outline-color made the header's four links and the footer's six start their ring in the link's own colour and reach
// the ring's colour 150 ms later (found in S20); they ease only their text colour now.
import { test, expect } from "playwright/test";
import { open } from "../support/page";

for (const vp of [[1440, 900], [390, 844]] as const) {
  test(`${vp[0]}×${vp[1]}: no focus ring eases in, motion on`, async ({ browser }) => {
    const { ctx, page } = await open(browser, vp, { motion: true });
    const eased: string[] = []; let first = "", n = 0;
    for (let i = 0; i < 140; i++) {
      await page.keyboard.press("Tab");
      const s = await page.evaluate(() => {
        const e = document.activeElement as HTMLElement | null; if (!e || e === document.body) return null;
        return { name: (e.getAttribute("aria-label") || e.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40),
          eased: e.getAnimations().some((a) => (a as CSSTransition).transitionProperty === "outline-color") };
      });
      if (!s) break;
      if (!first) first = s.name; else if (s.name === first && i > 5) break;
      n++; if (s.eased) eased.push(s.name);
    }
    expect(n, "the walk reaches the page's controls").toBeGreaterThan(40);
    expect(eased).toEqual([]);
    await ctx.close();
  });
}
