import { resume } from "@/data/socials";
import { ArrowDownIcon, ArrowUpRightIcon } from "@/components/ui/icons";
import { AvailabilityPill } from "@/components/layout/AvailabilityPill";
import type { Content } from "@/lib/content";
import { FEATURED_KIND } from "./featured";
import { Constellation } from "./Constellation";
import "./hero.css";

/**
 * The hero (Concept A, the locked hero: D1 reopened by Tay, 2026-11-18; D2 not reopened, so no WebGL). The page's
 * first screen, in the cinematic layer (app/cinematic.css, docs/CINEMATIC_SYSTEM.md).
 *
 * Its top line (the wordmark and the availability pill) is the site header now (components/layout/Navbar.tsx, R2):
 * the header shows no surface over the hero, so the first screen still reads as the locked hero. Where the header has
 * no room for the pill (below 1280px), the pill sits here instead, where the locked hero wrapped it, under the
 * wordmark. Only one of the two is ever displayed.
 *
 * Progressive enhancement: everything a reader needs (the copy, both actions and the four projects) is server-rendered
 * HTML. The sky is CSS. The one live element, the constellation, is a client island on a 2D canvas that is aria-hidden
 * and pointer-events: none, so without JavaScript, or with reduced motion, the page reads and works the same. The
 * load reveal is one CSS sequence (the layer's [data-reveal]), which also runs without JavaScript and is off with
 * reduced motion. It is the page's one reveal (R10).
 *
 * Honest by construction: the role, the availability and each project's state come from the same data as the rest of
 * the site, and each project's one-line tag is checked against its own data. Every link is in-page (R7).
 */
export function Hero({ c }: { c: Content }) {
  const { siteMeta, heroIndex, t } = c;
  return (
    <section id="hero" aria-labelledby="hxa-title" className="hxa">
      <div className="hxa__sky" aria-hidden="true">
        <span className="hxa__glow hxa__glow--cyan" />
        <span className="hxa__glow hxa__glow--violet" />
      </div>
      <Constellation />

      <div className="hxa__main shell">
        <AvailabilityPill className="hxa__pill--hero" reveal />
        <div className="hxa__hero">
          <p className="hxa__eyebrow" data-reveal>{siteMeta.role}</p>
          <h1 id="hxa-title" className="hxa__title" data-reveal="settle">
            <span className="hxa__l1">Building software.</span>{" "}
            <span className="cine-duotone-text">Turning ideas into products.</span>
          </h1>
          <p className="hxa__lede" data-reveal>
            I build end to end — mobile apps, security systems, developer tools and games, from the interface down to the
            infrastructure.
          </p>
          <div className="hxa__ctas" data-reveal>
            <a href="#work" className="hxa__btn hxa__btn--primary">
              Explore my work<ArrowUpRightIcon size={17} />
            </a>
            <a href={resume.href} download={resume.fileName} type="application/pdf" className="hxa__btn hxa__btn--ghost">
              Download résumé<ArrowDownIcon size={17} />
              <span className="sr-only"> (PDF{t.contact.resumeNote})</span>
            </a>
          </div>
        </div>

        <nav aria-labelledby="hxa-featured" className="hxa__featured" data-reveal>
          <h2 id="hxa-featured" className="hxa__flabel">Featured work</h2>
          <ul className="hxa__flist">
            {heroIndex.map((x) => (
              <li key={x.id}>
                <a href={x.href} className="hxa__flink" data-featured={x.id}>
                  <b>{x.name}</b>
                  <span className="hxa__fkind">{FEATURED_KIND[x.id as keyof typeof FEATURED_KIND]}</span>
                  <span className="hxa__fstate">{x.state}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
