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

    // The loop runs only while Lenis is actually moving. Input restarts it; when the scroll settles
    // it stops, so an idle page schedules no animation frames at all (spec §9 "Idle work").
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = lenis.isScrolling ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => { if (!raf && !document.hidden) raf = requestAnimationFrame(loop); };
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
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, [reduced]);

  return null;
}
