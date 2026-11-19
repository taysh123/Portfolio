import { IMAGES, type ImageName } from "@/data/images";

/**
 * The captures only the Work carousels show (first added for the Concept A prototype), in the shape data/images.ts
 * uses (each name, its encoded widths, its largest size). scripts/m10-images.mjs writes them into public/work/ like
 * every other capture; tests/unit/lab-work.test.ts checks this list against the files on disk.
 *
 * They were listed here and not in data/images.ts because the Product Plates About visual (client code, retired in
 * the release) imported that file's IMAGES whole, so one more entry there would have shipped in first-load
 * JavaScript. Only server code imports this file.
 */
export const LAB_IMAGES = {
  "poker-podium": { widths: [320, 480, 640], w: 640, h: 1387 },
  "poker-stats": { widths: [320, 480, 640], w: 640, h: 1387 },
  "dos-learning": { widths: [800, 1200, 1600], w: 1600, h: 900 },
  "dos-career": { widths: [800, 1200, 1600], w: 1600, h: 900 },
  "dos-dashboard": { widths: [800, 1200, 1600], w: 1600, h: 900 },
  "gf-gravity-run": { widths: [320, 480, 640], w: 640, h: 1280 },
  "gf-cosmetics": { widths: [320, 480, 640], w: 640, h: 1280 },
  "gf-win": { widths: [320, 480, 640], w: 640, h: 1280 },
} as const;

export type LabImageName = keyof typeof LAB_IMAGES;
/** Any capture a lab gallery can name: the site's own (data/images.ts) or the lab's. */
export type CaptureName = ImageName | LabImageName;

const ALL: Record<CaptureName, { readonly widths: readonly number[]; readonly w: number; readonly h: number }> = { ...IMAGES, ...LAB_IMAGES };

/** The same helpers as data/images.ts (srcSet, fallback), over both lists: the URLs are built the same way. */
export const captureOf = (name: CaptureName) => ALL[name];
export const captureSrcSet = (name: CaptureName, ext: "avif" | "webp") => ALL[name].widths.map((w) => `/work/${name}-${w}.${ext} ${w}w`).join(", ");
export const captureFallback = (name: CaptureName) => `/work/${name}-${ALL[name].widths.at(-1)}.webp`;
