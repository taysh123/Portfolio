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
  items: { label: string; emphasis?: boolean }[];
  /** Where the group is load-bearing, by project. Every line is checkable against data/projects.ts. */
  evidence: string;
};

export const skillGroups: SkillGroup[] = [
  {
    id: "languages",
    title: "Languages",
    items: [
      { label: "C#", emphasis: true },
      { label: "TypeScript", emphasis: true },
      { label: "Python", emphasis: true },
      { label: "C++", emphasis: true },
      { label: "C" },
      { label: "Java" },
      { label: "JavaScript" },
      { label: "SQL" },
    ],
    evidence: "C# carries the Aegis and T Poker backends, TypeScript their clients and GRAVITY FLOW, Python DeveloperOS and Job Assistant.",
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
      { label: "Framer Motion" },
    ],
    evidence: "One Expo codebase renders iOS, Android and the web for T Poker; Phaser 3 runs GRAVITY FLOW; Next.js is Aegis's dashboard.",
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
      { label: "JWT / RS256" },
    ],
    evidence: "Aegis's event pipeline runs over RabbitMQ and streams alerts over SignalR; T Poker's API keeps commands and queries apart with MediatR.",
  },
  {
    id: "data",
    title: "Data and search",
    items: [
      { label: "PostgreSQL", emphasis: true },
      { label: "SQLite / FTS5", emphasis: true },
      { label: "Redis" },
      { label: "EF Core" },
      { label: "MySQL" },
      { label: "Firebase" },
    ],
    evidence: "SQLite FTS5 is DeveloperOS's retrieval; PostgreSQL and Redis hold Aegis's events and detection windows; PostgreSQL also backs T Poker's API.",
  },
  {
    id: "delivery",
    title: "Delivery and testing",
    items: [
      { label: "Docker", emphasis: true },
      { label: "GitHub Actions", emphasis: true },
      { label: "xUnit" },
      { label: "Vitest" },
      { label: "Jest" },
      { label: "pytest" },
      { label: "Testcontainers" },
      { label: "Playwright" },
      { label: "Capacitor" },
      { label: "PyInstaller" },
      { label: "Vercel" },
      { label: "Railway" },
      { label: "Linux" },
      { label: "Git" },
      { label: "Claude Code" },
      { label: "Ollama" },
    ],
    // Only what data/projects.ts states: DeveloperOS's CI matrix and GRAVITY FLOW's CI-checked suite. Aegis has no CI
    // yet, T Poker's is private, and Job Assistant's workflows are its old crons, so none of them is named for CI.
    evidence: "DeveloperOS and GRAVITY FLOW run their tests in CI; Aegis comes up from one launcher script under Docker Compose.",
  },
];
