import type { Metadata } from "next";
// The cinematic design language (tokens, surfaces, focus, the one reveal): imported here and nowhere else, so only
// /lab routes load it, and it applies only inside a `.cine` root. docs/CINEMATIC_SYSTEM.md.
import "./_cinematic/cinematic.css";

/**
 * /lab: measured prototypes only (Concept A, D2 reopened by Tay on 2026-11-18). Never indexed, never in the sitemap,
 * never linked from the live page, and the branch that carries it is never merged.
 *
 * Excluded by `noindex, nofollow` on every page under /lab, not by a robots.txt Disallow: a crawler blocked by
 * robots.txt never fetches the page, so it never sees the noindex. The root's canonical ("/") is dropped too, so a
 * prototype never claims to be the home page.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  alternates: { canonical: null },
};

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return children;
}
