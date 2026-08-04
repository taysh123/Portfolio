"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { siteMeta, availability, heroStats } from "@/data/socials";
import { HeroVisual } from "@/components/effects/HeroVisual";
import { MaskReveal } from "@/components/ui/MaskReveal";
import { ButtonLink } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { ArrowDownIcon, ArrowUpRightIcon } from "@/components/ui/icons";
import { DUR, easeOutExpo, easeSpring } from "@/lib/motion";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";

/**
 * One panel, deliberately dominant.
 *
 * The hero is a single large framed region rather than a section with a
 * visual beside it: the nav floats above the page, the copy takes the left
 * ~46%, the console illustration fills the rest and bleeds to the panel edge,
 * and the proof points sit inside the panel as a bordered strip along its
 * base. That strip is what closes the composition — without it the panel
 * bleeds off and the whole thing reads as a page header rather than an object.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotionPref();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 90]);
  const copyFade = useTransform(scrollYProgress, [0, 0.75], [1, reduced ? 1 : 0]);

  const enter = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: DUR.reveal, delay, ease: easeSpring },
  });

  return (
    <section id="top" ref={ref} aria-label="Introduction" className="relative">
      <Panel
        tone="float"
        sheen={false}
        className="relative min-h-[min(50rem,92svh)]"
      >
        <div className="grid h-full min-h-[min(50rem,92svh)] grid-rows-[1fr_auto]">
          <div className="grid items-center gap-10 px-[var(--panel-p)] pb-10 pt-[calc(var(--nav-h)+clamp(2rem,5vw,4rem))] lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:gap-6 lg:pb-6">
            {/* ── Copy ───────────────────────────────────────────────── */}
            <motion.div style={{ y: copyY, opacity: copyFade }} className="relative z-10">
              <motion.p {...enter(0.05)}>
                <span className="label inline-flex items-center gap-2.5 rounded-full border border-line bg-surface-1 px-3.5 py-2 text-fg-muted backdrop-blur-md">
                  <span aria-hidden="true" className="relative inline-flex h-1.5 w-1.5">
                    {!reduced && (
                      <span
                        className="absolute inset-0 animate-ping rounded-full"
                        style={{ background: "var(--status-live)", opacity: 0.6 }}
                      />
                    )}
                    <span
                      className="relative inline-block h-1.5 w-1.5 rounded-full"
                      style={{ background: "var(--status-live)" }}
                    />
                  </span>
                  {availability.label}
                </span>
              </motion.p>

              <h1
                className="mt-8 font-semibold leading-[1.0] tracking-[var(--tracking-display)]"
                style={{ fontSize: "var(--text-display)" }}
              >
                <MaskReveal className="text-sheen" delay={0.06}>
                  I build production
                </MaskReveal>
                <br />
                <MaskReveal className="text-sheen" delay={0.13}>
                  software that solves
                </MaskReveal>
                <br />
                <MaskReveal className="text-emphasis" delay={0.2}>
                  real problems.
                </MaskReveal>
              </h1>

              <motion.p
                {...enter(0.36)}
                className="mt-8 max-w-lg leading-relaxed text-fg-muted"
                style={{ fontSize: "var(--text-lead)" }}
              >
                {siteMeta.tagline}
              </motion.p>

              <motion.div
                {...enter(0.46)}
                className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
              >
                <ButtonLink href="#work" size="lg" arrow>
                  View the work
                </ButtonLink>
                <ButtonLink href="#contact" variant="secondary" size="lg">
                  Get in touch
                </ButtonLink>
              </motion.div>
            </motion.div>

            {/* ── Illustration ───────────────────────────────────────── */}
            <div className="relative min-h-[24rem] sm:min-h-[30rem] lg:min-h-[38rem] lg:-mr-[calc(var(--panel-p)*0.4)]">
              <HeroVisual progress={scrollYProgress} />

              <motion.div
                initial={reduced ? false : { opacity: 0, y: 14, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: DUR.reveal, delay: 0.72, ease: easeOutExpo }}
                className="absolute bottom-1 left-0 z-20 w-[min(20rem,88%)] lg:-left-14"
              >
                <a
                  href="#work"
                  className="group glass edge-lit block rounded-2xl p-4 shadow-float transition-transform duration-[var(--dur-slow)] ease-[var(--ease-out-expo)] hover:-translate-y-1.5"
                >
                  <p className="label text-fg-subtle">Currently building</p>
                  <p className="mt-2 flex items-center justify-between gap-3 font-medium text-fg">
                    SentinelAI
                    <ArrowUpRightIcon
                      size={16}
                      className="text-fg-subtle transition-transform duration-[var(--dur-mid)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
                    />
                  </p>
                  <p className="mt-1 text-sm leading-snug text-fg-muted">
                    A SOC platform where module isolation is enforced by the compiler
                  </p>
                </a>
              </motion.div>
            </div>
          </div>

          {/* ── Proof strip, inside the panel ─────────────────────────── */}
          <motion.div {...enter(0.58)} className="relative z-10 border-t border-line-subtle">
            <dl className="grid grid-cols-2 sm:grid-cols-4">
              {heroStats.map((s, i) => (
                <div
                  key={s.label}
                  className={`group/stat relative flex flex-col gap-1.5 px-[clamp(1.25rem,3vw,2.75rem)] py-7 transition-colors duration-[var(--dur-mid)] hover:bg-surface-1 ${
                    i > 0 ? "sm:border-l sm:border-line-subtle" : ""
                  } ${i === 1 ? "border-l border-line-subtle sm:border-l" : ""} ${
                    i > 1 ? "border-t border-line-subtle sm:border-t-0" : ""
                  }`}
                >
                  <dd className="tnum text-3xl font-semibold tracking-[var(--tracking-heading)] text-fg">
                    {s.value}
                  </dd>
                  <dt className="label text-fg-subtle">{s.label}</dt>
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-[var(--dur-slow)] ease-[var(--ease-out-expo)] group-hover/stat:scale-x-100"
                  />
                </div>
              ))}
            </dl>
          </motion.div>
        </div>
      </Panel>

      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.0 }}
        aria-hidden="true"
        className="mx-auto mt-7 flex w-fit items-center gap-3 text-fg-subtle"
      >
        <span className="hairline w-12" />
        <span className="label">Scroll</span>
        <motion.span
          animate={reduced ? undefined : { y: [0, 4, 0] }}
          transition={
            reduced ? undefined : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }
          }
          className="inline-flex"
        >
          <ArrowDownIcon size={15} />
        </motion.span>
      </motion.div>
    </section>
  );
}
