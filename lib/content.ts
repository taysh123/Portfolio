import { siteMeta, availability } from "@/data/socials";
import { about } from "@/data/about";
import { flagships, pokerSteps, aegisCopy, aegisTrace, dosFlow, dosRefusalCaption, gfFacts, type Flagship } from "@/data/work";
import { pillars } from "@/data/approach";
import { skillGroups, type SkillGroup } from "@/data/skills";
import { heroIndex, indexStateKey } from "@/data/proof";
import {
  siteMetaHe, availabilityHe, aboutHe, flagshipsHe, pokerStepsHe, aegisCopyHe, aegisTraceHe, dosFlowHe,
  dosRefusalCaptionHe, gfFactsHe, pillarsHe, skillGroupsHe, skillNotesHe,
} from "@/data/he/site";
import { getProjects } from "@/lib/projects";
import { projectOf } from "@/data/work";
import { getDict } from "@/lib/dict";
import type { Locale } from "@/lib/i18n";
import { fixBidiDeep } from "@/lib/bidi";

/** The Hebrew overlays, with Latin names that end in neutral characters kept whole (lib/bidi.ts). */
const HE = fixBidiDeep({
  siteMetaHe, availabilityHe, aboutHe, flagshipsHe, pokerStepsHe, aegisCopyHe, aegisTraceHe, dosFlowHe,
  dosRefusalCaptionHe, gfFactsHe, pillarsHe, skillGroupsHe, skillNotesHe,
});

type Step = { k: string; name: string; body: string };

/**
 * Everything the page says, in one language. English comes straight from data/; Hebrew swaps in data/he/ over the
 * same records, so structure, order, ids and figures are shared. Server-only by use: client components get strings
 * from LocaleProvider, and the case-study chunk reads lib/projects.ts.
 */
export function getContent(locale: Locale) {
  const he = locale === "he";
  const t = getDict(locale);
  const meta = he ? { ...siteMeta, ...HE.siteMetaHe } : siteMeta;
  const projects = getProjects(locale);
  return {
    locale,
    t,
    siteMeta: meta,
    availability: he ? HE.availabilityHe : availability,
    about: he ? HE.aboutHe : about,
    flagships: flagships.map((f): Flagship => (he ? { ...f, ...HE.flagshipsHe[f.id] } : f)),
    pokerSteps: (he ? HE.pokerStepsHe : pokerSteps) as readonly { label: string; caption: string }[],
    aegisCopy: he ? HE.aegisCopyHe : aegisCopy,
    aegisTrace: (he ? HE.aegisTraceHe : aegisTrace) as { main: readonly Step[]; fork: readonly Step[]; end: Step },
    dosFlow: (he ? HE.dosFlowHe : dosFlow) as readonly Step[],
    dosRefusalCaption: he ? HE.dosRefusalCaptionHe : dosRefusalCaption,
    gfFacts: (he ? HE.gfFactsHe : gfFacts) as readonly string[],
    pillars: (he ? HE.pillarsHe.map((p, i) => ({ ...pillars[i], ...p })) : pillars) as readonly { word: string; line: string; summary: string; example: string }[],
    skillGroups: skillGroups.map((g): SkillGroup => (he ? {
      ...g, ...HE.skillGroupsHe[g.id],
      items: g.items.map((i) => (i.note ? { ...i, note: HE.skillNotesHe[i.note] ?? i.note } : i)),
    } : g)),
    heroIndex: heroIndex.map((x) => ({ ...x, state: t.status[indexStateKey(projectOf(x.id))] })),
    projects,
    project: (id: string) => projects.find((p) => p.id === id)!,
  };
}

export type Content = ReturnType<typeof getContent>;
