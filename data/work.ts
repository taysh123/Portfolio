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
    lede: "Buy-ins, rebuys and cash-outs settle to the cent on a phone that may be offline, and still agree with the server when it reconnects.",
    built: "The Expo app for iOS, Android and the web, the ASP.NET Core CQRS API and the integer-cent settlement engine.",
    notes: ["Tournament clock", "End-of-night settlement", "Integer cents"] },
  { id: "aegis", plate: "aegis", title: "Aegis",
    lede: "A security operations centre built as eight modules that never reference each other's code.",
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
  { label: "Start a game", caption: "Cash game or tournament, straight from the home screen, no account needed." },
  { label: "Run the tournament", caption: "A live tournament dashboard: the blind clock and prize pool for the whole table." },
  { label: "Settle up", caption: "Guided end-of-night settlement: who pays whom, in exact integer-cent transfers." },
] as const;

/** Aegis: the line under the capture (the highlighted row, transcribed), and the honest note on coupling. */
export const aegisCopy = {
  row: "Port scan detected from 10.10.10.2 (20 distinct ports in 60s)",
  onScreen: "The Detect step's own output. A Redis HyperLogLog counts the distinct ports each source touches in a 60-second window, so the detector never holds the events themselves.",
  seam: "No module references another's code: they talk through message contracts on RabbitMQ and a shared kernel, each with its own DbContext. They still share one PostgreSQL schema, the seam to cut before splitting them into services.",
};

/** Aegis: one alert, start to finish, as implemented. Detection publishes each alert once and two consumers take it
 *  in parallel (the fork). `detect` is the step the highlighted row on the real capture comes from. */
export const aegisTrace = {
  main: [
    { k: "ingest", name: "Ingest", body: "An agent signs the request body; the API checks the HMAC in constant time." },
    { k: "normalise", name: "Normalise", body: "Events take one shape and move on over MassTransit and RabbitMQ." },
    { k: "detect", name: "Detect", body: "A Redis window counts distinct ports per source; the port-scan rule fires at 20 in 60 seconds." },
  ],
  fork: [
    { k: "score", name: "Threat scoring", body: "Severity, MITRE detectability and false-positive rate become one score." },
    { k: "alert", name: "Alert stream", body: "Pushes the alert over SignalR to every analyst watching its severity." },
  ],
  end: { k: "live", name: "Live", body: "It lands in the analyst's feed: the highlighted row above." },
} as const;

/** DeveloperOS: the retrieval sequence, as implemented. */
export const dosFlow = [
  { k: "index", name: "Index", body: "A scan hashes every file; only what changed is indexed again." },
  { k: "retrieve", name: "Retrieve", body: "One SQLite FTS5 index, ranked by bm25, runs before any answer." },
  { k: "evidence", name: "Evidence", body: "Each hit is a real file and a line range." },
  { k: "cite", name: "Cite", body: "Results and answers show the file and lines they came from." },
  { k: "decline", name: "Or decline", body: "If retrieval comes back empty, it says so. No model is called." },
] as const;

/** DeveloperOS: what the refusal is. */
export const dosRefusalCaption = {
  title: "And when your code can't support an answer, it says so.",
  body: "The refusal is a code path that runs before any model is called. From the Learning Center, in the app's own words:",
};

/** GRAVITY FLOW: scope and state, from the project's data. */
export const gfFacts = [
  "150 levels across 15 worlds, each new mechanic a field in the level data",
  "Phaser 3 and strict TypeScript, for Android and the web",
  "A release candidate, not yet in a store",
] as const;

/** The Learning Center's refusal, verbatim from the app (devos/api/static/app.js and devos/modules/learning.py). */
export const dosRefusal = {
  notice: "Not enough of your indexed code matched this. Try a file path, different words, or import/re-scan the project in the Projects tab.",
  message: "I don't have enough indexed material to teach that. Try `devos index <path>`, give a file path, or rephrase the topic. (Not guessing.)",
};

export const moreWork = [{ id: "job-assistant" }, { id: "orders-delivery" }] as const;

export function projectOf(id: string): Project {
  const p = projects.find((x) => x.id === id);
  if (!p) throw new Error(`unknown project ${id}`);
  return p;
}
