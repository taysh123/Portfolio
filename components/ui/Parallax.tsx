"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/cn";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";

/**
 * Scroll-linked vertical drift.
 *
 * Used to give panel interiors a little depth against their frame — an
 * illustration drifting a few dozen pixels slower than the panel it sits in
 * reads as distance, which is most of what makes a flat page feel layered.
 *
 * Deliberately small: `speed` is a fraction of the element's travel, spring
 * damped, and capped well below the range that causes motion sickness. It
 * returns a plain wrapper under reduced motion.
 */
export function Parallax({
  children,
  speed = 0.12,
  className,
}: {
  children: ReactNode;
  /** Fraction of scroll travel to offset by. Sane range 0.05–0.25. */
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotionPref();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const raw = useTransform(scrollYProgress, [0, 1], [speed * 180, speed * -180]);
  const y = useSpring(raw, { stiffness: 110, damping: 26, mass: 0.6 });

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div ref={ref} style={{ y }} className={cn("will-change-transform", className)}>
      {children}
    </motion.div>
  );
}
