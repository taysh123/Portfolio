import type { ProjectStatus } from "@/components/ui/Tag";

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
  /**
   * Serve these pre-encoded WebPs as they are, not through the image optimiser. T Poker's tall phone captures
   * failed to load through `/_next/image` on the Vercel Preview while plain static files were delivered fine
   * (other static assets); the files are already small, so the optimiser adds a failure point, not value.
   */
  direct?: boolean;
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
  /**
   * The source repository. A private repository carries no URL at all — not here, and not anywhere else in
   * this public repository. Public surfaces read links through `publicRepoUrl()` and show
   * `PRIVATE_REPO_LABEL` in place of a private one.
   */
  repo: { visibility: "public"; url: string } | { visibility: "private" } | { visibility: "unavailable" };
  liveUrl?: string;
  liveLabel?: string;
  featured?: boolean;
  media?: ProjectMedia;
  stores?: StoreListing[];
  caseStudy: CaseStudy;
};

/** T Poker's live store listings (both published). The Play URL is the canonical listing, without the
 *  share link's `pcampaignid` tracking parameter. */
const T_POKER_IOS_URL = "https://apps.apple.com/us/app/t-poker-poker-trainer/id6781109023";
const T_POKER_ANDROID_URL = "https://play.google.com/store/apps/details?id=com.tpoker.app";

export const projects: Project[] = [
  {
    id: "poker",
    name: "T Poker",
    tagline: "A poker study platform and home-game manager, shipped from one codebase",
    summary:
      "Expo app, React web build, and an ASP.NET Core CQRS backend—with a settlement engine that closes a night in a short list of transfers, exact to the cent.",
    description:
      "Two products in one: a study platform with lessons, daily drills and an AI coach, and a home-game manager with a buy-in ledger, tournament clock and end-of-night settlement. One Expo codebase renders iOS, Android and the live web app; behind it sits an ASP.NET Core backend built on Clean Architecture with MediatR CQRS over PostgreSQL. On the device, the financial core runs in integer cents; the server stores money as fixed-point decimals.",
    context: "Solo build",
    status: "live",
    featured: true,
    repo: { visibility: "private" },
    liveUrl: "https://app.tpoker.app/",
    liveLabel: "Open the app",
    stores: [
      { platform: "ios", status: "live", url: T_POKER_IOS_URL },
      { platform: "android", status: "live", url: T_POKER_ANDROID_URL },
    ],
    // M10: the test and CI-job counts came from the private repository, which a reader can't check; they are gone.
    metrics: [
      { value: "3", label: "Targets from one codebase" },
      { value: "2", label: "Store listings, both live" },
    ],
    stack: [
      { label: "TypeScript", emphasis: true },
      { label: "Expo / React Native" },
      { label: "react-native-web" },
      { label: "C# / ASP.NET Core 8 (REST)", emphasis: true },
      { label: "MediatR (CQRS)" },
      { label: "EF Core 8" },
      { label: "PostgreSQL" },
      { label: "JWT" },
      { label: "Jest + xUnit" },
      { label: "GitHub Actions" },
      { label: "Docker" },
      { label: "Railway (API) · Vercel (web)" },
    ],
    media: {
      image: "/projects/poker/home.webp",
      alt: "T Poker home screen—cash game or tournament",
      fit: "contain",
      direct: true,
      gallery: [
        { src: "/projects/poker/tournament-live.webp", alt: "Live tournament dashboard with blind clock" },
        { src: "/projects/poker/podium.webp", alt: "Tournament results podium" },
        { src: "/projects/poker/final-count.webp", alt: "Guided end-of-night settlement" },
        { src: "/projects/poker/stats.webp", alt: "Lifetime statistics and profit/loss" },
      ],
    },
    caseStudy: {
      problem:
        "A home poker night ends with six people, a pile of chips and an argument about who owes whom. Doing it by hand produces a tangle of small transfers and, sooner or later, an off-by-a-cent dispute. The interesting problem isn't the UI—it's keeping the money exact to the cent, including in a guest game run entirely on a phone with no signal.",
      architecture:
        "One Expo/React Native codebase renders iOS, Android and the live web app through react-native-web. Behind it, an ASP.NET Core 8 API is split into four Clean Architecture projects with MediatR carrying commands and queries separately over EF Core and PostgreSQL. Guest mode runs an entire game on-device against AsyncStorage—schema-versioned, with corruption quarantine that never wipes existing data—and accounts add server-backed group games and lifetime stats. Billing sits behind one verifier interface with five implementations—Apple, Google Play, a dispatcher between the two, a development mock, and a fail-closed disabled mode—so the payment provider is a swappable detail rather than a dependency.",
      decisions: [
        {
          title: "Exact money, never floats",
          body: "The settlement engine is a greedy two-pointer debt matcher: it pairs the largest debtor with the largest creditor until everyone is square. On the device it runs entirely in integer cents, so transfers are exact by construction; the server uses fixed-point decimal(18,2), exact to the cent.",
        },
        {
          title: "The algorithm implemented twice, on purpose",
          body: "The same settlement logic exists in C# on the server and TypeScript on the device. That's deliberate duplication: the device has to close a game with no network, and the server has to be authoritative. One shared fixture file runs through both Jest and xUnit, so a divergence shows up as a failing test rather than a wrong payout.",
        },
        {
          title: "Largest-remainder payouts with a deterministic tiebreak",
          body: "Prize splits floor each raw share, then distribute the leftover cents by descending fractional part with the index as tiebreak. Same input, same output, every time—which matters when the payout is being read aloud at a table.",
        },
        {
          title: "Local-first guest mode",
          body: "A full game runs with no sign-up. Accounts are an upgrade path, not a gate—which is the difference between a tool people use and one they install once.",
        },
      ],
      challenges: [
        "Keeping two implementations of the money math in agreement across two languages and two runtimes",
        "Modelling a real tournament director—editable blind structures, a pause/resume clock, rebuys and late registration—as software that survives a chaotic table",
        "Guest → account upgrade: an invite link opened while signed out is completed after sign-in, and guest progress carries into the new account",
        "Making a utility feel like a product, without letting the polish hide the state it's actually in",
      ],
      learned: [
        "Where duplicating logic beats sharing it—correctness across a network boundary is worth more than DRY",
        "CQRS pays off when reads and writes have genuinely different shapes, and costs you when they don't",
        "Shipping one codebase to web and native means designing for the *narrowest* platform first",
        "End-to-end ownership: schema, API, two clients, CI, and the release paperwork nobody warns you about",
      ],
      honestNote:
        "Everything shown is live: the web app, the App Store build and the Google Play build.",
    },
  },
  {
    id: "aegis",
    name: "Aegis",
    tagline: "A security operations centre organised into eight modules, with explicit code boundaries and a shared PostgreSQL schema",
    summary:
      "Eight bounded contexts across 27 .NET projects with zero project references between modules—events flow ingestion → detection → alert over RabbitMQ, then are scored and streamed live to the dashboard in parallel.",
    description:
      "A self-hosted SOC platform modelled on the tools it imitates. Security events move through an ingestion → normalisation → detection pipeline carried by MassTransit over RabbitMQ, backed by PostgreSQL (events in a range-partitioned table) and Redis, which holds the detection windows. Every alert detection raises fans out to two consumers at once: threat scoring, and alerting, which streams it live to the Next.js dashboard over SignalR. The whole stack comes up from one launcher script that mints its own RS256 keys and starts everything under Docker Compose.",
    context: "Solo build",
    status: "local",
    featured: true,
    repo: { url: "https://github.com/taysh123/aegis", visibility: "public" },
    metrics: [
      { value: "8", label: "Bounded contexts" },
      // M9: a ProjectReference scan of all 81 references finds none from one module to another.
      { value: "0", label: "Project references between modules" },
      // 82 [Fact] + 24 [InlineData] rows = 106 cases, minus the placeholder Solution_Compiles. No CI yet, so no
      // "passing" claim.
      { value: "105", label: "Test cases, incl. 2 Testcontainers" },
      { value: "1", label: "Command to run it all" },
    ],
    stack: [
      { label: "C# / .NET 10", emphasis: true },
      { label: "ASP.NET Core (REST)" },
      { label: "MassTransit + RabbitMQ", emphasis: true },
      { label: "PostgreSQL 16" },
      { label: "Redis" },
      { label: "SignalR" },
      { label: "EF Core" },
      { label: "Next.js 15 · TypeScript" },
      { label: "Tailwind CSS" },
      { label: "Clean Architecture (per module)" },
      { label: "JWT (RS256)" },
      { label: "xUnit + Testcontainers" },
      { label: "Docker Compose" },
    ],
    media: {
      // Captured from the live application (Aegis v0.8.1, synthetic demo data). Only a crop of the Incidents board is
      // public: the other captures show a seeded placeholder agent ID, the mock provider's text (and a 0–1 threat score
      // printed as /100), or a diagram that overstates the system; two of the board's four seeded incidents carry
      // technique tags that contradict their titles. scripts/m10-images.mjs cuts this file (AEGIS_BOARD).
      image: "/projects/aegis/incident-board-open.webp",
      alt: "The Aegis Incidents page, which groups related alerts and works them open → investigating → resolved: the Open column's first incident, “Privilege escalation on workstation”, severity 80, high, one alert, MITRE T1548",
      fit: "cover",
    },
    caseStudy: {
      problem:
        "Security tooling is where architecture claims go to die: everything starts as clean modules and ends as a monolith with shared tables. The goal here was to build a real detection pipeline and then keep the module boundaries honest—no module may reference another module's code.",
      architecture:
        "Eight bounded contexts—ingestion, detection, threat scoring, alerts, incidents, agents, auth, analysis—each split into Domain, Application and Infrastructure projects across 27 .csproj files. No module references another module's code: of 81 project references, none crosses a module. The event pipeline runs over RabbitMQ, through message contracts in a shared kernel, and the API host composes the other modules in process. Each module has its own DbContext, but all of them share one PostgreSQL schema (four modules map the alerts table, and threat scoring updates it directly)—the main coupling to separate before extracting services. PostgreSQL holds normalised events in a range-partitioned table with a GIN index over the JSONB payload; Redis carries the SignalR backplane, the detection windows and alert deduplication.",
      decisions: [
        {
          title: "Boundaries a scan can check",
          body: "A scan of every ProjectReference across all 27 projects finds zero module-to-module edges, so no module can call another's code. The shared database tables are the remaining coupling, and the next step is an architecture test in CI so the boundary can't quietly erode.",
        },
        {
          title: "Detection windows in Redis instead of buffered events",
          body: "Brute-force and port-scan detection need counts over a time window. Rather than hold events in memory, the detectors keep their windows in Redis—counters for brute force, and a HyperLogLog per source for distinct ports—so memory stays bounded whatever the event rate, and the state survives a restart. A HyperLogLog estimates distinct ports per source in fixed 60-second windows, and the port-scan rule fires when the estimate reaches 20.",
        },
        {
          title: "A score that keeps its inputs",
          body: "Score = (severity ÷ 100) × MITRE weight × (1 − false-positive rate), clamped to 0–1. The MITRE weight is set per technique, higher for techniques that are harder to detect, and averaged when an alert maps to several. The calculator returns a breakdown record carrying all three inputs, ready to surface to an analyst. The dashboard doesn't show the breakdown yet; surfacing it is the next step.",
        },
        {
          title: "Agent ingestion authenticated by body HMAC",
          body: "Agents sign the request body with an HMAC; the API verifies it in constant time (there is no timestamp or replay protection yet). Only the API holds the RS256 private key, refresh tokens are 64 bytes of CSPRNG stored SHA-256-hashed and rotated single-use.",
        },
      ],
      challenges: [
        "Keeping eight contexts genuinely independent while a single event still has to traverse four of them",
        "Making detection state bounded—a SOC that OOMs under load is worse than no SOC",
        "Mapping detectors onto MITRE ATT&CK techniques so scores mean something outside this codebase",
        "Making first run reproducible: generated secrets, RS256 keys, health gating and idempotent seed data from one launcher script",
      ],
      learned: [
        "Architecture claims are only worth what you can mechanically verify—so verify them in CI, or at least in a script",
        "Event-driven systems are easy to write and hard to observe; the retry ladder and the audit timeline mattered more than the pipeline itself",
        "Designing a modular monolith you could split later is a different exercise from designing microservices you'll never need",
        "Writing your own audit document, listing what you didn't finish, is the most useful file in the repo",
      ],
      honestNote:
        "The optional \"AI analysis\" mode is a deterministic C# template provider behind a swappable interface—no model is called and no external provider is implemented. There is also no CI pipeline yet, despite the testing strategy document specifying one.",
    },
  },
  {
    id: "developeros",
    name: "DeveloperOS",
    tagline: "A local-first code workspace that refuses to answer without evidence",
    summary:
      "Indexes your own projects into SQLite FTS5 and answers with file:line citations—363 tests, 34 decision records, and zero runtime dependencies.",
    description:
      "Point it at your code and it builds a private FTS5 index that powers ranked search and grounded question-answering, where every response cites real file and line locations and the system declines outright when the index doesn't support an answer. It ships as one Python package with no runtime dependencies, reachable four ways—CLI, browser dashboard, installable PWA, or a standalone Windows desktop window with a per-user installer.",
    context: "Solo build · v1.0.0 in 11 days",
    status: "released",
    featured: true,
    repo: { url: "https://github.com/taysh123/DeveloperOS", visibility: "public" },
    metrics: [
      // 363 `def test_` in 18 files; CI: ubuntu/windows × Python 3.11–3.13.
      { value: "363", label: "Tests, CI on Linux and Windows" },
      // pyproject.toml: dependencies = []; React and htm are vendored.
      { value: "0", label: "Python runtime dependencies" },
      { value: "34", label: "Decision records" },
      { value: "6", label: "CI matrix combinations" },
    ],
    stack: [
      { label: "Python 3.11+", emphasis: true },
      { label: "SQLite FTS5 (bm25)", emphasis: true },
      { label: "stdlib http.server" },
      { label: "JavaScript · React + htm (vendored)" },
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
        { src: "/projects/developeros/career.webp", alt: "Career tools—leads, CV match, interview prep" },
        { src: "/projects/developeros/hero.webp", alt: "DeveloperOS desktop window" },
      ],
    },
    caseStudy: {
      problem:
        "Tools that answer questions about your codebase have one failure mode that matters: confidently making something up. A wrong citation is worse than no answer, because it costs you the time to discover it was wrong. The design constraint was therefore inverted—build the refusal path first, and let answering be the thing that has to earn its way in.",
      architecture:
        "A scan hashes each file and compares it against the stored index hash, so unchanged files short-circuit and re-indexing stays incremental. Content lands in an eight-table SQLite schema with one FTS5 index ranked with BM25. Retrieval runs before generation, and if it comes back empty the answer function returns an insufficient-evidence message without ever calling a provider. The dashboard is served over a loopback-only HTTP API and the same package also exposes 24 CLI commands and an installable PWA.",
      decisions: [
        {
          title: "Zero runtime dependencies",
          body: "Everything is Python's standard library—http.server, sqlite3, urllib. No pip install step, no dependency CVEs, no supply chain. The frontend is React plus htm vendored directly into the repo: no npm, no build step, no CDN, a 1,595-line SPA that just loads.",
        },
        {
          title: "Refusal as a first-class code path",
          body: "The Q&A module returns its insufficient-evidence response before the provider is ever reached. It isn't a prompt instruction the model may ignore—it's a branch it cannot get past.",
        },
        {
          title: "Loopback API hardened like a public one",
          body: "A per-instance CSRF token compared with hmac.compare_digest, an Origin allowlist pinned to 127.0.0.1 on the bound port, JSON-only content types, a 64 KB body cap, and no CORS headers anywhere. A network audit of every import capable of opening a socket returns exactly two call sites, both loopback.",
        },
        {
          title: "One codebase, four delivery shapes",
          body: "CLI, browser dashboard, installable PWA, and a PyInstaller desktop window with an Inno Setup per-user installer that needs no admin rights. Deliberately no service worker—the backend is a local process, so offline caching would only lie about availability.",
        },
      ],
      challenges: [
        "Making incremental re-indexing correct—the hash comparison has to be conservative or you serve stale citations",
        "Shipping a Python app as a Windows desktop experience with a clean uninstall and no elevation",
        "Keeping 22 secret-file exclusion patterns ahead of what people actually leave lying around in a repo",
        "Designing privacy as an architectural property rather than a settings toggle",
      ],
      learned: [
        "Grounded retrieval earns trust by refusing—the decline path is the feature, not the fallback",
        "A high test-to-source ratio is only useful if the tests encode behaviour you'd otherwise argue about",
        "Writing a decision record at the moment of the decision is worth more than documenting it afterwards",
        "Zero dependencies is a constraint that keeps paying: no upgrades, no audit noise, no broken installs",
      ],
      honestNote:
        "The default AI provider is an explicit offline mock—retrieval, grounding and citations are real, but natural-language answer prose only appears if you opt in to a local Ollama daemon. The shipped binaries are unsigned, so Windows SmartScreen will ask for confirmation.",
    },
  },
  {
    id: "gravity-flow",
    name: "GRAVITY FLOW",
    tagline: "One touch, 150 levels across 15 worlds, built around a gravity well you place yourself",
    summary:
      "A Phaser 3 puzzler in strict TypeScript—hold to create a gravity well, 15 worlds, 1,277 CI-checked tests across progression, saves and purchases.",
    description:
      "Press and hold to spawn an inverse-square gravity well and pull a lost star home. 150 data-driven levels across 15 worlds build on seven core mechanics, alongside a deterministic seeded endless mode and a cosmetics economy whose items are visual only: no purchase changes gameplay. Built on Phaser 3 with strict TypeScript, and a Vitest suite over progression, saves and purchases.",
    context: "Solo build",
    status: "rc",
    repo: { url: "https://github.com/taysh123/Gravity-Game", visibility: "public" },
    stores: [
      { platform: "android", status: "soon" },
    ],
    metrics: [
      { value: "150", label: "Levels across 15 worlds" },
      // The repo's facts block, generated from vitest on a green run and checked by CI (2026-10-08).
      { value: "1,277", label: "CI-checked tests, 61 files" },
      { value: "7", label: "Core mechanics" },
      { value: "14", label: "Scenes, 14 entity classes" },
    ],
    stack: [
      { label: "TypeScript (strict)", emphasis: true },
      { label: "Phaser 3", emphasis: true },
      { label: "Matter.js physics" },
      { label: "Vite" },
      { label: "Vitest" },
      { label: "Capacitor (Android)" },
      { label: "Firebase (Analytics, Crashlytics)" },
      { label: "GitHub Actions" },
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
        "A one-touch game gives you exactly one input to work with, so everything rests on feel. Too weak and the star drifts uselessly; too strong and every level becomes a slingshot. And 150 levels is well past the point where hand-writing each one stays maintainable—the content had to become data before the count got there.",
      architecture:
        "Holding the screen spawns an inverse-square attractor in a Matter.js world; dragging steers it and releasing lets go. Levels are pure data: a LevelConfig carries optional fields for each of the seven mechanics—gravity zones, magnets, moving platforms, hazards, portals, one-way gates—so a new level is a config entry rather than a new scene. Fifteen worlds sit over contiguous level ranges, asserted in tests. Native-only integrations are isolated behind four seams so the web bundle never ships them.",
      decisions: [
        {
          title: "Data-driven levels, verified structurally",
          body: "Tests assert that world ranges are contiguous and that the last world ends exactly at the level count—so adding content can't silently create a gap. 163 level files exist and 150 are referenced; the retired 13 stay in the repo rather than being deleted, because a level that didn't work is useful information.",
        },
        {
          title: "Strict TypeScript as a content-scaling tool",
          body: "noUnusedLocals, noUnusedParameters and noFallthroughCasesInSwitch on top of strict, with tsc --noEmit gating CI before tests run. At 150 levels and 14 entity classes, the compiler is the only thing that scales with the content.",
        },
        {
          title: "Deterministic seeds for the endless mode",
          body: "Weekly runs derive from a shared seed so everyone races the same layout. The seed key is built from local calendar components, which means players in different time zones can straddle a rollover—a real edge case, flagged in the code rather than papered over.",
        },
        {
          title: "A cosmetics-only economy",
          body: "Five rarity tiers across six collections. Cosmetic items are defined by visual fields only, every purchase grants cosmetics or ad removal, and the endless-run payout is capped at 60 Stardust—so nothing in the store changes gameplay.",
        },
      ],
      challenges: [
        "Tuning the gravity constant until the mechanic is learnable in one touch but still has a skill ceiling",
        "Making 15 boss encounters each teach something rather than just raise the difficulty",
        "Keeping AdMob, RevenueCat and Firebase out of the web bundle without forking the codebase",
        "Writing tests for a game, where the thing you actually care about is feel",
      ],
      learned: [
        "Content stops being code the moment there's more than about twenty of it",
        "Determinism is a design decision with gameplay consequences, not an implementation detail",
        "Wrapping one web codebase for native is cheap; the store paperwork around it is not",
        "Retiring content is easier when it's data—you unreference it instead of deleting it",
      ],
      honestNote:
        "This is at v1.0.0-rc and has not shipped to a store. It builds for Android and the web—there is no iOS build. The leaderboard is localStorage, so it ranks you against yourself, not against other players.",
    },
  },
  {
    id: "job-assistant",
    name: "Job Assistant",
    tagline: "Seven job sources, one Telegram digest, and a deliberate refusal to auto-apply",
    summary:
      "Collects listings from seven source adapters, then filters and deduplicates them before delivery. LinkedIn data comes from alert emails over IMAP—not page scraping.",
    description:
      "Pulls software-engineering postings from seven adapters, scores them against a deterministic rule engine of 310 filter terms, deduplicates across sources with different shapes, and delivers a single paginated Telegram digest whose job cards carry Save, Ignore, Open and Mark-Applied actions. It began as free GitHub Actions crons that committed SQLite back into the repo, and has since been rebuilt around one always-on process that runs in a Docker container.",
    context: "Solo build · Snapshot (June 2026): 287 job listings collected across 57 runs",
    status: "local",
    repo: { url: "https://github.com/taysh123/job-assistant", visibility: "public" },
    metrics: [
      { value: "7", label: "Source adapters" },
      { value: "162", label: "Tests" },
      { value: "310", label: "Filter terms, 7 lists" },
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
        "A registry of source adapters normalises seven very different inputs—REST APIs, RSS feeds, three ATS platforms, and LinkedIn—into one shape, then a pipeline of collect → filter → dedup → persist → deliver carries them to Telegram. All state lives in a single SQLite file in WAL mode: jobs, run history, and the bot's own paging position, so the digest is one message that edits in place rather than a new message per run. Pydantic v2 models validate config and every adapter's output at the boundary.",
      decisions: [
        {
          title: "LinkedIn via alert emails, not scraping",
          body: "Rather than fight a login wall, the adapter subscribes to LinkedIn's own job-alert emails and parses them over IMAP. It's slower and it's lossier—and it doesn't break every time the site ships a redesign, or violate anyone's terms.",
        },
        {
          title: "Deterministic filtering, no model in the hot path",
          body: "Ranking is 310 configured terms across seven lists plus explicit experience and geography gates. It's boring, it's auditable, and when a good role gets filtered out you can point at the exact rule and change it.",
        },
        {
          title: "A single concurrency group across scheduled jobs",
          body: "When this ran on GitHub Actions crons, three workflows shared one SQLite file. All three declare the same concurrency group with cancel-in-progress off, so runs queue rather than racing—and the commit step skips CI so the database write doesn't retrigger the pipeline.",
        },
        {
          title: "It never applies for you",
          body: "The AI layer will re-rank fit and draft a cover letter, under a hard cost cap and off by default. It will not submit anything. An automated application is a decision you can't take back, and the failure mode is silent.",
        },
      ],
      challenges: [
        "Deduplicating the same posting arriving from four sources with four different id schemes",
        "Working inside the platform's limits—Actions can't host a live bot, and Telegram allows exactly one getUpdates consumer",
        "Migrating from crons-committing-a-database to a single always-on process without losing collected history",
        "Keeping the AI layer genuinely optional, including its cost ceiling",
      ],
      learned: [
        "Designing to a platform's constraints beats fighting them—the cron architecture was free and worked for months",
        "An adapter registry is the right abstraction the moment source number three has a different shape",
        "Idempotency is what makes scheduled work safe to retry, and it has to be designed in, not bolted on",
        "The most useful automation is the kind that stops short of the irreversible step",
      ],
      honestNote:
        "The scheduled crons are now disabled—this runs as a Docker service. Of the 287 jobs collected by June 2026, every row is still marked new, so the Save and Mark-Applied flows work but haven't yet been used in anger.",
    },
  },
  {
    id: "orders-delivery",
    name: "Orders & Delivery",
    tagline: "A hand-rolled client-server protocol over raw TCP sockets, before frameworks",
    summary:
      "A multithreaded Java server exchanges JSON with a JavaFX client over TCP sockets. Delivery ETAs use pluggable shortest-path routing.",
    description:
      "A two-tier ordering and dispatch system built for an advanced Java course. A multithreaded server speaks a hand-written JSON protocol over TCP sockets to a JavaFX desktop client, routing sixteen domain actions through a controller factory to a generic DAO layer. Delivery routing injects a shortest-path strategy over a weighted city graph to produce routes and ETAs.",
    context: "University coursework",
    status: "coursework",
    repo: { visibility: "unavailable" },
    metrics: [
      { value: "16", label: "Protocol routes" },
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
        "The assignment was to build an ordering and delivery system without leaning on a web framework—which turns out to be the useful version of the exercise. Every layer a framework normally hands you has to be written: the wire format, the request router, the concurrency model, and persistence.",
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
        "What a web framework is actually doing for you—routing, serialization, error shapes, connection lifecycle",
        "That a thread pool is not a concurrency model on its own; shared mutable state needs a plan",
        "Dependency injection makes most sense the first time you swap the thing behind the interface",
      ],
      honestNote:
        "This is coursework, built as a two-person course submission, and I'm listing it as such. It has no automated tests, and the DAO rewrites an entire entity file per save with no synchronisation—under the ten-thread pool, concurrent writes to the same domain would lose updates. The Dijkstra implementation itself was supplied with the assignment as a prebuilt library; the strategy seam around it is the project's own.",
    },
  },
];

/** The label public surfaces show in place of a private repository's link. Not clickable. */
export const PRIVATE_REPO_LABEL = "Private repository";
/** For a repository that anonymous visitors can't reach (private or removed — indistinguishable from outside). */
export const UNAVAILABLE_REPO_LABEL = "Source not publicly accessible";

/** What to show instead of a source link, or undefined when there is a public link. */
export function repoLabel(p: Pick<Project, "repo">): string | undefined {
  return p.repo.visibility === "private" ? PRIVATE_REPO_LABEL : p.repo.visibility === "unavailable" ? UNAVAILABLE_REPO_LABEL : undefined;
}

/** The repository link a visitor may follow — undefined when the repository is private. */
export function publicRepoUrl(p: Pick<Project, "repo">): string | undefined {
  return p.repo.visibility === "public" ? p.repo.url : undefined;
}
