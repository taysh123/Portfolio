"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";

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
 *   - Anchor clicks are handed to Lenis so in-page navigation lands correctly
 *     under the fixed header.
 */
export function SmoothScroll() {
  const reduced = useReducedMotionPref();

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 1,
      syncTouch: false,
      anchors: { offset: -88 },
    });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else {
        raf = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, [reduced]);

  return null;
}
