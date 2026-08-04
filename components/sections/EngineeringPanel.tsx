import type { ComponentType, SVGProps } from "react";
import { approachSteps } from "@/data/approach";
import { ProcessRail } from "@/components/effects/ProcessRail";
import { Panel } from "@/components/ui/Panel";
import { Section } from "@/components/ui/Section";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { Tag } from "@/components/ui/Tag";
import {
  CheckCircleIcon,
  CodeIcon,
  LayersIcon,
  PackageIcon,
  SearchIcon,
} from "@/components/ui/icons";

/**
 * Engineering approach, rendered as a process rather than a card grid — the
 * order is the argument. Each step ends in a citation: a named project and the
 * concrete thing that happened there, set in `--fg-subtle` at a smaller size so
 * it reads as evidence supporting the claim above it, not as more claim.
 *
 * Server component. The only client work is the connector (it observes the
 * viewport) and the reveal wrappers, both of which are leaves.
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

export function EngineeringPanel() {
  return (
    <Section
      id="approach"
      eyebrow="04 — Approach"
      title={
        <>
          The path from problem to <span className="text-emphasis">production</span>
        </>
      }
      intro="Five steps, and for each one a concrete instance from a shipped repository. “I care about testing” is a claim; a settlement engine pinned by mirrored fixtures is evidence."
    >
      <div className="relative">
        <ProcessRail />

        <Reveal as="div" stagger={0.1}>
          {/*
            `role="list"` is deliberate: Tailwind's preflight strips the marker,
            and Safari drops list semantics from an unmarked list.
          */}
          <ol role="list" className="grid gap-6 lg:grid-cols-5 lg:gap-4">
            {approachSteps.map((step, i) => {
              const Icon = STEP_ICONS[step.id];
              return (
                <RevealItem
                  key={step.id}
                  as="li"
                  className="relative flex flex-col pl-16 lg:pl-0"
                >
                  {/*
                    The node. Opaque (`--surface-3`) so the rail passes behind
                    it instead of through it.
                  */}
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-0 inline-flex h-11 w-11 items-center justify-center rounded-full border border-accent-line bg-surface-3 text-accent shadow-e1 lg:static lg:mb-5 lg:flex"
                  >
                    <Icon size={19} />
                  </span>

                  <Panel className="flex flex-1 flex-col p-5 sm:p-6 lg:p-5">
                    <div className="flex items-baseline gap-3">
                      <span className="label tnum text-fg-subtle">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="text-lg font-semibold tracking-[var(--tracking-heading)] text-fg">
                        {step.title}
                      </h3>
                    </div>

                    <p className="mt-3 text-sm leading-relaxed text-fg-muted">
                      {step.summary}
                    </p>

                    {/* Bottom-anchored so the citations line up across the row. */}
                    <div className="mt-5 border-t border-line-subtle pt-4 lg:mt-auto">
                      <p className="label text-fg-subtle">Evidence</p>
                      <p className="mt-2 text-[0.8125rem] leading-relaxed text-fg-subtle">
                        {step.evidence}
                      </p>
                      <p className="mt-3.5">
                        <Tag>{step.project}</Tag>
                      </p>
                    </div>
                  </Panel>
                </RevealItem>
              );
            })}
          </ol>
        </Reveal>
      </div>
    </Section>
  );
}
