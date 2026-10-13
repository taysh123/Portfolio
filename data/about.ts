/** About (spec §5.3; the owner's copy, 2026-10-13): the principle once, here; the project details live in their
 *  chapters and in Think · Build · Ship, so they are not repeated. */
export const about = {
  title: ["Engineer by training.", "Builder by nature."] as [string, string],
  paragraphs: [
    "I'm a Computer Science graduate who enjoys turning complex ideas into useful, dependable software. I focus on clear data models, well-defined boundaries, and tests that make important constraints explicit.",
    "I started with C and C++, where the machine makes mistakes hard to hide. Today, I work with C#/.NET, TypeScript, and Python, taking projects from an initial idea to working software. I'm looking for a software engineering opportunity that fits my skills and lets me contribute to useful, reliable products—from interface to infrastructure.",
  ] as [string, string],
  /** One quiet line of facts, not stat tiles. The degree alone: the site names no institution (the owner's decision). */
  facts: ["B.Sc. in Computer Science", "Full-stack: web, mobile, and backend", "Based in Israel", "Working in English and Hebrew"],
  /** The composition beside the copy (components/sections/AboutVisual.tsx): real captures of the four products. No
   *  caption — the products speak for themselves — and one accessible name for the whole group. */
  visual: {
    label: "T Poker, Aegis, DeveloperOS and GRAVITY FLOW, side by side: the four products as they run.",
  },
};
