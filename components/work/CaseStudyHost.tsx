"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";

// Not in first-load JS: the panel — and the project data it looks up by id — is requested on the first
// "Case study" activation (budget.spec.ts).
// While the chunk loads (first open, slow network) the click still gets immediate, announced feedback.
const CaseStudyById = dynamic(() => import("./CaseStudyById").then((m) => m.CaseStudyById), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-[color-mix(in_oklab,var(--bg)_70%,transparent)]" data-case-study-loading>
      <p role="status" className="label text-fg-muted">Loading case study…</p>
    </div>
  ),
});

/** One delegated listener for every server-rendered [data-case-study] button on the page. */
export function CaseStudyHost() {
  const [id, setId] = useState<string | null>(null);
  // Mounted from the first open on, so the panel's own AnimatePresence plays its exit when id = null.
  const [mounted, setMounted] = useState(false);
  const opener = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const b = (e.target as Element | null)?.closest?.<HTMLElement>("[data-case-study]"); if (!b) return;
      opener.current = b; setMounted(true); setId(b.dataset.caseStudy ?? null);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  // The trap already restores focus; this covers browsers that don't focus a clicked button (Safari). It must
  // not move the page either (review M3).
  const close = useCallback(() => { setId(null); requestAnimationFrame(() => opener.current?.focus({ preventScroll: true })); }, []);
  return mounted || id ? <CaseStudyById id={id} onClose={close} /> : null;
}
