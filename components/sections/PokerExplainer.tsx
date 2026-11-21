import { projects } from "@/data/projects";
import { pokerSteps } from "@/data/work";
import { dict } from "@/lib/dict";
import { fmt } from "@/lib/fmt";

/**
 * T Poker, the stepper (P4, docs/P4_PLAN.md §3.1, option A): the panel's explainer, in its own row under the capture's
 * column. Three steps walk the product: start a game, run the tournament, settle up. Their screens are the carousel's
 * first three captures, so the steps drive the carousel instead of bringing a second copy (Q3): choosing a step brings
 * its capture to the front, and moving the carousel checks the step of the capture in front (none for the podium and
 * the stats). The carousel (Reel.tsx, `steps`) does the coupling; this stays server HTML.
 *
 * A native radio group under its shown name (Tay's decision): one Tab stop, the arrow keys move and check, and each step
 * is described by its caption. Without JavaScript, and until the carousel hydrates, it still works: CSS shows the chosen
 * step's caption and swaps its capture in front (work.css). Every word is the site's own (data/work.ts, lib/dict.ts),
 * unchanged since product-plates-final; tests/unit/work.test.ts holds it to T Poker's data.
 */
export function PokerExplainer() {
  const name = projects.find((p) => p.id === "poker")!.name;
  return (
    <div className="wk__poker">
      <fieldset id="wk-poker-steps" className="wk__poker-steps">
        <legend className="wk__poker-legend">{fmt(dict.poker.walk, { name })}</legend>
        <div className="wk__poker-track">
          {pokerSteps.map((s, k) => (
            <label key={s.label} className="wk__poker-step">
              <input type="radio" name="wk-poker-step" value={k} data-step={k} defaultChecked={k === 0} aria-describedby={`wk-poker-cap-${k}`} />
              <span><i aria-hidden="true">{k + 1}</i>{s.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {/* One caption shows, the chosen step's; all three stay in the page as the steps' descriptions. */}
      <div className="wk__poker-caps">
        {pokerSteps.map((s, k) => <p key={s.label} id={`wk-poker-cap-${k}`} className="wk__poker-cap" data-step={k}>{s.caption}</p>)}
      </div>
    </div>
  );
}
