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
        "inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[0.6875rem] leading-none tracking-[0.04em]",
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

const STATUS_COPY: Record<ProjectStatus, { label: string; dot: string }> = {
  live: { label: "Live", dot: "var(--status-live)" },
  released: { label: "Released", dot: "var(--status-live)" },
  rc: { label: "Release candidate", dot: "var(--status-wip)" },
  coursework: { label: "Coursework", dot: "var(--status-idle)" },
  local: { label: "Runs locally", dot: "var(--status-idle)" },
};

/**
 * Honest shipping status. Every project carries one — a visitor should never
 * have to guess whether something is deployed. The text label is always
 * present, so meaning is never carried by the dot colour alone.
 */
export function StatusChip({
  status,
  className,
}: {
  status: ProjectStatus;
  className?: string;
}) {
  const { label, dot } = STATUS_COPY[status];
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
