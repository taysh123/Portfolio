import { aegisCopy, aegisTrace } from "@/data/work";
import { dict } from "@/lib/dict";
import { held } from "@/lib/held";

type Step = { k: string; name: string; body: string };
const step = (s: Step) => <><b>{s.name}</b><span>{held(s.body)}</span></>;

/**
 * Aegis, one alert start to finish (P4, docs/P4_PLAN.md §3.2): the panel's explainer, in its own row under the words
 * and the capture. Ingest, normalise, detect; then the fork the code really has (Detection publishes each alert once,
 * and threat scoring and the alert stream each take it, in parallel); then the analyst's live feed, whose row is ringed
 * on the carousel's first slide (panels.ts MARKS). Then the honest note on the shared PostgreSQL schema.
 *
 * A figure captioned by the trace's title around an ordered list; the fork is a nested list after "Then, in parallel",
 * so a screen reader hears both the order and the branching. The rail, the nodes and the ring are decoration.
 *
 * Every word is the site's own (data/work.ts, lib/dict.ts); tests/unit/work.test.ts holds it to Aegis's data. A server
 * component: nothing is focusable, nothing moves, and without JavaScript it is the same.
 */
export function AegisExplainer() {
  return (
    <>
      <figure className="wk__aegis-trace" aria-labelledby="wk-aegis-trace">
        <figcaption id="wk-aegis-trace" className="wk__aegis-label">{dict.aegis.traceTitle}</figcaption>
        <ol className="wk__aegis-flow">
          {aegisTrace.main.map((s) => <li key={s.k} data-k={s.k}>{step(s)}</li>)}
          <li className="wk__aegis-fork">
            <span className="wk__aegis-then">{dict.aegis.parallel}</span>
            <ul className="wk__aegis-branches">
              {aegisTrace.fork.map((s) => <li key={s.k} data-k={s.k}>{step(s)}</li>)}
            </ul>
          </li>
          <li data-k={aegisTrace.end.k}>{step(aegisTrace.end)}</li>
        </ol>
      </figure>
      <p className="wk__aegis-seam">{held(aegisCopy.seam)}</p>
    </>
  );
}
