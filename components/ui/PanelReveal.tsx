"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { panelRise, viewportPanel } from "@/lib/motion";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";

/**
 * The arrival choreography for a large panel.
 *
 * A big surface needs a heavier entrance than a paragraph — it rises further,
 * settles longer, and scales up a fraction — otherwise it reads as a card
 * popping in rather than an object being placed. The viewport trigger fires
 * early (8%) so a tall panel has begun settling before it dominates the
 * screen, which is what stops the page feeling like it stutters on scroll.
 */
export function PanelReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotionPref();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={viewportPanel}
      variants={panelRise}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}
