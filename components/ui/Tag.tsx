import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Technology / metadata chip.
 *
 * Lowercase rather than uppercase: stack names like "ASP.NET Core" and
 * "PostgreSQL" carry meaningful casing, and uppercasing them destroys the
 * signal. `emphasis` marks the one or two technologies that actually carry a
 * project, so the emphasis means something.
 */
export function Tag({
  children,
  emphasis = false,
  className,
}: {
  children: ReactNode;
  emphasis?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[0.8125rem] leading-none",
        emphasis
          ? "border-accent-line bg-accent-soft text-fg"
          : "border-line-subtle bg-surface-1 text-fg-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}

export type ProjectStatus = "live" | "released" | "rc" | "coursework" | "local";

const STATUS_DOT: Record<ProjectStatus, string> = {
  live: "var(--status-live)",
  released: "var(--status-live)",
  rc: "var(--status-wip)",
  coursework: "var(--status-idle)",
  local: "var(--status-idle)",
};

/**
 * Honest shipping status. Every project carries one — a visitor should never
 * have to guess whether something is deployed. The text label is always
 * present, so meaning is never carried by the dot colour alone.
 */
export function StatusChip({
  status,
  label,
  className,
}: {
  status: ProjectStatus;
  /** The status's label (lib/dict.ts status.*). */
  label: string;
  className?: string;
}) {
  const dot = STATUS_DOT[status];
  return (
    <span
      className={cn(
        "label inline-flex items-center gap-1.5 rounded-full border border-line-subtle bg-surface-1 px-2.5 py-1 text-fg-muted",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ background: dot }}
      />
      {label}
    </span>
  );
}
