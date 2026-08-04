import type { ComponentType, SVGProps } from "react";
import { approachSteps } from "@/data/approach";
import { ProcessRail } from "@/components/effects/ProcessRail";
import { Panel } from "@/components/ui/Panel";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";
import {
  CheckCircleIcon,
  CodeIcon,
  LayersIcon,
  PackageIcon,
  SearchIcon,
} from "@/components/ui/icons";

/**
 * Approach — ONE wide panel.
 *
 * The composition is a rail, not a grid of cards. Five stations sit on a single
 * self-drawing connector that runs the full width of the panel, separated by
 * fading hairlines rather than by five individual borders; below `lg` the same
 * line stands up into a timeline. Nothing here is boxed, so the connector is
 * the strongest shape in the region and the eye reads the sequence before it
 * reads any one step — which is the argument this section is making. The order
 * is the point.
 *
 * Each station ends in a citation: a named project and the concrete thing that
 * happened there, set smaller and in `--fg-subtle` behind an accent rule, so it
 * reads as evidence supporting the claim above it rather than as more claim.
 *
 * Server Component. The only client work is the connector (it observes the
 * viewport), the header and the reveal wrappers — all leaves.
 */

type StepIcon = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

/** Keyed by `ApproachStep.id` so the copy and the glyph stay independent. */
const STEP_ICONS: Record<string, StepIcon> = {
  understand: SearchIcon,
  design: LayersIcon,
  build: CodeIcon,
  verify: CheckCircleIcon,
  ship: PackageIcon,
};

/**
 * The station marker is 3.5rem, so the rail rides its centre line at 1.75rem
 * and the stacked layout indents its copy past it. These three are one
 * measurement — change the marker and all three move together.
 */
const MARKER_SIZE = "h-14 w-14";
const RAIL_OFFSET = "1.75rem";
const STACK_INDENT = "pl-[4.75rem]";

/** Column padding at `lg`. The two outer edges stay flush with the panel inset. */
const COL_PAD = "lg:px-[clamp(1rem,1.7vw,2rem)]";

export function EngineeringPanel() {
  const last = approachSteps.length - 1;

  return (
    <Section id="approach" labelledBy="approach-title">
      <Panel tone="flat" bloom="top-left" inset>
        <SectionHeader
          id="approach"
          wide
          eyebrow="04 — Approach"
          title={
            <>
              The path from problem to{" "}
              <span className="text-emphasis">production</span>
            </>
          }
          intro="Five steps, and for each one a concrete instance from a shipped repository. “I care about testing” is a claim; a settlement engine pinned by mirrored fixtures is evidence."
        />

        {/* Runs to both panel edges, so the header reads as a band above the
            rail rather than as a paragraph sitting on top of it. */}
        <div
          aria-hidden="true"
          className="-mx-[var(--panel-p)] mb-[clamp(2.5rem,4vw,4rem)] h-px bg-line-subtle"
        />

        <div className="relative">
          <ProcessRail offset={RAIL_OFFSET} />

          <Reveal as="div" stagger={0.12}>
            {/*
              `role="list"` is deliberate: Tailwind's preflight strips the
              marker, and Safari drops list semantics from an unmarked list.
            */}
            <ol role="list" className="grid gap-y-10 lg:grid-cols-5 lg:gap-y-0">
              {approachSteps.map((step, i) => {
                const Icon = STEP_ICONS[step.id];
                return (
                  <RevealItem
                    key={step.id}
                    as="li"
                    className={cn(
                      "relative flex flex-col",
                      STACK_INDENT,
                      // Directional padding utilities sort after the axis ones,
                      // so `lg:pl-0` reliably beats `lg:px-*` on the edges.
                      COL_PAD,
                      i === 0 && "lg:pl-0",
                      i === last && "lg:pr-0",
                    )}
                  >
                    {/* Hairline between stations — a separator, not a frame. It
                        fades out at both ends so it never meets the rail at a
                        hard corner. */}
                    {i > 0 && (
                      <>
                        <span
                          aria-hidden="true"
                          className="absolute -top-5 left-[4.75rem] right-0 h-px bg-line-subtle lg:hidden"
                        />
                        <span
                          aria-hidden="true"
                          className="absolute inset-y-0 left-0 hidden w-px lg:block"
                          style={{
                            background:
                              "linear-gradient(180deg, transparent, var(--border-subtle) 24%, var(--border-subtle) 84%, transparent)",
                          }}
                        />
                      </>
                    )}

                    {/*
                      The station node. Opaque (`--surface-3`) so the rail runs
                      behind it, and positioned at every breakpoint: an
                      absolutely positioned rail paints over static siblings, so
                      a `static` marker would be crossed by the line instead of
                      occluding it.
                    */}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute left-0 top-0 z-10 inline-flex items-center justify-center rounded-full border border-accent-line bg-surface-3 text-accent shadow-e1 lg:relative lg:mb-8",
                        MARKER_SIZE,
                      )}
                    >
                      <Icon size={22} />
                    </span>

                    <p className="label tnum text-fg-subtle">
                      {String(i + 1).padStart(2, "0")}
                    </p>

                    <h3
                      className="mt-3 font-semibold tracking-[var(--tracking-heading)] text-fg"
                      style={{ fontSize: "var(--text-h3)" }}
                    >
                      {step.title}
                    </h3>

                    <p className="mt-4 text-[0.9375rem] leading-relaxed text-fg-muted">
                      {step.summary}
                    </p>

                    {/* Bottom-anchored at `lg` so the citations line up across
                        the rail whatever the summary length. */}
                    <div className="mt-7 lg:mt-auto lg:pt-9">
                      <p className="label text-fg-subtle">Evidence</p>
                      <div className="mt-3.5 border-l border-accent-line pl-4">
                        <p className="text-[0.8125rem] leading-relaxed text-fg-subtle">
                          {step.evidence}
                        </p>
                        <p className="mt-3">
                          <cite className="font-mono text-[0.6875rem] not-italic tracking-[0.05em] text-fg-subtle">
                            {step.project}
                          </cite>
                        </p>
                      </div>
                    </div>
                  </RevealItem>
                );
              })}
            </ol>
          </Reveal>
        </div>
      </Panel>
    </Section>
  );
}
