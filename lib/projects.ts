import { projects, type Project, type ProjectCopy } from "@/data/projects";
import { projectsHe } from "@/data/he/projects";
import type { Locale } from "@/lib/i18n";
import { fixBidiDeep } from "@/lib/bidi";

/**
 * The projects in a language: the English record with its reader-facing text swapped for that language's
 * (data/he/projects.ts). Ids, links, statuses, figures and store listings are never translated, so the two languages
 * cannot disagree on a fact. Imported by server components and by the case-study panel's on-demand chunk only.
 */
export function localizeProject(p: Project, copy: ProjectCopy | undefined): Project {
  if (!copy) return p;
  return {
    ...p,
    tagline: copy.tagline,
    summary: copy.summary,
    description: copy.description,
    context: copy.context,
    liveLabel: copy.liveLabel ?? p.liveLabel,
    metrics: p.metrics.map((m, i) => ({ ...m, label: copy.metrics[i] ?? m.label })),
    stack: p.stack.map((s, i) => ({ ...s, label: copy.stack[i] ?? s.label })),
    media: p.media && {
      ...p.media,
      alt: copy.media?.alt ?? p.media.alt,
      gallery: p.media.gallery?.map((g, i) => ({ ...g, alt: copy.media?.gallery?.[i] ?? g.alt })),
    },
    caseStudy: copy.caseStudy,
  };
}

const HE = projects.map((p) => localizeProject(p, fixBidiDeep(projectsHe[p.id as keyof typeof projectsHe])));

export const getProjects = (l: Locale): Project[] => (l === "he" ? HE : projects);
export const getProject = (l: Locale, id: string): Project | undefined => getProjects(l).find((p) => p.id === id);
