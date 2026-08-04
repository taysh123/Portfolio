import { cn } from "@/lib/cn";
import { siteMeta } from "@/data/socials";

/**
 * Wordmark. Previously duplicated verbatim between Navbar and Footer.
 *
 * The monogram is a drawn mark rather than a gradient chip: two strokes that
 * read as "TS" and as a bracket, which suits a systems engineer better than a
 * violet square. Uses `currentColor` so it themes for free.
 */
export function Logo({
  className,
  href = "#top",
  label,
}: {
  className?: string;
  href?: string;
  label?: string;
}) {
  return (
    <a
      href={href}
      aria-label={label ?? `${siteMeta.name} — home`}
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-md text-fg",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="relative inline-flex h-8 w-8 items-center justify-center rounded-[0.6rem] border border-line bg-surface-2 transition-colors duration-[var(--dur-mid)] group-hover:border-line-strong"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
          <path
            d="M4 5.5h9M8.5 5.5V18"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <path
            d="M20 8.2c-.9-1.5-2.4-2.2-4-2.2-1.9 0-3.2 1-3.2 2.5 0 3.4 7.2 1.8 7.2 5.6 0 1.9-1.7 3.1-4 3.1-1.9 0-3.5-.8-4.4-2.3"
            stroke="var(--accent)"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
        <span className="halo" />
      </span>
      <span className="label text-fg/90 transition-colors group-hover:text-fg">
        Tay&nbsp;Shofer
      </span>
    </a>
  );
}
