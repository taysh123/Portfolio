import { projects, type Project } from "@/data/projects";
import { skillGroups } from "@/data/skills";

/**
 * The Stack's project lens (M8): which projects use each tool, derived from each project's own published text
 * (stack, metric labels, tagline, summary and description) — never hand-assigned. A tool matches a project when
 * one of its terms appears there as a whole token ("Java" is not found in "JavaScript"). Tools no listed project
 * names (C, Tailwind CSS, Playwright, …) light for none: they come from coursework and this site, and the lens
 * says so by leaving them unlit. tests/unit/stackLens.test.ts holds the rules.
 */
const TERMS: Record<string, string[]> = {
  C: [],                                         // a lone "C" would match "C#" and "C++"; no listed project uses C
  SQL: ["PostgreSQL", "SQLite"],                 // the SQL databases the projects run on
  React: ["React", "Next.js"],                   // Next.js is React
  "React Native / Expo": ["React Native", "Expo"],
  "CQRS / MediatR": ["CQRS", "MediatR"],
  "RabbitMQ / MassTransit": ["RabbitMQ", "MassTransit"],
  "JWT / RS256": ["JWT", "RS256"],
  "SQLite / FTS5": ["SQLite", "FTS5"],
  "Phaser 3": ["Phaser"],
  "Tailwind CSS": ["Tailwind"],
};

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\#]/g, "\\$&");
export const namesToken = (text: string, term: string) => new RegExp(`(^|[^A-Za-z])${escape(term)}([^A-Za-z]|$)`, "i").test(text);
const corpus = (p: Project) => [...p.stack.map((s) => s.label), ...p.metrics.map((m) => m.label), p.tagline, p.summary, p.description].join(" \n ");

export const termsFor = (label: string) => TERMS[label] ?? [label];
export function projectsFor(label: string): string[] {
  const terms = termsFor(label);
  return projects.filter((p) => terms.some((t) => namesToken(corpus(p), t))).map((p) => p.id);
}

/** The lens options, in the Work order; each with how many of the Stack's tools it lights. */
export const lensProjects = projects
  .filter((p) => ["poker", "aegis", "developeros", "gravity-flow", "job-assistant", "orders-delivery"].includes(p.id))
  .sort((a, b) => ["poker", "aegis", "developeros", "gravity-flow", "job-assistant", "orders-delivery"].indexOf(a.id) - ["poker", "aegis", "developeros", "gravity-flow", "job-assistant", "orders-delivery"].indexOf(b.id))
  .map((p) => ({ id: p.id, name: p.name, count: skillGroups.flatMap((g) => g.items).filter((i) => projectsFor(i.label).includes(p.id)).length }));
