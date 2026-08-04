"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { siteMeta, availability, heroStats } from "@/data/socials";
import { SystemDiagram } from "@/components/effects/SystemDiagram";
import { MaskReveal } from "@/components/ui/MaskReveal";
import { ButtonLink } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { ArrowDownIcon, ArrowUpRightIcon } from "@/components/ui/icons";
import { DUR, easeOutExpo, easeSpring } from "@/lib/motion";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotionPref();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 72]);
  const copyFade = useTransform(scrollYProgress, [0, 0.8], [1, reduced ? 1 : 0]);

  // Entrance timings. Everything is opacity/transform only.
  const enter = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: DUR.reveal, delay, ease: easeSpring },
  });

  return (
    <section
      id="top"
      ref={ref}
      aria-label="Introduction"
      className="relative isolate flex min-h-[100svh] items-center px-[var(--gutter)] pb-20 pt-28 sm:pt-32"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.18fr_0.82fr] lg:gap-8 3xl:max-w-7xl">
        {/* ── Copy ─────────────────────────────────────────────────────── */}
        <motion.div
          style={{ y: copyY, opacity: copyFade }}
          className="relative z-10"
        >
          <motion.p {...enter(0.05)}>
            <span className="label inline-flex items-center gap-2.5 rounded-full border border-line bg-surface-1 px-3.5 py-2 text-fg-muted">
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

          {/*
            Explicit line breaks rather than natural wrapping: each MaskReveal
            is inline-block, so letting the browser choose break points
            produces a different (and usually worse) rag at every width.
          */}
          <h1
            className="mt-7 font-semibold leading-[1.02] tracking-[var(--tracking-display)]"
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
            className="mt-7 max-w-xl leading-relaxed text-fg-muted"
            style={{ fontSize: "var(--text-lead)" }}
          >
            {siteMeta.tagline}
          </motion.p>

          <motion.div
            {...enter(0.46)}
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <ButtonLink href="#work" size="lg" arrow>
              View the work
            </ButtonLink>
            <ButtonLink href="#contact" variant="secondary" size="lg">
              Get in touch
            </ButtonLink>
          </motion.div>

          {/* Proof points. Every figure is verifiable from the repositories. */}
          <motion.dl
            {...enter(0.56)}
            className="mt-11 grid grid-cols-2 gap-3 sm:grid-cols-4"
          >
            {heroStats.map((s) => (
              <Panel key={s.label} className="px-4 py-3.5">
                <dt className="label mt-1.5 text-fg-subtle">{s.label}</dt>
                <dd className="tnum order-first text-2xl font-semibold tracking-[var(--tracking-heading)] text-fg">
                  {s.value}
                </dd>
              </Panel>
            ))}
          </motion.dl>
        </motion.div>

        {/* ── Visual ───────────────────────────────────────────────────── */}
        {/* DOM order is copy → visual, which is also the correct reading order on
            every viewport: the headline leads, the diagram supports it. */}
        <div className="relative">
          <SystemDiagram progress={scrollYProgress} />

          {/*
            Sits over the diagram but outside it — the diagram is decorative
            and aria-hidden, this is a real link and must stay in the tree.
          */}
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: DUR.reveal, delay: 0.68, ease: easeOutExpo }}
            className="absolute bottom-2 left-0 w-[min(19rem,88%)] sm:bottom-6 lg:-left-6"
          >
            <a
              href="#work"
              className="group glass edge-lit block rounded-xl p-4 shadow-float transition-transform duration-[var(--dur-slow)] ease-[var(--ease-out-expo)] hover:-translate-y-1"
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

      {/* ── Scroll cue ─────────────────────────────────────────────────── */}
      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.0 }}
        aria-hidden="true"
        className="absolute inset-x-0 bottom-7 mx-auto flex w-fit items-center gap-3 text-fg-subtle"
      >
        <span className="hairline w-10" />
        <span className="label">Scroll</span>
        <motion.span
          animate={reduced ? undefined : { y: [0, 4, 0] }}
          transition={
            reduced
              ? undefined
              : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }
          }
          className="inline-flex"
        >
          <ArrowDownIcon size={15} />
        </motion.span>
      </motion.div>
    </section>
  );
}
