import { captureOf, captureSrcSet as srcSet, captureFallback as fallback, type CaptureName } from "@/data/lab-images";

/** A capture's shape as a CSS ratio, from its real size. */
export const ratioOf = (name: CaptureName) => `${captureOf(name).w} / ${captureOf(name).h}`;

/**
 * One real capture (PROTOTYPE, the lab's Work slice): AVIF first, WebP for the rest, every encoded width, and the
 * image's real dimensions, so its box is reserved before it loads. Where the live chapter swaps in a phone crop below
 * 640px (Aegis's alert row, DeveloperOS's search: components/work/AegisChapter.tsx, DeveloperOSChapter.tsx), so does
 * this. `priority` is for the first capture on the page only: eager and first in the fetch queue. Everything else is
 * lazy. Shared by the still panels (server) and the carousel (client).
 */
export function Shot({ image, phone, alt, sizes, priority }: { image: CaptureName; phone?: CaptureName; alt: string; sizes: string; priority?: boolean }) {
  const im = captureOf(image);
  return (
    <picture>
      {phone && <source media="(max-width: 639px)" type="image/avif" srcSet={srcSet(phone, "avif")} sizes="92vw" />}
      {phone && <source media="(max-width: 639px)" type="image/webp" srcSet={srcSet(phone, "webp")} sizes="92vw" />}
      <source type="image/avif" srcSet={srcSet(image, "avif")} sizes={sizes} />
      {/* The phone crop has its own shape: its real ratio reserves the box below 640px (work.css), so nothing shifts. */}
      <img src={fallback(image)} srcSet={srcSet(image, "webp")} sizes={sizes} alt={alt} width={im.w} height={im.h}
        decoding="async" loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : undefined} draggable={false}
        style={phone ? ({ "--wk-ratio-phone": ratioOf(phone) } as React.CSSProperties) : undefined} />
    </picture>
  );
}
