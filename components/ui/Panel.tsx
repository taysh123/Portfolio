import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "flat" | "raised" | "float";
type Bloom = "none" | "top-right" | "top-left" | "bottom" | "centre";

/**
 * The surface the whole page is built from.
 *
 * The composition rule this exists to serve: the page is a small number of
 * LARGE framed regions on a lit field, not a stack of sections subdivided
 * into similar cards. A panel is meant to be big enough that its interior
 * padding, its edge light and its bloom all have room to read — which is why
 * `--panel-p` is generous and the default radius is 36px.
 *
 * Three layers make it read as a lit object rather than a tinted rectangle:
 *   1. `--panel-fill` — a directional gradient, cool at the top, with violet
 *      pooling toward the base.
 *   2. `edge-lit` — a gradient hairline border, brightest along the top edge.
 *   3. `sheen` — a wide, very low-opacity specular sweep across the upper
 *      third, which is what actually sells "glass" at this size.
 */
export function Panel({
  children,
  className,
  as: Tag = "div",
  tone = "flat",
  interactive = false,
  bloom = "none",
  sheen = true,
  inset = false,
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  tone?: Tone;
  /** Hover lift + deeper elevation. Pair with `group` on the same node. */
  interactive?: boolean;
  /** An accent bloom pooled behind the contents. */
  bloom?: Bloom;
  /** The specular sweep. Disable for panels that are mostly imagery. */
  sheen?: boolean;
  /** Adds the standard generous interior padding. */
  inset?: boolean;
}) {
  return (
    <Tag
      className={cn(
        "edge-lit relative isolate overflow-hidden rounded-3xl",
        tone === "flat" && "shadow-e1",
        tone === "raised" && "shadow-e2",
        tone === "float" && "shadow-e3",
        interactive &&
          "transition-[transform,box-shadow] duration-[var(--dur-slow)] ease-[var(--ease-out-expo)] hover:-translate-y-1.5 hover:shadow-e3",
        inset && "p-[var(--panel-p)]",
        className,
      )}
      style={{
        background: tone === "flat" ? "var(--panel-fill)" : "var(--panel-fill-deep)",
      }}
    >
      {bloom !== "none" && (
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute -z-10 rounded-full blur-[90px]",
            bloom === "top-right" && "-right-32 -top-40 h-[28rem] w-[28rem]",
            bloom === "top-left" && "-left-32 -top-40 h-[28rem] w-[28rem]",
            bloom === "bottom" && "-bottom-44 left-1/2 h-[30rem] w-[34rem] -translate-x-1/2",
            bloom === "centre" && "left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2",
          )}
          style={{
            background:
              "radial-gradient(closest-side, var(--glow-strong), var(--glow-blue) 52%, transparent 76%)",
          }}
        />
      )}

      {sheen && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[42%]"
          style={{
            background:
              "linear-gradient(178deg, rgba(255,255,255,0.055), transparent 72%)",
          }}
        />
      )}

      {children}
    </Tag>
  );
}
