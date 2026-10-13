import { socials } from "@/data/socials";
import type { Content } from "@/lib/content";
import { ButtonLink } from "@/components/ui/Button";
import { TextLink } from "@/components/ui/TextLink";
import { Pic } from "@/components/ui/Pic";
import "./hero.css";

/**
 * The first screen (M10, Direction A): a headline and one line of range on paper, then the four products as plates
 * — each a real capture on its own surface, each a link to its chapter. The plates rise from the bottom edge, so the
 * page reads as a studio table the work is set on, and the T Poker plate meets the T Poker chapter's navy below it.
 *
 * Below 1240px the plates become a 2×2 (and on a short landscape screen they sit beside the copy), right after the
 * copy and the primary action (docs/m10/headline-study.md has the measurements behind that order). Images only: no
 * canvas, no WebGL, no script. Every plate image loads eagerly; the two that Lighthouse finds as the largest paint —
 * Aegis's window on wide screens, DeveloperOS's on phones — are the two fetched at high priority.
 */
export function Hero({ c }: { c: Content }) {
  const { siteMeta, t } = c;
  const [poker, aegis, dos, gf] = c.heroIndex;
  return (
    <section id="hero" aria-labelledby="hero-title" className="hero">
      <div className="hero__copy shell">
        <h1 id="hero-title" tabIndex={-1} className="hero__title">{siteMeta.headline}</h1>
        <div className="hero__aside">
          <p data-hero-lead className="hero__lead">{siteMeta.heroLead}</p>
          <div data-hero-ctas className="hero__actions">
            <ButtonLink href="#work" size="lg">{t.hero.seeWork}</ButtonLink>
            <TextLink href={socials.github.url} external newTab={t.common.newTab}>GitHub</TextLink>
          </div>
        </div>
      </div>

      <nav aria-label={t.hero.plates} data-hero-index className="plates shell">
        <a href={poker.href} data-map={poker.id} className="tile tile--poker">
          <span className="tile__cap">
            <Pic name="tpoker-icon" sizes="22px" alt="" className="tile__icon" priority />
            <span><b>{poker.name}</b><span>{poker.state}</span></span>
          </span>
          <span className="tile__stage" aria-hidden="true">
            <span className="tile__phone tile__phone--back"><Pic name="hero-poker-home" sizes="(min-width: 1240px) 12vw, (min-width: 640px) 13vw, 18vw" alt="" priority /></span>
            <span className="tile__phone tile__phone--front"><Pic name="hero-poker-live" sizes="(min-width: 1240px) 16vw, (min-width: 640px) 16vw, 23vw" alt="" priority /></span>
          </span>
        </a>
        <a href={aegis.href} data-map={aegis.id} className="tile tile--aegis">
          <span className="tile__cap"><span><b>{aegis.name}</b><span>{aegis.state}</span></span></span>
          <span className="tile__stage" aria-hidden="true">
            <span className="tile__win"><Pic name="hero-aegis" sizes="(min-width: 1240px) 24vw, (min-width: 640px) 42vw, 40vw" alt="" priority="high" /></span>
            {/* Tall plates (the one-row layout, and phones) also show the alert behind the incidents: the approved port-scan row crop. */}
            <span className="tile__win tile__win--row"><Pic name="aegis-alerts" sizes="(min-width: 1240px) 24vw, (max-width: 639px) 42vw, 1px" alt="" priority /></span>
          </span>
        </a>
        <a href={dos.href} data-map={dos.id} className="tile tile--dos">
          <span className="tile__cap"><span><b>{dos.name}</b><span>{dos.state} · v1.0.0</span></span></span>
          <span className="tile__stage" aria-hidden="true"><span className="tile__win"><Pic name="hero-dos" sizes="(min-width: 1240px) 21vw, (min-width: 640px) 42vw, 40vw" alt="" priority="high" /></span></span>
        </a>
        <a href={gf.href} data-map={gf.id} className="tile tile--gf">
          <span className="tile__cap"><span><b>{gf.name}</b><span>{gf.state}</span></span></span>
          <span className="tile__stage" aria-hidden="true"><span className="tile__phone"><Pic name="hero-gf" sizes="(min-width: 1240px) 12vw, (min-width: 640px) 16vw, 27vw" alt="" priority /></span></span>
        </a>
      </nav>
    </section>
  );
}
