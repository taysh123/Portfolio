import { describe, it, expect } from "vitest";
import { coverFit, circumscribed1610, surfaceTransform, containsRect } from "@/lib/entrance/surface";
import type { Quad } from "@/lib/entrance/types";

const vpQuad = (x: number, y: number, w: number, h: number): Quad =>
  [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }];
const scaleOf = (m: string) => Number(m.slice(9, -1).split(",")[0]);

describe("coverFit", () => {
  it("covers a 16:10 viewport with a 16:9 frame, centred", () => {
    const f = coverFit(1920, 1080, 1440, 900);
    expect(f.scale).toBeCloseTo(900 / 1080);
    expect(f.dy).toBeCloseTo(0);
    expect(f.dx).toBeCloseTo((1440 - 1920 * f.scale) / 2);
  });
});

describe("circumscribed1610", () => {
  it.each([[1440, 900], [1920, 1080], [2560, 1097], [1000, 1000], [900, 1000]])(
    "contains the %ix%i viewport and is 16:10", (vw, vh) => {
      const r = circumscribed1610(vw, vh);
      expect(r.w / r.h).toBeCloseTo(1.6, 6);
      expect(r.w).toBeGreaterThanOrEqual(vw - 1e-9);
      expect(r.h).toBeGreaterThanOrEqual(vh - 1e-9);
    });
});

describe("surfaceTransform: landscape hand-off has no bounce", () => {
  it.each([0.9, 1.6, 1.78, 2.33])("content scale is monotonic through the hand-off at aspect %f", (aspect) => {
    const vh = 900, vw = Math.round(vh * aspect);
    const r = circumscribed1610(vw, vh);
    // The rendered quad grows from 60% to 104% of the circumscribed rect (the late push).
    const scales = [0.6, 0.8, 0.95, 1.0, 1.02, 1.04].map((k, i, arr) => {
      const w = r.w * k, h = r.h * k;
      const q = vpQuad(vw / 2 - w / 2, vh / 2 - h / 2, w, h);
      const toIdentity = containsRect(q, vw, vh) ? i / (arr.length - 1) : 0;
      return scaleOf(surfaceTransform({ kind: "landscape", quad: q, vw, vh, toIdentity }).matrix);
    });
    for (let i = 1; i < scales.length; i++) expect(scales[i]).toBeGreaterThanOrEqual(scales[i - 1] - 0.045);
    expect(scales.at(-1)).toBeCloseTo(1, 1);
  });
  it("is exactly the identity mapping of the circumscribed box at toIdentity = 1", () => {
    const t = surfaceTransform({ kind: "landscape", quad: vpQuad(100, 100, 300, 187.5), vw: 1920, vh: 1080, toIdentity: 1 });
    expect(t.matrix).toBe("matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)");
    expect(t.clip).toBe("none");
  });
});

describe("surfaceTransform: portrait band", () => {
  it("clips to a centred band that opens to full at toIdentity = 1", () => {
    const q = vpQuad(0, 300, 390, 243.75);
    const a = surfaceTransform({ kind: "portrait", quad: q, vw: 390, vh: 844, toIdentity: 0 });
    const b = surfaceTransform({ kind: "portrait", quad: q, vw: 390, vh: 844, toIdentity: 1 });
    expect(a.clip).toMatch(/^inset\(/);
    expect(b.clip).toBe("none");
    expect(b.matrix).toBe("matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)");
  });
});
