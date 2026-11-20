/**
 * TypeScript mirror of Concept A's field and inks: the `--cine-*` tokens in `app/cinematic.css`.
 *
 * Only for contexts that cannot read CSS custom properties:
 *   - `app/opengraph-image.tsx` (Satori renders outside the document)
 *   - the browser chrome colour and the web manifest
 *
 * Everything rendered in the browser must use the CSS variables instead. If you change a value here, change it there;
 * tests/unit/surfaces.test.ts holds the two equal.
 */
export const cine = {
  /** The base field: the page's background, the browser chrome and the manifest. */
  abyss: "#04060d",
  /** The sky gradient's lower end. */
  navy: "#0a1020",
  /** Headings and names. */
  ink: "#eef2fb",
  /** Body copy. */
  mist: "#acb6c9",
  /** Small labels and states. */
  faint: "#95a0b6",
  /** The accent, and the duotone's start. */
  cyan: "#2ee6d6",
  /** Only ever beside cyan, in the duotone. */
  violet: "#9b6bff",
} as const;

/** The Product Plates mirror of app/globals.css, kept until the manifest and the browser chrome move to the field. */
export const brand = {
  /** Paper: the light page field, the default since M10. */
  bgLight: "#f3f4f6",
  fgLight: "#0c0d10",
  fgMutedLight: "#434852",
  fgSubtleLight: "#5a606b",
  accentLight: "#4a3fe0",

  /** The dark theme's field and inks. */
  bg: "#0b0c0f",
  fg: "#f2f4f8",
  fgMuted: "#a3abb9",
  fgSubtle: "#8a93a3",
  accent: "#a5a8ff",

  /** The four plates. */
  platePoker: "#0a1322",
  gold: "#d8b25c",
  plateAegis: "#e6e9ed",
  plateDos: "#17132a",
  plateGf: "#04191d",
} as const;
