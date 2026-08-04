"use client";

import { useState, type CSSProperties } from "react";
import { Tag } from "@/components/ui/Tag";
import { cn } from "@/lib/cn";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";

/**
 * The layer model, drawn as an exploded stack of slabs.
 *
 * Two constraints shaped this component:
 *
 *   1. The layer names and technologies are CONTENT, not decoration. So the
 *      markup is one plain `<ul>` of `<li>` rows that a screen reader can walk
 *      in order, and the isometric view is a purely visual treatment applied to
 *      that same list at `lg`. Below `lg` the CSS simply stops applying, and the
 *      list falls back to stacked rows — no second copy of the data, no
 *      duplicated DOM to drift out of sync.
 *
 *   2. Everything that moves has to be transform or opacity. The hover state
 *      therefore lifts a slab by changing `--tz` (which feeds a `translateZ`)
 *      and reveals a pre-rendered accent overlay by fading it in, rather than
 *      transitioning `background-color` off the compositor.
 *
 * `--k` is the responsiveness switch: 0 below `lg`, 1 at `lg` and up. Every 3D
 * quantity is multiplied by it, so the transforms can live in `style` (where
 * `--tz` has to be anyway) while still being breakpoint-aware.
 */

type Layer = {
  id: string;
  name: string;
  /** A short technical annotation — what this layer is responsible for. */
  note: string;
  tech: string[];
};

const LAYERS: Layer[] = [
  {
    id: "interface",
    name: "Interface",
    note: "every state",
    tech: ["React", "Next.js", "Tailwind CSS"],
  },
  {
    id: "services",
    name: "Services",
    note: "has to stay up",
    tech: ["ASP.NET Core", "SignalR", "RabbitMQ"],
  },
  {
    id: "domain",
    name: "Domain",
    note: "rules, no I/O",
    tech: ["C#", "TypeScript", "Clean Architecture"],
  },
  {
    id: "data",
    name: "Data",
    note: "the truth lives here",
    tech: ["PostgreSQL", "SQLite FTS5", "Redis"],
  },
  {
    id: "platform",
    name: "Platform",
    note: "one command to run",
    tech: ["Docker", "GitHub Actions", "Linux"],
  },
];

/** Depth between slabs, and how far a hovered slab pulls out of the stack. */
const Z_STEP = 196;
const Z_LIFT = 62;

/** Index 2 (Domain) sits at z = 0, so the stack is centred on the middle slab. */
const CENTRE = 2;

export function LayerStack() {
  const reduced = useReducedMotionPref();
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    // `w-full` is load-bearing: at `lg` every child is absolutely positioned, so
    // the figure has no intrinsic width and collapses to nothing as a flex item.
    <figure className="relative isolate w-full [--k:0] lg:[--k:1]">
      {/* The visible label is rendered by the About panel; this keeps the
          list's accessible name without printing the heading twice. */}
      <figcaption className="sr-only">
        <h3 id="layer-stack-title">How I lay a system out</h3>
      </figcaption>

      {/* Atmosphere, and only atmosphere — it sits behind the solid slabs. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 hidden h-[74%] w-[104%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] blur-[80px] lg:block"
        style={{
          background:
            "radial-gradient(closest-side, var(--glow-strong), var(--glow-blue) 46%, transparent 74%)",
        }}
      />

      <div className="relative lg:h-[40rem]" style={{ perspective: "1700px" }}>
        <div
          className="lg:absolute lg:inset-0"
          style={{
            /*
              rotateX carries the depth; rotateZ is the in-plane roll, and the
              roll is what tips the type off horizontal. The layer names and
              technologies here are CONTENT, not decoration, so the roll is
              held to -6deg — enough for the stack to read as a 3D object,
              shallow enough that the mono labels stay scannable. The X tilt
              stays at 30deg because it also sets the vertical separation
              between slabs.
            */
            transform:
              "rotateX(calc(30deg * var(--k))) rotateZ(calc(-6deg * var(--k)))",
            transformStyle: "preserve-3d",
          }}
        >
          <ul
            aria-labelledby="layer-stack-title"
            className="flex flex-col gap-3 lg:absolute lg:inset-0 lg:block"
            style={{ transformStyle: "preserve-3d" }}
          >
            {LAYERS.map((layer, i) => {
              const active = hovered === layer.id;
              const z = (CENTRE - i) * Z_STEP + (active ? Z_LIFT : 0);

              return (
                <li
                  key={layer.id}
                  onPointerEnter={(e) => {
                    // Mouse only: a touch "hover" would strand a slab lifted.
                    if (!reduced && e.pointerType === "mouse") {
                      setHovered(layer.id);
                    }
                  }}
                  onPointerLeave={() => {
                    if (!reduced) setHovered(null);
                  }}
                  style={
                    {
                      "--tz": `${z}px`,
                      transform: "translateZ(calc(var(--tz) * var(--k)))",
                      background: "var(--panel-fill-deep)",
                    } as CSSProperties
                  }
                  className={cn(
                    "edge-lit relative overflow-hidden rounded-2xl border border-line px-5 py-4 shadow-e2 backdrop-blur-[10px]",
                    "lg:absolute lg:inset-x-[6%] lg:top-1/2 lg:-mt-12 lg:min-h-24 lg:px-6 lg:py-5",
                    !reduced &&
                      "lg:transition-transform lg:duration-[var(--dur-mid)] lg:ease-[var(--ease-out-expo)]",
                  )}
                >
                  {/* Lit top edge — what makes a flat rectangle read as a slab. */}
                  <span
                    aria-hidden="true"
                    className="hairline pointer-events-none absolute inset-x-0 top-0"
                  />

                  {/* Pre-rendered "brightened" state, revealed by opacity alone. */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "pointer-events-none absolute inset-0 hidden rounded-xl border border-accent-line lg:block",
                      active ? "opacity-100" : "opacity-0",
                      !reduced &&
                        "transition-opacity duration-[var(--dur-mid)] ease-[var(--ease-out-expo)]",
                    )}
                    style={{
                      background:
                        "linear-gradient(152deg, var(--accent-soft), transparent 70%)",
                    }}
                  />

                  <div className="relative flex flex-col gap-2">
                    <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                      <p className="text-base font-medium tracking-[var(--tracking-heading)] text-fg lg:text-lg">
                        {layer.name}
                      </p>
                      <p className="label text-fg-subtle">{layer.note}</p>
                    </div>

                    <ul className="flex flex-wrap gap-1.5">
                      {layer.tech.map((t) => (
                        <li key={t}>
                          <Tag>{t}</Tag>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Light columns standing along the stack axis, tying the slabs
              together. `rotateX(90deg)` stands them out of the slab plane, so
              they read as part of the scene rather than lines drawn on it. */}
          <Spine x="18%" />
          <Spine x="50%" delay="-1.8s" />
          <Spine x="82%" delay="-3.4s" />
        </div>
      </div>
    </figure>
  );
}

function Spine({ x, delay }: { x: string; delay?: string }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 hidden h-px w-px lg:block"
      style={{ left: x, transformStyle: "preserve-3d" }}
    >
      <span
        className="anim-pulse absolute left-0 top-0 block h-[50rem] w-px"
        style={{
          transformOrigin: "0 0",
          transform: "rotateX(90deg) translateY(-50%)",
          background:
            "linear-gradient(to bottom, transparent, var(--accent), transparent)",
          opacity: 0.32,
          animationDelay: delay,
          animationDuration: "5.4s",
        }}
      />
    </span>
  );
}
