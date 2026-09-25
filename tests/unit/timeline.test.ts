import { describe, it, expect } from "vitest";
import { clamp01, segment, easeInOut, easeOut, BEATS } from "@/lib/timeline";

describe("segment", () => {
  it("is 0 before, 1 after, and linear inside", () => {
    expect(segment(0.05, 0.1, 0.2)).toBe(0);
    expect(segment(0.25, 0.1, 0.2)).toBe(1);
    expect(segment(0.15, 0.1, 0.2)).toBeCloseTo(0.5);
  });
  it("never produces a V on a flat hold (the August useTransform bug)", () => {
    const xs = Array.from({ length: 101 }, (_, i) => segment(i / 100, 0.16, 0.46));
    for (let i = 1; i < xs.length; i++) expect(xs[i]).toBeGreaterThanOrEqual(xs[i - 1]);
  });
  it("rejects empty or inverted ranges", () => {
    expect(() => segment(0.5, 0.4, 0.4)).toThrow(RangeError);
  });
  it("eases stay within 0..1 and hit the endpoints", () => {
    for (const e of [easeInOut, easeOut]) {
      expect(e(0)).toBe(0);
      expect(e(1)).toBe(1);
      expect(e(0.5)).toBeGreaterThan(0);
    }
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(2)).toBe(1);
  });
  it("beats match the spec", () => {
    expect(BEATS.lid).toEqual([0.12, 0.38]);
    expect(BEATS.push).toEqual([0.68, 0.88]);
    expect(BEATS.portal).toEqual([0.88, 1]);
  });
});
