import { PrivateRepoLabel } from "@/components/ui/PrivateRepoLabel";
import { ArrowUpRightIcon } from "@/components/ui/icons";
import { dict } from "@/lib/dict";
import { panels, type Panel } from "./panels";
import { Shot, ratioOf } from "./Shot";
import { Reel } from "./Reel";
import { MoreWork } from "./MoreWork";
import "./work.css";

/** How wide a capture is drawn: phone captures at the device width, desktop windows across the stage; both narrower in
 *  a carousel, whose sides need the room (a window there is 80% of the stage, 86% below 640px: work.css). */
const sizesOf = (kind: Panel["kind"], reel: boolean) => kind === "phone"
  ? reel ? "(min-width: 1024px) 250px, 52vw" : "(min-width: 1024px) 300px, 52vw"
  : reel ? "(min-width: 1280px) 500px, (min-width: 1024px) 36vw, (min-width: 640px) 70vw, 80vw"
    : "(min-width: 1280px) 660px, (min-width: 1024px) 52vw, 92vw";

/**
 * Work, in the cinematic language (Concept A; D1 reopened by Tay, 2026-11-18; D2 not reopened, so no WebGL), inside
 * the page's `.wk` region and its `.cine` layer (docs/CINEMATIC_SYSTEM.md).
 *
 * Four product panels, recruiter-first: the name and one honest line first in reading order, then the state, the
 * stack, the links. Beside them (alternating sides on wide screens), the real capture on a glass stage. Everything is
 * server-rendered. The one client island is the carousel (Reel.tsx), for a project with two or more captures in its
 * gallery (data/projects.ts PROJECT_GALLERIES); a project with one shows it still, with no carousel chrome. Without
 * JavaScript every word and link is there, and each project's first capture. The panels hold still (no
 * scroll-triggered entrances), and the section has no reveal of its own: the hero's is the page's one (R10). Each
 * stage lifts on hover, keyboard focus and touch; with reduced motion it changes glow, never position.
 *
 * Depth (R4): each panel's "Case study" button opens the site's existing case-study dialog (CaseStudyHost, which the
 * page mounts), lazily, by its `data-case-study`. Under the four panels, Two more (R5, MoreWork.tsx), each with its
 * own. The ids are the live page's (R7): `#work`, `#work-<id>`, `#more-work`.
 *
 * Headings: under the hero's h1, the section's title is an h2 and each product an h3.
 */
export function Work() {
  const newTab = dict.common.newTab;
  return (
    <section id="work" aria-labelledby="wk-title">
      <header className="wk__head">
        <p className="wk__eyebrow">{dict.nav.work}</p>
        <h2 id="wk-title" className="wk__title">Four projects, built end to end.</h2>
      </header>

      <div className="wk__panels">
        {panels.map((p) => (
          <article key={p.id} id={`work-${p.id}`} aria-labelledby={`wk-${p.id}`} className="wk__panel"
            data-panel={p.id} data-kind={p.kind} data-side={p.side} data-tone={p.tone}>
            <div className="wk__body">
              <h3 id={`wk-${p.id}`} className="wk__name">{p.name}</h3>
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
                <button type="button" className="wk__more case-study-trigger" data-case-study={p.id} aria-haspopup="dialog">
                  {dict.common.caseStudy}
                </button>
              </div>
              {/* P4: the "try it" demo mounts here, one per product. Empty and hidden until a real demo exists:
                  no placeholder, no sample data (docs/CINEMATIC_SYSTEM.md, "Work slice"). */}
              <div className="wk__demo" data-demo-slot={p.id} hidden />
            </div>
            <figure className="wk__stage" data-captures={p.gallery.length}>
              {/* No capture is a priority on this page: the hero fills the first screen, so every one is lazy. */}
              {p.gallery.length === 1 ? (
                <div className="wk__device"><Shot {...p.gallery[0]} sizes={sizesOf(p.kind, false)} /></div>
              ) : (
                <Reel id={p.id} name={p.name} alts={p.gallery.map((g) => g.alt)}
                  boxes={p.gallery.map((g) => ({ ratio: ratioOf(g.image), ...(g.phone ? { phone: ratioOf(g.phone) } : null) }))}
                  shots={p.gallery.map((g) => <Shot key={g.image} {...g} sizes={sizesOf(p.kind, true)} />)} />
              )}
            </figure>
          </article>
        ))}
      </div>

      <MoreWork />
    </section>
  );
}
