"use client";

import Image from "next/image";
import { useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Tag, StatusChip } from "@/components/ui/Tag";
import { ButtonLink } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { StoreBadge } from "@/components/ui/StoreBadge";
import { GithubIcon, XIcon } from "@/components/ui/icons";
import { DUR, easeOutExpo } from "@/lib/motion";
import { useFocusTrap, useScrollLock } from "@/lib/useFocusTrap";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";
import type { Project } from "@/data/projects";

/**
 * The case study, as a full product presentation.
 *
 * WHAT WAS WRONG. This was a 42rem drawer sliding in from the right, holding
 * seven blocks of prose and nothing else. It opened correctly and it read as
 * though nothing had happened — you clicked a large, image-led card and got a
 * column of text in a sidebar. Worse, every project already had a hero capture
 * and a four-image gallery sitting in `data/projects.ts` and on disk, and this
 * component rendered exactly none of them. The screenshots existed; the case
 * study just never asked for them.
 *
 * It is now the full viewport, and it is structured like a product page:
 *
 *   1. a hero capture at the top, large enough to actually show the product
 *   2. the pitch, the numbers, and every way to GET the thing — live app,
 *      store badges, source — above the fold
 *   3. the gallery, captioned, because a screenshot with no caption is
 *      decoration
 *   4. then the engineering: problem, architecture, decisions, challenges,
 *      what it taught me, and what it still isn't
 *
 * The order is deliberate. A reader who only sees the first screen should
 * already know what the thing is, that it is real, and how to open it. The
 * engineering is what they stay for, not what they have to wade through.
 *
 * `aria-modal="true"` is a promise that the rest of the page is unavailable,
 * so it is kept: `useFocusTrap` cycles Tab inside the dialog and restores
 * focus to the card that opened it.
 */
export function CaseStudyPanel({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const reduced = useReducedMotionPref();
  const panelRef = useRef<HTMLElement>(null);
  const open = Boolean(project);

  const handleEscape = useCallback(() => onClose(), [onClose]);
  useFocusTrap(panelRef, open, handleEscape);
  useScrollLock(open);

  return (
    <AnimatePresence>
      {project && (
        <>
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DUR.mid }}
            onClick={onClose}
            aria-hidden="true"
            className="fixed inset-0 z-[60] bg-[color-mix(in_oklab,var(--surface-0)_86%,transparent)] backdrop-blur-md"
          />

          <motion.aside
            key="panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="case-study-title"
            tabIndex={-1}
            /* Rises from the bottom rather than sliding from the side. A
               full-viewport surface arriving from the right reads as a page
               swap; arriving from below reads as a sheet, which is what it is
               — and it is the same gesture on a phone. */
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 42 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 42 }}
            transition={{ duration: DUR.slow, ease: easeOutExpo }}
            className="fixed inset-0 z-[61] overflow-y-auto overscroll-contain"
            style={{ background: "var(--surface-0)" }}
          >
            {/* ── Sticky chrome ──────────────────────────────────────── */}
            <header className="sticky top-0 z-20 border-b border-line-subtle bg-surface-3/95 backdrop-blur-md">
              <div className="mx-auto flex w-full max-w-[68rem] items-center justify-between gap-4 px-[var(--gutter)] py-3.5">
                <div className="flex min-w-0 items-center gap-3">
                  <Eyebrow as="span">Case study</Eyebrow>
                  <span aria-hidden="true" className="hairline hidden w-8 sm:block" />
                  <p className="truncate text-[0.9375rem] font-medium text-fg">
                    {project.name}
                  </p>
                </div>
                <IconButton label="Close case study" onClick={onClose} data-autofocus size="sm">
                  <XIcon size={16} />
                </IconButton>
              </div>
            </header>

            {/* ── Hero capture ───────────────────────────────────────── */}
            {project.media?.image && (
              <div className="relative mx-auto w-full max-w-[68rem] px-[var(--gutter)] pt-[var(--gutter)]">
                {/*
                  A portrait phone capture inside a 16:9 hero leaves two thirds
                  of the frame empty, and empty reads as broken. Contained
                  media gets a shallower frame AND a pool of light behind it,
                  so the negative space reads as a lit stage — which is how
                  phone screenshots are presented in every product page worth
                  copying — rather than as a picture that failed to load.
                */}
                <div
                  className={
                    "relative w-full overflow-hidden rounded-2xl border border-line " +
                    (project.media.fit === "contain"
                      ? "aspect-[16/11]"
                      : "aspect-[16/9]")
                  }
                  style={{ background: "var(--panel-solid)" }}
                >
                  {project.media.fit === "contain" && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute left-1/2 top-1/2 h-[86%] w-[52%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] blur-[70px]"
                      style={{
                        background:
                          "radial-gradient(closest-side, var(--glow-strong), var(--glow-blue) 48%, transparent 76%)",
                      }}
                    />
                  )}
                  <Image
                    src={project.media.image}
                    alt={project.media.alt ?? `${project.name} interface`}
                    fill
                    sizes="(max-width: 1100px) 100vw, 68rem"
                    className={
                      project.media.fit === "contain"
                        ? "object-contain p-4"
                        : "object-cover object-top"
                    }
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4"
                    style={{
                      background:
                        "linear-gradient(to top, var(--surface-0), transparent)",
                      opacity: 0.7,
                    }}
                  />
                </div>
              </div>
            )}

            <div className="mx-auto w-full max-w-[68rem] px-[var(--gutter)] pb-24 pt-10">
              {/* ── The pitch ────────────────────────────────────────── */}
              <div className="flex flex-wrap items-center gap-2.5">
                <StatusChip status={project.status} />
                <span className="label text-fg-subtle">{project.context}</span>
              </div>

              <h2
                id="case-study-title"
                className="mt-5 font-semibold leading-[1.05] tracking-[var(--tracking-heading)] text-fg"
                style={{ fontSize: "var(--text-h2)" }}
              >
                {project.name}
              </h2>
              <p
                className="mt-4 max-w-3xl leading-relaxed text-fg-muted"
                style={{ fontSize: "var(--text-lead)" }}
              >
                {project.tagline}
              </p>
              <p className="mt-5 max-w-3xl leading-relaxed text-fg-muted">
                {project.description}
              </p>

              {/* ── Every way to get it ──────────────────────────────── */}
              <div className="mt-9 flex flex-wrap items-center gap-3">
                {project.liveUrl && (
                  <ButtonLink href={project.liveUrl} external arrow>
                    {project.liveLabel ?? "Open the app"}
                  </ButtonLink>
                )}
                <ButtonLink href={project.repoUrl} external variant="secondary">
                  <GithubIcon size={15} />
                  View source
                </ButtonLink>
              </div>

              {project.stores && project.stores.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-3">
                  {project.stores.map((s) => (
                    <li key={s.platform}>
                      <StoreBadge listing={s} />
                    </li>
                  ))}
                </ul>
              )}

              {/* ── The numbers ──────────────────────────────────────── */}
              <dl className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {project.metrics.map((m) => (
                  <div
                    key={m.label}
                    className="rounded-xl border border-line-subtle bg-surface-1 px-4 py-3.5"
                  >
                    <dd className="tnum text-2xl font-semibold leading-none text-fg">
                      {m.value}
                    </dd>
                    <dt className="label mt-2 text-fg-subtle">{m.label}</dt>
                  </div>
                ))}
              </dl>

              {/* ── Gallery ──────────────────────────────────────────── */}
              {project.media?.gallery && project.media.gallery.length > 0 && (
                <section className="mt-14">
                  <Eyebrow rule>Inside the product</Eyebrow>
                  {/* Captioned, because a screenshot nobody can read is
                      decoration. `<figure>`/`<figcaption>` so the caption is
                      bound to its image for assistive tech too. */}
                  <ul className="mt-6 grid gap-5 sm:grid-cols-2">
                    {project.media.gallery.map((shot) => (
                      <li key={shot.src}>
                        <figure>
                          <div
                            className={
                              "relative w-full overflow-hidden rounded-xl border border-line-subtle " +
                              // Same reasoning as the hero: a portrait capture
                              // needs a taller frame or it sits in a pool of
                              // dead space.
                              (project.media?.fit === "contain"
                                ? "aspect-[4/3]"
                                : "aspect-[16/10]")
                            }
                            style={{ background: "var(--panel-solid)" }}
                          >
                            {project.media?.fit === "contain" && (
                              <span
                                aria-hidden="true"
                                className="pointer-events-none absolute left-1/2 top-1/2 h-[80%] w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] blur-[50px]"
                                style={{
                                  background:
                                    "radial-gradient(closest-side, var(--glow-strong), transparent 74%)",
                                }}
                              />
                            )}
                            <Image
                              src={shot.src}
                              alt={shot.alt}
                              fill
                              loading="lazy"
                              sizes="(max-width: 640px) 100vw, 33rem"
                              className={
                                project.media?.fit === "contain"
                                  ? "object-contain p-3"
                                  : "object-cover object-top"
                              }
                            />
                          </div>
                          <figcaption className="mt-2.5 text-[0.8125rem] leading-relaxed text-fg-subtle">
                            {shot.alt}
                          </figcaption>
                        </figure>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* ── The engineering ──────────────────────────────────── */}
              <div className="mt-16 grid gap-x-14 gap-y-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <Block title="The problem">
                  <p className="leading-relaxed text-fg-muted">
                    {project.caseStudy.problem}
                  </p>
                </Block>
                <Block title="Architecture">
                  <p className="leading-relaxed text-fg-muted">
                    {project.caseStudy.architecture}
                  </p>
                </Block>
              </div>

              <Block title="Engineering decisions" className="mt-14">
                <ul className="grid gap-4 sm:grid-cols-2">
                  {project.caseStudy.decisions.map((d) => (
                    <li
                      key={d.title}
                      className="rounded-xl border border-line-subtle bg-surface-1 p-5"
                    >
                      <h4 className="text-[0.95rem] font-medium text-fg">{d.title}</h4>
                      <p className="mt-2 text-sm leading-relaxed text-fg-muted">{d.body}</p>
                    </li>
                  ))}
                </ul>
              </Block>

              <div className="mt-14 grid gap-x-14 gap-y-12 lg:grid-cols-2">
                <Block title="Challenges">
                  <List items={project.caseStudy.challenges} marker="accent" />
                </Block>
                <Block title="What I took from it">
                  <List items={project.caseStudy.learned} marker="subtle" />
                </Block>
              </div>

              {project.caseStudy.honestNote && (
                <Block title="What this isn't" className="mt-14">
                  <div className="rounded-xl border border-line bg-surface-1 p-5">
                    <p className="leading-relaxed text-fg-muted">
                      {project.caseStudy.honestNote}
                    </p>
                  </div>
                </Block>
              )}

              <Block title="Stack" className="mt-14">
                <ul className="flex flex-wrap gap-1.5">
                  {project.stack.map((s) => (
                    <li key={s.label}>
                      <Tag emphasis={s.emphasis}>{s.label}</Tag>
                    </li>
                  ))}
                </ul>
              </Block>

              {/* Closing actions, so a reader who has read to the bottom does
                  not have to scroll back up to act on it. */}
              <div className="mt-16 flex flex-wrap items-center gap-3 border-t border-line-subtle pt-10">
                {project.liveUrl && (
                  <ButtonLink href={project.liveUrl} external arrow>
                    {project.liveLabel ?? "Open the app"}
                  </ButtonLink>
                )}
                <ButtonLink href={project.repoUrl} external variant="secondary">
                  <GithubIcon size={15} />
                  View source
                </ButtonLink>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Block({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <h3 className="label mb-4 text-fg-subtle">{title}</h3>
      {children}
    </section>
  );
}

function List({ items, marker }: { items: string[]; marker: "accent" | "subtle" }) {
  return (
    <ul className="space-y-3.5">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span
            aria-hidden="true"
            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
            style={{
              background: marker === "accent" ? "var(--accent)" : "var(--fg-subtle)",
            }}
          />
          <span className="text-[0.9375rem] leading-relaxed text-fg-muted">{item}</span>
        </li>
      ))}
    </ul>
  );
}
