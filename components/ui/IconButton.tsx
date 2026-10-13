import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Circular icon control. One component replaces five different sizes, three
 * border opacities and three focus-ring strategies that had accumulated
 * across the overlays.
 *
 * Both sizes meet WCAG 2.5.5 (44×44). `sm` renders a 36px visual with a
 * transparent 44px hit area via `before:` — the glyph looks light, the target
 * is still full-size.
 */
export function IconButton({
  children,
  label,
  size = "md",
  tone = "default",
  className,
  ...rest
}: {
  children: ReactNode;
  /** Required — this control has no visible text. */
  label: string;
  size?: "sm" | "md";
  /** `bare`: no chrome until hovered — the header's controls. */
  tone?: "default" | "solid" | "bare";
  className?: string;
} & ComponentPropsWithoutRef<"button">) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full",
        "transition-[background-color,border-color,color] duration-[160ms] ease-[var(--ease-out)]",
        // Expands the hit area to 44px without changing the visual size.
        "before:absolute before:left-1/2 before:top-1/2 before:h-11 before:w-11 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']",
        size === "sm" ? "h-9 w-9" : "h-11 w-11",
        tone === "default" &&
          "border border-line bg-surface-1 text-fg-muted hover:border-line-strong hover:bg-surface-2 hover:text-fg",
        tone === "solid" &&
          "bg-accent text-accent-contrast hover:bg-accent-hover",
        tone === "bare" &&
          "text-fg-muted hover:bg-[color-mix(in_oklab,var(--fg)_8%,transparent)] hover:text-fg",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
