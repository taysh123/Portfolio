# START HERE — Portfolio

Orientation doc for the Portfolio Project. Read this first in any new chat here or any new
Claude Code session, then continue with the current task. Update it before each transition
(new chat / new session) so the next one starts informed.

## What the product is
Tay Shofer's live software-engineering portfolio at https://www.tayshofer.dev/.
Goal: get Tay interviews for junior/entry software roles. Next.js 16 / React 19 / TypeScript /
Tailwind v4, deployed on Vercel. Full stack and projects: see `docs/PROJECT_CONTEXT.md`.

## What's live now (verified 2026-11-18, session 6)
- The current site is the calm, light **"Product Plates"** editorial design (M10), now with **M1 PR 1**:
  **A** iris accent (`#4a3fe0` light, `#a5a8ff` dark, `#b1b4ff` on the dark plates), **C** two heading tiers
  (`--text-chapter` 36→64 for the four products; `--text-h2` 30→42 for every paper section), **D** motion tokens
  (`--dur-fast` 180ms, `--dur-light`, `--stagger`). It has no WebGL, and tests on `main` enforce that.
- Production = GitHub `taysh123/Portfolio` **`main`**, the source of truth. Deployed **`8f1dd5b`** on
  2026-11-18 (PR #8 = M1 A/C/D, PR #9 = docs leak fix, PR #10 = session 5 docs; GitHub Production deployment
  status `success`). `main` is green: unit 119/119 (re-run at session 6 start), typecheck, lint; Playwright
  132/132 on the same code; first-load JS 181.79 KiB gzip (budget 205.7), HTML 156.44 KB (budget 568).
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
- **M1** (`docs/M1_VISUAL_PLAN.md`): moves **A–E approved**; B approved again for PR 2 (session 6); **E and F
  wait until Tay has previewed B**; F (desk plate) is a separate yes/no; **keep Geist** (no display-face study).
  Use the plan's token values exactly; invent none.

## What's next
- **M1 PR 2 is open for Tay's preview** (branch `feature/m1-studio-light`, session 6). Nothing merged or deployed:
  - **Dark "Email me" a11y fix:** dark `--accent-solid` `#4f46e5` → `#5651f0` (3.24:1 on raised `#16181d`, was
    2.82; white 5.48:1), hover `#4338ca` → `#5e5bfa` (3.68:1, was 2.25; white 4.82:1). Hover lightens in the dark
    theme. The chat launcher icon shares the token (now 3.24:1). Light theme unchanged.
  - **Move B:** `--light-key` / `--light-rim` (plan §5 values); key + cyan rim on the hero plates (they light up
    once, 700ms, 70ms stagger; reduced motion = lit at first paint) and on every phone and window (static).
  - Two deviations from the plan, both to keep the static seams: no 2px plate lift (the device lift stays), and no
    key on the chapter plates' top edge (it drew a hard rule across each seam). Details: `docs/WORKLOG.md`, session 6.
- After Tay's preview and merge: **PR 3: Move E** (lower half), then **F** if Tay approves it.
- Phases and acceptance criteria: `docs/ROADMAP.md`.

## Open PRs / branches (session 6, 2026-11-18)
- **`feature/m1-studio-light`** → PR into `main` (M1 PR 2: B + the dark Email-me fix + these docs). Tay previews,
  then merges; merging deploys to Production.
- Merged and deleted earlier: `docs/m1-pr1-closeout` (#10), `feature/m1-iris-type-motion` (#8),
  `fix/docs-private-slug` (#9), `fix/m0-followups` (#7), `docs/m0-closeout` (#6).

## Waiting on Tay
- **Preview M1 PR 2** (B + Email-me). Then decide E (approved, sequenced after B) and F (optional).
- **Optional guard for the Email-me fix:** one additive `tokens.test.ts` case (`--accent-solid` and its hover ≥ 3:1
  against `--bg-raised`, both themes). Not added: it edits a contrast-floor test, which needs your OK.
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
