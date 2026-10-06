import { skillGroups } from "@/data/skills";
import { GroupGlyph } from "@/components/ui/GroupGlyph";
import { PointerLight } from "@/components/ui/PointerLight";
import "./stack.css";

/** Spec §5.4: the six groups exactly as data/skills.ts has them; the two lead groups are wide. */
export function Stack() {
  return (
    <section id="skills" aria-labelledby="stack-title" className="shell py-[clamp(7rem,14vh,12rem)]">
      <p className="label text-fg-subtle">Stack</p>
      <h2 id="stack-title" className="mt-4 text-[clamp(2.25rem,5vw,4.5rem)] font-semibold tracking-[-0.035em] text-fg">The tools I build with.</h2>
      <p className="mt-4 text-fg-muted" style={{ fontSize: "var(--text-lead)" }}>Enough range to own a product end to end.</p>
      <div data-pointer-light className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {skillGroups.map((g) => (
          <article key={g.id} data-card data-wide={g.lead ? "" : undefined} className={`stack-card raised relative overflow-hidden rounded-[24px] border border-line p-7 ${g.lead ? "lg:col-span-2" : ""}`}>
            <GroupGlyph glyph={g.glyph} />
            <h3 className="mt-5 text-lg font-semibold text-fg">{g.title}</h3>
            {g.lead && <p className="mt-3 flex items-baseline gap-3"><span className="text-[clamp(2.5rem,5vw,4rem)] font-semibold tracking-[-0.04em] text-fg">{g.lead.value}</span><span className="label text-fg-subtle">{g.lead.unit}</span></p>}
            <ul className="mt-5 flex flex-wrap gap-2">{g.items.map((i) => <li key={i.label} className={`label rounded-full border px-2.5 py-1 ${i.emphasis ? "border-line-strong text-fg" : "border-line text-fg-muted"}`}>{i.label}</li>)}</ul>
            <p className="mt-5 text-[15px] leading-relaxed text-fg-muted">{g.evidence}</p>
          </article>
        ))}
      </div>
      <PointerLight />
    </section>
  );
}
