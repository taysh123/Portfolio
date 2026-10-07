import { projects, type Project } from "@/data/projects";

export type WorldKey = "poker" | "aegis" | "developeros" | "gravity-flow";
/** `rows` crops single alert rows out of one capture. All fractions are of the capture: `centres` are row
 *  centres (y), `left` is where rows start (x), `height` is one row's height (y), `aspect` is height / width. */
export type WorldAssets = { monitor: string; rows?: { src: string; centres: number[]; left: number; height: number; aspect: number } };
/** Each chapter's composition (M2): one visual language, four expressions. `side` alternates the world left/right. */
export type ChapterLayout = "product" | "system" | "evidence" | "orbit";
export type Flagship = { id: WorldKey; number: "01" | "02" | "03" | "04"; kicker: string; story: [string, string];
  metricLabels: [string, string, string]; statusNote?: string;
  layout: ChapterLayout; side: "copy-left" | "world-left";
  /** What I personally built, condensed from the project's own data (context, caseStudy). Facts only. */
  built: string;
  /** The world's annotations. Every one is a phrase from the project's own data (unit-tested), so a label on a
   *  screenshot can never claim a feature the project doesn't have. */
  notes: string[];
  /** Images a world composes. Data, not code: swapping screenshots is a data change (Aegis, decision 6). */
  worldAssets?: WorldAssets };
export type MoreWorkRow = { id: "job-assistant" | "orders-delivery"; diagram: { kind: "pipeline" | "duplex"; nodes: string[] }; metricLabels: [string, string] };

/**
 * The Work story (spec §5.2): four flagship worlds, then two "more work" rows.
 * Copy is condensed from data/projects.ts — tests/unit/work.test.ts fails on any number that isn't there.
 * `featured` in projects.ts is untouched; this list decides the order and the flagships.
 */
export const flagships: Flagship[] = [
  { id: "poker", number: "01", kicker: "A poker study platform and home-game manager, shipped from one codebase",
    story: ["One Expo codebase renders iOS, Android and the live web app, backed by an ASP.NET Core CQRS service over PostgreSQL.",
            "The financial core runs in integer cents, and the two stacks carry 6,210 passing tests."],
    metricLabels: ["Passing tests, both stacks", "Targets from one codebase", "CI jobs, scoped per push"],
    layout: "product", side: "copy-left",
    built: "Schema, API, two clients, CI and both store releases — 1,996 commits.",
    notes: ["Tournament clock", "End-of-night settlement", "Integer cents"] },
  { id: "aegis", number: "02", kicker: "A Security Operations Centre where module isolation is enforced by the compiler",
    story: ["Security events flow from ingestion through detection and threat scoring to alerts over MassTransit and RabbitMQ, and reach the dashboard live over SignalR.",
            "The whole stack comes up from one Docker command that mints its own RS256 keys."],
    metricLabels: ["Bounded contexts", "Cross-context references", "Passing tests, incl. Testcontainers"],
    statusNote: "Runs locally — the live stream shown is a local demo",
    layout: "system", side: "world-left",
    built: "Eight bounded contexts across 27 .NET projects, the event pipeline and the live dashboard — 9 tagged releases.",
    notes: ["Ingestion", "Normalisation", "Detection", "Threat scoring", "Alerting", "Dashboard", "RabbitMQ", "SignalR"],
    // Rows measured on the 3840×2160 live-alerts capture: card borders at y 500–631, 644–775, 788–919 and x 528,
    // so centres 565.5 / 709.5 / 853.5 ÷ 2160; `left` and `height` keep a 10 px margin of page around each card.
    worldAssets: { monitor: "/projects/aegis/04-dashboard.webp", rows: { src: "/projects/aegis/05-live-alerts.webp", centres: [0.2618, 0.3285, 0.3951], left: 0.135, height: 0.064, aspect: 2160 / 3840 } } },
  { id: "developeros", number: "03", kicker: "A local-first code workspace that refuses to answer without evidence",
    story: ["It indexes your own projects into a private SQLite FTS5 index and answers with real file and line citations, declining when the index can't support an answer.",
            "It ships as one Python package with no runtime dependencies: a CLI, a browser dashboard, an installable PWA or a Windows desktop window."],
    metricLabels: ["Tests · 0.82:1 to source", "Runtime dependencies", "Decision records"],
    layout: "evidence", side: "copy-left",
    built: "The FTS5 index, grounded answers, the CLI, dashboard, PWA and Windows desktop window — v1.0.0 in ~14 days.",
    notes: ["File and line citations", "Declining when the index can't support an answer"] },
  { id: "gravity-flow", number: "04", kicker: "One touch, 150 hand-tuned levels, and physics that had to feel fair",
    story: ["Press and hold to spawn an inverse-square gravity well and pull a lost star home, across 150 data-driven levels in 15 worlds.",
            "Built on Phaser 3 in strict TypeScript, with a Vitest suite that pins both the physics and the progression."],
    metricLabels: ["Levels across 15 worlds", "Tests over 28 files", "Core mechanics"],
    statusNote: "v1.0.0-rc · Android-only · not yet in a store",
    layout: "orbit", side: "world-left",
    built: "The physics, all 150 levels across 15 worlds and the progression system — 215 commits.",
    notes: ["Inverse-square gravity well", "150 levels", "15 worlds"] },
];

export const moreWork: MoreWorkRow[] = [
  { id: "job-assistant", diagram: { kind: "pipeline", nodes: ["collect", "filter", "dedup", "deliver"] }, metricLabels: ["Source adapters", "Tests"] },
  { id: "orders-delivery", diagram: { kind: "duplex", nodes: ["client", "TCP", "server"] }, metricLabels: ["Protocol routes", "Concurrent clients"] },
];

export function projectOf(id: string): Project {
  const p = projects.find((x) => x.id === id);
  if (!p) throw new Error(`unknown project ${id}`);
  return p;
}
