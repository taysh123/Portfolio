"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/Button";
import { socials } from "@/data/socials";
import { useLocale } from "@/components/providers/LocaleProvider";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Rendered inside the root layout, so it speaks the page's language (LocaleProvider).
  const { t } = useLocale();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[100svh] items-center justify-center px-[var(--gutter)]">
      <div className="w-full max-w-lg text-center">
        <h1
          className="font-semibold leading-[1.02] tracking-[var(--tracking-display)] text-fg"
          style={{ fontSize: "var(--text-h2)" }}
        >
          {t.error.title}
        </h1>
        <p className="mt-4 leading-relaxed text-fg-muted">{t.error.body}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button size="lg" onClick={reset}>
            {t.error.retry}
          </Button>
          <ButtonLink
            href={`mailto:${socials.email}?subject=${encodeURIComponent(t.error.subject)}`}
            variant="secondary"
            size="lg"
          >
            {t.error.report}
          </ButtonLink>
        </div>
        {error.digest && (
          <p className="mt-6 text-sm text-fg-subtle">{t.error.reference} <bdi>{error.digest}</bdi></p>
        )}
      </div>
    </main>
  );
}
