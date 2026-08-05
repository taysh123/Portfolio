"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { cn } from "@/lib/cn";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";
import type { Project } from "@/data/projects";

/**
 * The projects, as a deck you flick — the touch counterpart to the desktop
 * stage.
 *
 * WHY NATIVE SCROLL AND NOT A DRAG HANDLER. The desktop stage tracks a pointer
 * and animates transforms, which is right for a mouse. Reimplementing that for
 * touch means reimplementing momentum, rubber-banding at the ends, velocity-
 * proportional settling, interruption mid-fling and two-finger behaviour — all
 * of which the platform already does, in the compositor, better than any
 * handler on the main thread can. So this is a real scroll container with
 * `scroll-snap`, and every one of those behaviours comes for free and stays
 * correct on hardware I will never test on.
 *
 * It is also better than the row list it replaces on a phone, which is the
 * comparison that matters: six full-width rows is 6,000px of scroll to see
 * what six projects are; a deck shows one at a time at a size where the
 * capture is actually legible, and a flick moves between them.
 *
 * DEPTH WITHOUT A SCROLL HANDLER. Neighbours sit back — smaller, dimmer —
 * so the deck has a front. Which card is in front comes from an
 * IntersectionObserver rooted on the scroller itself, not from a scroll
 * listener: it fires only when a card actually crosses the threshold, so a
 * fling costs a handful of callbacks instead of one per frame.
 *
 * ACCESSIBILITY. This is a scroll container, so it is keyboard-operable
 * natively and every card stays in the tab order and in the accessibility
 * tree — nothing is `inert`, because unlike the stage nothing is hidden
 * behind anything. Nothing advances on its own, so the live region only ever
 * announces a move a person made. The dots are 44px targets over a 6px
 * visual.
 */
export function ProjectDeck({
  projects,
  onOpenCaseStudy,
}: {
  projects: Project[];
  onOpenCaseStudy: (project: Project) => void;
}) {
  const scroller = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const reduced = useReducedMotionPref();
  const count = projects.length;

  useEffect(() => {
    const root = scroller.current;
    if (!root) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const i = Number((entry.target as HTMLElement).dataset.index);
          setActive((v) => (v === i ? v : i));
        }
      },
      // Rooted on the scroller, so "visible" means visible IN THE DECK rather
      // than in the viewport. A centred card reads ~1.0 here while its
      // neighbours only peek, which makes 0.6 an unambiguous threshold.
      { root, threshold: 0.6 },
    );

    for (const li of root.querySelectorAll("li[data-index]")) io.observe(li);
    return () => io.disconnect();
  }, [count]);

  const goTo = useCallback(
    (i: number) => {
      const target = scroller.current?.querySelector<HTMLElement>(
        `li[data-index="${i}"]`,
      );
      target?.scrollIntoView({
        behavior: reduced ? "auto" : "smooth",
        inline: "center",
        block: "nearest",
      });
    },
    [reduced],
  );

  return (
    <div role="group" aria-roledescription="carousel" aria-label="Projects">
      {/*
        Bleeds to the screen edges through the panel's padding, so a card can
        sit centred with its neighbours peeking. `scroll-py` is irrelevant
        here but `scroll-px` matters: without it the first and last cards
        cannot reach the centre, and the deck feels broken at both ends.
      */}
      <ul
        ref={scroller}
        className={cn(
          "-mx-[var(--panel-p)] flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--panel-p)] pb-2",
          // Momentum and rubber-banding are the platform's; this just stops
          // the browser claiming the gesture for back-navigation.
          "overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
        style={{ scrollPaddingInline: "var(--panel-p)" }}
      >
        {projects.map((project, i) => (
          <li
            key={project.id}
            data-index={i}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            className={cn(
              "w-[min(23rem,80vw)] shrink-0 snap-center",
              !reduced &&
                "transition-[transform,opacity] duration-[var(--dur-slow)] ease-[var(--ease-out-expo)]",
              // The deck has a front. Neighbours sit back rather than
              // disappearing, so a reader can always see there is more.
              i === active ? "scale-100 opacity-100" : "scale-[0.955] opacity-70",
            )}
          >
            <ProjectCard
              project={project}
              active={i === active}
              onOpenCaseStudy={onOpenCaseStudy}
              sizes="(max-width: 420px) 80vw, 23rem"
            />
          </li>
        ))}
      </ul>

      {/* ── Controls ─────────────────────────────────────────────────────
          Dots only. Arrow buttons on a touch deck are a desktop habit: the
          gesture is the control, and a 44px dot is a better target than a
          32px chevron a thumb has to reach across the screen for. */}
      <div className="mt-7 flex items-center justify-center gap-2.5">
        {projects.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Show ${p.name}`}
            aria-current={i === active}
            className={cn(
              "relative block h-1.5 rounded-full transition-all duration-[var(--dur-slow)] ease-[var(--ease-out-expo)]",
              // Transparent 44px hit target over a 6px visual.
              "before:absolute before:left-1/2 before:top-1/2 before:h-11 before:w-8 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']",
              i === active ? "w-8 bg-accent" : "w-1.5 bg-fg-subtle/45",
            )}
          />
        ))}
      </div>

      <p className="label mt-5 text-center text-fg-subtle">
        Swipe to browse — {count} projects
      </p>

      <p className="sr-only" role="status" aria-live="polite">
        Project {active + 1} of {count}: {projects[active].name}
      </p>
    </div>
  );
}
