export type ProjectKind = "phones" | "monitor" | "windows" | "orbit" | "abstract" | "terminal";

export type Project = {
  id: string;
  number: string;
  name: string;
  kicker: string;
  description: string;
  stack: string[];
  image?: string;
  alt?: string;
  repo: string;
  live?: string;
  accent: string;
  kind: ProjectKind;
};

export const projects: Project[] = [
  {
    id: "poker",
    number: "01",
    name: "T Poker",
    kicker: "From idea to a real multi-platform product.",
    description:
      "A polished home-game poker companion for running cash games and tournaments, tracking buy-ins, and settling the night with exact transfers.",
    stack: ["React Native", "Expo", "TypeScript", ".NET", "PostgreSQL"],
    image: "/projects/poker/home.png",
    alt: "T Poker mobile application",
    repo: "https://github.com/taysh123/poker-home-games",
    live: "https://poker-home-games-three.vercel.app/",
    accent: "#2f80ff",
    kind: "phones",
  },
  {
    id: "sentinelai",
    number: "02",
    name: "SentinelAI",
    kicker: "Security. In real time.",
    description:
      "An AI-assisted SOC platform with event ingestion, detection, threat scoring, live SignalR alerts, incident workflows, and MITRE ATT&CK mapping.",
    stack: ["ASP.NET Core", "Next.js", "SignalR", "RabbitMQ", "Docker"],
    image: "/projects/sentinelai/dashboard.png",
    alt: "SentinelAI SOC dashboard",
    repo: "https://github.com/taysh123/SentinelAI",
    accent: "#41d9ff",
    kind: "monitor",
  },
  {
    id: "developeros",
    number: "03",
    name: "DeveloperOS",
    kicker: "Your codebase, turned into a workspace.",
    description:
      "A private, local-first developer workspace with grounded search, file:line citations, optional local AI, learning tools, and desktop delivery.",
    stack: ["Python", "SQLite FTS5", "Ollama", "PWA", "CLI"],
    image: "/projects/developeros/dashboard.png",
    alt: "DeveloperOS dashboard",
    repo: "https://github.com/taysh123/DeveloperOS",
    accent: "#9c7cff",
    kind: "windows",
  },
  {
    id: "gravity-flow",
    number: "04",
    name: "GRAVITY FLOW",
    kicker: "A physics system that became a game.",
    description:
      "A one-touch physics puzzler with data-driven levels, bosses, endless runs, deterministic logic, and native packaging through Capacitor.",
    stack: ["Phaser 3", "TypeScript", "Matter.js", "Vitest", "Capacitor"],
    image: "/projects/gravity-flow/gameplay.png",
    alt: "Gravity Flow gameplay",
    repo: "https://github.com/taysh123/Gravity-Game",
    live: "https://taysh123.github.io/Gravity-Game/",
    accent: "#8d6cff",
    kind: "orbit",
  },
  {
    id: "orders-delivery",
    number: "05",
    name: "Orders & Delivery",
    kicker: "Business workflow, modeled end-to-end.",
    description:
      "A full-stack ordering and dispatch system centered on clean state transitions, reliable data flow, and maintainable API boundaries.",
    stack: ["Full Stack", "Node.js", "REST", "SQL", "React"],
    repo: "https://github.com/taysh123/orders-delivery-management-system",
    accent: "#54d2a0",
    kind: "abstract",
  },
  {
    id: "job-assistant",
    number: "06",
    name: "Job Assistant",
    kicker: "Automation built around a real daily need.",
    description:
      "A scheduled job-finding pipeline that collects, filters, deduplicates, persists, and delivers curated software roles through Telegram.",
    stack: ["Python", "SQLite", "Telegram API", "Pydantic", "GitHub Actions"],
    repo: "https://github.com/taysh123/job-assistant",
    accent: "#ffb84d",
    kind: "terminal",
  },
];
