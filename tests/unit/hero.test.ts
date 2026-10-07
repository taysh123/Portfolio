import { describe, it, expect } from "vitest";
import fs from "node:fs";
import { projects } from "@/data/projects";
import { flagships } from "@/data/work";
import { skillGroups } from "@/data/skills";
import { siteMeta } from "@/data/socials";
import { heroIndex, passingTests, indexState } from "@/data/proof";

const metric = (id: string, label: string) => Number(projects.find((p) => p.id === id)!.metrics.find((m) => m.label === label)!.value.replace(/,/g, ""));

describe("hero proof and index (M1)", () => {
  it("the passing-test total is the sum of the five projects' own test metrics", () => {
    const sum = metric("poker", "Passing tests, both stacks") + metric("aegis", "Passing tests, incl. Testcontainers")
      + metric("developeros", "Tests · 0.82:1 to source") + metric("gravity-flow", "Tests over 28 files") + metric("job-assistant", "Tests");
    expect(passingTests.value).toBe(sum.toLocaleString("en-US"));
    expect(passingTests.projects).toBe(5);
    expect(passingTests.value).toBe("7,061");   // the published figure: a change here must be a deliberate data change
  });
  it("Stack and the social card read the same derived figure; no source types it by hand", () => {
    const testing = skillGroups.find((g) => g.lead?.unit.includes("passing tests"))!;
    expect(testing.lead!.value).toBe(passingTests.value);
    expect(testing.evidence.startsWith(`${passingTests.value} passing tests across five projects`)).toBe(true);
    for (const f of ["data/skills.ts", "app/opengraph-image.tsx", "components/sections/Hero.tsx"]) expect(fs.readFileSync(f, "utf8"), f).not.toMatch(/7,061/);
  });
  it("the index lists the four flagships in Work order, each linking to its scene", () => {
    expect(heroIndex.map((x) => x.id)).toEqual(flagships.map((f) => f.id));
    expect(heroIndex.map((x) => x.name)).toEqual(["T Poker", "Aegis", "DeveloperOS", "GRAVITY FLOW"]);
    for (const x of heroIndex) expect(x.href).toBe(`#work-${x.id}`);
  });
  it("each state is supported by the project's own status, stores and repository", () => {
    expect(Object.fromEntries(heroIndex.map((x) => [x.id, x.state]))).toEqual({
      poker: "Live on iOS & Android", aegis: "Open source", developeros: "Released", "gravity-flow": "Release candidate" });
    const poker = projects.find((p) => p.id === "poker")!;
    // Without both live store links the claim must fall back to the plain status.
    expect(indexState({ ...poker, stores: poker.stores!.filter((s) => s.platform !== "ios") })).toBe("Live");
    const aegis = projects.find((p) => p.id === "aegis")!;
    expect(indexState({ ...aegis, repo: { visibility: "private" } })).toBe("Runs locally");
  });
  it("the hero lead only names what the data supports", () => {
    const lead = siteMeta.heroLead;
    const poker = projects.find((p) => p.id === "poker")!;
    if (/App Store/.test(lead)) expect(poker.stores!.some((s) => s.platform === "ios" && s.status === "live" && s.url)).toBe(true);
    if (/Google Play/.test(lead)) expect(poker.stores!.some((s) => s.platform === "android" && s.status === "live" && s.url)).toBe(true);
    if (/real-time security/.test(lead)) expect(projects.find((p) => p.id === "aegis")!.summary + JSON.stringify(projects.find((p) => p.id === "aegis"))).toMatch(/SignalR|real-time/i);
    if (/local-first/.test(lead)) expect(JSON.stringify(projects.find((p) => p.id === "developeros"))).toMatch(/local-first/i);
    expect(lead).not.toMatch(/production-ready|polished|world-class|expert|senior/i);
  });
});
