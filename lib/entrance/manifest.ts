import type { FrameSet, Manifest, Quad } from "./types";

const cross = (a: { x: number; y: number }, b: { x: number; y: number }, c: { x: number; y: number }) =>
  (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);

function convexCW(q: Quad): boolean {
  const s = q.map((_, i) => cross(q[i], q[(i + 1) % 4], q[(i + 2) % 4]));
  return s.every((v) => v > 0) || s.every((v) => v < 0);
}

function checkSet(kind: "landscape" | "portrait", s: FrameSet, errs: string[]) {
  const e = (m: string) => errs.push(`${kind}: ${m}`);
  if (!s.frames.length) e("no frames");
  for (let i = 1; i < s.frames.length; i++) if (!(s.frames[i].p > s.frames[i - 1].p)) e(`p not monotonic at ${i}`);
  s.frames.forEach((f, i) => {
    if (!f.quad) return;
    if (!f.quad.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y))) e(`non-finite quad at ${i}`);
    else if (!convexCW(f.quad)) e(`quad not convex/consistently wound at ${i}`);
    else if (f.p < 0.68 && !f.quad.every((p) => p.x >= 0 && p.x <= 1 && p.y >= 0 && p.y <= 1)) e(`pre-push quad outside [0,1] at ${i}`);
  });
  const end = s.frames[s.pushEndIndex]?.quad;
  if (!end) e("push end has no quad");
  else {
    const xs = end.map((p) => p.x), ys = end.map((p) => p.y);
    const spansW = Math.min(...xs) <= -0.015 && Math.max(...xs) >= 1.015;
    if (kind === "landscape" && !(spansW && Math.min(...ys) <= 0 && Math.max(...ys) >= 1)) e("push end must contain the whole frame");
    if (kind === "portrait" && !spansW) e("push end must span the full width with ≥3% overscan");
  }
  if (!s.tiers.length) e("no tiers");
}

export function validateManifest(m: Manifest): string[] {
  const errs: string[] = [];
  if (m.version !== 1) errs.push("unknown version");
  if (!/^[0-9a-f]{7,}$/.test(m.snapshot)) errs.push("snapshot must be a git hash");
  checkSet("landscape", m.landscape, errs);
  checkSet("portrait", m.portrait, errs);
  return errs;
}
