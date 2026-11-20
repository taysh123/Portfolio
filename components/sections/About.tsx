import { aboutBlock as a } from "./aboutBlock";

/**
 * About (P3.3), under Work: who, in about ten seconds. The title on one side; the two sentences and the four facts on
 * the other (stacked on phones, in reading order). Server-rendered, with no client code, no photo and no capture: the
 * products above are the picture.
 *
 * It ends on the facts (R10, ROADMAP #15): composed, the hero carries the résumé and the availability pill, Contact
 * has all four links, and the footer repeats them, so About no longer repeats its availability line and links.
 *
 * It holds still. The page's one opening reveal stays the only one (docs/CINEMATIC_SYSTEM.md, "Motion language").
 */
export function About() {
  return (
    <section id="about" aria-labelledby="wk-about-title" className="wk__about" data-about>
      <div className="wk__about-head">
        <p className="wk__about-eyebrow">{a.eyebrow}</p>
        <h2 id="wk-about-title" className="wk__about-title">
          <span>{a.title[0]}</span> <span>{a.title[1]}</span>
        </h2>
      </div>
      <div className="wk__about-body">
        <p className="wk__about-lede">{a.lede}</p>
        <ul className="wk__about-facts">
          {a.facts.map((f) => <li key={f}>{f}</li>)}
        </ul>
      </div>
    </section>
  );
}
