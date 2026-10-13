/**
 * The Stack (M10): tools grouped by the work they did. Five groups instead of six, no figures pulled out at display
 * scale, and each group explained through the projects that use it — the evidence line names them, and the lens
 * (data/stackLens.ts) filters the rows down to one project's tools, derived from that project's own published text.
 *
 * No per-technology logos: redrawing third-party marks from memory produces subtly wrong logos. Only technologies
 * actually used appear here.
 */
export type SkillGroup = {
  id: string;
  title: string;
  /** `note` stands in for a tool no listed project names: where it is used instead (this site, everyday work). */
  items: { label: string; emphasis?: boolean; note?: string }[];
  /** Where the group is load-bearing, by project. Every line is checkable against data/projects.ts. */
  evidence: string;
  /** False for everyday tools, which belong to no one project: the row then names no projects. */
  related?: boolean;
};

/*
  M10 copy pass: which project uses which tool comes from data/stackLens.ts (each project's own published text), and
  each tool now carries that mapping itself (Stack.tsx), so a group no longer reads as "every tool here, in every
  project named beside it". Checked against the repositories (Aegis, DeveloperOS, GRAVITY FLOW, T Poker) on
  2026-10-13: Framer Motion is listed in Aegis's package.json but never imported, so Aegis no longer names it (this
  site uses it); MySQL is in no listed project and is gone; T Poker signs its own tokens with HS256, so the row says
  JWT, and RS256 stays with Aegis's text.
*/
export const skillGroups: SkillGroup[] = [
  {
    id: "languages",
    title: "Languages",
    items: [
      { label: "C#", emphasis: true },
      { label: "TypeScript", emphasis: true },
      { label: "Python", emphasis: true },
      { label: "Java" },
      { label: "JavaScript" },
      { label: "SQL" },
      { label: "C++", note: "where I started" },
      { label: "C", note: "where I started" },
    ],
    evidence: "C# powers the T Poker and Aegis backends, TypeScript their clients and GRAVITY FLOW, and Python DeveloperOS and Job Assistant; Java runs Orders & Delivery.",
  },
  {
    id: "interface",
    title: "Product and interface",
    items: [
      { label: "React", emphasis: true },
      { label: "Next.js", emphasis: true },
      { label: "React Native / Expo", emphasis: true },
      { label: "Tailwind CSS" },
      { label: "Phaser 3" },
      { label: "JavaFX" },
      { label: "Framer Motion", note: "this site" },
    ],
    evidence: "Expo renders T Poker for iOS, Android, and web; Next.js powers the Aegis dashboard; Phaser 3 runs GRAVITY FLOW; JavaFX is Orders & Delivery's client.",
  },
  {
    id: "service",
    title: "Services and APIs",
    items: [
      { label: "ASP.NET Core", emphasis: true },
      { label: "RabbitMQ / MassTransit", emphasis: true },
      { label: "CQRS / MediatR" },
      { label: "Clean Architecture" },
      { label: "SignalR" },
      { label: "REST" },
      { label: "JWT" },
    ],
    evidence: "Aegis moves events through MassTransit and RabbitMQ and streams alerts over SignalR; T Poker's ASP.NET Core API uses CQRS with MediatR.",
  },
  {
    id: "data",
    title: "Data, search and models",
    items: [
      { label: "PostgreSQL", emphasis: true },
      { label: "SQLite / FTS5", emphasis: true },
      { label: "Redis" },
      { label: "EF Core" },
      { label: "Ollama" },
    ],
    evidence: "DeveloperOS searches a local SQLite FTS5 index and can hand it to an optional local model; Aegis keeps detection windows in Redis and its data in PostgreSQL, which also backs T Poker's API.",
  },
  {
    id: "delivery",
    title: "Delivery and testing",
    items: [
      { label: "Docker", emphasis: true },
      { label: "GitHub Actions", emphasis: true },
      { label: "xUnit" },
      { label: "Testcontainers" },
      { label: "Jest" },
      { label: "Vitest" },
      { label: "pytest" },
      { label: "Playwright", note: "this site's browser tests" },
      { label: "Capacitor" },
      { label: "PyInstaller" },
      { label: "Vercel" },
      { label: "Railway" },
      { label: "Firebase" },
    ],
    // Only what data/projects.ts states. Aegis has no CI yet, and T Poker's is in a private repository, so the line
    // names CI for DeveloperOS and GRAVITY FLOW only.
    evidence: "DeveloperOS and GRAVITY FLOW run their tests in CI; Aegis starts under Docker Compose; T Poker's API runs on Railway and its web app on Vercel.",
  },
  {
    id: "workflow",
    title: "Everyday tools",
    items: [
      { label: "Git", emphasis: true },
      { label: "Linux" },
      { label: "Claude Code" },
    ],
    evidence: "Across all of the work, this site included.",
    related: false,
  },
];
