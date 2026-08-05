"use client";

import { useCallback, useState } from "react";
import { Section } from "@/components/ui/Section";
import { Panel } from "@/components/ui/Panel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { FeaturedProject } from "@/components/ui/FeaturedProject";
import { ProjectRow } from "@/components/ui/ProjectRow";
import { ProjectStage } from "@/components/ui/ProjectStage";
import { ProjectDeck } from "@/components/ui/ProjectDeck";
import { CaseStudyPanel } from "@/components/ui/CaseStudyPanel";
import { ButtonLink } from "@/components/ui/Button";
import { GithubIcon } from "@/components/ui/icons";
import { projects, featuredProject } from "@/data/projects";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";
import { socials } from "@/data/socials";
import type { Project } from "@/data/projects";

const rest = projects.filter((p) => p.id !== featuredProject.id);

/**
 * Selected work — the largest region on the page, because it carries the whole
 * argument.
 *
 * Three movements, not a grid:
 *
 *   1. a slim header panel that establishes the full 88rem stage,
 *   2. the lead project as ONE floating panel at ~80vh, its capture bleeding
 *      to the panel edge,
 *   3. five full-width rows, each its own panel, the capture alternating side
 *      down the page.
 *
 * The previous version was a featured panel plus a 3-up grid of ~380px cards.
 * Five equally-sized tiles say "here are five more things"; five rows the
 * width of the stage say "here are five more projects, each of which gets the
 * room to make its case". The size a project gets is the editorial judgement,
 * and it is the thing a reader feels before they read a word.
 *
 * This also replaces a 3D carousel that showed one project per ~1,200px of
 * scroll, blurred the other five, auto-advanced against the reader, and
 * re-announced itself to screen readers every 4.2 seconds.
 */
export function Projects() {
  const [caseStudy, setCaseStudy] = useState<Project | null>(null);
  const open = useCallback((p: Project) => setCaseStudy(p), []);
  const close = useCallback(() => setCaseStudy(null), []);

  /*
    THREE presentations, chosen by input device rather than by width alone.

    Both interactive ones are progressive enhancements: `useMediaQuery` reports
    false until mounted, so the SERVER renders the row list — every project's
    name, summary, metrics and links are in the HTML for crawlers and for
    anyone without JavaScript — and the richer presentation replaces it on
    capable clients.

      lg + motion  — the 3D stage. Cards on an arc you drag with a pointer.
      below lg     — the deck. A native snap-scroller you flick, which is a
                     different design for a different hand, not this one
                     scaled down.
      reduced      — the rows, at every width. An arc that only resolves
                     through movement has nothing to say without movement,
                     and the rows are a genuinely good read rather than a
                     fallback.
  */
  const reduced = useReducedMotionPref();
  const roomy = useMediaQuery("(min-width: 1024px)");
  const mounted = useMediaQuery("(min-width: 0px)");

  return (
    <>
      <Section
        id="work"
        labelledBy="work-title"
        className="flex flex-col gap-[var(--gap)]"
      >
        {/* ── Header ─────────────────────────────────────────────────────
            Padded rather than `inset` so the header's own bottom margin can
            close the panel — an `inset` panel would double it. */}
        <Panel
          bloom="top-left"
          className="px-[var(--panel-p)] pb-0 pt-[var(--panel-p)]"
        >
          <SectionHeader
            id="work"
            wide
            eyebrow="02 — Selected work"
            title="Production software, built end to end"
            intro="Each one designed, written, tested and shipped alone. The case studies cover what was actually hard — and what each one still isn't."
            aside={
              <ButtonLink href={socials.github.url} external variant="secondary" arrow>
                <GithubIcon size={15} />
                All repositories
              </ButtonLink>
            }
          />
        </Panel>

        {/* ── The lead project ───────────────────────────────────────────
            The motion wrapper is an ANCESTOR of the panel, never the panel
            itself: Framer writes an inline transform when the reveal settles,
            and an inline transform beats a `hover:-translate-y` class, which
            would kill every panel's hover lift. */}
        <Reveal>
          <FeaturedProject project={featuredProject} onOpenCaseStudy={open} />
        </Reveal>

        {/* ── The rest ───────────────────────────────────────────────────
            On a roomy viewport with motion allowed, the remaining projects
            become a 3D stage. Otherwise they stay as full-width rows, each
            revealing on its own as you reach it — a five-row container is
            taller than the viewport, so a shared trigger would have finished
            animating long before the last row was ever on screen. */}
        {!reduced && roomy && (
          <Panel
            tone="raised"
            bloom="centre"
            sheen={false}
            className="px-4 py-[clamp(2.5rem,4vw,4rem)]"
          >
            <ProjectStage projects={rest} onOpenCaseStudy={open} />
          </Panel>
        )}

        {!reduced && mounted && !roomy && (
          <Panel
            tone="raised"
            bloom="centre"
            sheen={false}
            className="px-[var(--panel-p)] py-[clamp(2rem,6vw,3rem)]"
          >
            <ProjectDeck projects={rest} onOpenCaseStudy={open} />
          </Panel>
        )}

        {(reduced || !mounted) && (
          <ul className="flex flex-col gap-[var(--gap)]">
            {rest.map((project, i) => (
              <li key={project.id}>
                <Reveal>
                  <ProjectRow
                    project={project}
                    index={i + 2}
                    reverse={i % 2 === 1}
                    onOpenCaseStudy={open}
                  />
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <CaseStudyPanel project={caseStudy} onClose={close} />
    </>
  );
}
