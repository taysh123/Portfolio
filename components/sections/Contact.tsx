import { socials, resume } from "@/data/socials";
import type { Content } from "@/lib/content";
import { ButtonLink } from "@/components/ui/Button";
import { TextLink } from "@/components/ui/TextLink";
import "./contact.css";

/**
 * Contact (M10): the conclusion. One sentence of availability, one primary action (email), the two profiles, and the
 * résumé as a quiet download beneath them.
 */
export function Contact({ c }: { c: Content }) {
  const { t, availability } = c;
  return (
    <section id="contact" aria-labelledby="contact-title" className="contact">
      <div className="shell">
        <h2 id="contact-title" className="contact__title">{t.contact.title[0]}<br /><span>{t.contact.title[1]}</span></h2>
        <p className="contact__lead">{availability.detail}</p>
        <div className="contact__actions">
          <ButtonLink href={`mailto:${socials.email}?subject=${encodeURIComponent(t.contact.subject)}`} variant="accent" size="lg">{t.contact.email}</ButtonLink>
          {/* The two profiles wrap as a pair, so a narrow screen never strands one of them on its own line. */}
          <span className="contact__profiles">
            <TextLink href={socials.linkedin.url} external newTab={t.common.newTab}>{t.contact.linkedin}</TextLink>
            <TextLink href={socials.github.url} external newTab={t.common.newTab}>{t.contact.github}</TextLink>
          </span>
        </div>
        <p className="contact__resume">
          <a href={resume.href} download={resume.fileName} type="application/pdf" data-resume>
            {t.contact.resume}
          </a>
          <span>{t.contact.resumeNote.replace(" KB", "\u00a0KB")}</span>
        </p>
      </div>
    </section>
  );
}
