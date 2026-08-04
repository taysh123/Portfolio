"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { MaskReveal } from "@/components/ui/MaskReveal";
import { DUR, easeSpring, viewportOnce } from "@/lib/motion";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";

/**
 * Section heading block, designed to sit *inside* a panel.
 *
 * The h2 reveal is structural (`MaskReveal`) rather than a `clipPath` variant —
 * Framer Motion 12 cannot interpolate that value, and one unanimatable key
 * aborts the whole transition, which is what left every heading on the previous
 * site permanently at `opacity: 0`.
 */
export function SectionHeader({
  id,
  eyebrow,
  title,
  intro,
  aside,
  className,
  wide = false,
}: {
  id: string;
  eyebrow?: string;
  title?: ReactNode;
  intro?: ReactNode;
  aside?: ReactNode;
  className?: string;
  /** Lets the intro run wider — for headers that span a full panel. */
  wide?: boolean;
}) {
  const reduced = useReducedMotionPref();

  return (
    <header className={cn("mb-[clamp(2rem,3.5vw,3.5rem)]", className)}>
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
        <div className={wide ? "max-w-3xl" : "max-w-xl"}>
          {eyebrow && (
            <motion.div
              initial={reduced ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={viewportOnce}
              transition={{ duration: DUR.slow, ease: easeSpring }}
            >
              <Eyebrow rule>{eyebrow}</Eyebrow>
            </motion.div>
          )}

          {title && (
            <h2
              id={`${id}-title`}
              className="mt-5 font-semibold leading-[1.04] tracking-[var(--tracking-heading)] text-fg"
              style={{ fontSize: "var(--text-h2)" }}
            >
              <MaskReveal>{title}</MaskReveal>
            </h2>
          )}

          {intro && (
            <motion.p
              initial={reduced ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewportOnce}
              transition={{ duration: DUR.reveal, delay: 0.12, ease: easeSpring }}
              className="mt-6 leading-relaxed text-fg-muted"
              style={{ fontSize: "var(--text-lead)" }}
            >
              {intro}
            </motion.p>
          )}
        </div>

        {aside && <div className="shrink-0 pb-1">{aside}</div>}
      </div>
    </header>
  );
}
