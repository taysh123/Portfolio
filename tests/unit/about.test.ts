// tests/unit/about.test.ts
import { it, expect } from "vitest";
import { about } from "@/data/about";

it("uses the spec §5.3 title and the M10 facts line (the same three facts, minus the ∞ tile)", () => {
  expect(about.title).toEqual(["Engineer by training.", "Builder by nature."]);
  expect(about.facts).toEqual(["B.Sc. in Computer Science", "Full stack: web, mobile and backend", "Based in Israel, working in English"]);
});
it("the photograph says what it is: a render, captioned, with the four products named", () => {
  expect(about.photo.caption).toBe("Where the work happens");
  for (const name of ["Aegis", "DeveloperOS", "GRAVITY FLOW", "T Poker"]) expect(about.photo.alt).toContain(name);
  expect(about.photo.alt).toMatch(/render/i);
});
it("is two paragraphs with no new claims: no counts at all (the test total lives only in Stack, spec §5.3)", () => {
  expect(about.paragraphs).toHaveLength(2);
  for (const p of about.paragraphs) { expect(p).not.toMatch(/\d/); expect(p).not.toMatch(/6\+|shipped projects/i); }
});
