import { StackLensStatus } from "./StackLensStatus";
import type { Dict } from "@/lib/dict";

/**
 * The project lens: one radio per project. Choosing one filters the rows below to the tools that project's own text
 * names (data/stackLens.ts); "All" shows everything. The filtering is CSS (Stack.tsx), so it works before hydration
 * and with JavaScript off, and the radio group brings native keyboard behaviour. The one-line summary is the only
 * part that needs JavaScript (StackLensStatus).
 */
export function StackLens({ options, t }: { options: { id: string; name: string; count: number }[]; t: Dict }) {
  return (
    <fieldset className="lens" data-stack-lens>
      <legend className="lens__label">{t.stack.filter}</legend>
      <div className="lens__options">
        <label className="lens__option" data-all>
          <input type="radio" name="stack-lens" value="" defaultChecked />
          <span>{t.stack.all}</span>
        </label>
        {options.map((o) => (
          <label key={o.id} className="lens__option">
            <input type="radio" name="stack-lens" value={o.id} data-lens-option={o.id} />
            <span lang="en">{o.name}</span>
          </label>
        ))}
      </div>
      <StackLensStatus options={options} />
    </fieldset>
  );
}
