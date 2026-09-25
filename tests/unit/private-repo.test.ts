// T Poker's repository is private (user decision, 2026-09-26): no public link, no exposed address.
import { it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { projects, publicRepoUrl, PRIVATE_REPO_LABEL } from "@/data/projects";
import { INTERNAL_REPO_URLS } from "@/data/internal-repos";

const files = (d: string): string[] => fs.readdirSync(d, { withFileTypes: true })
  .flatMap((e) => (e.isDirectory() ? files(path.join(d, e.name)) : [path.join(d, e.name)]));
const src = ["app", "components", "data", "lib"].flatMap(files).filter((f) => /\.(tsx?|css)$/.test(f));

it("T Poker's repository is private: no public link, internal URL kept separately", () => {
  const poker = projects.find((p) => p.id === "poker")!;
  expect(poker.repo.visibility).toBe("private");
  expect(publicRepoUrl(poker)).toBeUndefined();
  expect(INTERNAL_REPO_URLS.poker).toBe("https://github.com/taysh123/poker-home-games");
  expect(PRIVATE_REPO_LABEL).toBe("Private repository");
});

it("every other project keeps its public source link", () => {
  for (const p of projects.filter((x) => x.id !== "poker")) expect(publicRepoUrl(p), p.id).toMatch(/^https:\/\/github\.com\/taysh123\//);
});

it("every private project has an internal URL, and only private projects do", () => {
  const priv = projects.filter((p) => p.repo.visibility === "private").map((p) => p.id).sort();
  expect(Object.keys(INTERNAL_REPO_URLS).sort()).toEqual(priv);
});

it("the private address appears only in the internal module, which no site code imports", () => {
  const leaks = src.filter((f) => !f.endsWith(path.join("data", "internal-repos.ts")) && /poker-home-games(?!-three)/.test(fs.readFileSync(f, "utf8")));
  expect(leaks).toEqual([]);
  const importers = src.filter((f) => /internal-repos/.test(fs.readFileSync(f, "utf8")) && !f.endsWith("internal-repos.ts") && !f.endsWith(path.join("data", "projects.ts")));
  expect(importers).toEqual([]);
  // projects.ts may mention the module in a comment, never import it.
  expect(fs.readFileSync("data/projects.ts", "utf8")).not.toMatch(/from\s+["'][^"']*internal-repos/);
});
