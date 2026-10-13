import { describe, it, expect } from "vitest";
import { projects } from "@/data/projects";
import { skillGroups } from "@/data/skills";
import { projectsFor, termsFor, namesToken, lensProjects } from "@/data/stackLens";

describe("Stack project lens (M8): every highlight is backed by the project's own text", () => {
  it("each tool → project link has one of the tool's terms in that project's published text", () => {
    for (const item of skillGroups.flatMap((g) => g.items)) for (const id of projectsFor(item.label)) {
      const p = projects.find((x) => x.id === id)!;
      const text = [...p.stack.map((s) => s.label), ...p.metrics.map((m) => m.label), p.tagline, p.summary, p.description].join(" ");
      expect(termsFor(item.label).some((t) => namesToken(text, t)), `${item.label} → ${id}`).toBe(true);
    }
  });
  it("whole tokens only, and known facts hold", () => {
    expect(projectsFor("Java")).toEqual(["orders-delivery"]);          // not JavaScript, not JavaFX
    expect(projectsFor("C#").sort()).toEqual(["aegis", "poker"]);
    expect(projectsFor("Python").sort()).toEqual(["developeros", "job-assistant"]);
    expect(projectsFor("C")).toEqual([]);
    expect(projectsFor("Playwright")).toEqual([]);                      // used on this site, not in a listed project
  });
  it("every lens option lights at least one tool", () => {
    expect(lensProjects).toHaveLength(6);
    for (const l of lensProjects) expect(l.count, l.id).toBeGreaterThan(0);
  });
});
