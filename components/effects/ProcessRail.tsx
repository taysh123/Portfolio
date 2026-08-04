"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { easeOutExpo, viewportOnce } from "@/lib/motion";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";

/**
 * The connector behind a step sequence: horizontal at lg+, vertical below.
 *
 * This is the dominant structure of the Approach panel — the steps read as
 * stations *on* a line rather than as five cards that happen to sit in a row.
 * Geometry is therefore coupled to the step marker in the consuming section:
 * `offset` is the marker's centre line, so the rail sits on it and is occluded
 * by the marker's opaque surface. Passing the offset in (rather than baking in
 * a magic 1.375rem, as the previous version did) means the marker can be
 * resized without silently detaching the rail from it.
 *
 * Both rails are mounted at once and swapped with `display`, so each one only
 * ever draws when its breakpoint is live: a `display: none` element has no box,
 * so the viewport observer never fires for it.
 *
 * The tail fades to transparent because the last step is not the end of the
 * process — and because a hard stop would have to land on an element whose
 * height we don't control.
 */

const RAIL_BASE = "pointer-events-none absolute rounded-full";

/** Slower than a reveal (DUR.reveal) — the line has the whole row to cross. */
const DRAW = { duration: 1.15, delay: 0.08, ease: easeOutExpo } as const;

export function ProcessRail({ offset = "1.75rem" }: { offset?: string }) {
  const reduced = useReducedMotionPref();

  const vertical = {
    className: cn(RAIL_BASE, "bottom-0 w-px lg:hidden"),
    style: {
      left: offset,
      top: offset,
      background:
        "linear-gradient(180deg, var(--accent-line), var(--border-strong) 44%, transparent)",
      transformOrigin: "top center",
    },
  };

  const horizontal = {
    className: cn(RAIL_BASE, "right-0 hidden h-px lg:block"),
    style: {
      left: offset,
      top: offset,
      background:
        "linear-gradient(90deg, var(--accent-line), var(--border-strong) 52%, transparent)",
      transformOrigin: "left center",
    },
  };

  // Reduced motion gets the finished line, not a faster one.
  if (reduced) {
    return (
      <>
        <span aria-hidden="true" {...vertical} />
        <span aria-hidden="true" {...horizontal} />
      </>
    );
  }

  return (
    <>
      <motion.span
        aria-hidden="true"
        {...vertical}
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={viewportOnce}
        transition={DRAW}
      />
      <motion.span
        aria-hidden="true"
        {...horizontal}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={viewportOnce}
        transition={DRAW}
      />
    </>
  );
}
