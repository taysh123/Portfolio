import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

/**
 * A 404 previously rendered Next's unbranded default page with no metadata.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-[100svh] items-center justify-center px-[var(--gutter)]">
      <div className="w-full max-w-lg text-center">
        <Eyebrow className="justify-center">404</Eyebrow>
        <h1
          className="mt-5 font-semibold leading-[1.05] tracking-[var(--tracking-heading)] text-fg"
          style={{ fontSize: "var(--text-h1)" }}
        >
          That page doesn&apos;t exist.
        </h1>
        <p className="mt-4 leading-relaxed text-fg-muted">
          The link may be out of date. Everything lives on one page — head back and
          scroll.
        </p>
        <div className="mt-8 flex justify-center">
          <ButtonLink href="/" size="lg" arrow>
            Back to the start
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
