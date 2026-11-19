# START HERE — Portfolio

Orientation doc for the Portfolio Project. Read this first in any new chat here or any new
Claude Code session, then continue with the current task. Update it before each transition
(new chat / new session) so the next one starts informed.

> **This is `main`'s copy** (the session 11 close-out, 2026-11-19). **The active direction is the Concept A prototype on
> `proto/hero-a-cinematic`**, not this branch. Tay reopened D1 for it on 2026-11-18; D2 is still not reopened, so no
> WebGL. The prototype branch has its own copy of this file, with the full prototype detail.

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

## What's live now (verified 2026-11-19, session 11)
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
  - Deployed **`fb0f575`**: PR #17, the session 9 close-out docs. GitHub status `success`, 2026-11-19 00:26Z.
  - The site code is still PR #12's, since `fb0f575` and `a7a89fd` change docs only.
  - `main` was green at the session 9 close: unit 122/122, typecheck and lint, and Playwright 132/132 on PR #12's code.
  - First-load JS on `/` is 181.79 KiB gzip (budget 205.7); HTML is 156.44 KB (budget 568).
- **Cloudflare proxies the site in front of Vercel** (N7). Tay turned its two HTML changes off on 2026-11-18: Web
  Analytics is Disabled and Email Address Obfuscation is Off.
- **Flagship projects shown:** T Poker, Aegis, DeveloperOS, GRAVITY FLOW; plus Job Assistant and Orders & Delivery.
  Statuses and limitations: PROJECT_CONTEXT §4. T Poker's and GRAVITY FLOW's repositories are private ("Private
  repository" label).
- **Check your branch first.** Live work branches from an up-to-date `main`, and changes go through a PR that Tay
  merges. `reference/premium-redesign-package` is a stale September design branch: never build or deploy from it.

## The Concept A prototype (session 10, then session 11)
- **Branch** `proto/hero-a-cinematic` at **`5d4610b`** (session 11 close). The code is **`9569bd8`**, with docs on top.
  - Draft **PR #18**: never merge it, never deploy it.
  - Every push builds a Vercel **Preview**, behind Vercel's login. Production is untouched.
- **Routes** (noindex, not in the sitemap, never linked from `/`):
  - **`/lab/hero-a`**: the locked hero, a 2D-canvas constellation field (no WebGL). First-load JS 183.71 KiB.
  - **`/lab/work`**: the Work slice, four product panels in the cinematic language. Each has a CSS 3D coverflow of the
    project's real captures. First-load JS 181.43 KiB, HTML 67.46 KB.
- **The system:** `docs/CINEMATIC_SYSTEM.md` covers the `--cine-*` layer (extracted from the hero, value for value), the
  motion rules, the Work slice, the galleries and the carousel. Read it before touching `/lab`.
- **Session 11:** every flagship's real captures are now in its carousel. **Tay approved the carousels** at the close.
  - T Poker 5, Aegis 2, DeveloperOS 4, GRAVITY FLOW 5;
  - Tay left out a duplicate "final count", the DeveloperOS refusal strip and its AI-features capture.
  - The new captures are listed in `data/lab-images.ts`. **Never in `data/images.ts`:** the live About visual is client
    code that bundles that whole table into `/`.
- **Preview of `/lab/work`** (the branch's own link, which follows each push):
  `https://tay-shofer-portfolio-git-proto-he-65ec6d-tays-projects-d5aefd6e.vercel.app/lab/work`.
- **Kept identical to `main` on the prototype branch** (tests hold it):
  - `/`'s stylesheets, pinned to `origin/main`'s digests;
  - every guard file;
  - `/`, `/lab/hero-a` and `/privacy`'s first-load assets (checked against the build before each round).
- **Watch for Tailwind:** it scans `app/`, `data/`, `tests/` and `scripts/`. A utility name in a lab file, even in a
  comment, adds a rule to `/`'s stylesheet. It has happened three times; the digest test catches it.

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
    close; the comments are still to be reworded.
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
- **Concept A:** the carousels are approved. Tay decides what the prototype takes on next.
- **With the next prototype commit:** reword "D2 reopened" to the corrected framing in the 11 code and test files that
  carry it. They are comments and test titles under `app/lab/`, `tests/` and `scripts/lab-hero-a.mjs`; the docs were
  fixed at the session 11 close.
- **Move F** on `main`: still Tay's plan from the session 9 close, not started.
  - It needs one additive floor case in `tokens.test.ts` (plan §11), and that is its only test change.
  - Branch from an up-to-date `main`; Tay merges.
- After M1, the next phase is in `docs/ROADMAP.md`.

## Open PRs / branches (session 11 close, 2026-11-19)
- **PR #18** (`proto/hero-a-cinematic`, draft): the Concept A prototype. Never merge, never delete; Preview only.
- **`docs/session-10-closeout`** → this close-out PR into `main`, docs only. It brings `main`'s START-HERE, CLAUDE.md,
  WORKLOG and RESEARCH_AND_DECISIONS level with the prototype's state. Tay merges.
- Merged and deleted (each checked with `git merge-base --is-ancestor` first):
  - `docs/session-9-closeout` (#17, tip `c9696d6`, local and remote, at the session 11 close);
  - `fix/n8-gravity-flow-slug` (#16), `docs/session-8-closeout` (#15), `docs/session-7-closeout` (#13);
  - `docs/backlog-n1-n2-n7` (#14), `feature/m1-lower-half` (#12), `feature/m1-studio-light` (#11),
    `docs/m1-pr1-closeout` (#10);
  - `feature/m1-iris-type-motion` (#8), `fix/docs-private-slug` (#9), `fix/m0-followups` (#7), `docs/m0-closeout` (#6).

## Waiting on Tay
- **Merge this close-out PR** (docs only), from `docs/session-10-closeout`.
- **Swap the GRAVITY FLOW capture** he has in mind (the carousels themselves are approved).
- **Decide whether Concept A goes further.** Five NEW values still wait for review: `--cine-lift`, `--cine-glow-lift`,
  `--cine-flow-turn`, `--cine-flow-scale` and `--cine-flow-dim` (`docs/CINEMATIC_SYSTEM.md`).
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
Update them at the end of each milestone. `main`'s `docs/WORKLOG.md` has a summary of sessions 10–11. The prototype
branch's has them in full, with every number, and its `docs/CINEMATIC_SYSTEM.md` documents the `/lab` system.

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
