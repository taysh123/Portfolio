import { describe, it, expect } from "vitest";
import { stageGeometry } from "@/components/entrance/stageGeometry";

describe("stageGeometry", () => {
  it("re-derives framing and container height on resize", () => {
    expect(stageGeometry(1440, 900)).toEqual({ kind: "landscape", containerSvh: 700, pacing: "desktop" });
    expect(stageGeometry(390, 844)).toEqual({ kind: "portrait", containerSvh: 340, pacing: "linear" });
    expect(stageGeometry(844, 390)).toEqual({ kind: "landscape", containerSvh: 360, pacing: "linear" });
  });
});
