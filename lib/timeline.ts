/** Scroll-timeline maths. Every beat is an explicit, clamped segment, never a
 *  multi-stop useTransform range (those interpolated into a V in August). */
export type Ease = (t: number) => number;

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const linear: Ease = (t) => t;
export const easeOut: Ease = (t) => 1 - Math.pow(1 - t, 3);
export const easeInOut: Ease = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export function segment(p: number, start: number, end: number, ease: Ease = linear): number {
  if (!(end > start)) throw new RangeError(`segment: empty range [${start}, ${end}]`);
  return ease(clamp01((p - start) / (end - start)));
}

export const BEATS = {
  lift: [0, 0.12],
  titleOut: [0.12, 0.17],
  lid: [0.12, 0.38],
  wake: [0.38, 0.53],
  identity: [0.53, 0.68],
  push: [0.68, 0.88],
  portal: [0.88, 1],
  portraitOpen: [0.88, 0.96],
  navIn: [0.96, 1],
} as const satisfies Record<string, readonly [number, number]>;
