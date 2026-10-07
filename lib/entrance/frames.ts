import type { Quad } from "./types";

export function resolveFrame(p: number, frames: { p: number }[]) {
  const n = frames.length;
  if (p <= frames[0].p) return { a: 0, b: 0, w: 0 };
  if (p >= frames[n - 1].p) return { a: n - 1, b: n - 1, w: 0 };
  let lo = 0, hi = n - 1;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (frames[mid].p <= p) lo = mid; else hi = mid; }
  return { a: lo, b: hi, w: (p - frames[lo].p) / (frames[hi].p - frames[lo].p) };
}

/** Index of the value in the ascending list `ps` nearest to p (ties go to the lower index). */
export function nearestIndex(ps: number[], p: number): number {
  const n = ps.length;
  if (p <= ps[0]) return 0;
  if (p >= ps[n - 1]) return n - 1;
  let lo = 0, hi = n - 1;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (ps[mid] <= p) lo = mid; else hi = mid; }
  return p - ps[lo] <= ps[hi] - p ? lo : hi;
}

export function loadOrder(n: number, o: { stillIndex: number; pushEndIndex: number; lidEnd: number; saveData: boolean }): number[] {
  const out: number[] = [];
  const push = (i: number) => { if (i >= 0 && i < n && !out.includes(i)) out.push(i); };
  push(0); push(o.stillIndex); push(o.pushEndIndex);
  for (let i = 0; i <= o.lidEnd; i += 4) push(i);
  for (let i = o.lidEnd + 1; i < n; i += 4) push(i);
  if (o.saveData) return out;
  for (let i = 0; i <= o.lidEnd; i++) push(i);
  for (let i = o.lidEnd + 1; i < n; i++) push(i);
  return out;
}

/**
 * Framing and scroll runway (container height; the runway is that minus one viewport). Phones scroll natively,
 * and at 260svh one ordinary swipe (~60% of the screen of finger travel) crossed ~0.375 of the sequence — up to
 * three beats — while a short landscape screen played all 65 landscape frames over 624 px. Measured runways
 * (scripts/profile-entrance.mjs --variant '{"runway":…}'): portrait 340svh brings a swipe to ~0.25 (about one
 * beat) and 2–3 frames per display frame on a fast swipe; short landscape needs 360svh to stop outrunning its
 * frames. Both pace linearly. Desktop (wheel and trackpad) has 700svh with per-beat pacing: lib/entrance/pacing.ts.
 */
export function pickFramingKind(vw: number, vh: number) {
  if (vw / vh < 0.9) return { kind: "portrait" as const, containerSvh: 340 as const, pacing: "linear" as const };
  return vh < 500
    ? { kind: "landscape" as const, containerSvh: 360 as const, pacing: "linear" as const }
    : { kind: "landscape" as const, containerSvh: 700 as const, pacing: "desktop" as const };
}

export function pickTier(tiers: number[], vw: number, dpr: number, saveData: boolean): number {
  const sorted = [...tiers].sort((a, b) => a - b);
  if (saveData) return sorted[0];
  // Phones (narrower than 480 CSS px) animate from a tier of at most 640 px: measured smoother on a
  // mobile-class CPU than 720, with no visible difference at device resolution (scripts/profile-entrance.mjs).
  const want = dpr >= 1.5 && vw >= 1280 ? Infinity : Math.min(vw * Math.min(dpr, 2), vw < 480 ? 640 : 1280);
  const fit = sorted.filter((t) => t <= want);
  return fit.length ? fit[fit.length - 1] : sorted[0];
}

export function lerpQuad(a: Quad | null, b: Quad | null, w: number): Quad | null {
  if (!a || !b) return null;
  return a.map((p, i) => ({ x: p.x + (b[i].x - p.x) * w, y: p.y + (b[i].y - p.y) * w })) as Quad;
}

/**
 * Frame format. Phone portrait (narrower than 480 CSS px) plays the WebP copy of its tier when the manifest
 * has one: on a phone-class CPU WebP decodes in about two thirds of AVIF's time (scripts/bench-frame-formats.mjs),
 * and decoding is what a phone's scroll waits on once the ~0.9 MB set is fetched. Landscape, tablets and the
 * posters stay AVIF.
 */
export function pickFormat(set: { webp?: number[] }, kind: "landscape" | "portrait", tier: number, vw: number): "avif" | "webp" {
  return kind === "portrait" && vw < 480 && (set.webp?.includes(tier) ?? false) ? "webp" : "avif";
}
