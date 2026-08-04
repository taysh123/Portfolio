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
  },
];
