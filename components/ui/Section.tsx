import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * A landmark wrapper, and nothing more.
 *
 * Width, gutter and rhythm now belong to `Stage`, and framing belongs to
 * `Panel` — so a section is free to be one dominant panel, an asymmetric pair,
 * or a run of full-bleed rows. The previous version owned max-width and
 * vertical padding itself, which is precisely what forced every section into
 * the same centred, equally-weighted shape.
 */
export function Section({
  id,
  labelledBy,
  label,
  className,
  children,
}: {
  id: string;
  /** Id of the heading that names this section. */
  labelledBy?: string;
  /** Used when the section has no visible heading. */
  label?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : label}
      className={cn("relative scroll-mt-28", className)}
    >
      {children}
    </section>
  );
}
