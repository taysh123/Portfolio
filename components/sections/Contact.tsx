import type { ReactNode } from "react";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { MaskReveal } from "@/components/ui/MaskReveal";
import { Reveal } from "@/components/ui/Reveal";
import { Panel } from "@/components/ui/Panel";
import { PhoneReveal } from "@/components/ui/PhoneReveal";
import {
  ArrowUpRightIcon,
  GithubIcon,
  LinkedinIcon,
} from "@/components/ui/icons";
import { availability, siteMeta, socials } from "@/data/socials";

/**
 * Contact — the closing frame.
 *
 * WHAT CHANGED AND WHY. This was a contact card: copy on the left, an orbit
 * field on the right, channels stacked as rows. It worked, and it ended the
 * page the way a footer ends a page — by running out. A site that opens by
 * walking into a machine should close on purpose.
 *
 * Three decisions carry it.
 *
 * FIRST, IT BOOKENDS. The intro says “Everything here runs. Come in and
 * check.” This says “You've seen it run.” Those two frames are the only
 * display-scale type on the site, they use the same treatment, and they answer
 * each other. A reader who scrolls the whole page gets a closed loop rather
 * than a last section.
 *
 * SECOND, IT IS CENTRED, and it is the only region that is. Every other
 * composition here is deliberately off-axis — that is the rule the redesign
 * exists to enforce. Resolving to the centre exactly once, at the end, reads
 * as an ending rather than as another band. Symmetry is the punctuation.
 *
 * THIRD, THE ATMOSPHERE IS LIGHT, NOT ILLUSTRATION. The orbit field was a
 * generic network motif in a site whose visual language is machines, boards
 * and pipelines — and on a phone it cost 19rem of scroll for decoration. What
 * replaces it is a horizon: a soft wide glow with one hairline through it, low
 * in the panel, reading as the machine's light spilling over an edge. It also
 * does structural work, separating the statement above from the channels
 * below.
 *
 * The last line on the page is the site's whole thesis, stated once: every
 * number here is checkable. That is the thing worth leaving a reader with.
 *
 * `<address>` wraps the contact details themselves — not the availability
 * copy, which is a status and lives in the closing strip outside it.
 *
 * Server Component. The client leaves are `MaskReveal`, `Reveal` and
 * `PhoneReveal`.
 */

/** One recipe for the three secondary channels, including `PhoneReveal`,
 *  which takes it as a prop. Sized for a comfortable thumb target. */
const channelCard =
  "group/row flex min-h-[4.5rem] w-full items-center gap-3.5 rounded-2xl border border-line-subtle bg-surface-1 px-5 py-4 text-left " +
  "transition-[transform,border-color,background-color] duration-[var(--dur-slow)] ease-[var(--ease-out-expo)] " +
  "hover:-translate-y-0.5 hover:border-accent-line hover:bg-surface-2";

const channelIcon =
  "shrink-0 text-fg-subtle transition-colors duration-[var(--dur-mid)] group-hover/row:text-accent";

export function Contact() {
  return (
    <Section id="contact" labelledBy="contact-title">
      <Panel tone="float" bloom="bottom" className="overflow-hidden">
        <div className="relative px-[var(--panel-p)] pt-[clamp(3.5rem,7vw,6.5rem)]">
          {/* ── The statement ────────────────────────────────────────── */}
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow rule className="justify-center">
              05 — Contact
            </Eyebrow>

            <h2
              id="contact-title"
              className="mt-6 font-semibold leading-[1.04] tracking-[var(--tracking-heading)] text-fg"
              style={{ fontSize: "var(--text-h2)" }}
            >
              {/* The break is explicit. Left to wrap naturally, “Let's”
                  orphaned itself at the end of the first line at most desktop
                  widths — and this is the one heading on the site where both
                  halves are a complete thought. */}
              <MaskReveal>
                <>
                  <span className="block">You&apos;ve seen it run.</span>
                  <span className="block text-emphasis">
                    Let&apos;s build the next one.
                  </span>
                </>
              </MaskReveal>
            </h2>

            <Reveal delay={0.06}>
              <p
                className="mx-auto mt-7 max-w-xl leading-relaxed text-fg-muted"
                style={{ fontSize: "var(--text-lead)" }}
              >
                Hiring, collaborating, or just comparing notes on something
                you&apos;re stuck on — email reaches me fastest, and I answer
                everything that arrives.
              </p>
            </Reveal>
          </div>

          {/* ── Channels ─────────────────────────────────────────────── */}
          <Reveal delay={0.12}>
            <address className="mx-auto mt-[clamp(2.5rem,5vw,4.5rem)] block max-w-3xl not-italic">
              {/*
                The primary target, and the largest interactive element on the
                site. The clamp tops out where a 20-character mailbox still
                fits this column on one line — at `--text-h2` it overflowed on
                every viewport below xl, which was a real bug in the original.
              */}
              <a
                href={`mailto:${socials.email}?subject=${encodeURIComponent("Hello Tay")}`}
                className="group/mail relative flex items-center justify-between gap-5 overflow-hidden rounded-2xl border border-line bg-surface-1 px-[clamp(1.25rem,3vw,2.5rem)] py-[clamp(1.5rem,3vw,2.25rem)] transition-[border-color,background-color] duration-[var(--dur-slow)] hover:border-accent-line hover:bg-surface-2"
              >
                {/* A single light passing over the target on hover. Transform
                    only, and the reduced-motion kill-switch zeroes the
                    transition, so it simply never plays. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 -left-full w-full transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover/mail:translate-x-[200%]"
                  style={{
                    background:
                      "linear-gradient(100deg, transparent, var(--accent-soft) 48%, transparent)",
                  }}
                />

                <span className="relative min-w-0 flex-1">
                  <span className="label block text-fg-subtle">
                    Primary channel
                  </span>
                  <span
                    className="mt-3 block break-words font-semibold leading-[1.05] tracking-[var(--tracking-heading)] text-fg transition-colors duration-[var(--dur-mid)] group-hover/mail:text-accent"
                    style={{ fontSize: "clamp(1.3rem, 3.4vw, 2.9rem)" }}
                  >
                    {socials.email}
                  </span>
                </span>

                <span
                  aria-hidden="true"
                  className="relative inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line bg-surface-2 text-fg-muted transition-[transform,border-color,color] duration-[var(--dur-mid)] ease-[var(--ease-out-expo)] group-hover/mail:-translate-y-1 group-hover/mail:border-accent-line group-hover/mail:text-accent"
                >
                  <ArrowUpRightIcon size={18} />
                </span>
              </a>

              {/* Three equal targets in a row on anything wider than a small
                  phone, stacked below it. Cards rather than rows because a
                  4.5rem card is a comfortable thumb target and a hairline row
                  is not. */}
              <ul className="mt-3 grid gap-3 sm:grid-cols-3">
                <li>
                  <ChannelCard
                    href={socials.github.url}
                    icon={<GithubIcon size={18} className={channelIcon} />}
                    label="GitHub"
                    value={socials.github.handle}
                  />
                </li>
                <li>
                  <ChannelCard
                    href={socials.linkedin.url}
                    icon={<LinkedinIcon size={18} className={channelIcon} />}
                    label="LinkedIn"
                    value={socials.linkedin.label}
                  />
                </li>
                <li>
                  <PhoneReveal className={channelCard} />
                </li>
              </ul>
            </address>
          </Reveal>

          {/* ── The horizon ──────────────────────────────────────────────
              One hairline with a wide soft pool falling away beneath it: light
              coming over an edge toward the reader, which is the same light
              language as the machine's display in the intro. The hairline is
              what makes it read as an EDGE rather than as a smudge — without
              it the pool is just a gradient.

              It sits in the flow, between the channels and the sign-off, so it
              divides the section as well as lighting it. The first version
              was absolutely positioned against the panel's base and cut
              straight through the channel cards, which is what an atmospheric
              effect looks like when it is measured against the wrong box. */}
          <div className="relative mt-[clamp(3rem,6vw,5rem)]" aria-hidden="true">
            <span
              className="pointer-events-none absolute inset-x-[-16%] top-0 -z-10 h-[18rem] blur-[70px]"
              style={{
                background:
                  "radial-gradient(48% 100% at 50% 0%, var(--glow-strong), var(--glow-blue) 44%, transparent 74%)",
              }}
            />
            <span
              className="block h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, var(--accent-line) 16%, var(--accent) 50%, var(--accent-line) 84%, transparent)",
                opacity: 0.85,
              }}
            />
          </div>

          {/* ── The thesis, stated once ──────────────────────────────── */}
          <p className="mx-auto mt-[clamp(2rem,4vw,3rem)] max-w-xl text-center font-mono text-[0.75rem] leading-relaxed text-fg-subtle">
            Every number on this page is checkable in a{" "}
            <a
              href={socials.github.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-fg-muted underline decoration-line underline-offset-4 transition-colors duration-[var(--dur-mid)] hover:text-accent hover:decoration-accent"
            >
              public repository
            </a>
            .<span className="sr-only"> (opens in a new tab)</span>
          </p>
        </div>

        {/* ── Closing strip ──────────────────────────────────────────────
            Availability is a status, not a contact detail, so it sits outside
            <address> — and the strip is what closes the panel, the same device
            the intro uses to stop its own composition bleeding off the edge. */}
        <div className="relative mt-[clamp(3rem,5vw,4.5rem)] border-t border-line-subtle">
          <div className="flex flex-col gap-7 px-[var(--panel-p)] py-8 sm:flex-row sm:items-center sm:justify-between sm:gap-12">
            <div>
              <p className="label inline-flex w-fit items-center gap-2.5 rounded-full border border-line bg-surface-1 px-3.5 py-2 text-fg-muted">
                {/* The label carries the meaning; the dot only reinforces it. */}
                <span
                  aria-hidden="true"
                  className="relative inline-flex h-1.5 w-1.5 shrink-0"
                >
                  <span
                    className="anim-pulse absolute inset-0 rounded-full"
                    style={{ background: "var(--status-live)" }}
                  />
                  <span
                    className="relative inline-block h-1.5 w-1.5 rounded-full"
                    style={{ background: "var(--status-live)" }}
                  />
                </span>
                {availability.label}
              </p>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-fg-muted">
                {availability.detail}
              </p>
            </div>

            <dl className="flex shrink-0 flex-wrap gap-x-12 gap-y-5">
              <Fact term="Based in">
                {siteMeta.location} · {siteMeta.timezone}
              </Fact>
              <Fact term="Working language">English</Fact>
            </dl>
          </div>
        </div>
      </Panel>
    </Section>
  );
}

function ChannelCard({
  href,
  icon,
  label,
  value,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={channelCard}>
      {icon}
      <span className="min-w-0 flex-1">
        <span className="label block text-fg-subtle">{label}</span>
        <span className="mt-1 block truncate text-sm text-fg">{value}</span>
      </span>
      <ArrowUpRightIcon
        size={15}
        className="shrink-0 text-fg-subtle transition-transform duration-[var(--dur-mid)] ease-[var(--ease-out-expo)] group-hover/row:-translate-y-0.5 group-hover/row:translate-x-0.5"
      />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

function Fact({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <dt className="label text-fg-subtle">{term}</dt>
      <dd className="text-sm text-fg">{children}</dd>
    </div>
  );
}
