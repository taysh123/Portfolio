import { captureOf, captureSrcSet as srcSet, captureFallback as fallback, type CaptureName } from "@/data/lab-images";
import type { Mark } from "./panels";

/** A capture's shape as a CSS ratio, from its real size. */
export const ratioOf = (name: CaptureName) => `${captureOf(name).w} / ${captureOf(name).h}`;

/**
 * One real capture (Concept A, Work): AVIF first, WebP for the rest, every encoded width, and the
 * image's real dimensions, so its box is reserved before it loads. Where the Product Plates chapter swapped in a phone crop below
 * 640px (Aegis's alert row, DeveloperOS's search: product-plates-final:components/work/AegisChapter.tsx, DeveloperOSChapter.tsx), so does
 * this. `priority` is for the first capture on the page only: eager and first in the fetch queue. Everything else is
 * lazy. Shared by the still panels (server) and the carousel (client).
 *
 * P4: a capture's `marks` (panels.ts) are drawn here, on the server, beside the picture inside its device frame, so
 * they move, turn and dim with the slide, and cost no script. Each is placed in shares of the capture, and of its phone
 * crop below 640px (work.css). They are hidden from screen readers: the capture's alt text already names what they mark.
 */
export function Shot({ image, phone, alt, sizes, priority, marks }: { image: CaptureName; phone?: CaptureName; alt: string; sizes: string; priority?: boolean; marks?: Mark[] }) {
  const im = captureOf(image);
  const picture = (
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
  if (!marks?.length) return picture;
  return (
    <>
      {picture}
      {marks.map((m, i) => (
        <span key={i} className="wk__mark" aria-hidden="true" style={{
          "--wk-l": m.box.l, "--wk-t": m.box.t, "--wk-w": m.box.w, "--wk-h": m.box.h,
          ...(m.phone ? { "--wk-l-m": m.phone.l, "--wk-t-m": m.phone.t, "--wk-w-m": m.phone.w, "--wk-h-m": m.phone.h } : null),
        } as React.CSSProperties} />
      ))}
    </>
  );
}
