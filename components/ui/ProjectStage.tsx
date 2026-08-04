"use client";

import { useCallback, useRef, useState } from "react";
import { Tag, StatusChip } from "@/components/ui/Tag";
import { ProjectImage } from "@/components/ui/ProjectImage";
import { IconButton } from "@/components/ui/IconButton";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ArrowLeftIcon, ArrowRightIcon, GithubIcon, BookOpenIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import type { Project } from "@/data/projects";

/**
 * The project showcase: cards on an arc in real perspective.
 *
 * WHY THIS IS NOT THE OLD CAROUSEL. A 3D carousel was removed from this site
 * once, for four specific reasons, and every one of them is designed out here
 * rather than re-inherited:
 *
 *   1. It auto-advanced. That is a WCAG 2.2.2 (Pause/Stop/Hide) failure and it
 *      fights the reader. Nothing here moves unless a person moves it.
 *   2. Its live region re-announced every 4.2 seconds, forever. This one only
 *      announces user-initiated changes — which is safe precisely because
 *      there are no other kinds.
 *   3. It animated `filter: blur()` on six image-bearing cards per frame, a
 *      paint-time effect. Depth here is scale, opacity, shadow and rotation —
 *      all compositor properties.
 *   4. It nested `<article>`, `<h3>` and `<ul>` inside a `<button>`, which is
 *      invalid: a button takes phrasing content only. Cards are plain
 *      articles; the actions inside them are the interactive elements.
 *
 * Off-axis cards are `inert`, so Tab never lands on something the reader
 * cannot see. The whole component is desktop-and-motion-only — `Projects`
 * renders the row list instead under reduced motion or on small screens,
 * which is a genuinely good experience rather than a degraded one.
 */

/**
 * Step geometry.
 *
 * `x` is a percentage of the CARD's own width, not the stage's — that is what
 * `translateX(%)` resolves against, and getting it wrong is why the first
 * attempt stacked every card on top of the next. At 64% a neighbour clears the
 * active card by about a third of itself, which is the peek that makes an arc
 * read as an arc.
 */
const GEOMETRY = {
  x: 64, // % of the card's own width per step
  z: 220, // px pushed back per step
  rotate: 30, // degrees of yaw per step
  scaleStep: 0.11,
  fadeStep: 0.4,
  /** Cards further than this from the active one are not rendered at all. */
  visible: 2,
} as const;

export function ProjectStage({
  projects,
  onOpenCaseStudy,
}: {
  projects: Project[];
  onOpenCaseStudy: (project: Project) => void;
}) {
  const [active, setActive] = useState(0);
  const [drag, setDrag] = useState(0);
  // `dragging` is state, not the ref, because the render path needs it: refs
  // are not render inputs, and reading one here would not re-run the render
  // that turns the transition back on when a drag ends.
  const [dragging, setDragging] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const pointer = useRef<{ id: number; x: number } | null>(null);

  const count = projects.length;
  const clamp = useCallback(
    (i: number) => Math.max(0, Math.min(count - 1, i)),
    [count],
  );

  const go = useCallback((delta: number) => setActive((i) => clamp(i + delta)), [clamp]);

  // ── Pointer drag ──────────────────────────────────────────────────────
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    pointer.current = { id: e.pointerId, x: e.clientX };
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const p = pointer.current;
    if (!p || p.id !== e.pointerId) return;
    const width = stageRef.current?.clientWidth ?? 1;
    // One card per ~38% of the stage width feels like the card is under the
    // finger rather than trailing it.
    setDrag(((e.clientX - p.x) / width) * -2.6);
  };

  const endDrag = () => {
    if (!pointer.current) return;
    pointer.current = null;
    setDragging(false);
    setActive((i) => clamp(Math.round(i + drag)));
    setDrag(0);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const map: Record<string, number | "home" | "end"> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      Home: "home",
      End: "end",
    };
    const action = map[e.key];
    if (action === undefined) return;
    e.preventDefault();
    if (action === "home") setActive(0);
    else if (action === "end") setActive(count - 1);
    else go(action);
  };

  const position = active + drag;

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label="Projects"
      className="relative"
    >
      {/* ── Stage ──────────────────────────────────────────────────────── */}
      <div
        ref={stageRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
        className="relative h-[clamp(34rem,52vw,42rem)] cursor-grab touch-pan-y select-none active:cursor-grabbing"
        style={{ perspective: "1900px" }}
      >
        {/* Spotlight the active card sits in. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[46%] h-[62%] w-[54%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] blur-[70px]"
          style={{
            background:
              "radial-gradient(closest-side, var(--glow-strong), var(--glow-blue) 46%, transparent 76%)",
          }}
        />

        <div
          className="absolute inset-0"
          style={{ transformStyle: "preserve-3d" }}
        >
          {projects.map((project, i) => {
            const offset = i - position;
            const dist = Math.abs(offset);
            if (dist > GEOMETRY.visible + 0.5) return null;

            const isActive = Math.round(position) === i;
            const dir = Math.sign(offset);

            return (
              <div
                key={project.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${count}`}
                aria-hidden={!isActive}
                inert={!isActive}
                className={cn(
                  "absolute left-1/2 top-1/2 w-[clamp(19rem,25vw,23rem)]",
                  // No transition while the finger is down — the card should
                  // track the pointer, then ease when released.
                  !dragging &&
                    "transition-[transform,opacity] duration-[var(--dur-slow)] ease-[var(--ease-out-expo)]",
                )}
                style={{
                  transform: [
                    "translate(-50%, -50%)",
                    `translateX(${offset * GEOMETRY.x}%)`,
                    `translateZ(${-dist * GEOMETRY.z}px)`,
                    `rotateY(${-dir * Math.min(dist, GEOMETRY.visible) * GEOMETRY.rotate}deg)`,
                    `scale(${1 - Math.min(dist, GEOMETRY.visible) * GEOMETRY.scaleStep})`,
                  ].join(" "),
                  opacity: Math.max(0, 1 - dist * GEOMETRY.fadeStep),
                  zIndex: 100 - Math.round(dist * 10),
                  transformStyle: "preserve-3d",
                }}
              >
                <Card
                  project={project}
                  active={isActive}
                  onOpenCaseStudy={onOpenCaseStudy}
                  onFocusRequest={() => setActive(i)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Controls ───────────────────────────────────────────────────── */}
      <div className="mt-8 flex items-center justify-center gap-5">
        <IconButton label="Previous project" onClick={() => go(-1)} disabled={active === 0}>
          <ArrowLeftIcon size={18} />
        </IconButton>

        <ol className="flex items-center gap-2.5">
          {projects.map((p, i) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show ${p.name}`}
                aria-current={i === active}
                className={cn(
                  "relative block h-1.5 rounded-full transition-all duration-[var(--dur-slow)] ease-[var(--ease-out-expo)]",
                  // Transparent 44px hit target over a 6px visual.
                  "before:absolute before:left-1/2 before:top-1/2 before:h-11 before:w-6 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']",
                  i === active ? "w-8 bg-accent" : "w-1.5 bg-fg-subtle/45 hover:bg-fg-subtle",
                )}
              />
            </li>
          ))}
        </ol>

        <IconButton
          label="Next project"
          onClick={() => go(1)}
          disabled={active === count - 1}
        >
          <ArrowRightIcon size={18} />
        </IconButton>
      </div>

      <p className="label mt-5 text-center text-fg-subtle">
        Drag, or use the arrow keys
      </p>

      {/*
        Announces only what a person just did. Safe as a live region precisely
        because nothing advances on its own.
      */}
      <p className="sr-only" role="status" aria-live="polite">
        Project {active + 1} of {count}: {projects[active].name}
      </p>
    </div>
  );
}

function Card({
  project,
  active,
  onOpenCaseStudy,
  onFocusRequest,
}: {
  project: Project;
  active: boolean;
  onOpenCaseStudy: (project: Project) => void;
  onFocusRequest: () => void;
}) {
  const metrics = project.metrics.slice(0, 2);

  return (
    <article
      onFocusCapture={onFocusRequest}
      className={cn(
        "edge-lit relative flex flex-col overflow-hidden rounded-3xl border transition-[border-color,box-shadow] duration-[var(--dur-slow)]",
        active ? "border-accent-line shadow-e3" : "border-line shadow-e2",
      )}
      // Opaque: a stacked card has to occlude the ones behind it.
      style={{ background: "var(--panel-solid)" }}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-line-subtle">
        <ProjectImage
          project={project}
          className="h-full w-full"
          sizes="(max-width: 1024px) 80vw, 24rem"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
          style={{
            background: "linear-gradient(to top, var(--surface-0), transparent)",
            opacity: 0.55,
          }}
        />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip status={project.status} />
        </div>

        <h3 className="mt-3.5 text-2xl font-semibold tracking-[var(--tracking-heading)] text-fg">
          {project.name}
        </h3>
        <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-fg-muted">{project.summary}</p>

        <dl className="mt-5 grid grid-cols-2 gap-3">
          {metrics.map((m) => (
            <div key={m.label} className="rounded-lg border border-line-subtle bg-surface-1 px-3 py-2.5">
              <dd className="tnum text-lg font-semibold leading-none text-fg">{m.value}</dd>
              <dt className="label mt-1.5 text-fg-subtle">{m.label}</dt>
            </div>
          ))}
        </dl>

        <ul className="mt-5 flex flex-wrap gap-1.5">
          {project.stack.slice(0, 3).map((s) => (
            <li key={s.label}>
              <Tag emphasis={s.emphasis}>{s.label}</Tag>
            </li>
          ))}
        </ul>

        <footer className="mt-auto flex flex-wrap items-center gap-2.5 pt-6">
          <Button size="sm" onClick={() => onOpenCaseStudy(project)}>
            <BookOpenIcon size={14} />
            Case study
          </Button>
          {project.liveUrl && (
            <ButtonLink href={project.liveUrl} external variant="secondary" size="sm" arrow>
              {project.liveLabel ?? "Open"}
            </ButtonLink>
          )}
          <ButtonLink
            href={project.repoUrl}
            external
            variant="ghost"
            size="sm"
            className="ml-auto"
            aria-label={`${project.name} source on GitHub`}
          >
            <GithubIcon size={15} />
          </ButtonLink>
        </footer>
      </div>
    </article>
  );
}
