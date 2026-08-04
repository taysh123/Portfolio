import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { PanelReveal } from "@/components/ui/PanelReveal";

export { PanelReveal };

/**
 * The page shell.
 *
 * Everything sits inside one `--stage`-wide column with a narrow outer gutter,
 * and panels are separated by `--gap` — so the lit field shows *through*
 * between them. That gutter is the single detail that makes the page read as
 * one composed instrument surface rather than a document of stacked sections.
 *
 * Deliberately wide (88rem / 1408px). The previous 72rem centred column is
 * what made the design feel compressed: at 1440px+ it left ~150px of dead
 * margin on both sides while the content fought for room in the middle.
 */
export function Stage({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-[var(--stage)] flex-col gap-[var(--gap)] px-[var(--gutter)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * An asymmetric row of panels. The whole point of the composition is that
 * columns are *unequal* — `split` names the ratio rather than leaving callers
 * to invent arbitrary fractions.
 */
export function Row({
  children,
  split = "even",
  className,
}: {
  children: ReactNode;
  split?: "even" | "wide-left" | "wide-right" | "major-left" | "major-right";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-[var(--gap)]",
        split === "even" && "lg:grid-cols-2",
        split === "wide-left" && "lg:grid-cols-[1.35fr_1fr]",
        split === "wide-right" && "lg:grid-cols-[1fr_1.35fr]",
        split === "major-left" && "lg:grid-cols-[1.9fr_1fr]",
        split === "major-right" && "lg:grid-cols-[1fr_1.9fr]",
        className,
      )}
    >
      {children}
    </div>
  );
}
