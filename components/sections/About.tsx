import type { ReactNode } from "react";
import { Section } from "@/components/ui/Section";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { LayerStack } from "@/components/effects/LayerStack";

/**
 * Every claim below is checkable against `data/projects.ts` and the repos it
 * points at. The integer cents, the zero cross-context references and the
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
    <Section
      id="about"
      eyebrow="01 — About"
      title={
        <>
          Correctness first.{" "}
          <span className="text-emphasis">Everything else is negotiable.</span>
        </>
      }
    >
      <div className="grid items-start gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        {/* ── Copy ───────────────────────────────────────────────────────── */}
        <Reveal as="div" stagger={0.08}>
          <div
            className="space-y-5 leading-relaxed text-fg-muted"
            style={{ fontSize: "var(--text-lead)" }}
          >
            {paragraphs.map((body, i) => (
              <RevealItem key={i}>
                <p>{body}</p>
              </RevealItem>
            ))}
          </div>

          <RevealItem>
            <dl className="mt-10 grid gap-x-8 gap-y-6 border-t border-line-subtle pt-8 sm:grid-cols-3">
              {facts.map((f) => (
                <div key={f.label}>
                  <dt className="label text-fg-subtle">{f.label}</dt>
                  <dd className="mt-2.5 text-sm font-medium leading-snug text-fg">
                    {f.value}
                  </dd>
                </div>
              ))}
            </dl>
          </RevealItem>
        </Reveal>

        {/* ── Visual ─────────────────────────────────────────────────────── */}
        <Reveal as="div">
          <LayerStack />
        </Reveal>
      </div>
    </Section>
  );
}
