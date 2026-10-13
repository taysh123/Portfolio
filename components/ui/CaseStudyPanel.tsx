"use client";

import Image from "next/image";
import { useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Tag, StatusChip } from "@/components/ui/Tag";
import { ButtonLink } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { StoreBadge } from "@/components/ui/StoreBadge";
import { GithubIcon, XIcon } from "@/components/ui/icons";
import { DUR, easeOutExpo } from "@/lib/motion";
import { useFocusTrap, useScrollLock } from "@/lib/useFocusTrap";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";
import { PrivateRepoLabel } from "@/components/ui/PrivateRepoLabel";
import { publicRepoUrl, repoLabel, type Project } from "@/data/projects";

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
/** The surface a project's captures sit on: its plate in the work chapters (M10), or the raised surface. */
function plateOf(id: string) {
  return ({ poker: "var(--plate-poker)", aegis: "#05070c", developeros: "var(--plate-dos)", "gravity-flow": "var(--plate-gf)" } as Record<string, string>)[id] ?? "#0b0e14";
}

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
            className="fixed inset-0 z-[60] bg-[color-mix(in_oklab,var(--bg)_86%,transparent)] backdrop-blur-md"
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
            /* `overscroll-contain`: the page behind never takes over at the panel's ends. */
            className="fixed inset-0 z-[61] overflow-y-auto overscroll-contain"
            style={{ background: "var(--bg)" }}
          >
            {/* ── Sticky chrome ──────────────────────────────────────── */}
            <header className="sticky top-0 z-20 border-b border-line bg-raised">
              <div className="mx-auto flex w-full max-w-[68rem] items-center justify-between gap-4 px-[var(--gutter)] py-3.5">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="text-[0.9375rem] text-fg-subtle">Case study</span>
                  <span aria-hidden="true" className="text-fg-subtle">/</span>
                  <p className="truncate text-[0.9375rem] font-medium text-fg">
                    {project.name}
                  </p>
                </div>
                <IconButton label="Close case study" onClick={onClose} data-autofocus size="sm">
                  <XIcon size={16} />
                </IconButton>
              </div>
            </header>

            {/* ── Hero capture, on the product's own plate (M10) ─────── */}
            {project.media?.image && (
              <div className="relative mx-auto w-full max-w-[68rem] px-[var(--gutter)] pt-[var(--gutter)]">
                <div
                  className={"relative w-full overflow-hidden rounded-2xl " + (project.media.fit === "contain" ? "aspect-[16/11]" : "aspect-[16/9]")}
                  style={{ background: plateOf(project.id) }}
                >
                  <Image
                    src={project.media.image}
                    alt={project.media.alt ?? `${project.name} interface`}
                    unoptimized={project.media.direct}
                    fill
                    // The first thing in view when the panel opens (it mounts on open): lazy left it blank for a beat.
                    loading="eager"
                    fetchPriority="high"
                    sizes="(max-width: 1100px) 100vw, 68rem"
                    className={project.media.fit === "contain" ? "object-contain p-6" : "object-cover object-top"}
                  />
                </div>
              </div>
            )}

            <div className="mx-auto w-full max-w-[68rem] px-[var(--gutter)] pb-24 pt-10">
              {/* ── The pitch ────────────────────────────────────────── */}
              <div className="flex flex-wrap items-center gap-2.5">
                <StatusChip status={project.status} />
                <span className="text-[0.9375rem] text-fg-subtle">{project.context}</span>
              </div>

              <h2
                id="case-study-title"
                className="mt-5 font-semibold leading-[1.02] tracking-[var(--tracking-display)] text-fg"
                style={{ fontSize: "var(--text-h2)" }}
              >
                {project.name}
              </h2>
              <p className="mt-4 max-w-[38em] leading-relaxed text-fg-muted" style={{ fontSize: "var(--text-lead)" }}>
                {project.tagline}
              </p>
              <p className="mt-5 max-w-[42em] leading-relaxed text-fg-muted">{project.description}</p>

              {/* ── The facts: one quiet line, not tiles ─────────────── */}
              {project.metrics.length > 0 && (
                <dl className="mt-6 flex max-w-[48em] flex-wrap gap-x-5 gap-y-1.5 border-t border-line pt-5 text-[0.9375rem] text-fg-muted">
                  {project.metrics.map((m) => (
                    <div key={m.label} className="flex gap-1.5">
                      {/* dt before dd (a valid group, read label-then-value); row-reverse shows the value first. */}
                      <dt className="order-2">{m.label}</dt>
                      <dd className="order-1 tnum font-semibold text-fg">{m.value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {/* ── Every way to get it ──────────────────────────────── */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {project.liveUrl && (
                  <ButtonLink href={project.liveUrl} external arrow>
                    {project.liveLabel ?? "Open the app"}
                  </ButtonLink>
                )}
                {publicRepoUrl(project) ? (
                  <ButtonLink href={publicRepoUrl(project)!} external variant="secondary">
                    <GithubIcon size={15} />
                    View source
                  </ButtonLink>
                ) : (
                  <PrivateRepoLabel className="px-2" label={repoLabel(project)} />
                )}
              </div>

              {project.stores && project.stores.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-3">
                  {project.stores.map((s) => (
                    <li key={s.platform}>
                      <StoreBadge listing={s} app={project.name} />
                    </li>
                  ))}
                </ul>
              )}

              {/* ── Gallery ──────────────────────────────────────────── */}
              {project.media?.gallery && project.media.gallery.length > 0 && (
                <Block title="Inside the product" className="mt-14">
                  {/* Captioned, because a screenshot nobody can read is decoration. */}
                  <ul className="grid gap-5 sm:grid-cols-2">
                    {project.media.gallery.map((shot, i, all) => {
                      // An odd last shot spans both columns rather than sitting alone beside a gap.
                      const wide = all.length % 2 === 1 && i === all.length - 1;
                      return (
                      <li key={shot.src} className={wide ? "sm:col-span-2" : undefined}>
                        <figure>
                          <div
                            className={
                              "relative w-full overflow-hidden rounded-xl " +
                              // A portrait capture needs a taller frame; a wide (spanning) shot is a banner (8:3, the
                              // ratio of Aegis's architecture diagram).
                              (project.media?.fit === "contain"
                                ? wide ? "aspect-[2/1]" : "aspect-[4/3]"
                                : wide ? "aspect-[8/3]" : "aspect-[16/10]")
                            }
                            style={{ background: plateOf(project.id) }}
                          >
                            <Image
                              src={shot.src}
                              alt={shot.alt}
                              unoptimized={project.media?.direct}
                              fill
                              loading="lazy"
                              sizes={wide ? "(max-width: 1100px) 100vw, 68rem" : "(max-width: 640px) 100vw, 33rem"}
                              className={project.media?.fit === "contain" ? "object-contain p-4" : "object-cover object-top"}
                            />
                          </div>
                          <figcaption className="mt-2.5 text-[0.875rem] leading-relaxed text-fg-subtle">{shot.alt}</figcaption>
                        </figure>
                      </li>
                      );
                    })}
                  </ul>
                </Block>
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
                {/* Ruled rows, not a grid of equal cards. */}
                <ul className="border-t border-line">
                  {project.caseStudy.decisions.map((d) => (
                    <li key={d.title} className="grid gap-2 border-b border-line py-5 md:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] md:gap-8">
                      <h4 className="text-[1rem] font-semibold text-fg">{d.title}</h4>
                      <p className="text-[0.9375rem] leading-relaxed text-fg-muted">{d.body}</p>
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
                  <p className="max-w-[46em] border-l-2 border-line-strong pl-5 leading-relaxed text-fg-muted">
                    {project.caseStudy.honestNote}
                  </p>
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
              <div className="mt-16 flex flex-wrap items-center gap-3 border-t border-line pt-10">
                {project.liveUrl && (
                  <ButtonLink href={project.liveUrl} external arrow>
                    {project.liveLabel ?? "Open the app"}
                  </ButtonLink>
                )}
                {publicRepoUrl(project) ? (
                  <ButtonLink href={publicRepoUrl(project)!} external variant="secondary">
                    <GithubIcon size={15} />
                    View source
                  </ButtonLink>
                ) : (
                  <PrivateRepoLabel className="px-2" label={repoLabel(project)} />
                )}
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
      <h3 className="mb-4 text-[1.125rem] font-semibold tracking-[-0.01em] text-fg">{title}</h3>
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
