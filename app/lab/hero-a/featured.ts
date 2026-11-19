import type { WorldKey } from "@/data/work";

/**
 * Concept A's "Featured work" strip (prototype): one line per flagship saying what it is, in the project's own words.
 * tests/unit/lab-hero-a.test.ts checks every word against that project's tagline and summary in data/projects.ts.
 * Each line sits beside the state the live hero's index already shows (data/proof.ts via lib/content.ts), so the strip
 * adds no new claim about any project.
 */
export const FEATURED_KIND: Record<WorldKey, string> = {
  poker: "Poker study platform and home-game manager",
  aegis: "Security operations centre",
  developeros: "Local-first code workspace",
  "gravity-flow": "One-touch gravity puzzler",
};
