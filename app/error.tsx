"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { socials } from "@/data/socials";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[100svh] items-center justify-center px-[var(--gutter)]">
      <div className="w-full max-w-lg text-center">
        <Eyebrow className="justify-center">Something broke</Eyebrow>
        <h1
          className="mt-5 font-semibold leading-[1.05] tracking-[var(--tracking-heading)] text-fg"
          style={{ fontSize: "var(--text-h1)" }}
        >
          That&apos;s on me.
        </h1>
        <p className="mt-4 leading-relaxed text-fg-muted">
          An unexpected error stopped the page rendering. Reloading usually fixes it —
          if it doesn&apos;t, I&apos;d genuinely like to know.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button size="lg" onClick={reset}>
            Try again
          </Button>
          <ButtonLink
            href={`mailto:${socials.email}?subject=${encodeURIComponent("Broken page on tayshofer.dev")}`}
            variant="secondary"
            size="lg"
          >
            Tell me about it
          </ButtonLink>
        </div>
        {error.digest && (
          <p className="label mt-6 text-fg-subtle">Reference: {error.digest}</p>
        )}
      </div>
    </main>
  );
}
