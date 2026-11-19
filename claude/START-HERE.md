# START HERE — Portfolio

Orientation doc for the Portfolio Project. Read this first in any new chat here or any new
Claude Code session, then continue with the current task. Update it before each transition
(new chat / new session) so the next one starts informed.

> **This copy is on `proto/hero-a-cinematic`** (session 14, 2026-11-19). It has more prototype detail than `main`'s
> copy (`main` has the essentials since PR #19). The branch is never merged.

## What the product is
Tay Shofer's live software-engineering portfolio at https://www.tayshofer.dev/.
Goal: get Tay interviews for junior/entry software roles. Next.js 16 / React 19 / TypeScript /
Tailwind v4, deployed on Vercel. Full stack and projects: see `docs/PROJECT_CONTEXT.md`.

## Two tracks
1. **The live site, on `main`:** calm Product Plates with the M1 core (A–E). Nothing on the prototype branch reaches
   it.
2. **The Concept A prototype, on `proto/hero-a-cinematic`: the active direction.** A cinematic direction, measured,
   under the noindex `/lab` segment.
   - Tay reopened **D1** for it (2026-11-18). **D2 is still not reopened, so no WebGL.**
   - Draft PR #18, never merged, Vercel Preview only.

## What's live now (verified 2026-11-19, session 13)
- The current site is the calm, light **"Product Plates"** editorial design (M10), with the whole **M1 core, moves
  A–E**:
  - **A**, the iris accent: `#4a3fe0` light, `#a5a8ff` dark, `#b1b4ff` on the dark plates.
  - **C**, two heading tiers: `--text-chapter` 36→64 for the four products; `--text-h2` 30→42 for every paper section.
  - **D**, the motion tokens.
  - **B**, the studio light: a key and a cyan rim on the hero plates (they light up once) and on every phone and window.
    Also the dark "Email me" contrast fix.
  - **E**, the lower half: "Two more" as two lit paper plates; the About and Contact titles fully in ink.
  - Think · Build · Ship row words on the h3 tier (`--text-h3` 20→26), under the 42px title.

  The site has no WebGL, and tests on `main` enforce that. `tokens.test.ts` also guards the "Email me" fill (≥ 3:1
  against `--bg-raised` and `--bg`, both themes).
- **Production** = GitHub `taysh123/Portfolio` **`main`**, the source of truth.
  - Deployed **`443a1f9`**: PR #20, 2026-11-19 03:20Z.
  - The site code is still PR #12's, since PRs #13–#20 change docs only.
  - PR #19's CLAUDE.md line had leaked three unused rules into `/`'s Tailwind sheet (44,530 → 44,829 bytes). **PR #20
    removed them:** the live sheet is 44,530 bytes again (read-only `curl`, session 13). This branch has the same
    change in `fb3bb41`.
  - `main` was green at the session 9 close: unit 122/122, typecheck and lint, and Playwright 132/132 on PR #12's code.
  - First-load JS on `/` is 181.79 KiB gzip (budget 205.7); HTML is 156.44 KB (budget 568).
- **Cloudflare proxies the site in front of Vercel** (N7). Tay turned its two HTML changes off on 2026-11-18: Web
  Analytics is Disabled and Email Address Obfuscation is Off.
- **Flagship projects shown:** T Poker, Aegis, DeveloperOS, GRAVITY FLOW; plus Job Assistant and Orders & Delivery.
  Statuses and limitations: PROJECT_CONTEXT §4. T Poker's and GRAVITY FLOW's repositories are private ("Private
  repository" label).
- **Check your branch first.** Live work branches from an up-to-date `main`, and changes go through a PR that Tay
  merges. `reference/premium-redesign-package` is a stale September design branch: never build or deploy from it.

## The Concept A prototype (sessions 10–13)
- **Branch** `proto/hero-a-cinematic`: code at **`8955039`** (session 13), with the docs on top.
  - Draft **PR #18**: never merge it, never deploy it.
  - Every push builds a Vercel **Preview**, behind Vercel's login. Production is untouched.
- **Routes** (noindex, not in the sitemap, never linked from `/`):
  - **`/lab/hero-a`**: the locked hero, a 2D-canvas constellation field (no WebGL). First-load JS 183.71 KiB.
  - **`/lab/work`**: the Work slice, four product panels in the cinematic language. Each has a CSS 3D coverflow of the
    project's real captures. Below them, **About** (session 12, approved), then **Stack** (session 13, approved), then
    **Think · Build · Ship** (session 14, for review). First-load JS 181.77 KiB, HTML 102.79 KB.
- **The system:** `docs/CINEMATIC_SYSTEM.md` covers the `--cine-*` layer (extracted from the hero, value for value), the
  motion rules, the Work slice, the galleries and the carousel. Read it before touching `/lab`.
- **Session 11:** every flagship's real captures are now in its carousel. **Tay approved the carousels** at the close.
  - T Poker 5, Aegis 2, DeveloperOS 4, GRAVITY FLOW 5;
  - Tay left out a duplicate "final count", the DeveloperOS refusal strip and its AI-features capture.
  - The new captures are listed in `data/lab-images.ts`. **Never in `data/images.ts`:** the live About visual is client
    code that bundles that whole table into `/`.
- **Session 12: About (P3.3)** under the panels, built from the live About's own words. Tay approved every word, then
  **approved the built section** at the close.
  - The title, two sentences of the live copy, the four live facts, Tay's joined availability line, and three links at
    the live targets: the résumé, GitHub, LinkedIn.
  - No photo, no institution, no new claim. A server component; it holds still. No token added.
  - The five NEW layer values are **approved by Tay as they are** (session 12).
  - The "D2 reopened" comments in 11 code and test files now say D1 reopened, D2 not, no WebGL (`4dccdf8`).
- **Session 13: Stack (P3.4)** under About, **approved by Tay** at the close. Three passes on his reviews: one project
  line per tool (`757c377`, too busy); the live Stack's layout with a dimming filter (`d3373b6`, not clear enough); the
  filter that shows only the chosen project's tools (`8955039`, approved). It works like the live Stack, in the layer:
  - One row per group: its name, its tools on one wrapping line, and the live evidence sentence, word for word (Tay
    keeps all seven as they are, two of which name Job Assistant and Orders & Delivery).
  - Every tool is a pill: outlined under All; with a project chosen, only its tools remain (the live FILTER's rules,
    by `projectsFor` through `data-p`), filled cyan, with no empty group and no evidence. The live status line sits
    above the groups.
  - **"Filter by project":** All and the four flagships, as toggle buttons (`aria-pressed`, 44px; focus stays). No
    scroll jump when the list gets shorter. One small island (`StackFilter.tsx`, React only): +351 bytes gzip. Without
    JS the full list shows.
  - **Security:** JWT (T Poker, Aegis; moved from Services and APIs), Body HMAC (Aegis), CSRF token (DeveloperOS), and
    one sentence built from their source lines.
  - Tools no flagship uses show under All only. Everyday tools kept.
  - **Measured:** LCP +14 ms desktop, +46 ms phone at 4× CPU (more to lay out before the first paint). **Tay keeps the
    cost.** Skipping Stack's off-screen layout, with the violet glow repositioned, is logged as a P5 (integration) item
    (`docs/ROADMAP.md` #13).
  - **Before the Contact session:** the filter's no-scroll-jump hold assumed Stack ends the page. Re-checked in session
    14 (below; `docs/ROADMAP.md` #14).
- **Session 14: Think · Build · Ship (P3.5)** under Stack (`8382889`), **for Tay's review**:
  - The live section's title and rows word for word (`dict.tbs.title`, `pillars`), plus one DeveloperOS line under
    Build in Tay's wording, so all four flagships appear: "DeveloperOS: it declines when the index doesn't support an
    answer—before the provider is ever reached."
  - Three ruled rows on About's and Stack's grid; each piece of evidence opens with its project's name in ink. A server
    component: no client code, no control, no reveal; no token added.
  - **Measured:** JS unchanged; HTML 97.66 → 102.79 KB; LCP +2 ms desktop and +42 ms phone (a first round +8 / +72),
    most of it the section's layout before the first paint (#13's fix would win it back).
  - **#14 re-checked:** the hold is 0 at 1440×900 and 390×844 with the buttons in view. It engages on tall screens and
    after a press with the buttons out of view, and its space then sits between the filtered list and this section.
    Recommended: keep it.
  - **Found and fixed (`d1c53a3`):** with the buttons low in the view, the browser's scroll anchoring followed the violet
    glow up (220–462px). The glows no longer anchor scrolling; the hold and its test are unchanged.
- **Preview of `/lab/work`** (the branch's own link, which follows each push):
  `https://tay-shofer-portfolio-git-proto-he-65ec6d-tays-projects-d5aefd6e.vercel.app/lab/work`.
- **Kept identical on this branch** (tests hold it):
  - `/`'s stylesheets, pinned to `origin/main`'s digests;
  - every guard file;
  - `/`, `/lab/hero-a` and `/privacy`'s first-load assets (checked against the build before each round).
- **Watch for Tailwind:** it scans every folder except `docs/`, `design/`, `.claude/` and `.impeccable/`: `app/`,
  `data/`, `tests/`, `scripts/`, and the root `CLAUDE.md`, `README.md` and `claude/` too. A utility name written there,
  even in a comment or backticks, adds a rule to `/`'s stylesheet. It has happened four times (the fourth from
  CLAUDE.md, session 12); the digest test catches it. Describe a utility in words, never by its class name.

## Decided (Tay, 2026-11-18; details in `docs/RESEARCH_AND_DECISIONS.md` §1)
- **D1 Direction: reopened by Tay on 2026-11-18 for Concept A.** The cinematic prototype on `proto/hero-a-cinematic` is
  the active direction.
  - The live site stays calm / premium Product Plates (evolve, don't replace) until Tay decides otherwise.
  - On `main`: restrained cyan/violet accents, and the reference README's take / do-NOT-take (its text:
    `docs/references/premium-redesign-README.md`): no RGB wash, no holographic cube, no fabricated on-screen stats.
- **D2 3D: still not reopened. No WebGL**, on `main` or on the prototype.
  - The prototype's field is a 2D canvas; its carousels are CSS perspective on 2D elements.
  - The `three`/`lenis`/WebGL/`<canvas>` guard tests and the first-load JS budget are unchanged, and the prototype is
    held to the same 205.7 KiB.
  - Session 10's docs and the branch's code comments called this "D2 reopened". Tay corrected that at the session 11
    close; the comments were reworded in session 12 (`4dccdf8`).
- **D5** Public git history left as-is (no rewrite, repo stays public).
- **D7** Claude Code ↔ Tay in **English**; Chat Claude ↔ Tay in **Hebrew**.
- D3 docs merged (PR #4) · D4 duplicate ui-ux-pro-max removed · D6 content fixes merged (PR #5) ·
  D9 Context7 installed (user scope; needs a one-time `/mcp` sign-in); web-design-guidelines not yet;
  Impeccable skipped.
- **N5** GRAVITY FLOW repo **stays private**; the site marks it private like T Poker, and the dead link
  is removed from the served résumé PDF (PR #5, live).
- **M1** (`docs/M1_VISUAL_PLAN.md`): the core, moves **A–E**, is approved and **live** (PRs #8, #11, #12).
  - **F** (the desk plate): Tay's plan at the session 9 close was to build it next session, on a preview branch.
  - It is **not started**: sessions 10 and 11 went to Concept A.
  - **Keep Geist** (no display-face study). Use the plan's token values exactly; invent none.
- **N1, N2** (merged in PR #14): the reference README's text is in `docs/references/`, byte for byte, with no image; the
  agent docs say "the institution" instead of its abbreviation.
- **N7, the Cloudflare toggles:** done. The `/privacy` wording is **deferred to the end of the build** (Tay, session 9
  close). Don't raise it before then.
- **N8** (merged in PR #16): GRAVITY FLOW's private repository name is out of the docs. The private-repo guard pins both
  private repos, T Poker and GRAVITY FLOW, by SHA-256 digest.
- **Session 11 (Tay's answers):** T Poker has 5 captures, not 6 (no duplicate). The DeveloperOS refusal and
  AI-features captures are left out. GRAVITY FLOW's existing two stay; Tay will swap one himself.

## What's next
- **Concept A:** the carousels, the five layer values, About and Stack are approved. Tay decides what the prototype
  takes on next.
  - Logged: the P5 (integration) item for Stack's LCP (`docs/ROADMAP.md` #13), and the Contact session's re-check of
    the filter's hold (#14).
- **Move F** on `main`: still Tay's plan from the session 9 close, not started.
  - It needs one additive floor case in `tokens.test.ts` (plan §11), and that is its only test change.
  - Branch from an up-to-date `main`; Tay merges.
- After M1, the next phase is in `docs/ROADMAP.md`.

## Open PRs / branches (session 13, 2026-11-19)
- **PR #18** (`proto/hero-a-cinematic`, draft): the Concept A prototype. Never merge, never delete; Preview only.
- Merged and deleted (each checked with `git merge-base --is-ancestor` first):
  - `docs/claude-md-tailwind-leak` (#20, tip `2e73766`, local and remote, in session 13);
  - `docs/session-10-closeout` (#19, tip `2101ef6`, local and remote, at the session 12 close);
  - `docs/session-9-closeout` (#17, tip `c9696d6`, local and remote, at the session 11 close);
  - `fix/n8-gravity-flow-slug` (#16), `docs/session-8-closeout` (#15), `docs/session-7-closeout` (#13);
  - `docs/backlog-n1-n2-n7` (#14), `feature/m1-lower-half` (#12), `feature/m1-studio-light` (#11),
    `docs/m1-pr1-closeout` (#10);
  - `feature/m1-iris-type-motion` (#8), `fix/docs-private-slug` (#9), `fix/m0-followups` (#7), `docs/m0-closeout` (#6).

## Waiting on Tay
- **Review Think · Build · Ship** (session 14) on the Preview; the #14 hold (keep it, recommended) and a go to reword its
  test's out-of-date comment; keep or drop the glow fix (`d1c53a3`); the section's phone LCP cost (keep it, or fold it
  into #13).
- **Decide what Concept A takes on next.** The carousels, the five layer values, About and Stack are approved.
- **Swap the GRAVITY FLOW capture** he has in mind (the carousels themselves are approved).
- **Move F:** confirm it is still next on `main`.
- **Optional, on `main`:** the site's chat launcher folds its label as the page scrolls. That is 0.0076 CLS on `/` at
  1440 and 390 (measured in session 11), well inside "good". Untouched.
- **A note from session 7's preview shots:** at 390px the TBS row word (20.3px, 600) is close to the row's lead line
  `.tbs__line` (19px, 600). It follows the plan exactly, and no change was made.
- **Not pending:** the N7 `/privacy` wording is deferred to the end of the build.
  - The draft is in `docs/RESEARCH_AND_DECISIONS.md` N7.
  - When it ships, it needs an approved edit to `tests/e2e/privacy.spec.ts`, which pins 2 outbound links.
- **D8 remainder:** six unmerged remote branches are kept (`feature/portfolio-polish`,
  `feature/premium-portfolio-redesign-1mqmgf`, four `review/m10-*`), plus `reference/premium-redesign-package`. Delete
  only on a per-branch yes.

## Standing rules
- Live production site: no deploy/push/merge/secret/DNS change without Tay's explicit ask.
- Don't break working features. Keep accessibility, privacy, SEO, security headers, and
  performance budgets intact.
- The institution is not named, not even by abbreviation. Honest project facts only — no invented metrics/claims.
- Never write either private repository's name (T Poker's, GRAVITY FLOW's) in docs, commits or PR bodies. Run
  `npm test` (Git Bash) after a docs edit.
- Evidence before conclusions; don't claim done before verified.

## Handoff / state doc
Claude Code records session state in `docs/WORKLOG.md` (plus `docs/ROADMAP.md` for phases).
Update them at the end of each milestone. On this branch, `docs/WORKLOG.md` also carries sessions 10 to 13; `main`'s
copy ends with a summary of sessions 10–11.

## Transition prompts (fill the task, paste into Claude Code)

**Close a session:**
> We're done for this session. Update docs/WORKLOG.md, claude/START-HERE.md, CLAUDE.md, and your
> memory with the current state; clean up scratch; delete merged work branches (verify each first);
> commit or PR anything uncommitted; then confirm main is clean.

**Open a new session (the prototype):**
> New session. First check out and update `proto/hero-a-cinematic` (`git fetch && git checkout proto/hero-a-cinematic
> && git pull`), then read claude/START-HERE.md, docs/WORKLOG.md, CLAUDE.md and docs/CINEMATIC_SYSTEM.md on that
> branch. Then: <the new task>.

**Open a new session (the live site):**
> New session. First read claude/START-HERE.md, docs/WORKLOG.md, and CLAUDE.md on `main` to load the
> current state. Then: <the new task>.
