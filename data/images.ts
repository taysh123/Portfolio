/**
 * The M10 page's images (written by scripts/m10-images.mjs into public/work/): each name, the widths it is encoded
 * at, and its largest size — so every <img> carries its real dimensions and the browser reserves the space before a
 * byte arrives. tests/unit/work.test.ts checks this table against the files on disk.
 */
export const IMAGES = {
  "hero-poker-live": { widths: [240, 400, 560], w: 560, h: 1214 },
  "hero-poker-home": { widths: [240, 400, 560], w: 560, h: 1214 },
  "hero-aegis": { widths: [360, 600, 900], w: 900, h: 506 },
  "hero-dos": { widths: [360, 600, 900], w: 900, h: 1078 },
  "hero-gf": { widths: [240, 400, 640], w: 640, h: 1280 },
  "poker-home": { widths: [320, 480, 640], w: 640, h: 1387 },
  "poker-live": { widths: [320, 480, 640], w: 640, h: 1387 },
  "poker-settle": { widths: [320, 480, 640], w: 640, h: 1387 },
  "aegis-alerts": { widths: [600, 900, 1148], w: 1148, h: 200 },
  "aegis-alerts-phone": { widths: [420, 700, 1060], w: 1060, h: 200 },
  "dos-search": { widths: [800, 1200, 1600], w: 1600, h: 1027 },
  "dos-search-phone": { widths: [400, 620, 820], w: 820, h: 612 },
  "gf-gameplay": { widths: [320, 480, 640], w: 640, h: 1280 },
  "gf-boss": { widths: [320, 480], w: 480, h: 960 },
  "tpoker-icon": { widths: [104, 156], w: 156, h: 159 },
  "tpoker-wordmark": { widths: [222, 333], w: 333, h: 51 },
} as const;

export type ImageName = keyof typeof IMAGES;
export const srcSet = (name: ImageName, ext: "avif" | "webp") => IMAGES[name].widths.map((w) => `/work/${name}-${w}.${ext} ${w}w`).join(", ");
export const fallback = (name: ImageName) => `/work/${name}-${IMAGES[name].widths.at(-1)}.webp`;

/** Aegis's live-alerts capture (3840×2160): the crops scripts/m10-images.mjs cuts (keep the two in step — the unit test
 *  compares them), and the port-scan row's card bounds, measured on the capture. The crops hold that row alone, with
 *  only the borders of the cards above and below it. */
export const AEGIS_CROPS = {
  desktop: { left: 492, top: 612, width: 1148, height: 200 },
  phone: { left: 500, top: 612, width: 1060, height: 200 },
} as const;
export const AEGIS_ROW = { left: 528, top: 644, bottom: 775 } as const;

/** Aegis's Incidents board (3840×2160): the one crop scripts/m10-images.mjs cuts from it — the page head and the OPEN
 *  column's first incident, for the hero plate, the case study and the About photo's monitor (kept in step by the unit
 *  test) — and the board's measured bounds. That incident, "Privilege escalation on workstation", is the only card whose
 *  title its own alerts bear out; the crop reaches no other card. */
export const AEGIS_BOARD = { left: 492, top: 0, width: 1108, height: 623 } as const;
export const AEGIS_BOARD_BOUNDS = { sidebarEnd: 479, openEnd: 1593, investigatingStart: 1626, investigatingEnd: 2693, resolvedStart: 2726, firstCardsEnd: 617, openSecondCardTop: 634 } as const;
