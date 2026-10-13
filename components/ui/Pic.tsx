import { IMAGES, srcSet, fallback, type ImageName } from "@/data/images";

/**
 * One responsive image: AVIF first, WebP for browsers without it, both at every encoded width, with the image's real
 * dimensions so its box is reserved before it loads. `priority` is for the first screen only: eager, and with "high"
 * also first in the fetch queue (kept for the one or two largest images, or it means nothing); everything else is lazy.
 */
export function Pic({ name, sizes, alt, className, imgClassName, priority, style }: {
  name: ImageName; sizes: string; alt: string; className?: string; imgClassName?: string; priority?: boolean | "high"; style?: React.CSSProperties;
}) {
  const im = IMAGES[name];
  return (
    <picture className={className} style={style}>
      <source type="image/avif" srcSet={srcSet(name, "avif")} sizes={sizes} />
      <img src={fallback(name)} srcSet={srcSet(name, "webp")} sizes={sizes} alt={alt} width={im.w} height={im.h}
        className={imgClassName} decoding="async" loading={priority ? "eager" : "lazy"} fetchPriority={priority === "high" ? "high" : undefined} />
    </picture>
  );
}
