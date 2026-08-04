"use client";

import { useRef } from "react";
import { Panel } from "@/components/ui/Panel";
import { Tag, StatusChip } from "@/components/ui/Tag";
import { ProjectImage } from "@/components/ui/ProjectImage";
import { ArrowUpRightIcon, GithubIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import type { Project } from "@/data/projects";

/**
 * A project as a full-width ROW, not a card.
 *
 * The previous version put five of these in a 3-up grid of ~380px tiles, which
 * is the single biggest reason the section read as dense rather than premium.
 * A row gets the whole stage: the capture fills one full column edge to edge,
 * the copy gets `--panel-p` on all four sides, and the two alternate sides
 * down the page so the eye is handed left, right, left rather than scanning a
 * matrix. Below `lg` the row collapses to one column with the image on top.
 *
 * INTERACTION — the whole row opens the case study, via a stretched overlay
 * button rather than a wrapping one. A `<button>` takes phrasing content only,
 * so wrapping the `<article>`, `<h3>` and `<ul>` in one would be
 * non-conforming and would leave assistive-tech behaviour around the heading
 * undefined.
 *
 * Z-ORDER, which is load-bearing here: the copy column is `relative` with NO
 * z-index, so it never opens a stacking context of its own. That is what lets
 * the GitHub link's `z-20` outrank the overlay button's `z-10` in the panel's
 * context and stay independently clickable. Give the copy column a z-index and
 * the link silently stops working — the overlay wins as the later sibling.
 */
export function ProjectRow({
  project,
  index,
  reverse = false,
  onOpenCaseStudy,
}: {
  project: Project;
  /** Position in the list — rendered as the row's editorial numeral. */
  index: number;
  /** Puts the capture on the right. Alternated by the caller. */
  reverse?: boolean;
  onOpenCaseStudy: (project: Project) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Pointer halo. Writes two custom properties on the row only — no layout
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

  const metrics = project.metrics.slice(0, 2);
  const numeral = String(index).padStart(2, "0");

  return (
    <Panel
      as="article"
      tone="raised"
      interactive
      bloom={reverse ? "top-left" : "top-right"}
      className="group"
    >
      <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave}>
        {/* Sits behind the content but in front of the panel fill. */}
        <span aria-hidden="true" className="halo -z-10" />

        <div
          className={cn(
            "grid lg:min-h-[24rem]",
            reverse
              ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]"
              : "lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]",
          )}
        >
          {/* ── Capture, bled to the panel edge ─────────────────────────── */}
          <div
            className={cn(
              "relative min-h-[15rem] border-b border-line-subtle sm:min-h-[19rem] lg:min-h-full lg:border-b-0",
              reverse
                ? "lg:order-2 lg:border-l lg:border-line-subtle"
                : "lg:order-1 lg:border-r lg:border-line-subtle",
            )}
          >
            {/*
              The capture is STAGED, not bled: it sits inset on an accent bed
              with a rounded frame, shown whole.

              Cover-cropping was the obvious choice and it was wrong here. A
              row's media column is roughly square, while these captures are
              wide dashboards — filling it meant showing an arbitrary slice of
              a table, which reads as texture rather than as a product. A
              staged frame shows what the thing actually is, and it makes the
              five rows consistent regardless of whether the source is a
              desktop dashboard or a portrait phone shot.
            */}
            <div className="absolute inset-0 flex items-center justify-center p-[clamp(1.25rem,2.4vw,2.5rem)]">
              <div
                className="edge-lit relative w-full overflow-hidden rounded-xl border border-line shadow-e2"
                style={{ aspectRatio: "16 / 10" }}
              >
                <ProjectImage
                  project={project}
                  className="h-full w-full"
                  sizes="(max-width: 1024px) 92vw, 44vw"
                />
              </div>
            </div>

            {/* Fades the capture into the copy side so it reads as embedded in
                the panel rather than pasted onto it. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 hidden opacity-40 lg:block"
              style={{
                backgroundImage: `linear-gradient(to ${
                  reverse ? "left" : "right"
                }, transparent 45%, var(--surface-0))`,
              }}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 opacity-70 lg:hidden"
              style={{
                backgroundImage:
                  "linear-gradient(to top, var(--surface-0), transparent)",
              }}
            />
          </div>

          {/* ── Copy ────────────────────────────────────────────────────── */}
          <div
            className={cn(
              "relative flex min-w-0 flex-col justify-center p-[var(--panel-p)]",
              reverse ? "lg:order-1" : "lg:order-2",
            )}
          >
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
              <span className="label tnum text-fg-subtle">{numeral}</span>
              <span aria-hidden="true" className="hidden h-px w-8 bg-line sm:block" />
              <StatusChip status={project.status} />
            </div>

            <h3
              className="mt-6 font-semibold leading-[1.08] tracking-[var(--tracking-heading)] text-fg"
              style={{ fontSize: "clamp(1.55rem, 2.2vw, 2.15rem)" }}
            >
              {project.name}
            </h3>

            <p
              className="mt-5 max-w-xl leading-relaxed text-fg-muted"
              style={{ fontSize: "var(--text-lead)" }}
            >
              {project.summary}
            </p>

            {/* The two strongest numbers, at a size you can read across the
                room. `flex-col-reverse` shows the value above the label while
                the DOM keeps the conforming dt-then-dd order. */}
            <dl className="mt-9 flex flex-wrap gap-x-12 gap-y-6">
              {metrics.map((m) => (
                <div key={m.label} className="flex min-w-0 flex-col-reverse gap-2">
                  <dt className="label text-fg-subtle">{m.label}</dt>
                  <dd
                    className="tnum font-semibold leading-none tracking-[var(--tracking-heading)] text-fg"
                    style={{ fontSize: "clamp(1.6rem, 2.2vw, 2.25rem)" }}
                  >
                    {m.value}
                  </dd>
                </div>
              ))}
            </dl>

            <ul className="mt-9 flex flex-wrap gap-1.5">
              {project.stack.slice(0, 4).map((s) => (
                <li key={s.label}>
                  <Tag emphasis={s.emphasis}>{s.label}</Tag>
                </li>
              ))}
            </ul>

            <footer className="mt-9 flex items-center justify-between gap-4 border-t border-line-subtle pt-7">
              <span className="inline-flex items-center gap-2 font-medium text-accent">
                Case study
                <ArrowUpRightIcon
                  size={16}
                  className="transition-transform duration-[var(--dur-mid)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </span>

              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-20 inline-flex h-11 w-11 items-center justify-center rounded-full text-fg-subtle transition-colors duration-[var(--dur-mid)] hover:bg-surface-2 hover:text-fg"
                aria-label={`${project.name} source on GitHub`}
              >
                <GithubIcon size={18} />
              </a>
            </footer>
          </div>
        </div>

        {/* An accent hairline sweeping the row's base on hover. Transform only. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-px origin-left scale-x-0 bg-accent transition-transform duration-[var(--dur-slow)] ease-[var(--ease-out-expo)] group-hover:scale-x-100 group-focus-within:scale-x-100"
        />

        {/* Stretched hit area. Carries the accessible name for the whole row. */}
        <button
          type="button"
          onClick={() => onOpenCaseStudy(project)}
          className="absolute inset-0 z-10 rounded-3xl"
        >
          <span className="sr-only">Read the {project.name} case study</span>
        </button>
      </div>
    </Panel>
  );
}
