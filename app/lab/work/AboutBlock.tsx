import { ArrowDownIcon, ArrowUpRightIcon } from "@/components/ui/icons";
import { dict } from "@/lib/dict";
import { aboutBlock as a } from "./about";

/**
 * About (P3.3), under the four panels: who, in about ten seconds. The title on one side; the two sentences, four facts,
 * the availability and three links on the other (stacked on phones, in reading order). Server-rendered, with no client
 * code, no photo and no capture: the products above are the picture.
 *
 * It holds still. The page's one opening reveal stays the only one (docs/CINEMATIC_SYSTEM.md, "Motion language"); the
 * links answer a hover or a press, briefly. The résumé is the one filled control here, since it is a recruiter's next
 * step; the profiles take the panels' outlined control.
 */
export function AboutBlock() {
  return (
    <section aria-labelledby="wk-about-title" className="wk__about" data-about>
      <div className="wk__about-head">
        <p className="wk__about-eyebrow">{a.eyebrow}</p>
        <h2 id="wk-about-title" className="wk__about-title">
          <span>{a.title[0]}</span> <span>{a.title[1]}</span>
        </h2>
      </div>
      <div className="wk__about-body">
        <p className="wk__about-lede">{a.lede}</p>
        <ul className="wk__about-facts">
          {a.facts.map((f) => <li key={f}>{f}</li>)}
        </ul>
        {a.availability && (
          <p className="wk__about-open"><span className="wk__about-dot" aria-hidden="true" />{a.availability}</p>
        )}
        <div className="wk__links wk__about-links">
          <a href={a.resume.href} download={a.resume.fileName} type="application/pdf" className="wk__go wk__go--fill" data-resume>
            {a.resume.label}<ArrowDownIcon size={15} /><span className="sr-only">{a.resume.note}</span>
          </a>
          {a.profiles.map((p) => (
            <a key={p.href} href={p.href} target="_blank" rel="noopener noreferrer" className="wk__go" data-profile>
              {p.label}<ArrowUpRightIcon size={15} /><span className="sr-only">{dict.common.newTab}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
