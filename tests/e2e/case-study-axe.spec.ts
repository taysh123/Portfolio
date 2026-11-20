// tests/e2e/case-study-axe.spec.ts — #17 (Tay, S18+S19 review; fixed in S21+S22): with each of the six case studies
// open on the dark page, axe finds no WCAG 2.2 A/AA or best-practice violation, at 1440 and 390. The dialog is a div
// (an aside may not take role="dialog"), and a gallery image is silent where its caption says the same words.
import { test, expect } from "playwright/test";
import fs from "node:fs";
import { open } from "../support/page";

const AXE = () => fs.readFileSync("node_modules/axe-core/axe.min.js", "utf8");
const IDS = ["poker", "aegis", "developeros", "gravity-flow", "job-assistant", "orders-delivery"];

for (const vp of [[1440, 900], [390, 844]] as const) {
  test(`${vp[0]}×${vp[1]}: axe passes with each case study open`, async ({ browser }) => {
    const { ctx, page } = await open(browser, vp);
    await page.addScriptTag({ content: AXE() });
    for (const id of IDS) {
      const trigger = page.locator(`button[data-case-study='${id}']`);
      await trigger.scrollIntoViewIfNeeded(); await trigger.click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      // It fades in (reduced motion keeps the fade): mid-fade, axe would measure the contrast of half-drawn text.
      await expect(dialog).toHaveCSS("opacity", "1");
      expect(await dialog.evaluate((e) => e.tagName), id).toBe("DIV");
      const found = await page.evaluate(async () => {
        const r = await (window as unknown as { axe: { run: (d: Document, o: object) => Promise<{ violations: { id: string; nodes: { target: string[] }[] }[] }> } }).axe.run(document,
          { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa", "best-practice"] } });
        return r.violations.map((x) => `${x.id}: ${x.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`);
      });
      expect(found, `${id} at ${vp[0]}`).toEqual([]);
      // Each gallery figure is named by its caption, which still says what the capture shows.
      for (const fig of await dialog.locator("figure").all()) await expect(fig.locator("figcaption")).toHaveText(/\S{3,}/);
      await page.keyboard.press("Escape");
      await expect(dialog).toHaveCount(0);
    }
    await ctx.close();
  });
}
