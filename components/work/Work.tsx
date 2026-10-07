import { FlagshipScene } from "./FlagshipScene";
import { CaseStudyHost } from "./CaseStudyHost";
import { MoreWork } from "./MoreWork";
import { flagships, projectOf } from "@/data/work";
import Image from "next/image";
import "./worlds/worlds.css";

const EARLY_CASE_STUDY = `document.addEventListener("click",function(e){if(window.__csReady)return;var b=e.target&&e.target.closest&&e.target.closest("[data-case-study]");if(b)window.__csEarly=b;},true);`;

/** Spec §5.2 "each project becomes the whole website". The flagship run is a dark stage in both themes
 *  (Plan 2 decision 1); More Work follows the site theme. */
export function Work({ worlds = {} }: { worlds?: Partial<Record<string, React.ReactNode>> }) {
  return (
    <section id="work" aria-labelledby="work-title">
      {/* Hero above is dark in both themes, so no top seam; the bottom seam leads into the themed More Work. */}
      <div data-theme="dark" className="work__stage seam-bottom-dark bg-[var(--bg)]">
        {/* The opener of the work: the section title at display scale, then the four chapters as contents —
            the same numbers each chapter carries, so the run reads as one system before it starts. */}
        <header className="shell work-intro">
          <p className="label text-fg-subtle">Work</p>
          <h2 id="work-title" className="work-intro__title">Selected work</h2>
          <p className="work-intro__lead">Four flagship projects, and two more worth a look.</p>
          <nav aria-label="Flagship chapters" className="work-intro__toc">
            <ol>
              {flagships.map((f) => (
                <li key={f.id}><a href={`#work-${f.id}`}><span className="work-intro__n" aria-hidden="true">{f.number}</span><span>{projectOf(f.id).name}</span></a></li>
              ))}
            </ol>
          </nav>
        </header>
        {flagships.map((f) => {
          const p = projectOf(f.id);
          return <FlagshipScene key={f.id} f={f} world={worlds[f.id] ?? (
            <div className="world-frame"><Image src={p.media!.image!} alt={p.media!.alt ?? ""} fill sizes="(min-width:1024px) 58vw, 100vw" className="object-contain" /></div>)} />;
        })}
      </div>
      {/* More Work follows the site theme. */}
      <MoreWork />
      {/* A "Case study" press before hydration would otherwise be lost (the host's listener isn't attached yet):
          remember the last early opener; CaseStudyHost replays it on mount. Inline because it must run before
          any bundle (CSP allows inline scripts, proxy.ts). */}
      <script dangerouslySetInnerHTML={{ __html: EARLY_CASE_STUDY }} />
      <CaseStudyHost />
      <noscript><style>{".case-study-trigger{display:none}"}</style></noscript>
    </section>
  );
}
