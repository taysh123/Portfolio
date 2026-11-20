// tests/e2e/focus-trap.spec.ts — #20 (F2): the shared focus trap (lib/useFocusTrap.ts) holds Tab inside every modal
// overlay, whatever the browser counts as a Tab stop. Safari's default Tab skips links (and, without macOS keyboard
// navigation, buttons too), so a trap that waited at its last item for the browser to arrive never saw it: focus left
// the menu sheet, the chat sheet and the case study for one press, and the locked page behind scrolled to it (S23, #20).
// The suite runs Chromium only (#22), so each Safari model is recreated here: tabindex -1 takes an element out of
// Chromium's own Tab order while the trap still lists it, which is how Safari treats a link.
// A new spec, approved in advance by Tay in the #20 brief (2026-11-20); no existing test or guard is changed.
import { test, expect, type Page } from "playwright/test";
import { open } from "../support/page";

/** What a reader can Tab to in a dialog, in document order. The transcript joins when it scrolls (Chromium and Firefox
 *  stop on a scroll area with nothing focusable inside; the trap keeps that stop in every engine). */
const CONTROLS = "a[href], button:not([disabled]), input:not([disabled])";

type Overlay = { name: string; vp: readonly [number, number]; trigger: string; dialog: string; tall?: boolean };
const OVERLAYS: Overlay[] = [
  { name: "the menu sheet", vp: [390, 844], trigger: "button[aria-controls='mobile-menu']", dialog: "#mobile-menu [role=dialog]" },
  { name: "the menu sheet", vp: [320, 568], trigger: "button[aria-controls='mobile-menu']", dialog: "#mobile-menu [role=dialog]" },
  { name: "the chat sheet", vp: [390, 844], trigger: "[data-chat-launcher]", dialog: "[data-chat-panel]" },
  { name: "the chat sheet with a long conversation", vp: [390, 844], trigger: "[data-chat-launcher]", dialog: "[data-chat-panel]", tall: true },
  { name: "the case study", vp: [1440, 900], trigger: "button[data-case-study='poker']", dialog: "[aria-labelledby='case-study-title']" },
  { name: "the case study", vp: [390, 844], trigger: "button[data-case-study='aegis']", dialog: "[aria-labelledby='case-study-title']" },
];

/** The browser's own idea of a Tab stop. Chromium's includes links and buttons (as Safari's Option+Tab does). */
const MODELS = [
  { name: "Chromium's own Tab", skip: "", key: "Tab" },
  { name: "Option+Tab", skip: "", key: "Alt+Tab" },
  { name: "Safari's default Tab (links skipped)", skip: "a[href]", key: "Tab" },
  { name: "Safari without keyboard navigation (links and buttons skipped)", skip: "a[href], button", key: "Tab" },
] as const;

/** Where focus is: its index among the dialog's stops, -1 inside but not a stop, -2 outside the dialog. */
const where = (page: Page, o: Overlay) => page.evaluate(({ dialog, sel }) => {
  const d = document.querySelector(dialog)!;
  const stops = [...d.querySelectorAll<HTMLElement>(sel)].filter((e) => e.getClientRects().length > 0);
  const a = document.activeElement as HTMLElement;
  return { at: d.contains(a) ? stops.indexOf(a) : -2, ring: a.matches(":focus-visible"), n: stops.length };
}, { dialog: o.dialog, sel: o.tall ? `${CONTROLS}, [data-chat-transcript]` : CONTROLS });

for (const o of OVERLAYS) {
  test(`${o.vp[0]}×${o.vp[1]}, ${o.name}: Tab and Shift+Tab wrap inside, focus never leaves, and it returns on close`, async ({ browser }) => {
    for (const m of MODELS) {
      const { ctx, page } = await open(browser, o.vp);
      const trigger = page.locator(o.trigger);
      await trigger.focus(); await page.keyboard.press("Enter");   // opened from the keyboard, as a Tab user would
      const dialog = page.locator(o.dialog);
      await expect(dialog).toBeVisible();
      await expect.poll(async () => (await where(page, o)).at, `${m.name}: focus moves in on open`).toBe(0);
      await page.evaluate(({ dialog, skip, tall }) => {
        const d = document.querySelector(dialog)!;
        if (skip) d.querySelectorAll(skip).forEach((e) => e.setAttribute("tabindex", "-1"));
        // A transcript taller than its box, as a long conversation makes it (padded here, so no question is sent).
        if (tall) { const pad = document.createElement("div"); pad.style.height = "2000px"; d.querySelector("[data-chat-transcript]")!.append(pad); }
      }, { dialog: o.dialog, skip: m.skip, tall: !!o.tall });
      const y = await page.evaluate(() => scrollY);
      const { n } = await where(page, o);
      expect(n, `${m.name}: the dialog has stops to walk`).toBeGreaterThan(1);

      // Two full turns each way: every stop in document order, wrapping at both ends, each with its ring. Each walk
      // starts from a pointer click on the dialog's own surface, which leaves focus on the dialog itself and the ring
      // off, so the ring must come from the press (a ring already on screen would carry over and hide a missing one).
      // Soft, so one run reports every model.
      const walk = async (key: string) => {
        await dialog.click({ position: { x: 10, y: 40 } });   // inside each dialog's padding, clear of its curved corner
        expect((await where(page, o)).at, `${m.name}: a click on the dialog's surface focuses the dialog`).toBe(-1);
        const at: number[] = [], unringed: number[] = [];
        for (let i = 0; i < 2 * n; i++) { await page.keyboard.press(key); const w = await where(page, o); at.push(w.at); if (!w.ring) unringed.push(w.at); }
        return { at, unringed };
      };
      const fwd = await walk(m.key), back = await walk(`Shift+${m.key}`);
      expect.soft(fwd.at, `${m.name}: forward (-2 = outside the dialog)`).toEqual(Array.from({ length: 2 * n }, (_, i) => i % n));
      expect.soft(back.at, `${m.name}: backward (-2 = outside the dialog)`).toEqual(Array.from({ length: 2 * n }, (_, i) => n - 1 - (i % n)));
      expect.soft(fwd.unringed, `${m.name}: every stop forward shows its focus ring`).toEqual([]);
      expect.soft(back.unringed, `${m.name}: every stop backward shows its focus ring`).toEqual([]);
      expect.soft(await page.evaluate(() => scrollY), `${m.name}: the page behind never moved`).toBe(y);

      await page.keyboard.press("Escape");
      await expect(dialog).toHaveCount(0);
      await expect.soft(trigger, `${m.name}: focus returns to what opened it`).toBeFocused();
      await ctx.close();
    }
  });
}
