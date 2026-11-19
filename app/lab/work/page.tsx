import type { Metadata } from "next";
import Link from "next/link";
import { siteMeta } from "@/data/socials";
import { PrivateRepoLabel } from "@/components/ui/PrivateRepoLabel";
import { ArrowUpRightIcon } from "@/components/ui/icons";
import { dict } from "@/lib/dict";
import { panels, type Panel } from "./panels";
import { Shot, ratioOf } from "./Shot";
import { Reel } from "./Reel";
import { AboutBlock } from "./AboutBlock";
import { StackBlock } from "./StackBlock";
import "./work.css";

export const metadata: Metadata = { title: "Lab: Work section" };

/** How wide a capture is drawn: phone captures at the device width, desktop windows across the stage; both narrower in
 *  a carousel, whose sides need the room (a window there is 80% of the stage, 86% below 640px: work.css). */
const sizesOf = (kind: Panel["kind"], reel: boolean) => kind === "phone"
  ? reel ? "(min-width: 1024px) 250px, 52vw" : "(min-width: 1024px) 300px, 52vw"
  : reel ? "(min-width: 1280px) 500px, (min-width: 1024px) 36vw, (min-width: 640px) 70vw, 80vw"
    : "(min-width: 1280px) 660px, (min-width: 1024px) 52vw, 92vw";

/**
 * The Work section in the cinematic language: a MEASURED PROTOTYPE slice (round 5; D1 reopened by Tay, 2026-11-18;
 * D2 not reopened, so no WebGL), behind the noindex /lab segment and its `.cine` layer (docs/CINEMATIC_SYSTEM.md). It
 * never replaces the live Work chapters (components/work/).
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
 * Under the panels, About (P3.3, AboutBlock.tsx): who, in about ten seconds, from the live About section's own words.
 * It holds still and ships no client code. Under it, Stack (P3.4, StackBlock.tsx): the live Stack's tools, each with
 * the flagships that use it, plus a Security group from the projects' own text. It holds still too, with no client code.
 *
 * Headings: the title is this route's h1, and each product, About and Stack an h2 (Stack's groups are h3s). In a
 * composed page, under the hero's h1, they step down one level.
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
                      boxes={p.gallery.map((g) => ({ ratio: ratioOf(g.image), ...(g.phone ? { phone: ratioOf(g.phone) } : null) }))}
                      shots={p.gallery.map((g, k) => <Shot key={g.image} {...g} sizes={sizesOf(p.kind, true)} priority={i === 0 && k === 0} />)} />
                  )}
                </figure>
              </article>
            ))}
          </div>
        </section>

        <AboutBlock />
        <StackBlock />
      </main>
    </div>
  );
}
