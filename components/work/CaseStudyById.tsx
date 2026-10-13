"use client";

import { CaseStudyPanel } from "@/components/ui/CaseStudyPanel";
import { projects } from "@/data/projects";

/** The case-study panel looked up by id. Loaded on demand, so the project data (every case-study body)
 *  travels with the panel's chunk, not with first-load JS (fresh review I2). */
export function CaseStudyById({ id, onClose }: { id: string | null; onClose: () => void }) {
  return <CaseStudyPanel project={id ? projects.find((p) => p.id === id) ?? null : null} onClose={onClose} />;
}
