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
 * SIZE IS AN INPUT-DEVICE DECISION, not just a visual one. `sm` used to be
 * 36px at every width, justified as "only for inline chips inside already-large
 * hit areas" — which was not where it ended up being used. It carries "Case
 * study", "Open the app" and the repository link on every project card, and
 * those are the primary actions on a phone. A mouse is precise and a thumb is
 * not, so `sm` is a full 44px target up to `lg` and tightens to 36px above it,
 * where the pointer earns the density.
 */
const base =
  "group/btn relative inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap " +
  "transition-[background-color,border-color,color,transform] duration-[var(--dur-mid)] ease-[var(--ease-out-expo)] " +
  "active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50";

const sizes: Record<Size, string> = {
  sm: "h-11 px-4 text-sm lg:h-9",
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
      {/*
        This span has to be a FLEX row, not a plain one.

        It wraps all the children together, so for a button like
        `<Button><BookOpenIcon/>Case study</Button>` the icon and the label end
        up inside it — which meant the button's own `gap-2` was applying
        between this span and the arrow, never between the icon and the text,
        and the SVG was sitting on the text's BASELINE rather than its centre.
        Measured on the project cards: the glyph rode 10px above the button's
        middle with no gap after it, on every icon-and-label button on the
        site. `inline-flex items-center gap-2` fixes the alignment and the
        spacing together, in the one place that owns them.
      */}
      <span className="relative inline-flex items-center gap-2">{children}</span>
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
