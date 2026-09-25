import type { Quad } from "./types";

export function resolveFrame(p: number, frames: { p: number }[]) {
  const n = frames.length;
  if (p <= frames[0].p) return { a: 0, b: 0, w: 0 };
  if (p >= frames[n - 1].p) return { a: n - 1, b: n - 1, w: 0 };
  let lo = 0, hi = n - 1;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (frames[mid].p <= p) lo = mid; else hi = mid; }
  return { a: lo, b: hi, w: (p - frames[lo].p) / (frames[hi].p - frames[lo].p) };
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

export function pickFramingKind(vw: number, vh: number) {
  if (vw / vh < 0.9) return { kind: "portrait" as const, containerSvh: 260 as const };
  return { kind: "landscape" as const, containerSvh: (vh < 500 ? 260 : 400) as 260 | 400 };
}

export function pickTier(tiers: number[], vw: number, dpr: number, saveData: boolean): number {
  const sorted = [...tiers].sort((a, b) => a - b);
  if (saveData) return sorted[0];
  const want = dpr >= 1.5 && vw >= 1280 ? Infinity : Math.min(vw * Math.min(dpr, 2), 1280);
  const fit = sorted.filter((t) => t <= want);
  return fit.length ? fit[fit.length - 1] : sorted[0];
}

export function lerpQuad(a: Quad | null, b: Quad | null, w: number): Quad | null {
  if (!a || !b) return null;
  return a.map((p, i) => ({ x: p.x + (b[i].x - p.x) * w, y: p.y + (b[i].y - p.y) * w })) as Quad;
}
