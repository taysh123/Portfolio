# START HERE — Portfolio

Orientation doc for the Portfolio Project. Read this first in any new chat here or any new
Claude Code session, then continue with the current task. Update it before each transition
(new chat / new session) so the next one starts informed.

## What the product is
Tay Shofer's live software-engineering portfolio at https://www.tayshofer.dev/.
Goal: get Tay interviews for junior/entry software roles. Next.js 16 / React 19 / TypeScript /
Tailwind v4, deployed on Vercel. Full stack and projects: see `docs/PROJECT_CONTEXT.md`.

## What's live now (verified 2026-11-18)
- The current site is the calm, light **"Product Plates"** editorial design (M10). It has no WebGL, and
  tests on `main` enforce that.
- Production = GitHub `taysh123/Portfolio` **`main`** (`3f0c5e5`, deployed 2026-11-02 via Vercel).
- Flagship projects shown: **T Poker, Aegis, DeveloperOS, GRAVITY FLOW**; plus Job Assistant
  and Orders & Delivery. Statuses/limitations: see PROJECT_CONTEXT §4.
- **Check your branch first.** Work branches come from `origin/main`. The old
  `reference/premium-redesign-package` is a stale September design branch (108 commits behind);
  never build or deploy from it. Local branches waiting for Tay to push: `docs/m0-audit` (these docs)
  and `fix/content-accuracy` (two copy fixes in `data/projects.ts`).

## Decided (Tay, 2026-11-18; details in `docs/RESEARCH_AND_DECISIONS.md` §1)
- **D1 Direction: calm / premium. Evolve Product Plates; don't replace it.** Restrained cyan/violet
  accents. Follow the reference README's take / do-NOT-take: no RGB wash, no holographic cube,
  no fabricated on-screen stats. CREATIVE_DIRECTION's dark-cinematic/3D art direction is superseded.
- **D2 3D: not now.** A future, separate, measured prototype only. Do not modify the
  `three`/`lenis`/WebGL/`<canvas>` guard tests or the first-load JS budget.
- **D5** Public git history left as-is (no rewrite, repo stays public).
- **D7** Claude Code ↔ Tay in **English**; Chat Claude ↔ Tay in **Hebrew**.
- D3 docs moved to `docs/m0-audit` · D4 duplicate ui-ux-pro-max removed · D6 content fixes prepared ·
  D9 Context7 only (web-design-guidelines not yet; Impeccable skipped).

## What's next
- Tay pushes and opens PRs for `docs/m0-audit` and `fix/content-accuracy` (commands in `docs/WORKLOG.md`).
- **M1** (art direction, tokens, layouts, motion spec for the Product Plates evolution) can start
  once Tay asks. Phases and acceptance criteria are in `docs/ROADMAP.md`.

## Waiting on Tay
- **N5 (live bug):** the GRAVITY FLOW GitHub link 404s for visitors (the repo is now private but
  `data/projects.ts:359` says public). Either make the repo public again or mark it private in data.
- D8 branch cleanup · N1 copy the reference README onto `main`? · N2 replace the literal institution
  abbreviation in agent docs? · N6 Windows-only test false failure · `data/projects.ts:172`
  guest-progress claim to verify against the T Poker repo.
- Then: approval of the concrete visual plan (moodboard, tokens, typography, layouts, motion spec)
  before any redesign implementation.

## Standing rules
- Live production site: no deploy/push/merge/secret/DNS change without Tay's explicit ask.
- Don't break working features. Keep accessibility, privacy, SEO, security headers, and
  performance budgets intact.
- Institution not named (no HIT). Honest project facts only — no invented metrics/claims.
- Evidence before conclusions; don't claim done before verified.

## Handoff / state doc
Claude Code records session state in `docs/WORKLOG.md` (plus `docs/ROADMAP.md` for phases).
Update them at the end of each milestone.

## Transition prompts (fill the task, paste into Claude Code)

**Close a session:**
> We're done for this session. Update docs/WORKLOG.md, CLAUDE.md, and your memory with the
> current state; clean up scratch; delete merged work branches; commit or PR anything
> uncommitted; then confirm main is clean.

**Open a new session:**
> New session. First read claude/START-HERE.md, docs/WORKLOG.md, and CLAUDE.md to load the
> current state. Then: <the new task>.
