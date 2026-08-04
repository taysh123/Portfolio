import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ArrowUpRightIcon } from "@/components/ui/icons";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

/**
 * Button hierarchy. Exactly one `primary` per view — everything else is
 * subordinate. Replaces six near-identical pill recipes that had drifted
 * across four files.
 *
 * Every size clears the 44px touch-target minimum except `sm`, which is only
 * for inline chips inside already-large hit areas.
 */
const base =
  "group/btn relative inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap " +
  "transition-[background-color,border-color,color,transform] duration-[var(--dur-mid)] ease-[var(--ease-out-expo)] " +
  "active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50";

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base sm:h-[3.25rem] sm:px-7",
};

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-contrast shadow-e1 hover:bg-accent-hover",
  secondary:
    "border border-line bg-surface-2 text-fg hover:border-line-strong hover:bg-surface-1",
  ghost:
    "text-fg-muted hover:bg-surface-1 hover:text-fg",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  /** Appends the shared arrow glyph, animated on hover. */
  arrow?: boolean;
};

function inner(children: ReactNode, arrow?: boolean) {
  return (
    <>
      <span className="relative">{children}</span>
      {arrow && (
        <ArrowUpRightIcon
          size={16}
          className="relative transition-transform duration-[var(--dur-mid)] ease-[var(--ease-out-expo)] group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
        />
      )}
    </>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  arrow,
  ...rest
}: CommonProps & ComponentPropsWithoutRef<"button">) {
  return (
    <button
      type="button"
      className={cn(base, sizes[size], variants[variant], className)}
      {...rest}
    >
      {inner(children, arrow)}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  arrow,
  external,
  ...rest
}: CommonProps &
  ComponentPropsWithoutRef<"a"> & {
    /** Adds target/rel and marks the link for screen readers. */
    external?: boolean;
  }) {
  return (
    <a
      className={cn(base, sizes[size], variants[variant], className)}
      {...(external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : null)}
      {...rest}
    >
      {inner(children, arrow)}
      {external && <span className="sr-only"> (opens in a new tab)</span>}
    </a>
  );
}
