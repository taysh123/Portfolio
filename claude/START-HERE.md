# START HERE — Portfolio

Orientation doc for the Portfolio Project. Read this first in any new chat here or any new
Claude Code session, then continue with the current task. Update it before each transition
(new chat / new session) so the next one starts informed.

## What the product is
Tay Shofer's live software-engineering portfolio at https://www.tayshofer.dev/.
Goal: get Tay interviews for junior/entry software roles. Next.js 16 / React 19 / TypeScript /
Tailwind v4, deployed on Vercel. Full stack and projects: see `docs/PROJECT_CONTEXT.md`.

## What's live now (verified 2026-11-18, session 7 close)
- The current site is the calm, light **"Product Plates"** editorial design (M10), now with the whole **M1 core,
  moves A–E**:
  - **A**, the iris accent: `#4a3fe0` light, `#a5a8ff` dark, `#b1b4ff` on the dark plates.
  - **C**, two heading tiers: `--text-chapter` 36→64 for the four products; `--text-h2` 30→42 for every paper section.
  - **D**, the motion tokens.
  - **B**, the studio light: a key and a cyan rim on the hero plates (they light up once) and on every phone and window.
    Also the dark "Email me" contrast fix.
  - **E**, the lower half: "Two more" as two lit paper plates; the About and Contact titles fully in ink.
  - Think · Build · Ship row words on the h3 tier (`--text-h3` 20→26), under the 42px title.

  The site has no WebGL, and tests on `main` enforce that. `tokens.test.ts` now also guards the "Email me" fill
  (≥ 3:1 against `--bg-raised` and `--bg`, both themes).
- Production = GitHub `taysh123/Portfolio` **`main`**, the source of truth. Deployed **`81cf15d`** on 2026-11-18
  (PR #12 = E, the TBS tier and the guard; GitHub Production deployment status `success`). `main` is green: unit
  121/121 (re-run on `81cf15d` at the close), typecheck and lint; Playwright 132/132 on PR #12's code. First-load JS
  is 181.79 KiB gzip (budget 205.7), HTML 156.44 KB (budget 568).
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
- **M1** (`docs/M1_VISUAL_PLAN.md`): the core, moves **A–E**, is approved and **live** (PRs #8, #11, #12). **F**
  (desk plate) stays **deferred**: Tay decides after previewing A–E live. Do not build F without that yes. **Keep
  Geist** (no display-face study). Use the plan's token values exactly; invent none.

## What's next
- **Tay previews A–E live** on https://www.tayshofer.dev/, then **decides on Move F**, the optional desk plate under
  Contact (plan §4, §8). If yes, F needs one additive floor case in `tokens.test.ts` (plan §11), and that is the only
  test change it needs.
- If F is a no, M1 closes with A–E; the next phase is in `docs/ROADMAP.md`.
- The N1 / N2 / N7 backlog is still open (below).
- Phases and acceptance criteria: `docs/ROADMAP.md`.

## Open PRs / branches (session 7 close, 2026-11-18)
- **`docs/session-7-closeout`** → a docs-only PR into `main`: these state updates. Tay merges.
- Merged and deleted (local and remote, each checked with `git merge-base --is-ancestor` first):
  `feature/m1-lower-half` (#12), `feature/m1-studio-light` (#11), `docs/m1-pr1-closeout` (#10). Earlier:
  `feature/m1-iris-type-motion` (#8), `fix/docs-private-slug` (#9), `fix/m0-followups` (#7), `docs/m0-closeout` (#6).

## Waiting on Tay
- **Decide F** (yes/no) after previewing A–E live.
- A note from session 7's preview shots: at 390px the TBS row word (20.3px, 600) is close to the row's lead line
  `.tbs__line` (19px, 600). It follows the plan exactly, and no change was made. Worth a look while previewing.
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
