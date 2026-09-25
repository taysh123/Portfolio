"use client";

import { Tag, StatusChip } from "@/components/ui/Tag";
import { ProjectImage } from "@/components/ui/ProjectImage";
import { Button, ButtonLink } from "@/components/ui/Button";
import { GithubIcon, BookOpenIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { PrivateRepoLabel } from "@/components/ui/PrivateRepoLabel";
import { publicRepoUrl, type Project } from "@/data/projects";

/**
 * One project, as a card.
 *
 * Shared by the desktop 3D stage and the mobile deck. Those two presentations
 * are deliberately different designs — an arc you drag versus a snap-scroller
 * you flick — but the card itself is the same object in both, and it should
 * stay that way: the moment they diverge, one of them starts quietly losing
 * whatever the other gains.
 *
 * Opaque by design (`--panel-solid`). On the stage a card has to occlude the
 * ones behind it; in the deck it has to occlude the peek of its neighbours.
 *
 * Interactive affordances are never hover-only — every action here is a real
 * control with a label, because on the deck there is no hover at all.
 */
export function ProjectCard({
  project,
  active,
  onOpenCaseStudy,
  onFocusCapture,
  sizes,
}: {
  project: Project;
  /** Emphasis only. Never used to gate access to anything. */
  active: boolean;
  onOpenCaseStudy: (project: Project) => void;
  onFocusCapture?: () => void;
  sizes: string;
}) {
  const metrics = project.metrics.slice(0, 2);

  return (
    <article
      onFocusCapture={onFocusCapture}
      className={cn(
        "edge-lit relative flex h-full flex-col overflow-hidden rounded-3xl border transition-[border-color,box-shadow] duration-[var(--dur-slow)]",
        active ? "border-accent-line shadow-e3" : "border-line shadow-e2",
      )}
      style={{ background: "var(--panel-solid)" }}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-line-subtle">
        <ProjectImage project={project} className="h-full w-full" sizes={sizes} />
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
        <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-fg-muted">
          {project.summary}
        </p>

        <dl className="mt-5 grid grid-cols-2 gap-3">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="rounded-lg border border-line-subtle bg-surface-1 px-3 py-2.5"
            >
              <dd className="tnum text-lg font-semibold leading-none text-fg">
                {m.value}
              </dd>
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
            <ButtonLink
              href={project.liveUrl}
              external
              variant="secondary"
              size="sm"
              arrow
            >
              {project.liveLabel ?? "Open"}
            </ButtonLink>
          )}
          {publicRepoUrl(project) ? (
            <ButtonLink
              href={publicRepoUrl(project)!}
              external
              variant="ghost"
              size="sm"
              className="ml-auto"
              aria-label={`${project.name} source on GitHub`}
            >
              <GithubIcon size={15} />
            </ButtonLink>
          ) : (
            <PrivateRepoLabel className="ml-auto" />
          )}
        </footer>
      </div>
    </article>
  );
}
