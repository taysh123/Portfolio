import type { Quad } from "./types";
import { solveHomography, toMatrix3d } from "./homography";

export type Fit = { scale: number; dx: number; dy: number };

export function coverFit(frameW: number, frameH: number, vw: number, vh: number, zoom = 1): Fit {
  const scale = Math.max(vw / frameW, vh / frameH) * zoom;
  return { scale, dx: (vw - frameW * scale) / 2, dy: (vh - frameH * scale) / 2 };
}

/** Quad in 0..1 image space → viewport px. */
export function quadToViewport(q: Quad, frameW: number, frameH: number, fit: Fit): Quad {
  return q.map((p) => ({ x: p.x * frameW * fit.scale + fit.dx, y: p.y * frameH * fit.scale + fit.dy })) as Quad;
}

/** The 16:10 rectangle that circumscribes the viewport, centred on it (§4.3). */
export function circumscribed1610(vw: number, vh: number) {
  const w = vw / vh >= 1.6 ? vw : vh * 1.6;
  const h = w / 1.6;
  return { x: (vw - w) / 2, y: (vh - h) / 2, w, h };
}

/** True when the quad covers the whole w×h viewport (convex quad test). */
export function containsRect(q: Quad, w: number, h: number): boolean {
  const pts = [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: h }, { x: 0, y: h }];
  return pts.every((p) =>
    q.every((a, i) => {
      const b = q[(i + 1) % 4];
      return (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x) >= -1e-6;
    }),
  );
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpQ = (a: Quad, b: Quad, t: number) =>
  a.map((p, i) => ({ x: lerp(p.x, b[i].x, t), y: lerp(p.y, b[i].y, t) })) as Quad;
const rectQ = (x: number, y: number, w: number, h: number): Quad =>
  [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }];

/**
 * Landscape: the surface box is the circumscribed 16:10 rect (bands are --screen),
 * mapped onto the quad, then eased to identity. Portrait: the box is the viewport;
 * its centred 16:10 band maps onto the quad and the clip opens to full.
 * `toIdentity` is 0..1. Returned `box` is where the element sits before transform.
 */
export function surfaceTransform(a: { kind: "landscape" | "portrait"; quad: Quad; vw: number; vh: number; toIdentity: number }) {
  const t = Math.min(1, Math.max(0, a.toIdentity));
  if (a.kind === "landscape") {
    // The element is laid out at (box.x, box.y) with size box.w × box.h (set once per
    // viewport by EntranceStage); the matrix is relative to that position, so t = 1 is
    // exactly the identity.
    const box = circumscribed1610(a.vw, a.vh);
    const local = rectQ(0, 0, box.w, box.h);
    const target = lerpQ(a.quad, rectQ(box.x, box.y, box.w, box.h), t);
    const targetLocal = target.map((p) => ({ x: p.x - box.x, y: p.y - box.y })) as Quad;
    const matrix = t === 1 ? toMatrix3d([1, 0, 0, 0, 1, 0, 0, 0, 1]) : toMatrix3d(solveHomography(local, targetLocal));
    return { matrix, clip: "none", box };
  }
  const bandH = a.vw / 1.6;
  const bandY = (a.vh - bandH) / 2;
  const band = rectQ(0, bandY, a.vw, bandH);
  const hBand = solveHomography(band, a.quad);
  const full = rectQ(0, 0, a.vw, a.vh);
  const mappedFull = full.map((p) => {
    const w = hBand[6] * p.x + hBand[7] * p.y + hBand[8];
    return { x: (hBand[0] * p.x + hBand[1] * p.y + hBand[2]) / w, y: (hBand[3] * p.x + hBand[4] * p.y + hBand[5]) / w };
  }) as Quad;
  const target = lerpQ(mappedFull, full, t);
  const matrix = t === 1 ? toMatrix3d([1, 0, 0, 0, 1, 0, 0, 0, 1]) : toMatrix3d(solveHomography(full, target));
  const inset = bandY * (1 - t);
  const clip = t === 1 ? "none" : `inset(${inset.toFixed(2)}px 0px ${inset.toFixed(2)}px 0px)`;
  return { matrix, clip, box: { x: 0, y: 0, w: a.vw, h: a.vh } };
}
