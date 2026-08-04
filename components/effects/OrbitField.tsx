import { cn } from "@/lib/cn";

/**
 * The contact illustration: an armillary field.
 *
 * A lit core body suspended inside a wireframe field, with four orbit rings at
 * different inclinations turning around it and nodes riding each one. It is the
 * same "system" idea as the hero console, viewed from outside instead of
 * exploded — the shape you reach when you want to say "there is a network here"
 * without drawing a globe.
 *
 * Construction notes:
 *
 *   OCCLUSION IS REAL. Each ring is drawn twice — once dimmed and clipped to
 *   the *far* half of the core's silhouette (painted before the body), once at
 *   full strength clipped to everything else (painted after it). So a ring
 *   visibly passes behind the sphere and re-emerges on the other side, and the
 *   nodes riding it dim as they cross. That single detail is the difference
 *   between "three ellipses" and a body in space. Both passes are separate
 *   elements with identical durations, which the document timeline keeps in
 *   phase indefinitely.
 *
 *   MOTION IS ENTIRELY CSS, so the global kill-switch in globals.css reaches
 *   it without this needing to be a Client Component. Every ring keeps its own
 *   duration (88 / 119 / 151 / 67s) precisely so the four never come back into
 *   phase — a synced set reads as a spinning wheel, an unsynced one reads as
 *   orbit. Under reduced motion each spin resolves to its 360° end state, which
 *   is 0°, so the rings simply rest at the inclinations they were authored at
 *   and the composition still holds, fully composed and still.
 *
 *   COLOUR ROLES. `--accent` carries every piece of structure. `--glow` appears
 *   only in the blooms behind the body — atmosphere behind a solid object,
 *   never on a stroke, never on text.
 *
 * Decorative throughout: `aria-hidden`, no text, no interactive target.
 */

const VIEW = 480;
/** Centre of the field, in viewBox units. */
const C = VIEW / 2;

/** The lit body. Ring occlusion is computed against this radius. */
const R_CORE = 86;
/** The wireframe shell the hub network is suspended in. */
const R_FIELD = 214;
/** The circle the fixed hubs sit on. */
const R_HUB = 172;

/** Parametric point on an ellipse centred on the field. */
function point(deg: number, rx: number, ry: number) {
  const t = (deg * Math.PI) / 180;
  return { x: C + rx * Math.cos(t), y: C + ry * Math.sin(t) };
}

/**
 * The far half of the core's silhouette: the top half-disc.
 *
 * Sweep flag 1 runs clockwise on screen, so from the 9 o'clock point to the
 * 3 o'clock point it passes through 12.
 */
const HALF_DISC = `M${C - R_CORE} ${C}A${R_CORE} ${R_CORE} 0 0 1 ${C + R_CORE} ${C}Z`;

/** Everything except that half-disc, as one even-odd path. */
const NOT_HALF_DISC = `M0 0H${VIEW}V${VIEW}H0Z${HALF_DISC}`;

type Ring = {
  rx: number;
  ry: number;
  /** Inclination, and therefore the pose the ring settles into when still. */
  tilt: number;
  duration: string;
  reverse?: boolean;
  /** Parametric angles of the nodes riding this ring. */
  nodes: readonly number[];
};

const RINGS: readonly Ring[] = [
  { rx: 226, ry: 76, tilt: -17, duration: "88s", nodes: [10, 146, 264] },
  { rx: 192, ry: 60, tilt: 34, duration: "119s", reverse: true, nodes: [62, 208] },
  { rx: 158, ry: 44, tilt: 79, duration: "151s", nodes: [96, 288] },
  { rx: 122, ry: 108, tilt: -54, duration: "67s", reverse: true, nodes: [212] },
];

/** Hubs sit inside the shell so they read as *on* the field, not on its rim. */
const HUBS = [-70, -12, 42, 116, 170, 234].map((d) => point(d, R_HUB, R_HUB));

/** Only non-adjacent pairs — adjacent ones trace the outline instead of crossing it. */
const CHORDS: readonly (readonly [number, number])[] = [
  [0, 3],
  [1, 4],
  [2, 5],
  [0, 2],
  [3, 5],
  [1, 3],
];

/** Fixed positions. A particle system would cost a rAF loop nobody would notice. */
const DUST: readonly (readonly [number, number, number])[] = [
  [36, 64, 2.6],
  [418, 92, 2.0],
  [352, 406, 2.4],
  [92, 372, 2.2],
  [452, 286, 1.8],
  [24, 232, 2.0],
  [292, 30, 2.2],
  [176, 452, 1.8],
  [136, 110, 1.6],
  [400, 196, 1.5],
  [62, 300, 1.7],
  [330, 132, 1.4],
  [210, 16, 1.6],
  [466, 368, 1.5],
  [10, 150, 1.4],
  [248, 466, 1.8],
];

export function OrbitField({ className }: { className?: string }) {
  return (
    // No positioning or width in the base classes: callers place and size this
    // (it is meant to bleed past its column), and `cn` cannot resolve a
    // conflict between two utilities that set the same property.
    <div aria-hidden="true" className={cn("pointer-events-none aspect-square", className)}>
      <div className="relative h-full w-full">
        {/* Base bloom, then a flatter pool beneath the body so it sits *in*
            light rather than floating on a flat field. */}
        <span
          className="absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px]"
          style={{
            background:
              "radial-gradient(closest-side, var(--glow-strong), var(--glow-blue) 46%, transparent 74%)",
          }}
        />
        <span
          className="absolute left-1/2 top-[62%] h-[28%] w-[88%] -translate-x-1/2 rounded-[50%] blur-[56px]"
          style={{
            background: "radial-gradient(closest-side, var(--glow), transparent 72%)",
          }}
        />

        <svg
          viewBox={`0 0 ${VIEW} ${VIEW}`}
          className="relative h-full w-full"
          fill="none"
        >
          <defs>
            {/* Brighter on one flank so a ring reads as turning rather than
                lying flat. The gradient rotates with the ring, which makes the
                bright arc travel — a highlight, not a static hotspot. */}
            <linearGradient id="of-ring" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.06" />
              <stop offset="38%" stopColor="var(--accent)" stopOpacity="0.62" />
              <stop offset="72%" stopColor="var(--accent)" stopOpacity="0.26" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.06" />
            </linearGradient>

            {/* Body shading, lit from the upper left. */}
            <radialGradient id="of-body" cx="0.36" cy="0.28" r="0.82">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.34" />
              <stop offset="52%" stopColor="var(--accent)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.02" />
            </radialGradient>

            {/* Rim light along the lit edge, falling off around the terminator. */}
            <linearGradient id="of-rim" x1="0.12" y1="0.02" x2="0.9" y2="0.98">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.95" />
              <stop offset="40%" stopColor="var(--accent)" stopOpacity="0.34" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.08" />
            </linearGradient>

            <radialGradient id="of-spec">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="of-scatter">
              <stop offset="0%" stopColor="var(--glow)" />
              <stop offset="55%" stopColor="var(--glow)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--glow)" stopOpacity="0" />
            </radialGradient>

            <clipPath id="of-behind" clipPathUnits="userSpaceOnUse">
              <path d={HALF_DISC} />
            </clipPath>
            <clipPath id="of-front" clipPathUnits="userSpaceOnUse">
              <path clipRule="evenodd" d={NOT_HALF_DISC} />
            </clipPath>
          </defs>

          {/* Light scattering around the body. */}
          <circle cx={C} cy={C} r={152} fill="url(#of-scatter)" />

          {/* Dust, behind everything. */}
          <g opacity="0.6">
            {DUST.map(([cx, cy, r], i) => (
              <circle
                key={`dust-${i}`}
                cx={cx}
                cy={cy}
                r={r}
                fill="var(--star)"
                className="anim-pulse"
                style={{ animationDelay: `${i * -0.63}s`, animationDuration: "6.2s" }}
              />
            ))}
          </g>

          {/* The wireframe shell. A silhouette, one equator and one dotted
              latitude is enough volume — a full globe would fight the orbits. */}
          <circle cx={C} cy={C} r={R_FIELD} stroke="var(--border)" strokeWidth="1" />
          <ellipse
            cx={C}
            cy={C}
            rx={R_FIELD}
            ry={70}
            stroke="var(--border-subtle)"
            strokeWidth="1"
          />
          <circle
            cx={C}
            cy={C}
            r={R_HUB}
            stroke="var(--border-subtle)"
            strokeWidth="1"
            strokeDasharray="1 10"
          />

          {/* Chords through the interior — the network, as opposed to the shell.
              Drawn before the body, so the body cuts them. */}
          <g
            stroke="var(--accent)"
            strokeOpacity="0.14"
            strokeWidth="1"
            strokeLinecap="round"
          >
            {CHORDS.map(([a, b]) => (
              <line
                key={`${a}-${b}`}
                x1={HUBS[a].x}
                y1={HUBS[a].y}
                x2={HUBS[b].x}
                y2={HUBS[b].y}
              />
            ))}
          </g>

          {HUBS.map((h, i) => (
            <circle
              key={`hub-${i}`}
              cx={h.x}
              cy={h.y}
              r="3.4"
              fill="var(--accent)"
              className="anim-pulse"
              // Negative delays start each hub mid-cycle, so the field is
              // already breathing on first paint instead of flashing on.
              style={{ animationDelay: `${i * -0.7}s`, animationDuration: "5.4s" }}
            />
          ))}

          {/* ── Rings, far half ─────────────────────────────────────────── */}
          <g clipPath="url(#of-behind)" opacity="0.5">
            {RINGS.map((ring, i) => (
              <RingGroup key={`back-${i}`} ring={ring} index={i} />
            ))}
          </g>

          {/* ── The body ────────────────────────────────────────────────── */}
          {/* Opaque base first: this is what actually occludes the far half. */}
          <circle cx={C} cy={C} r={R_CORE} fill="var(--surface-3)" />
          <circle cx={C} cy={C} r={R_CORE} fill="url(#of-body)" />
          <ellipse
            cx={C - 30}
            cy={C - 34}
            rx={30}
            ry={20}
            fill="url(#of-spec)"
            transform={`rotate(-24 ${C - 30} ${C - 34})`}
          />
          <circle
            cx={C}
            cy={C}
            r={54}
            stroke="var(--accent-line)"
            strokeWidth="1"
            strokeDasharray="1 8"
          />
          <ellipse
            cx={C}
            cy={C}
            rx={R_CORE}
            ry={26}
            stroke="var(--accent-line)"
            strokeWidth="1"
            opacity="0.55"
          />
          <circle cx={C} cy={C} r={R_CORE} stroke="url(#of-rim)" strokeWidth="1.6" />
          <circle
            cx={C}
            cy={C}
            r="7"
            fill="var(--accent)"
            className="anim-pulse"
            style={{ animationDuration: "4.4s" }}
          />

          {/* ── Rings, near half ────────────────────────────────────────── */}
          <g clipPath="url(#of-front)">
            {RINGS.map((ring, i) => (
              <RingGroup key={`front-${i}`} ring={ring} index={i} />
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}

/**
 * One ring and the nodes riding it.
 *
 * Inclination is an SVG attribute; the spin is CSS on the child. Both turn
 * about (C, C), so the inner transform-origin lands on the outer rotation's
 * fixed point and the two compose cleanly.
 */
function RingGroup({ ring, index }: { ring: Ring; index: number }) {
  return (
    <g transform={`rotate(${ring.tilt} ${C} ${C})`}>
      <g
        className="animate-spin"
        style={{
          animationDuration: ring.duration,
          animationDirection: ring.reverse ? "reverse" : undefined,
          transformBox: "view-box",
          transformOrigin: `${C}px ${C}px`,
          willChange: "transform",
        }}
      >
        <ellipse
          cx={C}
          cy={C}
          rx={ring.rx}
          ry={ring.ry}
          stroke="url(#of-ring)"
          strokeWidth="1.4"
        />
        {ring.nodes.map((deg, n) => {
          const p = point(deg, ring.rx, ring.ry);
          return (
            <g key={`node-${deg}`}>
              <circle
                cx={p.x}
                cy={p.y}
                r="9"
                fill="var(--surface-3)"
                stroke="var(--accent-line)"
                strokeWidth="1"
              />
              <circle
                cx={p.x}
                cy={p.y}
                r="3.4"
                fill="var(--accent)"
                className="anim-pulse"
                style={{
                  animationDelay: `${(index * 3 + n) * -0.55}s`,
                  animationDuration: "5s",
                }}
              />
            </g>
          );
        })}
      </g>
    </g>
  );
}
