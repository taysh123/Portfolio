import type { Variants, Transition } from "framer-motion";

/**
 * Shared motion language.
 *
 * Timing follows the "premium" band: 400–600ms for reveals, 150–300ms for
 * micro-interactions, exits ~65% of enter duration. Everything animates
 * transform/opacity only — never width, height, or filter — so work stays on
 * the compositor.
 *
 * NOTE ON `clipPath`: an earlier version of this file animated
 * `clipPath: inset(...)` for heading reveals. Framer Motion 12 cannot
 * interpolate that value, and a single unanimatable key aborts the ENTIRE
 * variant transition — which silently left every section heading at
 * `opacity: 0` in production. Mask reveals are done structurally instead
 * (`components/ui/MaskReveal.tsx`): an `overflow-hidden` wrapper with a
 * translated child. Do not reintroduce clipPath here.
 */

export const easeOutExpo: Transition["ease"] = [0.16, 1, 0.3, 1];
export const easeSpring: Transition["ease"] = [0.2, 0.9, 0.25, 1];

export const DUR = {
  fast: 0.18,
  mid: 0.32,
  slow: 0.52,
  reveal: 0.62,
} as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DUR.reveal, ease: easeSpring },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: DUR.slow, ease: easeOutExpo },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: DUR.slow, ease: easeOutExpo },
  },
};

/** Horizontal rule that draws itself — eyebrow hairlines, connector lines. */
export const lineGrow: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: DUR.reveal, ease: easeSpring },
  },
};

export const staggerContainer = (stagger = 0.07, delay = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
});

/**
 * `amount: 0.2` rather than 0.25 so tall elements (a 3-line headline, a wide
 * card grid) trigger before the reader has scrolled past their top edge.
 */
export const viewportOnce = { once: true, amount: 0.2 } as const;

/**
 * Panel entrance. Rises, settles and scales up a touch — a large surface needs
 * a slightly longer, slightly heavier arrival than a text block, or it reads as
 * a card popping in rather than an object being placed.
 */
export const panelRise: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.85, ease: easeOutExpo },
  },
};

/** Viewport trigger for large panels — fires a little earlier than the default
 *  so a tall panel has begun settling before it dominates the screen. */
export const viewportPanel = { once: true, amount: 0.08 } as const;
