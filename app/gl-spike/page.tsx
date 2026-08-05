"use client";

// `ssr: false` is not allowed in a Server Component in Next 16 — the page has
// to be a client boundary for the dynamic import to opt out of SSR.
import dynamic from "next/dynamic";

/**
 * Throwaway comparison surface for the WebGL workstation spike.
 *
 * Not linked from anywhere and not in the sitemap — it exists so the PBR
 * machine can be screenshotted next to the CSS one and judged on evidence
 * rather than argued about. Delete it (and this route) once the decision is
 * made either way.
 */
const WorkstationGL = dynamic(
  () => import("@/components/effects/WorkstationGL").then((m) => m.WorkstationGL),
  { ssr: false },
);

/*
  Unlinked and unindexed. It is a comparison surface, not a page — if it ever
  turns up in a search result for this portfolio that is a bug.

  `metadata` cannot be exported from a client component, so the noindex goes on
  a meta tag rendered by the page itself.
*/
export default function GlSpike() {
  return (
    <main
      className="flex min-h-dvh items-center justify-center"
      style={{ background: "#07070f" }}
    >
      <meta name="robots" content="noindex, nofollow" />
      <WorkstationGL className="h-[80vh] w-[92vw] max-w-[68rem]" />
    </main>
  );
}
