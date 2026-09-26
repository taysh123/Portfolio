import { describe, it, expect } from "vitest";
import { resolveFrame, loadOrder, pickFramingKind, pickTier, lerpQuad } from "@/lib/entrance/frames";

const frames = [{ p: 0.12 }, { p: 0.2 }, { p: 0.38 }, { p: 0.53 }, { p: 0.68 }, { p: 0.88 }];

describe("resolveFrame", () => {
  it("holds the first frame before it and the last after", () => {
    expect(resolveFrame(0, frames)).toEqual({ a: 0, b: 0, w: 0 });
    expect(resolveFrame(1, frames)).toEqual({ a: 5, b: 5, w: 0 });
  });
  it("interpolates between neighbours", () => {
    const r = resolveFrame(0.16, frames);
    expect(r.a).toBe(0); expect(r.b).toBe(1); expect(r.w).toBeCloseTo(0.5);
  });
});

describe("loadOrder", () => {
  it("is poster, still, push end, then sparse lid, fill, push; every index exactly once", () => {
    const o = loadOrder(40, { stillIndex: 36, pushEndIndex: 39, lidEnd: 35, saveData: false });
    expect(o.slice(0, 3)).toEqual([0, 36, 39]);
    expect(new Set(o).size).toBe(40);
    expect(o.indexOf(4)).toBeLessThan(o.indexOf(1));      // sparse before fill
    expect(o.indexOf(35)).toBeLessThan(o.indexOf(37));    // lid before push
  });
  it("Save-Data keeps every 4th frame plus still and push end", () => {
    const o = loadOrder(40, { stillIndex: 36, pushEndIndex: 39, lidEnd: 35, saveData: true });
    expect(o).toContain(36); expect(o).toContain(39);
    expect(o.length).toBeLessThan(15);
  });
});

describe("pickFramingKind", () => {
  it.each([
    [1440, 900, "landscape", 400], [390, 844, "portrait", 260], [768, 1024, "portrait", 260],
    [844, 390, "landscape", 260], [1024, 768, "landscape", 400],
  ])("%ix%i → %s %i", (w, h, kind, svh) => {
    expect(pickFramingKind(w, h)).toEqual({ kind, containerSvh: svh });
  });
});

describe("pickTier", () => {
  it("never upscales past what exists and honours Save-Data", () => {
    expect(pickTier([960], 1440, 2, false)).toBe(960);
    expect(pickTier([1280, 1920], 1440, 2, false)).toBe(1920);
    expect(pickTier([1280, 1920], 1440, 1, false)).toBe(1280);
    expect(pickTier([1280, 1920], 1440, 2, true)).toBe(1280);
    // Phones animate from the 600 tier; a portrait tablet keeps 720.
    expect(pickTier([600, 720], 390, 3, false)).toBe(600);
    expect(pickTier([600, 720], 430, 3, false)).toBe(600);
    expect(pickTier([600, 720], 768, 2, false)).toBe(720);
  });
});

describe("lerpQuad", () => {
  it("is null when either side is null (back-facing)", () => {
    const q = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }] as const;
    expect(lerpQuad(null, [...q] as never, 0.5)).toBeNull();
    expect(lerpQuad([...q] as never, [...q] as never, 0.5)?.[2]).toEqual({ x: 1, y: 1 });
  });
});
