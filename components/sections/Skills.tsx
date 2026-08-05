import { Section } from "@/components/ui/Section";
import { Panel } from "@/components/ui/Panel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { Tag } from "@/components/ui/Tag";
import { GroupGlyph } from "@/components/ui/GroupGlyph";
import { skillGroups } from "@/data/skills";
import type { SkillGroup } from "@/data/skills";

/**
 * Toolkit — a capability map with a point of view, not a logo wall and not an
 * inventory.
 *
 * Three things separate this from the generic version of this section.
 *
 * First, every group carries EVIDENCE: a line naming where that capability is
 * actually load-bearing, with a number attached. “I know RabbitMQ” is a claim;
 * “8 bounded contexts over RabbitMQ with 0 cross-context references” is a fact
 * a reader can go and check. The evidence is what turns a list into an
 * argument.
 *
 * Second, THE GROUPS ARE NOT EQUAL. Six identically-sized modules tell a reader
 * that six things matter the same amount, which is never true — and it is the
 * single reason skill sections read as inventory rather than as a claim. Two
 * groups lead at roughly double the weight, each with its figure pulled out at
 * display scale: services, because an architecture whose boundaries fail to
 * compile is the strongest structural claim here, and verification, because
 * 1,742 tests is the number the rest of the page keeps citing. The other four
 * are real and support them, and are sized accordingly.
 *
 * Third, the composition is asymmetric: a narrow rail carrying the header and
 * the totals, and a wider field of modules beside it. That keeps the section
 * out of the six-equal-columns pattern the rest of this redesign exists to
 * avoid, while staying inside a single panel so the page's containment
 * language holds.
 *
 * There are deliberately no brand logos — see the note at the top of
 * `data/skills.ts`. The intro copy says so out loud, so the absence reads as a
 * decision rather than an omission.
 */

const toolCount = skillGroups.reduce((n, g) => n + g.items.length, 0);
const leads = skillGroups.filter((g) => g.lead);
const supports = skillGroups.filter((g) => !g.lead);

export function Skills() {
  return (
    <Section id="skills" labelledBy="skills-title">
      <Panel tone="flat" bloom="top-right" inset>
        <div className="grid gap-[clamp(2rem,4vw,4rem)] lg:grid-cols-[minmax(0,0.66fr)_minmax(0,1.34fr)]">
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

            {/* Anchored to the rail's base, not floating below the intro. The
                modules column is much taller than this one, so `mt-auto` is
                what makes the rail span the panel and the composition read as
                held at both ends; the padding is the floor for when there is
                no slack to absorb, which is every width below lg. It sits on
                the WRAPPER — putting it on the `dl` would have opened a gap
                inside the bordered box rather than above it. */}
            <div className="mt-auto pt-10">
              <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line-subtle">
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
          </div>

          {/* ── Modules ──────────────────────────────────────────────── */}
          <Reveal as="div" stagger={0.07} className="flex flex-col gap-[var(--gap)]">
            {/* The two that carry the argument. Full width of this column, so
                they read as the headline before a single word is read. */}
            <ul className="flex flex-col gap-[var(--gap)]">
              {leads.map((group) => (
                <RevealItem key={group.id} as="li">
                  <LeadModule group={group} />
                </RevealItem>
              ))}
            </ul>

            {/* Everything else, at supporting weight. */}
            <ul className="grid gap-[var(--gap)] sm:grid-cols-2">
              {supports.map((group) => (
                <RevealItem key={group.id} as="li" className="min-w-0">
                  <SupportModule group={group} />
                </RevealItem>
              ))}
            </ul>
          </Reveal>
        </div>
      </Panel>
    </Section>
  );
}

function LeadModule({ group }: { group: SkillGroup }) {
  const lead = group.lead!;

  return (
    <article
      className="edge-lit relative flex h-full flex-col overflow-hidden rounded-2xl border border-accent-line p-[clamp(1.25rem,2.4vw,1.75rem)] shadow-e2 transition-[transform,box-shadow] duration-[var(--dur-slow)] ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:shadow-e3"
      style={{ background: "var(--panel-fill-deep)" }}
    >
      {/* The light a lead module sits in. Supports get none, which is most of
          what makes the difference legible at a glance. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-24 -z-10 h-56 w-56 rounded-full blur-[70px]"
        style={{
          background:
            "radial-gradient(closest-side, var(--glow-strong), transparent 74%)",
        }}
      />

      <div className="flex items-start gap-4">
        <GroupGlyph glyph={group.glyph} />
        <div className="min-w-0">
          <h3
            className="font-semibold tracking-[var(--tracking-heading)] text-fg"
            style={{ fontSize: "var(--text-h3)" }}
          >
            {group.title}
          </h3>
          <p className="mt-1.5 text-sm leading-snug text-fg-muted">
            {group.caption}
          </p>
        </div>
      </div>

      {/* The figure and the sentence it comes from, side by side — the number
          is the claim and the line beside it is where to check it. */}
      <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-7">
        <p className="shrink-0 sm:w-[9.5rem]">
          <span
            className="tnum block font-semibold leading-none tracking-[var(--tracking-heading)] text-fg"
            style={{ fontSize: "clamp(2.5rem,5vw,3.5rem)" }}
          >
            {lead.value}
          </span>
          <span className="label mt-3 block text-fg-subtle">{lead.unit}</span>
        </p>

        <div className="min-w-0 flex-1 border-l border-accent-line pl-5">
          <Eyebrow as="span" className="text-fg-subtle">
            Where it carries weight
          </Eyebrow>
          <p className="mt-2.5 text-sm leading-relaxed text-fg-muted">
            {group.evidence}
          </p>
        </div>
      </div>

      <ul className="mt-7 flex flex-wrap gap-1.5">
        {group.items.map((item) => (
          <li key={item.label}>
            <Tag emphasis={item.emphasis}>
              {item.label}
              {item.emphasis && <span className="sr-only"> — core strength</span>}
            </Tag>
          </li>
        ))}
      </ul>
    </article>
  );
}

function SupportModule({ group }: { group: SkillGroup }) {
  return (
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
              {item.emphasis && <span className="sr-only"> — core strength</span>}
            </Tag>
          </li>
        ))}
      </ul>

      {/* The line that turns a list into an argument. */}
      <footer className="mt-auto pt-5">
        <span className="hairline mb-3.5 block" />
        <p className="text-[0.8125rem] leading-relaxed text-fg-subtle">
          {group.evidence}
        </p>
      </footer>
    </article>
  );
}
