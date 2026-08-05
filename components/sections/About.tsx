import type { ReactNode } from "react";
import { Section } from "@/components/ui/Section";
import { Panel } from "@/components/ui/Panel";
import { Row } from "@/components/ui/Stage";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { ArchitectureBoard } from "@/components/effects/ArchitectureBoard";

/**
 * An asymmetric pair, not a section with a picture beside it.
 *
 * The copy panel is the wider of the two and closes with a bordered fact strip
 * along its base — the same device the hero uses, so the two read as parts of
 * one system. The visual panel is narrower and is almost entirely illustration:
 * it carries a label and then gets out of the way, with the stack bleeding
 * toward its edges rather than sitting politely inside a content box.
 *
 * Every claim in the copy is checkable against `data/projects.ts` and the repos
 * it points at. The integer cents, the zero cross-context references and the
 * refusal path are the three things that actually distinguish this work, so
 * they lead — a paragraph of adjectives would say less and prove nothing.
 */
const paragraphs: ReactNode[] = [
  <>
    I&apos;m a Computer Science graduate, and nearly everything I build comes
    back to one idea:{" "}
    <strong className="font-medium text-fg">
      make the wrong thing hard to express
    </strong>
    . Money moves in integer cents, so a rounding error has nowhere to live.
    Module boundaries are compile errors, not code-review habits. A retrieval
    layer that can&apos;t cite a file and a line refuses to answer rather than
    guess.
  </>,
  <>
    That started in C and C++, where nothing is handed to you and the machine is
    honest about what you got wrong. It carries into the C#/.NET, TypeScript and
    Python work I do now — six projects taken from an empty repo to a running
    system, 1,742 tests between them, because an architecture claim you
    can&apos;t run is just a claim.
  </>,
  <>
    I&apos;m looking for a junior software engineering role on a team that
    ships: somewhere I can own real surface area, read a lot of code I
    didn&apos;t write, and have people around who will tell me when I&apos;m
    wrong.
  </>,
];

const facts = [
  { label: "Based", value: "Israel · GMT+3" },
  { label: "Working in", value: "English" },
  { label: "Strongest ground", value: "C / C++, then C# and TypeScript" },
];

export function About() {
  return (
    <Section id="about" labelledBy="about-title">
      <Row split="wide-left">
        {/* ── Copy ─────────────────────────────────────────────────────── */}
        <Panel bloom="top-left" className="flex flex-col">
          <div className="flex flex-1 flex-col px-[var(--panel-p)] pt-[var(--panel-p)]">
            <SectionHeader
              id="about"
              eyebrow="01 — About"
              title={
                <>
                  Correctness first.{" "}
                  <span className="text-emphasis">Everything else is negotiable.</span>
                </>
              }
            />

            <Reveal as="div" stagger={0.08}>
              <div
                className="space-y-6 leading-relaxed text-fg-muted"
                style={{ fontSize: "var(--text-lead)" }}
              >
                {paragraphs.map((body, i) => (
                  <RevealItem key={i}>
                    <p>{body}</p>
                  </RevealItem>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Fact strip — closes the panel, mirroring the hero's proof strip. */}
          <dl className="mt-[clamp(2.5rem,4vw,4rem)] grid border-t border-line-subtle sm:grid-cols-3">
            {facts.map((f, i) => (
              <div
                key={f.label}
                className={`group/fact relative px-[var(--panel-p)] py-7 transition-colors duration-[var(--dur-mid)] hover:bg-surface-1 sm:px-[clamp(1.25rem,2vw,2rem)] ${
                  i > 0 ? "border-t border-line-subtle sm:border-l sm:border-t-0" : ""
                }`}
              >
                <dt className="label text-fg-subtle">{f.label}</dt>
                <dd className="mt-2.5 text-[0.9375rem] font-medium leading-snug text-fg">
                  {f.value}
                </dd>
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-[var(--dur-slow)] ease-[var(--ease-out-expo)] group-hover/fact:scale-x-100"
                />
              </div>
            ))}
          </dl>
        </Panel>

        {/* ── Visual ───────────────────────────────────────────────────── */}
        <Panel
          tone="raised"
          bloom="centre"
          sheen={false}
          className="relative flex min-h-[30rem] flex-col lg:min-h-[38rem]"
        >
          <Eyebrow className="absolute left-[var(--panel-p)] top-[var(--panel-p)] z-10">
            How a request moves
          </Eyebrow>
          <div className="flex flex-1 items-center px-[clamp(1.25rem,2.5vw,2.25rem)] pb-[var(--panel-p)] pt-[calc(var(--panel-p)*1.5)]">
            <ArchitectureBoard />
          </div>
        </Panel>
      </Row>
    </Section>
  );
}
