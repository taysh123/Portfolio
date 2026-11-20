import { cn } from "@/lib/cn";
import { siteMeta } from "@/data/socials";

/**
 * The wordmark: the locked hero's (Concept A) glyph and name, carried by the site header (R2). Its styles are the
 * hero's (components/sections/hero.css, `.hxa__mark`), read from the cinematic layer's tokens. The visible words are
 * the hero's; the link's name says where it goes.
 */
export function Logo({ className, href = "#hero", label }: { className?: string; href?: string; label?: string }) {
  return (
    <a href={href} aria-label={label ?? `${siteMeta.name} — home`} className={cn("hxa__mark", className)}>
      <svg className="hxa__glyph" viewBox="0 0 32 32" width="34" height="34" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="hxa-mark-ink" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#2ee6d6" />
            <stop offset="1" stopColor="#9b6bff" />
          </linearGradient>
        </defs>
        <rect x="0.5" y="0.5" width="31" height="31" rx="9" fill="none" stroke="url(#hxa-mark-ink)" strokeOpacity="0.55" />
        <path d="M11.5 11 6.5 16l5 5M20.5 11l5 5-5 5M17.6 9.5l-3.2 13" fill="none" stroke="url(#hxa-mark-ink)"
          strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {/* Real spaces around the slash: without them the words run together. */}
      <span className="hxa__word"><b>{siteMeta.name}</b> <i aria-hidden="true">/</i> Portfolio</span>
    </a>
  );
}
