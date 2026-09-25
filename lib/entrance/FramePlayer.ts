import type { ManifestFrame, Quad } from "./types";
import { resolveFrame, lerpQuad } from "./frames";
import { coverFit, quadToViewport } from "./surface";

type Img = CanvasImageSource & { width: number; height: number };
export type Ctx2D = { globalAlpha: number; clearRect(x: number, y: number, w: number, h: number): void;
  drawImage(img: CanvasImageSource, dx: number, dy: number, dw: number, dh: number): void };

export function drawFrame(a: { ctx: Ctx2D; frames: ManifestFrame[]; p: number;
  store: { nearestDecoded(i: number): number | null; get(i: number): Img | undefined };
  fallback: Img | null; fallbackQuad: Quad | null; frameW: number; frameH: number; vw: number; vh: number; zoom: number;
  /** A decoded frame further than this from the wanted one belongs to another beat: draw the fallback instead. */
  maxJump?: number }) {
  const fit = coverFit(a.frameW, a.frameH, a.vw, a.vh, a.zoom);
  const put = (img: Img, alpha: number) => {
    a.ctx.globalAlpha = alpha;
    a.ctx.drawImage(img, fit.dx, fit.dy, a.frameW * fit.scale, a.frameH * fit.scale);
  };
  const toVp = (q: Quad | null) => (q ? quadToViewport(q, a.frameW, a.frameH, fit) : null);
  a.ctx.clearRect(0, 0, a.vw, a.vh);
  const { a: ia, b: ib, w } = resolveFrame(a.p, a.frames);
  const A = a.store.get(ia), B = a.store.get(ib);
  if (A && B) {
    put(A, 1); if (ib !== ia && w > 0) put(B, w);
    a.ctx.globalAlpha = 1;
    return { quad: toVp(lerpQuad(a.frames[ia].quad, a.frames[ib].quad, w)), drawnA: ia };
  }
  const want = w < 0.5 ? ia : ib;
  const found = a.store.nearestDecoded(want);
  // A distant keyframe (e.g. the push end while k1-on still decodes) would show the wrong beat — and the
  // surface, which follows the drawn frame's quad, would flash full-screen. Only a near frame may stand in.
  const near = found !== null && Math.abs(found - want) <= (a.maxJump ?? 8) ? found : null;
  const N = near === null ? undefined : a.store.get(near);
  if (N && near !== null) { put(N, 1); a.ctx.globalAlpha = 1; return { quad: toVp(a.frames[near].quad), drawnA: near }; }
  if (a.fallback) put(a.fallback, 1);
  a.ctx.globalAlpha = 1;
  return { quad: toVp(a.fallbackQuad), drawnA: null };
}
