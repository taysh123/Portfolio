"use client";

import { useState } from "react";
import Image from "next/image";
import { Panel } from "@/components/ui/Panel";
import { Tag, StatusChip } from "@/components/ui/Tag";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ProjectImage } from "@/components/ui/ProjectImage";
import { projectAccent } from "@/lib/tokens";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { GithubIcon, BookOpenIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import type { Project } from "@/data/projects";

/**
 * The lead project — given real estate proportional to how much it proves.
 *
 * The gallery is a thumbnail strip rather than a lightbox: the screenshots are
 * supporting evidence for the claims in the copy, so keeping them inline next
 * to that copy is worth more than a full-screen viewer.
 */
export function FeaturedProject({
  project,
  onOpenCaseStudy,
}: {
  project: Project;
  onOpenCaseStudy: (project: Project) => void;
}) {
  const shots = [
    ...(project.media?.image
      ? [{ src: project.media.image, alt: project.media.alt ?? project.name }]
      : []),
    ...(project.media?.gallery ?? []),
  ];
  const [active, setActive] = useState(0);
  const current = shots[active];
  const isContain = (project.media?.fit ?? "cover") === "contain";
  const objectClass = isContain ? "object-contain" : "object-cover object-top";

  // Portrait phone captures leave large empty margins inside a 16:10 frame.
  // An accent-tinted bed makes that letterboxing read as an intentional device
  // stage rather than a mis-sized image.
  const accent = projectAccent[project.accent];
  const bedStyle = isContain
    ? {
        backgroundImage: `radial-gradient(130% 100% at 50% 0%, ${accent}33, transparent 72%)`,
      }
    : undefined;

  return (
    <Panel tone="raised" bloom="top-right" className="p-4 sm:p-6 lg:p-8">
      <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10">
        {/* ── Media ─────────────────────────────────────────────────────── */}
        <div>
          <div
            className="group relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-line"
            style={bedStyle}
          >
            {current ? (
              <Image
                key={current.src}
                src={current.src}
                alt={current.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 620px"
                preload
                className={objectClass}
              />
            ) : (
              <ProjectImage
                project={project}
                className="h-full w-full"
                sizes="(max-width: 1024px) 100vw, 620px"
              />
            )}
          </div>

          {shots.length > 1 && (
            <ul className="mt-3 flex gap-2.5" aria-label={`${project.name} screenshots`}>
              {shots.map((s, i) => (
                <li key={s.src}>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={s.alt}
                    aria-current={i === active}
                    className={cn(
                      "relative h-12 w-[4.5rem] overflow-hidden rounded-lg border transition-colors",
                      "after:absolute after:left-1/2 after:top-1/2 after:h-11 after:w-full after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']",
                      i === active
                        ? "border-accent-line"
                        : "border-line-subtle opacity-70 hover:border-line hover:opacity-100",
                    )}
                  >
                    <Image src={s.src} alt="" fill sizes="72px" className="object-cover object-top" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Detail ────────────────────────────────────────────────────── */}
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <Eyebrow className="text-accent">Lead project</Eyebrow>
            <StatusChip status={project.status} />
          </div>

          <h3 className="mt-4 text-2xl font-semibold tracking-[var(--tracking-heading)] text-fg sm:text-3xl">
            {project.name}
          </h3>
          <p className="mt-2 text-fg-muted" style={{ fontSize: "var(--text-lead)" }}>
            {project.tagline}
          </p>
          <p className="mt-4 text-[0.95rem] leading-relaxed text-fg-muted">
            {project.description}
          </p>

          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {project.metrics.map((m) => (
              <div key={m.label} className="rounded-lg border border-line-subtle bg-surface-1 px-3 py-2.5">
                <dd className="tnum text-lg font-semibold text-fg">{m.value}</dd>
                <dt className="label mt-1 text-fg-subtle">{m.label}</dt>
              </div>
            ))}
          </dl>

          <ul className="mt-6 flex flex-wrap gap-1.5">
            {project.stack.map((s) => (
              <li key={s.label}>
                <Tag emphasis={s.emphasis}>{s.label}</Tag>
              </li>
            ))}
          </ul>

          <footer className="mt-7 flex flex-wrap items-center gap-3">
            {project.liveUrl && (
              <ButtonLink href={project.liveUrl} external arrow>
                {project.liveLabel ?? "Open the app"}
              </ButtonLink>
            )}
            <Button variant="secondary" onClick={() => onOpenCaseStudy(project)}>
              <BookOpenIcon size={15} />
              Case study
            </Button>
            <ButtonLink href={project.repoUrl} external variant="ghost">
              <GithubIcon size={15} />
              Source
            </ButtonLink>
          </footer>
        </div>
      </div>
    </Panel>
  );
}
