import type { Content } from "@/lib/content";
import { fmt } from "@/lib/fmt";
import { StoreBadge } from "@/components/ui/StoreBadge";
import { Button } from "@/components/ui/Button";
import { TextLink } from "@/components/ui/TextLink";
import { PrivateRepoLabel } from "@/components/ui/PrivateRepoLabel";
import { Pic } from "@/components/ui/Pic";
import { repoLabelOf } from "@/components/ui/repoLabel";
import type { ImageName } from "@/data/images";
import "./poker.css";

/** The three real screens, in DOM order; each step brings one to the front (data-p{k}: where phone i stands while
 *  step k is chosen). Their alt texts are in the dictionary (poker.alts), in the same order. */
const PHONES: ImageName[] = ["poker-home", "poker-live", "poker-settle"];
type Pos = "front" | "left" | "right";
const posAt = (k: number, i: number): Pos => (i === k ? "front" : i === (k + 2) % 3 ? "left" : "right");

/**
 * T Poker (M10): the shipped product, on navy with its own gold lockup. Three real screens stand on a CSS-3D stage
 * (perspective and a turn, no WebGL); a three-part segmented control walks the product — start a game, run the
 * tournament, settle up. The control is a radio group and the arrangement is pure CSS (`:has(:checked)` in
 * poker.css), so it works before hydration and with JavaScript off, and the arrow keys move between steps natively.
 */
export function PokerChapter({ c }: { c: Content }) {
  const { t } = c;
  const f = c.flagships.find((x) => x.id === "poker")!, p = c.project("poker");
  // The steps and their captions come from data/work.ts (pokerSteps) — the verified copy — in the page's language.
  const STEPS = c.pokerSteps;
  const stores = (p.stores ?? []).filter((s) => s.status === "live" && s.url);
  return (
    <section id="work-poker" aria-labelledby="work-poker-title" data-plate="poker" data-theme="dark" className="plate chapter poker">
      <div className="shell poker__grid">
        <div className="poker__head">
          <div className="poker__lockup" aria-hidden="true">
            <Pic name="tpoker-icon" sizes="52px" alt="" className="poker__icon" />
            <Pic name="tpoker-wordmark" sizes="111px" alt="" className="poker__wordmark" />
          </div>
          <h2 id="work-poker-title" className="chapter__title"><span className="sr-only">{p.name}: </span>{f.title}</h2>
        </div>

        <div className="pstepper">
          <div className="pstage">
            {PHONES.map((img, i) => (
              <figure key={img} className="pphone" {...Object.fromEntries(STEPS.map((_, k) => [`data-p${k}`, posAt(k, i)]))}>
                <Pic name={img} alt={t.poker.alts[i]} sizes="(min-width: 1024px) 240px, 200px" />
              </figure>
            ))}
          </div>
          <fieldset className="psteps">
            <legend className="sr-only">{fmt(t.poker.walk, { name: p.name })}</legend>
            {STEPS.map((s, k) => (
              <label key={s.label} className="pstep">
                <input type="radio" name="poker-step" value={k} data-step={k} defaultChecked={k === 1} aria-describedby={`poker-step-${k}`} />
                <span><i aria-hidden="true">{k + 1}</i>{s.label}</span>
              </label>
            ))}
          </fieldset>
          <div className="pcaptions">
            {STEPS.map((s, k) => <p key={s.label} id={`poker-step-${k}`} className="pcaption" data-step={k}>{s.caption}</p>)}
          </div>
        </div>

        <div className="poker__copy">
          <p className="chapter__lede">{f.lede}</p>
          <p className="chapter__built">{f.built}</p>
          <div className="poker__ship" data-shipped>
            <ul aria-label={fmt(t.poker.get, { name: p.name })} className="poker__stores">
              {stores.map((s) => <li key={s.platform}><StoreBadge listing={s} app={p.name} t={t} /></li>)}
            </ul>
          </div>
          {/* The web app sits with the other links, as Source on GitHub does in the next chapters: one row for the
              stores, one for the actions, so the Case study still lands in the first screen at 1280×720. */}
          <div className="chapter__actions">
            <Button variant="secondary" data-case-study={p.id} aria-haspopup="dialog" className="case-study-trigger">{t.common.caseStudy}</Button>
            {p.liveUrl && <TextLink href={p.liveUrl} external newTab={t.common.newTab}>{t.poker.webApp}</TextLink>}
            <PrivateRepoLabel label={repoLabelOf(p, t)} />
          </div>
        </div>
      </div>
    </section>
  );
}
