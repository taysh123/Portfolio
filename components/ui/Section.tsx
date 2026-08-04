import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { SectionHeader } from "@/components/ui/SectionHeader";

/**
 * Page section wrapper.
 *
 * Vertical rhythm comes from the `--section-y` token rather than a stack of
 * responsive padding utilities. The previous scale spent roughly 290px of
 * padding plus an 80px header margin between every section, which is most of
 * why the page ran to 7.6 viewport-heights while still reading as empty.
 */
export function Section({
  id,
  eyebrow,
  title,
  intro,
  aside,
  className,
  children,
}: {
  id: string;
  eyebrow?: string;
  title?: ReactNode;
  intro?: ReactNode;
  /** Optional trailing element on the header row — a link, a count, a control. */
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={title ? `${id}-title` : undefined}
      aria-label={title ? undefined : id}
      className={cn(
        "relative scroll-mt-24 px-[var(--gutter)]",
        "py-[var(--section-y)]",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-6xl 3xl:max-w-7xl">
        {(eyebrow || title || intro) && (
          <SectionHeader
            id={id}
            eyebrow={eyebrow}
            title={title}
            intro={intro}
            aside={aside}
          />
        )}
        {children}
      </div>
    </section>
  );
}
