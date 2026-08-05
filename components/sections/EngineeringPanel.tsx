import { approachSteps } from "@/data/approach";
import { PipelineRun } from "@/components/effects/PipelineRun";
import { Panel } from "@/components/ui/Panel";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";

/**
 * Approach — ONE wide board, running.
 *
 * The composition is a pipeline, not a grid of cards and not a row of steps on
 * a drawn line. Five stations sit on a single track that fills as you scroll
 * the section, and each one reports PASS with the evidence behind it. The order
 * is the argument this section is making, so the order is the strongest shape
 * in the region — and because the track is driven by the reader's own scroll,
 * the sequence is something they advance rather than something they are shown.
 *
 * Nothing here is boxed except the evidence wells, which are boxed on purpose:
 * they are the only part of the section that is a citation rather than a claim,
 * and they should look like output.
 *
 * The run summary above the board is deliberately made of checkable numbers,
 * and deliberately not a project count — five stations is what the board
 * shows, and the languages and tests are the same figures the hero and the
 * Toolkit cite, from the same repositories.
 *
 * Server Component. `PipelineRun` is the only client leaf — it needs the
 * section's scroll position — and it still renders every word on the server.
 */

const RUN_FACTS = [
  ["stages", String(approachSteps.length)],
  ["languages", "7"],
  ["tests", "1,742"],
] as const;

export function EngineeringPanel() {
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
          intro="Five stages, and for each one a concrete instance from a shipped repository. “I care about testing” is a claim; a settlement engine pinned by mirrored fixtures is evidence."
        />

        {/* ── Run summary ──────────────────────────────────────────────
            Runs to both panel edges, so the header reads as a band above the
            board rather than as a paragraph sitting on top of it. */}
        <div className="-mx-[var(--panel-p)] mb-[clamp(2.5rem,4vw,4rem)] border-y border-line-subtle">
          <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 px-[var(--panel-p)] py-4">
            <p className="label flex items-center gap-2.5 text-fg-muted">
              <span
                aria-hidden="true"
                className="anim-pulse inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: "var(--status-live)" }}
              />
              problem <span aria-hidden="true">→</span> production
            </p>

            <dl className="flex flex-wrap items-center gap-x-7 gap-y-2">
              {RUN_FACTS.map(([label, value]) => (
                <div key={label} className="flex items-baseline gap-2">
                  <dd className="tnum text-sm font-semibold text-fg">{value}</dd>
                  <dt className="label text-fg-subtle">{label}</dt>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <PipelineRun steps={approachSteps} />
      </Panel>
    </Section>
  );
}
