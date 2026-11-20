@AGENTS.md

# CLAUDE.md — Portfolio (tayshofer.dev)

Concise, durable instructions for every Claude Code session in this repo.
Detailed material lives in `docs/`; this file stays short and points to it.
M0 (audit + decisions) closed 2026-11-18. The M1 core (moves A–E) is live on `main`; **Move F is retired** (R14).
**Concept A replaces the live `/`** (Tay, session 16). That is the release track: decisions R1–R15 in
`docs/RESEARCH_AND_DECISIONS.md`, sessions S17–S24 in `docs/ROADMAP.md` ("Concept A: P4–P6"), the work on
`release/concept-a`. Tay reopened **D1** for Concept A on 2026-11-18. **D2 is still not reopened, so no WebGL**,
anywhere. Keep refining this file with verified facts only.

## What this is
Tay Shofer's existing, **live** software-engineering portfolio (https://www.tayshofer.dev/).
This is a production site, not a greenfield project. The local repo is the source of truth
for local work; do not assume local, GitHub, and production are identical — verify.

Read before working: `docs/PROJECT_CONTEXT.md` (verified facts, stack, projects, commands),
`docs/CREATIVE_DIRECTION.md` (target design; D1/D2 override its art direction), `docs/TOOLS_AND_SKILLS.md`, `claude/START-HERE.md`,
`docs/ROADMAP.md` (phases), `docs/WORKLOG.md` (session log), `docs/RESEARCH_AND_DECISIONS.md`
(open decisions + tool inventory).

## Where production code is (verified 2026-11-20)
- **`main` is the source of truth.** Production = GitHub `taysh123/Portfolio` `main`; every merge deploys
  via Vercel's GitHub integration (last verified: `443a1f9`, 2026-11-20, PRs #8–#20). Cloudflare proxies the domain
  in front of Vercel (N7 in `docs/RESEARCH_AND_DECISIONS.md`). Its Web Analytics and Email Address Obfuscation are
  off (Tay, 2026-11-18), and E2E can't see the edge, so check the live page with a browser `Accept` header. `origin` is
  `https://github.com/taysh123/Portfolio.git` (the old name `Tay-Shofer---Portfolio` redirects). The repo
  is **public**. Changes go through a branch and a PR; Tay merges. Claude pushes or opens a PR only when the
  brief says so, and never merges.
- **The release branch: `release/concept-a`** (R1), cut from `origin/main` `443a1f9` in S17. Concept A work happens
  here now.
  - S17 copied the prototype over unchanged (`8b77de1`): the 77 paths of
    `git diff --name-only main...proto/hero-a-cinematic` that `main` had not touched since the branch point. Then it
    merged the five state docs both sides had changed.
  - **S18+S19 (approved by Tay, 2026-11-20): `/` is the Concept A page, and `/lab` is deleted.**
    - The layer is `app/cinematic.css`, imported by `/` only. The sections live in `components/sections/` (Hero,
      Work with `panels.ts`, `Reel` and `Shot`, `MoreWork` for Two more, About, Stack, ThinkBuildShip, Contact).
    - The header has its own `.cine` root. `main` holds the page's root, then the case-study host, outside the layer,
      so the dialog keeps the site's dark theme and its own header is not a second banner. The live footer follows.
    - Dark only (R3); every live id kept (R7). The retired Product Plates code is deleted; the explainers can be
      restored from `product-plates-final` (`docs/ROADMAP.md`, P4 restore record).
    - Preview, behind Vercel's login, following each push:
      `https://tay-shofer-portfolio-git-release-840354-tays-projects-d5aefd6e.vercel.app/`.
  - **S20 (2026-11-20): the tests are ported and the suite is green.** The `lab-hero-a.*` and `lab-work.*` files test
    `/` now (they keep their names: code comments and `docs/CINEMATIC_SYSTEM.md` point at them); the `@ts-nocheck`
    lines are gone. `hero.spec.ts` is deleted; `chapters.spec.ts` keeps Navigation, its Case study block and four
    ported checks; `lower.spec.ts` keeps the résumé's bytes, the phones' overflow check and the footer. R12's three new
    guards are in `page.spec.ts`. Every retired test and its reason: `docs/WORKLOG.md`, "Session 20".
  - **S21+S22 (approved by Tay, 2026-11-20): the surfaces and the backlog.** R8: the hero's h1 and lede live in
    `siteMeta`, and the share card is dark, with the four flagships' names only (no states). `/privacy` names Cloudflare
    (N7) and one cookie, `a11y`; the browser colour and the manifest are the field's `#04060d`. #16: focus scrolls
    clear of the chat launcher. #17: the case-study dialog's axe findings are fixed. No case-study image goes through
    the on-demand optimiser. Every focus ring shows at once. #13 was measured and not kept (R11). Detail:
    `docs/WORKLOG.md`, "Sessions 21+22".
  - One PR, opened in S23 on Tay's go; Tay merges.
  - Rollback: Vercel's Instant Rollback to `443a1f9`'s deployment, then a `git revert -m 1` PR. `443a1f9` is tagged
    `product-plates-final` (R15, pushed in S17).
  - Push this branch only when the brief says so. No PR, merge or deploy before S23/S24.
- **The prototype record: `proto/hero-a-cinematic`** (draft PR #18; its code is `1369b00`, session 15). **Never merge
  it, never delete it**: it stays frozen as the record (R1).
  - Its routes are all noindex under `/lab`: the locked hero `/lab/hero-a`, and the Work slice `/lab/work`. Below its
    panels sit About (approved, session 12), Stack with its project filter (approved, session 13), Think · Build · Ship
    (approved, session 14) and Contact, which ends the page (approved, session 15). **P3 is complete:** all six sections
    are approved.
  - The Work slice has four carousels of real captures: T Poker 5, Aegis 2, DeveloperOS 4, GRAVITY FLOW 5 (approved by
    Tay, session 11).
  - Its lab-only design system is `app/lab/_cinematic/`, documented in `docs/CINEMATIC_SYSTEM.md`. Both came over to
    `release/concept-a` in the copy (the layer is `app/cinematic.css` there since S18+S19); the WORKLOG's sessions
    10–16 came with the docs merge.
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
  - **D1 was reopened by Tay on 2026-11-18 for Concept A**, and in session 16 he approved it replacing the live `/`
    (R1–R15), from `release/concept-a`.
  - Until that release merges, the live site stays the calm Product Plates design (moves A–E), and D1's rules hold on
    `main`: restrained cyan/violet accents; no RGB wash, holographic cube, or fabricated stats.
  - **D2 is still not reopened: no 3D and no WebGL**, on `main`, the prototype or the release. The field is a 2D canvas,
    and the carousels are CSS perspective on 2D elements. The WebGL guards and the JS budget stay unchanged.
  - CREATIVE_DIRECTION's 3D-hero plan stays superseded.
  - M1 plan `docs/M1_VISUAL_PLAN.md`: moves A–E are live; **Move F is retired** (R14: the Concept A release supersedes
    it). Geist stays; use the plan's token values exactly.
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
- **The release's approved test changes are R12's list** (`docs/RESEARCH_AND_DECISIONS.md`), including the "still to
  name" group Tay approved in S17, plus six Tay approved in S18+S19 (`docs/WORKLOG.md`, "Sessions 18+19" §3).
  - The one canvas exception: `page.spec.ts:43` allows exactly one canvas, the hero's 2D, `aria-hidden` field. R12's
    new guards (S20, `page.spec.ts`): exactly one canvas, 2D (every context requested is recorded) and `aria-hidden`;
    `/` serves `index, follow` with its one canonical and no noindex; `/lab`, `/lab/hero-a`, `/lab/work` answer 404.
  - Tay's condition on the phone header's one icon: the accessibility button stays reachable on phones, in the menu
    sheet, and `chrome.spec.ts` tests it there at 320 and 390. Keep it.
  - Each change goes in its own commit naming the approval. Any other guard edit still needs Tay's explicit approval
    first.
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
  122/122 on Windows (`main` `1c57789`; PR #20 changed docs only). On `release/concept-a` since S21+S22: 225/225 tests
  in 18 files, and Playwright 187/187 in 15 files, both right after deleting `.next` and warm. Run
  `npm test` from Git Bash: a test shells out `git grep … || true`, and cmd.exe (PowerShell's child shell) has no
  `true`, so it fails there spuriously.
- Lighthouse is not a dependency. S17 ran `npx --yes lighthouse@13.6.0` (Tay's go) with the installed Chrome; the
  production baseline is in `docs/WORKLOG.md` (S17). Compare later runs against it on the same machine.
- A fresh `npm ci` here warns that some packages' install scripts await approval ("allow-scripts"). A production build
  still passes without them (S17's baseline worktree).
- After leaving an old branch, run `npx next typegen` before `npm run typecheck` (stale `.next/types`).
- **`npm run build` type-checks every test file** (`tsconfig.json` includes them). A test importing a deleted module
  fails the build, and the Preview with it (S18+S19 bridged two with a temporary `@ts-nocheck`; S20 removed it).
- **A test whose route is gone waits out its whole timeout** (60 s), and one file's tests run one after another. To
  list a broken set quickly, run it with `--fully-parallel --timeout=15000`.
- **No case-study image goes through the on-demand optimiser** (S21+S22). Each is a `direct` file or listed in its
  project's `media.encoded` (pre-encoded by `scripts/m10-images.mjs`); `tests/unit/case-study-images.test.ts` holds
  that. A new case-study capture needs a script job, or `direct`.
- **The page's bottom scroll padding moves Playwright's clicks** (#16). It keeps focus out of the chat launcher's strip
  (5rem; 4.5rem on phones), so `click()` and `scrollIntoViewIfNeeded()` first scroll a target that sits in it. To
  measure what a press itself moves, dispatch the click inside the page.
- **The Vercel connector's authenticated fetch** (`web_fetch_vercel_url`) creates a 23-hour share link on a protected
  deployment, which opens it to anyone holding the link. Don't use it without Tay's go.
- `git rm` of a folder's last tracked files also removes the folder, so a `git mv` into it then fails: recreate it.
- `npm run build` fetches Geist from Google Fonts (`next/font`). A network blip fails it ("Failed to fetch Geist");
  retry, there is nothing to fix.
- The résumé PDF's exact byte size is pinned in `tests/e2e/lower.spec.ts`, and its size label is in
  `lib/dict.ts` (`resumeNote`). Update both whenever the PDF changes.
- **Tailwind v4 scans every source folder except `docs/`, `design/`, `.claude/` and `.impeccable/`** (`@source not` in
  `app/globals.css`), comments and object keys included. That covers this file, `README.md` and `claude/` too.
  - A utility's name written anywhere else (zero opacity, an elevation, a small corner radius…) adds a rule to `/`'s
    stylesheet. Describe one in words, never by its class name, and write docs in `docs/`.
  - It happened three times on the prototype branch, then a fourth time from this file (session 12). Rebuild and
    compare `/`'s stylesheets (names and bytes) before and after any edit here or in `claude/`.
- **A client component can change `/`'s first-load JS** by importing a shared module.
  - On `main`, `components/sections/AboutVisual.tsx` (client) imports `data/images.ts` whole, so a new entry there
    ships in `/`. The release deletes it; the carousel (`Reel.tsx`) imports no image data, and the newer captures
    stay listed in `data/lab-images.ts`.
  - Verify by hashing `.next/static/chunks` before and after.
- **A CSS reveal from `opacity: 0` hides text from LCP.**
  - Headless Chromium's GPU is SwiftShader, so canvas cost measured headless is pessimistic.
  - Locally, a client island hydrates before the first paint, which hides hydration-time CLS. Hold the scripts back to
    test it.
- **The chat launcher folds its label on scroll** (0.0076 CLS on `/`, pre-existing). Attribute layout shifts by their
  source before blaming a change.
- **In Git Bash, prefix `MSYS_NO_PATHCONV=1`** when passing a `/route` argument.
Also `npm run measure` / `scan:controls` / `shoot` (scripts/). Prefer targeted tests while iterating.
