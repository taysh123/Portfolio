"use client";

import { CaseStudyPanel } from "@/components/ui/CaseStudyPanel";
import { getProject } from "@/lib/projects";
import { useLocale } from "@/components/providers/LocaleProvider";

/** The case-study panel looked up by id. Loaded on demand, so the project data (every case-study body)
 *  travels with the panel's chunk, not with first-load JS (fresh review I2). */
export function CaseStudyById({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { locale } = useLocale();
  return <CaseStudyPanel project={id ? getProject(locale, id) ?? null : null} onClose={onClose} />;
}
