import { describe, it, expect } from "vitest";
import { progressAt, scrollFractionAt, DESKTOP_BEAT_PX } from "@/lib/entrance/pacing";
import { BEATS } from "@/lib/timeline";

describe("entrance pacing", () => {
  it("phones pace linearly", () => {
    for (const f of [0, 0.1, 0.5, 0.93, 1]) expect(progressAt(f, "linear")).toBeCloseTo(f, 10);
  });

  it("desktop is continuous, strictly increasing, and pins both ends", () => {
    expect(progressAt(0, "desktop")).toBe(0); expect(progressAt(1, "desktop")).toBe(1);
    let last = 0;
    for (let k = 1; k <= 1000; k++) { const p = progressAt(k / 1000, "desktop"); expect(p).toBeGreaterThan(last); expect(p - last).toBeLessThan(0.01); last = p; }
  });

  it("desktop inverts exactly (reversal lands where it started)", () => {
    for (let k = 0; k <= 100; k++) expect(progressAt(scrollFractionAt(k / 100, "desktop"), "desktop")).toBeCloseTo(k / 100, 10);
  });

  it("gives each beat its allotted share of the desktop runway", () => {
    const total = DESKTOP_BEAT_PX.reduce((a, b) => a + b, 0);
    const beats = [BEATS.lift, BEATS.lid, BEATS.wake, BEATS.identity, BEATS.push, [BEATS.push[1], 1]] as const;
    beats.forEach(([a, b], i) => expect(scrollFractionAt(b, "desktop") - scrollFractionAt(a, "desktop")).toBeCloseTo(DESKTOP_BEAT_PX[i] / total, 10));
  });

  it("a ~1,000 px trackpad swipe at 1440×900 stays within one beat of the opening (it crossed ~1.7 at 400svh)", () => {
    const runway = 6 * 900, start = scrollFractionAt(BEATS.lid[0], "desktop");
    const dp = progressAt(start + 1000 / runway, "desktop") - BEATS.lid[0];
    expect(dp).toBeLessThan(BEATS.lid[1] - BEATS.lid[0]);
  });
});
