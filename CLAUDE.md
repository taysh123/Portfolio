@AGENTS.md

# CLAUDE.md — Portfolio (tayshofer.dev)

Concise, durable instructions for every Claude Code session in this repo.
Detailed material lives in `docs/`; this file stays short and points to it.
M0 (audit + decisions) closed 2026-11-18. **Concept A is live on `main` since 2026-11-20** (PR #21, merge `3a98d22`;
S24 verified production). It replaced the Product Plates site (the M1 core, moves A–E; tagged `product-plates-final`);
**Move F is retired** (R14). The release track is done: decisions R1–R15 in `docs/RESEARCH_AND_DECISIONS.md`, sessions
S17–S24 in `docs/ROADMAP.md` ("Concept A: P4–P6"). Next: **P4 before #22** (Tay, 2026-11-21): the plan,
`docs/P4_PLAN.md`, is approved (S29, PR #27, merged as `57b9743`); one explainer per session, in this order: DeveloperOS
(S30, PR #28, merged as `7505b91`), Aegis (S31, PR #29, merged as `d0e5e45`), T Poker (S32, PR #30, merged as `5427e45`), then GRAVITY FLOW after #18. S33: Tay's copy pass (PR #31, for his review; its Part B awaits his answers). Then #22; #23 and #25 are low priority. #19, #20,
#21 and #24 are merged (PRs #24, #23, #25 and #26). Tay reopened **D1**
for Concept A on 2026-11-18. **D2 is still not reopened, so no WebGL**, anywhere. Keep refining this file with
verified facts only.

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
  via Vercel's GitHub integration (last verified: **`5427e45`**, 2026-11-21, PR #30, in S32's close and S33; Next 16.4.6
  since PR #24; the Concept A release is PR #21, `3a98d22`). Cloudflare
  proxies the domain in front of Vercel (N7 in `docs/RESEARCH_AND_DECISIONS.md`). Its Web Analytics and Email Address
  Obfuscation are off (Tay, 2026-11-18), and E2E can't see the edge, so check the live page with a browser `Accept`
  header. `origin` is `https://github.com/taysh123/Portfolio.git` (the old name `Tay-Shofer---Portfolio` redirects).
  The repo is **public**. Changes go through a branch and a PR; Tay merges. Claude pushes or opens a PR only when the
  brief says so, and never merges.
  - **The live page** is Concept A: the layer `app/cinematic.css` (imported by `app/page.tsx` only), the sections in
    `components/sections/`, the header in `components/layout/Navbar.tsx`. The system: `docs/CINEMATIC_SYSTEM.md`.
  - **S24 (2026-11-20):** Production = `3a98d22`, and every production check passed. That covered:
    - the headers, unchanged from `443a1f9`;
    - `index, follow`, and `/lab/*` 404;
    - the dark card, the résumé's 80,593 B, and the chat;
    - Cloudflare's HTML byte-identical to `tay-shofer-portfolio.vercel.app`'s;
    - one 2D canvas and no WebGL;
    - Lighthouse mobile 100, LCP 1,064 ms (S17: 98, 2,288 ms).

    Detail: `docs/WORKLOG.md`, "Session 24".
  - **Rollback:** Vercel's Instant Rollback to `443a1f9`'s deployment, then a `git revert -m 1 3a98d22` PR. `443a1f9`
    is tagged `product-plates-final` (R15).
  - The production deployment's own URLs and the team aliases need Vercel's login. `tay-shofer-portfolio.vercel.app`
    is public, and serves the same build.
- **The release branch: `release/concept-a`** (R1), cut from `origin/main` `443a1f9` in S17, **merged in S24** (PR
  #21, `3a98d22`), then deleted, local and remote (tip `5ea8d57`, an ancestor of `main`; verified in S25). Its history
  follows.
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
  - **S23 (approved by Tay after his phone review):** the release candidate, PR #21. Chromium 187/187; Firefox
    178/187 and WebKit 169/187, every failure traced (none a release bug; F1 and F2, pre-existing, went to the backlog
    as #21 and #20).
  - **S24:** Tay merged PR #21 with a merge commit, `3a98d22`.
- **The prototype record: `proto/hero-a-cinematic`** (draft PR #18; its code is `1369b00`, session 15). **Never merge
  it, never delete it**: it stays frozen as the record (R1).
  - Its routes are all noindex under `/lab`: the locked hero `/lab/hero-a`, and the Work slice `/lab/work`. Below its
    panels sit About (approved, session 12), Stack with its project filter (approved, session 13), Think · Build · Ship
    (approved, session 14) and Contact, which ends the page (approved, session 15). **P3 is complete:** all six sections
    are approved.
  - The Work slice has four carousels of real captures: T Poker 5, Aegis 2, DeveloperOS 4, GRAVITY FLOW 5 (approved by
    Tay, session 11).
  - Its lab-only design system is `app/lab/_cinematic/`, documented in `docs/CINEMATIC_SYSTEM.md`. Both came over to
    `release/concept-a` in the copy (the layer is `app/cinematic.css` since S18+S19), and reached `main` with the
    release; the WORKLOG's sessions 10–16 came with the docs merge.
  - On that branch, `/` and every guard file stay identical to `main` before the release (`443a1f9`); an e2e test there
    pins `/`'s stylesheets to that build.
- `reference/premium-redesign-package` is **stale** (Next 16.2.6, old names, institution label, private
  repo URLs). Never build, deploy, or copy content from it. (The local `feature/premium-portfolio-redesign`,
  fully merged, was deleted 2026-11-18.)
- Start live-site work from an up-to-date `origin/main` (needs `git fetch`; ask first in a read-only
  session), then `npm ci` so `node_modules/next/dist/docs` matches Next 16.4.6.
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
  - **D1 was reopened by Tay on 2026-11-18 for Concept A**. In session 16 he approved it replacing the live `/`
    (R1–R15), and it went live on 2026-11-20 (PR #21).
  - D1's rules that still hold on `main`: no RGB wash, holographic cube, or fabricated stats.
  - **D2 is still not reopened: no 3D and no WebGL**, on `main` or the prototype. The field is a 2D canvas, and the
    carousels are CSS perspective on 2D elements. The WebGL guards and the JS budget stay unchanged.
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
  name" group Tay approved in S17, plus six Tay approved in S18+S19 (`docs/WORKLOG.md`, "Sessions 18+19" §3). All are
  on `main` since the release; PR #21's body lists each with its commit and approval.
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
- The Windows-only `tests/unit/site.test.ts:78` failure (N6) is fixed (`b4d5c73`, PR #7). On `main` since the
  release (`3a98d22`): 225/225 unit tests in 18 files, and Playwright 187/187 in 15 files on Chromium (S23, right after
  deleting `.next`). #20 (PR #23) adds `focus-trap.spec.ts`: 193/193 in 16 files (S25). S26, Next 16.4.6: 225/225 and 193/193, cold and warm. S27 adds `launcher-focus.spec.ts`: 197/197 in 17 files. S28 (dependencies only): 225/225 and 197/197, cold and warm. S30 (P4, DeveloperOS): 227/227, and 209/209 in 17 files, cold and warm. S31 (P4, Aegis): 229/229, and 225/225 in 17 files, cold and warm. S32 (P4, T Poker): 231/231, and 245/245 in 17 files, cold and warm. S33 (copy pass): 231/231, and 245/245, cold and warm. Run `npm test` from Git Bash: a test shells out `git grep … || true`, and cmd.exe (PowerShell's
  child shell) has no `true`, so it fails there spuriously.
- **The suite's config runs Chromium only.** S23 ran WebKit and Firefox from scratch configs, and the engine-specific
  failures are listed in `docs/WORKLOG.md` ("Session 23" close-out). Per-browser handling is backlog #22.
  - Over `http://localhost`, WebKit applies the CSP's `upgrade-insecure-requests` to every file, so nothing loads. Drop
    that one directive through a scratch proxy.
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
  - Run the script with job names. The two T Poker brand jobs need gitignored art, and without it the script calls
    `python3`, the Windows stub here. Since S28 it encodes with sharp 0.35.5: WebP byte-identical to 0.34.5's, AVIF
    about 5% larger at the same settings. sharp is also used by `scripts/shoot.mjs` and three unit tests.
- **The page's bottom scroll padding moves Playwright's clicks** (#16). It keeps focus out of the chat launcher's strip
  (5rem; 4.5rem on phones), so `click()` and `scrollIntoViewIfNeeded()` first scroll a target that sits in it. To
  measure what a press itself moves, dispatch the click inside the page. Firefox's own focus scroll ignores that
  padding for a control already on screen, so `ChatLauncher.tsx` moves one clear once the page settles (#21).
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
  - Before the release, `components/sections/AboutVisual.tsx` (client) imported `data/images.ts` whole, so a new entry
    there shipped in `/`. The release deleted it; the carousel (`Reel.tsx`) imports no image data, and the newer
    captures stay listed in `data/lab-images.ts`.
  - Verify by hashing `.next/static/chunks` before and after.
- **A CSS reveal from `opacity: 0` hides text from LCP.**
  - Headless Chromium's GPU is SwiftShader, so canvas cost measured headless is pessimistic.
  - Locally, a client island hydrates before the first paint, which hides hydration-time CLS. Hold the scripts back to
    test it.
- **The chat launcher folds its label on scroll** (0.0076 CLS on `/`, pre-existing). Attribute layout shifts by their
  source before blaming a change.
- **In Git Bash, prefix `MSYS_NO_PATHCONV=1`** when passing a `/route` argument.
Also `npm run measure` / `scan:controls` / `shoot` (scripts/). Prefer targeted tests while iterating.
