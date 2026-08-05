"use client";

import type { MotionValue } from "framer-motion";
import { motion, useTransform } from "framer-motion";

/**
 * What is on the laptop's display.
 *
 * Two states cross-faded by scroll: a boot log, then the workspace. Both are
 * real DOM at small scale rather than a bitmap, so they stay crisp as the
 * camera pushes in — which is the whole reason the lid holds live content.
 *
 * Every figure quoted here is one the site can back up elsewhere: 1,742 tests,
 * eight bounded contexts, zero cross-context references. None of them is a
 * count of projects — see the note on `heroStats`.
 */

const BOOT = [
  ["mount", "workspace", "ok"],
  ["attach", "postgres · redis", "ok"],
  ["load", "test suites", "1,742"],
  ["verify", "module graph", "0 cycles"],
] as const;

const CODE: [number, "kw" | "fn" | "str" | "dim", number][] = [
  [42, "kw", 0],
  [68, "fn", 1],
  [54, "dim", 1],
  [61, "str", 1],
  [36, "kw", 1],
  [72, "dim", 2],
  [48, "fn", 2],
  [58, "dim", 2],
  [40, "dim", 1],
  [28, "kw", 0],
  [64, "fn", 1],
  [46, "dim", 1],
];

const TINT = {
  kw: "var(--accent)",
  fn: "rgba(125, 211, 192, 0.75)",
  str: "rgba(233, 178, 122, 0.62)",
  dim: "var(--fg-subtle)",
} as const;

export function ScreenUI({ boot, live }: { boot: MotionValue<number>; live: MotionValue<number> }) {
  const bootOpacity = useTransform(boot, [0, 0.75, 1], [1, 1, 0]);
  const liveOpacity = useTransform(live, [0, 1], [0, 1]);

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      /*
        The display is the light source of the whole intro scene, so it is
        deliberately much lighter than any surface in the site's own palette.
        A screen that matches the page background reads as a dark rectangle,
        not as something switched on.
      */
      style={{ background: "linear-gradient(158deg, #202a4a 0%, #161d36 44%, #101527 100%)" }}
    >
      {/* ── Boot log ───────────────────────────────────────────────────── */}
      <motion.div
        className="absolute inset-0 flex flex-col justify-center gap-[1.1%] px-[6%] font-mono"
        style={{ opacity: bootOpacity, fontSize: "clamp(0.4rem, 1.15cqw, 0.9rem)" }}
      >
        {BOOT.map(([verb, what, result], i) => {
          const start = 0.08 + i * 0.16;
          return (
            <BootLine
              key={what}
              boot={boot}
              from={start}
              verb={verb}
              what={what}
              result={result}
            />
          );
        })}
        <BootCursor boot={boot} />
      </motion.div>

      {/* ── Workspace ──────────────────────────────────────────────────── */}
      <motion.div className="absolute inset-0 flex" style={{ opacity: liveOpacity }}>
        {/* File rail */}
        <div
          className="flex w-[13%] shrink-0 flex-col gap-[6%] border-r px-[2.2%] py-[3.4%]"
          style={{ borderColor: "rgba(255,255,255,0.16)" }}
        >
          <span className="flex gap-[0.18rem]">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="block rounded-full"
                style={{
                  width: "0.2rem",
                  height: "0.2rem",
                  background: i === 0 ? "var(--accent)" : "var(--fg-subtle)",
                  opacity: i === 0 ? 1 : 0.42,
                }}
              />
            ))}
          </span>
          {[72, 54, 88, 46, 64, 40, 58].map((w, i) => (
            <span
              key={i}
              className="block rounded-full"
              style={{
                width: `${w}%`,
                height: "0.14rem",
                background: i === 2 ? "var(--accent)" : "var(--fg-subtle)",
                opacity: i === 2 ? 1 : 0.55,
              }}
            />
          ))}
        </div>

        {/* Editor */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div
            className="flex shrink-0 items-center gap-[2%] border-b px-[3%] py-[1.6%]"
            style={{ borderColor: "rgba(255,255,255,0.16)" }}
          >
            {["detection/pipeline.cs", "settlement.ts"].map((t, i) => (
              <span
                key={t}
                className="truncate rounded-[0.14rem] px-[0.28rem] py-[0.12rem] font-mono"
                style={{
                  fontSize: "clamp(0.28rem, 0.66cqw, 0.5rem)",
                  color: i === 0 ? "#e2e8f7" : "#93a0bd",
                  background: i === 0 ? "rgba(255,255,255,0.10)" : "transparent",
                }}
              >
                {t}
              </span>
            ))}
          </div>

          <div className="flex flex-1 flex-col justify-center gap-[1.5%] px-[3.4%] py-[2%]">
            {CODE.map(([w, tint, indent], i) => (
              <span key={i} className="flex items-center gap-[2%]">
                <span
                  className="block shrink-0 rounded-full"
                  style={{ width: "0.9%", height: "0.14rem", background: "var(--fg-subtle)", opacity: 0.34 }}
                />
                <span
                  className="block rounded-full"
                  style={{
                    width: `${w}%`,
                    height: "0.16rem",
                    marginLeft: `${indent * 3}%`,
                    background: TINT[tint],
                    opacity: tint === "dim" ? 0.62 : 1,
                  }}
                />
              </span>
            ))}
          </div>

          <div
            className="flex shrink-0 items-center gap-[1.6%] border-t px-[3%] py-[1.4%] font-mono"
            style={{
              borderColor: "rgba(255,255,255,0.16)",
              fontSize: "clamp(0.26rem, 0.6cqw, 0.46rem)",
              letterSpacing: "0.1em",
            }}
          >
            <span
              className="block rounded-full"
              style={{ width: "0.16rem", height: "0.16rem", background: "var(--status-live)" }}
            />
            <span style={{ color: "#a3aeca" }}>105 TESTS PASSING</span>
            <span className="ml-auto" style={{ color: "var(--fg-subtle)", opacity: 0.6 }}>
              main
            </span>
          </div>
        </div>

        {/* Right rail — pipeline + counters */}
        <div
          className="flex w-[26%] shrink-0 flex-col gap-[5%] border-l px-[3%] py-[3.4%]"
          style={{ borderColor: "rgba(255,255,255,0.16)" }}
        >
          {["ingest", "detect", "score", "alert"].map((stage, i) => (
            <span key={stage} className="flex items-center gap-[4%]">
              <span
                className="block shrink-0 rounded-full"
                style={{
                  width: "0.22rem",
                  height: "0.22rem",
                  background: "var(--accent)",
                  opacity: 0.5 + i * 0.16,
                }}
              />
              <span
                className="font-mono"
                style={{ fontSize: "clamp(0.26rem, 0.66cqw, 0.5rem)", color: "#a3aeca" }}
              >
                {stage}
              </span>
            </span>
          ))}

          <span className="mt-auto flex flex-col gap-[3%]">
            {[
              ["8", "contexts"],
              ["0", "cross-refs"],
            ].map(([v, l]) => (
              <span key={l} className="flex flex-col">
                <span
                  className="font-semibold leading-none"
                  style={{ fontSize: "clamp(0.44rem, 1.25cqw, 1rem)", color: "#f2f5fd" }}
                >
                  {v}
                </span>
                <span
                  className="font-mono leading-none"
                  style={{
                    fontSize: "clamp(0.2rem, 0.5cqw, 0.38rem)",
                    letterSpacing: "0.14em",
                    color: "#9aa6c4",
                    marginTop: "0.12rem",
                  }}
                >
                  {l.toUpperCase()}
                </span>
              </span>
            ))}
          </span>
        </div>
      </motion.div>

      {/* Scanlines — the one texture that says "display" rather than "panel". */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.10]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 3px)",
        }}
      />
    </div>
  );
}

function BootLine({
  boot,
  from,
  verb,
  what,
  result,
}: {
  boot: MotionValue<number>;
  from: number;
  verb: string;
  what: string;
  result: string;
}) {
  const opacity = useTransform(boot, [from, from + 0.06], [0, 1]);
  const x = useTransform(boot, [from, from + 0.06], [-6, 0]);

  return (
    <motion.span className="flex items-baseline gap-[1.5%]" style={{ opacity, x }}>
      <span style={{ color: "var(--accent)" }}>›</span>
      <span style={{ color: "#dfe6f7" }}>{verb}</span>
      <span style={{ color: "#9fabc7" }}>{what}</span>
      <span
        className="flex-1 self-center"
        style={{
          height: "1px",
          background:
            "repeating-linear-gradient(90deg, var(--border) 0 2px, transparent 2px 5px)",
        }}
      />
      <span style={{ color: "#5ee9b5", fontWeight: 500 }}>{result}</span>
    </motion.span>
  );
}

function BootCursor({ boot }: { boot: MotionValue<number> }) {
  const opacity = useTransform(boot, [0.68, 0.74], [0, 1]);
  return (
    <motion.span className="flex items-center gap-[1.5%]" style={{ opacity }}>
      <span style={{ color: "var(--accent)" }}>›</span>
      <span
        className="anim-pulse block"
        style={{ width: "0.34rem", height: "0.55rem", background: "var(--accent)" }}
      />
    </motion.span>
  );
}
