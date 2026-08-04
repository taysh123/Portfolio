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
  bg: "#08090f",
  bgLight: "#f6f7fb",

  fg: "#f1f3f9",
  fgMuted: "#a7afc2",
  fgSubtle: "#8a93a8",

  /** Interaction accent. Dark-theme value. */
  accent: "#5b8def",
  /** Interaction accent, light theme — darker so it still clears AA as text. */
  accentLight: "#2563eb",

  /** Atmospheric only: bloom behind solid objects. Never text, never a border. */
  glow: "#b47cff",

  statusLive: "#34d399",
  statusWip: "#fbbf24",
} as const;

/** Per-project accent hues, used by placeholder artwork and status chips. */
export const projectAccent = {
  blue: "#5b8def",
  violet: "#b47cff",
  teal: "#2dd4bf",
  amber: "#fbbf24",
} as const;

export type ProjectAccent = keyof typeof projectAccent;
