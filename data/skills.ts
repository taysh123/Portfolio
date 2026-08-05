/**
 * Toolkit content.
 *
 * A note on the design: there are no per-technology brand logos here, and that
 * is deliberate. Redrawing ~35 third-party marks from memory produces subtly
 * wrong logos, which reads worse than no logo — and "guessing logo paths" is a
 * documented anti-pattern. Instead each *group* carries one purpose-drawn
 * glyph in the site's own visual language, and the technologies inside are
 * typeset chips. It stays cohesive, and the grouping does the work the icons
 * were meant to do.
 *
 * Only technologies actually used in the shipped projects appear here.
 */

export type SkillGroup = {
  id: string;
  title: string;
  caption: string;
  glyph: GlyphKey;
  items: { label: string; emphasis?: boolean }[];
  /**
   * Where this group is actually load-bearing, with a number or a specific
   * behaviour. A capability list without evidence is a wish list — every line
   * here is checkable against `data/projects.ts` and the repos it points at.
   */
  evidence: string;
  /**
   * The two groups that carry the argument, given the visual weight to match.
   *
   * Six equally-sized modules tell a reader that six things matter equally,
   * which is never true and is the reason skill sections read as inventory.
   * These two are the ones this portfolio actually stands on: an architecture
   * whose boundaries a machine enforces, and the tests that pin the behaviour
   * inside them. Everything else is real, and supports them.
   *
   * `value` is pulled out at display scale, so it has to be a figure a reader
   * can go and count.
   */
  lead?: { value: string; unit: string };
};

export type GlyphKey =
  | "language"
  | "interface"
  | "service"
  | "store"
  | "delivery"
  | "verify";

export const skillGroups: SkillGroup[] = [
  {
    id: "languages",
    title: "Languages",
    caption: "Where the thinking happens",
    glyph: "language",
    items: [
      { label: "C++", emphasis: true },
      { label: "C" },
      { label: "C#", emphasis: true },
      { label: "TypeScript", emphasis: true },
      { label: "Python", emphasis: true },
      { label: "Java" },
      { label: "JavaScript" },
      { label: "SQL" },
    ],
    evidence:
      "C++ and C# carry SentinelAI and T Poker; Python carries DeveloperOS and Job Assistant — five languages load-bearing in shipped code."
  },
  {
    id: "interface",
    title: "Interface",
    caption: "What people actually touch",
    glyph: "interface",
    items: [
      { label: "React", emphasis: true },
      { label: "Next.js", emphasis: true },
      { label: "React Native / Expo" },
      { label: "Tailwind CSS" },
      { label: "Framer Motion" },
      { label: "Phaser 3" },
      { label: "JavaFX" },
    ],
    evidence:
      "One Expo codebase renders iOS, Android and the live web app for T Poker — designing for the narrowest target first."
  },
  {
    id: "service",
    title: "Services & APIs",
    caption: "The part that has to stay up",
    glyph: "service",
    items: [
      { label: "ASP.NET Core", emphasis: true },
      { label: "Clean Architecture" },
      { label: "CQRS / MediatR" },
      { label: "REST" },
      { label: "SignalR" },
      { label: "RabbitMQ / MassTransit", emphasis: true },
      { label: "JWT / RS256" },
    ],
    evidence:
      "SentinelAI moves events across 8 bounded contexts over RabbitMQ, with 0 cross-context references and a retry ladder per endpoint.",
    // The "0 cross-context references" half of this claim lives in the
    // evidence line beside it — repeating it here wrapped the label to three
    // cramped lines under the figure.
    lead: { value: "8", unit: "bounded contexts" },
  },
  {
    id: "store",
    title: "Data & State",
    caption: "Where the truth lives",
    glyph: "store",
    items: [
      { label: "PostgreSQL", emphasis: true },
      { label: "SQLite / FTS5", emphasis: true },
      { label: "Redis" },
      { label: "EF Core" },
      { label: "MySQL" },
      { label: "Firebase" },
    ],
    evidence:
      "SQLite FTS5 powers DeveloperOS’s grounded retrieval; PostgreSQL and Redis back SentinelAI’s partitioned events and sliding windows."
  },
  {
    id: "delivery",
    title: "Delivery",
    caption: "Getting it into hands",
    glyph: "delivery",
    items: [
      { label: "Docker", emphasis: true },
      { label: "GitHub Actions", emphasis: true },
      { label: "Vercel" },
      { label: "Railway" },
      { label: "Linux" },
      { label: "Git" },
      { label: "Capacitor" },
      { label: "PyInstaller" },
    ],
    evidence:
      "SentinelAI comes up from a single Docker command that mints its own RS256 keys. T Poker runs 5 CI jobs on every push."
  },
  {
    id: "verify",
    title: "Verification",
    caption: "How I know it works",
    glyph: "verify",
    items: [
      { label: "xUnit", emphasis: true },
      { label: "Vitest" },
      { label: "Jest" },
      { label: "pytest" },
      { label: "Testcontainers" },
      { label: "Playwright" },
      { label: "Claude Code", emphasis: true },
      { label: "Ollama" },
    ],
    evidence:
      "1,742 tests across five projects, weighted toward settlement math, threat scoring, retrieval grounding and level progression.",
    lead: { value: "1,742", unit: "tests across five projects" },
  },
];
