import { socials } from "@/data/socials";
import type { Content } from "@/lib/content";
import { ButtonLink } from "@/components/ui/Button";
import { TextLink } from "@/components/ui/TextLink";
import "./contact.css";

/**
 * Contact (M10): the conclusion. One sentence of availability, one primary action (email) and the two profiles.
 * (Review-only Preview snapshot: the résumé download is left out, because the repository is public.)
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
        {/* The résumé's line, kept so the section keeps its height; a note in place of the download. */}
        <p className="contact__resume" data-preview-note>
          <span className="contact__note">{t.contact.previewNote}</span>
        </p>
      </div>
    </section>
  );
}
