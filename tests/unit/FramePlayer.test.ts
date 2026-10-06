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
  it("never falls back to a far-away frame: beyond maxJump it draws the fallback with no quad", () => {
    // 40 frames; only the last is decoded. At p pointing near frame 10, frame 39 is 29 away: a different beat.
    const many = Array.from({ length: 40 }, (_, i) => ({ file: `f${i}`, p: i / 39, quad: quad(0.1) }));
    const ctx = fakeCtx();
    const r = drawFrame({ ...base, ctx: ctx as never, frames: many, p: 10 / 39, store: { nearestDecoded: () => 39, get: (i: number) => (i === 39 ? img("far") : undefined) } });
    expect(ctx.calls).toEqual(["poster@1.00"]); expect(r.quad).toBeNull();
  });
});


describe("drawFrame: skipping unchanged draws (entrance smoothness pass)", () => {
  const store = { nearestDecoded: (i: number) => i, get: (i: number) => img(["a", "b", "c"][i]) };
  it("an identical plan does not repaint; a new frame, blend weight or size does", () => {
    const ctx = fakeCtx();
    const first = drawFrame({ ...base, ctx: ctx as never, frames, p: 0.25, store });
    expect(first.painted).toBe(true); expect(ctx.calls).toHaveLength(2);
    const same = drawFrame({ ...base, ctx: ctx as never, frames, p: 0.25, store, skipKey: first.key });
    expect(same.painted).toBe(false); expect(ctx.calls).toHaveLength(2);
    expect(same.quad).toEqual(first.quad);                       // the surface still gets its quad
    // Below 8-bit alpha resolution the blend is the same picture.
    expect(drawFrame({ ...base, ctx: ctx as never, frames, p: 0.25 + 1e-6, store, skipKey: first.key }).painted).toBe(false);
    expect(drawFrame({ ...base, ctx: ctx as never, frames, p: 0.26, store, skipKey: first.key }).painted).toBe(true);
    expect(drawFrame({ ...base, ctx: ctx as never, frames, p: 0.25, store, skipKey: first.key, vw: 961 }).painted).toBe(true);
  });
});

describe("drawFrame: adaptive cross-fade (entrance smoothness pass)", () => {
  const store = { nearestDecoded: (i: number) => i, get: (i: number) => img(["a", "b", "c"][i]) };
  it("blend: false draws the nearest frame alone, with that frame's own quad", () => {
    const ctx = fakeCtx();
    const r = drawFrame({ ...base, ctx: ctx as never, frames, p: 0.27, store, blend: false });
    expect(ctx.calls).toEqual(["c@1.00"]);                      // 0.27 is nearer c (0.3) than b (0.2)
    expect(r.quad![0].x).toBeCloseTo(0.2 * 960);                // c's quad, not an interpolated one
  });
  it("a second layer too faint to see is not drawn; a visible one is", () => {
    const a = fakeCtx(); drawFrame({ ...base, ctx: a as never, frames, p: 0.2005, store });
    expect(a.calls).toEqual(["b@1.00"]);
    const b = fakeCtx(); drawFrame({ ...base, ctx: b as never, frames, p: 0.21, store });
    expect(b.calls).toEqual(["b@1.00", "c@0.10"]);
  });
});

describe("drawFrame: hold instead of the poster mid-sequence (entrance smoothness pass)", () => {
  const empty = { nearestDecoded: () => null, get: () => undefined };
  it("with a frame already painted, nothing near decoded holds that frame and its quad", () => {
    const ctx = fakeCtx(); const held = quad(0.25);
    const r = drawFrame({ ...base, ctx: ctx as never, frames, p: 0.3, store: empty, skipKey: "pair:1:-:960x540@1.00000", held });
    expect(ctx.calls).toEqual([]); expect(r.path).toBe("hold"); expect(r.quad).toBe(held);
  });
  it("before anything is painted, the poster still stands in", () => {
    const ctx = fakeCtx();
    const r = drawFrame({ ...base, ctx: ctx as never, frames, p: 0.3, store: empty });
    expect(ctx.calls).toEqual(["poster@1.00"]); expect(r.path).toBe("fallback");
  });
});
