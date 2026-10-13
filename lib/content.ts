import { siteMeta, availability } from "@/data/socials";
import { about } from "@/data/about";
import { flagships, pokerSteps, aegisCopy, aegisTrace, dosFlow, dosRefusalCaption, gfFacts, projectOf } from "@/data/work";
import { pillars } from "@/data/approach";
import { skillGroups } from "@/data/skills";
import { heroIndex, indexStateKey } from "@/data/proof";
import { projects } from "@/data/projects";
import { dict } from "@/lib/dict";

/**
 * Everything the page says, gathered from data/ and the interface strings (lib/dict.ts) for the server components.
 * Client components read lib/dict-client.ts directly, and the case-study chunk reads data/projects.ts.
 */
export function getContent() {
  return {
    t: dict,
    siteMeta,
    availability,
    about,
    flagships,
    pokerSteps,
    aegisCopy,
    aegisTrace,
    dosFlow,
    dosRefusalCaption,
    gfFacts,
    pillars,
    skillGroups,
    heroIndex: heroIndex.map((x) => ({ ...x, state: dict.status[indexStateKey(projectOf(x.id))] })),
    projects,
    project: (id: string) => projects.find((p) => p.id === id)!,
  };
}

export type Content = ReturnType<typeof getContent>;
