@AGENTS.md

# CLAUDE.md — Portfolio (tayshofer.dev)

Concise, durable instructions for every Claude Code session in this repo.
Detailed material lives in `docs/`; this file stays short and points to it.
M0 (audit + decisions) closed 2026-11-18. The M1 core (moves A–E) is live on `main`; Move F is not started (Tay's
call). **The active direction is Concept A**, a measured cinematic prototype on `proto/hero-a-cinematic` (draft PR #18,
never merged). Tay reopened **D1** for it on 2026-11-18. **D2 is still not reopened, so no WebGL**, anywhere.
Keep refining this file with verified facts only.

## What this is
Tay Shofer's existing, **live** software-engineering portfolio (https://www.tayshofer.dev/).
This is a production site, not a greenfield project. The local repo is the source of truth
for local work; do not assume local, GitHub, and production are identical — verify.

Read before working: `docs/PROJECT_CONTEXT.md` (verified facts, stack, projects, commands),
`docs/CREATIVE_DIRECTION.md` (target design; D1/D2 override its art direction), `docs/TOOLS_AND_SKILLS.md`, `claude/START-HERE.md`,
`docs/ROADMAP.md` (phases), `docs/WORKLOG.md` (session log), `docs/RESEARCH_AND_DECISIONS.md`
(open decisions + tool inventory).

## Where production code is (verified 2026-11-19)
- **`main` is the source of truth.** Production = GitHub `taysh123/Portfolio` `main`; every merge deploys
  via Vercel's GitHub integration (last verified: `1c57789`, 2026-11-19, PRs #8–#19). Cloudflare proxies the domain
  in front of Vercel (N7 in `docs/RESEARCH_AND_DECISIONS.md`). Its Web Analytics and Email Address Obfuscation are
  off (Tay, 2026-11-18), and E2E can't see the edge, so check the live page with a browser `Accept` header. `origin` is
  `https://github.com/taysh123/Portfolio.git` (the old name `Tay-Shofer---Portfolio` redirects). The repo
  is **public**. Changes go through a branch and a PR; Tay merges. Claude pushes or opens a PR only when the
  brief says so, and never merges.
- **The active prototype: `proto/hero-a-cinematic`** (draft PR #18; its code is `121d86b`, session 12). **Never merge
  it, never delete it.**
  - Concept A work happens there, not on `main`. Push or make a Preview only on Tay's go.
  - Its routes are all noindex under `/lab`: the locked hero `/lab/hero-a`, and the Work slice `/lab/work` (About
    below its panels, approved by Tay in session 12).
  - The Work slice has four carousels of real captures: T Poker 5, Aegis 2, DeveloperOS 4, GRAVITY FLOW 5 (approved by
    Tay, session 11).
  - Its lab-only design system is `app/lab/_cinematic/`. The doc, `docs/CINEMATIC_SYSTEM.md`, is on that branch, with
    the branch's own START-HERE and WORKLOG (sessions 10–12).
  - On that branch `/` and every guard file stay identical to `main`; an e2e test pins `/`'s stylesheets.
- `reference/premium-redesign-package` is **stale** (Next 16.2.6, old names, institution label, private
  repo URLs). Never build, deploy, or copy content from it. (The local `feature/premium-portfolio-redesign`,
  fully merged, was deleted 2026-11-18.)
- Start live-site work from an up-to-date `origin/main` (needs `git fetch`; ask first in a read-only
  session), then `npm ci` so `node_modules/next/dist/docs` matches Next 16.3.8.
- Check what is live, read-only: `gh api "repos/taysh123/Portfolio/deployments?environment=Production&per_page=1"`.

## Workflow
1. Before changing code: read this file, the docs above, the README, package scripts, and
   relevant `.claude/` rules; run `git status --short --branch`, check the branch, recent
   commits, and uncommitted changes. Never discard or overwrite Tay's work.
2. Trace the real code path before proposing edits. Separate verified facts from assumptions;
   cite file paths and symbols.
3. For a substantial task, first give a short plan: objective, scope, likely files, risks,
   validation. No unrelated refactors or new dependencies without a clear, stated reason.
4. Implement in small, focused diffs. Reuse existing patterns and design tokens.
5. Run relevant targeted tests, then broader validation as appropriate. Report the exact
   commands and the actual results. Never claim a test passed if it was not run.
6. Finish with: what changed, files touched, tests/builds run, results, limitations, and any
   remaining manual step.

## Standing constraints (see PROJECT_CONTEXT for detail)
- Preserve the current design, content hierarchy, responsive behavior, accessibility,
  privacy, SEO, security headers/CSP, and performance budgets. Do not weaken them without a
  measured reason.
- The academic institution is intentionally **not named**. Do not add the institution, by name or abbreviation,
  or any other institution.
- Featured projects: T Poker, Aegis, DeveloperOS, GRAVITY FLOW. Correct names: Aegis (not
  SentinelAI), GRAVITY FLOW (not Gravity Game).
- Do not invent features, metrics, users, revenue, downloads, test counts, screenshots, or
  deployment status. Keep project statuses and limitations accurate. Aegis AI analysis is a
  deterministic mock (not a real LLM) and a modular monolith (not microservices).
- Preserve genuine product captures; do not replace them with generated images unless asked.
- Reference images in the pack are AI-generated direction only, never production assets.
- Direction (Tay; D1/D2 in `docs/RESEARCH_AND_DECISIONS.md`):
  - **D1 was reopened by Tay on 2026-11-18 for Concept A**, the cinematic prototype above. It is the active direction,
    explored on its branch only.
  - The live site stays the calm Product Plates design (moves A–E) until Tay decides. On `main` D1's rules still hold:
    restrained cyan/violet accents; no RGB wash, holographic cube, or fabricated stats.
  - **D2 is still not reopened: no 3D and no WebGL**, on `main` or on the prototype. The prototype's field is a 2D
    canvas, and its carousels are CSS perspective on 2D elements. Don't touch the 3D-guard tests or the JS budget.
  - CREATIVE_DIRECTION's 3D-hero plan stays superseded.
  - M1 plan `docs/M1_VISUAL_PLAN.md`: moves A–E are live, and F is not started (Tay's call). Geist stays; use the plan's
    token values exactly.
- Talk to Tay in English (Claude Code). Chat Claude uses Hebrew.
- Guard tests on `main` encode Tay's decisions. Never edit one just to make a change pass;
  get explicit approval first: no `three`/`lenis`/WebGL/`<canvas>` (`tests/unit/dead-code.test.ts`,
  `tests/e2e/budget.spec.ts`, `tests/e2e/page.spec.ts`); first-load JS ≤ 205.7 KiB gzip and HTML
  ≤ 568 KB (`budget.spec.ts`); contrast floors (`tests/unit/tokens.test.ts`); institution guard
  (`tests/support/institution.ts`, hashed on purpose, so never spell the name out); English-only
  except the footer's legal name. The private-repo guard (`tests/unit/private-repo.test.ts`) scans every
  tracked text file, docs included: never write a private repo's slug (T Poker, GRAVITY FLOW) in docs, PR
  bodies or commits; say "the private T Poker repository". Run `npm test` after any docs commit.
  The private-repo guard pins both private repos (T Poker and GRAVITY FLOW) by digest in `tests/support/private-repo.ts`.
- Project copy must agree across `data/projects.ts`, the assistant prompt rules in
  `app/api/chat/route.ts`, metadata, and `/privacy`.

## Production & git safety
- Do not deploy, push, merge, force-push, change production env/secrets, or alter DNS/domains
  unless Tay explicitly asks. No destructive git (`reset --hard`, `clean`, force checkout).
- Never print or commit secrets. Keep `GROQ_API_KEY` server-side only.
- Do not install tools/skills/MCPs or add dependencies without Tay's approval. Already installed
  (user scope; don't reinstall): frontend-design, superpowers, ui-ux-pro-max, playwright MCP,
  typescript-lsp, context7 (needs a one-time `/mcp` sign-in); claude.ai connectors incl. Figma and Vercel. The Vercel connector can write
  (deploy/env/domains), so use only its read-only tools unless Tay asks. See RESEARCH_AND_DECISIONS §2.

## Validation commands (verified on `main` 2026-11-18; the stale branch has only dev/build/start/lint)
`npm ci` · `npm run dev` · `npm run build` · `npm start` · `npm run typecheck` · `npm run lint` ·
`npm test` (Vitest, `tests/unit`) · `npm run test:e2e` = `npx playwright test` (`tests/e2e`).
E2E runs `next start` on :3400, so `npm run build` first; Chromium via Playwright or `PW_CHROMIUM`.
Verified gotchas (2026-11-18):
- Run E2E as `GROQ_API_KEY= npx playwright test`. `.env.local` holds a real key, and the chat specs expect
  the keyless offline path; a pre-set empty var stops Next loading the key.
- Playwright 1.62.1 needs Chromium v1234 (`npx playwright install chromium`).
- Playwright reuses any server already on :3400 (`reuseExistingServer`), so a stale `next start` there tests an
  old build. Serve manual checks on another port. On Windows, stopping a backgrounded `npx next start` can leave
  its `node` child holding the port: check `Get-NetTCPConnection -LocalPort <port> -State Listen` and stop that PID.
- The Windows-only `tests/unit/site.test.ts:78` failure (N6) is fixed (`b4d5c73`, PR #7): the unit suite is
  122/122 on Windows (`main` `1c57789`; 186/186 on the prototype branch). Run `npm test` from Git Bash: a test shells out `git grep … || true`,
  and cmd.exe (PowerShell's child shell) has no `true`, so it fails there spuriously.
- After leaving an old branch, run `npx next typegen` before `npm run typecheck` (stale `.next/types`).
- The résumé PDF's exact byte size is pinned in `tests/e2e/lower.spec.ts`, and its size label is in
  `lib/dict.ts` (`resumeNote`). Update both whenever the PDF changes.
- **Tailwind v4 scans every source folder except `docs/`, `design/`, `.claude/` and `.impeccable/`** (`@source not` in
  `app/globals.css`), comments and object keys included. That covers this file, `README.md` and `claude/` too.
  - A utility's name written anywhere else (zero opacity, an elevation, a small corner radius…) adds a rule to `/`'s
    stylesheet. Describe one in words, never by its class name, and write docs in `docs/`.
  - It happened three times on the prototype branch, then a fourth time from this file (session 12). Its e2e test pins
    `/`'s CSS to `main`'s SHA-256; rebuild before trusting it.
- **A client component can change `/`'s first-load JS** by importing a shared module.
  - `components/sections/AboutVisual.tsx` (client) imports `data/images.ts` whole, so a new entry there ships in `/`.
    The prototype lists its own captures in `data/lab-images.ts`.
  - Verify by hashing `.next/static/chunks` before and after.
- **A CSS reveal from `opacity: 0` hides text from LCP.**
  - Headless Chromium's GPU is SwiftShader, so canvas cost measured headless is pessimistic.
  - Locally, a client island hydrates before the first paint, which hides hydration-time CLS. Hold the scripts back to
    test it.
- **The chat launcher folds its label on scroll** (0.0076 CLS on `/`, pre-existing). Attribute layout shifts by their
  source before blaming a change.
- **In Git Bash, prefix `MSYS_NO_PATHCONV=1`** when passing a `/route` argument.
Also `npm run measure` / `scan:controls` / `shoot` (scripts/). Prefer targeted tests while iterating.
