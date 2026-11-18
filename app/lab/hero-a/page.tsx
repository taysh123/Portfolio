import type { Metadata } from "next";
import Link from "next/link";
import { resume } from "@/data/socials";
import { getContent } from "@/lib/content";
import { FEATURED_KIND } from "./featured";
import { Constellation } from "./Constellation";
import "./hero-a.css";

export const metadata: Metadata = { title: "Lab: Concept A hero" };

/**
 * Concept A, "Cinematic hero": a MEASURED PROTOTYPE of the hero only (D2 reopened by Tay, 2026-11-18). It lives here,
 * behind the noindex /lab segment, and never replaces the live hero (components/sections/Hero.tsx).
 *
 * Progressive enhancement: everything a reader needs (the copy, both actions and the four projects) is server-rendered
 * HTML. The sky is CSS. The one live element, the constellation, is a client island on a 2D canvas that is aria-hidden
 * and pointer-events: none, so without JavaScript, or with reduced motion, the page reads and works the same. The
 * load reveal is one CSS sequence (hero-a.css), which also runs without JavaScript and is off with reduced motion.
 *
 * Honest by construction: the role, the availability and each project's state come from the same data as the live
 * site, and each project's one-line tag is checked against its own data (tests/unit/lab-hero-a.test.ts).
 */
export default function HeroAPage() {
  const { siteMeta, availability, heroIndex, t } = getContent();
  return (
    <div className="hxa" data-theme="dark">
      <div className="hxa__sky" aria-hidden="true">
        <span className="hxa__glow hxa__glow--cyan" />
        <span className="hxa__glow hxa__glow--violet" />
      </div>
      <Constellation />

      <header className="hxa__top shell">
        <Link href="/" prefetch={false} className="hxa__mark">
          <svg className="hxa__glyph" viewBox="0 0 32 32" width="34" height="34" aria-hidden="true" focusable="false">
            <defs>
              <linearGradient id="hxa-mark-ink" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#2ee6d6" />
                <stop offset="1" stopColor="#9b6bff" />
              </linearGradient>
            </defs>
            <rect x="0.5" y="0.5" width="31" height="31" rx="9" fill="none" stroke="url(#hxa-mark-ink)" strokeOpacity="0.55" />
            <path d="M11.5 11 6.5 16l5 5M20.5 11l5 5-5 5M17.6 9.5l-3.2 13" fill="none" stroke="url(#hxa-mark-ink)"
              strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {/* Real spaces around the slash: without them the link's accessible name runs the two words together. */}
          <span className="hxa__word"><b>{siteMeta.name}</b> <i aria-hidden="true">/</i> Portfolio</span>
        </Link>
        {availability.open && (
          <p className="hxa__pill"><span className="hxa__dot" aria-hidden="true" />Available for opportunities</p>
        )}
      </header>

      <main id="main" className="hxa__main shell">
        <section aria-labelledby="hxa-title" className="hxa__hero">
          <p className="hxa__eyebrow">{siteMeta.role}</p>
          <h1 id="hxa-title" className="hxa__title">
            <span className="hxa__l1">Building software.</span>{" "}
            <span className="hxa__grad">Turning ideas into products.</span>
          </h1>
          <p className="hxa__lede">
            I build end to end — mobile apps, security systems, developer tools and games, from the interface down to the
            infrastructure.
          </p>
          <div className="hxa__ctas">
            <Link href="/#work" prefetch={false} className="hxa__btn hxa__btn--primary">
              Explore my work<span aria-hidden="true">↗</span>
            </Link>
            <a href={resume.href} download={resume.fileName} type="application/pdf" className="hxa__btn hxa__btn--ghost">
              Download résumé<span aria-hidden="true">↓</span>
              <span className="sr-only"> (PDF{t.contact.resumeNote})</span>
            </a>
          </div>
        </section>

        <nav aria-labelledby="hxa-featured" className="hxa__featured">
          <h2 id="hxa-featured" className="hxa__flabel">Featured work</h2>
          <ul className="hxa__flist">
            {heroIndex.map((x) => (
              <li key={x.id}>
                <Link href={`/${x.href}`} prefetch={false} className="hxa__flink" data-featured={x.id}>
                  <b>{x.name}</b>
                  <span className="hxa__fkind">{FEATURED_KIND[x.id as keyof typeof FEATURED_KIND]}</span>
                  <span className="hxa__fstate">{x.state}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>
    </div>
  );
}
