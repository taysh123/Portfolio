import { about } from "@/data/about";

/** About (spec §5.3): the title, two condensed paragraphs and the approved facts row. Site theme. */
export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="shell py-[clamp(7rem,14vh,12rem)]">
      <p className="label text-fg-subtle">About</p>
      <h2 id="about-title" className="mt-4 text-[clamp(2.25rem,5vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-fg">
        {about.title[0]}<br /><span className="text-fg-muted">{about.title[1]}</span>
      </h2>
      <div className="mt-10 grid gap-6 text-[17px] leading-[1.6] text-fg-muted lg:grid-cols-2 lg:gap-12">
        {about.paragraphs.map((p) => <p key={p.slice(0, 24)} className="max-w-[62ch]">{p}</p>)}
      </div>
      <dl className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-[16px] border border-line bg-[var(--line)] lg:grid-cols-4">
        {about.facts.map((f) => (
          <div key={f.value} className="raised flex flex-col-reverse gap-2 p-6">
            <dt className="label text-fg-subtle">{f.label}</dt>
            <dd className="text-[clamp(1.75rem,3vw,2.5rem)] font-semibold tracking-[-0.03em] text-fg">{f.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
