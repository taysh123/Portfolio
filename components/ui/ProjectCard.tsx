"use client";

import { useRef } from "react";
import { Panel } from "@/components/ui/Panel";
import { Tag, StatusChip } from "@/components/ui/Tag";
import { ProjectImage } from "@/components/ui/ProjectImage";
import { ArrowUpRightIcon, GithubIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import type { Project } from "@/data/projects";

/**
 * A project in the grid.
 *
 * The whole card is a link to the case study via a stretched overlay, so the
 * hit area is the full card — but the underlying markup stays valid. The
 * previous carousel nested `<article>`, `<h3>` and `<ul>` inside a `<button>`,
 * which is non-conforming (button takes phrasing content only) and left
 * assistive-tech behaviour around the heading undefined.
 *
 * The secondary GitHub link sits above the overlay in z-order so it stays
 * independently clickable.
 */
export function ProjectCard({
  project,
  size = "sm",
  onOpenCaseStudy,
}: {
  project: Project;
  size?: "md" | "sm";
  onOpenCaseStudy: (project: Project) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Pointer halo. Writes two custom properties on the card only — no layout
  // reads, no rAF loop, mouse only.
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--hx", `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty("--hy", `${((e.clientY - r.top) / r.height) * 100}%`);
    el.dataset.hover = "true";
  };
  const onLeave = () => {
    if (ref.current) ref.current.dataset.hover = "false";
  };

  const topMetric = project.metrics[0];

  return (
    <Panel
      as="article"
      tone="raised"
      interactive
      className={cn("group flex h-full flex-col")}
    >
      <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className="flex h-full flex-col">
        <span aria-hidden="true" className="halo z-0" />

        <div
          className={cn(
            "relative w-full overflow-hidden border-b border-line-subtle",
            size === "md" ? "aspect-[16/9]" : "aspect-[16/10]",
          )}
        >
          <ProjectImage
            project={project}
            className="h-full w-full"
            sizes={
              size === "md"
                ? "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 560px"
                : "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 380px"
            }
          />
          <span
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[var(--surface-0)] to-transparent opacity-70"
          />
        </div>

        <div className="relative z-10 flex flex-1 flex-col p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <StatusChip status={project.status} />
            {topMetric && (
              <span className="label text-fg-subtle">
                <span className="tnum text-fg-muted">{topMetric.value}</span>{" "}
                {topMetric.label.toLowerCase()}
              </span>
            )}
          </div>

          <h3
            className={cn(
              "mt-3 font-semibold tracking-[var(--tracking-heading)] text-fg",
              size === "md" ? "text-xl sm:text-2xl" : "text-lg",
            )}
          >
            {project.name}
          </h3>

          <p
            className={cn(
              "mt-2 leading-relaxed text-fg-muted",
              size === "md" ? "text-[0.95rem]" : "text-sm",
            )}
          >
            {project.summary}
          </p>

          <ul className="mt-4 flex flex-wrap gap-1.5">
            {project.stack.slice(0, size === "md" ? 5 : 3).map((s) => (
              <li key={s.label}>
                <Tag emphasis={s.emphasis}>{s.label}</Tag>
              </li>
            ))}
          </ul>

          <footer className="mt-5 flex items-center justify-between gap-3 pt-1">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-accent">
              Case study
              <ArrowUpRightIcon
                size={14}
                className="transition-transform duration-[var(--dur-mid)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </span>

            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="relative z-20 inline-flex h-11 w-11 items-center justify-center rounded-full text-fg-subtle transition-colors hover:bg-surface-1 hover:text-fg"
              aria-label={`${project.name} source on GitHub`}
            >
              <GithubIcon size={17} />
            </a>
          </footer>
        </div>

        {/* Stretched hit area. Carries the accessible name for the whole card. */}
        <button
          type="button"
          onClick={() => onOpenCaseStudy(project)}
          className="absolute inset-0 z-10 rounded-2xl"
        >
          <span className="sr-only">Read the {project.name} case study</span>
        </button>
      </div>
    </Panel>
  );
}
