import { describe, it, expect } from "vitest";
import { stageGeometry } from "@/components/entrance/stageGeometry";

describe("stageGeometry", () => {
  it("re-derives framing and container height on resize", () => {
    expect(stageGeometry(1440, 900)).toEqual({ kind: "landscape", containerSvh: 400 });
    expect(stageGeometry(390, 844)).toEqual({ kind: "portrait", containerSvh: 260 });
    expect(stageGeometry(844, 390)).toEqual({ kind: "landscape", containerSvh: 260 });
  });
});
