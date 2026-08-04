"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";

/**
 * The hero visual: an exploded, three-plane view of a system — interface over
 * services over data — with signal travelling between the layers.
 *
 * Built entirely from SVG and CSS 3D transforms. No canvas, no WebGL, no
 * image. The depth is real `preserve-3d` layering rather than a faked
 * gradient, which is what makes it hold up at large sizes.
 *
 * Motion budget: all continuous animation is CSS (`anim-flow`, `anim-drift`,
 * `anim-pulse`) so it is compositor-driven and the reduced-motion kill-switch
 * in globals.css can stop it. The only JS-driven values are two scroll-linked
 * transforms, which do no work when the hero is off-screen.
 */

const NODES = [
  { id: "ingest", label: "ingest", x: 22, y: 30 },
  { id: "normalize", label: "normalise", x: 50, y: 16 },
  { id: "detect", label: "detect", x: 78, y: 34 },
  { id: "score", label: "score", x: 62, y: 66 },
  { id: "alert", label: "alert", x: 26, y: 72 },
] as const;

const EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 4],
];

export function SystemDiagram({ progress }: { progress?: MotionValue<number> }) {
  const reduced = useReducedMotionPref();
  const localRef = useRef<HTMLDivElement>(null);

  // Falls back to a local scroll source so the hooks stay unconditional.
  const local = useScroll({ target: localRef, offset: ["start start", "end start"] });
  const p = progress ?? local.scrollYProgress;

  const tiltX = useTransform(p, [0, 1], [0, -8]);
  const lift = useTransform(p, [0, 1], [0, -60]);
  const fade = useTransform(p, [0, 0.75], [1, 0]);

  return (
    /*
      `--dscale` shrinks the whole stage on narrow viewports. The planes are
      rotated and pushed ±128px in Z, so perspective projects their corners
      well outside the element's own box — about 51px past a 390px column,
      which the viewport then exposes as horizontal scroll. Scaling keeps the
      full composition visible; clipping would cut the corners mid-air, which
      is the part that reads as depth.
    */
    <div
      ref={localRef}
      aria-hidden="true"
      className="pointer-events-none relative mx-auto aspect-square w-full max-w-[34rem] [--dscale:0.76] sm:[--dscale:0.9] lg:[--dscale:1]"
      style={{ perspective: "1400px", transform: "scale(var(--dscale))" }}
    >
      {/* Bloom sits behind the object, never across the text. */}
      <span
        className="absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, var(--glow-strong), var(--glow-blue) 46%, transparent 74%)",
        }}
      />

      <motion.div
        className="relative h-full w-full"
        style={{
          rotateX: reduced ? 16 : tiltX,
          y: reduced ? 0 : lift,
          opacity: reduced ? 1 : fade,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            transform: "rotateX(58deg) rotateZ(-38deg)",
            transformStyle: "preserve-3d",
          }}
        >
          <Plane depth={128} label="interface" tone="accent" drift={reduced ? undefined : "0s"}>
            <InterfacePane />
          </Plane>

          <Plane depth={0} label="services" tone="glow" drift={reduced ? undefined : "-3s"}>
            <ServicesPane animated={!reduced} />
          </Plane>

          <Plane depth={-128} label="data" tone="muted" drift={reduced ? undefined : "-6s"}>
            <DataPane />
          </Plane>

          {/* Light columns tying the planes together. */}
          <span
            className="absolute left-[30%] top-[34%] h-px w-px"
            style={{ transformStyle: "preserve-3d" }}
          >
            <Beam />
          </span>
          <span
            className="absolute left-[66%] top-[58%] h-px w-px"
            style={{ transformStyle: "preserve-3d" }}
          >
            <Beam delay="-2.4s" />
          </span>
        </div>
      </motion.div>
    </div>
  );
}

function Plane({
  children,
  depth,
  label,
  tone,
  drift,
}: {
  children: React.ReactNode;
  depth: number;
  label: string;
  tone: "accent" | "glow" | "muted";
  drift?: string;
}) {
  return (
    <div
      className={drift !== undefined ? "anim-drift absolute inset-0" : "absolute inset-0"}
      style={{
        transform: `translateZ(${depth}px)`,
        transformStyle: "preserve-3d",
        animationDelay: drift,
        willChange: drift !== undefined ? "transform" : undefined,
      }}
    >
      <div
        className="absolute inset-[14%] rounded-[1.25rem] border"
        style={{
          borderColor:
            tone === "accent"
              ? "var(--accent-line)"
              : tone === "glow"
                ? "var(--border-strong)"
                : "var(--border)",
          background:
            "linear-gradient(160deg, var(--surface-2), transparent 78%)",
          boxShadow: "var(--shadow-2)",
        }}
      >
        {children}
        <span
          className="label absolute -top-6 left-1 whitespace-nowrap text-fg-subtle"
          style={{ fontSize: "0.5rem", letterSpacing: "0.22em" }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

/** Top plane — a wireframe of a UI, deliberately abstract. */
function InterfacePane() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full p-3" fill="none">
      <rect x="6" y="8" width="34" height="5" rx="2.5" fill="var(--accent)" opacity="0.5" />
      <rect x="6" y="20" width="88" height="26" rx="4" stroke="var(--border-strong)" strokeWidth="0.7" />
      <rect x="10" y="25" width="24" height="3" rx="1.5" fill="var(--fg-subtle)" opacity="0.55" />
      <rect x="10" y="32" width="42" height="2.4" rx="1.2" fill="var(--fg-subtle)" opacity="0.32" />
      <rect x="10" y="37" width="34" height="2.4" rx="1.2" fill="var(--fg-subtle)" opacity="0.32" />
      {[6, 36, 66].map((x) => (
        <rect
          key={x}
          x={x}
          y="54"
          width="28"
          height="34"
          rx="4"
          stroke="var(--border)"
          strokeWidth="0.7"
          fill="var(--surface-1)"
        />
      ))}
      <rect x="10" y="60" width="16" height="2.6" rx="1.3" fill="var(--accent)" opacity="0.65" />
      <rect x="40" y="60" width="16" height="2.6" rx="1.3" fill="var(--fg-subtle)" opacity="0.4" />
      <rect x="70" y="60" width="16" height="2.6" rx="1.3" fill="var(--fg-subtle)" opacity="0.4" />
    </svg>
  );
}

/** Middle plane — the event pipeline, carrying the visible signal. */
function ServicesPane({ animated }: { animated: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full p-3 overflow-visible" fill="none">
      <defs>
        <linearGradient id="sd-edge" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.35" />
        </linearGradient>
      </defs>

      {EDGES.map(([a, b], i) => (
        <line
          key={i}
          x1={NODES[a].x}
          y1={NODES[a].y}
          x2={NODES[b].x}
          y2={NODES[b].y}
          stroke="url(#sd-edge)"
          strokeWidth="0.7"
          strokeLinecap="round"
          strokeDasharray="3 5"
          className={animated ? "anim-flow" : undefined}
          style={animated ? { animationDelay: `${i * -0.4}s` } : undefined}
        />
      ))}

      {NODES.map((n, i) => (
        <g key={n.id}>
          <circle
            cx={n.x}
            cy={n.y}
            r="5.4"
            fill="var(--surface-3)"
            stroke="var(--accent-line)"
            strokeWidth="0.7"
          />
          <circle
            cx={n.x}
            cy={n.y}
            r="1.7"
            fill="var(--accent)"
            className={animated ? "anim-pulse" : undefined}
            style={animated ? { animationDelay: `${i * 0.45}s` } : undefined}
          />
        </g>
      ))}
    </svg>
  );
}

/** Bottom plane — persistence, drawn as a partitioned table. */
function DataPane() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full p-3" fill="none">
      {[0, 1, 2, 3].map((row) => (
        <g key={row}>
          <rect
            x="8"
            y={16 + row * 19}
            width="84"
            height="13"
            rx="3"
            stroke="var(--border)"
            strokeWidth="0.6"
            fill={row === 1 ? "var(--surface-2)" : "transparent"}
          />
          <rect
            x="12"
            y={20 + row * 19}
            width="20"
            height="2.4"
            rx="1.2"
            fill="var(--fg-subtle)"
            opacity={row === 1 ? 0.6 : 0.3}
          />
          <rect
            x="38"
            y={20 + row * 19}
            width="12"
            height="2.4"
            rx="1.2"
            fill="var(--fg-subtle)"
            opacity="0.22"
          />
          <rect
            x="56"
            y={20 + row * 19}
            width="30"
            height="2.4"
            rx="1.2"
            fill="var(--fg-subtle)"
            opacity="0.22"
          />
        </g>
      ))}
    </svg>
  );
}

/**
 * A vertical shaft of light crossing all three planes. Stood upright out of
 * the tilted plane with rotateX(90deg) so it reads as a column in the scene
 * rather than a line drawn on it.
 */
function Beam({ delay }: { delay?: string }) {
  return (
    <span
      className="anim-pulse absolute block h-[264px] w-[2px] -translate-y-1/2"
      style={{
        transform: "rotateX(90deg)",
        background:
          "linear-gradient(to bottom, transparent, var(--accent), transparent)",
        opacity: 0.5,
        animationDelay: delay,
        animationDuration: "5.2s",
      }}
    />
  );
}
