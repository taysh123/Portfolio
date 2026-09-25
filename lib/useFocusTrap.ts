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
) {
  const focusables = () =>
    Array.from(ref.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter(
      (el) => el.offsetParent !== null || el === document.activeElement,
    );

  // Keys are trapped from a layout effect, so Escape and Tab work before the overlay's first paint: with an
  // on-demand chunk under load, a passive effect left a visible case-study panel ignoring Escape (Plan 2
  // Task 12). Focus itself moves in a passive effect below — restoring it during the layout phase broke
  // the mobile sheet's return to its menu button.
  useLayoutEffect(() => {
    if (!active) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const root = ref.current;
      if (e.key === "Escape") {
        e.stopPropagation();
        onEscape?.();
        return;
      }
      if (e.key !== "Tab" || !root) return;

      const items = focusables();
      if (items.length === 0) {
        e.preventDefault();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;

      // Focus can sit on the container itself (tabIndex -1) — treat that as
      // "before the first item" so Tab enters the list rather than escaping.
      if (!root.contains(current)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
        return;
      }
      if (e.shiftKey && current === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && current === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, ref, onEscape]);

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

/** Locks body scroll while `active`, preserving the original inline value. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [active]);
}
