// tests/unit/approach.test.ts — each condensed example is drawn from the steps it cites (spec §5.5).
import { it, expect } from "vitest";
import { approachSteps, pillars } from "@/data/approach";

const words = (s: string) => new Set(s.toLowerCase().match(/[a-z]{4,}/g) ?? []);
it("lines are the spec's", () => {
  expect(pillars.map((p) => [p.word, p.line])).toEqual([["Think", "Architecture before implementation."], ["Build", "Clean, maintainable systems."], ["Ship", "Test. Deploy. Improve."]]);
});
it("each example shares ≥ 60% of its content words with the evidence it cites, and adds no numbers", () => {
  for (const p of pillars) {
    const src = p.from.map((id) => approachSteps.find((s) => s.id === id)!).map((s) => `${s.summary} ${s.evidence} ${s.project}`).join(" ");
    const w = [...words(p.example)], hit = w.filter((x) => words(src).has(x)).length;
    expect(hit / w.length, p.word).toBeGreaterThanOrEqual(0.6);
    for (const n of p.example.match(/\d+/g) ?? []) expect(src).toContain(n);
  }
});
