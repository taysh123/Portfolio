# Worklog

Running log of sessions on the portfolio. Newest first. Each entry records what was checked, what
changed, and what is waiting on Tay.

**Labels used in audit entries**
- **VL** = VERIFIED LOCALLY. Observed in-session from this machine: local files and git objects, plus
  read-only `gh api` / `git ls-remote` against GitHub and a read-only `curl` of the live site.
- **VD** = VERIFIED FROM OFFICIAL DOCS (with URL).
- **NC** = NEEDS CONFIRMATION (inferred, partial, or depends on something not inspected).

---

## 2026-11-18 — M0 read-only audit (Claude Code)

**Scope:** discovery, audit, documentation. No application code changed, nothing installed,
no fetch/build/deploy. Skills used: `superpowers:dispatching-parallel-agents` (three Explore
agents plus one docs-research agent), `superpowers:writing-plans` (adapted for the roadmap),
code-review discipline (citations to `path:line`), and `superpowers:verification-before-completion`
(every agent finding below was spot-checked against the source before being recorded).

### 1. Where the code actually is (most important finding)

| Fact | Label |
|---|---|
| The checked-out branch is `reference/premium-redesign-package` (`b6eaa32`, 2026-09-25). It forked from `3ab2cf8` and is **108 commits behind** GitHub `main`. It is **not** the production code. | VL |
| Production = GitHub `taysh123/Portfolio` `main` at **`3f0c5e5`** (2026-11-02, "Footer: the legal business name…"). The GitHub deployment record for Production at that SHA has status `success`. | VL (`gh api …/deployments`) |
| This clone's `origin/main` ref is `e4af9e2` (last fetch). It is one commit behind GitHub. That commit touches only `components/layout/Footer.tsx`, `data/socials.ts`, and three test files. | VL |
| Local `main` = `8992cb9`, 130 commits behind the local `origin/main`. Local `feature/premium-portfolio-redesign` = `3ab2cf8`. | VL |
| The local remote URL `taysh123/Tay-Shofer---Portfolio` and `taysh123/Portfolio` return identical heads, so they are the same repo (renamed). The repo is **public**. | VL |
| PROJECT_CONTEXT §2 paths (`components/work`, `components/chat`, `public/work`, `public/resume`, `tests/`) match production `main`, **not** the checked-out tree. | VL |
| The live site serves "I build software end to end" and the Aegis name (no "SentinelAI"), and does not reference the arrival render. Response header `Server: cloudflare` plus `x-vercel-id`: a Cloudflare layer in front of Vercel? | VL / NC (CDN setup) |

Because of this, items 3, 4, 6, 7 were audited on production code by reading commit `e4af9e2`
through git plumbing (`git show` / `git grep`), without touching the working tree. Item 5 (design
references) was audited on the checked-out tree, where that material lives.

### 2. Git state (VL)

- Branch `reference/premium-redesign-package`, tracking `origin/reference/premium-redesign-package`, in sync.
- Uncommitted (Tay's, preserved untouched): ` M CLAUDE.md`, `?? claude/`, `?? docs/CREATIVE_DIRECTION.md`,
  `?? docs/PROJECT_CONTEXT.md`, `?? docs/TOOLS_AND_SKILLS.md`. This session adds `docs/ROADMAP.md`,
  `docs/WORKLOG.md`, `docs/RESEARCH_AND_DECISIONS.md` and edits `CLAUDE.md` and `claude/START-HERE.md` (also uncommitted).
- `AGENTS.md` and the committed `CLAUDE.md` are identical on this branch and on production, and
  production has no `docs/` or `claude/` folder. The uncommitted docs can therefore move to a branch
  from `main` without conflicts.
- Remote branches (GitHub): `main`, `production/no-entrance`, `feature/premium-portfolio-redesign-1mqmgf`
  (entrance v2/v3, 4 ahead of main, frozen 2026-10-07), `feature/portfolio-polish`, five `review/m10-*`
  snapshots, and this reference branch. No open PRs. PRs #1–#3 merged.
- History that matters: PR #1 (2026-10-06/07) shipped a cinematic entrance (canvas on desktop, scrub
  video on phones). PR #2, hours later, removed it from production ("rebuilt separately (V2) … not
  merged"). PR #3 (M10, 2026-10-13) shipped Product Plates: English-only, the assistant restored,
  Next 16.3.8 ("clears the advisories published against 16.2.x"). M10 also deleted the agent/skill folders.

### 3. Packages and commands

| Item | Production `main` (`e4af9e2`) | Checked-out branch | Label |
|---|---|---|---|
| Next.js | 16.3.8 | 16.2.6 (advisories per M10 notes) | VL |
| React / React DOM | 19.2.4 | 19.2.4 | VL |
| TypeScript | ^5 → 5.9.3 | 5.9.3 | VL |
| Tailwind CSS | ^4 → 4.3.0 (`@tailwindcss/postcss`) | 4.3.0 | VL |
| framer-motion | ^12.40.0 → 12.40.0 | same | VL |
| three / lenis | absent (banned by tests) | three ^0.185.1, lenis ^1.3.25 | VL |
| Test tooling | vitest ^5.0.2; `playwright` ^1.62.1 (imports `playwright/test`, no `@playwright/test`) | playwright only | VL |
| Scripts | dev, build, start, lint, typecheck, test, test:e2e, measure, scan:controls, shoot | dev, build, start, lint **only** | VL |
| Lockfile | `package-lock.json` v3 | same | VL |
| Node (this machine) / npm | v24.18.0 / 11.16.0; no `.nvmrc`/`engines` pin in the repo | — | VL |

The PROJECT_CONTEXT §7 commands all exist **on `main`**. `npx playwright test` works through the
`playwright` package. E2E needs `npm run build` first: `webServer` runs `npx next start --port 3400`, and
`PW_CHROMIUM` optionally points to a Chromium binary. On the checked-out branch, `typecheck`, `test` and
`test:e2e` do not exist. The bundled Next docs under `node_modules/next/dist/docs` (which AGENTS.md asks
you to read) are **16.2.6** here, so run `npm ci` on `main` before relying on them. No build or install was run. (VL)

### 4. App structure on production (VL, `e4af9e2`)

- Routes: `/` (`app/page.tsx`), `/privacy`, `POST /api/chat`, plus robots, sitemap (lists `/` only),
  manifest, `opengraph-image` (1200×630, also used for Twitter), not-found, error. `/he/:path*` → `/`
  with a 308 (`next.config.ts:12-14`). `proxy.ts` sets headers only.
- Composition: `app/page.tsx:26-35`: Navbar → Hero → Work → About → Stack (`#skills`) → ThinkBuildShip
  (`#approach`) → Contact → Footer. Work = Poker → Aegis → DeveloperOS → Gravity chapters → MoreWork, then `CaseStudyHost`.
- Tokens: `app/globals.css`. Light default `:root,[data-theme="light"]` (:27-116), dark `[data-theme="dark"]`
  (:118-165). Per-project plates (:78-88): poker `#0a1322` + gold `#d8b25c`, aegis steel `#e6e9ed`, dos
  violet `#17132a`, gf teal `#04191d` + `#47e2cb`. Plate scopes (:174-194), type clamps (:97-102),
  rhythm/spacing (:105-109), radii in `@theme` (:255-264), motion durations/easings (:93-115, mirrored in `lib/motion.ts`).
- Theme and a11y: `data-theme`, `data-high-contrast`, `data-large-text`, and `data-reduced-motion` are
  server-rendered on `<html>` from the `theme` and `a11y` cookies (`app/layout.tsx:107-118`). This makes
  `/` dynamic, a documented tradeoff. Reduced motion has three layers: the CSS media query (:365-372), a
  manual toggle (:374-381), and the `useReducedMotionPref` hook.
- Breakpoints: Tailwind defaults (`sm`/`md`/`lg` in use; a custom `3xl` 1920px is unused) plus
  hand-written CSS queries at 639/900/1024 px and a few height queries.
- Framer Motion: imported only by `ChatPanel`, `AccessibilityPanel`, `CaseStudyPanel`. All three are lazy
  through `next/dynamic` (`CaseStudyHost.tsx:18-21`, `Providers.tsx:20-23`). The test
  `budget.spec.ts:38` keeps `AnimatePresence` off the first load.
- Font: Geist via `next/font/google`; system monospace stack.
- No three.js, WebGL, canvas, or R3F anywhere. Guard tests: `tests/unit/dead-code.test.ts:18-26`,
  `tests/e2e/budget.spec.ts:47`, and `tests/e2e/page.spec.ts:30-43`, which counts WebGL contexts and
  expects zero `<canvas>`. README:31: "No WebGL, no scroll library, no pinned scenes."
- Tests: 14 unit files, 12 e2e files, and `tests/support/{institution,page,private-repo}.ts`. Static
  count: roughly 110 unit `it`/`test` calls and 103 e2e `test` calls (loops not expanded; not a run result).

### 5. Design references and 3D work (VL, checked-out tree)

- `design/references/README.md`: supplied 2026-08-05 for "Concept B — pre-rendered workspace with a live
  DOM monitor". **Take:** dual-monitor composition, camera just above the desk, desk layout, a real
  portfolio on the primary screen, the product-photograph feeling. **Do NOT take:** RGB/LED wash, the
  holographic cube, the circuit mat, neon strips, the fabricated stats "50+ Projects / 10M+ Events /
  99.99% Uptime", and AI artefacts. Mood: *calm, focused, premium, quiet, intentional*; walnut, matte black,
  oak, brushed aluminium; Apple / Linear / Stripe / Vercel / Raycast.
- `design/references/arrival-workspace-reference.png` (1024×682) is itself an AI-generated night-desk
  image with violet and teal LEDs, the cube, the fake stats, and the copy "I build distributed systems
  that scale". It looks like it carries a generator watermark sparkle. It is reference only and is never shipped.
- `design/render/scene.ts`: procedural three.js scene in cm units. Walnut desk with canvas grain,
  matte-black monitors (74×32 primary; 26×46 portrait secondary turned 0.5 rad), keyboard, mouse,
  headphones, mug, notebook, speakers. Warm key light, cool rim, screen RectAreaLight, low ambient;
  `RoomEnvironment` at 0.35; ACES tone mapping. 3840×2400. "No coloured practicals — the brief rules out RGB" (:447).
  Hosted by `app/render-studio/` (noindex). `design/render/capture.mjs` drives Playwright Chrome on
  `localhost:6200`, waits for `html[data-render-ready]`, and writes `public/arrival/workspace-4k.png` and
  `workspace.json`. Header comments drift from the code: they mention a 2× / 2.4× downsample that
  doesn't happen, and name the wrong host folder.
- `public/arrival/workspace-4k.png` (3840×2400, ~1.17 MB): an early pipeline proof. Plain procedural
  geometry, dark walnut desk, **black placeholder screens**. Not production quality.
  `workspace.json` holds normalised TL/TR/BR/BL screen corners for both monitors.
- **Usage:** nothing in the app uses the arrival asset, on this branch or in production. On production,
  `design/references`, `design/render`, `public/arrival`, `app/render-studio`, `app/gl-spike` and
  `components/effects` do not exist, and `dead-code.test.ts` asserts they stay absent. Production
  `design/` holds only `design/studio/*.py` prep scripts.
- `app/gl-spike` and `components/effects/WorkstationGL.tsx`: a throwaway three.js laptop spike. The other
  `components/effects/*` files are the older CSS/SVG hero pieces of this branch.
- `docs/superpowers/specs/`: `2026-08-04-premium-portfolio-redesign-design.md` (status "approved to
  implement"; "Instrument Panel" language; blue for interaction, violet only as atmosphere) and
  `2026-08-05-arrival-experience-design.md` (status "PROPOSAL — not approved, nothing implemented";
  recommends concept C, with B as the alternative; §6 says a B render must be "**Not** AI-generated").
  Neither exists on production (production has no `docs/`).
- `redesign-reference/tay-premium-portfolio-v1/` (57 files, added in `b6eaa32`): stale prior art. It uses
  `sentinelai` naming (`data/projects.ts:35-44`, `public/projects/sentinelai/`, repo URL
  `github.com/taysh123/SentinelAI`), four groups of five byte-identical placeholder images, and
  `docs/portfolio-concept.png` (1536×1024). Mapped only. Build nothing from it.
- `New folder/`: empty, untracked. `.preview/`: 8 local review screenshots, ignored by `.gitignore:28`.
- **`reference-01..04` images: NOT PRESENT** anywhere in the tree or in production. They are named only
  in `docs/CREATIVE_DIRECTION.md:6`.
- **Mood conflict (not resolved; see `docs/RESEARCH_AND_DECISIONS.md` §1):** the August brief and README
  (calm, not futuristic, no RGB) against CREATIVE_DIRECTION (dark cinematic, cyan and violet, futuristic, bloom).

### 6. Projects vs PROJECT_CONTEXT §4 (VL, `e4af9e2`, `data/projects.ts` = P)

All six names, statuses, and links match: T Poker `live` (web, App Store, Google Play; repo
`private`, with no GitHub URL anywhere); Aegis `local` (`github.com/taysh123/aegis`; a modular monolith; the AI
analysis is a deterministic template, "no model is called" P:266; no CI); DeveloperOS `released` v1.0.0
(offline mock by default, Ollama opt-in, unsigned binaries); GRAVITY FLOW `rc` (the "Coming soon to Google
Play" badge has no link; localStorage leaderboard; no iOS); Job Assistant `local`; Orders & Delivery
`coursework` (source "not publicly accessible"). No user-facing "SentinelAI", "Gravity Game", or institution.

**Discrepancies:**
1. **P:150, T Poker billing:** "…Billing sits behind one verifier interface with five implementations… so
   the payment provider is a swappable detail rather than a dependency." This contradicts PROJECT_CONTEXT
   §4.1 and the assistant's own rule (`app/api/chat/route.ts:128`: "do not describe its billing as
   interchangeable payment verifiers"). No test catches it. **VL**
2. **P:396, GRAVITY FLOW:** says "seven mechanics" but lists six (gravity zones, magnets, moving platforms,
   hazards, portals, one-way gates). **VL** (which item is missing: **NC**)
3. **P:172, T Poker:** "guest progress carries into the new account". This may sit in tension with
   `tests/unit/work.test.ts:25` ("guest games never reach the server and nothing syncs on reconnect").
   It is not a reconnect-sync claim as such. **NC** against the T Poker repo.
4. Minor: `route.ts:125` says DeveloperOS "answers require an optional local Ollama daemon"; P:346 is more
   precise (retrieval and citations work without it; only answer prose needs it). **VL**
5. The assistant prompt is a hybrid: the per-project lines are generated from P (`route.ts:97-105`), and
   the accuracy rules (`route.ts:122-131`) are hand-written. Keep them in sync whenever copy changes. **VL**
6. Numeric facts (27 .csproj, 105/363/1,277/162 tests, 34 ADRs, 150/15, 310 terms, 287/57) match P. They
   were **not** re-verified against the external project repos (out of scope). **NC**

**On the checked-out (old) branch only:** `data/projects.ts` still says "SentinelAI", labels Orders &
Delivery as university coursework **with the institution's abbreviation**, and exposes the private T Poker
repo URL and the Orders repo name. The same content
is in commit `3ab2cf8`, which is an ancestor of production `main`, so it is readable in the **public**
repo's history and on the public `reference/premium-redesign-package` branch. **VL.** What to do about it is decision D5.

### 7. Security, privacy, performance (VL, `e4af9e2` + live headers)

- `proxy.ts`: CSP `default-src 'self'; script-src 'self' 'unsafe-inline'` ('unsafe-eval' only in dev);
  `style-src 'self' 'unsafe-inline'`; `img-src 'self' data: blob:`; `connect-src 'self'`;
  `frame-ancestors 'none'`; `object-src 'none'`; `upgrade-insecure-requests`. Also HSTS 2y with preload,
  nosniff, `X-Frame-Options: DENY`, `strict-origin-when-cross-origin`, and a restrictive Permissions-Policy.
  The live response headers match exactly. `poweredByHeader: false`.
- Env var **names** referenced: `GROQ_API_KEY` (`app/api/chat/route.ts:247`, server only), `NODE_ENV`,
  `PW_CHROMIUM` and `M10_CAPTURES` (scripts and tests only). No `NEXT_PUBLIC_*` anywhere. No `.env*`
  tracked. The local `.env.local` is git-ignored and defines `GROQ_API_KEY` (name only; value not read).
- Tests keep the key out of the client: `tests/unit/site.test.ts:70` (no `GROQ_API_KEY` or `api.groq.com`
  outside `app/api/`), `tests/e2e/budget.spec.ts:60` (not in any shipped JS), and `tests/e2e/chrome.spec.ts:23`.
- `/api/chat`: rate limit of 5 per 60 s per client, checked first; client table capped at 5,000 and swept.
  JSON-only content type; 8 KiB body cap (413); a role whitelist of user/assistant that forwards only
  role and content; questions capped at 500 chars and prior answers truncated to 1,000; a duplicate check
  that stores a SHA-256 fingerprint; an upstream `AbortSignal.timeout`; model `openai/gpt-oss-20b`;
  sanitised logs. Observation: the rate-limit state is in-memory per serverless instance, so it is not
  shared across instances (**NC** how much that matters at this traffic).
- `/privacy`: discloses Groq, hosting logs, two opt-in first-party cookies (`theme`, `a11y`), and no
  analytics or tracking. Pinned by `tests/e2e/privacy.spec.ts` and `tests/unit/site.test.ts:149`.
- Budgets: first-load JS ≤ 205.7 KiB gzip and HTML ≤ 568 KB (`tests/e2e/budget.spec.ts:7`). The case-study
  body and the animation library stay off first load. `next.config.ts` records a lab Lighthouse mobile
  LCP of 2.9 s (5 runs, external CSS). That is above the 2.5 s "good" line; field data is **NC**, since the
  site has no analytics by policy.

### 8. Tools, skills, MCP (VL; detail in `docs/RESEARCH_AND_DECISIONS.md` §3)

`claude` 2.1.327. User-scope plugins: frontend-design 1.1.1, playwright (MCP connected),
superpowers 7.0.0, typescript-lsp 1.0.0, ui-ux-pro-max 2.11.0. claude.ai connectors connected: Vercel,
Figma, Canva, Google Drive, Gmail, Calendar, Claude Docs. `gh` is authenticated with scopes `repo`,
`read:org`, `gist`. **Duplicate:** `ui-ux-pro-max` exists both as the user plugin (2.11.0) and as an
older project-local copy in `.claude/skills/ui-ux-pro-max`, which is tracked only on this stale branch
and was deleted from production in M10. **Not run:** `npx skills list` / `npx skills ls -g`. The `skills`
CLI is not on this machine, and `npx --no` refused because it would download `skills@1.9.0` from npm.
**Missing:** Impeccable, Vercel web-design-guidelines, Context7.

### Not done this session (by design)

No `git fetch`, checkout, build, install, test run, or deploy. No app code touched. No secret values read.

### Next steps

Tay answers D1–D5 in `docs/RESEARCH_AND_DECISIONS.md`. Then the docs move to a branch from current
`main`, and either M0.5 (content fixes) or M1 (art direction) starts, as Tay chooses.

---

## Change log

| Date | Session | Change | Files |
|---|---|---|---|
| 2026-11-18 | M0 audit | Created roadmap, worklog, decision log; refined CLAUDE.md and START-HERE (all uncommitted, on `reference/premium-redesign-package`) | `docs/ROADMAP.md`, `docs/WORKLOG.md`, `docs/RESEARCH_AND_DECISIONS.md`, `CLAUDE.md`, `claude/START-HERE.md` |
