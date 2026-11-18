// T Poker's repository is private (user decision, 2026-09-26): no public link, and no address anywhere in this
// public repository. Leak checks use a digest of the slug (tests/support/private-repo.ts), never the name.
import { it, expect } from "vitest";
import fs from "node:fs";
import { execSync } from "node:child_process";
import { projects, publicRepoUrl, repoLabel, PRIVATE_REPO_LABEL } from "@/data/projects";
import { privateRepoLeaks } from "../support/private-repo";

it("T Poker's repository is private: no URL in its data, and the public label", () => {
  const poker = projects.find((p) => p.id === "poker")!;
  expect(poker.repo).toEqual({ visibility: "private" });
  expect(publicRepoUrl(poker)).toBeUndefined();
  expect(PRIVATE_REPO_LABEL).toBe("Private repository");
});

// GRAVITY FLOW's repository went private (owner decision, 2026-11-18: it stays private). Its public link had started
// sending visitors to a 404, so it is represented exactly like T Poker: no URL, and the "Private repository" label.
it("GRAVITY FLOW's repository is private: no URL in its data, and the public label", () => {
  const gf = projects.find((p) => p.id === "gravity-flow")!;
  expect(gf.repo).toEqual({ visibility: "private" });
  expect(publicRepoUrl(gf)).toBeUndefined();
  expect(repoLabel(gf)).toBe(PRIVATE_REPO_LABEL);
});

it("every project with a reachable repository keeps its public source link; an unreachable one is never linked", () => {
  // M9: Orders & Delivery's repository no longer answers anonymous git (private or removed); it shows a plain label.
  const orders = projects.find((p) => p.id === "orders-delivery")!;
  expect(orders.repo).toEqual({ visibility: "unavailable" });
  expect(publicRepoUrl(orders)).toBeUndefined();
  expect(repoLabel(orders)).toBe("Source not publicly accessible");
  for (const p of projects.filter((x) => !["poker", "gravity-flow", "orders-delivery"].includes(x.id))) expect(publicRepoUrl(p), p.id).toMatch(/^https:\/\/github\.com\/taysh123\/[\w.-]+$/);
  expect(JSON.stringify(projects)).not.toMatch(/orders-delivery-management-system/);
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
