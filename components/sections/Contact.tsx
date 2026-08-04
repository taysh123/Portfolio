import type { ReactNode } from "react";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Panel } from "@/components/ui/Panel";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PhoneReveal } from "@/components/ui/PhoneReveal";
import { OrbitField } from "@/components/effects/OrbitField";
import {
  ArrowUpRightIcon,
  GithubIcon,
  LinkedinIcon,
} from "@/components/ui/icons";
import { availability, siteMeta, socials } from "@/data/socials";

/**
 * One recipe for every contact channel — the two links here and the phone
 * control in `PhoneReveal`, which takes it as a prop. Two stacked lines at
 * `py-3` clear the 44px target on their own; `min-h` is the floor, not the
 * mechanism.
 */
const channelRow =
  "group/row flex min-h-[3.5rem] w-full items-center gap-3.5 rounded-lg border border-line-subtle " +
  "bg-surface-1 px-4 py-3 text-left transition-[background-color,border-color] " +
  "duration-[var(--dur-mid)] ease-[var(--ease-out-expo)] hover:border-accent-line hover:bg-surface-2";

const channelIcon =
  "shrink-0 text-fg-subtle transition-colors duration-[var(--dur-mid)] group-hover/row:text-accent";

export function Contact() {
  return (
    <Section
      id="contact"
      eyebrow="05 — Contact"
      title={
        <>
          I&apos;d like to hear{" "}
          <span className="text-emphasis">what you&apos;re building.</span>
        </>
      }
      intro="Hiring, collaborating, or just comparing notes on something you're stuck on — email reaches me fastest, and I answer everything that arrives."
    >
      <Reveal>
        <Panel tone="raised" className="p-[var(--panel-p)]">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            {/*
              `<address>` wraps the contact details themselves. The previous
              version put it around the availability copy instead, which
              declared the wrong thing entirely.
            */}
            <address className="not-italic">
              <Eyebrow>Primary channel</Eyebrow>

              {/*
                Not `--text-h2`: a 20-character mailbox string at that size
                overflows a half-width column on every viewport below xl. This
                clamp tops out where the address still fits on one line.
              */}
              <a
                href={`mailto:${socials.email}?subject=${encodeURIComponent("Hello Tay")}`}
                className="group/mail mt-5 inline-flex max-w-full items-center gap-3 font-medium tracking-[var(--tracking-heading)] text-fg transition-colors duration-[var(--dur-mid)] hover:text-accent"
                style={{ fontSize: "clamp(1.25rem, 2.7vw, 1.9rem)" }}
              >
                <span className="min-w-0 break-words">{socials.email}</span>
                <span
                  aria-hidden="true"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-surface-1 text-fg-muted transition-[transform,border-color,color] duration-[var(--dur-mid)] ease-[var(--ease-out-expo)] group-hover/mail:-translate-y-1 group-hover/mail:border-accent-line group-hover/mail:text-accent"
                >
                  <ArrowUpRightIcon size={16} />
                </span>
              </a>

              <ul className="mt-10 flex flex-col gap-3">
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

            <div className="flex flex-col">
              <OrbitField />

              <div className="mt-8 sm:mt-10">
                <p className="label inline-flex items-center gap-2.5 rounded-full border border-line bg-surface-1 px-3.5 py-2 text-fg-muted">
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

                <p className="mt-5 leading-relaxed text-fg-muted">
                  {availability.detail}
                </p>

                <dl className="mt-6 space-y-3 border-t border-line-subtle pt-5 text-sm">
                  <Fact term="Based in">
                    {siteMeta.location} · {siteMeta.timezone}
                  </Fact>
                  <Fact term="Working language">English</Fact>
                </dl>
              </div>
            </div>
          </div>
        </Panel>
      </Reveal>
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
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={channelRow}
    >
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
    <div className="flex items-baseline justify-between gap-4">
      <dt className="label text-fg-subtle">{term}</dt>
      <dd className="text-right text-fg">{children}</dd>
    </div>
  );
}
