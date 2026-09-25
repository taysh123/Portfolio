/**
 * TypeScript mirror of the design tokens in `app/globals.css`.
 *
 * Only for contexts that cannot read CSS custom properties:
 *   - `app/opengraph-image.tsx` (Satori renders outside the document)
 *   - inline SVG gradient stops that need literal colours
 *
 * Everything rendered in the browser must use the CSS variables instead, so
 * theme switching keeps working. If you change a value here, change it there.
 */

export const brand = {
  /** Page field. Deliberately not #000 — pure black smears on OLED. */
  bg: "#05070a",
  bgRaised: "#0a0e14",
  screen: "#05070a",
  bgLight: "#f5f6f8",
  fgLight: "#0b0e14",
  fgSubtleRaised: "#8089a0",

  fg: "#f2f4f8",
  fgMuted: "#9aa3b2",
  fgSubtle: "#7b8597",

  /** Interaction accent. Dark-theme value. */
  accent: "#5b9cff",
  /** Filled-button accent; white text clears 4.5:1. */
  accentSolid: "#1d6ef5",
  /** Interaction accent, light theme — darker so it still clears AA as text. */
  accentLight: "#1459d9",

  /** Atmospheric only: bloom behind solid objects. Never text, never a border. */
  glow: "#5b9cff",

  statusLive: "#34d399",
  statusWip: "#fbbf24",
} as const;

