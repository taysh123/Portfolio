import { dosFlow, dosRefusal, dosRefusalCaption } from "@/data/work";
import { dict } from "@/lib/dict";

/** Backticked spans become <code>. In a placeholder such as `<path>` only the angle brackets are hidden from screen
 *  readers, so it is read "devos index path" rather than "less than path greater than"; the text itself, and what a
 *  reader copies, stay exactly as the app prints them. (The Product Plates chapter's own helper, restored:
 *  product-plates-final:components/work/DeveloperOSChapter.tsx.) */
function withCode(text: string) {
  const parts = text.split(/`([^`]+)`/);
  return parts.map((t, i) => {
    if (!(i % 2)) return t;
    const bits = t.split(/<(\w+)>/);
    return <code key={i}>{bits.map((b, j) => (j % 2 ? <span key={j}><span aria-hidden="true">&lt;</span>{b}<span aria-hidden="true">&gt;</span></span> : b))}</code>;
  });
}

/**
 * DeveloperOS, cite or decline (P4, docs/P4_PLAN.md §3.3): the panel's explainer, in its own row under the words and
 * the capture. The retrieval sequence as implemented (index, retrieve, evidence, cite, or decline), under its name
 * (shown, Tay's decision); then the refusal, as the app's own words in HTML text, because declining is the other half of answering from
 * evidence. The search capture's file:line chips are boxed on the carousel's first slide (panels.ts MARKS).
 *
 * Every word is the site's own (data/work.ts, lib/dict.ts), unchanged since product-plates-final; tests/unit/work.test.ts
 * holds it to DeveloperOS's data. A server component: nothing is focusable, nothing moves, and without JavaScript it is
 * the same.
 */
export function DosExplainer() {
  return (
    <>
      <div className="wk__dos-rail">
        <p id="wk-dos-flow" className="wk__dos-label">{dict.dos.flow}</p>
        <ol className="wk__dos-flow" aria-labelledby="wk-dos-flow">
          {dosFlow.map((s) => <li key={s.k} data-k={s.k}><b>{s.name}</b><span>{s.body}</span></li>)}
        </ol>
      </div>
      <figure className="wk__dos-refusal">
        <figcaption>{withCode(dosRefusalCaption.body)}</figcaption>
        {/* The app's own words, verbatim (devos/modules/learning.py, INSUFFICIENT_MSG). */}
        <div className="wk__dos-says"><p>{withCode(dosRefusal.message)}</p></div>
      </figure>
    </>
  );
}
