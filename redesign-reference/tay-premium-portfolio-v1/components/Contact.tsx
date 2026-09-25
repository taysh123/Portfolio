import { MagneticLink } from "@/components/MagneticLink";
import { site } from "@/data/site";

export function Contact() {
  return (
    <section id="contact" className="contact-section" aria-labelledby="contact-title">
      <div className="planet-horizon" aria-hidden="true"><div className="planet-grid" /></div>
      <div className="section-shell contact-content">
        <div className="section-eyebrow">Contact</div>
        <h2 id="contact-title">Let&apos;s build<br/>something great.</h2>
        <p>If you&apos;re building something ambitious — or looking for a developer who cares about both systems and product quality — I&apos;d like to hear about it.</p>
        <div className="contact-actions"><MagneticLink href={`mailto:${site.email}`} className="button button-primary large">Get in touch ↗</MagneticLink></div>
        <div className="social-row"><a href={site.github} target="_blank" rel="noreferrer">GitHub ↗</a><a href={site.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a><a href={`mailto:${site.email}`}>Email ↗</a></div>
      </div>
    </section>
  );
}
