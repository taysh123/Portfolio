import { availability } from "@/data/socials";
import { cn } from "@/lib/cn";

/**
 * The locked hero's availability pill (Concept A), shown only while the site says it is open (data/socials.ts). The
 * site header carries it where it has room; below that, the hero shows it under the header (R2). CSS displays exactly
 * one of the two at any width (components/sections/hero.css), so it is read once.
 */
export function AvailabilityPill({ className, reveal }: { className?: string; reveal?: boolean }) {
  if (!availability.open) return null;
  return (
    <p className={cn("hxa__pill", className)} {...(reveal ? { "data-reveal": "" } : {})}>
      <span className="hxa__dot" aria-hidden="true" />Available for opportunities
    </p>
  );
}
