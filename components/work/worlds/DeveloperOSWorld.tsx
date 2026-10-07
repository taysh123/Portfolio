import Image from "next/image";
import { flagships } from "@/data/work";

/** Crops of two real captures (public/projects/developeros/{ai-features,learning}.webp): the Search & Ask
 *  results, and the Learn tab declining a topic it has no indexed material for. The citation rows' centres are
 *  measured on the 1600×1027 crop (y of each `path:lines` chip ÷ height). */
const SEARCH = { src: "/projects/developeros/search-citations.webp", w: 1600, h: 1027,
  alt: "DeveloperOS Search & Ask: the query “ollama provider” answered with file:line citations — devos/providers/ollama.py:1-50, tests/test_ollama.py:1-50, devos/providers/__init__.py:1-5, README.md:101-150 and more" };
const REFUSAL = { src: "/projects/developeros/refusal.webp", w: 1400, h: 188,
  alt: "DeveloperOS declining: “I don't have enough indexed material to teach that. Try `devos index <path>`, give a file path, or rephrase the topic. (Not guessing.)”" };
const CITES = [195, 351, 507, 632, 729, 885].map((y) => y / 1027);
/** The same output, transcribed verbatim from the captures, for phones (where the captures' type is ~5px). */
const QUERY = "ollama provider";
const SPANS = ["devos/providers/ollama.py:1-50", "tests/test_ollama.py:1-50", "devos/providers/__init__.py:1-5", "README.md:101-150"];
const REFUSAL_TEXT = "I don't have enough indexed material to teach that. Try `devos index <path>`, give a file path, or rephrase the topic. (Not guessing.)";

/** World 03 — evidence. One legible capture, framed like a tool window; an evidence rail marks each cited
 *  span; the refusal sits beside it, because declining is the other half of answering from evidence. */
export function DeveloperOSWorld() {
  const notes = flagships.find((f) => f.id === "developeros")!.notes;
  return (
    <div className="world-dos">
      <figure className="world-dos__frame">
        <figcaption className="world-dos__bar label"><span>DeveloperOS</span><span className="world-dos__tab">Search &amp; Ask</span><span className="world-dos__cites-label">{notes[0]}</span></figcaption>
        <div className="world-dos__shot">
          <Image src={SEARCH.src} alt={SEARCH.alt} width={SEARCH.w} height={SEARCH.h} sizes="(min-width:1024px) 52vw, 100vw" />
          <ol className="world-dos__rail" aria-hidden="true">
            {CITES.map((y, i) => <li key={y} style={{ ["--y" as string]: y, ["--i" as string]: i }} />)}
          </ol>
          <ul className="world-dos__cites">
            <li>Search: “{QUERY}”</li>
            {SPANS.map((s) => <li key={s}><code>{s}</code><span>[DeveloperOS]</span></li>)}
          </ul>
        </div>
      </figure>
      <figure className="world-dos__refusal">
        <figcaption className="label">{notes[1]}</figcaption>
        <Image src={REFUSAL.src} alt={REFUSAL.alt} width={REFUSAL.w} height={REFUSAL.h} sizes="(min-width:1024px) 34vw, 92vw" />
        <blockquote className="world-dos__quote">{REFUSAL_TEXT}</blockquote>
      </figure>
    </div>
  );
}
