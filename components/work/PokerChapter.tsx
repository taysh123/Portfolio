import { flagships, projectOf } from "@/data/work";
import { StoreBadge } from "@/components/ui/StoreBadge";
import { Button } from "@/components/ui/Button";
import { TextLink } from "@/components/ui/TextLink";
import { PrivateRepoLabel } from "@/components/ui/PrivateRepoLabel";
import { Pic } from "@/components/ui/Pic";
import { repoLabel } from "@/data/projects";
import type { ImageName } from "@/data/images";
import "./poker.css";

/** The three real screens, in DOM order; each step brings one to the front (data-p{k}: where phone i stands while
 *  step k is chosen). */
const PHONES: { img: ImageName; alt: string }[] = [
  { img: "poker-home", alt: "T Poker home screen: start a cash game or a tournament, no account needed" },
  { img: "poker-live", alt: "T Poker live tournament dashboard: prize pool, blind level and the clock" },
  { img: "poker-settle", alt: "T Poker end-of-night settlement: who pays whom, as exact transfers" },
];
const STEPS = [
  { label: "Start a game", caption: "Cash game or tournament, straight from the home screen, no account needed." },
  { label: "Run the tournament", caption: "A live tournament dashboard: the blind clock and prize pool for the whole table." },
  { label: "Settle up", caption: "Guided end-of-night settlement: who pays whom, in exact integer-cent transfers." },
];
type Pos = "front" | "left" | "right";
const posAt = (k: number, i: number): Pos => (i === k ? "front" : i === (k + 2) % 3 ? "left" : "right");

/**
 * T Poker (M10): the shipped product, on navy with its own gold lockup. Three real screens stand on a CSS-3D stage
 * (perspective and a turn, no WebGL); a three-part segmented control walks the product — start a game, run the
 * tournament, settle up. The control is a radio group and the arrangement is pure CSS (`:has(:checked)` in
 * poker.css), so it works before hydration and with JavaScript off, and the arrow keys move between steps natively.
 */
export function PokerChapter() {
  const f = flagships.find((x) => x.id === "poker")!, p = projectOf("poker");
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
            {PHONES.map((ph, i) => (
              <figure key={ph.img} className="pphone" {...Object.fromEntries(STEPS.map((_, k) => [`data-p${k}`, posAt(k, i)]))}>
                <Pic name={ph.img} alt={ph.alt} sizes="(min-width: 1024px) 240px, 200px" />
              </figure>
            ))}
          </div>
          <fieldset className="psteps">
            <legend className="sr-only">Walk through {p.name}</legend>
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
            <ul aria-label={`Get ${p.name}`} className="poker__stores">
              {stores.map((s) => <li key={s.platform}><StoreBadge listing={s} app={p.name} /></li>)}
            </ul>
          </div>
          {/* The web app sits with the other links, as Source on GitHub does in the next chapters: one row for the
              stores, one for the actions, so the Case study still lands in the first screen at 1280×720. */}
          <div className="chapter__actions">
            <Button variant="secondary" data-case-study={p.id} aria-haspopup="dialog" className="case-study-trigger">Case study</Button>
            {p.liveUrl && <TextLink href={p.liveUrl} external>Open the web app</TextLink>}
            <PrivateRepoLabel label={repoLabel(p)} />
          </div>
        </div>
      </div>
    </section>
  );
}
