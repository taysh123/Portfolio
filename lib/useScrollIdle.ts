"use client";

import { useEffect, useRef, useState } from "react";

/**
 * True while the page is being scrolled, false once it has been still for
 * `delay` milliseconds.
 *
 * This exists for the two fixed controls that live in the bottom corners. On a
 * desktop they sit in dead space; on a phone they sit exactly where a card's
 * actions are, which means the reader spends the whole page with two buttons
 * covering the thing they are trying to read and a real chance of hitting one
 * by accident. Retracting them while a flick is in progress and bringing them
 * back when the reader settles keeps both features without either of them
 * being in the way at the moment it matters.
 *
 * The listener is passive and the state only flips on the EDGES — a fling
 * fires hundreds of scroll events and causes exactly two renders.
 */
export function useScrollIdle(delay = 700) {
  const [scrolling, setScrolling] = useState(false);
  const active = useRef(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const onScroll = () => {
      if (!active.current) {
        active.current = true;
        setScrolling(true);
      }
      clearTimeout(timer);
      timer = setTimeout(() => {
        active.current = false;
        setScrolling(false);
      }, delay);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, [delay]);

  return scrolling;
}
