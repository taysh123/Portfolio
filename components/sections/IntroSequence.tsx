"use client";

import { useRef } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useScroll,
  useTransform,
} from "framer-motion";
import { Workstation } from "@/components/effects/Workstation";
import { ScreenPortfolio } from "@/components/effects/ScreenPortfolio";
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

  /*
    THE ORBIT.

    The machine arrives off-axis, the way a product is photographed, and the
    camera swings round to face-on as it moves in. Dead-on symmetry is the
    signature of an illustration, and almost nothing is shot that way.

    NINE degrees, not the seventeen I started with. Past about ten the lid's
    top edge slopes far enough that the machine stops reading as "turned" and
    starts reading as "toppling" — the eye takes a sloping top edge as a
    horizon cue before it takes it as a perspective cue, and loses the argument
    with the physics. Nine is enough to break the symmetry and put a visible
    aluminium edge on the left of the lid, and not enough to look unstable.

    It resolves by 0.66, just BEFORE the push starts covering ground at 0.62 —
    so the reader gets a camera move and then a camera push, rather than both
    at once, which was disorienting when I tried it overlapped. By the time the
    display fills the frame the panel is square to the viewer and the boot log
    is undistorted.
  */
  const yaw = useTransform(scrollYProgress, (p) => 9 * (1 - ramp(0, 0.66)(p)));

  /*
    THE MACHINE IS ALREADY ON.

    The old sequence was: dark screen → wake → boot log → workspace → push. It
    made the reader earn the reveal, and it meant the arrival frame — the one
    frame everybody sees — was a laptop with a dead screen, which is a laptop
    nobody wants. A product advertisement never shows you the device switched
    off.

    So the display is lit and showing the portfolio from the first pixel, and
    the only thing scroll drives is the camera. That is also the sequence the
    brief asks for: see the machine, then move into it. One continuous move
    instead of a four-beat animation you have to sit through.
  */
  const alwaysOn = useMotionValue(1);

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

  // ── Reduced motion: one static frame, no pin, nothing playing ─────────
  if (reduced) {
    return (
      <section aria-label="Introduction" className="relative">
        <ArrivalFrame play={false} />
      </section>
    );
  }

  return (
    <>
      {/* Below lg the pinned sequence is replaced by the arrival frame, which
          plays the same beats on its own clock. */}
      <section aria-label="Introduction" className="relative lg:hidden">
        <ArrivalFrame play />
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
            {/*
              THE NAME LEADS.

              It used to be an 11px eyebrow above the headline — the smallest
              type in the frame, carrying the one thing a visitor should leave
              remembering. It is now the largest type on the site, set at
              display scale with wide tracking so it reads as a wordmark rather
              than as a sentence, and the statement is demoted to a lead line
              underneath it. A portfolio's first job is to say whose it is.
            */}
            <p
              className="font-semibold uppercase leading-[0.92] text-fg"
              style={{
                fontSize: "var(--text-display)",
                letterSpacing: "0.02em",
              }}
            >
              {siteMeta.name}
            </p>
            <p className="label mt-5 flex items-center gap-3 text-fg-muted">
              <span aria-hidden="true" className="inline-block h-px w-10 bg-accent" />
              {siteMeta.roleDetail}
            </p>

            {/*
              The only heading in here a screen reader needs. Everything else in
              this section is choreography and is hidden from the tree.
            */}
            <h2
              className="mt-7 max-w-xl font-medium leading-[1.2] tracking-[var(--tracking-heading)] text-fg-muted"
              style={{ fontSize: "var(--text-lead)" }}
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
              // No `perspective` here. This wrapper is sized by the LID alone —
              // the deck is absolutely positioned and adds no height — so its
              // perspective origin sat well above the machine's visual centre
              // and keystoned the yawed deck into a shear. The camera belongs
              // to the object; `Workstation` owns it.
              willChange: "transform",
            }}
          >
            <motion.div style={{ opacity: bezelFade }} className="contents">
              {/* The float is a wrapper, not a property of the machine: it has
                  to compose with the camera's scale without fighting it. */}
              <div className="anim-hover">
              <Workstation open={lidOpen} wake={alwaysOn} yaw={yaw}>
                <div style={{ containerType: "inline-size" }} className="h-full w-full">
                  <ScreenPortfolio />
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
 * The no-pin variant — and, on a phone, a deliberately different design rather
 * than a smaller copy of the desktop one.
 *
 * WHY NOT PIN ON MOBILE. The desktop sequence spends a whole viewport of
 * scroll on choreography, which is affordable on a machine where scrolling is
 * cheap and reversible. On a phone the same device costs a reader most of a
 * flick to get past, cannot be skimmed, and fights the browser's own
 * address-bar collapse. Pinning is the wrong instrument here.
 *
 * WHAT REPLACES IT. The beats — the device is alive, the screen powers on, the
 * boot log runs, the workspace loads — do not actually require scroll. They
 * require TIME. So on a phone the machine plays them on its own clock the
 * moment it comes into view: about two and a half seconds, once, and then the
 * page scrolls normally for the rest of its life. The reader gets the whole
 * story and keeps their scroll.
 *
 * The camera push is the one beat that is genuinely scroll-bound, and it is
 * the one beat this drops. It is also the one that matters least: it exists to
 * hand a desktop reader off into the hero, and on a phone the hero is already
 * the next thing under their thumb.
 *
 * `play={false}` (reduced motion) renders the finished frame immediately —
 * not a slower version, and not a placeholder.
 */
function ArrivalFrame({ play }: { play: boolean }) {
  /*
    The screen is ON, here as on the desktop. A phone reader gets even less
    patience for a boot sequence than a desktop one, and the arrival frame
    being a live machine is the whole point.

    What is left on a timer is the LID, which lifts the last few degrees as the
    machine comes into view. One small movement that says the object is real,
    rather than four beats of theatre.
  */
  const alwaysOn = useMotionValue(1);
  const open = useMotionValue(play ? 0.86 : 1);
  /*
    A fixed, gentler azimuth than the desktop orbit. Off-axis is what makes the
    machine read as a photographed object rather than a diagram, and that
    matters just as much on a phone — but at 17deg the display's own content
    starts to foreshorten noticeably at 359px wide, and there is no camera move
    here to resolve it. 11deg keeps the object quality and the legibility.
  */
  const restYaw = useMotionValue(7);

  const start = () => {
    if (!play) return;
    animate(open, 1, { duration: 1.1, ease: [0.16, 1, 0.3, 1] });
  };

  return (
    <div className="relative flex min-h-[78svh] flex-col items-center justify-center overflow-hidden px-[var(--gutter)] py-[clamp(2.5rem,8vw,6rem)]">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[62%] w-[86%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] blur-[90px]"
        style={{
          background:
            "radial-gradient(closest-side, var(--glow-strong), var(--glow-blue) 48%, transparent 76%)",
        }}
      />

      {/* Same billing as the desktop frame: the name leads, at display scale. */}
      <div className="relative z-10 mx-auto w-full max-w-[var(--stage)]">
        <p
          className="font-semibold uppercase leading-[0.92] text-fg"
          style={{ fontSize: "var(--text-display)", letterSpacing: "0.02em" }}
        >
          {siteMeta.name}
        </p>
        <p className="label mt-4 flex items-center gap-3 text-fg-muted">
          <span aria-hidden="true" className="inline-block h-px w-8 bg-accent" />
          {siteMeta.role}
        </p>
        {/* The fuller line is desktop-only: at 390px "Software Developer &
            Computer Science Graduate" wraps to three lines of 11px label type
            directly under a display-scale wordmark, which reads as noise. */}
        <h2
          className="mt-6 max-w-xl font-medium leading-[1.2] tracking-[var(--tracking-heading)] text-fg-muted"
          style={{ fontSize: "var(--text-lead)" }}
        >
          Everything here runs.
          <span className="text-emphasis"> Come in and check.</span>
        </h2>
      </div>

      <motion.div
        aria-hidden="true"
        onViewportEnter={start}
        viewport={{ once: true, amount: 0.35 }}
        className="relative z-10 mt-[clamp(2rem,6vw,4.5rem)] flex w-full justify-center"

      >
        <Workstation open={open} wake={alwaysOn} yaw={restYaw}>
          <div style={{ containerType: "inline-size" }} className="h-full w-full">
            <ScreenPortfolio />
          </div>
        </Workstation>
      </motion.div>
    </div>
  );
}
