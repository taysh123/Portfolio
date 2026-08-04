import type { CSSProperties } from "react";
import { Section } from "@/components/ui/Section";
import { Panel } from "@/components/ui/Panel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { Tag } from "@/components/ui/Tag";
import { GroupGlyph } from "@/components/ui/GroupGlyph";
import { skillGroups } from "@/data/skills";
import { cn } from "@/lib/cn";

/**
 * Toolkit — the quiet beat in the page's rhythm.
 *
 * ONE panel, one low band. The previous version rendered six panels in a
 * three-column grid, which put a wall of near-identical cards between the Work
 * section and the Approach — the exact pattern this redesign exists to remove.
 * Here the six groups are *columns of one panel*, ruled off from each other by
 * hairlines rather than boxed, so the section reads as a single spec sheet: a
 * legend you scan across, not six things you read one at a time.
 *
 * It is deliberately the shortest region on the page. Work carries the
 * argument; this only has to answer "with what?" and get out of the way.
 *
 * No brand logos, by decision recorded in `data/skills.ts` — each group carries
 * one drawn glyph instead, and the intro copy says so out loud rather than
 * leaving the absence looking like an omission.
 */

const toolCount = skillGroups.reduce((n, g) => n + g.items.length, 0);

/**
 * The band pulls itself out by exactly one column's padding, so the first and
 * last columns' text lines up with the panel's own interior edge while the
 * hairlines still sit centred in the gutters between columns.
 */
const BAND_STYLE = {
  "--col-x": "clamp(0.625rem,1vw,1rem)",
  marginInline: "calc(-1 * var(--col-x))",
} as CSSProperties;

/** How many columns the band runs at, per breakpoint. */
const BAND = [
  { at: "base", cols: 1 },
  { at: "sm", cols: 2 },
  { at: "lg", cols: 3 },
  { at: "xl", cols: 6 },
] as const;

/**
 * Written out in full rather than composed from a template literal: Tailwind
 * finds classes by scanning source *text*, so every candidate has to appear
 * here verbatim.
 */
const EDGE = {
  base: {
    topOn: "border-t",
    topOff: "border-t-0",
    leftOn: "border-l",
    leftOff: "border-l-0",
  },
  sm: {
    topOn: "sm:border-t",
    topOff: "sm:border-t-0",
    leftOn: "sm:border-l",
    leftOff: "sm:border-l-0",
  },
  lg: {
    topOn: "lg:border-t",
    topOff: "lg:border-t-0",
    leftOn: "lg:border-l",
    leftOff: "lg:border-l-0",
  },
  xl: {
    topOn: "xl:border-t",
    topOff: "xl:border-t-0",
    leftOn: "xl:border-l",
    leftOff: "xl:border-l-0",
  },
} as const;

/**
 * Hairlines, not boxes.
 *
 * A column rules only against the neighbour it actually touches, and which
 * neighbour that is changes as the band reflows 1 → 2 → 3 → 6 across. So a
 * left rule set at `sm` has to be explicitly *unset* at `lg` when that column
 * lands at the start of a row. Emitting on/off toggles in ascending breakpoint
 * order is safe because that is exactly the order Tailwind writes its
 * min-width media queries in.
 */
function edges(index: number): string {
  const out: string[] = [];
  let top = false;
  let left = false;

  for (const { at, cols } of BAND) {
    const wantTop = index >= cols;
    const wantLeft = index % cols !== 0;
    if (wantTop !== top) out.push(EDGE[at][wantTop ? "topOn" : "topOff"]);
    if (wantLeft !== left) out.push(EDGE[at][wantLeft ? "leftOn" : "leftOff"]);
    top = wantTop;
    left = wantLeft;
  }

  return out.join(" ");
}

export function Skills() {
  return (
    <Section id="skills" labelledBy="skills-title">
      <Panel tone="flat" inset>
        <SectionHeader
          id="skills"
          wide
          eyebrow="03 — Toolkit"
          title={
            <>
              The stack, grouped by{" "}
              <span className="text-emphasis">what it does</span>
            </>
          }
          intro="Not a logo wall — there are no borrowed brand marks anywhere on this page. Everything listed here ships in the projects above; if it is not in production somewhere, it is not on the list."
          aside={
            <div className="flex flex-col gap-3 sm:items-end">
              <Eyebrow as="span" className="tnum">
                {skillGroups.length} groups · {toolCount} tools
              </Eyebrow>
              {/*
                A live chip rather than a description of one, so the key holds
                up for anyone who cannot separate the two styles by colour —
                and each emphasised chip also carries an sr-only marker.
              */}
              <p className="flex items-center gap-2.5 text-sm text-fg-subtle">
                <Tag emphasis>this one</Tag>
                <span>marks what I reach for first</span>
              </p>
            </div>
          }
        />

        {/* Bleeds to the panel edge: the band's lid, not a card's border. */}
        <span
          aria-hidden="true"
          className="hairline block"
          style={{ marginInline: "calc(-1 * var(--panel-p))" }}
        />

        <div style={BAND_STYLE}>
          <Reveal
            as="ul"
            stagger={0.06}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
          >
            {skillGroups.map((group, index) => (
              <RevealItem
                key={group.id}
                as="li"
                className={cn(
                  "flex flex-col border-line-subtle",
                  "px-[var(--col-x)] py-[clamp(1.5rem,2vw,2.25rem)]",
                  edges(index),
                )}
              >
                <GroupGlyph glyph={group.glyph} />

                <h3 className="mt-5 text-[1.0625rem] font-medium leading-snug tracking-[var(--tracking-heading)] text-fg">
                  {group.title}
                </h3>
                <p className="mt-2 text-[0.8125rem] leading-relaxed text-fg-muted">
                  {group.caption}
                </p>

                <ul className="mt-6 flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <li key={item.label}>
                      <Tag emphasis={item.emphasis ?? false}>
                        {item.label}
                        {item.emphasis && (
                          <span className="sr-only"> — core strength</span>
                        )}
                      </Tag>
                    </li>
                  ))}
                </ul>
              </RevealItem>
            ))}
          </Reveal>
        </div>
      </Panel>
    </Section>
  );
}
