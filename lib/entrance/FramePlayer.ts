import type { ManifestFrame, Quad } from "./types";
import { resolveFrame, lerpQuad } from "./frames";
import { coverFit, quadToViewport } from "./surface";

type Img = CanvasImageSource & { width: number; height: number };
export type Ctx2D = { globalAlpha: number; drawImage(img: CanvasImageSource, dx: number, dy: number, dw: number, dh: number): void };

/**
 * Draws the frame for progress `p` (cross-fading the two neighbours) and returns the screen quad the hero
 * surface must follow. Every draw covers the whole canvas (cover fit), so there is nothing to clear.
 *
 * `skipKey`: when what would be drawn is identical to the last draw (same frames, same blend to 8-bit alpha,
 * same zoom and size), the canvas is left alone — its backing store is then not re-uploaded to the
 * compositor, which profiling showed to be the dominant per-frame cost. The quad is returned either way.
 */
export function drawFrame(a: { ctx: Ctx2D; frames: ManifestFrame[]; p: number;
  store: { nearestDecoded(i: number): number | null; get(i: number): Img | undefined };
  fallback: Img | null; fallbackQuad: Quad | null; frameW: number; frameH: number; vw: number; vh: number; zoom: number;
  /** A decoded frame further than this from the wanted one belongs to another beat: draw the fallback instead. */
  maxJump?: number; skipKey?: string;
  /** false while the playhead crosses a whole frame or more per display frame: then an in-between blend adds
   *  nothing the eye can use, and the nearest frame is drawn alone with its own quad (image and surface stay
   *  locked together). Default true: the approved cross-fade. */
  blend?: boolean;
  /** The quad of the last frame painted. When nothing near the playhead is decoded mid-sequence, the canvas
   *  keeps that frame (a brief hold) rather than jumping back to the poster — the opening beat. */
  held?: Quad | null }) {
  const fit = coverFit(a.frameW, a.frameH, a.vw, a.vh, a.zoom);
  const toVp = (q: Quad | null) => (q ? quadToViewport(q, a.frameW, a.frameH, fit) : null);
  const size = `${a.vw}x${a.vh}@${a.zoom.toFixed(5)}`;
  const paint = (key: string, layers: [Img, number][]) => {
    if (key === a.skipKey) return false;
    for (const [img, alpha] of layers) {
      a.ctx.globalAlpha = alpha;
      a.ctx.drawImage(img, fit.dx, fit.dy, a.frameW * fit.scale, a.frameH * fit.scale);
    }
    a.ctx.globalAlpha = 1;
    return true;
  };

  const r = resolveFrame(a.p, a.frames);
  // Snap to the nearest frame when not blending, or when the second layer would be invisible.
  const snap = r.b !== r.a && (a.blend === false || r.w < 0.01 || r.w > 0.99);   // ≤ 2/255 alpha: invisible
  const { a: ia, b: ib, w } = snap ? (r.w < 0.5 ? { a: r.a, b: r.a, w: 0 } : { a: r.b, b: r.b, w: 0 }) : r;
  const A = a.store.get(ia), B = a.store.get(ib);
  if (A && B) {
    const blend = ib !== ia && w > 0, alpha = Math.round(w * 255);
    const key = `pair:${ia}:${blend ? `${ib}:${alpha}` : "-"}:${size}`;
    const painted = paint(key, blend ? [[A, 1], [B, w]] : [[A, 1]]);
    return { quad: toVp(lerpQuad(a.frames[ia].quad, a.frames[ib].quad, w)), drawnA: ia, path: blend ? "blend" : "single", want: ia, key, painted };
  }
  const want = w < 0.5 ? ia : ib;
  const found = a.store.nearestDecoded(want);
  // A distant keyframe (e.g. the push end while k1-on still decodes) would show the wrong beat — and the
  // surface, which follows the drawn frame's quad, would flash full-screen. Only a near frame may stand in.
  const near = found !== null && Math.abs(found - want) <= (a.maxJump ?? 8) ? found : null;
  const N = near === null ? undefined : a.store.get(near);
  if (N && near !== null) {
    const key = `near:${near}:${size}`;
    return { quad: toVp(a.frames[near].quad), drawnA: near, path: "near", want, key, painted: paint(key, [[N, 1]]) };
  }
  if (a.held !== undefined && a.skipKey) return { quad: a.held, drawnA: null, path: "hold", want, key: a.skipKey, painted: false };
  if (a.fallback) {
    const key = `fallback:${size}`;
    return { quad: toVp(a.fallbackQuad), drawnA: null, path: "fallback", want, key, painted: paint(key, [[a.fallback, 1]]) };
  }
  return { quad: toVp(a.fallbackQuad), drawnA: null, path: "none", want, key: "", painted: false };
}
