import { projects } from "@/data/projects";
import { skillGroups } from "@/data/skills";
import { flagships } from "@/data/work";
import { projectsFor } from "@/data/stackLens";
import { dict } from "@/lib/dict";
import { fmt } from "@/lib/fmt";

/**
 * The Stack section under About (PROTOTYPE, P3.4; D1 reopened by Tay, 2026-11-18; D2 not reopened, so no WebGL). It
 * works like the live Stack (components/sections/Stack.tsx), restyled in the lab's layer, and nothing is typed fresh:
 * - the groups, their tools and each group's evidence sentence are the live Stack's (data/skills.ts), word for word;
 * - which flagship uses each tool is the live mapping (projectsFor in data/stackLens.ts), kept to the four this page
 *   shows. Each tool carries it the live way: `data-p` for the filter, and the names in its accessible text;
 * - the filter's highlight is written from the options, as the live Stack writes its FILTER.
 * tests/unit/lab-work.test.ts holds every string to its source.
 *
 * Tay's choices (session 13): a Security group (one JWT row, moved from Services and APIs, so it appears once; Body
 * HMAC; CSRF token), with one evidence sentence built only from its source lines; tools no flagship uses are listed and
 * dim under every project; Everyday tools stays, naming no project. No logos, no levels, no years.
 */

const FLAGSHIPS: readonly string[] = flagships.map((f) => f.id);
const project = (id: string) => projects.find((p) => p.id === id)!;

/** The tool that moves into Security, out of Services and APIs. */
const MOVED = "JWT";

/** Security's own rows, each in its project's words (the unit test checks each against that text):
 *  Aegis's decision "Agent ingestion authenticated by body HMAC", and DeveloperOS's "A per-instance CSRF token compared
 *  with hmac.compare_digest". The live mapping names neither, so their project is stated here. */
export const SECURITY_ROWS = [
  { label: "Body HMAC", projects: ["aegis"] },
  { label: "CSRF token", projects: ["developeros"] },
] as const;

/** Security's one sentence, built only from those source lines and Aegis's stack entry "JWT (RS256)" (Tay, session 13). */
export const SECURITY_EVIDENCE =
  "Aegis authenticates agent ingestion by body HMAC and uses JWT (RS256); DeveloperOS compares a per-instance CSRF token with hmac.compare_digest.";

export type StackTool = { label: string; projects: readonly string[]; names: string | null };
export type StackGroup = { id: string; title: string; tools: StackTool[]; evidence: string };

/** `names` is the live Stack's accessible text and hover title for a tool: its projects, comma-separated. */
const tool = (label: string, ids: readonly string[]): StackTool =>
  ({ label, projects: ids, names: ids.length ? ids.map((id) => project(id).name).join(", ") : null });
const flagshipsFor = (label: string) => projectsFor(label).filter((id) => FLAGSHIPS.includes(id));

const groups: StackGroup[] = skillGroups.flatMap((g) => {
  const row: StackGroup = {
    id: g.id,
    title: g.title,
    tools: g.items.filter((i) => i.label !== MOVED).map((i) => tool(i.label, g.related === false ? [] : flagshipsFor(i.label))),
    evidence: g.evidence,
  };
  if (g.id !== "service") return [row];
  const security: StackGroup = {
    id: "security",
    title: "Security",
    tools: [tool(MOVED, flagshipsFor(MOVED)), ...SECURITY_ROWS.map((s) => tool(s.label, s.projects))],
    evidence: SECURITY_EVIDENCE,
  };
  return [row, security];
});

/** The filter's options: the four flagships in Work order, each with how many tools it lights and the live status line. */
const options = FLAGSHIPS.map((id) => {
  const count = groups.flatMap((g) => g.tools).filter((t) => t.projects.includes(id)).length;
  return { id, name: project(id).name, count, status: fmt(dict.stack.showing, { n: count, name: project(id).name }) };
});

/** The highlight, written from the options like the live FILTER: choosing a project lights the tools whose `data-p`
 *  names it, dims every other tool, and dims the name of a group it lights nothing in. Colour only: nothing moves. */
const LENS_CSS = options.map(({ id }) =>
  `.wk__stack-groups[data-lens="${id}"] [data-tool][data-p~="${id}"]{color:var(--cine-cyan)}` +
  `.wk__stack-groups[data-lens="${id}"] [data-tool]:not([data-p~="${id}"]){color:var(--cine-faint)}` +
  `.wk__stack-groups[data-lens="${id}"] .wk__stack-group:not(:has([data-p~="${id}"])) .wk__stack-name{color:var(--cine-faint)}`).join("");

export const stackBlock = {
  eyebrow: dict.nav.stack,
  /** The live Stack's own title. No lede. */
  title: dict.stack.title,
  filter: { label: dict.stack.filter, all: dict.stack.all, options, css: LENS_CSS },
  groups,
} as const;
