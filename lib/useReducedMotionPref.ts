"use client";

import { useMediaQuery } from "@/lib/useMediaQuery";
import { useAccessibility } from "@/components/providers/AccessibilityProvider";

/**
 * Combined reduced-motion signal.
 *
 * Framer's `useReducedMotion()` only reads the OS `prefers-reduced-motion`
 * media query. The in-app Accessibility panel exposes a *separate* toggle
 * (`useAccessibility().reducedMotion`, mirrored onto `data-reduced-motion`).
 *
 * The CSS kill-switch in globals.css neutralizes CSS animations/transitions
 * for both, but it CANNOT stop a JS-driven loop (rAF / Framer motion values)
 * that writes transforms — e.g. a rotating 3D carousel. Any such animation
 * must gate on this combined hook, not on `useReducedMotion()` alone.
 */
export function useReducedMotionPref(): boolean {
  // Subscribed, not read once: Framer's useReducedMotion() never updates when the OS setting changes mid-session.
  const media = useMediaQuery("(prefers-reduced-motion: reduce)");
  const { reducedMotion } = useAccessibility();
  return Boolean(media) || reducedMotion;
}
