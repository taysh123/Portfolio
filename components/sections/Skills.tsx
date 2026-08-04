import { Section } from "@/components/ui/Section";
import { Panel } from "@/components/ui/Panel";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { Tag } from "@/components/ui/Tag";
import { GroupGlyph } from "@/components/ui/GroupGlyph";
import { skillGroups } from "@/data/skills";

/**
 * Toolkit.
 *
 * Six equal cards, no featured slot. The previous version promoted an "AI"
 * group to a double-width hero card, which made a tooling preference look like
 * the headline of the engineering practice — and the grid never recovered its
 * rhythm afterwards.
 *
 * No brand logos, by decision recorded in `data/skills.ts`. Each group carries
 * one drawn glyph instead, and the section says so out loud rather than leaving
 * the absence looking like an omission.
 */

const toolCount = skillGroups.reduce((n, g) => n + g.items.length, 0);

export function Skills() {
  return (
    <Section
      id="skills"
      eyebrow="03 — Toolkit"
      title={
        <>
          The stack, grouped by <span className="text-emphasis">what it does</span>
        </>
      }
      intro="Not a logo wall. Everything listed here ships in the projects on this page — if it is not in production somewhere, it is not on the list."
      aside={
        <Eyebrow as="span" className="tnum">
          {skillGroups.length} groups · {toolCount} tools
        </Eyebrow>
      }
    >
      <Reveal
        as="ul"
        stagger={0.07}
        className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        {skillGroups.map((group) => (
          <RevealItem key={group.id} as="li" className="h-full">
            {/* `group` is what GroupGlyph's hover lift keys off. */}
            <Panel
              as="article"
              interactive
              className="group flex h-full flex-col p-6 sm:p-7"
            >
              <GroupGlyph glyph={group.glyph} />

              <h3
                className="mt-5 font-medium tracking-[var(--tracking-heading)] text-fg"
                style={{ fontSize: "var(--text-h3)" }}
              >
                {group.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">
                {group.caption}
              </p>

              {/* mt-auto keeps the chip blocks aligned across a ragged row. */}
              <div className="mt-auto pt-6">
                <span aria-hidden="true" className="hairline block" />
                <ul className="mt-5 flex flex-wrap gap-1.5">
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
              </div>
            </Panel>
          </RevealItem>
        ))}
      </Reveal>

      {/*
        The key is a live Tag rather than a description of one, so it holds up
        for anyone who cannot separate the two chip styles by colour — and the
        emphasised chips carry an sr-only marker for anyone not seeing either.
      */}
      <Reveal delay={0.2}>
        <p className="mt-8 flex flex-wrap items-center gap-x-2.5 gap-y-2 text-sm text-fg-subtle">
          <Tag emphasis>this one</Tag>
          <span>marks what I reach for first and know deepest.</span>
        </p>
      </Reveal>
    </Section>
  );
}
