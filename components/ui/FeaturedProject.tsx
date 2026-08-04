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
 * The lead project, as one architectural panel — roughly 80vh on desktop.
 *
 * The composition is deliberately unequal and deliberately unboxed: the copy
 * takes the narrower left column with generous interior padding, and the
 * capture fills the wider right column edge to edge, running to the panel's
 * own boundary on three sides. That bleed is most of what separates this from
 * the previous version, which was the same content in two evenly-weighted
 * boxes inside a card.
 *
 * The gallery stays a thumbnail strip rather than a lightbox: the screenshots
 * are supporting evidence for the claims in the copy, so keeping them inline
 * beside that copy is worth more than a full-screen viewer. Here the strip
 * floats over the base of the capture, which is dead letterbox space for the
 * portrait phone shots this lead project actually has.
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

  // Portrait phone captures leave large empty margins inside a wide frame. An
  // accent-tinted bed makes that letterboxing read as an intentional device
  // stage rather than a mis-sized image.
  const accent = projectAccent[project.accent];
  const bedStyle = isContain
    ? {
        backgroundImage: `radial-gradient(120% 96% at 50% 0%, ${accent}33, transparent 74%)`,
      }
    : undefined;

  return (
    <Panel
      tone="float"
      bloom="top-right"
      sheen={false}
      className="lg:min-h-[min(48rem,80vh)]"
    >
      <div className="grid lg:min-h-[min(48rem,80vh)] lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
        {/* ── Copy ──────────────────────────────────────────────────────── */}
        <div className="relative order-2 flex flex-col justify-center p-[var(--panel-p)] lg:order-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <Eyebrow className="text-accent">Lead project</Eyebrow>
            <StatusChip status={project.status} />
          </div>

          <h3
            className="mt-7 font-semibold leading-[1.05] tracking-[var(--tracking-heading)] text-fg"
            style={{ fontSize: "clamp(1.9rem, 2.9vw, 2.85rem)" }}
          >
            {project.name}
          </h3>

          <p
            className="mt-5 max-w-xl leading-snug text-fg-muted"
            style={{ fontSize: "var(--text-lead)" }}
          >
            {project.tagline}
          </p>

          <p className="mt-6 max-w-xl text-[0.95rem] leading-relaxed text-fg-muted">
            {project.description}
          </p>

          {/* Two-up rather than a 4-up strip: at this column width four cells
              shrink both the number and the label to the point where neither
              carries. `flex-col-reverse` puts the value on top while keeping
              the conforming dt-then-dd order in the DOM. */}
          <dl className="mt-10 grid grid-cols-2 gap-x-10 gap-y-8 border-y border-line-subtle py-8">
            {project.metrics.map((m) => (
              <div key={m.label} className="flex min-w-0 flex-col-reverse gap-2">
                <dt className="label text-fg-subtle">{m.label}</dt>
                <dd
                  className="tnum font-semibold leading-none tracking-[var(--tracking-heading)] text-fg"
                  style={{ fontSize: "clamp(1.75rem, 2.4vw, 2.5rem)" }}
                >
                  {m.value}
                </dd>
              </div>
            ))}
          </dl>

          <ul className="mt-8 flex flex-wrap gap-1.5">
            {project.stack.map((s) => (
              <li key={s.label}>
                <Tag emphasis={s.emphasis}>{s.label}</Tag>
              </li>
            ))}
          </ul>

          <footer className="mt-9 flex flex-wrap items-center gap-3">
            {project.liveUrl && (
              <ButtonLink href={project.liveUrl} external size="lg" arrow>
                {project.liveLabel ?? "Open the app"}
              </ButtonLink>
            )}
            <Button variant="secondary" size="lg" onClick={() => onOpenCaseStudy(project)}>
              <BookOpenIcon size={16} />
              Case study
            </Button>
            <ButtonLink href={project.repoUrl} external variant="ghost" size="lg">
              <GithubIcon size={16} />
              Source
            </ButtonLink>
          </footer>
        </div>

        {/* ── Media, bled to the panel edge ─────────────────────────────── */}
        <div className="relative order-1 min-h-[22rem] sm:min-h-[28rem] lg:order-2 lg:min-h-full lg:border-l lg:border-line-subtle">
          <div className="absolute inset-0 overflow-hidden" style={bedStyle}>
            {current ? (
              <Image
                key={current.src}
                src={current.src}
                alt={current.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 54vw"
                className={objectClass}
              />
            ) : (
              <ProjectImage
                project={project}
                className="h-full w-full"
                sizes="(max-width: 1024px) 100vw, 54vw"
              />
            )}
          </div>

          {shots.length > 1 && (
            <>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 opacity-90"
                style={{
                  backgroundImage:
                    "linear-gradient(to top, var(--surface-0), transparent)",
                }}
              />
              <ul
                className="absolute inset-x-0 bottom-0 flex flex-wrap gap-3 p-[clamp(1rem,2vw,1.75rem)]"
                aria-label={`${project.name} screenshots`}
              >
                {shots.map((s, i) => (
                  <li key={s.src}>
                    <button
                      type="button"
                      onClick={() => setActive(i)}
                      aria-label={s.alt}
                      aria-current={i === active}
                      className={cn(
                        "relative block h-14 w-[5.5rem] overflow-hidden rounded-lg border",
                        "transition-[border-color,opacity,transform] duration-[var(--dur-mid)] ease-[var(--ease-out-expo)]",
                        // Transparent 44px-tall hit area around a 56px thumbnail.
                        "before:absolute before:left-1/2 before:top-1/2 before:h-11 before:w-full before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']",
                        i === active
                          ? "border-accent-line"
                          : "border-line-subtle opacity-60 hover:-translate-y-0.5 hover:border-line hover:opacity-100",
                      )}
                    >
                      <Image
                        src={s.src}
                        alt=""
                        fill
                        sizes="88px"
                        className="object-cover object-top"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </Panel>
  );
}
