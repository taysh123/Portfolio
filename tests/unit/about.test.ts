// tests/unit/about.test.ts
import { it, expect } from "vitest";
import { about } from "@/data/about";

it("uses the spec §5.3 title and the M10 facts line (the same three facts, minus the ∞ tile)", () => {
  expect(about.title).toEqual(["Engineer by training.", "Builder by nature."]);
  // The degree alone: the site names no institution (the owner's decision).
  expect(about.facts).toEqual(["B.Sc. in Computer Science", "Full-stack: web, mobile, and backend", "Based in Israel, working in English"]);
});
it("the photograph says what it is: a render, in the visible caption; the alt text names the four products without repeating it", () => {
  expect(about.photo.caption).toBe("Where the work happens");
  expect(about.photo.note).toBe("A 3D render, built in code.");
  for (const name of ["Aegis", "DeveloperOS", "GRAVITY FLOW", "T Poker"]) expect(about.photo.alt).toContain(name);
  expect(about.photo.alt).not.toContain(about.photo.note);
});
it("is two paragraphs with no new claims: no counts at all (the test total lives only in Stack, spec §5.3)", () => {
  expect(about.paragraphs).toHaveLength(2);
  for (const p of about.paragraphs) { expect(p).not.toMatch(/\d/); expect(p).not.toMatch(/6\+|shipped projects/i); }
});
