import type { Metadata } from "next";
import type { ReactNode } from "react";
import { TextLink } from "@/components/ui/TextLink";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { socials, siteMeta } from "@/data/socials";
import { THEME_COOKIE, A11Y_COOKIE } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What this portfolio does with data: the AI chat (answered via Groq), hosting logs, two optional preference cookies, and no analytics or tracking.",
  alternates: { canonical: "/privacy" },
  // Its own card (a page's openGraph replaces the layout's whole object, so the image is restated).
  openGraph: {
    type: "website",
    url: "/privacy",
    siteName: `${siteMeta.name} — Portfolio`,
    title: `Privacy · ${siteMeta.name}`,
    description:
      "What this portfolio does with data: the AI chat (answered via Groq), hosting logs, two optional preference cookies, and no analytics or tracking.",
    locale: siteMeta.locale,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: `${siteMeta.name} — ${siteMeta.role}` }],
  },
};

/** The two provider pages the text relies on (checked 2026-10-13); each statement below stays within what they say. */
const GROQ_DATA = "https://console.groq.com/docs/your-data";
const VERCEL_PRIVACY = "https://vercel.com/legal/privacy-notice";

/**
 * Privacy (2026-10-13): what actually happens with data on this site, in a few short paragraphs, as audited — the chat
 * (the visitor's message and the previous answer go to Groq through the site's own route; nothing is stored), the
 * host's ordinary request logs, the two preference cookies set only by the visitor's own choice, and no analytics,
 * tracking or third-party scripts. Linked from the footer and from the chat panel's disclosure line.
 */
export default function Privacy() {
  return (
    <main id="main" className="px-[var(--gutter)] pb-32 pt-12 sm:pt-16">
      <article className="mx-auto w-full max-w-[40rem]">
        <BackLink />
        <h1
          className="mt-6 font-semibold leading-[1.02] tracking-[var(--tracking-display)] text-fg"
          style={{ fontSize: "var(--text-h2)" }}
        >
          Privacy
        </h1>
        <p className="mt-5 text-[1.0625rem] leading-relaxed text-fg">
          This is my personal portfolio. It has no accounts, no sign-up or contact forms, no analytics and no
          advertising. This is everything that happens with data when you visit.
        </p>

        <Section title="The chat assistant">
          <p>
            When you ask the assistant a question, your message and its previous answer are sent from your browser to
            this site&apos;s server, which passes them to Groq to generate the reply. Answers are written by an AI
            model and can be wrong.
          </p>
          <p>
            The site doesn&apos;t save the conversation: it exists only in the open page and is gone when you close or
            reload it. To limit abuse — five questions a minute, and no immediate repeats — the server keeps your IP
            address and a one-way fingerprint of your latest question in its working memory. Entries older than a few
            minutes are cleared as new questions arrive, and none are written to disk or logged.
          </p>
          <p>
            Groq&apos;s documentation says it doesn&apos;t retain inference requests by default, apart from
            short-term logs kept to troubleshoot failures or investigate abuse (up to 30 days):{" "}
            <ExtLink href={GROQ_DATA}>Your Data in GroqCloud</ExtLink>. Please don&apos;t share personal or sensitive
            information in the chat.
          </p>
        </Section>

        <Section title="Hosting and logs">
          <p>
            The site is hosted on Vercel. As with any web host, Vercel&apos;s infrastructure processes ordinary request
            information — such as your IP address, the approximate location derived from it, your browser and the page
            requested — to deliver the site and keep it secure, and may keep it in short-lived logs:{" "}
            <ExtLink href={VERCEL_PRIVACY}>Vercel&apos;s privacy notice</ExtLink>. The site&apos;s own code logs only
            technical errors, never chat messages.
          </p>
        </Section>

        <Section title="Cookies and storage">
          <p>
            Visiting sets no cookies. Two first-party cookies exist only if you change a setting yourself:{" "}
            <code className="font-mono text-[0.9em] text-fg">{THEME_COOKIE}</code> remembers light or dark mode, and{" "}
            <code className="font-mono text-[0.9em] text-fg">{A11Y_COOKIE}</code> remembers your accessibility settings.
            They hold nothing else, last up to a year and are never used for tracking; you can delete them in your
            browser at any time. The site uses no analytics, advertising or tracking, and loads no third-party scripts
            or fonts.
          </p>
        </Section>

        <Section title="Links and downloads">
          <p>
            Email links open your own email app. Links to GitHub, LinkedIn, the App Store, Google Play and T Poker&apos;s
            web app lead to those services, under their own privacy policies. The downloadable résumé is a PDF that
            includes my contact details by design.
          </p>
        </Section>

        <Section title="Questions">
          <p>
            <a href={`mailto:${socials.email}`} className="py-2.5 font-medium text-accent underline underline-offset-4 hover:text-fg">
              Email me
            </a>{" "}
            with any question about this page.
          </p>
        </Section>

        <p className="mt-12 text-sm text-fg-subtle">Last updated 13 October 2026.</p>
        <div className="mt-6">
          <BackLink />
        </div>
      </article>
    </main>
  );
}

function BackLink() {
  return (
    <TextLink href="/" className="gap-1.5">
      <ArrowLeftIcon size={15} className="transition-transform duration-200 ease-[var(--ease-out)] group-hover/tl:-translate-x-0.5" />
      Back to the portfolio
    </TextLink>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold tracking-tight text-fg">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-fg-muted">{children}</div>
    </section>
  );
}

function ExtLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    // Vertical padding on an inline link widens its tap area to ~44px without moving a line of text.
    <a href={href} target="_blank" rel="noopener noreferrer" className="py-2.5 font-medium text-accent underline underline-offset-4 hover:text-fg">
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
