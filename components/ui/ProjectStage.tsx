"use client";

import { useCallback, useRef, useState } from "react";
import { IconButton } from "@/components/ui/IconButton";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/ui/icons";
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
 * Every card on the stage is reachable — see the note on the click capture
 * below for why `inert` was removed. The whole component is desktop-and-motion-only: below `lg`
 * `Projects` renders `ProjectDeck` instead — a snap-scroller built on native
 * touch scrolling, which is a different design rather than this one shrunk.
 * Under reduced motion it renders the row list, because an arc that only
 * resolves through movement has nothing to say when movement is off.
 *
 * The card is `ProjectCard`, shared with the deck. The two presentations
 * differ; the object being presented must not.
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
  /*
    Neighbours are held much closer to the front card than they were.

    At a 0.11 scale step and a 0.4 fade the second card out sat at 78% and
    20% — present enough to see, faint enough to read as "not for you". The
    brief is that no project should feel hidden, and a card at a fifth opacity
    feels hidden. 0.075 and 0.26 keep the arc's depth cue while leaving the
    furthest card at 48%, which reads as queued rather than dismissed.
  */
  scaleStep: 0.075,
  fadeStep: 0.26,
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

  /*
    The stage is asymmetric at both ends — at the first card there is nothing
    to the left of it and two cards to the right — and a spotlight nailed to
    the geometric centre makes that read as a mistake rather than as the start
    of a deck.

    Wrapping the deck around would balance it and cost more than it is worth:
    "1 of 5" stops being true, Home and End stop meaning anything, and the
    linear model that lets off-axis cards be `inert` goes with it. So the deck
    stays linear and the LIGHT moves instead — biased toward the cards by up to
    7% of the stage at either end, easing back to centre in the middle. The
    composition rebalances optically and the semantics are untouched.
  */
  const lightBias = (Math.max(0, Math.min(count - 1, position)) / (count - 1) - 0.5) * -14;

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
        {/* ── Lighting ─────────────────────────────────────────────────
            Three layers, all compositor-only, and all of them behind the
            cards so nothing here can ever intercept a pointer.

            The key light the active card sits in. `translateX` rather than a
            `left` change, so the bias animates on the compositor instead of
            invalidating layout on every frame of a drag. */}
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute left-1/2 top-[44%] h-[62%] w-[54%] -translate-y-1/2 rounded-[50%] blur-[70px]",
            !dragging &&
              "transition-transform duration-[var(--dur-slow)] ease-[var(--ease-out-expo)]",
          )}
          style={{
            transform: `translate(calc(-50% + ${lightBias}%), -50%)`,
            background:
              "radial-gradient(closest-side, var(--glow-strong), var(--glow-blue) 46%, transparent 76%)",
          }}
        />

        {/* The surface the deck stands on. A tight dark pool directly under
            the cards is what stops them floating in the middle of a panel —
            the same trick that grounds the workstation, for the same reason. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[8%] left-1/2 h-[7rem] w-[64%] -translate-x-1/2 rounded-[50%] blur-[38px]"
          style={{
            background:
              "radial-gradient(closest-side, rgba(0,0,0,0.66), transparent 74%)",
          }}
        />

        {/* And the light that surface throws back. Not a mirrored copy of the
            card — that means painting every card twice for a band most of
            which is below the fold. A soft accent wash under the active card
            reads as a reflective floor at a fraction of the cost, and it is
            the cue that actually sells "this is standing on something". */}
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute bottom-[6%] left-1/2 h-[5rem] w-[34%] -translate-y-2 rounded-[50%] blur-[30px]",
            !dragging &&
              "transition-transform duration-[var(--dur-slow)] ease-[var(--ease-out-expo)]",
          )}
          style={{
            transform: `translateX(calc(-50% + ${lightBias}%))`,
            background:
              "radial-gradient(closest-side, var(--glow-blue), transparent 72%)",
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
                /*
                  NOT `inert`, and this is a bug fix.

                  Off-axis cards used to be `inert` and `aria-hidden`. The
                  reasoning was sound — Tab should not land on something you
                  cannot see — but the consequence was that a card sitting in
                  plain view, half-visible beside the active one, silently
                  swallowed every click. From a reader's side that is
                  indistinguishable from "the Case study button is broken",
                  which is exactly how it was reported.

                  These cards are visible, so they are reachable. Focus already
                  centres a card (`onFocusCapture`), and the capture handler
                  below centres it on click, so reaching a neighbour by either
                  route brings it to the front instead of doing nothing. Only
                  cards beyond the visible range are dropped, and those are not
                  rendered at all.
                */
                /*
                  A NEIGHBOUR IS ONE TARGET: the card itself.

                  I tried letting its controls through so a click on "Case
                  study" would act directly, and measurement killed it — an
                  off-axis card is scaled to 85% and yawed 60 degrees, so its
                  repository button projects to 24x29. That is the WCAG floor,
                  on a control nobody can reliably hit, and it turned a clean
                  responsive sweep into three failures.

                  So the whole card is the target and its interior is
                  `pointer-events: none`. Every click on a neighbour brings it
                  forward — which is visible, immediate, and never a dead
                  click — and once it is in front everything on it works at
                  full size. Keyboard is unaffected: focus still centres a
                  card, so tabbing to one makes it live before you can
                  activate anything on it.
                */
                onClickCapture={(e) => {
                  if (isActive) return;
                  e.preventDefault();
                  e.stopPropagation();
                  setActive(i);
                }}
                className={cn(
                  "absolute left-1/2 top-1/2 w-[clamp(19rem,25vw,23rem)]",
                  !isActive && "cursor-pointer",
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
                  // An accent-tinted cast shadow on the front card only. It
                  // sits on the WRAPPER rather than the card so it inherits
                  // the 3D transform and leans with the card, which is what
                  // separates a lit object from a sticker with a glow behind
                  // it. The card's own border keeps carrying the active state
                  // for anyone who cannot see the light.
                  borderRadius: "1.5rem",
                  boxShadow: isActive
                    ? "0 34px 90px -26px var(--glow-strong), 0 12px 40px -18px rgba(0,0,0,0.75)"
                    : undefined,
                }}
              >
                <div className={isActive ? undefined : "pointer-events-none"}>
                  <ProjectCard
                    project={project}
                    active={isActive}
                    onOpenCaseStudy={onOpenCaseStudy}
                    onFocusCapture={() => setActive(i)}
                    sizes="(max-width: 1024px) 80vw, 24rem"
                  />
                </div>
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

