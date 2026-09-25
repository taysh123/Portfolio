import { FlagshipScene } from "./FlagshipScene";
import { CaseStudyHost } from "./CaseStudyHost";
import { flagships, projectOf } from "@/data/work";
import Image from "next/image";
import "./worlds/worlds.css";

/** Spec §5.2 "each project becomes the whole website". The flagship run is a dark stage in both themes
 *  (Plan 2 decision 1); More Work follows the site theme. */
export function Work({ worlds = {} }: { worlds?: Partial<Record<string, React.ReactNode>> }) {
  return (
    <section id="work" aria-labelledby="work-title">
      {/* Hero above is dark in both themes, so no top seam; the bottom seam leads into the themed More Work. */}
      <div data-theme="dark" className="work__stage seam-bottom-dark bg-[var(--bg)]">
        <header className="shell pt-[clamp(7rem,14vh,12rem)] pb-10">
          <p className="label text-fg-subtle">Work</p>
          <h2 id="work-title" className="mt-4 text-[clamp(2.25rem,5vw,4.5rem)] font-semibold tracking-[-0.035em] text-fg">Selected work</h2>
          <p className="mt-4 max-w-[62ch] text-fg-muted" style={{ fontSize: "var(--text-lead)" }}>Four flagship projects, and two more worth a look.</p>
        </header>
        {flagships.map((f) => {
          const p = projectOf(f.id);
          return <FlagshipScene key={f.id} f={f} world={worlds[f.id] ?? (
            <div className="world-frame"><Image src={p.media!.image!} alt={p.media!.alt ?? ""} fill sizes="(min-width:1024px) 58vw, 100vw" className="object-contain" /></div>)} />;
        })}
      </div>
      {/* More Work (Task 17) renders here, in the site theme. */}
      <CaseStudyHost />
      <noscript><style>{".case-study-trigger{display:none}"}</style></noscript>
    </section>
  );
}
