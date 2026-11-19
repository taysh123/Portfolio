import { stackBlock as s } from "./stack";
import { StackFilter } from "./StackFilter";

/**
 * Stack (P3.4), under About: the tools behind the work, as the live Stack shows them (components/sections/Stack.tsx),
 * restyled in the lab's layer. One row per group: its name, its tools on one wrapping line, and the group's evidence
 * sentence under them. Each tool carries its flagships the live way: `data-p` for the filter, and the names in its
 * accessible text and hover title.
 *
 * Above the groups, "Filter by project" (StackFilter.tsx, the one client island here): pressing a project lights its
 * tools and dims the rest. Server-rendered otherwise; without JavaScript the full list shows. Nothing in it moves.
 */
export function StackBlock() {
  return (
    <section aria-labelledby="wk-stack-title" className="wk__stack" data-stack>
      <p className="wk__stack-eyebrow">{s.eyebrow}</p>
      <h2 id="wk-stack-title" className="wk__stack-title">{s.title}</h2>
      <style>{s.filter.css}</style>
      <StackFilter label={s.filter.label} all={s.filter.all} options={s.filter.options.map(({ id, name, status }) => ({ id, name, status }))}>
        {s.groups.map((g) => (
          <div key={g.id} className="wk__stack-group" data-group={g.id}>
            <h3 id={`wk-stack-${g.id}`} className="wk__stack-name">{g.title}</h3>
            <div className="wk__stack-body">
              <ul className="wk__stack-tools" aria-labelledby={`wk-stack-${g.id}`}>
                {g.tools.map((t) => (
                  <li key={t.label} data-tool data-p={t.projects.join(" ") || undefined} title={t.names ?? undefined}>
                    {t.label}{t.names && <span className="sr-only"> ({t.names})</span>}
                  </li>
                ))}
              </ul>
              <p className="wk__stack-evidence">{g.evidence}</p>
            </div>
          </div>
        ))}
      </StackFilter>
    </section>
  );
}
