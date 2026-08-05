import type { ProjectStatus } from "@/components/ui/Tag";
import type { ProjectAccent } from "@/lib/tokens";

/**
 * Project content.
 *
 * Every claim in this file was checked against the actual repository. Where a
 * repo does not support a claim, the claim is gone. Where a repo is stronger
 * than the old copy suggested, the specific number is here instead of an
 * adjective.
 *
 * `honestNote` is deliberate: naming what a system *isn't* is a stronger
 * signal than overselling what it is, and it means nothing here can be
 * contradicted by opening the repo.
 */

export type Metric = {
  value: string;
  label: string;
};

export type Decision = {
  title: string;
  body: string;
};

export type CaseStudy = {
  /** What the project is actually solving, in one paragraph. */
  problem: string;
  architecture: string;
  decisions: Decision[];
  challenges: string[];
  learned: string[];
  /** The limits of the system, stated plainly. */
  honestNote?: string;
};

/**
 * App-store presence.
 *
 * `url` is optional and its absence is meaningful: a listing with no link
 * renders as "coming soon" rather than as a dead button, so the badge can
 * never promise a destination that does not exist.
 */
export type StoreListing = {
  platform: "ios" | "android";
  status: "live" | "soon";
  url?: string;
};

export type ProjectMedia = {
  image?: string;
  alt?: string;
  gallery?: { src: string; alt: string }[];
  /** "contain" for portrait phone captures, "cover" for wide desktop shots. */
  fit?: "cover" | "contain";
};

export type Project = {
  id: string;
  name: string;
  tagline: string;
  /** One line for the card. */
  summary: string;
  /** Two to three sentences for the detail view. */
  description: string;
  context: string;
  status: ProjectStatus;
  stack: { label: string; emphasis?: boolean }[];
  metrics: Metric[];
  repoUrl: string;
  liveUrl?: string;
  liveLabel?: string;
  featured?: boolean;
  accent: ProjectAccent;
  media?: ProjectMedia;
  stores?: StoreListing[];
  caseStudy: CaseStudy;
};

/** T Poker's live App Store listing. */
const T_POKER_IOS_URL: string | undefined =
  "https://apps.apple.com/us/app/t-poker-poker-trainer/id6781109023";

export const projects: Project[] = [
  {
    id: "poker",
    name: "T Poker",
    tagline: "A poker study platform and home-game manager, shipped from one codebase",
    summary:
      "Expo app, React web build, and an ASP.NET Core CQRS backend — with a settlement engine that closes a night in the fewest exact transfers.",
    description:
      "Two products in one: a study platform with lessons, daily drills and an AI coach, and a home-game manager with a buy-in ledger, tournament clock and end-of-night settlement. One Expo codebase renders iOS, Android and the live web app; behind it sits an ASP.NET Core backend built on Clean Architecture with MediatR CQRS over PostgreSQL. The financial core runs in integer cents and is covered by 892 tests across both languages.",
    context: "Solo build · 714 commits",
    status: "live",
    accent: "amber",
    featured: true,
    repoUrl: "https://github.com/taysh123/poker-home-games",
    liveUrl: "https://app.tpoker.app/",
    liveLabel: "Open the app",
    stores: [
      { platform: "ios", status: T_POKER_IOS_URL ? "live" : "soon", url: T_POKER_IOS_URL },
      { platform: "android", status: "soon" },
    ],
    metrics: [
      { value: "892", label: "Tests across both stacks" },
      { value: "5", label: "CI jobs per push" },
      { value: "3", label: "Targets from one codebase" },
      { value: "0", label: "Floating-point money bugs" },
    ],
    stack: [
      { label: "TypeScript", emphasis: true },
      { label: "Expo / React Native" },
      { label: "react-native-web" },
      { label: "C# / ASP.NET Core 8", emphasis: true },
      { label: "MediatR (CQRS)" },
      { label: "EF Core 8" },
      { label: "PostgreSQL" },
      { label: "Jest + xUnit" },
      { label: "GitHub Actions" },
    ],
    media: {
      image: "/projects/poker/home.webp",
      alt: "T Poker home screen — cash game or tournament",
      fit: "contain",
      gallery: [
        { src: "/projects/poker/tournament-live.webp", alt: "Live tournament dashboard with blind clock" },
        { src: "/projects/poker/podium.webp", alt: "Tournament results podium" },
        { src: "/projects/poker/final-count.webp", alt: "Guided end-of-night settlement" },
        { src: "/projects/poker/stats.webp", alt: "Lifetime statistics and profit/loss" },
      ],
    },
    caseStudy: {
      problem:
        "A home poker night ends with six people, a pile of chips and an argument about who owes whom. Doing it by hand produces a tangle of small transfers and, sooner or later, an off-by-a-cent dispute. The interesting problem isn't the UI — it's guaranteeing that the money is exactly right, on a phone with no signal, and that the server agrees when it reconnects.",
      architecture:
        "One Expo/React Native codebase renders iOS, Android and the live web app through react-native-web. Behind it, an ASP.NET Core 8 API is split into four Clean Architecture projects with MediatR carrying commands and queries separately over EF Core and PostgreSQL. Guest mode runs an entire game on-device against AsyncStorage — schema-versioned, with corruption quarantine that never wipes existing data — and accounts add sync, groups and lifetime stats. Billing sits behind five interchangeable verifiers so the payment provider is a swappable detail rather than a dependency.",
      decisions: [
        {
          title: "Integer cents everywhere, never floats",
          body: "The settlement engine is a greedy two-pointer debt minimiser operating entirely in integer cents, so transfers are exact by construction — no epsilon comparisons, no rounding drift, no reconciliation step.",
        },
        {
          title: "The algorithm implemented twice, on purpose",
          body: "The same settlement logic exists in C# on the server and TypeScript on the device. That's deliberate duplication: the device has to close a game with no network, and the server has to be authoritative. The TypeScript port's test fixtures mirror the C# service's semantics case for case, so a divergence shows up as a failing test rather than a wrong payout.",
        },
        {
          title: "Largest-remainder payouts with a deterministic tiebreak",
          body: "Prize splits floor each raw share, then distribute the leftover cents by descending fractional part with the index as tiebreak. Same input, same output, every time — which matters when the payout is being read aloud at a table.",
        },
        {
          title: "Local-first guest mode",
          body: "A full game starts in about thirty seconds with no sign-up. Accounts are an upgrade path, not a gate — which is the difference between a tool people use and one they install once.",
        },
      ],
      challenges: [
        "Keeping two implementations of the money math in agreement across two languages and two runtimes",
        "Modelling a real tournament director — editable blind structures, a pause/resume clock, rebuys and late registration — as software that survives a chaotic table",
        "Guest → account upgrade that resumes correctly, including invite deep links that survive a sign-in round trip",
        "Making a utility feel like a product, without letting the polish hide the state it's actually in",
      ],
      learned: [
        "Where duplicating logic beats sharing it — correctness across a network boundary is worth more than DRY",
        "CQRS pays off when reads and writes have genuinely different shapes, and costs you when they don't",
        "Shipping one codebase to web and native means designing for the *narrowest* platform first",
        "End-to-end ownership: schema, API, two clients, CI, and the release paperwork nobody warns you about",
      ],
      honestNote:
        "The web app is genuinely live. The Android build is signed and store-ready but has not been published — the remaining work is a Play Console listing, not code.",
    },
  },
  {
    id: "sentinelai",
    name: "SentinelAI",
    tagline: "A Security Operations Centre where module isolation is enforced by the compiler",
    summary:
      "Eight bounded contexts across 27 .NET projects with zero cross-context references — events flow ingestion → detection → scoring → alert over RabbitMQ and stream live to the dashboard.",
    description:
      "A self-hosted SOC platform modelled on the tools it imitates. Security events move through an ingestion → normalisation → detection → threat-scoring → alerting pipeline carried by MassTransit over RabbitMQ, backed by a range-partitioned PostgreSQL and a Redis layer that holds sliding detection windows. Alerts and incident updates reach the Next.js dashboard over SignalR. The whole stack comes up from one Docker command that mints its own RS256 keys.",
    context: "Solo build · 7 tagged releases",
    status: "local",
    accent: "blue",
    featured: true,
    repoUrl: "https://github.com/taysh123/SentinelAI",
    metrics: [
      { value: "8", label: "Bounded contexts" },
      { value: "0", label: "Cross-context references" },
      { value: "105", label: "Tests, incl. Testcontainers" },
      { value: "1", label: "Command to run it all" },
    ],
    stack: [
      { label: "C# / .NET 10", emphasis: true },
      { label: "ASP.NET Core" },
      { label: "MassTransit + RabbitMQ", emphasis: true },
      { label: "PostgreSQL 16" },
      { label: "Redis" },
      { label: "SignalR" },
      { label: "EF Core" },
      { label: "Next.js 15" },
      { label: "Docker Compose" },
    ],
    media: {
      image: "/projects/sentinelai/dashboard.webp",
      alt: "SentinelAI real-time SOC overview dashboard",
      fit: "cover",
      gallery: [
        { src: "/projects/sentinelai/live-alerts.webp", alt: "Live alert stream over SignalR" },
        { src: "/projects/sentinelai/incident-kanban.webp", alt: "Incident workflow board with audit timeline" },
        { src: "/projects/sentinelai/ai-analysis.webp", alt: "Generated alert analysis panel" },
        { src: "/projects/sentinelai/architecture.webp", alt: "System architecture diagram" },
      ],
    },
    caseStudy: {
      problem:
        "Security tooling is where architecture claims go to die: everything starts as clean modules and ends as a monolith with shared tables. The goal here was to build a real detection pipeline and then prove the module boundaries actually hold — not by convention or code review, but by making a violation fail to compile.",
      architecture:
        "Eight bounded contexts — ingestion, detection, threat scoring, alerts, incidents, agents, auth, analysis — each split into Domain, Application and Infrastructure projects across 27 .csproj files. No module references another module. All inter-module traffic is message contracts on RabbitMQ through a shared kernel, and each context owns its own DbContext. PostgreSQL holds normalised events in a range-partitioned table with a GIN index over the JSONB payload; Redis carries the SignalR backplane, sliding detection windows and alert deduplication.",
      decisions: [
        {
          title: "Isolation the compiler enforces",
          body: "A scripted scan of every ProjectReference across all 27 projects returns zero module-to-module edges. That's the whole point: a modular monolith where the boundary is a build error is one you can actually split into services later. One where the boundary is a code-review habit is not.",
        },
        {
          title: "Sliding windows in Redis instead of buffered events",
          body: "Brute-force and port-scan detection need counts over a moving window. Rather than hold events in memory, detectors use two-bucket Redis windows and HyperLogLog for distinct-port cardinality — bounded memory regardless of event rate, and state that survives a restart.",
        },
        {
          title: "Threat scores you can argue with",
          body: "Score = (severity ÷ 100) × MITRE detectability × (1 − false-positive rate), and the calculator returns a breakdown record carrying all three inputs. An analyst can see why something scored 82, which is the difference between a tool people trust and a number they ignore.",
        },
        {
          title: "Agent ingestion authenticated by body HMAC",
          body: "Agents sign the request body; the API compares in constant time. The RS256 signing key never leaves the API process, refresh tokens are 64 bytes of CSPRNG stored SHA-256-hashed and rotated single-use.",
        },
      ],
      challenges: [
        "Keeping eight contexts genuinely independent while a single event still has to traverse five of them",
        "Making detection state bounded — a SOC that OOMs under load is worse than no SOC",
        "Mapping detectors onto MITRE ATT&CK techniques so scores mean something outside this codebase",
        "Making first run reproducible: generated secrets, RS256 keys, health gating and idempotent seed data from one command",
      ],
      learned: [
        "Architecture claims are only worth what you can mechanically verify — so verify them in CI, or at least in a script",
        "Event-driven systems are easy to write and hard to observe; the retry ladder and the audit timeline mattered more than the pipeline itself",
        "Designing a modular monolith you could split later is a different exercise from designing microservices you'll never need",
        "Writing your own audit document, listing what you didn't finish, is the most useful file in the repo",
      ],
      honestNote:
        "The optional \"AI analysis\" mode is a deterministic C# template provider behind a swappable interface — no model is called and no external provider is implemented. There is also no CI pipeline yet, despite the testing strategy document specifying one.",
    },
  },
  {
    id: "developeros",
    name: "DeveloperOS",
    tagline: "A local-first code workspace that refuses to answer without evidence",
    summary:
      "Indexes your own projects into SQLite FTS5 and answers with file:line citations — 363 tests, 34 decision records, and zero runtime dependencies.",
    description:
      "Point it at your code and it builds a private FTS5 index that powers ranked search and grounded question-answering, where every response cites real file and line locations and the system declines outright when the index doesn't support an answer. It ships as one Python package with no runtime dependencies, reachable four ways — CLI, browser dashboard, installable PWA, or a standalone Windows desktop window with a per-user installer.",
    context: "Solo build · v1.0.0 in ~14 days",
    status: "released",
    accent: "violet",
    featured: true,
    repoUrl: "https://github.com/taysh123/DeveloperOS",
    metrics: [
      { value: "363", label: "Tests · 0.82:1 to source" },
      { value: "0", label: "Runtime dependencies" },
      { value: "34", label: "Decision records" },
      { value: "6", label: "CI matrix combinations" },
    ],
    stack: [
      { label: "Python 3.11+", emphasis: true },
      { label: "SQLite FTS5 (bm25)", emphasis: true },
      { label: "stdlib http.server" },
      { label: "React + htm (vendored)" },
      { label: "Ollama (optional)" },
      { label: "PyInstaller" },
      { label: "Inno Setup" },
      { label: "GitHub Actions" },
    ],
    media: {
      image: "/projects/developeros/dashboard.webp",
      alt: "DeveloperOS dashboard overview",
      fit: "cover",
      gallery: [
        { src: "/projects/developeros/ai-features.webp", alt: "Grounded search and ask, with file:line citations" },
        { src: "/projects/developeros/learning.webp", alt: "Learning centre generated from indexed code" },
        { src: "/projects/developeros/career.webp", alt: "Career tools — leads, CV match, interview prep" },
        { src: "/projects/developeros/hero.webp", alt: "DeveloperOS desktop window" },
      ],
    },
    caseStudy: {
      problem:
        "Tools that answer questions about your codebase have one failure mode that matters: confidently making something up. A wrong citation is worse than no answer, because it costs you the time to discover it was wrong. The design constraint was therefore inverted — build the refusal path first, and let answering be the thing that has to earn its way in.",
      architecture:
        "A scan hashes each file and compares it against the stored index hash, so unchanged files short-circuit and re-indexing stays incremental. Content lands in SQLite FTS5 with bm25 ranking across eight tables. Retrieval runs before generation, and if it comes back empty the answer function returns an insufficient-evidence message without ever calling a provider. The dashboard is served over a loopback-only HTTP API and the same package also exposes 24 CLI commands and an installable PWA.",
      decisions: [
        {
          title: "Zero runtime dependencies",
          body: "Everything is Python's standard library — http.server, sqlite3, urllib, imaplib. No pip install step, no dependency CVEs, no supply chain. The frontend is React plus htm vendored directly into the repo: no npm, no build step, no CDN, a 1,595-line SPA that just loads.",
        },
        {
          title: "Refusal as a first-class code path",
          body: "The Q&A module returns its insufficient-evidence response before the provider is ever reached. It isn't a prompt instruction the model may ignore — it's a branch it cannot get past.",
        },
        {
          title: "Loopback API hardened like a public one",
          body: "A per-instance CSRF token compared with hmac.compare_digest, an Origin allowlist pinned to 127.0.0.1 on the bound port, JSON-only content types, a 64 KB body cap, and no CORS headers anywhere. A network audit of every import capable of opening a socket returns exactly two call sites, both loopback.",
        },
        {
          title: "One codebase, four delivery shapes",
          body: "CLI, browser dashboard, installable PWA, and a PyInstaller desktop window with an Inno Setup per-user installer that needs no admin rights. Deliberately no service worker — the backend is a local process, so offline caching would only lie about availability.",
        },
      ],
      challenges: [
        "Making incremental re-indexing correct — the hash comparison has to be conservative or you serve stale citations",
        "Shipping a Python app as a Windows desktop experience with a clean uninstall and no elevation",
        "Keeping 22 secret-file exclusion patterns ahead of what people actually leave lying around in a repo",
        "Designing privacy as an architectural property rather than a settings toggle",
      ],
      learned: [
        "Grounded retrieval earns trust by refusing — the decline path is the feature, not the fallback",
        "A high test-to-source ratio is only useful if the tests encode behaviour you'd otherwise argue about",
        "Writing a decision record at the moment of the decision is worth more than documenting it afterwards",
        "Zero dependencies is a constraint that keeps paying: no upgrades, no audit noise, no broken installs",
      ],
      honestNote:
        "The default AI provider is an explicit offline mock — retrieval, grounding and citations are real, but natural-language answer prose only appears if you opt in to a local Ollama daemon. The shipped binaries are unsigned, so Windows SmartScreen will ask for confirmation.",
    },
  },
  {
    id: "gravity-flow",
    name: "GRAVITY FLOW",
    tagline: "One touch, 150 hand-tuned levels, and physics that had to feel fair",
    summary:
      "A Phaser 3 puzzler in strict TypeScript — hold to create a gravity well, 15 worlds, 220 tests pinning the physics and progression.",
    description:
      "Press and hold to spawn an inverse-square gravity well and pull a lost star home. 150 data-driven levels across 15 worlds build on seven core mechanics, alongside a deterministic seeded endless mode and a cosmetics economy that is explicitly incapable of affecting gameplay. Built on Phaser 3 with strict TypeScript and a Vitest suite that pins both the physics and the progression logic.",
    context: "Solo build · 215 commits",
    status: "rc",
    accent: "teal",
    repoUrl: "https://github.com/taysh123/Gravity-Game",
    stores: [
      { platform: "ios", status: "soon" },
      { platform: "android", status: "soon" },
    ],
    metrics: [
      { value: "150", label: "Levels across 15 worlds" },
      { value: "220", label: "Tests over 28 files" },
      { value: "7", label: "Core mechanics" },
      { value: "13", label: "Scenes, 14 entity classes" },
    ],
    stack: [
      { label: "TypeScript (strict)", emphasis: true },
      { label: "Phaser 3", emphasis: true },
      { label: "Matter.js physics" },
      { label: "Vite" },
      { label: "Vitest" },
      { label: "Capacitor (Android)" },
      { label: "Web Audio API" },
    ],
    media: {
      image: "/projects/gravity-flow/gameplay.webp",
      alt: "GRAVITY FLOW gravity-well puzzle gameplay",
      fit: "contain",
      gallery: [
        { src: "/projects/gravity-flow/boss.webp", alt: "World boss encounter" },
        { src: "/projects/gravity-flow/gravity-run.webp", alt: "Endless Gravity Run mode" },
        { src: "/projects/gravity-flow/cosmetics.webp", alt: "Cosmetics collection screen" },
        { src: "/projects/gravity-flow/win.webp", alt: "Three-star level completion" },
      ],
    },
    caseStudy: {
      problem:
        "A one-touch game gives you exactly one input to work with, so everything rests on feel. Too weak and the star drifts uselessly; too strong and every level becomes a slingshot. And 150 levels is well past the point where hand-writing each one stays maintainable — the content had to become data before the count got there.",
      architecture:
        "Holding the screen spawns an inverse-square attractor in a Matter.js world; dragging steers it and releasing lets go. Levels are pure data: a LevelConfig carries optional fields for each of the seven mechanics — gravity zones, magnets, moving platforms, hazards, portals, one-way gates — so a new level is a config entry rather than a new scene. Fifteen worlds sit over contiguous level ranges, asserted in tests. Native-only integrations are isolated behind four seams so the web bundle never ships them.",
      decisions: [
        {
          title: "Data-driven levels, verified structurally",
          body: "Tests assert that world ranges are contiguous and that the last world ends exactly at the level count — so adding content can't silently create a gap. 163 level files exist and 150 are referenced; the retired 13 stay in the repo rather than being deleted, because a level that didn't work is useful information.",
        },
        {
          title: "Strict TypeScript as a content-scaling tool",
          body: "noUnusedLocals, noUnusedParameters and noFallthroughCasesInSwitch on top of strict, with tsc --noEmit gating CI before tests run. At 150 levels and 14 entity classes, the compiler is the only thing that scales with the content.",
        },
        {
          title: "Deterministic seeds for the endless mode",
          body: "Weekly runs derive from a shared seed so everyone races the same layout. The seed key is built from local calendar components, which means players in different time zones can straddle a rollover — a real edge case, flagged in the code rather than papered over.",
        },
        {
          title: "An economy that structurally cannot pay-to-win",
          body: "Five rarity tiers across six collections, with no gameplay-affecting fields in the cosmetic config at all, and endless-run payout capped at 60 Stardust. The constraint is in the type, not in a design doc.",
        },
      ],
      challenges: [
        "Tuning the gravity constant until the mechanic is learnable in one touch but still has a skill ceiling",
        "Making 15 boss encounters each teach something rather than just raise the difficulty",
        "Keeping AdMob, RevenueCat and Firebase out of the web bundle without forking the codebase",
        "Writing tests for a physics game, where the thing you actually care about is feel",
      ],
      learned: [
        "Content stops being code the moment there's more than about twenty of it",
        "Determinism is a design decision with gameplay consequences, not an implementation detail",
        "Wrapping one web codebase for native is cheap; the store paperwork around it is not",
        "Retiring content is easier when it's data — you unreference it instead of deleting it",
      ],
      honestNote:
        "This is at v1.0.0-rc and has not shipped to a store. It is Android-only — there is no iOS build. The leaderboard is localStorage, so it ranks you against yourself, not against other players.",
    },
  },
  {
    id: "job-assistant",
    name: "Job Assistant",
    tagline: "Seven job boards, one Telegram digest, and a deliberate refusal to auto-apply",
    summary:
      "A collect → filter → dedup → deliver pipeline over seven source adapters, including LinkedIn ingested from alert emails over IMAP rather than scraped.",
    description:
      "Pulls software-engineering postings from seven adapters, scores them against a deterministic rule engine of 310 filter terms, deduplicates across sources with different shapes, and delivers a single paginated Telegram digest whose job cards carry Save, Ignore, Open and Mark-Applied actions. It began as free GitHub Actions crons that committed SQLite back into the repo, and has since been rebuilt around one always-on process shipped as a Docker image.",
    context: "Solo build · 287 jobs collected over 61 runs",
    status: "local",
    accent: "blue",
    repoUrl: "https://github.com/taysh123/job-assistant",
    metrics: [
      { value: "7", label: "Source adapters" },
      { value: "162", label: "Tests" },
      { value: "310", label: "Filter terms, 8 lists" },
      { value: "1", label: "SQLite file as all state" },
    ],
    stack: [
      { label: "Python", emphasis: true },
      { label: "SQLite (WAL)", emphasis: true },
      { label: "Pydantic v2" },
      { label: "Telegram Bot API" },
      { label: "IMAP" },
      { label: "Docker" },
      { label: "GitHub Actions" },
      { label: "pytest" },
    ],
    caseStudy: {
      problem:
        "Job hunting is a polling problem wearing a motivation problem's clothes. The boards don't share a schema, half of them don't have an API, the good roles are gone in a day, and the tools that solve it want a subscription. This had to cost nothing to run and be reliable enough that missing a digest was noticeable.",
      architecture:
        "A registry of source adapters normalises seven very different inputs — REST APIs, RSS feeds, two ATS platforms, and LinkedIn — into one shape, then a pipeline of collect → filter → dedup → persist → deliver carries them to Telegram. All state lives in a single SQLite file in WAL mode: jobs, run history, and the bot's own paging position, so the digest is one message that edits in place rather than a new message per run. Pydantic v2 models validate config and every adapter's output at the boundary.",
      decisions: [
        {
          title: "LinkedIn via alert emails, not scraping",
          body: "Rather than fight a login wall, the adapter subscribes to LinkedIn's own job-alert emails and parses them over IMAP. It's slower and it's lossier — and it doesn't break every time the site ships a redesign, or violate anyone's terms.",
        },
        {
          title: "Deterministic filtering, no model in the hot path",
          body: "Ranking is 310 configured terms across eight lists plus explicit experience and geography gates. It's boring, it's auditable, and when a good role gets filtered out you can point at the exact rule and change it.",
        },
        {
          title: "A single concurrency group across scheduled jobs",
          body: "When this ran on GitHub Actions crons, three workflows shared one SQLite file. All three declare the same concurrency group with cancel-in-progress off, so runs queue rather than racing — and the commit step skips CI so the database write doesn't retrigger the pipeline.",
        },
        {
          title: "It never applies for you",
          body: "The AI layer will re-rank fit and draft a cover letter, under a hard cost cap and off by default. It will not submit anything. An automated application is a decision you can't take back, and the failure mode is silent.",
        },
      ],
      challenges: [
        "Deduplicating the same posting arriving from four sources with four different id schemes",
        "Working inside the platform's limits — Actions can't host a live bot, and Telegram allows exactly one getUpdates consumer",
        "Migrating from crons-committing-a-database to a single always-on process without losing collected history",
        "Keeping the AI layer genuinely optional, including its cost ceiling",
      ],
      learned: [
        "Designing to a platform's constraints beats fighting them — the cron architecture was free and worked for months",
        "An adapter registry is the right abstraction the moment source number three has a different shape",
        "Idempotency is what makes scheduled work safe to retry, and it has to be designed in, not bolted on",
        "The most useful automation is the kind that stops short of the irreversible step",
      ],
      honestNote:
        "The scheduled crons are now disabled — this runs as a Docker service. Of the 287 jobs collected so far, every row is still marked new, so the Save and Mark-Applied flows work but haven't yet been used in anger.",
    },
  },
  {
    id: "orders-delivery",
    name: "Orders & Delivery",
    tagline: "A hand-rolled client-server protocol over raw TCP, before frameworks",
    summary:
      "A multithreaded Java server speaking JSON over raw sockets to a JavaFX client, with pluggable shortest-path routing for delivery ETAs.",
    description:
      "A two-tier ordering and dispatch system built for an advanced Java course. A multithreaded server speaks a hand-written JSON-over-TCP protocol to a JavaFX desktop client, routing sixteen domain actions through a controller factory to a generic DAO layer. Delivery routing injects a shortest-path strategy over a weighted city graph to produce routes and ETAs.",
    context: "University coursework · HIT",
    status: "coursework",
    accent: "violet",
    repoUrl: "https://github.com/taysh123/orders-delivery-management-system",
    metrics: [
      { value: "16", label: "Protocol routes" },
      { value: "10", label: "Concurrent clients" },
      { value: "33", label: "Java source files" },
      { value: "4", label: "Domains, one DAO layer" },
    ],
    stack: [
      { label: "Java", emphasis: true },
      { label: "JavaFX 17 + FXML" },
      { label: "Raw TCP sockets", emphasis: true },
      { label: "Gson" },
      { label: "ExecutorService" },
      { label: "Java serialization" },
    ],
    caseStudy: {
      problem:
        "The assignment was to build an ordering and delivery system without leaning on a web framework — which turns out to be the useful version of the exercise. Every layer a framework normally hands you has to be written: the wire format, the request router, the concurrency model, and persistence.",
      architecture:
        "A ServerSocket accept loop hands connections to a fixed pool of ten threads. Each request carries an action header of the form domain/command, which a factory dispatches to one of four controllers; sixteen routes cover create, read, update and delete for each domain. Responses share one envelope type, so errors come back in the same shape as successes. A generic DAO persists entities through Java object serialization to flat files, and the delivery service takes its shortest-path implementation as an injected strategy over a weighted five-city graph.",
      decisions: [
        {
          title: "A shared request/response envelope",
          body: "Every exchange uses the same typed wrapper, and the handler catches exceptions and returns them in the response body rather than dropping the connection. One shape to parse on the client, whatever happened on the server.",
        },
        {
          title: "Routing as a pluggable strategy",
          body: "The delivery service depends on a shortest-path interface rather than a concrete Dijkstra implementation, so the algorithm can be swapped without touching the service. That seam is the part of this project worth keeping.",
        },
        {
          title: "Client-agnostic protocol",
          body: "Because the wire format is plain JSON over a socket rather than anything JavaFX-specific, the server has its own entry point and could be driven by a different client entirely.",
        },
      ],
      challenges: [
        "Designing a request format expressive enough to route sixteen actions without becoming RPC-by-string",
        "Keeping serialization stable as the entity model changed underneath it",
        "Separating controller, service and DAO cleanly enough that the layering survived the deadline",
      ],
      learned: [
        "What a web framework is actually doing for you — routing, serialization, error shapes, connection lifecycle",
        "That a thread pool is not a concurrency model on its own; shared mutable state needs a plan",
        "Dependency injection makes most sense the first time you swap the thing behind the interface",
      ],
      honestNote:
        "This is coursework and I'm listing it as such. It has no automated tests, and the DAO rewrites an entire entity file per save with no synchronisation — under the ten-thread pool, concurrent writes to the same domain would lose updates. The Dijkstra implementation itself was supplied with the assignment as a prebuilt library; the strategy seam around it is mine.",
    },
  },
];

/** Featured projects first, source order preserved within each group. */
export const orderedProjects = [
  ...projects.filter((p) => p.featured),
  ...projects.filter((p) => !p.featured),
];

export const featuredProject = projects.find((p) => p.featured) ?? projects[0];
