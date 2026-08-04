import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

type PanelTone = "flat" | "raised" | "float";

/**
 * The surface primitive the whole site is built from.
 *
 * One recipe replaces the eight hand-rolled glass treatments the previous
 * design accumulated. Panels are *translucent, not blurred*: the page field
 * already carries a soft aurora, so a low-alpha surface reads as glass
 * without paying for `backdrop-filter` on every card. Real blur is reserved
 * for nav and overlays (the `.glass` utility), where it signals elevation.
 *
 *   flat   — section container, sits on the field
 *   raised — a card inside a panel
 *   float  — detached / interactive, carries the strongest edge and shadow
 */
export function Panel({
  children,
  className,
  as: Tag = "div",
  tone = "flat",
  interactive = false,
  bloom,
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  tone?: PanelTone;
  /** Adds hover lift + border brightening. Pair with `group` on the same node. */
  interactive?: boolean;
  /** Positions an accent bloom behind the panel contents. */
  bloom?: "top-right" | "top-left" | "bottom" | "none";
}) {
  return (
    <Tag
      className={cn(
        "edge-lit relative isolate overflow-hidden rounded-2xl",
        tone === "flat" && "bg-surface-1 shadow-e1",
        tone === "raised" && "bg-surface-2 shadow-e2",
        tone === "float" && "bg-surface-2 shadow-e3",
        interactive &&
          "transition-[transform,box-shadow] duration-[var(--dur-slow)] ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:shadow-e3",
        className,
      )}
    >
      {bloom && bloom !== "none" && (
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute -z-10 h-64 w-64 rounded-full blur-3xl",
            bloom === "top-right" && "-right-20 -top-24",
            bloom === "top-left" && "-left-20 -top-24",
            bloom === "bottom" && "-bottom-28 left-1/2 -translate-x-1/2",
          )}
          style={{
            background:
              "radial-gradient(closest-side, var(--glow-strong), transparent 72%)",
          }}
        />
      )}
      {children}
    </Tag>
  );
}
