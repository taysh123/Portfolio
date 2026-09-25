import { describe, it, expect } from "vitest";
import { cn } from "@/lib/cn";

describe("toolchain", () => {
  it("resolves the @ alias", () => {
    expect(cn("a", false && "b", "c")).toBe("a c");
  });
});
