"use client";

import { useState } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { cn } from "@/lib/cn";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";

/**
 * How a request actually moves through a system, drawn as a TOPOLOGY.
 *
 * WHY THIS REPLACED THE LAYER STACK. The previous version was five stacked
 * bands with a rail down each side. It was accurate about layering and said
 * nothing about a system: no queue, no fan-out, no return path with its own
 * cost, no sense that anything is distributed. It read as five labelled boxes
 * because that is what it was.
 *
 * Real engineering diagrams — AWS reference architectures, Kubernetes service
 * maps, CI graphs, an APM service map — share a specific grammar, and this
 * borrows it deliberately:
 *
 *   - NODES ARE TYPED and typed things look different. An edge client, a
 *     service, a queue and a datastore are drawn with different glyphs and
 *     different accents, because half of reading a diagram is knowing what
 *     kind of thing you are looking at before you read its label.
 *   - EDGES ARE DIRECTED, and the return path is a first-class edge rather
 *     than an afterthought. A request that never comes back is not a system.
 *   - EVERY NODE CARRIES A FACT. That is what separates an architecture
 *     diagram from an illustration of one, and every fact here is checkable
 *     in a repository.
 *   - IT IS A GRAPH, not a column. Auth hangs off the gateway and the cache
 *     hangs off the workers, because that is where they actually sit.
 *
 * TRAFFIC. The old board pushed discrete packet divs along its rails, and the
 * complaint was exactly the failure mode of that technique: packets appear,
 * vanish and leave gaps, because a packet is an object with a beginning and an
 * end. Flow here is a marching dash pattern on the edges themselves —
 * continuous by construction, wrapping seamlessly at one dash period, present
 * along the whole of every edge at once. It is also what real network diagrams
 * use. See `.anim-edge` in globals.css.
 *
 * GEOMETRY. The board keeps a FIXED aspect ratio and the SVG uses a normal
 * uniform viewBox — no `preserveAspectRatio="none"`. That decision is load
 * bearing: the previous board stretched its viewBox, which distorted every
 * circle into an ellipse and made stroke weights inconsistent between
 * horizontal and vertical runs. With uniform scaling the curves, the dashes
 * and the arrowheads are all correct for free, and node cards can be placed in
 * the same coordinate space as percentages.
 */

type NodeKind = "edge" | "service" | "queue" | "store";

type Node = {
  id: string;
  x: number;
  y: number;
  label: string;
  tech: string;
  /** A checkable fact, not a status. Nothing here is faked telemetry. */
  fact: string;
  kind: NodeKind;
};

/** Coordinate space shared by the SVG viewBox and the node cards. */
const W = 1000;
const H = 430;

const ROW1 = 150;
const ROW2 = 330;

const NODES: Node[] = [
  { id: "client",  x: 96,  y: ROW1, label: "Client",      tech: "Expo · react-native-web", fact: "3 targets, 1 codebase", kind: "edge" },
  { id: "gateway", x: 340, y: ROW1, label: "API gateway", tech: "ASP.NET Core · MediatR",  fact: "CQRS, command per use case", kind: "service" },
  { id: "bus",     x: 584, y: ROW1, label: "Message bus", tech: "RabbitMQ · MassTransit",  fact: "8 bounded contexts", kind: "queue" },
  { id: "workers", x: 828, y: ROW1, label: "Workers",     tech: "detect · score · alert",  fact: "retry ladder per endpoint", kind: "service" },
  { id: "auth",    x: 340, y: ROW2, label: "Auth",        tech: "JWT · RS256",             fact: "keys minted on first run", kind: "service" },
  { id: "db",      x: 584, y: ROW2, label: "PostgreSQL",  tech: "EF Core · partitioned",   fact: "money in integer cents", kind: "store" },
  { id: "cache",   x: 828, y: ROW2, label: "Redis",       tech: "sliding windows",         fact: "rate + dedupe windows", kind: "store" },
];

/**
 * Half-extents of a node card in viewBox units, used both to size the cards
 * and to land the edge endpoints on their borders. 92 gives a ~220px card at
 * the full stage width, which is what "API gateway" and "ASP.NET Core ·
 * MediatR" actually need to render without truncating.
 */
const NW = 92;
const NH = 44;

/**
 * `label` is what actually turns this from a diagram into an architecture
 * document.
 *
 * The previous version drew anonymous arrows between named boxes, and an
 * anonymous arrow says only "these two things are connected" — which is the
 * least interesting fact about a distributed system. What an engineer wants to
 * know is WHAT crosses the boundary: an HTTP verb, a message type, a query.
 * Naming the traffic is also the difference between a claim and something a
 * reader can go and grep for.
 *
 * `at` positions the label along the edge, 0 to 1.
 */
type Edge = {
  from: string;
  to: string;
  d: string;
  kind: "request" | "response" | "side";
  label: string;
  /** Where on the edge the label sits, in viewBox coordinates. */
  lx: number;
  ly: number;
};

const EDGES: Edge[] = [
  // The request path, left to right along row one.
  { from: "client",  to: "gateway", kind: "request", label: "HTTPS", lx: 218, ly: ROW1 - 14, d: `M ${96 + NW} ${ROW1} H ${340 - NW}` },
  { from: "gateway", to: "bus",     kind: "request", label: "publish", lx: 462, ly: ROW1 - 14, d: `M ${340 + NW} ${ROW1} H ${584 - NW}` },
  { from: "bus",     to: "workers", kind: "request", label: "consume", lx: 706, ly: ROW1 - 14, d: `M ${584 + NW} ${ROW1} H ${828 - NW}` },

  // Satellites: things a request TOUCHES without travelling through. Drawn in
  // the neutral border colour rather than the request accent, because they are
  // not steps in the path and colouring them as if they were is a lie about
  // the shape of the system.
  { from: "gateway", to: "auth",  kind: "side", label: "verify", lx: 348, ly: 250, d: `M 340 ${ROW1 + NH} V ${ROW2 - NH}` },
  { from: "workers", to: "cache", kind: "side", label: "dedupe", lx: 836, ly: 250, d: `M 828 ${ROW1 + NH} V ${ROW2 - NH}` },
  // A diagonal, because that is where the two nodes are. Elbowing it around
  // would have run it straight down the cache's own edge.
  { from: "workers", to: "db",    kind: "side", label: "persist", lx: 726, ly: 236, d: `M ${828 - 30} ${ROW1 + NH} L ${584 + NW} ${ROW2 - NH}` },

  /*
    THE RETURN PATH, routed over the top rather than mirrored underneath.

    A response does not retrace the request — in both of these systems it
    arrives over an already-open socket, which is a different route with a
    different cost, and drawing it as its own sweep is the honest picture. It
    runs above row one so it crosses nothing: the first version tried to route
    it along the bottom and had to pass through two datastores to get there.
  */
  {
    from: "workers",
    to: "client",
    kind: "response",
    label: "SignalR push",
    lx: 462,
    ly: 50,
    d: `M 828 ${ROW1 - NH} V 86 Q 828 62 800 62 H 124 Q 96 62 96 86 V ${ROW1 - NH}`,
  },
];

/**
 * What happens when a hop fails.
 *
 * A topology that only draws the happy path is a sales diagram. The failure
 * semantics are the part an engineer reads a system for, and every line here
 * is a real behaviour in these repositories rather than a general principle.
 */
const FAILURE_MODES = [
  ["gateway", "401 before any handler runs — auth is middleware, not a check inside each endpoint"],
  ["bus", "unacked messages redeliver; poison messages land in a dead-letter queue rather than looping"],
  ["workers", "retry ladder per endpoint, then the alert is stored unscored rather than dropped"],
] as const;

const KIND_ACCENT: Record<NodeKind, string> = {
  edge: "var(--status-live)",
  service: "var(--accent)",
  queue: "var(--status-wip)",
  store: "var(--glow-strong)",
};

export function ArchitectureBoard() {
  const reduced = useReducedMotionPref();
  const [hovered, setHovered] = useState<string | null>(null);

  /** An edge is lit when either end is the node under the pointer. */
  const edgeLit = (e: Edge) => hovered === null || e.from === hovered || e.to === hovered;

  return (
    <figure className="relative w-full">
      <figcaption className="sr-only">
        <h3 id="architecture-board-title">
          How a request moves through a system I build
        </h3>
      </figcaption>

      {/* The light the board sits in. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[86%] w-[92%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] blur-[70px]"
        style={{
          background:
            "radial-gradient(closest-side, var(--glow-strong), var(--glow-blue) 48%, transparent 76%)",
        }}
      />

      {/* ── Desktop: the graph ─────────────────────────────────────────── */}
      <div
        className="relative hidden lg:block"
        style={{ aspectRatio: `${W} / ${H}` }}
      >
        {/* Dashboard canvas. A faint grid is the single cheapest cue that
            something is a diagram surface rather than a decorated panel. */}
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-2xl border border-line-subtle"
          style={{
            backgroundImage:
              "linear-gradient(var(--border-subtle) 1px, transparent 1px)," +
              "linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage:
              "radial-gradient(120% 100% at 50% 40%, #000 40%, transparent 88%)",
            WebkitMaskImage:
              "radial-gradient(120% 100% at 50% 40%, #000 40%, transparent 88%)",
          }}
        />

        <svg
          aria-hidden="true"
          viewBox={`0 0 ${W} ${H}`}
          className="absolute inset-0 h-full w-full"
          fill="none"
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 8 8"
              refX="6"
              refY="4"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 7 4 L 0 7 z" fill="var(--border-strong)" />
            </marker>
          </defs>

          {EDGES.map((e) => {
            const lit = edgeLit(e);
            const colour =
              e.kind === "response"
                ? "var(--status-live)"
                : e.kind === "side"
                  ? "var(--border-strong)"
                  : "var(--accent)";
            return (
              <g key={`${e.from}-${e.to}`} opacity={lit ? 1 : 0.22}>
                {/* The rail: always visible, so the shape of the system reads
                    even with motion off. */}
                <path
                  d={e.d}
                  stroke={colour}
                  strokeWidth={1.5}
                  opacity={0.28}
                  markerEnd={e.kind === "side" ? undefined : "url(#arrow)"}
                />
                {/* The traffic on it. */}
                {!reduced && (
                  <path
                    d={e.d}
                    stroke={colour}
                    strokeWidth={2}
                    strokeLinecap="round"
                    className={e.kind === "response" ? "anim-edge-rev" : "anim-edge"}
                  />
                )}
                {/* WHAT crosses this boundary. An unnamed arrow says only that
                    two things are connected, which is the least interesting
                    fact about a distributed system. */}
                <text
                  x={e.lx}
                  y={e.ly}
                  textAnchor="middle"
                  fill="var(--fg-subtle)"
                  style={{
                    fontFamily: "var(--font-mono, ui-monospace), monospace",
                    /*
                      SEVEN, not fifteen. This viewBox is 1000 units wide and
                      renders around 1900px, so every unit is ~1.9px: at 15 the
                      labels came out 28px and "publish" grew wider than the
                      60-unit gap it was centred in, overlapping the cards on
                      both sides. Type inside a scaled viewBox has to be sized
                      in the viewBox's units, not in the units it looks like.
                    */
                    fontSize: 7,
                    letterSpacing: "0.04em",
                  }}
                >
                  {e.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Nodes are real DOM, so their names, technologies and facts are text
            a reader and a crawler both get. */}
        <ol
          aria-labelledby="architecture-board-title"
          className="absolute inset-0"
        >
          {NODES.map((n) => (
            <li
              key={n.id}
              className="absolute"
              style={{
                left: `${(n.x / W) * 100}%`,
                top: `${(n.y / H) * 100}%`,
                width: `${((NW * 2) / W) * 100}%`,
                transform: "translate(-50%, -50%)",
              }}
              onPointerEnter={(e) => {
                if (e.pointerType === "mouse") setHovered(n.id);
              }}
              onPointerLeave={() => setHovered(null)}
            >
              <NodeCard node={n} dim={hovered !== null && hovered !== n.id} reduced={reduced} />
            </li>
          ))}
        </ol>
      </div>

      {/* ── Mobile: the same graph as a route ──────────────────────────────
          Not the desktop board scaled down — a 1000x560 graph at 358px wide
          puts every label under 6px. A phone gets the same nodes in the same
          order as a vertical route with the flow running down its spine,
          which is how you would read a trace on a small screen anyway. */}
      <ol className="relative lg:hidden">
        {NODES.map((n, i) => (
          <li key={n.id} className="relative pl-11">
            {i < NODES.length - 1 && (
              <span
                aria-hidden="true"
                className="absolute left-[13px] top-8 bottom-0 w-px"
                style={{ background: "var(--border)" }}
              >
                {!reduced && (
                  <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 1 100">
                    <path
                      d="M 0.5 0 V 100"
                      stroke={KIND_ACCENT[n.kind]}
                      strokeWidth={1.5}
                      className="anim-edge"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                )}
              </span>
            )}
            <span
              aria-hidden="true"
              className="absolute left-0 top-1 flex h-7 w-7 items-center justify-center rounded-full border border-line bg-surface-3"
            >
              <KindGlyph kind={n.kind} />
            </span>
            <div className="pb-7">
              <NodeCard node={n} dim={false} reduced={reduced} />
            </div>
          </li>
        ))}
      </ol>

      {/* Legend — names what the two colours mean, so the diagram is readable
          rather than merely decorative. */}
      <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-2">
        <p className="label flex items-center gap-2 text-fg-subtle">
          <span aria-hidden="true" className="inline-block h-px w-6 bg-accent" />
          Request, in
        </p>
        <p className="label flex items-center gap-2 text-fg-subtle">
          <span
            aria-hidden="true"
            className="inline-block h-px w-6"
            style={{ background: "var(--status-live)" }}
          />
          Response, over an open socket
        </p>
        <p className="label ml-auto text-fg-subtle">
          Every fact here is checkable in a repository
        </p>
      </div>

      {/* ── What happens when a hop fails ────────────────────────────────
          The happy path is the easy half. This is the half an engineer reads
          a system for, and leaving it out is what makes an architecture
          diagram read as marketing. */}
      <div className="mt-8 border-t border-line-subtle pt-7">
        <Eyebrow as="span" className="text-fg-subtle">
          And when a hop fails
        </Eyebrow>
        <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-3">
          {FAILURE_MODES.map(([id, body]) => {
            const node = NODES.find((n) => n.id === id)!;
            return (
              <div key={id} className="min-w-0">
                <dt className="flex items-center gap-2">
                  <KindGlyph kind={node.kind} />
                  <span className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-fg-muted">
                    {node.label}
                  </span>
                </dt>
                <dd className="mt-2 text-[0.8125rem] leading-relaxed text-fg-subtle">
                  {body}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </figure>
  );
}

function NodeCard({
  node,
  dim,
  reduced,
}: {
  node: Node;
  dim: boolean;
  reduced: boolean;
}) {
  return (
    <article
      className={cn(
        "edge-lit relative overflow-hidden rounded-xl border px-3.5 py-3",
        dim ? "border-line-subtle" : "border-line",
        !reduced && "transition-[opacity,border-color,transform] duration-[var(--dur-mid)]",
        dim ? "opacity-45" : "opacity-100",
      )}
      style={{ background: "var(--panel-solid)" }}
    >
      {/* A hairline in the node's own type colour along its top edge. Typed
          things should be identifiable before they are read. */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: KIND_ACCENT[node.kind], opacity: 0.75 }}
      />

      <div className="flex items-center gap-2">
        <span className="hidden lg:inline-flex">
          <KindGlyph kind={node.kind} />
        </span>
        <h4 className="truncate text-[0.9375rem] font-medium tracking-[var(--tracking-heading)] text-fg">
          {node.label}
        </h4>
      </div>
      <p className="mt-1 truncate font-mono text-[0.6875rem] leading-none text-fg-subtle">
        {node.tech}
      </p>
      <p className="mt-2 text-[0.75rem] leading-snug text-fg-muted">{node.fact}</p>
    </article>
  );
}

/** One purpose-drawn mark per node type, in the site's own visual language. */
function KindGlyph({ kind }: { kind: NodeKind }) {
  const c = KIND_ACCENT[kind];
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      {kind === "edge" && (
        <>
          <rect x="3" y="2" width="10" height="12" rx="2" stroke={c} strokeWidth="1.4" />
          <path d="M6.5 12h3" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
        </>
      )}
      {kind === "service" && (
        <>
          <rect x="2" y="2" width="12" height="12" rx="3" stroke={c} strokeWidth="1.4" />
          <path d="M5.5 8h5" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
        </>
      )}
      {kind === "queue" && (
        <>
          <path d="M2 5h12M2 8h12M2 11h12" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
        </>
      )}
      {kind === "store" && (
        <>
          <ellipse cx="8" cy="4.5" rx="5" ry="2.2" stroke={c} strokeWidth="1.4" />
          <path d="M3 4.5v7c0 1.2 2.2 2.2 5 2.2s5-1 5-2.2v-7" stroke={c} strokeWidth="1.4" />
        </>
      )}
    </svg>
  );
}
