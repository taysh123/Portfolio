import { projects, publicRepoUrl, type Project } from "@/data/projects";
import { flagships, projectOf } from "@/data/work";

/**
 * Figures derived from the project data rather than typed a second time.
 *
 * The passing-test total sums each project's own test metric. Each per-project figure was counted from that
 * repository's CI at main (see data/skills.ts). Orders & Delivery has no test metric and is not counted.
 */
const TEST_METRIC: Record<string, string> = {
  poker: "Passing tests, both stacks",
  aegis: "Passing tests, incl. Testcontainers",
  developeros: "Tests · 0.82:1 to source",
  "gravity-flow": "Tests over 28 files",
  "job-assistant": "Tests",
};

const counted = Object.entries(TEST_METRIC).map(([id, label]) => {
  const m = projects.find((p) => p.id === id)?.metrics.find((x) => x.label === label);
  if (!m) throw new Error(`missing test metric ${id} / ${label}`);
  return Number(m.value.replace(/,/g, ""));
});

export const passingTests = {
  value: counted.reduce((a, b) => a + b, 0).toLocaleString("en-US"),
  projects: counted.length,
  /** "five", for running copy. */
  projectsWord: ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"][counted.length] ?? String(counted.length),
};

/** One honest state per flagship for the hero's index, read from the project's own status, stores and repo. */
export function indexState(p: Project): string {
  const live = new Set(p.stores?.filter((s) => s.status === "live" && s.url).map((s) => s.platform));
  if (p.status === "live" && live.has("ios") && live.has("android")) return "Live on iOS & Android";
  if (p.status === "local" && publicRepoUrl(p)) return "Open source";
  return { live: "Live", released: "Released", rc: "Release candidate", coursework: "Coursework", local: "Runs locally" }[p.status];
}

export const heroIndex = flagships.map((f) => {
  const p = projectOf(f.id);
  return { id: p.id, name: p.name, state: indexState(p), href: `#work-${p.id}` };
});
