<!--
CANONICAL CONTEXT — verified facts, source of truth for project claims.
Resolved decisions (2026-11-18): the institution is NOT named on the site, not even abbreviated;
featured projects = T Poker, Aegis, DeveloperOS, GRAVITY FLOW. Correct names:
Aegis (not SentinelAI), GRAVITY FLOW (not Gravity Game). Re-validate every fact
against the actual local repo before publishing it on the site.
-->

# Portfolio — Project Context & Working Brief

**Owner:** Tay Shofer  
**Production website:** https://www.tayshofer.dev/  
**Public portfolio repository:** https://github.com/taysh123/Portfolio  
**Repository default branch observed in public repo:** `main`  
**Purpose:** Maintain, improve, and evolve the existing live software-engineering portfolio without compromising its design, accuracy, accessibility, performance, or production stability.

> This document is a starting context summary based on the public repository and project information reviewed on 2026-11-18. The local project folder is the source of truth for local work. Always inspect the actual local files, git state, and deployed site before making decisions. Do not assume that the local folder, public GitHub repository, and production deployment are identical.

---

## 1. Owner and career positioning

Tay is a Computer Science B.Sc. graduate (2026), based in Israel, looking for a software-engineering opportunity. The current site positions him broadly as a **Software Engineer** who builds software end to end, across interfaces, mobile apps, backend systems, developer tools, security systems, and interactive products.

The current site intentionally does not name the academic institution. Do not add or guess an institution. Do not invent employment history, users, revenue, downloads, customers, production usage, performance figures, test counts, or project capabilities.

The website's current central message is:

- Headline: `I build software end to end.`
- Supporting line: `Mobile apps, security systems, developer tools, and games—from interface to infrastructure.`
- Career message: available for software-engineering roles, on-site, hybrid, or remote.

The site is English-only. The retired `/he` path redirects to `/`.

## 2. Website status and technical stack

The website is already live at https://www.tayshofer.dev/. This is an existing product, not a greenfield website. Preserve the production experience and its established design direction.

From the reviewed repository README and package metadata:

- Next.js 16.4.6, App Router, React 19.2.4
- TypeScript 5, strict typing
- Tailwind CSS v4 and CSS custom properties/design tokens
- Geist through `next/font`
- Framer Motion is used only in selected lazy-loaded overlays/panels
- Vitest for unit/content/token tests
- Playwright for end-to-end, accessibility, and performance-budget checks
- Vercel deployment
- Optional server-side portfolio assistant using `GROQ_API_KEY`; the key must never be exposed to the browser

Important architecture and implementation notes from the README:

- `app/page.tsx` composes the main page: `Hero → Work → About → Stack → ThinkBuildShip → Contact`.
- `app/globals.css` contains the design-token system.
- `data/` contains projects, work narratives, skills, socials, proof data, and other site content.
- `components/sections/` contains the main sections.
- `components/work/` contains the project chapters and case-study host.
- `components/layout/` contains navigation and footer.
- `components/chat/` contains the portfolio assistant interface.
- `app/api/chat/route.ts` contains the assistant backend.
- `public/work/` contains project media.
- `public/resume/` contains the résumé PDF.

Use the actual local folder to confirm the present structure; these paths describe the repository structure observed during the review and may have changed.

## 3. Design direction and UX principles

The current design direction is an editorial product studio called **Product Plates**:

- The page uses a light paper-like base by default, with dark theme as a visitor option.
- Four flagship projects each have a distinct visual surface/identity: T Poker (navy/gold), Aegis (steel), DeveloperOS (violet), and GRAVITY FLOW (teal).
- Real captures from the products are preferred over invented UI or decorative mockups.
- The design should feel deliberate, premium, calm, and product-focused—not like a generic developer template.
- The current experience deliberately avoids a heavy WebGL scene, a scroll library, and pinned scrolling scenes.
- The main page should remain easy to scan and should not force the visitor to wait through a cinematic introduction.
- Keep responsive behavior, accessible focus states, keyboard usability, and reduced-motion support.

The site includes light/dark theme support and accessibility modes such as reduced motion, high contrast, and larger text. The README documents accessibility and performance tests; verify the current tests before modifying these areas.

## 4. Projects presented on the website

The site presents four flagship projects followed by two additional projects. Keep their statuses and limitations accurate.

### 4.1 T Poker — flagship product

**Status:** Live on the web, App Store, and Google Play.  
**Source repository:** Private. Do not invent or expose a GitHub URL for its private source.

A poker study platform and home-game manager built from one Expo/React Native codebase for iOS, Android, and web, with an ASP.NET Core 8 backend.

Key engineering facts from the reviewed project data:

- C# / ASP.NET Core 8 backend with Clean Architecture and MediatR CQRS
- EF Core and PostgreSQL
- React Native / Expo and `react-native-web`
- Guest mode supports running a game locally, including offline
- Money is represented as integer cents on-device and fixed-point decimal on the server
- Settlement algorithm is a greedy two-pointer debt matcher; do not claim it minimizes the number of transfers
- The settlement logic exists in C# and TypeScript, with shared fixtures used by Jest and xUnit
- Prize splits use a largest-remainder approach with a deterministic tie-break

Do not claim cross-device sync on reconnect unless verified in the actual code. Do not describe billing as interchangeable payment providers. T Poker is the most direct proof that Tay has designed, built, and shipped a real product.

### 4.2 Aegis — security operations platform

**Status:** Runs locally; source is public.  
**Repository:** https://github.com/taysh123/aegis

A self-hosted SOC-style platform with a modular-monolith architecture and an event ingestion/detection/alerting pipeline.

Key facts from the reviewed source and project documentation:

- Eight bounded contexts: Auth, Agents, Ingestion, Detection, Alerts, Incidents, ThreatScoring, and AiAnalysis
- 27 .NET project files
- No direct project references between modules in the reviewed architecture scan
- The API host composes modules in-process; this is a modular monolith, not a set of independently deployed microservices
- RabbitMQ and MassTransit carry events
- PostgreSQL stores data; Redis supports detection windows, deduplication, and SignalR backplane functionality
- SignalR streams alerts to the dashboard
- Agent request bodies are authenticated with HMAC; there is no timestamp/replay protection yet
- JWT uses RS256
- Project data records 105 test cases, including two Testcontainers cases
- No CI pipeline was present in the reviewed project data
- The optional AI Analysis provider is a deterministic template/mock provider; no external LLM is called
- The modules have separate DbContexts but share one PostgreSQL schema; that shared database is an acknowledged coupling

Be explicit about the limitations. Never describe Aegis's current AI analysis as a real LLM integration. Never call it production-deployed unless the local repo and deployment evidence prove that status.

### 4.3 DeveloperOS — local-first developer tool

**Status:** Released, v1.0.0.  
**Repository:** https://github.com/taysh123/DeveloperOS

A local-first code workspace that indexes a developer's own repositories and answers questions grounded in indexed source files.

Key facts from the reviewed project data:

- Python package with zero Python runtime dependencies
- SQLite FTS5 and BM25 ranking
- File-and-line citations for retrieved evidence
- Incremental indexing based on file hashes
- CLI, browser dashboard, installable PWA, and Windows desktop distribution
- 363 tests, CI across Linux and Windows / Python 3.11–3.13, six CI matrix combinations
- 34 decision records
- The default AI provider is an offline mock. Natural-language generation requires an optional local Ollama daemon.
- The system can decline to answer when indexed evidence is insufficient, before calling a provider
- Shipped Windows binaries are unsigned; Windows SmartScreen may warn users

Do not represent it as a hosted cloud AI service or imply that a real LLM is called by default.

### 4.4 GRAVITY FLOW — physics puzzle game

**Status:** Release candidate; not yet published in an app store.  
**Repository:** the private GRAVITY FLOW repository (owner decision 2026-11-18: it stays private). The site marks it private like T Poker and links no source; the served résumé no longer links it (PR #5).

A one-touch gravity puzzle game built using Phaser 3, Matter.js, Vite, and strict TypeScript.

Key facts from the reviewed project data:

- 150 levels across 15 worlds
- Seven core mechanics
- 1,277 CI-checked tests across 61 files
- Web and Android builds; no iOS build
- Android release candidate, not yet published on Google Play
- Cosmetics/ad-removal purchases only; purchases do not change gameplay
- The leaderboard uses localStorage and is local, not a global multiplayer leaderboard

Do not claim the game is already published or has a global competitive leaderboard.

### 4.5 Job Assistant — additional project

**Status:** Runs locally as a Docker service.  
**Repository:** https://github.com/taysh123/job-assistant

A job-posting aggregation and filtering pipeline with seven source adapters, deterministic filtering, deduplication, SQLite persistence, and Telegram delivery.

Project data records:

- Seven source adapters
- 310 filter terms across seven populated lists
- 162 tests
- June 2026 snapshot: 287 job listings across 57 runs
- LinkedIn ingestion is based on job-alert emails through IMAP, not page scraping
- Scheduled GitHub Actions crons are disabled; current mode is a Docker service
- The saved snapshot's jobs are all still marked `new`; do not imply that Save/Applied workflows have been used extensively

### 4.6 Orders & Delivery — academic coursework

A Java/JavaFX client-server application using a hand-written JSON protocol over raw TCP sockets, a multithreaded server, and shortest-path routing for delivery ETAs.

- Academic coursework
- 16 protocol routes
- Four domains and a generic DAO layer
- Source repository is not publicly accessible

Do not present this as commercial or production software.

## 5. Existing website features to preserve

- Four flagship product chapters and two additional projects
- Case-study panels that load on demand
- Project-specific walkthroughs and technical explanations
- Stack section grouped by engineering discipline, with a project filter
- Think / Build / Ship section with evidence from real projects
- Contact links: email, LinkedIn, GitHub
- Downloadable résumé PDF
- Privacy page
- Optional portfolio AI assistant
- Theme and accessibility controls

The portfolio assistant is a supporting feature, not the main selling point. Its prompts and claims must remain aligned with `data/projects.ts` and other authoritative site content. Keep the Groq API key server-side only.

## 6. SEO, privacy, security, and performance notes

The reviewed source includes:

- Metadata, canonical URL, Open Graph and Twitter social card metadata
- `robots.ts` and `sitemap.ts`
- Security headers in `proxy.ts`, including CSP, HSTS, `X-Content-Type-Options`, frame restrictions, and referrer policy
- A privacy page documenting assistant/provider handling, hosting logs, preference cookies, and the absence of analytics/tracking
- Chat API rate limiting, message/body limits, role validation, duplicate-request checks, and a provider timeout
- A first-load JavaScript gzip budget of 205.7 KiB and HTML budget of 568 KB in the reviewed E2E test
- Lazy loading for the case-study panel, accessibility panel, and chat panel

Treat these as existing design constraints. Do not weaken headers, remove privacy disclosures, expose secrets, add analytics/tracking, or increase first-load payloads without an explicit reason and a measured review.

The root layout reads cookies to render theme/accessibility preferences on the first paint, which opts the main route out of static generation. This is a documented tradeoff; do not change it casually.

## 7. Local development and validation commands

The repository README documents the following commands. First inspect `package.json`, README, lockfile, and local environment to confirm they remain valid:

```bash
npm ci
npm run dev
npm run build
npm start
npm run typecheck
npm run lint
npm test
npx playwright test
```

Playwright E2E tests require a production build and a Chromium installation. Prefer targeted tests during iteration, followed by the relevant full suite and production build before declaring completion.

## 8. Working agreement for Claude

Act as a senior software engineer, architect, UX-minded product engineer, and careful reviewer. Tay is the product owner and final decision-maker.

### Before changing code

1. Read the existing root `CLAUDE.md`, project docs, README, package scripts, relevant `.claude/` rules, available skills, and any existing plans or decision records.
2. Inspect `git status --short --branch`, current branch, recent commits, and uncommitted changes. Never overwrite or discard the user's existing work.
3. Map the relevant code path and understand the current implementation before proposing a change.
4. Separate verified facts from assumptions. Cite file paths and relevant symbols when explaining findings.
5. For a substantial task, provide a concise plan: objective, scope, files likely affected, risks, and validation steps. Do not start unrelated refactors.

### During implementation

- Work incrementally and keep diffs focused.
- Preserve the existing visual identity, page structure, design tokens, responsive behavior, accessibility, privacy, and performance budgets.
- Follow existing patterns rather than introducing new libraries or abstractions without a clear need.
- Do not rewrite working systems merely to make them look cleaner.
- Do not invent UI, project screenshots, product claims, metrics, test results, or deployment status.
- Do not rename, delete, migrate, or restructure significant pieces without explaining the impact and obtaining Tay's approval.
- Do not deploy, push, merge, change production environment variables/secrets, delete data, or perform irreversible operations unless explicitly requested.
- Never reveal or print secrets from `.env`, CI variables, or local config. Do not add secrets to source control.
- Preserve real product screenshots and assets; do not replace them with generated visuals unless explicitly asked.
- Keep content consistent across the homepage, project data, case studies, assistant prompt, metadata, and privacy disclosures.

### Validation and completion report

After making changes:

1. Run the most relevant targeted tests.
2. Run typecheck, lint, unit tests, E2E, and production build as appropriate to the scope and available environment.
3. Report exactly which commands were run and their actual results. Never say tests passed if they were not run.
4. Review the final diff for unintended changes, accessibility regressions, responsive issues, broken links, stale content, and secrets.
5. Finish with: what changed, files changed, tests/builds run, results, known limitations, and any manual verification or deployment step still needed.

## 9. Preferred collaboration style

- Language (Tay's decision, 2026-11-18): **Claude Code communicates with Tay in English; Chat Claude (claude.ai) communicates with Tay in Hebrew.** Keep code, identifiers, commit messages, and technical documentation in English unless asked otherwise.
- Explain technical decisions clearly, as a teacher/practitioner: what changed, why it matters, tradeoffs, and how to verify it.
- Be direct and honest. Do not over-praise or hide uncertainty.
- Do not ask for information already present in the repository or earlier project context. Inspect first.
- When information is missing, state the gap and make the safest reasonable recommendation; ask only when a decision materially affects the product or carries risk.
- Distinguish audit/research tasks from implementation tasks. If asked to analyze, do not modify files. If asked to implement, do the requested work after inspecting the current state.
- At the end of each substantial milestone, update the relevant documentation/decision record and provide a short handoff for the next session.

## 10. First task when opening this project

Do not immediately redesign or modify the website. First:

1. Confirm the local project root and inspect its actual structure.
2. Read the existing instructions and documentation.
3. Inspect Git status and identify any user changes.
4. Run a baseline review of the current implementation and available validation commands.
5. Compare the local code with the public site/repository only when useful, and clearly identify which one is the source of truth for the task.
6. Produce a concise current-state report: architecture, key files, working commands, current deployment assumptions, existing TODOs/risks, and recommended improvement backlog.
7. Wait for a specific implementation task before making unrelated changes.

---

**End of project context.**
