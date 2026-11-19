"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";

const noop = () => () => {};

/** The site's left arrow (components/ui/icons.tsx ArrowLeftIcon: the same path and stroke), drawn here instead of
 *  imported: importing it into client code made the shared icon module keep it in one of /'s first-load chunks
 *  (+120 bytes, measured), where until now only a server page used it. */
const Arrow = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);

/**
 * A product's real captures as a carousel (PROTOTYPE, the lab's Work slice): a CSS 3D coverflow. The active capture is
 * in front; its neighbours sit either side, turned, smaller and dimmed (perspective and rotateY on 2D elements: no
 * WebGL, no canvas). The WAI-ARIA "tabbed carousel": the dots are tabs, so one carousel is three tab stops (previous,
 * the chosen dot, next), and the arrow keys, Home and End move between captures. Touch: a sideways swipe. A side
 * capture can be clicked to bring it forward. It never moves on its own (no autoplay).
 *
 * - Without JavaScript, and until hydration: exactly the first capture, and no controls (they would do nothing).
 * - Reduced motion (the OS or the site's switch): a flat slider, one capture at a time, no turn, no movement.
 * - Lazy: a neighbour's capture is only mounted after hydration and only while it is one step from the front (never
 *   with reduced motion); every capture but the page's first is loading="lazy" as well.
 * - Server-rendered captures: the page renders each <picture> (Shot.tsx) on the server and hands them in as `shots`;
 *   this island only chooses which to mount. It imports no image data, so the live page's bundles are untouched (a
 *   first version that imported the image table made Turbopack re-cut two of /'s first-load chunks, measured).
 * - Every slide keeps its capture's box, mounted or not (`boxes`: each capture's ratio, and its phone crop's, from the
 *   server). So a gallery of mixed shapes (Aegis's alert row and its board) is as tall as its tallest capture from the
 *   first paint, with or without JS, and neither hydration nor a move shifts the page.
 */
export function Reel({ id, name, shots, alts, boxes }: { id: string; name: string; shots: ReactNode[]; alts: string[]; boxes: { ratio: string; phone?: string }[] }) {
  const n = shots.length;
  const [active, setActive] = useState(0);
  const [said, setSaid] = useState("");
  // false on the server and in the hydration pass, true after: the same markup on both sides, then the enhancement.
  const ready = useSyncExternalStore(noop, () => true, () => false);
  const flat = useReducedMotionPref();
  const dots = useRef<(HTMLButtonElement | null)[]>([]);
  const focusDot = useRef(false);
  const down = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);

  /** Where slide i sits relative to the front, circularly: 0 is in front, ±1 beside it, ±2 or more out of sight. */
  const offset = (i: number) => { let d = i - active; if (d > n / 2) d -= n; if (d < -n / 2) d += n; return d; };
  const go = (k: number, fromDot = false) => {
    const next = ((k % n) + n) % n;
    focusDot.current = fromDot;
    setActive(next);
    setSaid(`${name}: capture ${next + 1} of ${n}. ${alts[next]}`);
  };
  useEffect(() => {
    if (focusDot.current) { dots.current[active]?.focus(); focusDot.current = false; }
  }, [active]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const fromDot = (e.target as HTMLElement).getAttribute("role") === "tab";
    const to = e.key === "ArrowRight" ? active + 1 : e.key === "ArrowLeft" ? active - 1 : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : null;
    if (to === null) return;
    e.preventDefault();
    go(to, fromDot);
  };
  const onPointerDown = (e: React.PointerEvent) => { down.current = { x: e.clientX, y: e.clientY }; swiped.current = false; };
  const onPointerUp = (e: React.PointerEvent) => {
    const from = down.current; down.current = null;
    if (!from) return;
    const dx = e.clientX - from.x, dy = e.clientY - from.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { swiped.current = true; go(active + (dx < 0 ? 1 : -1)); }
  };

  return (
    <div className="wk__reel" role="region" aria-roledescription="carousel" aria-label={`${name}: captures`}
      data-ready={ready || undefined} data-flat={flat || undefined} onKeyDown={onKeyDown}>
      <div className="wk__track" onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => { down.current = null; }}>
        {shots.map((shot, i) => {
          const d = offset(i), front = i === active;
          const shown = front || (ready && !flat && Math.abs(d) === 1);
          return (
            <div key={i} id={`wk-${id}-slide-${i}`} className="wk__slide" role="tabpanel" aria-roledescription="slide"
              aria-label={`${i + 1} of ${n}`} aria-hidden={front ? undefined : true} data-offset={String(Math.max(-2, Math.min(2, d)))}
              data-shown={shown || undefined} onClick={front ? undefined : () => { if (!swiped.current) go(i); }}>
              <div className="wk__device" style={{ "--wk-box": boxes[i].ratio, "--wk-box-phone": boxes[i].phone } as CSSProperties}>{shown && shot}</div>
            </div>
          );
        })}
      </div>
      <div className="wk__controls">
        <button type="button" className="wk__step" aria-label="Previous capture" onClick={() => go(active - 1)}><Arrow /></button>
        <div className="wk__dots" role="tablist" aria-label={`${name}: choose a capture`}>
          {shots.map((_, i) => (
            <button key={i} ref={(el) => { dots.current[i] = el; }} type="button" role="tab" className="wk__dot"
              aria-selected={i === active} aria-controls={`wk-${id}-slide-${i}`} aria-label={`Capture ${i + 1} of ${n}`}
              tabIndex={i === active ? 0 : -1} onClick={() => go(i, true)} />
          ))}
        </div>
        <button type="button" className="wk__step wk__step--next" aria-label="Next capture" onClick={() => go(active + 1)}><Arrow /></button>
      </div>
      <p className="sr-only" aria-live="polite">{said}</p>
    </div>
  );
}
