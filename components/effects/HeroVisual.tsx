"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";

/**
 * The hero illustration: a floating engineering console in perspective.
 *
 * This is meant to read as a product illustration, not decoration — a primary
 * editor pane with real code structure, satellite panes carrying a live
 * pipeline and a metrics readout, orbit arcs sweeping behind, a stage bloom
 * beneath, and signal travelling between the panes.
 *
 * Construction notes:
 *   - Panes are HTML in `preserve-3d`, not a flattened SVG, so their text and
 *     hairlines stay crisp at any scale and inherit the theme tokens.
 *   - Arcs, connectors and dust are SVG in their own stacking layer.
 *   - Continuous motion is CSS (`anim-drift`, `anim-flow`, `anim-pulse`) so
 *     it is compositor-driven and the reduced-motion kill-switch reaches it.
 *   - The only JS motion is a spring-damped pointer parallax and the
 *     scroll-linked lift, both transform-only. Pointer tracking is mouse-only
 *     and writes to motion values, never to layout.
 */

/** Syntax tinting for the code pane. Depicting code, not UI chrome. */
const SYNTAX = {
  kw: "var(--accent)",
  fn: "rgba(125, 211, 192, 0.72)",
  str: "rgba(233, 178, 122, 0.6)",
  dim: "var(--fg-subtle)",
} as const;

/** width %, colour, indent steps — a plausible function body. */
const CODE: [number, string, number][] = [
  [46, SYNTAX.kw, 0],
  [72, SYNTAX.fn, 1],
  [58, SYNTAX.dim, 1],
  [64, SYNTAX.str, 1],
  [38, SYNTAX.kw, 1],
  [70, SYNTAX.dim, 2],
  [52, SYNTAX.fn, 2],
  [44, SYNTAX.dim, 1],
  [30, SYNTAX.kw, 0],
];

const PIPELINE = ["ingest", "detect", "score", "alert"];

export function HeroVisual({ progress }: { progress?: MotionValue<number> }) {
  const reduced = useReducedMotionPref();
  const hostRef = useRef<HTMLDivElement>(null);

  // Pointer parallax. Spring-damped so it trails the cursor rather than
  // snapping to it — the difference between "premium" and "twitchy".
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const spring = { stiffness: 90, damping: 22, mass: 0.9 };
  const rotY = useSpring(useTransform(px, [-0.5, 0.5], [-13, 13]), spring);
  const rotX = useSpring(useTransform(py, [-0.5, 0.5], [9, -9]), spring);

  // Fallback created unconditionally — `useMotionValue` inside a `??` would be
  // a conditional hook call.
  const fallback = useMotionValue(0);
  const p = progress ?? fallback;
  const lift = useTransform(p, [0, 1], [0, -110]);
  const fade = useTransform(p, [0, 0.8], [1, 0]);

  const onMove = (e: React.PointerEvent) => {
    if (reduced || e.pointerType !== "mouse") return;
    const r = hostRef.current?.getBoundingClientRect();
    if (!r) return;
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <div
      ref={hostRef}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      aria-hidden="true"
      // `absolute inset-0`, not `h-full`: the host must fill a parent whose height
      // may come from min-height, where `h-full` resolves to auto and collapses
      // every percentage-sized pane inside it to nothing.
      className="absolute inset-0 isolate select-none [--s:0.62] sm:[--s:0.78] lg:[--s:1]"
      style={{ perspective: "1800px" }}
    >
      {/* Stage bloom — the light the console sits in. */}
      <span
        className="pointer-events-none absolute left-1/2 top-[58%] h-[46%] w-[86%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] blur-[70px]"
        style={{
          background:
            "radial-gradient(closest-side, var(--glow-strong), var(--glow-blue) 44%, transparent 74%)",
        }}
      />

      {/* Arcs + dust, behind the panes. */}
      <OrbitLayer animated={!reduced} />

      <div
        className="absolute inset-0"
        style={{ transform: "scale(var(--s))", transformStyle: "preserve-3d" }}
      >

      {/*
        The responsive scale lives on a plain wrapper, not inside the motion
        style: Framer builds its own transform string from the style object, so
        handing it a `var()` for `scale` is not reliably composable with the
        animated rotate/translate values.
      */}
      <motion.div
        className="absolute inset-0"
        style={{
          rotateX: reduced ? 6 : rotX,
          rotateY: reduced ? -10 : rotY,
          y: reduced ? 0 : lift,
          opacity: reduced ? 1 : fade,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        {/* ── Primary console ─────────────────────────────────────────── */}
        <Pane
          z={0}
          className="left-[7%] top-[19%] h-[62%] w-[74%]"
          drift={reduced ? undefined : "0s"}
          tone="deep"
        >
          <Chrome title="detection/pipeline.cs" />
          <div className="flex min-h-0 flex-1">
            <RailNav />
            <div className="flex-1 space-y-[0.42rem] px-4 py-3.5">
              {CODE.map(([w, c, indent], i) => (
                <span key={i} className="flex items-center gap-2">
                  <span
                    className="block h-[0.3rem] shrink-0 rounded-full opacity-25"
                    style={{ width: "0.55rem", background: "var(--fg-subtle)" }}
                  />
                  <span
                    className="block h-[0.34rem] rounded-full"
                    style={{
                      width: `${w}%`,
                      marginLeft: `${indent * 0.85}rem`,
                      background: c,
                      opacity: c === SYNTAX.dim ? 0.34 : 0.72,
                    }}
                  />
                </span>
              ))}
            </div>
          </div>
          <StatusBar />
        </Pane>

        {/* ── Metrics satellite ───────────────────────────────────────── */}
        <Pane
          z={132}
          className="right-[-2%] top-[6%] h-[31%] w-[42%]"
          drift={reduced ? undefined : "-3.5s"}
        >
          <Chrome title="throughput" compact />
          <div className="flex flex-1 flex-col justify-between px-3.5 pb-3 pt-2">
            <Sparkline animated={!reduced} />
            <div className="flex items-end gap-3">
              {[
                ["8", "contexts"],
                ["0", "cross-refs"],
              ].map(([v, l]) => (
                <span key={l} className="flex flex-col">
                  <span className="text-[0.95rem] font-semibold leading-none text-fg">{v}</span>
                  <span
                    className="mt-1 leading-none text-fg-subtle"
                    style={{ fontSize: "0.42rem", letterSpacing: "0.16em", textTransform: "uppercase" }}
                  >
                    {l}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </Pane>

        {/* ── Pipeline satellite ──────────────────────────────────────── */}
        <Pane
          z={78}
          className="bottom-[3%] right-[6%] h-[26%] w-[52%]"
          drift={reduced ? undefined : "-7s"}
        >
          <Chrome title="event flow" compact />
          <div className="flex flex-1 items-center gap-1.5 px-3.5 pb-3">
            {PIPELINE.map((stage, i) => (
              <span key={stage} className="flex flex-1 items-center gap-1.5">
                <span className="flex flex-1 flex-col items-center gap-1">
                  <span
                    className={`block h-1.5 w-1.5 rounded-full ${!reduced ? "anim-pulse" : ""}`}
                    style={{ background: "var(--accent)", animationDelay: `${i * 0.5}s` }}
                  />
                  <span
                    className="whitespace-nowrap text-fg-subtle"
                    style={{ fontSize: "0.4rem", letterSpacing: "0.12em" }}
                  >
                    {stage}
                  </span>
                </span>
                {i < PIPELINE.length - 1 && (
                  <svg width="100%" height="2" viewBox="0 0 40 2" className="max-w-[2.2rem] flex-1">
                    <line
                      x1="0" y1="1" x2="40" y2="1"
                      stroke="var(--accent-line)" strokeWidth="1"
                      strokeDasharray="3 4"
                      className={!reduced ? "anim-flow" : undefined}
                      style={{ animationDelay: `${i * -0.35}s` }}
                    />
                  </svg>
                )}
              </span>
            ))}
          </div>
        </Pane>

        {/* Connectors between the panes, drawn in the 3D space. */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          style={{ transform: "translateZ(60px)" }}
        >
          <path
            d="M62 32 C 74 30, 80 24, 86 20"
            fill="none" stroke="var(--accent-line)" strokeWidth="0.35"
            strokeDasharray="2 3"
            className={!reduced ? "anim-flow" : undefined}
          />
          <path
            d="M58 70 C 66 76, 72 80, 78 82"
            fill="none" stroke="var(--accent-line)" strokeWidth="0.35"
            strokeDasharray="2 3"
            className={!reduced ? "anim-flow" : undefined}
            style={{ animationDelay: "-0.8s" }}
          />
        </svg>
        </motion.div>
      </div>
    </div>
  );
}

/* ── Pieces ─────────────────────────────────────────────────────────────── */

function Pane({
  children,
  z,
  className,
  drift,
  tone = "normal",
}: {
  children: React.ReactNode;
  z: number;
  className?: string;
  drift?: string;
  tone?: "normal" | "deep";
}) {
  return (
    <div
      className={`absolute ${drift !== undefined ? "anim-drift" : ""} ${className ?? ""}`}
      style={{
        transform: `translateZ(${z}px)`,
        transformStyle: "preserve-3d",
        animationDelay: drift,
        animationDuration: "13s",
        willChange: drift !== undefined ? "transform" : undefined,
      }}
    >
      <div
        className="edge-lit flex h-full w-full flex-col overflow-hidden rounded-[1.15rem] border"
        style={{
          borderColor: "var(--border)",
          background: tone === "deep" ? "var(--panel-fill-deep)" : "var(--panel-fill)",
          boxShadow: "var(--shadow-3)",
          /*
            Backdrop blur on the PRIMARY pane only.

            It samples the orbit arcs passing behind the glass, which is a real
            depth cue — but measured across three runs each way, three blurring
            panes cost about +80ms FCP on a ~550ms baseline. One pane keeps
            most of the effect (it is the largest and the one the eye lands on)
            for roughly a third of the cost. The satellites lean on
            `--panel-fill` instead, which is free.
          */
          ...(tone === "deep"
            ? {
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }
            : null),
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Chrome({ title, compact }: { title: string; compact?: boolean }) {
  return (
    <div
      className={`flex shrink-0 items-center gap-1.5 border-b px-3 ${compact ? "py-1.5" : "py-2"}`}
      style={{ borderColor: "var(--border-subtle)" }}
    >
      {["var(--accent)", "var(--fg-subtle)", "var(--fg-subtle)"].map((c, i) => (
        <span
          key={i}
          className="block h-[0.3rem] w-[0.3rem] rounded-full"
          style={{ background: c, opacity: i === 0 ? 0.8 : 0.3 }}
        />
      ))}
      <span
        className="ml-1.5 truncate text-fg-subtle"
        style={{ fontSize: "0.44rem", letterSpacing: "0.1em" }}
      >
        {title}
      </span>
    </div>
  );
}

/** The editor's file rail — what makes the pane read as an IDE at a glance. */
function RailNav() {
  return (
    <div
      className="flex w-[18%] shrink-0 flex-col gap-1.5 border-r px-2 py-3"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      {[70, 52, 84, 46, 62, 38].map((w, i) => (
        <span
          key={i}
          className="block h-[0.26rem] rounded-full"
          style={{
            width: `${w}%`,
            background: i === 2 ? "var(--accent)" : "var(--fg-subtle)",
            opacity: i === 2 ? 0.7 : 0.24,
          }}
        />
      ))}
    </div>
  );
}

function StatusBar() {
  return (
    <div
      className="flex shrink-0 items-center gap-2 border-t px-3 py-1.5"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      <span
        className="block h-1 w-1 rounded-full"
        style={{ background: "var(--status-live)" }}
      />
      <span
        className="text-fg-subtle"
        style={{ fontSize: "0.4rem", letterSpacing: "0.14em" }}
      >
        105 TESTS PASSING
      </span>
      <span className="ml-auto block h-[0.22rem] w-8 rounded-full" style={{ background: "var(--border)" }} />
    </div>
  );
}

/** A filled area chart. Shape is fixed — it depicts a readout, it isn't data. */
function Sparkline({ animated }: { animated: boolean }) {
  const d = "M0 26 L10 20 L20 23 L30 12 L40 16 L50 7 L60 11 L70 4 L80 8";
  return (
    <svg viewBox="0 0 80 30" className="h-auto w-full" fill="none" preserveAspectRatio="none">
      <defs>
        <linearGradient id="hv-spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.30" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L80 30 L0 30 Z`} fill="url(#hv-spark)" />
      <path
        d={d}
        stroke="var(--accent)"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
      {animated && (
        <circle r="1.6" fill="var(--accent)">
          <animateMotion dur="6s" repeatCount="indefinite" path={d} />
        </circle>
      )}
    </svg>
  );
}

/** Orbit arcs + dust behind the console — the depth cue that sells the scene. */
function OrbitLayer({ animated }: { animated: boolean }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className="pointer-events-none absolute inset-[-14%] h-[128%] w-[128%] overflow-visible"
      fill="none"
    >
      <defs>
        <linearGradient id="hv-arc" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0" />
          <stop offset="42%" stopColor="var(--accent)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hv-arc2" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--glow)" stopOpacity="0" />
          <stop offset="50%" stopColor="rgba(180,124,255,0.55)" />
          <stop offset="100%" stopColor="var(--glow)" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g style={{ transformOrigin: "100px 100px" }}>
        <ellipse
          cx="100" cy="100" rx="86" ry="34"
          stroke="url(#hv-arc)" strokeWidth="0.7"
          transform="rotate(-19 100 100)"
        />
        <ellipse
          cx="100" cy="100" rx="70" ry="72"
          stroke="url(#hv-arc2)" strokeWidth="0.6"
          transform="rotate(24 100 100)"
          opacity="0.7"
        />
        <ellipse
          cx="100" cy="100" rx="94" ry="56"
          stroke="url(#hv-arc)" strokeWidth="0.5"
          transform="rotate(11 100 100)"
          opacity="0.45"
        />
      </g>

      {/* Dust. Fixed positions — a particle system would cost a rAF loop for
          motion nobody would notice. */}
      {[
        [22, 34, 0.9], [168, 52, 1.2], [140, 168, 0.8], [46, 150, 1.1],
        [186, 118, 0.7], [12, 96, 0.8], [122, 18, 0.9], [78, 186, 0.7],
      ].map(([cx, cy, r], i) => (
        <circle
          key={i}
          cx={cx} cy={cy} r={r}
          fill="var(--star)"
          className={animated ? "anim-pulse" : undefined}
          style={{ animationDelay: `${i * 0.7}s`, animationDuration: "5s" }}
        />
      ))}
    </svg>
  );
}
