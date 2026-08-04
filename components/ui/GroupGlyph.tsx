import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { GlyphKey } from "@/data/skills";

/**
 * One purpose-drawn glyph per toolkit group.
 *
 * The toolkit deliberately carries no per-technology brand marks (see the note
 * at the top of `data/skills.ts`), so this is the only iconography the section
 * gets — which means it has to carry real meaning rather than decorate. Each
 * glyph draws the *shape of the concern*: a viewport, a fan-out of services, a
 * partitioned store.
 *
 * They are drawn as one family on purpose — same 24-unit canvas, same 1.5
 * stroke, same ~2.75-unit optical margin, round caps and joins, no fills,
 * everything on `currentColor`. Six marks that share a grid read as a system;
 * six marks that merely share a colour read as clip art.
 */

const GLYPHS: Record<GlyphKey, ReactNode> = {
  // Angle brackets around a caret-slash — source, before it is anything else.
  language: (
    <>
      <path d="M9.6 7.8 5.8 12l3.8 4.2" />
      <path d="m14.4 7.8 3.8 4.2-3.8 4.2" />
      <path d="M13.2 6 10.8 18" />
    </>
  ),

  // A viewport with a frame nested inside it: composition, not decoration.
  interface: (
    <>
      <rect x="2.75" y="4.25" width="18.5" height="15.5" rx="2.75" />
      <path d="M2.75 8.5h18.5" />
      <rect x="5.75" y="11.25" width="6.5" height="5.5" rx="1.5" />
      <path d="M15 12.5h3.5M15 15.5h2.5" />
    </>
  ),

  // One entry point fanning out to the things it calls.
  service: (
    <>
      <circle cx="4.9" cy="12" r="2.15" />
      <circle cx="19.1" cy="6.9" r="2.15" />
      <circle cx="19.1" cy="17.1" r="2.15" />
      <path d="M6.9 11.3 17.1 7.6" />
      <path d="M6.9 12.7 17.1 16.4" />
    </>
  ),

  // A cylinder cut into partitions — storage that has structure.
  store: (
    <>
      <ellipse cx="12" cy="6.4" rx="7" ry="2.65" />
      <path d="M5 6.4v11.2c0 1.46 3.13 2.65 7 2.65s7-1.19 7-2.65V6.4" />
      <path d="M5 10.13c0 1.46 3.13 2.65 7 2.65s7-1.19 7-2.65" />
      <path d="M5 13.87c0 1.46 3.13 2.65 7 2.65s7-1.19 7-2.65" />
    </>
  ),

  // A sealed artifact with a trail behind it: something built, then moved.
  delivery: (
    <>
      <path d="M14.5 3.9 21 7.6v8.6l-6.5 3.7-6.5-3.7V7.6z" />
      <path d="M8 7.6 14.5 11.3 21 7.6" />
      <path d="M14.5 11.3v8.6" />
      <path d="M2.2 9.4h3.4M1.4 12h4.2M2.2 14.6h3.4" />
    </>
  ),

  // A check that had to get past something to be there.
  verify: (
    <>
      <path d="M12 3.2 5.2 5.8v5.7c0 4.2 3 7 6.8 8.7 3.8-1.7 6.8-4.5 6.8-8.7V5.8z" />
      <path d="m9.1 11.9 2.1 2.2 3.8-4.6" />
    </>
  ),
};

/**
 * Decorative by design — the group title sits directly beside it, so the glyph
 * adds no information a screen reader is missing.
 *
 * The hover lift reads `group-hover`, so the nearest ancestor carrying `group`
 * (the Panel) owns the interaction.
 */
export function GroupGlyph({
  glyph,
  className,
}: {
  glyph: GlyphKey;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-lg",
        "border border-accent-line bg-accent-soft text-accent shadow-e1",
        "transition-transform duration-[var(--dur-mid)] ease-[var(--ease-out-expo)]",
        "group-hover:-translate-y-0.5 group-hover:scale-[1.04]",
        className,
      )}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {GLYPHS[glyph]}
      </svg>
    </span>
  );
}
