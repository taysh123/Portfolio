import { tbsBlock as t } from "./tbsBlock";
import { held } from "@/lib/held";

/**
 * Think · Build · Ship (P3.5), under Stack: the live section's three principles, each with its evidence from the four
 * flagships. The live title, then three ruled rows, as the live section has them. From 1024px each row's word and line
 * take one side and the summary and evidence the other, on About's and Stack's grid; stacked on phones. Each piece of
 * evidence opens with its project's name, set apart in ink so a reader can find the four at a glance.
 *
 * Server-rendered, with no client code, no link and no control. It holds still: the page's one opening reveal stays the
 * only one (docs/CINEMATIC_SYSTEM.md, "Motion language").
 */
export function ThinkBuildShip() {
  return (
    <section id="approach" aria-labelledby="wk-tbs-title" className="wk__tbs" data-tbs>
      <h2 id="wk-tbs-title" className="wk__tbs-title">{t.title}</h2>
      <ol className="wk__tbs-rows">
        {t.rows.map((r) => (
          <li key={r.word} className="wk__tbs-row">
            <div className="wk__tbs-head">
              <h3 className="wk__tbs-word">{r.word}<span className="sr-only">:</span></h3>
              <p className="wk__tbs-line">{r.line}</p>
            </div>
            <div className="wk__tbs-body">
              <p className="wk__tbs-summary">{held(r.summary)}</p>
              {r.evidence.map((e) => (
                <p key={e.name} className="wk__tbs-example" data-project={e.name}>
                  <span className="wk__tbs-project">{e.name}</span>{held(e.rest)}
                </p>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
