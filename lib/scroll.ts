import type Lenis from "lenis";

/**
 * Programmatic scrolling that momentum scrolling cannot overwrite.
 *
 * While Lenis animates it ignores native scroll events and writes its own target back every frame, so a
 * plain `window.scrollTo` issued mid-animation is undone a frame later (found in Plan 2 Task 23: palette
 * "Home" after a focus-restore scroll landed back at the footer). Every programmatic jump goes through here.
 */
let active: Lenis | null = null;

/** SmoothScroll registers its instance on mount and clears it on unmount (reduced motion: none). */
export function registerLenis(lenis: Lenis | null) { active = lenis; }

/**
 * An instant jump — no animation, and any animation in flight is cancelled. The native scroll always runs
 * first: Lenis returns early when the target equals its stored target, and that stored value can be stale
 * (an immediate jump swallows the next native scroll event), so Lenis alone could leave the page unmoved.
 */
export function jumpTo(top: number) {
  window.scrollTo({ top, behavior: "instant" as ScrollBehavior });
  active?.scrollTo(top, { immediate: true, force: true });
}

/** A smooth glide to an element, landing under the fixed header like a native anchor. Lenis already applies
 *  the root's scroll-padding-top and the target's scroll-margin-top to element targets — no extra offset. */
export function glideTo(el: HTMLElement) {
  if (!active) {
    // No Lenis: usually reduced motion (either source), where an explicit JS "smooth" would still animate —
    // the CSS scroll-behavior kill-switch does not override it (review I3). Glide only when motion is allowed.
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.reducedMotion === "true";
    el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    return;
  }
  active.scrollTo(el, { force: true });
}
