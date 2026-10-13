import type { Content } from "@/lib/content";
import { AEGIS_ROW, AEGIS_CROPS, srcSet, fallback, IMAGES } from "@/data/images";
import { Button } from "@/components/ui/Button";
import { TextLink } from "@/components/ui/TextLink";
import { publicRepoUrl } from "@/data/projects";
import "./aegis.css";

/** The highlighted alert row, placed on each crop from the row's measured bounds (in the capture's own pixels). */
const box = (c: { left: number; top: number; width: number; height: number }, pad: number, v: string) => ({
  [`--hl-l${v}`]: `${(((AEGIS_ROW.left - pad - c.left) / c.width) * 100).toFixed(2)}%`,
  [`--hl-t${v}`]: `${(((AEGIS_ROW.top - pad - c.top) / c.height) * 100).toFixed(2)}%`,
  [`--hl-h${v}`]: `${(((AEGIS_ROW.bottom - AEGIS_ROW.top + 2 * pad) / c.height) * 100).toFixed(2)}%`,
}) as React.CSSProperties;

/**
 * Aegis (M10): steel plate, the system as a story. The product comes first — the Detect step's own output on the real
 * Alerts page (the port-scan row, 20 distinct ports in 60 seconds), cropped to that row so it reads at every width, and
 * transcribed beside it — then
 * one alert, start to finish: ingest, normalise, detect, the fork the code really has (threat scoring and the alert
 * stream take each alert in parallel), and the dashboard it lands on. Everything a visitor reads is HTML.
 */
export function AegisChapter({ c }: { c: Content }) {
  const { t, aegisCopy, aegisTrace } = c;
  const f = c.flagships.find((x) => x.id === "aegis")!, p = c.project("aegis");
  const repo = publicRepoUrl(p);
  const step = (s: { k: string; name: string; body: string }) => (
    <><b className="trace__name">{s.name}</b><span className="trace__body">{s.body}</span></>
  );
  return (
    <section id="work-aegis" aria-labelledby="work-aegis-title" data-plate="aegis" className="plate chapter aegis">
      <div className="shell">
        <div className="aegis__head">
          <div>
            <h2 id="work-aegis-title" className="chapter__title" lang="en">{f.title}</h2>
            <p className="chapter__lede">{f.lede}</p>
          </div>
          <div className="chapter__actions">
            <Button data-case-study={p.id} aria-haspopup="dialog" className="case-study-trigger">{t.common.caseStudy}</Button>
            {repo && <TextLink href={repo} external newTab={t.common.newTab}>{t.common.source}</TextLink>}
          </div>
        </div>

        <figure className="aegis__evidence">
          <div className="console">
            <div className="console__bar" aria-hidden="true"><span /><span /><span /><bdo dir={c.locale === "he" ? "rtl" : "ltr"} className="console__title">{t.aegis.bar}</bdo></div>
            <div className="console__shot" style={{ ...box(AEGIS_CROPS.desktop, 8, ""), ...box(AEGIS_CROPS.phone, 6, "-m") }}>
              <picture>
                <source media="(max-width: 639px)" type="image/avif" srcSet={srcSet("aegis-alerts-phone", "avif")} sizes="100vw" />
                <source media="(max-width: 639px)" type="image/webp" srcSet={srcSet("aegis-alerts-phone", "webp")} sizes="100vw" />
                <source type="image/avif" srcSet={srcSet("aegis-alerts", "avif")} sizes="(min-width: 1100px) 64vw, 92vw" />
                <img src={fallback("aegis-alerts")} srcSet={srcSet("aegis-alerts", "webp")} sizes="(min-width: 1100px) 64vw, 92vw"
                  width={IMAGES["aegis-alerts"].w} height={IMAGES["aegis-alerts"].h} loading="lazy" decoding="async"
                  alt={t.aegis.alt} />
              </picture>
              <span className="console__hl" aria-hidden="true" />
            </div>
          </div>
          <figcaption className="console__note">
            <b>{aegisCopy.label}</b>
            <q lang="en" dir="ltr">{aegisCopy.row}</q>
            <span>{aegisCopy.onScreen}</span>
          </figcaption>
        </figure>

        <figure className="trace" aria-labelledby="aegis-trace-title">
          <figcaption id="aegis-trace-title" className="trace__title">{t.aegis.traceTitle}</figcaption>
          <ol className="trace__list">
            {aegisTrace.main.map((s) => <li key={s.k} className="trace__step" data-k={s.k}>{step(s)}</li>)}
            <li className="trace__fork">
              <span className="trace__then">{t.aegis.parallel}</span>
              <ul className="trace__branches">
                {aegisTrace.fork.map((s) => <li key={s.k} className="trace__step" data-k={s.k}>{step(s)}</li>)}
              </ul>
            </li>
            <li className="trace__step" data-k={aegisTrace.end.k}>{step(aegisTrace.end)}</li>
          </ol>
        </figure>

        <p className="aegis__seam">{aegisCopy.seam}</p>
      </div>
    </section>
  );
}
