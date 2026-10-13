import { skillGroups } from "@/data/skills";
import { projects } from "@/data/projects";
import { StackLens } from "./StackLens";
import { lensProjects, projectsFor } from "@/data/stackLens";
import "./stack.css";

const nameOf = (id: string) => projects.find((p) => p.id === id)?.name ?? id;
const ORDER = lensProjects.map((l) => l.id);

/** The filter, written from the data: choosing a project hides every tool its own text doesn't name, and every group
 *  left with none. CSS only (`:has(:checked)`), so it works before hydration and with JavaScript off. */
const FILTER = lensProjects.map(({ id }) =>
  `.stack:has([data-lens-option="${id}"]:checked) [data-tool]:not([data-p~="${id}"]){display:none}` +
  `.stack:has([data-lens-option="${id}"]:checked) .sgroup:not(:has([data-p~="${id}"])){display:none}`).join("");

/**
 * The Stack (M10): tools grouped by the work they did. Each group is one row — its name, its tools as plain text,
 * and the projects that use them — and the lens above is a real filter of those server-rendered rows: pick T Poker
 * and only T Poker's tools remain. No tiles, no figures, no monospace table.
 */
export function Stack() {
  return (
    <section id="skills" aria-labelledby="stack-title" className="stack">
      <div className="shell">
        <h2 id="stack-title" className="stack__title">Tools, grouped by the work they did.</h2>
        <StackLens options={lensProjects} />
        <style>{FILTER}</style>
        <div className="sgroups">
          {skillGroups.map((g) => {
            const used = ORDER.filter((id) => g.items.some((i) => projectsFor(i.label).includes(id)));
            return (
              <article key={g.id} className="sgroup" data-group={g.id}>
                <h3 className="sgroup__title">{g.title}</h3>
                <div className="sgroup__body">
                  <ul className="sgroup__tools" aria-label={`${g.title} tools`}>
                    {g.items.map((i) => <li key={i.label} data-tool data-emphasis={i.emphasis ? "" : undefined} data-p={projectsFor(i.label).join(" ") || undefined}>{i.label}</li>)}
                  </ul>
                  <p className="sgroup__evidence">{g.evidence}</p>
                </div>
                <p className="sgroup__used"><span className="sr-only">Used in </span>{used.map(nameOf).join(" · ")}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
