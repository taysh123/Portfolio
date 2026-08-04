import type { ReactNode } from "react";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { Panel } from "@/components/ui/Panel";
import { PhoneReveal } from "@/components/ui/PhoneReveal";
import { OrbitField } from "@/components/effects/OrbitField";
import {
  ArrowUpRightIcon,
  GithubIcon,
  LinkedinIcon,
} from "@/components/ui/icons";
import { availability, siteMeta, socials } from "@/data/socials";

/**
 * Contact — ONE large closing panel, and the biggest type on the page after
 * the hero.
 *
 * The interior is deliberately unequal: the copy and the channels take the
 * left, and the armillary field on the right is oversized and pushed past the
 * column so it bleeds off the panel edge. That overflow is what stops the
 * section reading as "text beside a picture" — the illustration is part of the
 * panel's architecture rather than a tenant inside it.
 *
 * The channels are horizontal bands, not cards: every one bleeds left to the
 * panel's inner edge, so the hairlines and the hover wash run all the way out
 * and the left side reads as a stack of ruled bands. There is not a single
 * rounded box in the region.
 *
 * `<address>` wraps the contact details themselves. The previous version put it
 * around the availability copy instead, which declared the wrong thing
 * entirely; availability lives in the closing strip along the panel's base,
 * outside it.
 *
 * Server Component — the only client leaves are the header, the reveal wrapper
 * and `PhoneReveal`.
 */

/**
 * One recipe for every contact channel: the two links here and the phone
 * control in `PhoneReveal`, which takes it as a prop.
 *
 * The negative inline-start margin (with matching padding, and a width that
 * compensates so a `<button>` still fills the column) is what lets the row's
 * rule and hover wash reach the panel edge.
 */
const channelRow =
  "group/row flex min-h-[3.75rem] items-center gap-4 border-b border-line-subtle py-4 text-left " +
  "-ml-[var(--panel-p)] w-[calc(100%_+_var(--panel-p))] pl-[var(--panel-p)] pr-3 " +
  "transition-colors duration-[var(--dur-mid)] ease-[var(--ease-out-expo)] hover:bg-surface-1";

const channelIcon =
  "shrink-0 text-fg-subtle transition-colors duration-[var(--dur-mid)] group-hover/row:text-accent";

export function Contact() {
  return (
    <Section id="contact" labelledBy="contact-title">
      <Panel tone="float" bloom="bottom">
        <div className="grid min-h-[34rem] grid-rows-[1fr_auto] lg:min-h-[40rem]">
          <div className="grid items-center lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            {/* ── Copy and channels ──────────────────────────────────── */}
            <div className="relative z-10 px-[var(--panel-p)] pb-12 pt-[var(--panel-p)] lg:pb-[var(--panel-p)]">
              <SectionHeader
                id="contact"
                eyebrow="05 — Contact"
                title={
                  <>
                    I&apos;d like to hear{" "}
                    <span className="text-emphasis">what you&apos;re building.</span>
                  </>
                }
                intro="Hiring, collaborating, or just comparing notes on something you're stuck on — email reaches me fastest, and I answer everything that arrives."
              />

              <Reveal delay={0.08}>
                <address className="not-italic">
                  {/*
                    The largest type on the page after the hero. The clamp tops
                    out where a 20-character mailbox still fits this column on
                    one line — at `--text-h2` it overflows on every viewport
                    below xl, which was a real bug in the original.
                  */}
                  <a
                    href={`mailto:${socials.email}?subject=${encodeURIComponent("Hello Tay")}`}
                    className="group/mail -ml-[var(--panel-p)] flex w-[calc(100%_+_var(--panel-p))] items-center justify-between gap-6 border-y border-line-subtle py-7 pl-[var(--panel-p)] pr-3 transition-colors duration-[var(--dur-mid)] hover:border-accent-line"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="label block text-fg-subtle">
                        Primary channel
                      </span>
                      <span
                        className="mt-3 block break-words font-semibold leading-[1.05] tracking-[var(--tracking-heading)] text-fg transition-colors duration-[var(--dur-mid)] group-hover/mail:text-accent"
                        style={{ fontSize: "clamp(1.3rem, 3vw, 2.9rem)" }}
                      >
                        {socials.email}
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line bg-surface-1 text-fg-muted transition-[transform,border-color,color] duration-[var(--dur-mid)] ease-[var(--ease-out-expo)] group-hover/mail:-translate-y-1 group-hover/mail:border-accent-line group-hover/mail:text-accent"
                    >
                      <ArrowUpRightIcon size={18} />
                    </span>
                  </a>

                  <ul>
                    <li>
                      <ChannelRow
                        href={socials.github.url}
                        icon={<GithubIcon size={18} className={channelIcon} />}
                        label="GitHub"
                        value={`github.com/${socials.github.handle}`}
                      />
                    </li>
                    <li>
                      <ChannelRow
                        href={socials.linkedin.url}
                        icon={<LinkedinIcon size={18} className={channelIcon} />}
                        label="LinkedIn"
                        value={socials.linkedin.label}
                      />
                    </li>
                    <li>
                      <PhoneReveal className={channelRow} />
                    </li>
                  </ul>
                </address>
              </Reveal>
            </div>

            {/* ── The field ──────────────────────────────────────────── */}
            <div className="relative min-h-[19rem] sm:min-h-[26rem] lg:min-h-[32rem]">
              <OrbitField className="absolute left-1/2 top-1/2 w-[min(132%,25rem)] -translate-x-1/2 -translate-y-1/2 sm:w-[min(112%,33rem)] lg:left-auto lg:right-[-14%] lg:w-[min(134%,44rem)] lg:translate-x-0" />
            </div>
          </div>

          {/* ── Closing strip, inside the panel ─────────────────────────
              Availability is a status, not a contact detail, so it sits
              outside <address> — and the strip is what closes the panel, the
              same device the hero uses to stop its own composition bleeding
              off the bottom edge. */}
          <div className="relative z-10 border-t border-line-subtle">
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
        </div>
      </Panel>
    </Section>
  );
}

function ChannelRow({
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
    <a href={href} target="_blank" rel="noopener noreferrer" className={channelRow}>
      {icon}
      <span className="min-w-0 flex-1">
        <span className="label block text-fg-subtle">{label}</span>
        <span className="mt-1 block truncate text-fg">{value}</span>
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
