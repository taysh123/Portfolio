import { projects } from "@/data/projects";
import { skillGroups } from "@/data/skills";
import { flagships, moreWork } from "@/data/work";
import { projectsFor } from "@/data/stackLens";
import { dict } from "@/lib/dict";
import { fmt } from "@/lib/fmt";

/**
 * The Stack section under About (Concept A, P3.4; D1 reopened by Tay, 2026-11-18; D2 not reopened, so no WebGL). It
 * works like the Product Plates Stack (product-plates-final:components/sections/Stack.tsx), in the cinematic layer, and nothing is
 * typed fresh:
 * - the groups, their tools and each group's evidence sentence are the live Stack's (data/skills.ts), word for word;
 * - which flagship uses each tool is the live mapping (projectsFor in data/stackLens.ts), kept to the four this page
 *   shows. Each tool carries it the live way: `data-p` for the filter, and the names in its accessible text;
 * - a tool no flagship uses names the Two more project whose text names it (pytest, Java, JavaFX), in its accessible
 *   text only: the filter keeps to the four (Tay, 2026-11-24, copy pass B);
 * - the filter is written from the options exactly as the live Stack writes its FILTER: a chosen project shows only
 *   its tools, and no group left empty.
 * tests/unit/lab-work.test.ts holds every string to its source.
 *
 * Tay's choices (session 13): a Security group (one JWT row, moved from Services and APIs, so it appears once; Body
 * HMAC; CSRF token), with one evidence sentence built only from its source lines; tools no flagship uses show under All
 * only; Everyday tools stays, naming no project. No logos, no levels, no years.
 */

const FLAGSHIPS: readonly string[] = flagships.map((f) => f.id);
const MORE: readonly string[] = moreWork.map((m) => m.id);
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

/** A tool whose project is stated here, because that project's text doesn't name it: T Poker's landing page imports
 *  Framer Motion, and its data presents the app (Tay, 2026-11-24, copy pass B). */
export const STATED_ROWS = [{ label: "Framer Motion", projects: ["poker"] }] as const;

export type StackTool = { label: string; projects: readonly string[]; names: string | null };
export type StackGroup = { id: string; title: string; tools: StackTool[]; evidence: string };

/** `names` is the live Stack's accessible text and hover title for a tool: its projects, comma-separated. `projects`
 *  is what the filter reads; `named` differs from it only for a tool no flagship uses. */
const tool = (label: string, ids: readonly string[], named: readonly string[] = ids): StackTool =>
  ({ label, projects: ids, names: named.length ? named.map((id) => project(id).name).join(", ") : null });
const flagshipsFor = (label: string): readonly string[] =>
  STATED_ROWS.find((r) => r.label === label)?.projects ?? projectsFor(label).filter((id) => FLAGSHIPS.includes(id));
/** A group's row: its flagships; or, with none, the Two more projects whose text names the tool. */
const row = (label: string): StackTool => {
  const ids = flagshipsFor(label);
  return tool(label, ids, ids.length ? ids : projectsFor(label).filter((id) => MORE.includes(id)));
};

const groups: StackGroup[] = skillGroups.flatMap((g) => {
  const group: StackGroup = {
    id: g.id,
    title: g.title,
    tools: g.items.filter((i) => i.label !== MOVED).map((i) => (g.related === false ? tool(i.label, []) : row(i.label))),
    evidence: g.evidence,
  };
  if (g.id !== "service") return [group];
  const security: StackGroup = {
    id: "security",
    title: "Security",
    tools: [tool(MOVED, flagshipsFor(MOVED)), ...SECURITY_ROWS.map((s) => tool(s.label, s.projects))],
    evidence: SECURITY_EVIDENCE,
  };
  return [group, security];
});

/** The filter's options: the four flagships in Work order, each with how many tools it lights and the live status line. */
const options = FLAGSHIPS.map((id) => {
  const count = groups.flatMap((g) => g.tools).filter((t) => t.projects.includes(id)).length;
  return { id, name: project(id).name, count, status: fmt(dict.stack.showing, { n: count, name: project(id).name }) };
});

/** The filter, written from the options as the live FILTER is (components/sections/Stack.tsx): choosing a project
 *  takes out every tool whose `data-p` doesn't name it, and every group left with none. */
const LENS_CSS = options.map(({ id }) =>
  `.wk__stack-groups[data-lens="${id}"] [data-tool]:not([data-p~="${id}"]){display:none}` +
  `.wk__stack-groups[data-lens="${id}"] .wk__stack-group:not(:has([data-p~="${id}"])){display:none}`).join("");

export const stackBlock = {
  eyebrow: dict.nav.stack,
  /** The live Stack's own title. No lede. */
  title: dict.stack.title,
  filter: { label: dict.stack.filter, all: dict.stack.all, options, css: LENS_CSS },
  groups,
} as const;
