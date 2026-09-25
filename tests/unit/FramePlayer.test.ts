import { describe, it, expect } from "vitest";
import { drawFrame } from "@/lib/entrance/FramePlayer";

const quad = (k: number) => [{ x: k, y: 0.2 }, { x: 1 - k, y: 0.2 }, { x: 1 - k, y: 0.6 }, { x: k, y: 0.6 }] as never;
const frames = [{ file: "a", p: 0.1, quad: null }, { file: "b", p: 0.2, quad: quad(0.3) }, { file: "c", p: 0.3, quad: quad(0.2) }];
const img = (id: string) => ({ id, width: 960, height: 540 }) as never;
const fakeCtx = () => { const calls: string[] = []; return { calls, globalAlpha: 1, clearRect() {}, drawImage(i: { id: string }) { calls.push(`${i.id}@${this.globalAlpha.toFixed(2)}`); } }; };
const base = { frameW: 960, frameH: 540, vw: 960, vh: 540, zoom: 1, fallback: img("poster"), fallbackQuad: null };

describe("drawFrame", () => {
  it("cross-fades the two neighbours and returns the interpolated drawn quad", () => {
    const ctx = fakeCtx();
    const store = { nearestDecoded: (i: number) => i, get: (i: number) => img(["a", "b", "c"][i]) };
    const r = drawFrame({ ...base, ctx: ctx as never, frames, p: 0.25, store });
    expect(ctx.calls).toEqual(["b@1.00", "c@0.50"]);
    expect(r.quad![0].x).toBeCloseTo(0.25 * 960);
  });
  it("uses the nearest decoded frame's own quad when the wanted one is missing", () => {
    const ctx = fakeCtx();
    const store = { nearestDecoded: () => 1, get: (i: number) => (i === 1 ? img("b") : undefined) };
    const r = drawFrame({ ...base, ctx: ctx as never, frames, p: 0.3, store });
    expect(ctx.calls).toEqual(["b@1.00"]);
    expect(r.quad![0].x).toBeCloseTo(0.3 * 960);
  });
  it("draws the fallback with its quad when nothing is decoded", () => {
    const ctx = fakeCtx();
    const r = drawFrame({ ...base, ctx: ctx as never, frames, p: 0.3, store: { nearestDecoded: () => null, get: () => undefined } });
    expect(ctx.calls).toEqual(["poster@1.00"]); expect(r.quad).toBeNull();
  });
});
