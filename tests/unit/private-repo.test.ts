// T Poker's repository is private (user decision, 2026-09-26): no public link, and no address anywhere in this
// public repository. Leak checks use a digest of the slug (tests/support/private-repo.ts), never the name.
import { it, expect } from "vitest";
import fs from "node:fs";
import { execSync } from "node:child_process";
import { projects, publicRepoUrl, PRIVATE_REPO_LABEL } from "@/data/projects";
import { privateRepoLeaks } from "../support/private-repo";

it("T Poker's repository is private: no URL in its data, and the public label", () => {
  const poker = projects.find((p) => p.id === "poker")!;
  expect(poker.repo).toEqual({ visibility: "private" });
  expect(publicRepoUrl(poker)).toBeUndefined();
  expect(PRIVATE_REPO_LABEL).toBe("Private repository");
});

it("every other project keeps its public source link", () => {
  for (const p of projects.filter((x) => x.id !== "poker")) expect(publicRepoUrl(p), p.id).toMatch(/^https:\/\/github\.com\/taysh123\/[\w.-]+$/);
});

it("the internal-repos module is gone and nothing imports it", () => {
  expect(fs.existsSync("data/internal-repos.ts")).toBe(false);
  expect(execSync("git grep -l internal-repos -- app components data lib || true").toString().trim()).toBe("");
});

it("no tracked text file carries the private repository's name", () => {
  const tracked = execSync("git ls-files -z").toString().split("\0").filter(Boolean)
    .filter((f) => !/\.(png|jpe?g|webp|avif|gif|ico|woff2?|ttf|otf|exr|blend|zip|pdf|mp4|webm)$/i.test(f) && fs.existsSync(f));
  const leaks = tracked.flatMap((f) => privateRepoLeaks(fs.readFileSync(f, "utf8")).map((h) => `${f}: ${h}`));
  expect(leaks).toEqual([]);
});
