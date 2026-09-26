import { describe, it, expect } from "vitest";
import fs from "node:fs";
import { projects } from "@/data/projects";
import { skillGroups } from "@/data/skills";
import { siteMeta } from "@/data/socials";
import { privateRepoLeaks } from "../support/private-repo";

describe("content truth", () => {
  it("no project lists a store for a platform its honest note excludes", () => {
    for (const p of projects) {
      const note = p.caseStudy.honestNote ?? "";
      if (/no iOS build/i.test(note)) expect(p.stores?.some((s) => s.platform === "ios")).toBeFalsy();
    }
  });
  it("the languages evidence does not claim C++ in shipped projects", () => {
    expect(skillGroups.find((g) => g.id === "languages")!.evidence).not.toMatch(/C\+\+ and C# carry/);
  });
  it("headline and hero lead are the approved copy", () => {
    expect(siteMeta.headline).toBe("I build software people can actually use.");
    expect(siteMeta.heroLead).toMatch(/^Computer Science graduate building polished products/);
  });
  it("no banned claims appear in site source", () => {
    for (const d of ["components", "data", "app"]) for (const f of (fs.readdirSync(d, { recursive: true }) as string[]).filter((f) => /\.tsx?$/.test(f))) {
      const t = fs.readFileSync(`${d}/${f}`, "utf8");
      expect(t, `${d}/${f}`).not.toMatch(/6\+ Shipped|1,077 roles/);
      expect(privateRepoLeaks(t), `${d}/${f}`).toEqual([]);   // the retired preview URL embedded the private slug
    }
  });
});
