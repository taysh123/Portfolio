import { cn } from "@/lib/cn";
import type { StoreListing } from "@/data/projects";

/**
 * An app-store badge.
 *
 * TWO DECISIONS WORTH STATING.
 *
 * First, this does NOT reproduce Apple's or Google's official badge artwork,
 * and it does not redraw their wordmarks. Both companies publish those as
 * fixed assets under brand guidelines that forbid recolouring, restyling or
 * approximating them, and a badge redrawn from memory lands in the same
 * category as the redrawn technology logos this site deliberately refuses (see
 * `data/skills.ts`): subtly wrong, and worse than none. What it borrows is the
 * STRUCTURE that makes those badges read instantly — a small overline, a large
 * platform name, a platform glyph, one pill — which is the part that is
 * design rather than trademark.
 *
 * Second, a listing with no URL renders as "coming soon" and is not a link.
 * That is the whole reason `url` is optional: it is not possible to ship a
 * badge here that promises a destination which does not exist.
 */
export function StoreBadge({ listing, app }: { listing: StoreListing; app?: string }) {
  const live = listing.status === "live" && Boolean(listing.url);
  const name = listing.platform === "ios" ? "App Store" : "Google Play";
  const overline = live ? "Download on the" : "Coming soon to";

  const body = (
    <>
      <span
        aria-hidden="true"
        className={cn(
          "shrink-0 transition-colors duration-[var(--dur-mid)]",
          live ? "text-fg group-hover/store:text-accent" : "text-fg-subtle",
        )}
      >
        {listing.platform === "ios" ? <AppleGlyph /> : <PlayGlyph />}
      </span>
      <span className="min-w-0 text-left">
        <span className="label block leading-none text-fg-subtle">{overline}</span>
        <span
          className={cn(
            "mt-1.5 block truncate text-[0.9375rem] font-semibold leading-none tracking-[var(--tracking-heading)]",
            live ? "text-fg" : "text-fg-muted",
          )}
        >
          {name}
        </span>
      </span>
    </>
  );

  const shell = cn(
    "group/store inline-flex min-h-[3.25rem] items-center gap-3 rounded-xl border px-4 py-2.5",
    "transition-[transform,border-color,background-color] duration-[var(--dur-slow)] ease-[var(--ease-out-expo)]",
    live
      ? "border-line bg-surface-2 hover:-translate-y-0.5 hover:border-accent-line hover:bg-surface-1"
      : "cursor-default border-line-subtle bg-surface-1 opacity-70",
  );

  if (!live) {
    return (
      <span className={shell} aria-label={`${app ? `${app} on ` : ""}${name} — coming soon`}>
        {body}
      </span>
    );
  }

  return (
    <a href={listing.url} target="_blank" rel="noopener noreferrer" className={shell}>
      {body}
      {/* Which app: in a screen reader's links list "Download on the App Store" alone is ambiguous. */}
      <span className="sr-only">{app ? ` — ${app}` : ""} (opens in a new tab)</span>
    </a>
  );
}

/* The two platform glyphs are simple geometric marks drawn to be recognisable
   without impersonating either company's badge lockup. */

function AppleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.4 12.7c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.15-2.8.85-3.5.85s-1.8-.83-3-.81c-1.5.02-2.9.9-3.7 2.27-1.6 2.77-.4 6.88 1.1 9.13.75 1.1 1.65 2.34 2.83 2.3 1.14-.05 1.57-.74 2.95-.74s1.77.74 2.97.71c1.23-.02 2-1.12 2.75-2.23.87-1.28 1.23-2.52 1.25-2.58-.03-.01-2.4-.92-2.25-3.57Z" />
      <path d="M14.2 5.9c.62-.76 1.04-1.8.93-2.85-.9.04-1.98.6-2.62 1.35-.57.67-1.07 1.74-.94 2.76 1 .08 2.01-.51 2.63-1.26Z" />
    </svg>
  );
}

function PlayGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4.4 2.6 14.9 12 4.4 21.4c-.25-.2-.4-.55-.4-1V3.6c0-.45.15-.8.4-1Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path d="M14.9 12 4.4 2.6c.3-.25.75-.28 1.2-.02l12.1 6.9L14.9 12Z" fill="currentColor" opacity="0.6" />
      <path d="M14.9 12l2.8 2.52-12.1 6.9c-.45.26-.9.23-1.2-.02L14.9 12Z" fill="currentColor" opacity="0.75" />
      <path d="M17.7 9.48 21 11.36c.7.4.7 1.05 0 1.45l-3.3 1.71L14.9 12l2.8-2.52Z" fill="currentColor" opacity="0.5" />
    </svg>
  );
}
