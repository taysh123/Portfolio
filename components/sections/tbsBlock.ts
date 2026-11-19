import { pillars } from "@/data/approach";
import { projects } from "@/data/projects";
import { dict } from "@/lib/dict";

/**
 * Think · Build · Ship under Stack (Concept A, P3.5; D1 reopened by Tay, 2026-11-18; D2 not reopened, so no WebGL).
 * Nothing is retyped from the Product Plates section (product-plates-final:components/sections/ThinkBuildShip.tsx): its title comes from lib/dict.ts,
 * and each row's word, line, summary and example from data/approach.ts, word for word. One line is new, so all four
 * flagships appear: DeveloperOS's, under Build, in Tay's wording (session 14), joined from two places in its own data.
 * tests/unit/lab-work.test.ts holds every string to its source.
 */

/** DeveloperOS's evidence: its description's "declines ... when the index doesn't support an answer", then the end of
 *  its decision "Refusal as a first-class code path" ("before the provider is ever reached"). */
export const DOS_EVIDENCE = "DeveloperOS: it declines when the index doesn't support an answer—before the provider is ever reached.";
const dos = projects.find((p) => p.id === "developeros")!;

/** One piece of evidence, split so the page can set the project's name apart. Each one opens with that name. */
const evidence = (name: string, text: string) => {
  if (!text.startsWith(name)) throw new Error(`Think · Build · Ship: "${text}" must open with "${name}"`);
  return { name, rest: text.slice(name.length), text };
};

export const tbsBlock = {
  /** The live title. The live section has no eyebrow, and the nav has no label for it, so there is none here. */
  title: dict.tbs.title,
  rows: pillars.map((p) => ({
    word: p.word,
    line: p.line,
    summary: p.summary,
    evidence: [evidence(p.project, p.example), ...(p.word === "Build" ? [evidence(dos.name, DOS_EVIDENCE)] : [])],
  })),
} as const;
