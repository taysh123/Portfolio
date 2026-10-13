import type { Content } from "@/lib/content";
import { AboutVisual } from "./AboutVisual";
import "./about.css";

/**
 * About (M10): the title, two paragraphs at a reading measure, one line of facts — and beside them the four products
 * together (AboutVisual), with no caption.
 */
export function About({ c }: { c: Content }) {
  const { about } = c;
  return (
    <section id="about" aria-labelledby="about-title" className="about">
      <div className="shell about__grid">
        <h2 id="about-title" className="about__title">{about.title[0]}<br /><span>{about.title[1]}</span></h2>
        <div className="about__body">
          {about.paragraphs.map((p) => <p key={p.slice(0, 24)} className="about__p">{p}</p>)}
          <ul className="about__facts">{about.facts.map((f) => <li key={f}>{f}</li>)}</ul>
        </div>
        <AboutVisual label={about.visual.label} />
      </div>
    </section>
  );
}
