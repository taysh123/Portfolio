import { about } from "@/data/about";
import { dict } from "@/lib/dict";

/**
 * About's words (Concept A, P3.3; D1 reopened by Tay, 2026-11-18; D2 not reopened, so no WebGL). Nothing is typed
 * fresh. Every word comes from the live About section (data/about.ts) or the interface strings (lib/dict.ts). Tay
 * approved the copy (session 12). No photo and no institution: the live facts name the degree alone. Since R10 it ends
 * on the facts: its availability line and its three links are gone (the hero, Contact and the footer carry them).
 */

/** A paragraph's sentences, split after each full stop that ends one ("C#/.NET," and "B.Sc." stay whole). */
const sentences = (p: string) => p.split(/(?<=\.)\s+/);

export const aboutBlock = {
  eyebrow: dict.nav.about,
  /** Both halves of the live title, each on its own line. */
  title: about.title,
  /** Two sentences of the live copy, word for word: who, then what with. */
  lede: `${sentences(about.paragraphs[0])[0]} ${sentences(about.paragraphs[1])[1]}`,
  facts: about.facts,
} as const;
