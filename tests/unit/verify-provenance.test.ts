// tests/unit/verify-provenance.test.ts — the VERIFY monitor's counts must still be true (spec §4.6 provenance).
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import { projects } from "@/data/projects";

const m = JSON.parse(fs.readFileSync("public/entrance/manifest.json", "utf8"));
describe.runIf(Boolean(m.verifyCounts))("VERIFY counts drawn in the frames", () => {
  it("each count is still that project's test metric in data/projects.ts", () => {
    for (const [name, n] of Object.entries(m.verifyCounts as Record<string, number>)) {
      const p = projects.find((x) => x.name === name);
      expect(p, name).toBeDefined();
      expect(p!.metrics.some((mt) => /test/i.test(mt.label) && mt.value.replace(/,/g, "") === String(n)), `${name} ${n}`).toBe(true);
    }
  });
  it("the total drawn equals the sum", () => {
    const total = Object.values(m.verifyCounts as Record<string, number>).reduce((a, b) => a + b, 0);
    expect(total).toBe(1742);
  });
});
