// tests/unit/scene.test.ts
import { describe, it, expect } from "vitest";
import { pinEligible, scenePhases, pillarState, PIN_MIN } from "@/lib/scene";

describe("pinEligible", () => {
  it("pins only at ≥ 1024×600 with motion allowed", () => {
    expect(pinEligible(1024, 600, false)).toBe(true);
    expect(pinEligible(1023, 800, false)).toBe(false);   // portrait tablets, phones
    expect(pinEligible(1366, 599, false)).toBe(false);   // short landscape
    expect(pinEligible(1440, 900, true)).toBe(false);    // reduced motion, either source
    expect(PIN_MIN).toEqual({ w: 1024, h: 600 });
  });
});
describe("scenePhases", () => {
  it("assembles over 0–.30, holds .30–.70, recedes .70–1, clamped and monotonic", () => {
    expect(scenePhases(0)).toEqual({ assemble: 0, hold: 0, recede: 0 });
    expect(scenePhases(0.3).assemble).toBe(1);
    expect(scenePhases(0.5).hold).toBeCloseTo(0.5);
    expect(scenePhases(0.7)).toMatchObject({ assemble: 1, hold: 1, recede: 0 });
    expect(scenePhases(1)).toEqual({ assemble: 1, hold: 1, recede: 1 });
    expect(scenePhases(-1)).toEqual(scenePhases(0)); expect(scenePhases(2)).toEqual(scenePhases(1));
    let prev = -1; for (let p = 0; p <= 1; p += 0.01) { const r = scenePhases(p).recede; expect(r).toBeGreaterThanOrEqual(prev); prev = r; }
  });
});
describe("pillarState", () => {
  it("lights Think, Build, Ship in turn as the hairline travels", () => {
    expect(pillarState(0)).toEqual({ lit: 0, line: 0 });
    expect(pillarState(0.5).lit).toBe(1);
    expect(pillarState(0.95)).toEqual({ lit: 2, line: 1 });
  });
});
