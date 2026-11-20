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
