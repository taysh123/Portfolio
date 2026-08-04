import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Overline label. One size, one tracking, one colour — the previous design
 * had this same semantic element at six different sizes across nine files.
 *
 * Colour is `--fg-subtle`, held at 7:1 contrast precisely because this
 * renders at 11px.
 */
export function Eyebrow({
  children,
  className,
  rule = false,
  as: Tag = "p",
}: {
  children: ReactNode;
  className?: string;
  /** Prefixes a short accent rule — used at the top of page sections. */
  rule?: boolean;
  as?: "p" | "span" | "div";
}) {
  return (
    <Tag className={cn("label flex items-center gap-3 text-fg-subtle", className)}>
      {rule && (
        <span
          aria-hidden="true"
          className="inline-block h-px w-8 shrink-0 bg-accent-line"
        />
      )}
      <span>{children}</span>
    </Tag>
  );
}
