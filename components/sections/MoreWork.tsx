import { moreWork } from "@/data/work";
import { projects, publicRepoUrl, repoLabel } from "@/data/projects";
import { PrivateRepoLabel } from "@/components/ui/PrivateRepoLabel";
import { ArrowUpRightIcon } from "@/components/ui/icons";
import { dict } from "@/lib/dict";
import { held } from "@/lib/held";

/**
 * Two more (R5): the two smaller systems under the four panels, in the layer, compact. The live block's words exactly
 * (its title, each project's name, context and summary: lib/dict.ts and data/projects.ts), each with its case study,
 * so the page keeps six case-study triggers. Its repository is a link where it is public, else the site's plain label.
 *
 * The title alone, as the live block has it (no eyebrow is invented), then two ruled rows on About's grid: from 1024px
 * the name and its context take the words share, the summary and the links the capture's; stacked below. A server
 * component that holds still: no client code, no reveal, no image.
 */
export function MoreWork() {
  return (
    <section id="more-work" aria-labelledby="more-work-title" className="wk__mw">
      <h2 id="more-work-title" className="wk__mw-title">{dict.more.title}</h2>
      <div className="wk__mw-rows">
        {moreWork.map((r) => {
          const p = projects.find((x) => x.id === r.id)!, repo = publicRepoUrl(p);
          return (
            <article key={p.id} aria-labelledby={`wk-mw-${p.id}`} className="wk__mw-row more-work__row" data-more={p.id}>
              <div>
                <h3 id={`wk-mw-${p.id}`} className="wk__mw-name">{p.name}</h3>
                <p className="wk__mw-context">{p.context}</p>
              </div>
              <div>
                <p className="wk__mw-summary">{held(p.summary)}</p>
                <div className="wk__links wk__mw-links">
                  {repo ? (
                    <a href={repo} target="_blank" rel="noopener noreferrer" className="wk__go">
                      {dict.common.source}<ArrowUpRightIcon size={15} /><span className="sr-only">{dict.common.newTab}</span>
                    </a>
                  ) : <PrivateRepoLabel className="wk__private" label={repoLabel(p)} />}
                  <button type="button" className="wk__more case-study-trigger" data-case-study={p.id} aria-haspopup="dialog">
                    {dict.common.caseStudy}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
