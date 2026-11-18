# START HERE — Portfolio

Orientation doc for the Portfolio Project. Read this first in any new chat here or any new
Claude Code session, then continue with the current task. Update it before each transition
(new chat / new session) so the next one starts informed.

## What the product is
Tay Shofer's live software-engineering portfolio at https://www.tayshofer.dev/.
Goal: get Tay interviews for junior/entry software roles. Next.js 16 / React 19 / TypeScript /
Tailwind v4, deployed on Vercel. Full stack and projects: see `docs/PROJECT_CONTEXT.md`.

## What's live now (verified 2026-11-18, session 5)
- The current site is the calm, light **"Product Plates"** editorial design (M10), now with **M1 PR 1**:
  **A** iris accent (`#4a3fe0` light, `#a5a8ff` dark, `#b1b4ff` on the dark plates), **C** two heading tiers
  (`--text-chapter` 36→64 for the four products; `--text-h2` 30→42 for every paper section), **D** motion tokens
  (`--dur-fast` 180ms, `--dur-light`, `--stagger`). It has no WebGL, and tests on `main` enforce that.
- Production = GitHub `taysh123/Portfolio` **`main`**, the source of truth. Deployed **`f698c74`** on
  2026-11-18 (PR #8 = M1 A/C/D, PR #9 = docs leak fix; GitHub Production deployment status `success`); the live
  CSS serves the iris, `--text-chapter` and `--dur-fast` tokens. `main` is green: unit 119/119, typecheck,
  lint; Playwright 132/132 on the same code (PR #8 head); first-load JS 181.79 KiB gzip (budget 205.7).
- Flagship projects shown: **T Poker, Aegis, DeveloperOS, GRAVITY FLOW**; plus Job Assistant
  and Orders & Delivery. Statuses/limitations: see PROJECT_CONTEXT §4. T Poker and GRAVITY FLOW
  repos are private ("Private repository" label).
- **Check your branch first.** Branch from an up-to-date `main`; changes go through a PR that Tay
  merges. `reference/premium-redesign-package` is a stale September design branch; never build or deploy from it.

## Decided (Tay, 2026-11-18; details in `docs/RESEARCH_AND_DECISIONS.md` §1)
- **D1 Direction: calm / premium. Evolve Product Plates; don't replace it.** Restrained cyan/violet
  accents. Follow the reference README's take / do-NOT-take: no RGB wash, no holographic cube,
  no fabricated on-screen stats. CREATIVE_DIRECTION's dark-cinematic/3D art direction is superseded.
- **D2 3D: not now.** A future, separate, measured prototype only. Do not modify the
  `three`/`lenis`/WebGL/`<canvas>` guard tests or the first-load JS budget.
- **D5** Public git history left as-is (no rewrite, repo stays public).
- **D7** Claude Code ↔ Tay in **English**; Chat Claude ↔ Tay in **Hebrew**.
- D3 docs merged (PR #4) · D4 duplicate ui-ux-pro-max removed · D6 content fixes merged (PR #5) ·
  D9 Context7 installed (user scope; needs a one-time `/mcp` sign-in); web-design-guidelines not yet;
  Impeccable skipped.
- **N5** GRAVITY FLOW repo **stays private**; the site marks it private like T Poker, and the dead link
  is removed from the served résumé PDF (PR #5, live).
- **M1** (`docs/M1_VISUAL_PLAN.md`): moves **A–E approved**; **F** (desk plate) deferred until Tay has previewed
  A–E; **keep Geist** (no display-face study). Use the plan's token values exactly; invent none.

## What's next
- **M1 PR 2: Move B** (studio light: `--light-key` / `--light-rim`, the hero lights-up with `--dur-light` and
  `--stagger`; plan §5, §9, §10). In the same round, **the dark "Email me" button a11y fix**: the dark theme's
  solid iris `--accent-solid #4f46e5` is 2.82:1 against the raised page `#16181d` (cobalt was 3.44:1), under the
  3:1 non-text floor; white on it is 6.29:1. A fill that keeps white ≥ 4.5:1 *and* clears 3:1 against `#16181d`
  needs a relative luminance between 0.127 and 0.183. The same token fills the chat launcher icon
  (`chat.css:25`) and `ChatPanel.tsx:149`, and `--accent-solid-hover #4338ca` is 2.25:1. Tay approves the value.
- Then **PR 3: Move E** (lower half), then **F** if Tay approves it after the preview.
- Phases and acceptance criteria: `docs/ROADMAP.md`.

## Open PRs / branches (session 5, 2026-11-18)
- **No open PRs.** Merged and deleted (local and remote): `feature/m1-iris-type-motion` (#8),
  `fix/docs-private-slug` (#9), `fix/m0-followups` (#7), `docs/m0-closeout` (#6).
- This session's close-out docs: branch `docs/m1-pr1-closeout`, a docs-only PR for Tay to merge.

## Waiting on Tay
- **Open from PR #8's preview (no decision recorded):** the Think · Build · Ship title (42px) barely outranks
  its row words `.tbs__word` (28→40px, 620). Plan-consistent option: `.tbs__word` onto `--text-h3` (20→26).
- **N1** (copy the reference README text onto `main`?) and **N2** (replace the literal institution
  abbreviation in the agent docs?): recommendations in `docs/RESEARCH_AND_DECISIONS.md`.
- **N7** (new): Cloudflare injects its Web Analytics beacon into the live page (the CSP blocks it), and
  `/privacy` names only Vercel although Cloudflare proxies the site. See `docs/RESEARCH_AND_DECISIONS.md`.
- D8 remainder: six unmerged remote branches kept (`feature/portfolio-polish`,
  `feature/premium-portfolio-redesign-1mqmgf`, four `review/m10-*`) plus `reference/premium-redesign-package`;
  delete only on a per-branch yes.

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
> We're done for this session. Update docs/WORKLOG.md, claude/START-HERE.md, CLAUDE.md, and your
> memory with the current state; clean up scratch; delete merged work branches (verify each first);
> commit or PR anything uncommitted; then confirm main is clean.

**Open a new session:**
> New session. First read claude/START-HERE.md, docs/WORKLOG.md, and CLAUDE.md to load the
> current state. Then: <the new task>.
