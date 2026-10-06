"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";
import { registerLenis, glideTo } from "@/lib/scroll";

/**
 * Momentum scrolling.
 *
 * This is the one place the design deliberately takes a small accessibility
 * risk for feel, so the guardrails are explicit:
 *
 *   - Completely off under reduced motion (OS query *or* the in-app toggle).
 *     Not damped — off, with native scrolling restored.
 *   - Native scroll on touch (`syncTouch: false`). Overriding touch scrolling
 *     is where smooth-scroll libraries actually cause nausea, and it fights
 *     the platform's own overscroll behaviour.
 *   - Conservative lerp. Enough to smooth the wheel, far short of the long
 *     glide that makes a page feel like it's ignoring you.
 *   - The rAF loop stops when the tab is hidden rather than running forever.
 *   - In-page anchor clicks glide via Lenis (lib/scroll glideTo), landing under
 *     the fixed header. Not Lenis's own `anchors` option: it ignores
 *     preventDefault, so it hijacked links other handlers own (the skip link
 *     and Back to top land on the hero at identity) — Plan 2 Task 23.
 *     Keyboard activation keeps the native jump, which also moves focus.
 */
export function SmoothScroll() {
  const reduced = useReducedMotionPref();

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 1,
      syncTouch: false,
    });
    registerLenis(lenis);

    // Window listener: runs after the document-level handlers that may claim a link (defaultPrevented).
    const onAnchor = (e: MouseEvent) => {
      if (e.defaultPrevented || e.detail === 0 || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.<HTMLAnchorElement>("a[href^='#']");
      const hash = a?.getAttribute("href"); if (!hash || hash === "#") return;
      const el = document.getElementById(decodeURIComponent(hash.slice(1))); if (!el) return;
      e.preventDefault();
      history.pushState(null, "", hash);
      glideTo(el);
    };
    window.addEventListener("click", onAnchor);

    // The loop runs only while Lenis is actually moving. Input restarts it; when the scroll settles
    // it stops, so an idle page schedules no animation frames at all (spec §9 "Idle work").
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = lenis.isScrolling ? requestAnimationFrame(loop) : 0;
    };
    // Restarting after idle: Lenis's clock is stale, so its first delta would be the whole idle time and the
    // damping would jump straight to the target — the first wheel notch snapped (review #3). A zero clock
    // makes that first frame a zero-length step; the glide starts on the next.
    const kick = () => { if (!raf && !document.hidden) { lenis.time = 0; raf = requestAnimationFrame(loop); } };
    const inputs = ["wheel", "touchstart", "touchmove", "keydown", "pointerdown"] as const;
    for (const e of inputs) window.addEventListener(e, kick, { passive: true });
    window.addEventListener("scroll", kick, { passive: true });   // programmatic and anchor scrolls
    lenis.on("scroll", kick);
    kick();

    const onVisibility = () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else kick(); };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      for (const e of inputs) window.removeEventListener(e, kick);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("click", onAnchor);
      cancelAnimationFrame(raf);
      registerLenis(null);
      lenis.destroy();
    };
  }, [reduced]);

  return null;
}
