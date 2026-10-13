import { cn } from "@/lib/cn";
import { siteMeta } from "@/data/socials";

/** The wordmark: the name, set in the site's own type. M10 retired the drawn monogram — the name is the identity. */
export function Logo({ className, href = "#hero", label }: { className?: string; href?: string; label?: string }) {
  return (
    <a href={href} aria-label={label ?? `${siteMeta.name} — home`}
      className={cn("inline-flex min-h-11 items-center text-[1rem] font-semibold tracking-[-0.01em] text-fg", className)}>
      {siteMeta.name}
    </a>
  );
}
