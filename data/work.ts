import { projects, type Project } from "@/data/projects";

export type WorldKey = "poker" | "aegis" | "developeros" | "gravity-flow";
export type PlateKey = "poker" | "aegis" | "dos" | "gf";

/**
 * The Work story (M10, Direction A "Product Plates"): four flagship chapters, each on its own plate, then two more.
 * Every line is condensed from data/projects.ts or transcribed from a real capture; tests/unit/work.test.ts fails on
 * a number that isn't in the project's data and on an annotation the data doesn't support.
 */
export type Flagship = {
  id: WorldKey;
  plate: PlateKey;
  /** The chapter's heading. T Poker's wordmark carries its name, so its heading is the promise instead (the name
   *  is still in the heading's text for screen readers). */
  title: string;
  lede: string;
  /** What I personally built, condensed from the project's own data. Facts only. */
  built?: string;
  /** Short annotations on the real captures. Each is checked against the project's data (work.test.ts). */
  notes: string[];
};

export const flagships: Flagship[] = [
  { id: "poker", plate: "poker", title: "Your home game, handled.",
    lede: "Guest games run on the phone, even offline, and buy-ins, rebuys, and cash-outs stay exact to the cent—on the device and on the server.",
    built: "I built the Expo app for iOS, Android, and web, the ASP.NET Core CQRS API, and the settlement engine in C# and TypeScript.",
    notes: ["Tournament clock", "End-of-night settlement", "Integer cents"] },
  { id: "aegis", plate: "aegis", title: "Aegis",
    lede: "A security operations centre organised into eight modules, with explicit code boundaries and a shared PostgreSQL schema.",
    notes: ["Ingestion", "Normalisation", "Detection", "Threat scoring", "Alerting", "Dashboard", "RabbitMQ", "SignalR"] },
  { id: "developeros", plate: "dos", title: "DeveloperOS",
    lede: "A local-first code workspace that answers from your own files, or tells you it can't.",
    notes: ["file:line citations", "declines outright when the index doesn't support an answer"] },
  { id: "gravity-flow", plate: "gf", title: "GRAVITY FLOW",
    lede: "Press and hold to place a gravity well, and pull a lost star home.",
    notes: ["Gravity well", "lost star", "150 levels across 15 worlds"] },
];

/** T Poker: the three steps, each captioned with what that real screen shows. */
export const pokerSteps = [
  { label: "Start a game", caption: "Start a cash game or tournament straight from the home screen—no account needed." },
  { label: "Run the tournament", caption: "The live tournament dashboard on the host's phone: blind clock, blinds, and prize pool." },
  { label: "Settle up", caption: "End-of-night settlement: who pays whom, exact to the cent." },
] as const;

/** Aegis: the label and line beside the capture (the highlighted row, transcribed), and the honest note on coupling. */
export const aegisCopy = {
  label: "Port-scan detection",
  row: "Port scan detected from 10.10.10.2 (20 distinct ports in 60s)",
  onScreen: "The detector's own output. A Redis HyperLogLog estimates how many distinct ports each source touches in a fixed 60-second window, so the detector never stores the events themselves.",
  seam: "The event pipeline runs over RabbitMQ, through message contracts in a shared kernel; the API host composes the other modules in process. Each module has its own DbContext, but all of them share one PostgreSQL schema—the main coupling to separate before extracting services.",
};

/** Aegis: one alert, start to finish, as implemented. Detection publishes each alert once and two consumers take it
 *  in parallel (the fork). `detect` is the step the highlighted row on the real capture comes from. */
export const aegisTrace = {
  main: [
    { k: "ingest", name: "Ingest", body: "The agent signs the request body with an HMAC; the API verifies it in constant time." },
    { k: "normalise", name: "Normalise", body: "Events are validated on arrival, normalised into one canonical shape, and passed on over MassTransit and RabbitMQ." },
    { k: "detect", name: "Detect", body: "A Redis HyperLogLog estimates distinct ports per source in fixed 60-second windows; the port-scan rule fires when the estimate reaches 20." },
  ],
  fork: [
    { k: "score", name: "Threat scoring", body: "Severity, a per-technique MITRE weight (higher for techniques that are harder to detect), and the rule's false-positive rate multiply into one 0–1 score." },
    { k: "alert", name: "Alert stream", body: "The alert is broadcast over SignalR to every connected analyst dashboard." },
  ],
  end: { k: "live", name: "Live", body: "It appears in the analyst's live feed—the highlighted row above." },
} as const;

/** DeveloperOS: the retrieval sequence, as implemented. */
export const dosFlow = [
  { k: "index", name: "Index", body: "Each index run hashes your files and re-indexes only what changed." },
  { k: "retrieve", name: "Retrieve", body: "Queries run against a local SQLite FTS5 index, ranked with BM25, before any model is called." },
  { k: "evidence", name: "Evidence", body: "Each result points to a file and a line range." },
  { k: "cite", name: "Cite", body: "Answers list the files and lines they were built from." },
  { k: "decline", name: "Or decline", body: "If nothing in the index matches, DeveloperOS declines before calling a model." },
] as const;

/** DeveloperOS: what the refusal looks like (the five steps above already say when it happens). */
export const dosRefusalCaption = {
  body: "The Learning Center's refusal, word for word (`devos learn` prints the same in a terminal):",
};

/** GRAVITY FLOW: scope and state, from the project's data. */
export const gfFacts = [
  "150 levels across 15 worlds, with new mechanics introduced through level design",
  "Built with Phaser 3 and strict TypeScript for web and Android",
  "Android release candidate—not yet published on Google Play",
] as const;

/** The Learning Center's refusal, verbatim from the app (devos/modules/learning.py, INSUFFICIENT_MSG). The red notice
 *  the Learning Center shows above it (devos/api/static/app.js) is the same refusal on the same surface, so it is not
 *  repeated here. */
export const dosRefusal = {
  message: "I don't have enough indexed material to teach that. Try `devos index <path>`, give a file path, or rephrase the topic. (Not guessing.)",
};

export const moreWork = [{ id: "job-assistant" }, { id: "orders-delivery" }] as const;

export function projectOf(id: string): Project {
  const p = projects.find((x) => x.id === id);
  if (!p) throw new Error(`unknown project ${id}`);
  return p;
}
