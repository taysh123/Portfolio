import { describe, it, expect } from "vitest";
import { solveHomography, applyHomography, toMatrix3d } from "@/lib/entrance/homography";
import type { Quad } from "@/lib/entrance/types";

const rect = (w: number, h: number): Quad => [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: h }, { x: 0, y: h }];

describe("homography", () => {
  it("maps all four corners exactly", () => {
    const dst: Quad = [{ x: 310, y: 120 }, { x: 905, y: 140 }, { x: 880, y: 470 }, { x: 330, y: 452 }];
    const h = solveHomography(rect(1440, 900), dst);
    rect(1440, 900).forEach((p, i) => {
      const q = applyHomography(h, p);
      expect(q.x).toBeCloseTo(dst[i].x, 6);
      expect(q.y).toBeCloseTo(dst[i].y, 6);
    });
  });
  it("is the identity when src equals dst", () => {
    const h = solveHomography(rect(100, 50), rect(100, 50));
    expect(h.map((v) => Math.round(v * 1e9) / 1e9)).toEqual([1, 0, 0, 0, 1, 0, 0, 0, 1]);
    expect(toMatrix3d(h)).toBe("matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)");
  });
  it("throws on a degenerate quad", () => {
    const flat: Quad = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }];
    expect(() => solveHomography(rect(10, 10), flat)).toThrow();
  });
});
