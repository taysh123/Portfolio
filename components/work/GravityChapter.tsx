import type { Content } from "@/lib/content";
import { Button } from "@/components/ui/Button";
import { TextLink } from "@/components/ui/TextLink";
import { Pic } from "@/components/ui/Pic";
import { publicRepoUrl } from "@/data/projects";
import "./gravity.css";

/** Three things on the real level-55 capture (640×1280), at their centres: the held gravity well (the game's attractor
 *  violet, #7c5cff), the star it pulls, and home (the goal's green). Read off the capture; the colours are the game's
 *  own (src/config/physics.config.ts). */
const MARKS = [
  { k: "well", x: 370, y: 605, side: "right" },
  { k: "star", x: 213, y: 1045, side: "right" },
  { k: "home", x: 500, y: 245, side: "left" },
] as const;

/**
 * GRAVITY FLOW (M10): deep-teal plate, and the game leads. The real gameplay frame, large, with the mechanic marked
 * on it — hold to place a well, pull the star home — and a boss level behind it. On phones it reads title → game →
 * story, in DOM order; wide screens put the game on the left of the title and story. The facts that follow are scope and
 * state, not test counts, and nothing here claims anything about the physics' precision.
 */
export function GravityChapter({ c }: { c: Content }) {
  const { t, gfFacts } = c;
  const f = c.flagships.find((x) => x.id === "gravity-flow")!, p = c.project("gravity-flow");
  const repo = publicRepoUrl(p);
  return (
    <section id="work-gravity-flow" aria-labelledby="work-gravity-flow-title" data-plate="gf" data-theme="dark" className="plate chapter gf">
      <div className="shell gf__grid">
        <div className="gf__head">
          <h2 id="work-gravity-flow-title" className="chapter__title">{f.title}</h2>
          <p className="chapter__lede">{f.lede}</p>
        </div>

        <figure className="gf__stage">
          <div className="gf__phone gf__phone--side" aria-hidden="true">
            <Pic name="gf-boss" alt="" sizes="(min-width: 1024px) 220px, 34vw" />
          </div>
          <div className="gf__phone gf__phone--main">
            <div className="gf__screen">
              <Pic name="gf-gameplay" sizes="(min-width: 1024px) 290px, 60vw"
                alt={t.gf.alt} />
              {MARKS.map((m) => (
                <span key={m.k} className="gf__mark" data-side={m.side} aria-hidden="true"
                  style={{ ["--x" as string]: `${((m.x / 640) * 100).toFixed(1)}%`, ["--y" as string]: `${((m.y / 1280) * 100).toFixed(1)}%` }}>
                  <i /><span>{t.gf.marks[m.k]}</span>
                </span>
              ))}
            </div>
          </div>
          <figcaption className="sr-only">{t.gf.marked}</figcaption>
        </figure>

        <div className="gf__story">
          <ul className="gf__facts">{gfFacts.map((x) => <li key={x}>{x}</li>)}</ul>
          <div className="chapter__actions">
            <Button data-case-study={p.id} aria-haspopup="dialog" className="case-study-trigger">{t.common.caseStudy}</Button>
            {repo && <TextLink href={repo} external newTab={t.common.newTab}>{t.common.source}</TextLink>}
          </div>
        </div>
      </div>
    </section>
  );
}
