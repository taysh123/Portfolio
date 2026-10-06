// tests/unit/verify-provenance.test.ts — the VERIFY monitor's counts must still be true (spec §4.6 provenance).
// The frozen screen textures (design/render/blender/frozen, hash-checked by render.py) record what they drew in
// screens.json; every drawn count must still be that project's passing-test metric, and their sum the Stack
// section's lead figure. A change to a count in data/ therefore fails here until the screens are regenerated
// and the frames re-rendered (scripts in design/render/blender; then scripts/encode-frames.mjs).
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import { projects } from "@/data/projects";
import { skillGroups } from "@/data/skills";

const screens = JSON.parse(fs.readFileSync("design/render/blender/frozen/screens.json", "utf8")) as { verify_counts: Record<string, number> };
const manifest = JSON.parse(fs.readFileSync("public/entrance/manifest.json", "utf8")) as { verifyCounts?: Record<string, number> };

describe("VERIFY counts drawn on the frozen screen textures", () => {
  it("each count is still that project's passing-test metric in data/projects.ts", () => {
    expect(Object.keys(screens.verify_counts)).toHaveLength(5);
    for (const [name, n] of Object.entries(screens.verify_counts)) {
      const p = projects.find((x) => x.name === name);
      expect(p, name).toBeDefined();
      expect(p!.metrics.some((mt) => /test/i.test(mt.label) && mt.value.replace(/,/g, "") === String(n)), `${name} ${n}`).toBe(true);
    }
  });
  it("the total drawn equals the sum, which is the Stack section's lead figure", () => {
    const total = Object.values(screens.verify_counts).reduce((a, b) => a + b, 0);
    const lead = skillGroups.find((g) => g.id === "verify")!.lead!.value;
    expect(total).toBe(Number(lead.replace(/,/g, "")));
  });
  // The shipped frames were encoded from a render of these textures: the manifest carries the same counts.
  it.runIf(Boolean(manifest.verifyCounts))("the encoded frames' manifest carries the same counts", () => {
    expect(manifest.verifyCounts).toEqual(screens.verify_counts);
  });
});
