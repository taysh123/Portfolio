import { moreWork, projectOf } from "@/data/work";
import { Button } from "@/components/ui/Button";
import { TextLink } from "@/components/ui/TextLink";
import { PrivateRepoLabel } from "@/components/ui/PrivateRepoLabel";
import { publicRepoUrl, repoLabel } from "@/data/projects";

/** Two smaller systems, on paper: lighter than the plates by construction — ruled rows, no surface of their own. */
export function MoreWork() {
  return (
    <section id="more-work" aria-labelledby="more-work-title" className="more-work">
      <div className="shell">
        <h2 id="more-work-title" className="more-work__title">Two more</h2>
        <div className="more-work__list">
          {moreWork.map((r) => {
            const p = projectOf(r.id), repo = publicRepoUrl(p);
            return (
              <article key={r.id} className="more-work__row">
                <h3 className="more-work__name">{p.name}</h3>
                <p className="more-work__context">{p.context}</p>
                <p className="more-work__summary">{p.summary}</p>
                <div className="more-work__actions">
                  <Button variant="secondary" data-case-study={p.id} aria-haspopup="dialog" className="case-study-trigger">Case study</Button>
                  {repo ? <TextLink href={repo} external>Source on GitHub</TextLink> : <PrivateRepoLabel label={repoLabel(p)} />}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
