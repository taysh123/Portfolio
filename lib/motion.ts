import type { Transition } from "framer-motion";

/**
 * Shared motion timing for the chrome's overlays (nav sheet, palette, panels, case study).
 *
 * The "premium" band: 400–600ms for reveals, 150–300ms for micro-interactions, exits ~65% of enter
 * duration. Transform/opacity only — never width, height, filter or clipPath (Framer Motion 12 cannot
 * interpolate `clipPath: inset(...)`, and one unanimatable key aborts the whole transition).
 */
export const easeOutExpo: Transition["ease"] = [0.16, 1, 0.3, 1];

export const DUR = {
  fast: 0.18,
  mid: 0.32,
  slow: 0.52,
} as const;
