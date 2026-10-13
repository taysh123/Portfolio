// tests/unit/about.test.ts
import { it, expect } from "vitest";
import fs from "node:fs";
import { about } from "@/data/about";

it("uses the spec §5.3 title and the owner's facts line (2026-10-13)", () => {
  expect(about.title).toEqual(["Engineer by training.", "Builder by nature."]);
  // The degree alone: the site names no institution (the owner's decision).
  expect(about.facts).toEqual(["B.Sc. in Computer Science", "Full-stack: web, mobile, and backend", "Based in Israel", "Working in English and Hebrew"]);
});
it("carries the owner's About paragraphs verbatim", () => {
  expect(about.paragraphs[0]).toBe("I'm a Computer Science graduate who enjoys turning complex ideas into useful, dependable software. I focus on clear data models, well-defined boundaries, and tests that make important constraints explicit.");
  expect(about.paragraphs[1]).toBe("I started with C and C++, where the machine makes mistakes hard to hide. Today, I work with C#/.NET, TypeScript, and Python, taking projects from an initial idea to working software. I'm looking for a software engineering opportunity that fits my skills and lets me contribute to useful, reliable products—from interface to infrastructure.");
});
it("is two paragraphs with no new claims: no counts at all (spec §5.3)", () => {
  expect(about.paragraphs).toHaveLength(2);
  for (const p of about.paragraphs) { expect(p).not.toMatch(/\d/); expect(p).not.toMatch(/6\+|shipped projects/i); }
});
it("the 3D workstation render and its caption are gone: no 'Where the work happens', no 'A 3D render, built in code.' anywhere", () => {
  for (const d of ["components", "data", "app", "lib"]) for (const f of (fs.readdirSync(d, { recursive: true }) as string[]).filter((f) => /\.(tsx?|css)$/.test(f))) {
    const t = fs.readFileSync(`${d}/${f}`, "utf8");
    expect(t, `${d}/${f}`).not.toMatch(/Where the work happens|A 3D render, built in code|about-studio/);
  }
  expect(fs.readdirSync("public/work").filter((f) => f.startsWith("about-studio"))).toEqual([]);
});
it("the visual names the four products in its one accessible label", () => {
  for (const name of ["Aegis", "DeveloperOS", "GRAVITY FLOW", "T Poker"]) expect(about.visual.label).toContain(name);
});
