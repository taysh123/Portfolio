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
    // Checked in the repositories (M10 copy pass): Aegis lists Framer Motion but never imports it; T Poker signs its
    // own JWTs with HS256 (RS256 is Aegis's); Firebase is GRAVITY FLOW's analytics; DeveloperOS tests with unittest.
    expect(projectsFor("Framer Motion")).toEqual([]);
    expect(projectsFor("JWT").sort()).toEqual(["aegis", "poker"]);
    expect(projectsFor("Firebase")).toEqual(["gravity-flow"]);
    expect(projectsFor("pytest")).toEqual(["job-assistant"]);
    expect(projectsFor("Tailwind CSS")).toEqual(["aegis"]);
    expect(projectsFor("Vercel")).toEqual(["poker"]);
  });
  it("a tool no listed project names says where it is used instead; everyday tools name no project", () => {
    for (const g of skillGroups) for (const i of g.items)
      if (g.related !== false && projectsFor(i.label).length === 0) expect(i.note, i.label).toBeTruthy();
    const everyday = skillGroups.find((g) => g.id === "workflow")!;
    expect(everyday.related).toBe(false);
    for (const i of everyday.items) expect(projectsFor(i.label), i.label).toEqual([]);
  });
  it("every lens option lights at least one tool", () => {
    expect(lensProjects).toHaveLength(6);
    for (const l of lensProjects) expect(l.count, l.id).toBeGreaterThan(0);
  });
});
