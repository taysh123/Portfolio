"use client";

import type { ReactNode } from "react";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/cn";
import { DUR, easeSpring, viewportOnce } from "@/lib/motion";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";

/**
 * Text that rises out of a mask.
 *
 * Two traps this deliberately avoids, both of which produced the same
 * catastrophic symptom — a permanently invisible heading:
 *
 * 1. NOT `clipPath`. Framer Motion 12 cannot interpolate `inset()` here, and
 *    one unanimatable key aborts the whole variant transition. That is what
 *    left every section heading on the previous site at `opacity: 0`.
 *
 * 2. The viewport trigger lives on the WRAPPER, not on the moving child.
 *    IntersectionObserver clips a target against its ancestors' overflow, so
 *    a child translated fully outside an `overflow: hidden` box measures as
 *    zero visible area — `whileInView` on that child never fires, no matter
 *    where it is on screen. The wrapper is unclipped, so it observes
 *    correctly and drives the child through variant propagation.
 */
const MASK: Variants = {
  hidden: { y: "108%" },
  visible: { y: "0%" },
};

export function MaskReveal({
  children,
  className,
  delay = 0,
  duration = DUR.reveal,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}) {
  const reduced = useReducedMotionPref();

  // The wrapper must stay inline-block for the mask to work per line, so
  // there is no `as` prop — callers style it through `className`.
  if (reduced) {
    return <span className={className}>{children}</span>;
  }

  return (
    <motion.span
      // `pb` keeps descenders (g, y, p) and glyph overshoot out of the mask.
      className={cn("inline-block overflow-hidden pb-[0.14em] align-bottom", className)}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
    >
      <motion.span
        className="inline-block"
        variants={MASK}
        transition={{ duration, delay, ease: easeSpring }}
      >
        {children}
      </motion.span>
    </motion.span>
  );
}
