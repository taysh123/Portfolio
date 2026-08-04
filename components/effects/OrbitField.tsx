import { cn } from "@/lib/cn";

/**
 * The contact visual: an armillary field.
 *
 * A node network suspended on a sphere — six hubs wired to each other by
 * chords through the interior — with three orbit rings turning around it at
 * different inclinations. It is the same "system" idea as the hero diagram,
 * viewed from outside instead of exploded: the shape you reach when you want
 * to say "there is a network here" without drawing a globe.
 *
 * Motion is entirely CSS so the global kill-switch in globals.css reaches it.
 * Each ring keeps its own duration (74 / 97 / 131s) precisely so the three
 * never come back into phase — a synced set reads as a spinning wheel, an
 * unsynced one reads as orbit. Under reduced motion the spin resolves to its
 * 360° end state, which is 0°, so the rings simply rest at the inclinations
 * they were authored at and the composition still holds.
 *
 * Decorative throughout: `aria-hidden`, no text, no interactive target.
 */

const VIEW = 400;
/** Centre of the field, in viewBox units. */
const C = VIEW / 2;

/** Parametric point on an ellipse centred on the field. */
function point(deg: number, rx: number, ry: number) {
  const t = (deg * Math.PI) / 180;
  return { x: C + rx * Math.cos(t), y: C + ry * Math.sin(t) };
}

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
  { rx: 178, ry: 62, tilt: -21, duration: "74s", nodes: [14, 152, 268] },
  { rx: 148, ry: 52, tilt: 37, duration: "97s", reverse: true, nodes: [58, 205] },
  { rx: 122, ry: 38, tilt: 84, duration: "131s", nodes: [96, 288] },
];

/** Hubs sit inside the silhouette so they read as *on* the sphere, not on its rim. */
const HUBS = [-68, -8, 44, 118, 172, 232].map((d) => point(d, 148, 148));

/** Only non-adjacent pairs — adjacent ones would trace the outline instead of crossing it. */
const CHORDS: readonly (readonly [number, number])[] = [
  [0, 3],
  [1, 4],
  [2, 5],
  [0, 2],
  [3, 5],
];

export function OrbitField({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none relative mx-auto aspect-square w-full max-w-[24rem]",
        className,
      )}
    >
      {/* The one place --glow is allowed: atmosphere behind the object, never
          on its structure. */}
      <span
        className="absolute left-1/2 top-1/2 h-[74%] w-[74%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, var(--glow-strong), var(--glow-blue) 46%, transparent 74%)",
        }}
      />

      <svg
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        className="relative h-full w-full"
        fill="none"
      >
        <defs>
          {/* Brighter on one flank so a ring reads as passing behind the
              sphere rather than lying flat on it. */}
          <linearGradient id="of-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.08" />
            <stop offset="42%" stopColor="var(--accent)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.1" />
          </linearGradient>
          <radialGradient id="of-core">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Sphere. A silhouette, one equator and one dotted latitude is enough
            volume — a full wireframe globe would fight the orbits. */}
        <circle cx={C} cy={C} r={176} stroke="var(--border)" strokeWidth="1" />
        <ellipse
          cx={C}
          cy={C}
          rx={176}
          ry={58}
          stroke="var(--border-subtle)"
          strokeWidth="1"
        />
        <circle
          cx={C}
          cy={C}
          r={118}
          stroke="var(--border-subtle)"
          strokeWidth="1"
          strokeDasharray="1 9"
        />

        {/* Chords through the interior — the network, as opposed to the shell. */}
        <g
          stroke="var(--accent)"
          strokeOpacity="0.16"
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
            r="3"
            fill="var(--accent)"
            className="anim-pulse"
            // Negative delays start each hub mid-cycle, so the field is already
            // breathing on first paint instead of flashing on together.
            style={{ animationDelay: `${i * -0.7}s`, animationDuration: "5.4s" }}
          />
        ))}

        <circle cx={C} cy={C} r="62" fill="url(#of-core)" />
        <circle
          cx={C}
          cy={C}
          r="21"
          fill="var(--surface-3)"
          stroke="var(--accent-line)"
          strokeWidth="1"
        />
        <circle
          cx={C}
          cy={C}
          r="6"
          fill="var(--accent)"
          className="anim-pulse"
          style={{ animationDuration: "4.4s" }}
        />

        {RINGS.map((ring, i) => (
          // Inclination is an SVG attribute; the spin is CSS on the child.
          // Both turn about (C, C), so the inner transform-origin lands on the
          // outer rotation's fixed point and the two compose cleanly.
          <g key={`ring-${i}`} transform={`rotate(${ring.tilt} ${C} ${C})`}>
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
                strokeWidth="1.25"
              />
              {ring.nodes.map((deg, n) => {
                const p = point(deg, ring.rx, ring.ry);
                return (
                  <g key={`node-${deg}`}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="6.5"
                      fill="var(--surface-3)"
                      stroke="var(--accent-line)"
                      strokeWidth="1"
                    />
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="2.6"
                      fill="var(--accent)"
                      className="anim-pulse"
                      style={{ animationDelay: `${(i * 3 + n) * -0.55}s` }}
                    />
                  </g>
                );
              })}
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}
