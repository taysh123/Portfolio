"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { MaskReveal } from "@/components/ui/MaskReveal";
import { DUR, easeSpring, viewportOnce } from "@/lib/motion";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";

/**
 * Section heading block.
 *
 * The h2 reveal is structural (`MaskReveal`), not a `clipPath` variant — the
 * previous implementation animated `clipPath: inset()`, which Framer Motion 12
 * cannot interpolate, so every heading on the site sat at `opacity: 0`
 * permanently. Type size comes from the `--text-h2` token instead of an inline
 * `style` that silently overrode the utility classes on the same element.
 */
export function SectionHeader({
  id,
  eyebrow,
  title,
  intro,
  aside,
}: {
  id: string;
  eyebrow?: string;
  title?: ReactNode;
  intro?: ReactNode;
  aside?: ReactNode;
}) {
  const reduced = useReducedMotionPref();

  return (
    <header className="mb-10 sm:mb-14">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="max-w-2xl">
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
              className="mt-4 font-semibold leading-[1.06] tracking-[var(--tracking-heading)] text-fg"
              style={{ fontSize: "var(--text-h2)" }}
            >
              <MaskReveal>{title}</MaskReveal>
            </h2>
          )}

          {intro && (
            <motion.p
              initial={reduced ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewportOnce}
              transition={{ duration: DUR.reveal, delay: 0.12, ease: easeSpring }}
              className="mt-5 max-w-xl leading-relaxed text-fg-muted"
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
