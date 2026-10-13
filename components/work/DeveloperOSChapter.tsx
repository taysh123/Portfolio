import { dosRefusal } from "@/data/work";
import type { Content } from "@/lib/content";
import { fmt } from "@/lib/fmt";
import { srcSet, fallback, IMAGES } from "@/data/images";
import { Button } from "@/components/ui/Button";
import { TextLink } from "@/components/ui/TextLink";
import { publicRepoUrl } from "@/data/projects";
import "./dos.css";

/** The first three file:line chips on the search capture (1600×1027), measured: left, top, width and height in px.
 *  The phone crop is the capture's top-left 820×612 (it ends after the third result, where no line is cut), so the
 *  same boxes apply with that crop's size. */
const CHIPS = [
  { x: 21, y: 183, w: 394, h: 25, label: "devos/providers/ollama.py:1-50" },
  { x: 21, y: 339, w: 330, h: 25, label: "tests/test_ollama.py:1-50" },
  { x: 21, y: 495, w: 405, h: 25, label: "devos/providers/__init__.py:1-5" },
];
const DESKTOP = { w: 1600, h: 1027 }, PHONE = { w: 820, h: 612 };
const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(2)}%`;

/** `devos index <path>` set as code inside the app's own sentence. */
/** Backticked spans become <code>. In a placeholder such as `<path>` only the angle brackets are hidden from screen
 *  readers, so it is read "devos index path" rather than "less than path greater than"; the text itself, and what a
 *  reader copies, stay exactly as the app prints them. */
function withCode(text: string) {
  const parts = text.split(/`([^`]+)`/);
  return parts.map((t, i) => {
    if (!(i % 2)) return t;
    const bits = t.split(/<(\w+)>/);
    return <code key={i} dir="ltr">{bits.map((b, j) => (j % 2 ? <span key={j}><span aria-hidden="true">&lt;</span>{b}<span aria-hidden="true">&gt;</span></span> : b))}</code>;
  });
}

/**
 * DeveloperOS (M10): violet plate, evidence as a sequence. The real search results with their file-and-line chips
 * marked; index → retrieve → evidence → cite, or decline; then the refusal, as the app's own words in HTML text (not a
 * picture of text), because declining is the other half of answering from evidence. One DOM order — title, product,
 * actions, sequence, refusal — which phones read top to bottom, so the real product follows the heading at once.
 * Wider screens lift the actions above the window (dos.css), so after a jump they are in the first screen too; the
 * window holds nothing focusable, so the keyboard order is the same either way.
 */
export function DeveloperOSChapter({ c }: { c: Content }) {
  const { t, dosFlow, dosRefusalCaption } = c;
  const f = c.flagships.find((x) => x.id === "developeros")!, p = c.project("developeros");
  const repo = publicRepoUrl(p);
  return (
    <section id="work-developeros" aria-labelledby="work-developeros-title" data-plate="dos" data-theme="dark" className="plate chapter dos">
      <div className="shell dos__grid">
        <div className="dos__head">
          <h2 id="work-developeros-title" className="chapter__title" lang="en">{f.title}</h2>
          <p className="chapter__lede">{f.lede}</p>
        </div>

        <figure className="dwin">
          <div className="dwin__bar" aria-hidden="true">{t.dos.bar}</div>
          <div className="dwin__shot">
            <picture>
              <source media="(max-width: 639px)" type="image/avif" srcSet={srcSet("dos-search-phone", "avif")} sizes="100vw" />
              <source media="(max-width: 639px)" type="image/webp" srcSet={srcSet("dos-search-phone", "webp")} sizes="100vw" />
              <source type="image/avif" srcSet={srcSet("dos-search", "avif")} sizes="(min-width: 1024px) 760px, 94vw" />
              <img src={fallback("dos-search")} srcSet={srcSet("dos-search", "webp")} sizes="(min-width: 1024px) 760px, 94vw"
                width={IMAGES["dos-search"].w} height={IMAGES["dos-search"].h} loading="lazy" decoding="async"
                alt={fmt(t.dos.alt, { chips: CHIPS.map((x) => x.label).join(", ") })} />
            </picture>
            {CHIPS.map((c) => (
              <span key={c.label} className="cbox" aria-hidden="true" style={{
                ["--l" as string]: pct(c.x - 4, DESKTOP.w), ["--t" as string]: pct(c.y - 4, DESKTOP.h), ["--w" as string]: pct(c.w + 8, DESKTOP.w), ["--h" as string]: pct(c.h + 8, DESKTOP.h),
                ["--l-m" as string]: pct(c.x - 4, PHONE.w), ["--t-m" as string]: pct(c.y - 4, PHONE.h), ["--w-m" as string]: pct(c.w + 8, PHONE.w), ["--h-m" as string]: pct(c.h + 8, PHONE.h),
              }} />
            ))}
          </div>
        </figure>

        <div className="chapter__actions dos__actions">
          <Button data-case-study={p.id} aria-haspopup="dialog" className="case-study-trigger">{t.common.caseStudy}</Button>
          {repo && <TextLink href={repo} external newTab={t.common.newTab}>{t.common.source}</TextLink>}
          {repo && <TextLink href={`${repo}/releases`} external newTab={t.common.newTab}>{t.common.releasedVersion}</TextLink>}
        </div>

        <ol className="flow" aria-label={t.dos.flow}>
          {dosFlow.map((s) => <li key={s.k} data-k={s.k}><b>{s.name}</b><span>{s.body}</span></li>)}
        </ol>

        <figure className="refusal">
          <figcaption className="refusal__cap">
            <span>{withCode(dosRefusalCaption.body)}</span>
          </figcaption>
          <div className="refusal__ui">
            {/* The app's own words, verbatim and in English on both pages. */}
            <p className="refusal__msg" lang="en" dir="ltr">{withCode(dosRefusal.message)}</p>
          </div>
        </figure>
      </div>
    </section>
  );
}
