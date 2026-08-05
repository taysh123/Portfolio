"use client";

import { useState, type CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";

/**
 * How a request actually moves through a system, drawn as a board.
 *
 * This replaces an isometric slab stack. The stack looked like an object; this
 * reads like a diagram an engineer would draw on a whiteboard — which is the
 * point, because the claim being made is "I think in layers", and a diagram
 * argues that better than a rendered solid does.
 *
 * The two rails are the idea. A request descends the left one through every
 * layer and the response climbs the right one back out, which is the thing
 * that makes it a *system* rather than five labelled boxes: it shows that the
 * layers are ordered, that traffic crosses all of them, and that the return
 * path is a real path with its own cost.
 *
 * Depth comes from progressive inset (each band narrower than the one above)
 * plus edge lighting, not from a 3D transform. Bands stay axis-aligned so the
 * layer names and technologies — which are content, not decoration — stay
 * perfectly legible.
 */

type Layer = {
  id: string;
  name: string;
  /** What this layer is responsible for, in the fewest possible words. */
  note: string;
  tech: string[];
};

const LAYERS: Layer[] = [
  { id: "interface", name: "Interface", note: "every state, including the ugly ones", tech: ["React", "Next.js", "Tailwind"] },
  { id: "services", name: "Services", note: "has to stay up", tech: ["ASP.NET Core", "SignalR", "RabbitMQ"] },
  { id: "domain", name: "Domain", note: "rules, no I/O", tech: ["C#", "TypeScript", "Clean Architecture"] },
  { id: "data", name: "Data", note: "the truth lives here", tech: ["PostgreSQL", "SQLite FTS5", "Redis"] },
  { id: "platform", name: "Platform", note: "one command to run it", tech: ["Docker", "GitHub Actions", "Linux"] },
];

const N = LAYERS.length;
/** Vertical centre of band i, as a percentage of the board. */
const midY = (i: number) => ((i + 0.5) / N) * 100;

export function ArchitectureBoard() {
  const reduced = useReducedMotionPref();
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <figure className="relative w-full">
      <figcaption className="sr-only">
        <h3 id="architecture-board-title">
          How a request moves through a system I build
        </h3>
      </figcaption>

      {/* Board glow — the light the diagram sits in. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[86%] w-[92%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] blur-[70px]"
        style={{
          background:
            "radial-gradient(closest-side, var(--glow-strong), var(--glow-blue) 48%, transparent 76%)",
        }}
      />

      <div className="relative">
        <Rails hovered={hovered} animated={!reduced} />

        <ol
          aria-labelledby="architecture-board-title"
          className="relative z-10 grid gap-2.5"
          style={{ gridTemplateRows: `repeat(${N}, minmax(0, 1fr))` }}
        >
          {LAYERS.map((layer, i) => {
            const active = hovered === layer.id;
            // Each band a little narrower than the one above: a stack read
            // from the front, without tipping the type off horizontal.
            const inset = i * 1.2;

            return (
              <li
                key={layer.id}
                onPointerEnter={(e) => {
                  // Mouse only — a touch "hover" would strand a band lifted.
                  if (!reduced && e.pointerType === "mouse") setHovered(layer.id);
                }}
                onPointerLeave={() => !reduced && setHovered(null)}
                style={
                  {
                    marginInline: `${inset}%`,
                    "--lift": active ? "-4px" : "0px",
                  } as CSSProperties
                }
                className={cn(
                  "edge-lit group/band relative overflow-hidden rounded-2xl border px-5 py-4",
                  active ? "border-accent-line shadow-e3" : "border-line shadow-e1",
                  !reduced &&
                    "transition-[transform,border-color,box-shadow] duration-[var(--dur-mid)] ease-[var(--ease-out-expo)]",
                )}
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-0 -z-10"
                  style={{ background: "var(--panel-fill-deep)" }}
                />
                {/* Pre-rendered highlight, revealed by opacity alone. */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute inset-0 -z-10",
                    active ? "opacity-100" : "opacity-0",
                    !reduced && "transition-opacity duration-[var(--dur-mid)]",
                  )}
                  style={{
                    background:
                      "linear-gradient(140deg, var(--accent-soft), transparent 68%)",
                  }}
                />

                <div
                  className="flex flex-wrap items-baseline gap-x-3 gap-y-1"
                  style={{ transform: "translateY(var(--lift))" }}
                >
                  <span className="label tnum text-fg-subtle">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-base font-medium tracking-[var(--tracking-heading)] text-fg lg:text-lg">
                    {layer.name}
                  </p>
                  <p className="label text-fg-subtle">{layer.note}</p>
                </div>

                <ul
                  className="mt-3 flex flex-wrap gap-1.5"
                  style={{ transform: "translateY(var(--lift))" }}
                >
                  {layer.tech.map((t) => (
                    <li
                      key={t}
                      className="rounded-full border border-line-subtle bg-surface-1 px-2.5 py-1 font-mono text-[0.6875rem] leading-none text-fg-muted"
                    >
                      {t}
                    </li>
                  ))}
                </ul>

                {/* Ports where the rails meet this band. */}
                <Port side="left" active={active} />
                <Port side="right" active={active} />
              </li>
            );
          })}
        </ol>
      </div>

      {/* Legend — names what the two rails mean, so the diagram is readable
          rather than merely decorative. */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <p className="label flex items-center gap-2 text-fg-subtle">
          <span aria-hidden="true" className="inline-block h-px w-6 bg-accent" />
          Request, descending
        </p>
        <p className="label flex items-center gap-2 text-fg-subtle">
          Response, returning
          <span
            aria-hidden="true"
            className="inline-block h-px w-6"
            style={{ background: "var(--status-live)" }}
          />
        </p>
      </div>
    </figure>
  );
}

function Port({ side, active }: { side: "left" | "right"; active: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full transition-colors duration-[var(--dur-mid)]",
        side === "left" ? "-left-[3px]" : "-right-[3px]",
      )}
      style={{ background: active ? "var(--accent)" : "var(--border-strong)" }}
    />
  );
}

/**
 * The rails, drawn behind the bands.
 *
 * `preserveAspectRatio="none"` with a 0–100 viewBox lets the paths be written
 * in percentages, so they track the bands at any board height without any
 * measurement in JS.
 */
function Rails({ hovered, animated }: { hovered: string | null; animated: boolean }) {
  const down = `M 1.6 ${midY(0)} L 1.6 ${midY(N - 1)}`;
  const up = `M 98.4 ${midY(N - 1)} L 98.4 ${midY(0)}`;

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      fill="none"
    >
      {/*
        `vector-effect="non-scaling-stroke"` is required here. With
        `preserveAspectRatio="none"` the viewBox stretches x and y by different
        factors, so a single stroke-width renders hairline-thin on the vertical
        rails and heavy on the horizontal stubs. This keeps every line the same
        weight regardless of the board's aspect.
      */}
      <path d={down} stroke="var(--accent)" strokeWidth="1.4" vectorEffect="non-scaling-stroke" opacity="0.55" />
      <path d={up} stroke="var(--border-strong)" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />

      {/* Stubs from each rail into its band's port. */}
      {LAYERS.map((l, i) => (
        <g key={l.id} opacity={hovered === null || hovered === l.id ? 1 : 0.32}>
          <path
            d={`M 1.6 ${midY(i)} L ${5 + i * 1.2} ${midY(i)}`}
            stroke="var(--accent)"
            strokeWidth="1.2"
            vectorEffect="non-scaling-stroke"
            opacity="0.4"
          />
          <path
            d={`M 98.4 ${midY(i)} L ${95 - i * 1.2} ${midY(i)}`}
            stroke="var(--border-strong)"
            strokeWidth="1.2"
            vectorEffect="non-scaling-stroke"
          />
        </g>
      ))}

      {animated && (
        <>
          {/* Request descending, response returning — offset so they read as
              one round trip rather than two unrelated loops. */}
          <circle r="1.4" fill="var(--accent)">
            <animateMotion dur="4.5s" repeatCount="indefinite" path={down} />
          </circle>
          <circle r="1.2" fill="var(--status-live)">
            <animateMotion dur="4.5s" begin="2.2s" repeatCount="indefinite" path={up} />
          </circle>
        </>
      )}
    </svg>
  );
}
