import { StackLensStatus } from "./StackLensStatus";

/**
 * The project lens: one radio per project. Choosing one filters the rows below to the tools that project's own text
 * names (data/stackLens.ts); "All" shows everything. The filtering is CSS (Stack.tsx), so it works before hydration
 * and with JavaScript off, and the radio group brings native keyboard behaviour. The one-line summary is the only
 * part that needs JavaScript (StackLensStatus).
 */
export function StackLens({ options }: { options: { id: string; name: string; count: number }[] }) {
  return (
    <fieldset className="lens" data-stack-lens>
      <legend className="lens__label">Filter by project</legend>
      <div className="lens__options">
        <label className="lens__option" data-all>
          <input type="radio" name="stack-lens" value="" defaultChecked />
          <span>All</span>
        </label>
        {options.map((o) => (
          <label key={o.id} className="lens__option">
            <input type="radio" name="stack-lens" value={o.id} data-lens-option={o.id} />
            <span>{o.name}</span>
          </label>
        ))}
      </div>
      <StackLensStatus options={options} />
    </fieldset>
  );
}
