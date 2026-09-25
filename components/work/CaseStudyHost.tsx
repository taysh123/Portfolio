"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { projects, type Project } from "@/data/projects";

// Not in first-load JS: the panel's chunk is requested on the first "Case study" activation (budget.spec.ts).
// While the chunk loads (first open, slow network) the click still gets immediate, announced feedback.
const CaseStudyPanel = dynamic(() => import("@/components/ui/CaseStudyPanel").then((m) => m.CaseStudyPanel), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-[color-mix(in_oklab,var(--bg)_70%,transparent)]" data-case-study-loading>
      <p role="status" className="label text-fg-muted">Loading case study…</p>
    </div>
  ),
});

/** One delegated listener for every server-rendered [data-case-study] button on the page. */
export function CaseStudyHost() {
  const [project, setProject] = useState<Project | null>(null);
  // Mounted from the first open on, so the panel's own AnimatePresence plays its exit when project = null.
  const [mounted, setMounted] = useState(false);
  const opener = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const b = (e.target as Element | null)?.closest?.<HTMLElement>("[data-case-study]"); if (!b) return;
      opener.current = b; setMounted(true); setProject(projects.find((p) => p.id === b.dataset.caseStudy) ?? null);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  const close = useCallback(() => { setProject(null); requestAnimationFrame(() => opener.current?.focus()); }, []);
  return mounted || project ? <CaseStudyPanel project={project} onClose={close} /> : null;
}
