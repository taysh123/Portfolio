import { MagneticLink } from "@/components/MagneticLink";
import { site } from "@/data/site";

export function Hero() {
  return (
    <section className="main-hero section-shell" aria-labelledby="hero-title">
      <div className="hero-orbit" aria-hidden="true"><i /><i /><i /></div>
      <div className="section-eyebrow">{site.eyebrow}</div>
      <h1 id="hero-title">
        <span>I build software</span>
        <span className="hero-muted">people can actually use.</span>
      </h1>
      <p className="hero-description">{site.description}</p>
      <div className="hero-actions">
        <MagneticLink href="#work" className="button button-primary">Explore my work <span>↓</span></MagneticLink>
        <MagneticLink href={site.github} target="_blank" rel="noreferrer" className="button button-secondary">GitHub ↗</MagneticLink>
      </div>
      <div className="hero-bottomline">
        <span>Designing · Engineering · Shipping</span>
        <span>Scroll</span>
      </div>
    </section>
  );
}
