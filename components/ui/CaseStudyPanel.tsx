"use client";

import { useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Tag, StatusChip } from "@/components/ui/Tag";
import { ButtonLink } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { GithubIcon, XIcon } from "@/components/ui/icons";
import { DUR, easeOutExpo } from "@/lib/motion";
import { useFocusTrap, useScrollLock } from "@/lib/useFocusTrap";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";
import type { Project } from "@/data/projects";

/**
 * Full case study, as a slide-over.
 *
 * `aria-modal="true"` is a promise that the rest of the page is unavailable,
 * so this actually keeps it: `useFocusTrap` cycles Tab inside the panel and
 * restores focus to the card that opened it. The previous version declared
 * `aria-modal` with no trap and no focus restoration at all.
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
            className="fixed inset-0 z-[60] bg-[color-mix(in_oklab,var(--surface-0)_72%,transparent)] backdrop-blur-sm"
          />

          <motion.aside
            key="panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="case-study-title"
            tabIndex={-1}
            initial={reduced ? { opacity: 0 } : { x: "100%" }}
            animate={reduced ? { opacity: 1 } : { x: 0 }}
            exit={reduced ? { opacity: 0 } : { x: "100%" }}
            transition={{ duration: DUR.slow, ease: easeOutExpo }}
            className="glass fixed inset-y-0 right-0 z-[61] flex w-full flex-col overflow-y-auto border-l border-line sm:max-w-xl lg:max-w-2xl"
          >
            <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line-subtle bg-surface-3 px-5 py-4 sm:px-8">
              <div className="min-w-0">
                <Eyebrow>Case study</Eyebrow>
                <h2
                  id="case-study-title"
                  className="mt-1.5 text-xl font-semibold tracking-[var(--tracking-heading)] text-fg sm:text-2xl"
                >
                  {project.name}
                </h2>
              </div>
              <IconButton label="Close case study" onClick={onClose} data-autofocus size="sm">
                <XIcon size={16} />
              </IconButton>
            </header>

            <div className="flex-1 space-y-9 px-5 py-8 sm:px-8">
              <div className="flex flex-wrap items-center gap-2">
                <StatusChip status={project.status} />
                <span className="label text-fg-subtle">{project.context}</span>
              </div>

              <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {project.metrics.map((m) => (
                  <div
                    key={m.label}
                    className="rounded-lg border border-line-subtle bg-surface-1 px-3 py-2.5"
                  >
                    <dd className="tnum text-lg font-semibold text-fg">{m.value}</dd>
                    <dt className="label mt-1 text-fg-subtle">{m.label}</dt>
                  </div>
                ))}
              </dl>

              <Block title="The problem">
                <p className="leading-relaxed text-fg-muted">{project.caseStudy.problem}</p>
              </Block>

              <Block title="Architecture">
                <p className="leading-relaxed text-fg-muted">{project.caseStudy.architecture}</p>
              </Block>

              <Block title="Engineering decisions">
                <ul className="space-y-4">
                  {project.caseStudy.decisions.map((d) => (
                    <li
                      key={d.title}
                      className="rounded-xl border border-line-subtle bg-surface-1 p-4"
                    >
                      <h4 className="text-[0.95rem] font-medium text-fg">{d.title}</h4>
                      <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{d.body}</p>
                    </li>
                  ))}
                </ul>
              </Block>

              <Block title="Challenges">
                <List items={project.caseStudy.challenges} marker="accent" />
              </Block>

              <Block title="What I took from it">
                <List items={project.caseStudy.learned} marker="subtle" />
              </Block>

              {project.caseStudy.honestNote && (
                <Block title="What this isn't">
                  <div className="rounded-xl border border-line bg-surface-1 p-4">
                    <p className="text-sm leading-relaxed text-fg-muted">
                      {project.caseStudy.honestNote}
                    </p>
                  </div>
                </Block>
              )}

              <Block title="Stack">
                <ul className="flex flex-wrap gap-1.5">
                  {project.stack.map((s) => (
                    <li key={s.label}>
                      <Tag emphasis={s.emphasis}>{s.label}</Tag>
                    </li>
                  ))}
                </ul>
              </Block>

              <div className="flex flex-wrap gap-3 border-t border-line-subtle pt-7">
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

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="label mb-3 text-fg-subtle">{title}</h3>
      {children}
    </section>
  );
}

function List({ items, marker }: { items: string[]; marker: "accent" | "subtle" }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span
            aria-hidden="true"
            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
            style={{
              background: marker === "accent" ? "var(--accent)" : "var(--fg-subtle)",
            }}
          />
          <span className="text-sm leading-relaxed text-fg-muted">{item}</span>
        </li>
      ))}
    </ul>
  );
}
