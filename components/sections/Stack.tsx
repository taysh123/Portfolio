import { skillGroups } from "@/data/skills";
import { GroupGlyph } from "@/components/ui/GroupGlyph";
import { PointerLight } from "@/components/ui/PointerLight";
import "./stack.css";

/** Spec §5.4, M2b: the six groups exactly as data/skills.ts has them, as a range matrix — one row per group:
 *  what it is, the tools in it, and the evidence that it's load-bearing. The two lead groups carry their figure.
 *  Rows, not cards: the breadth reads top to bottom in a few seconds, and nothing is a wall of tags. */
export function Stack() {
  return (
    <section id="skills" aria-labelledby="stack-title" className="shell py-[clamp(7rem,14vh,12rem)]">
      <div className="stack-head">
        <div>
          <p className="label text-fg-subtle">Stack</p>
          <h2 id="stack-title" className="stack-head__title">The tools I build with.</h2>
        </div>
        <p className="stack-head__lead">Enough range to own a product end to end.</p>
      </div>
      <div data-pointer-light className="stack-matrix">
        {skillGroups.map((g) => (
          <article key={g.id} data-card data-wide={g.lead ? "" : undefined} className="stack-card stack-row">
            <div className="stack-row__name">
              <GroupGlyph glyph={g.glyph} />
              <div>
                <h3>{g.title}</h3>
                <p className="stack-row__caption">{g.caption}</p>
              </div>
            </div>
            <ul className="stack-row__items" aria-label={`${g.title} tools`}>
              {g.items.map((i) => <li key={i.label} data-emphasis={i.emphasis ? "" : undefined}>{i.label}</li>)}
            </ul>
            <div className="stack-row__proof">
              {g.lead && <p className="stack-row__lead"><span>{g.lead.value}</span><span className="label">{g.lead.unit}</span></p>}
              <p className="stack-row__evidence">{g.evidence}</p>
            </div>
          </article>
        ))}
      </div>
      <PointerLight />
    </section>
  );
}
