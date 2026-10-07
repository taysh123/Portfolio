import { about } from "@/data/about";
import "./about.css";

/** About (spec §5.3, M2b): a different chapter from the hero — the title, the idea the first paragraph is about
 *  pulled out at display scale, the two paragraphs, and the facts as stat tiles. Site theme. Nothing added. */
export function About() {
  const idea = about.paragraphs[0].match(/make the wrong thing hard to express/i)![0];
  return (
    <section id="about" aria-labelledby="about-title" className="about shell py-[clamp(7rem,14vh,12rem)]">
      <div className="about__grid">
        <div className="about__head">
          <p className="label text-fg-subtle">About</p>
          <h2 id="about-title" className="about__title">
            {about.title[0]}<br /><span className="text-fg-muted">{about.title[1]}</span>
          </h2>
        </div>
        <div className="about__body">
          <p className="about__idea" aria-hidden="true">{idea[0].toUpperCase() + idea.slice(1)}.</p>
          {about.paragraphs.map((p) => <p key={p.slice(0, 24)} className="about__p max-w-[62ch]">{p}</p>)}
        </div>
      </div>
      <dl className="about__facts">
        {about.facts.map((f) => (
          <div key={f.value} className="about__fact">
            <dt>{f.label}</dt>
            <dd>{f.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
