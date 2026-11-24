import { ArrowUpRightIcon } from "@/components/ui/icons";
import { dict } from "@/lib/dict";
import { contactBlock as c } from "./contactBlock";

/** The lead's pieces that stay on one line: a hyphenated word, and a word with the dash that follows it, so no line
 *  starts with the dash. Only spans are added; the text is the site's own (Tay, 2026-11-24, copy pass B). */
const whole = (text: string) => text.split(/(\S+—|\S+-\S+)/).map((t, i) => (i % 2 ? <span key={i}>{t}</span> : t));

/**
 * Contact (P3.6), under Think · Build · Ship: the page's conclusion, as the live section has it. The live title on one
 * side; the live lead, one filled action (email) beside the two profiles, and the résumé as a quiet download beneath
 * them on the other, on About's grid (stacked on phones, in reading order). The two profiles wrap as a pair, as on the
 * live page, so a narrow screen never strands one of them on its own line.
 *
 * Server-rendered, with no client code, no form and no backend: four plain links at the live site's own targets. It
 * holds still. The page's one opening reveal stays the only one (docs/CINEMATIC_SYSTEM.md, "Motion language"); the
 * links answer a hover or a press, briefly, in colour.
 */
export function Contact() {
  return (
    <section id="contact" aria-labelledby="wk-contact-title" className="wk__contact" data-contact>
      <div className="wk__contact-head">
        <p className="wk__contact-eyebrow">{c.eyebrow}</p>
        <h2 id="wk-contact-title" className="wk__contact-title">
          <span>{c.title[0]}</span> <span>{c.title[1]}</span>
        </h2>
      </div>
      <div className="wk__contact-body">
        {c.lead && <p className="wk__contact-lead">{whole(c.lead)}</p>}
        <div className="wk__links wk__contact-links">
          <a href={c.email.href} className="wk__go wk__go--fill" data-email>{c.email.label}</a>
          <span className="wk__contact-profiles">
            {c.profiles.map((p) => (
              <a key={p.href} href={p.href} target="_blank" rel="noopener noreferrer" className="wk__go" data-profile>
                {p.label}<ArrowUpRightIcon size={15} /><span className="sr-only">{dict.common.newTab}</span>
              </a>
            ))}
          </span>
        </div>
        <p className="wk__contact-resume">
          <a href={c.resume.href} download={c.resume.fileName} type="application/pdf" data-resume>{c.resume.label}</a>
          <span>{c.resume.note}</span>
        </p>
      </div>
    </section>
  );
}
