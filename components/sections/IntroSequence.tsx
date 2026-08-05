"use client";

import { useRef } from "react";
import { motion, useMotionValue, useScroll, useTransform } from "framer-motion";
import { Workstation } from "@/components/effects/Workstation";
import { ScreenUI } from "@/components/effects/ScreenUI";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { siteMeta } from "@/data/socials";
import { ArrowDownIcon } from "@/components/ui/icons";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";

/**
 * The front door: a workstation that opens, boots, and then swallows the
 * camera.
 *
 * A tall container with a sticky stage inside it, so scroll drives a timeline
 * rather than translating a page. The beats:
 *
 * 200vh, not 320: one viewport of travel carries all five beats, which is
 * enough for the sequence to read as cinematic without making the reader pay
 * three screens of scroll before they reach any content.
 *
 *   0.00          arrival — the machine is already there, lid open, screen
 *                 dark, breathing. You should know what you are looking at
 *                 before you scroll a pixel.
 *   0.00 → 0.22   the hinge finishes opening as you engage
 *   0.26 → 0.40   the display wakes
 *   0.30 → 0.56   the boot log runs
 *   0.52 → 0.68   the workspace loads
 *   0.62 → 1.00   the camera pushes through the screen
 *
 * The push is a scale on the whole scene with the bezel fading out, so what
 * remains at the end is the display's own light filling the viewport. The
 * reader arrives inside the machine, and the hero panel is what they land on.
 *
 * ACCESSIBILITY. This is choreography, not content:
 *   - the whole stage is aria-hidden except one real heading, so a screen
 *     reader gets the statement without 300vh of scroll theatre
 *   - under reduced motion the pin is gone entirely. Not slowed — removed.
 *     The same scene renders once, open and booted, at a readable size, and
 *     the page scrolls normally
 *   - the same simplification applies below `lg`, where 300vh of pinned scroll
 *     on a phone is a hostage situation rather than an experience
 */
export function IntroSequence() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotionPref();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  /*
    ── The timeline ──────────────────────────────────────────────────────

    Fades are written as function transformers rather than input/output ranges.
    A range with a flat hold (`[0, 0.16, 0.46] → [1, 1, 0]`) did not interpolate
    correctly here — measured across the scroll it produced a V, going opaque
    again by the end — and the ranges that behaved all had distinct outputs at
    every stop. A function is unambiguous, so the maths is mine and verifiable.
  */
  const ramp = (from: number, to: number) => (p: number) =>
    Math.min(1, Math.max(0, (p - from) / (to - from)));

  /*
    The lid starts MOSTLY OPEN, not shut.

    A closed lid is edge-on to the camera, which means the arrival frame was
    effectively empty — the reader landed on a dark room and had to scroll
    before anything identified itself as a machine. Starting at 0.78 means the
    device is unmistakably a laptop from the first pixel; the remaining travel
    finishes the hinge as the reader engages, so the beat is still there.
  */
  const lidOpen = useTransform(scrollYProgress, (p) => 0.78 + ramp(0, 0.22)(p) * 0.22);
  const wake = useTransform(scrollYProgress, ramp(0.26, 0.4));
  const boot = useTransform(scrollYProgress, ramp(0.3, 0.56));
  const live = useTransform(scrollYProgress, ramp(0.52, 0.68));

  // The push. Deliberately not linear: a slow approach, then the last stretch
  // covers most of the distance, which reads as acceleration into the screen.
  const sceneScale = useTransform(scrollYProgress, (p) => {
    const t = ramp(0.62, 1)(p);
    return 1 + Math.pow(t, 2.2) * 8;
  });
  const sceneY = useTransform(scrollYProgress, (p) => `${ramp(0.62, 1)(p) * -6}%`);
  const bezelFade = useTransform(scrollYProgress, (p) => 1 - ramp(0.74, 0.93)(p));
  const washIn = useTransform(scrollYProgress, ramp(0.8, 1));
  const stageFade = useTransform(scrollYProgress, (p) => 1 - ramp(0.94, 1)(p));

  const copyFade = useTransform(scrollYProgress, (p) => 1 - ramp(0.16, 0.42)(p));
  const hintFade = useTransform(scrollYProgress, (p) => 1 - ramp(0.08, 0.24)(p));

  // ── Reduced motion / small screens: one static frame, no pin ──────────
  if (reduced) {
    return (
      <section aria-label="Introduction" className="relative">
        <StaticFrame />
      </section>
    );
  }

  return (
    <>
      {/* Below lg the pinned sequence is replaced by the same scene, static. */}
      <section aria-label="Introduction" className="relative lg:hidden">
        <StaticFrame />
      </section>

      <div ref={ref} data-intro-stage className="relative hidden h-[200vh] lg:block">
        <motion.section
          aria-label="Introduction"
          className="sticky top-0 flex h-screen items-center justify-center overflow-hidden"
          style={{ opacity: stageFade }}
        >
          {/* Room light behind the machine. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] blur-[100px]"
            style={{
              background:
                "radial-gradient(closest-side, rgba(150,110,255,0.30), rgba(96,140,255,0.20) 50%, transparent 78%)",
            }}
          />

          {/* ── Copy, above the machine ─────────────────────────────────── */}
          <motion.div
            style={{ opacity: copyFade }}
            className="pointer-events-none absolute inset-x-0 top-[9vh] z-20 mx-auto w-full max-w-[var(--stage)] px-[var(--gutter)]"
          >
            <Eyebrow rule className="justify-start">
              {siteMeta.name} — {siteMeta.role}
            </Eyebrow>
            {/*
              The only text in here a screen reader needs. Everything else in
              this section is choreography and is hidden from the tree.
            */}
            <h2
              className="mt-5 max-w-2xl font-semibold leading-[1.05] tracking-[var(--tracking-heading)] text-fg"
              style={{ fontSize: "var(--text-h2)" }}
            >
              Everything here runs.
              <span className="text-emphasis"> Come in and check.</span>
            </h2>
          </motion.div>

          {/* ── The machine ─────────────────────────────────────────────── */}
          <motion.div
            aria-hidden="true"
            className="relative z-10 flex w-full items-center justify-center"
            style={{
              scale: sceneScale,
              y: sceneY,
              perspective: "2200px",
              willChange: "transform",
            }}
          >
            <motion.div style={{ opacity: bezelFade }} className="contents">
              {/* The float is a wrapper, not a property of the machine: it has
                  to compose with the camera's scale without fighting it. */}
              <div className="anim-hover">
              <Workstation open={lidOpen} wake={wake}>
                <div style={{ containerType: "inline-size" }} className="h-full w-full">
                  <ScreenUI boot={boot} live={live} />
                </div>
              </Workstation>
              </div>
            </motion.div>
          </motion.div>

          {/* The display's light, taking the frame as the bezel leaves. */}
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[15]"
            style={{
              opacity: washIn,
              background:
                "radial-gradient(70% 60% at 50% 46%, var(--glow-blue), transparent 72%)",
            }}
          />

          {/* ── Scroll affordance ───────────────────────────────────────── */}
          <motion.div
            aria-hidden="true"
            style={{ opacity: hintFade }}
            className="absolute inset-x-0 bottom-10 z-20 mx-auto flex w-fit items-center gap-3 text-fg-subtle"
          >
            <span className="hairline w-12" />
            <span className="label">Scroll to enter</span>
            <motion.span
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex"
            >
              <ArrowDownIcon size={15} />
            </motion.span>
          </motion.div>
        </motion.section>
      </div>
    </>
  );
}

/**
 * The no-pin variant: the same machine, open and booted, rendered once.
 *
 * Deliberately not a degraded placeholder — it keeps the concept (you are
 * looking at a workstation) and only drops the scroll choreography, which is
 * the part that is unsafe under reduced motion and unpleasant on a phone.
 */
function StaticFrame() {
  // One frozen value shared by every slot — the scene renders at its end state.
  const done = useMotionValue(1);

  return (
    <div className="relative flex min-h-[78svh] flex-col items-center justify-center overflow-hidden px-[var(--gutter)] py-[clamp(3rem,8vw,6rem)]">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[62%] w-[86%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] blur-[90px]"
        style={{
          background:
            "radial-gradient(closest-side, var(--glow-strong), var(--glow-blue) 48%, transparent 76%)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[var(--stage)]">
        <Eyebrow rule>
          {siteMeta.name} — {siteMeta.role}
        </Eyebrow>
        <h2
          className="mt-5 max-w-2xl font-semibold leading-[1.05] tracking-[var(--tracking-heading)] text-fg"
          style={{ fontSize: "var(--text-h2)" }}
        >
          Everything here runs.
          <span className="text-emphasis"> Come in and check.</span>
        </h2>
      </div>

      <div
        aria-hidden="true"
        className="relative z-10 mt-[clamp(2.5rem,6vw,4.5rem)] flex w-full justify-center"
        style={{ perspective: "2000px" }}
      >
        <Workstation open={done} wake={done}>
          <div style={{ containerType: "inline-size" }} className="h-full w-full">
            <ScreenUI boot={done} live={done} />
          </div>
        </Workstation>
      </div>
    </div>
  );
}
