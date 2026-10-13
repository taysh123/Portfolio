import { pillars } from "@/data/approach";
import "./tbs.css";

/** Think · Build · Ship (M10): three principles as ruled rows — the word, the principle, and its evidence from a real
 *  project. Unpinned: it reads at the visitor's pace, like the rest of the page. */
export function ThinkBuildShip() {
  return (
    <section id="approach" aria-labelledby="approach-title" className="tbs">
      <div className="shell">
        <h2 id="approach-title" className="tbs__title">Think. Build. Ship.</h2>
        <ol className="tbs__rows">
          {pillars.map((p) => (
            <li key={p.word} className="tbs__row">
              <h3 className="tbs__word">{p.word}<span className="sr-only">:</span></h3>
              <div className="tbs__principle">
                <p className="tbs__line">{p.line}</p>
                <p className="tbs__summary">{p.summary}</p>
              </div>
              <p className="tbs__example">{p.example}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
