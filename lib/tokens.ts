/**
 * TypeScript mirror of the design tokens in `app/globals.css`.
 *
 * Only for contexts that cannot read CSS custom properties:
 *   - `app/opengraph-image.tsx` (Satori renders outside the document)
 *   - the browser chrome colour and the web manifest
 *
 * Everything rendered in the browser must use the CSS variables instead, so theme switching keeps working. If you
 * change a value here, change it there.
 */
export const brand = {
  /** Paper: the light page field, the default since M10. */
  bgLight: "#f3f4f6",
  fgLight: "#0c0d10",
  fgMutedLight: "#434852",
  fgSubtleLight: "#5a606b",
  accentLight: "#1a4fe0",

  /** The dark theme's field and inks. */
  bg: "#0b0c0f",
  fg: "#f2f4f8",
  fgMuted: "#a3abb9",
  fgSubtle: "#8a93a3",
  accent: "#5b9cff",

  /** The four plates. */
  platePoker: "#0a1322",
  gold: "#d8b25c",
  plateAegis: "#e6e9ed",
  plateDos: "#17132a",
  plateGf: "#04191d",
} as const;
