import { about } from "@/data/about";
import { dict } from "@/lib/dict";

/**
 * About's words (Concept A, P3.3; D1 reopened by Tay, 2026-11-18; D2 not reopened, so no WebGL). Nothing is typed
 * fresh. Every word comes from data/about.ts or the interface strings (lib/dict.ts); Tay set its title, body and facts in
 * his copy pass (2026-11-21). No photo and no institution: the facts name the degree alone. Since R10 it ends on the
 * facts: its availability line and its three links are gone (the hero, Contact and the footer carry them).
 */
export const aboutBlock = {
  eyebrow: dict.nav.about,
  /** Both halves of the title, each on its own line. */
  title: about.title,
  /** Two sentences, word for word: who, then what with. */
  lede: about.body,
  facts: about.facts,
} as const;
