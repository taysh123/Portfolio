import { describe, it, expect } from "vitest";
import fs from "node:fs";
import { projects } from "@/data/projects";
import { flagships } from "@/data/work";
import { skillGroups } from "@/data/skills";
import { siteMeta } from "@/data/socials";
import { heroIndex, indexState } from "@/data/proof";

describe("hero proof and index (M1)", () => {
  it("M9: the summed test figure is gone everywhere it was shown, and nothing re-derives it", () => {
    // 6,210 of its 8,117 came from a private repository and Aegis has no CI: a reader could not check it.
    for (const f of ["data/skills.ts", "data/proof.ts", "app/opengraph-image.tsx", "components/sections/Hero.tsx", "components/sections/Stack.tsx"])
      expect(fs.readFileSync(f, "utf8"), f).not.toMatch(/8,117|passingTests|passing tests across/i);
  });
  it("the Stack's CI claim names only projects whose public repository runs tests in CI", () => {
    const testing = skillGroups.find((g) => g.id === "delivery")!;
    const ci = testing.evidence.split(";")[0];
    const named = ["T Poker", "Aegis", "DeveloperOS", "GRAVITY FLOW", "Job Assistant"].filter((n) => ci.includes(n));
    // Aegis has no CI; T Poker's is private; Job Assistant's CI isn't stated in data/projects.ts, so it isn't claimed.
    expect(named).toEqual(["DeveloperOS", "GRAVITY FLOW"]);
  });
  it("the index lists the four flagships in Work order, each linking to its scene", () => {
    expect(heroIndex.map((x) => x.id)).toEqual(flagships.map((f) => f.id));
    expect(heroIndex.map((x) => x.name)).toEqual(["T Poker", "Aegis", "DeveloperOS", "GRAVITY FLOW"]);
    for (const x of heroIndex) expect(x.href).toBe(`#work-${x.id}`);
  });
  it("each state is supported by the project's own status, stores and repository", () => {
    expect(Object.fromEntries(heroIndex.map((x) => [x.id, x.state]))).toEqual({
      poker: "Live on iOS & Android", aegis: "Source on GitHub", developeros: "Released", "gravity-flow": "Release candidate" });
    // Aegis has no licence file, so it is never called open source.
    expect(heroIndex.map((x) => x.state)).not.toContain("Open source");
    const poker = projects.find((p) => p.id === "poker")!;
    // Without both live store links the claim must fall back to the plain status.
    expect(indexState({ ...poker, stores: poker.stores!.filter((s) => s.platform !== "ios") })).toBe("Live");
    const aegis = projects.find((p) => p.id === "aegis")!;
    expect(indexState({ ...aegis, repo: { visibility: "private" } })).toBe("Runs locally");
  });
  it("the hero lead only names what the data supports", () => {
    const lead = siteMeta.heroLead;
    // M10: the range in four kinds of product, one per plate.
    for (const kind of ["mobile apps", "security systems", "developer tools", "games"]) expect(lead.toLowerCase()).toContain(kind);
    // A whole sentence with a subject, not a fragment.
    expect(lead).toMatch(/^I'm a software engineer\b.*\.$/);
    const poker = projects.find((p) => p.id === "poker")!;
    if (/App Store/.test(lead)) expect(poker.stores!.some((s) => s.platform === "ios" && s.status === "live" && s.url)).toBe(true);
    if (/Google Play/.test(lead)) expect(poker.stores!.some((s) => s.platform === "android" && s.status === "live" && s.url)).toBe(true);
    if (/real-time security/.test(lead)) expect(projects.find((p) => p.id === "aegis")!.summary + JSON.stringify(projects.find((p) => p.id === "aegis"))).toMatch(/SignalR|real-time/i);
    if (/local-first/.test(lead)) expect(JSON.stringify(projects.find((p) => p.id === "developeros"))).toMatch(/local-first/i);
    if (/physics game/.test(lead)) expect(JSON.stringify(projects.find((p) => p.id === "gravity-flow"))).toMatch(/physics/i);
    expect(lead).not.toMatch(/production-ready|polished|world-class|expert|senior/i);
  });
});
