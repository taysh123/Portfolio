// tests/unit/about.test.ts
import { it, expect } from "vitest";
import { about } from "@/data/about";

it("uses the spec §5.3 title and the approved facts row", () => {
  expect(about.title).toEqual(["Engineer by training.", "Builder by nature."]);
  expect(about.facts).toEqual([
    { value: "B.Sc.", label: "Computer Science" }, { value: "Full stack", label: "Web · Mobile · Backend" },
    { value: "Israel", label: "GMT+3 · works in English" }, { value: "∞", label: "Still learning" }]);
});
it("is two paragraphs with no new claims: no counts at all (1,742 lives only in Stack, spec §5.3)", () => {
  expect(about.paragraphs).toHaveLength(2);
  for (const p of about.paragraphs) { expect(p).not.toMatch(/\d/); expect(p).not.toMatch(/6\+|shipped projects/i); }
});
