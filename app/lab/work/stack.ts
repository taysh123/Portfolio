import { projects } from "@/data/projects";
import { skillGroups } from "@/data/skills";
import { flagships } from "@/data/work";
import { namesToken, projectsFor, termsFor } from "@/data/stackLens";
import { dict } from "@/lib/dict";

/**
 * The Stack section under About (PROTOTYPE, P3.4; D1 reopened by Tay, 2026-11-18; D2 not reopened, so no WebGL). Nothing
 * is typed fresh. The groups and the tools are the live Stack's (data/skills.ts), word for word and in its order. Which
 * flagship uses each tool is the live site's own mapping (projectsFor in data/stackLens.ts, read from each project's
 * published text), kept to the four projects this page shows. tests/unit/lab-work.test.ts holds every string to its
 * source.
 *
 * Tay's choices (session 13):
 * - A tool that no flagship uses is still listed in its live group, with no project under it. Its live note is not
 *   shown, and the other two projects are never named here.
 * - A Security group, built only from techniques data/projects.ts already states, in that file's own words, each with
 *   the one flagship whose text says it. JWT moves into it from Services and APIs, so no tool appears twice.
 * - Everyday tools stays, with no projects (the live group names none either).
 *
 * No logos, no levels, no years. Aegis's analysis is a deterministic mock, so nothing here comes from it; the only
 * model tool is Ollama, which DeveloperOS marks optional, and the row says so.
 */

const FLAGSHIPS: readonly string[] = flagships.map((f) => f.id);
const project = (id: string) => projects.find((p) => p.id === id)!;

/** The Security rows. Each label is the project's own wording (the source is beside it); the unit test checks each one
 *  against that text, and that no other flagship's text says it. */
export const SECURITY = [
  { label: "JWT (RS256)", projects: ["aegis"] },   // Aegis's stack entry
  { label: "Body HMAC", projects: ["aegis"] },     // Aegis: "Agent ingestion authenticated by body HMAC"
  { label: "CSRF token", projects: ["developeros"] },   // DeveloperOS: "A per-instance CSRF token compared with hmac.compare_digest"
] as const;

/** The live tool that moves into Security, out of Services and APIs. */
const MOVED = "JWT";

/** True when the project's own stack entry for this tool says it is optional (DeveloperOS: "Ollama (optional)"). */
const optionalIn = (label: string, id: string) =>
  project(id).stack.some((s) => /\(optional\)/.test(s.label) && termsFor(label).some((t) => namesToken(s.label, t)));

/** `names` is what the page draws, one whole name each (a line breaks only between them); `where` is the same line as
 *  one string, the way the live site joins project names. */
export type StackTool = { label: string; projects: readonly string[]; names: string[]; where: string | null };
export type StackGroup = { id: string; title: string; tools: StackTool[] };

const tool = (label: string, ids: readonly string[]): StackTool => {
  const names = ids.map((id) => `${project(id).name}${optionalIn(label, id) ? " (optional)" : ""}`);
  return { label, projects: ids, names, where: names.length ? names.join(" · ") : null };
};

const groups: StackGroup[] = skillGroups.flatMap((g) => {
  const row: StackGroup = {
    id: g.id,
    title: g.title,
    tools: g.items.filter((i) => i.label !== MOVED).map((i) =>
      tool(i.label, g.related === false ? [] : projectsFor(i.label).filter((id) => FLAGSHIPS.includes(id)))),
  };
  return g.id === "service" ? [row, { id: "security", title: "Security", tools: SECURITY.map((s) => tool(s.label, s.projects)) }] : [row];
});

export const stackBlock = {
  eyebrow: dict.nav.stack,
  /** The live Stack's own title. No lede: each tool already says where it is used. */
  title: dict.stack.title,
  groups,
} as const;
