import type { Metadata } from "next";
import Link from "next/link";
import { siteMeta } from "@/data/socials";
import { PrivateRepoLabel } from "@/components/ui/PrivateRepoLabel";
import { ArrowUpRightIcon } from "@/components/ui/icons";
import { dict } from "@/lib/dict";
import { panels, type Panel } from "./panels";
import { Shot } from "./Shot";
import { Reel } from "./Reel";
import "./work.css";

export const metadata: Metadata = { title: "Lab: Work section" };

/** How wide a capture is drawn: phone captures at the device width (narrower in a carousel, whose sides need the
 *  room), desktop windows across the stage. */
const sizesOf = (kind: Panel["kind"], reel: boolean) => kind === "phone"
  ? reel ? "(min-width: 1024px) 250px, 52vw" : "(min-width: 1024px) 300px, 52vw"
  : "(min-width: 1280px) 660px, (min-width: 1024px) 52vw, 92vw";

/**
 * The Work section in the cinematic language: a MEASURED PROTOTYPE slice (round 5; D2 reopened by Tay, 2026-11-18),
 * behind the noindex /lab segment and its `.cine` layer (docs/CINEMATIC_SYSTEM.md). It never replaces the live Work
 * chapters (components/work/).
 *
 * Four product panels, recruiter-first: the name and one honest line first in reading order, then the state, the
 * stack, the links. Beside them (alternating sides on wide screens), the real capture on a glass stage. Everything is
 * server-rendered. The one client island is the carousel (Reel.tsx), for a project with two or more captures in its
 * gallery (data/projects.ts PROJECT_GALLERIES); a project with one shows it still, with no carousel chrome. Without
 * JavaScript every word and link is there, and each project's first capture. The sky is two static CSS glows: the
 * captures are the star. The opening rises once (data-reveal); the panels
 * hold still (no scroll-triggered entrances). Each stage lifts on hover, keyboard focus and touch; with reduced motion
 * it changes glow, never position.
 *
 * Headings: the title is this route's h1 and each product an h2. In a composed page, under the hero's h1, both step
 * down one level.
 */
export default function WorkSlicePage() {
  const newTab = dict.common.newTab;
  return (
    <div className="cine wk" data-theme="dark">
      <div className="wk__sky" aria-hidden="true">
        <span className="wk__glow wk__glow--cyan" />
        <span className="wk__glow wk__glow--violet" />
      </div>

      <main id="main" className="wk__main shell">
        <section aria-labelledby="wk-title">
          <header className="wk__head">
            <p className="wk__eyebrow" data-reveal>{dict.nav.work}</p>
            <h1 id="wk-title" className="wk__title" data-reveal="settle">Four projects, built end to end.</h1>
            <p className="wk__lede" data-reveal>{siteMeta.heroLead}</p>
          </header>

          <div className="wk__panels">
            {panels.map((p, i) => (
              <article key={p.id} aria-labelledby={`wk-${p.id}`} className="wk__panel"
                data-panel={p.id} data-kind={p.kind} data-side={p.side} data-tone={p.tone}>
                <div className="wk__body">
                  <h2 id={`wk-${p.id}`} className="wk__name">{p.name}</h2>
                  <p className="wk__line">{p.line}</p>
                  <p className="wk__status"><span className="wk__status-k">Status</span> {p.state}</p>
                  <ul className="wk__chips" aria-label={`${p.name}: built with`}>
                    {p.chips.map((c) => <li key={c}>{c}</li>)}
                  </ul>
                  <div className="wk__links">
                    {p.primary && (
                      <a href={p.primary.href} target="_blank" rel="noopener noreferrer" className="wk__go" data-primary>
                        {p.primary.label}<ArrowUpRightIcon size={15} /><span className="sr-only">{newTab}</span>
                      </a>
                    )}
                    {p.privateRepo && <PrivateRepoLabel className="wk__private" />}
                    <Link href={p.more.href} prefetch={false} className="wk__more" data-more>{p.more.label}</Link>
                  </div>
                  {/* P4: the "try it" demo mounts here, one per product. Empty and hidden until a real demo exists:
                      no placeholder, no sample data (docs/CINEMATIC_SYSTEM.md, "Work slice"). */}
                  <div className="wk__demo" data-demo-slot={p.id} hidden />
                </div>
                <figure className="wk__stage" data-captures={p.gallery.length}>
                  {p.gallery.length === 1 ? (
                    <div className="wk__device"><Shot {...p.gallery[0]} sizes={sizesOf(p.kind, false)} priority={i === 0} /></div>
                  ) : (
                    <Reel id={p.id} name={p.name} alts={p.gallery.map((g) => g.alt)}
                      shots={p.gallery.map((g, k) => <Shot key={g.image} {...g} sizes={sizesOf(p.kind, true)} priority={i === 0 && k === 0} />)} />
                  )}
                </figure>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
