"use client";

import { useEffect, useLayoutEffect, type RefObject } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/** Active traps, oldest first. Only the top one handles keys: every trap listens on `document` in the capture
 *  phase, where stopPropagation cannot silence the others — so one Escape closed every stacked overlay (review #2). */
const stack: object[] = [];

/** A scroll area with nothing focusable inside. Chromium and Firefox make it a Tab stop of its own, so it can be scrolled
 *  from the keyboard (the chat's transcript, once a conversation outgrows it); the trap keeps that stop. */
function bareScroller(el: HTMLElement) {
  const y = el.scrollHeight > el.clientHeight, x = el.scrollWidth > el.clientWidth;
  if (!(x || y) || el.hasAttribute("tabindex")) return false;
  const s = getComputedStyle(el), scrolls = (v: string) => v === "auto" || v === "scroll";
  return ((y && scrolls(s.overflowY)) || (x && scrolls(s.overflowX))) && !el.querySelector(FOCUSABLE);
}

/** Focuses `el` for a Tab press and says whether it took.
 *  - `focusVisible`: a press shows the ring, as the browser's own Tab does. Without it, script focus during a press with
 *    a modifier showed none (Option+Tab in Chromium and WebKit; Shift+Tab in WebKit, when no ring was already showing).
 *  - Only Chromium lets script focus a bare scroller, so in Firefox and Safari it holds a tabindex of -1 while it has
 *    focus. (`focusout`, not the other name of that event: Tailwind reads every string here as a class candidate, and
 *    that one is a utility, which would add a rule to the site's stylesheet.) */
function focusOn(el: HTMLElement) {
  const opts = { focusVisible: true } as FocusOptions;   // not in TypeScript's DOM types yet
  el.focus(opts);
  if (document.activeElement !== el && !el.matches(FOCUSABLE)) {
    el.tabIndex = -1;
    el.focus(opts);
    if (document.activeElement === el) el.addEventListener("focusout", () => el.removeAttribute("tabindex"), { once: true });
    else el.removeAttribute("tabindex");
  }
  return document.activeElement === el;
}

/**
 * Traps Tab focus inside `ref` while `active`, then restores focus to whatever
 * was focused before it opened.
 *
 * `aria-modal="true"` is a promise to assistive tech that the rest of the page
 * is unavailable. Without a trap, a screen-reader user in browse mode walks
 * straight out of the dialog and a Tab press escapes it — the promise is
 * broken. Every overlay in this app uses this hook.
 */
export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  onEscape?: () => void,
  /** false for a non-modal popover (chat, accessibility): the page stays usable, so Tab is not held inside —
   *  focus still moves in on open, Escape still closes, and focus still returns (review #10). */
  modal = true,
) {
  const shown = (el: HTMLElement) => el.offsetParent !== null || el === document.activeElement;
  const focusables = () => Array.from(ref.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter(shown);
  /** Every Tab stop, in document order: the focusables, and any bare scroller among them. */
  const stops = () => Array.from(ref.current?.querySelectorAll<HTMLElement>("*") ?? []).filter(
    (el) => (el.matches(FOCUSABLE) && shown(el)) || bareScroller(el),
  );

  // Keys are trapped from a layout effect, so Escape and Tab work before the overlay's first paint: with an
  // on-demand chunk under load, a passive effect left a visible case-study panel ignoring Escape (Plan 2
  // Task 12). Focus itself moves in a passive effect below — restoring it during the layout phase broke
  // the mobile sheet's return to its menu button.
  useLayoutEffect(() => {
    if (!active) return;
    const token = {};
    stack.push(token);

    const onKeyDown = (e: KeyboardEvent) => {
      if (stack[stack.length - 1] !== token) return;   // an overlay opened above this one owns the keys
      const root = ref.current;
      if (e.key === "Escape") {
        // A non-modal panel leaves the page usable: Escape closes it only when focus is inside it, so Escape pressed
        // while working in the page does not close it and pull focus away (review, 2026-10-13).
        if (!modal && root && !root.contains(document.activeElement)) return;
        e.stopPropagation();
        onEscape?.();
        return;
      }
      // Ctrl and Cmd+Tab belong to the browser. Option+Tab (Safari's "every item") is a Tab like any other here.
      if (e.key !== "Tab" || e.ctrlKey || e.metaKey || !root || !modal) return;

      // The trap moves focus itself on every press. It used to step in only at its first and last items and leave the
      // rest to the browser, whose own idea of a Tab stop it cannot see: Safari's default Tab skips links (and, without
      // macOS keyboard navigation, buttons), so it walked past a last item that was a link and out of the dialog, and
      // the locked page behind scrolled to wherever focus landed (#20, F2).
      e.preventDefault();
      const items = stops();
      const current = document.activeElement ?? document.body;
      let i = items.indexOf(current as HTMLElement);
      // Not on a stop (the container itself, tabIndex -1, or outside): count from where focus sits in the document,
      // so Tab enters at the first stop after it and Shift+Tab at the last one before it.
      if (i < 0) {
        const before = items.filter((el) => el.compareDocumentPosition(current) & Node.DOCUMENT_POSITION_FOLLOWING).length;
        i = e.shiftKey ? before : before - 1;
      }
      // Wrapping at both ends; a stop that refuses focus is passed over.
      for (let n = 0; n < items.length; n++) {
        i = (i + (e.shiftKey ? items.length - 1 : 1)) % items.length;
        if (focusOn(items[i])) return;
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      stack.splice(stack.indexOf(token), 1);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, ref, onEscape, modal]);

  useEffect(() => {
    if (!active) return;

    const root = ref.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    // Move focus in on open — prefer an explicit target, else the first
    // focusable, else the container itself.
    const initial =
      root?.querySelector<HTMLElement>("[data-autofocus]") ?? focusables()[0] ?? root;
    // Never scrolls the page: the dialog is an overlay, and a scroll here would strand the reader elsewhere.
    initial?.focus?.({ preventScroll: true });

    return () => {
      // Focus goes back without moving the page: a reader who scrolled on (focus stays put while scrolling)
      // must not be thrown back to wherever focus last was when they close the overlay (Plan 2 Task 24).
      previouslyFocused?.focus?.({ preventScroll: true });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, ref]);
}

/** Locks page scroll while `active`. Counted, so closing one of two stacked overlays keeps the page locked; the
 *  original inline value comes back when the last one closes. */
let locks = 0;
let saved = "";
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    if (locks++ === 0) { saved = document.body.style.overflow; document.body.style.overflow = "hidden"; }
    return () => { if (--locks === 0) document.body.style.overflow = saved; };
  }, [active]);
}
