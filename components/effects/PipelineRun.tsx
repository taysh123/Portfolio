"use client";

import { useRef, useState, type ComponentType, type SVGProps } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { cn } from "@/lib/cn";
import { easeOutExpo, viewportOnce } from "@/lib/motion";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";
import {
  CheckCircleIcon,
  CodeIcon,
  LayersIcon,
  PackageIcon,
  SearchIcon,
} from "@/components/ui/icons";
import type { ApproachStep } from "@/data/approach";

/**
 * The approach, as a pipeline run.
 *
 * WHY THIS REPLACED A ROW OF STEPS. The previous version was five text columns
 * on a drawn line — correct, readable, and the single most generic composition
 * in this genre. Next to a machine that boots, it read as a *diagram of* a
 * process rather than a process. The five steps are already a pipeline
 * (understand → design → build → verify → ship), so the honest move is to stop
 * illustrating that and start executing it: scrolling the section advances a
 * run, the track fills, and each station reports PASS with the evidence that
 * backs it.
 *
 * The motion means something, which is the whole test. Nothing here moves
 * decoratively — the fill is progress, and a station's state change is that
 * stage completing. That is the same argument the section is making in words.
 *
 * TWO DIFFERENT DESIGNS, NOT ONE RESPONSIVE ONE:
 *
 *   lg and up — a horizontal track across the board, filled by the section's
 *   own scroll progress. Stations flip to PASS as the fill reaches them, so
 *   the run is something you drive rather than something you watch.
 *
 *   below lg — a vertical job log. Each station draws its own connector
 *   segment and flips as it enters the viewport. This is not the desktop
 *   version scaled down: a scroll-progress fill cannot stay aligned with
 *   stations of unequal height without measuring them, and on a phone the
 *   stations are *very* unequal. Per-station triggers self-align, cost one
 *   observer each, and read exactly like a CI log on a small screen — which
 *   is the right metaphor at that size anyway.
 *
 * ACCESSIBILITY. Station status is decoration: the reading order is number,
 * title, summary, evidence, project, and every one of those is real text in
 * the DOM at every breakpoint. The PASS chips and the track are aria-hidden,
 * and there is no live region — a scroll position is not an announcement.
 * Under reduced motion the run is rendered complete, not slowly.
 */

type StepIcon = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

const STEP_ICONS: Record<string, StepIcon> = {
  understand: SearchIcon,
  design: LayersIcon,
  build: CodeIcon,
  verify: CheckCircleIcon,
  ship: PackageIcon,
};

/**
 * The station head is 3rem, so the track rides its centre line at 1.5rem.
 * These two are one measurement.
 */
const NODE = "h-12 w-12";
const TRACK_Y = "1.5rem";

export function PipelineRun({ steps }: { steps: ApproachStep[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotionPref();
  /*
    Which design is live, not just which stylesheet. The two layouts light
    their stations from different signals — the track's fill on desktop, the
    station's own arrival on mobile — and a CSS breakpoint cannot express that.
    Reports false until mounted, so the server renders the unlit state, which
    is the correct starting frame for both.
  */
  const wide = useMediaQuery("(min-width: 1024px)");
  const n = steps.length;

  /*
    The run's extent. It starts as the board's top edge crosses 85% of the
    viewport and completes as its bottom edge reaches 55% — so the last station
    passes while it is still comfortably on screen, rather than at the moment it
    leaves. A run that finishes off-screen is a run nobody saw.
  */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.55"],
  });

  const [passed, setPassed] = useState(0);

  /*
    Stations sit at the column centres, so station i is at (2i+1)/2n along the
    track and `round(p * n)` is exactly the number the fill has reached. The
    guard makes this a no-op for all but n of the scroll events.
  */
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const next = Math.max(0, Math.min(n, Math.round(p * n)));
    setPassed((v) => (v === next ? v : next));
  });

  const reachedCount = reduced ? n : passed;

  return (
    <div ref={ref} className="relative">
      {/* ── The track ─────────────────────────────────────────────────────
          Desktop only. Below lg each station draws its own segment. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 hidden lg:block"
        style={{ top: TRACK_Y }}
      >
        <span className="absolute inset-x-0 h-px bg-line" />
        {reduced ? (
          <span
            className="absolute inset-x-0 h-px"
            style={{ background: "var(--accent)", opacity: 0.75 }}
          />
        ) : (
          <motion.span
            className="absolute inset-x-0 h-px origin-left"
            style={{
              background: "var(--accent)",
              opacity: 0.75,
              scaleX: scrollYProgress,
              boxShadow: "0 0 10px 0 var(--accent)",
            }}
          />
        )}
      </div>

      {/*
        Subgrid, so every band lines up across all five stations.

        Bottom-anchoring the evidence with `mt-auto` aligned their bottoms and
        left their tops ragged — which is inherent to that technique and looks
        like a mistake once each well has a visible border. Declaring the row
        template ONCE here and having each station adopt it with
        `grid-template-rows: subgrid` makes head, meta, title, summary and
        evidence share five real rows: every band starts and ends on the same
        line, and the wells come out the same height for free.

        The summary row is the `1fr`, so it absorbs the slack and the evidence
        always sits on the board's baseline. Without subgrid support the
        declaration is simply dropped and the station stacks in source order,
        which is the same reading order — so the fallback is a layout, not a
        collapse.
      */}
      <ol
        role="list"
        className="grid gap-y-12 lg:grid-cols-5 lg:grid-rows-[auto_auto_auto_1fr_auto] lg:gap-x-0 lg:gap-y-0"
      >
        {steps.map((step, i) => (
          <Station
            key={step.id}
            step={step}
            index={i}
            last={i === n - 1}
            done={i < reachedCount}
            current={i === reachedCount - 1}
            reduced={reduced}
            wide={wide}
          />
        ))}
      </ol>
    </div>
  );
}

function Station({
  step,
  index,
  last,
  done,
  current,
  reduced,
  wide,
}: {
  step: ApproachStep;
  index: number;
  last: boolean;
  done: boolean;
  current: boolean;
  reduced: boolean;
  wide: boolean;
}) {
  const Icon = STEP_ICONS[step.id];

  /*
    Below lg the station owns its own state, because its own arrival in the
    viewport is the trigger. `useState` + `whileInView` on a sibling would be
    two sources of truth for one fact, so the connector and the head both read
    this one.

    On desktop this observer is deliberately ignored: the station must light
    when the TRACK reaches it, and lighting on viewport entry instead made the
    whole board report done while the fill was still crossing the second
    station — the run's one job is to show an order, and that broke it.
  */
  const [seen, setSeen] = useState(false);
  const lit = reduced || (wide ? done : seen);

  return (
    <motion.li
      className={cn(
        "relative flex flex-col pl-[4.5rem]",
        "lg:row-span-5 lg:grid lg:[grid-template-rows:subgrid] lg:pl-0",
        // The two outer columns stay flush with the panel inset; the inner
        // three are padded so the copy never touches a neighbour.
        "lg:px-[clamp(0.75rem,1.4vw,1.75rem)]",
        index === 0 && "lg:pl-0",
        last && "lg:pr-0",
      )}
      onViewportEnter={() => setSeen(true)}
      viewport={{ once: true, amount: 0.4 }}
    >
      {/* ── Mobile connector ───────────────────────────────────────────
          Drawn per station, so it can never drift out of alignment with a
          station whose copy runs longer than its neighbour's. */}
      {!last && (
        <span
          aria-hidden="true"
          className="absolute left-6 top-12 w-px lg:hidden"
          style={{ bottom: "-3rem" }}
        >
          <span className="absolute inset-0 bg-line" />
          <motion.span
            className="absolute inset-0 origin-top"
            style={{ background: "var(--accent)", opacity: 0.6 }}
            initial={reduced ? false : { scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={viewportOnce}
            transition={{ duration: 0.7, ease: easeOutExpo }}
          />
        </span>
      )}

      {/* ── Station head ─────────────────────────────────────────────────
          Opaque, so the track runs behind it rather than through it. */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-0 top-0 z-10 inline-flex items-center justify-center rounded-full border bg-surface-3 lg:relative lg:mb-7",
          NODE,
          !reduced &&
            "transition-[border-color,color,box-shadow] duration-[var(--dur-slow)] ease-[var(--ease-out-expo)]",
          lit
            ? "border-accent-line text-accent shadow-e2"
            : "border-line text-fg-subtle",
        )}
        style={lit ? { boxShadow: "0 0 0 4px var(--accent-soft)" } : undefined}
      >
        <Icon size={19} />
      </span>

      {/* The light this station sits in once the run reaches it. Pre-rendered
          and revealed by opacity — no layout, no paint-time filter. */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -inset-x-2 -top-8 -z-10 hidden h-56 lg:block",
          !reduced && "transition-opacity duration-[var(--dur-slow)]",
          current ? "opacity-100" : "opacity-0",
        )}
        style={{
          background:
            "radial-gradient(60% 50% at 50% 30%, var(--accent-soft), transparent 72%)",
        }}
      />

      <div className="flex items-baseline gap-3">
        <p className="label tnum text-fg-subtle">
          {String(index + 1).padStart(2, "0")}
        </p>
        <StatusChip lit={lit} reduced={reduced} />
      </div>

      <h3
        className="mt-3 font-semibold tracking-[var(--tracking-heading)] text-fg"
        style={{ fontSize: "var(--text-h3)" }}
      >
        {step.title}
      </h3>

      <p className="mt-3.5 text-[0.9375rem] leading-relaxed text-fg-muted">
        {step.summary}
      </p>

      {/* ── Evidence, as run output ────────────────────────────────────
          Bottom-anchored at lg so the wells line up across the board however
          long a summary runs. The body stays in the text face — three lines of
          monospace is a worse read, and the point is that this is checkable,
          not that it looks like a terminal. The chrome carries the metaphor. */}
      <div className="mt-6 lg:mt-0 lg:pt-8">
        <div className="h-full rounded-xl border border-line-subtle bg-surface-1 p-4">
          {/*
            The chip tracks the station's state rather than announcing PASS
            under a head that still reads QUEUED — a green pass beside a queued
            station is a contradiction the eye catches immediately. It dims
            rather than disappearing, so the claim survives with JavaScript off
            and the evidence below it is unconditional either way.

            `justify-between` with no rule between the two: the project name
            wraps to two lines on the stations that cite two repositories, and
            a flexible hairline between them tore the baseline apart when it
            did.
          */}
          <p className="flex items-baseline justify-between gap-3">
            <span
              aria-hidden="true"
              className={cn(
                "font-mono text-[0.6875rem] leading-none",
                !reduced && "transition-colors duration-[var(--dur-slow)]",
              )}
              style={{ color: lit ? "var(--status-live)" : "var(--fg-subtle)" }}
            >
              PASS
            </span>
            <cite className="text-right font-mono text-[0.6875rem] not-italic leading-relaxed tracking-[0.04em] text-fg-subtle">
              {step.project}
            </cite>
          </p>
          <p className="mt-3 text-[0.8125rem] leading-relaxed text-fg-subtle">
            {step.evidence}
          </p>
        </div>
      </div>
    </motion.li>
  );
}

/** Reports the station's state in the run. Decorative — the evidence well
 *  below carries the same fact as real text. */
function StatusChip({ lit, reduced }: { lit: boolean; reduced: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "label inline-flex items-center gap-1.5",
        !reduced && "transition-colors duration-[var(--dur-slow)]",
        lit ? "text-fg-muted" : "text-fg-subtle",
      )}
    >
      <span
        className={cn("inline-block h-1.5 w-1.5 rounded-full", !lit && "opacity-40")}
        style={{ background: lit ? "var(--status-live)" : "var(--border-strong)" }}
      />
      {lit ? "done" : "queued"}
    </span>
  );
}
