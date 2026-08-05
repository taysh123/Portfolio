import { Section } from "@/components/ui/Section";
import { Panel } from "@/components/ui/Panel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { Tag } from "@/components/ui/Tag";
import { GroupGlyph } from "@/components/ui/GroupGlyph";
import { skillGroups } from "@/data/skills";

/**
 * Toolkit — a capability map, not a logo wall.
 *
 * Two things separate this from the generic version of this section.
 *
 * First, every group carries EVIDENCE: a line naming where that capability is
 * actually load-bearing, with a number attached. "I know RabbitMQ" is a claim;
 * "8 bounded contexts over RabbitMQ with 0 cross-context references" is a fact
 * a reader can go and check. The evidence is what turns a list into an argument.
 *
 * Second, the composition is asymmetric: a narrow rail on the left carrying
 * the header and the totals, and a wider field of modules on the right. That
 * keeps the section from becoming the six-equal-columns pattern the rest of
 * this redesign exists to avoid, while staying inside a single panel so the
 * page's containment language holds.
 *
 * There are deliberately no brand logos — see the note at the top of
 * `data/skills.ts`. The intro copy says so out loud, so the absence reads as a
 * decision rather than an omission.
 */

const toolCount = skillGroups.reduce((n, g) => n + g.items.length, 0);

export function Skills() {
  return (
    <Section id="skills" labelledBy="skills-title">
      <Panel tone="flat" bloom="top-right" inset>
        <div className="grid gap-[clamp(2rem,4vw,4rem)] lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]">
          {/* ── Rail ─────────────────────────────────────────────────── */}
          <div className="flex flex-col">
            <SectionHeader
              id="skills"
              eyebrow="03 — Toolkit"
              title={
                <>
                  The stack, grouped by{" "}
                  <span className="text-emphasis">what it does</span>
                </>
              }
              intro="Not a logo wall. Everything here ships in the projects above — if it isn't in production somewhere, it isn't on the list."
              className="mb-0"
            />

            <dl className="mt-auto grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line-subtle pt-0 lg:mt-10">
              {[
                [String(skillGroups.length), "Capability groups"],
                [String(toolCount), "Tools in production"],
              ].map(([value, label]) => (
                <div key={label} className="bg-surface-1 px-5 py-6">
                  <dd className="tnum text-3xl font-semibold tracking-[var(--tracking-heading)] text-fg">
                    {value}
                  </dd>
                  <dt className="label mt-2 text-fg-subtle">{label}</dt>
                </div>
              ))}
            </dl>
          </div>

          {/* ── Modules ──────────────────────────────────────────────── */}
          <Reveal as="ul" stagger={0.07} className="grid gap-[var(--gap)] sm:grid-cols-2">
            {skillGroups.map((group) => (
              <RevealItem key={group.id} as="li" className="min-w-0">
                <article className="edge-lit group/mod relative flex h-full flex-col overflow-hidden rounded-2xl border border-line-subtle p-5 transition-[transform,border-color,box-shadow] duration-[var(--dur-slow)] ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:border-accent-line hover:shadow-e2">
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 -z-10"
                    style={{ background: "var(--panel-fill)" }}
                  />

                  <div className="flex items-start gap-3.5">
                    <GroupGlyph glyph={group.glyph} />
                    <div className="min-w-0">
                      <h3 className="text-[1.0625rem] font-medium tracking-[var(--tracking-heading)] text-fg">
                        {group.title}
                      </h3>
                      <p className="mt-1 text-sm leading-snug text-fg-muted">
                        {group.caption}
                      </p>
                    </div>
                  </div>

                  <ul className="mt-5 flex flex-wrap gap-1.5">
                    {group.items.map((item) => (
                      <li key={item.label}>
                        <Tag emphasis={item.emphasis}>
                          {item.label}
                          {item.emphasis && (
                            <span className="sr-only"> — core strength</span>
                          )}
                        </Tag>
                      </li>
                    ))}
                  </ul>

                  {/* The line that turns a list into an argument. */}
                  <footer className="mt-auto pt-5">
                    <span className="hairline mb-3.5 block" />
                    <Eyebrow as="span" className="text-fg-subtle">
                      Where it carries weight
                    </Eyebrow>
                    <p className="mt-2 text-[0.8125rem] leading-relaxed text-fg-muted">
                      {group.evidence}
                    </p>
                  </footer>
                </article>
              </RevealItem>
            ))}
          </Reveal>
        </div>
      </Panel>
    </Section>
  );
}
