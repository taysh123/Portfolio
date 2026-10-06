import { BEATS } from "@/lib/timeline";

/**
 * Entrance pacing: how much scroll each cinematic beat gets.
 *
 * Progress `p` drives every beat (lib/timeline BEATS); `f` is the scroll fraction through the entrance's
 * runway. Phones map them 1:1. Desktop does not: at the old 400svh (2,700 px at 900 px tall) the beats were
 * 324–702 px each, while one ordinary trackpad swipe travels ~1,000 px and a flick ~2,500 px — a single swipe
 * crossed two beats and a flick all five, whatever Lenis's smoothing did (it shapes timing, never distance).
 * Desktop now has a 700svh container (a 600svh runway) split unevenly: the opening and the camera push get the
 * most room, the lift and the portal stay short so the start and the hand-off to the page remain responsive.
 * Piecewise linear, continuous and strictly increasing, so reversing is exact and p = 1 still means f = 1.
 */
const KNOTS_P = [0, BEATS.lift[1], BEATS.lid[1], BEATS.wake[1], BEATS.identity[1], BEATS.push[1], 1];

/** Share of the desktop runway per beat — lift, lid, wake, identity, push, portal — in px at 900 px tall. */
export const DESKTOP_BEAT_PX = [450, 1500, 900, 800, 1300, 450] as const;
const total = DESKTOP_BEAT_PX.reduce((a, b) => a + b, 0);
const KNOTS_F = DESKTOP_BEAT_PX.reduce<number[]>((acc, px) => [...acc, acc[acc.length - 1] + px / total], [0]);

const map = (x: number, from: number[], to: number[]) => {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  let i = 0; while (i < from.length - 2 && x > from[i + 1]) i++;
  return to[i] + ((to[i + 1] - to[i]) * (x - from[i])) / (from[i + 1] - from[i]);
};

export type Pacing = "linear" | "desktop";
/** Scroll fraction → progress. */
export const progressAt = (f: number, pacing: Pacing) => (pacing === "desktop" ? map(f, KNOTS_F, KNOTS_P) : Math.min(1, Math.max(0, f)));
/** Progress → scroll fraction (the inverse; for jumps to a beat and for tests). */
export const scrollFractionAt = (p: number, pacing: Pacing) => (pacing === "desktop" ? map(p, KNOTS_P, KNOTS_F) : Math.min(1, Math.max(0, p)));
