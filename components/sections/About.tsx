import { about } from "@/data/about";
import "./about.css";

/**
 * About (M10): the title, two paragraphs at a reading measure, one line of facts — and the page's one photograph:
 * the studio the four products came out of, as a still with a caption. A static image; no 3D runtime, no parallax.
 */
export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="about">
      <div className="shell about__grid">
        <h2 id="about-title" className="about__title">{about.title[0]}<br /><span>{about.title[1]}</span></h2>
        <div className="about__body">
          {about.paragraphs.map((p) => <p key={p.slice(0, 24)} className="about__p">{p}</p>)}
          <ul className="about__facts">{about.facts.map((f) => <li key={f}>{f}</li>)}</ul>
        </div>
        <figure className="about__photo">
          <picture>
            <source type="image/avif" srcSet="/work/about-studio-800.avif 800w, /work/about-studio-1200.avif 1200w, /work/about-studio-1600.avif 1600w" sizes="(min-width: 1024px) 40vw, 100vw" />
            <img src="/work/about-studio-1200.webp" srcSet="/work/about-studio-800.webp 800w, /work/about-studio-1200.webp 1200w, /work/about-studio-1600.webp 1600w"
              sizes="(min-width: 1024px) 40vw, 100vw" width={1600} height={1200} loading="lazy" decoding="async" alt={about.photo.alt} />
          </picture>
          <figcaption><b>{about.photo.caption}.</b> {about.photo.note}</figcaption>
        </figure>
      </div>
    </section>
  );
}
