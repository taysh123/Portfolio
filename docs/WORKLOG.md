# Worklog

Running log of sessions on the portfolio. Newest first. Each entry records what was checked, what
changed, and what is waiting on Tay.

**Labels used in audit entries**
- **VL** = VERIFIED LOCALLY. Observed in-session from this machine: local files and git objects, plus
  read-only `gh api` / `git ls-remote` against GitHub and a read-only `curl` of the live site.
- **VD** = VERIFIED FROM OFFICIAL DOCS (with URL).
- **NC** = NEEDS CONFIRMATION (inferred, partial, or depends on something not inspected).

---

## 2026-11-18 — Session 4: sync, D8 cleanup, N6, T Poker claim, M1 plan (Claude Code)

**Scope (Tay's task list):** sync and verify what is live; update the state docs; delete merged branches;
fix N6; verify `data/projects.ts:172`; recommend on N1/N2; write the M1 visual plan for approval. No push of
work, no merge, no deploy, no guard test changed. Skills: `frontend-design` (M1),
`superpowers:verification-before-completion` (evidence before every claim below).

### 1. Sync and verify (VL)
- `git fetch origin --prune`: local `main` = `origin/main` = **`841d062`** (merge of PR #5; `661dce1` is PR #4's merge).
- `gh api "repos/taysh123/Portfolio/deployments?environment=Production&per_page=1"`: sha **`841d062`**,
  created 06:02:57Z, status **`success`**. Previous: `661dce1` (06:02:29Z), `3f0c5e5` (2026-11-02).
- `gh pr list --state all`: #4 merged 06:02:02Z (`661dce1`), #5 merged 06:02:13Z (`841d062`).
  **#6 `docs/m0-closeout` is open** (the previous session's close-out docs). This session's doc updates are a
  second commit on that branch, so they extend PR #6 instead of conflicting with it.

### 2. D8: merged branches deleted (VL)
Rule: tip is an ancestor of `origin/main` (`git merge-base --is-ancestor`, 0 ahead). Deleted: local
`feature/premium-portfolio-redesign` (`3ab2cf8`); remote `docs/m0-audit` (`814e309`), `fix/content-accuracy`
(`e105917`), `production/no-entrance` (`566904c`), `review/m10-final-preview-20261013` (`fddc36e`). All four
remote ones are PR heads (#4, #5, #2, #3), restorable from each PR page. **Kept:**
`reference/premium-redesign-package` (excluded), `docs/m0-closeout` (PR #6), and six remote branches with
unique commits (`git cherry`). Full list in RESEARCH_AND_DECISIONS, "Resolved in session 4".

### 3. Fixes on `fix/m0-followups` (from `origin/main` `841d062`, `--no-track`; not pushed)
- **`b4d5c73` N6:** `tests/unit/site.test.ts:78` compares with `path.join("app", "api") + path.sep`.
  - Red before: `npx vitest run tests/unit/site.test.ts`, 1 failed / 19 passed.
  - Green after: 20/20.
  - The new filter excludes only `app\api\chat\route.ts` (79 files scanned).
  - A temporary probe `lib/__n6probe.ts` containing `GROQ_API_KEY` made the test fail (deleted right after).
- **`37ba41c` T Poker copy (`data/projects.ts:172`):** verified against the private T Poker repository @
  `91d2b97` (the local clone equals GitHub `main`).
  - "is completed after sign-in" became "reopens after sign-in": the app resumes onto the invite, never an
    automatic join (`utils/pendingInvite.ts`).
  - "guest progress carries into the new account" became "guest progress on that device is claimed into the
    account—never over data the account already has" (`claimGuest{Study,Engagement,Persona,Bankroll}`).
  - Cloud sync is gated off (`cloud_sync` is `comingSoon: true`), so `work.test.ts:25` still holds.
  - The assistant prompt, metadata and `/privacy` don't carry this line.

| Command (on `fix/m0-followups`) | Result |
|---|---|
| `npm run typecheck` / `npm run lint` | exit 0 / exit 0 |
| `npm test` | **119/119** (14 files). The first fully green unit run on Windows |
| `npm run build` | exit 0 |
| `GROQ_API_KEY= npx playwright test` | **132/132** (1.9 min), exit 0 |

### 4. New finding: N7, Cloudflare (VL)
- For browser user agents, Cloudflare injects its Web Analytics beacon
  (`static.cloudflareinsights.com/beacon.min.js`) into the live HTML. The CSP blocks it, and the console logs
  the violation on every load.
- Headers show `Server: cloudflare`, `CF-RAY …-TLV` and `x-vercel-id: fra1::iad1`. `/privacy` names only Vercel.
- Not changed: DNS and CDN settings are Tay's. Recommendation in RESEARCH_AND_DECISIONS N7.

### 5. M1 plan
`docs/M1_VISUAL_PLAN.md`: mood, a described moodboard, an audit of the live site (screenshots at 1440 and 390
in both themes; not committed), six independently approvable moves A–F, a token diff, contrast ratios, the
type scale, layouts, a hero storyboard, the motion spec, and the tests each move touches. The ratios come
from a scratch script using `tests/unit/tokens.test.ts`'s formula; every proposed pair clears its floor.

### Push / PR commands (for Tay)
```bash
git push origin docs/m0-closeout     # adds this session's docs to PR #6
gh pr edit 6 --repo taysh123/Portfolio --title "docs: M0 close-out, session 4 state, M1 visual plan" --body "Docs only. M0 close-out (PRs #4/#5 live at 841d062); session 4: D8 merged branches deleted, N6 and data/projects.ts:172 fixed on fix/m0-followups, N7 Cloudflare finding, N1/N2 recommendations; docs/M1_VISUAL_PLAN.md for approval (nothing implemented). 🤖 Generated with [Claude Code](https://claude.com/claude-code)"

git push -u origin fix/m0-followups
gh pr create --repo taysh123/Portfolio --base main --head fix/m0-followups --title "N6 Windows test fix; T Poker guest-to-account wording matches the app" --body "b4d5c73: site.test.ts:78 is path-separator agnostic (fails on Windows only before; POSIX unchanged). 37ba41c: data/projects.ts:172 verified against the private T Poker repository @ 91d2b97 (invite reopens after sign-in, no auto-join; guest progress claimed on-device, never over account data). typecheck, lint, unit 119/119, build, Playwright 132/132. 🤖 Generated with [Claude Code](https://claude.com/claude-code)"
```
Merging `fix/m0-followups` deploys to Production (the copy is visible in the T Poker case study). PR #6 is docs only.

---

## 2026-11-18 — M0 close-out: both PRs merged, `main` is the source of truth (Claude Code)

**State at close:**
- **Merged by Tay:** PR #4 (`docs/m0-audit` @ `814e309`, merge `661dce1`, 06:02:02Z) and PR #5
  (`fix/content-accuracy` @ `e105917`, merge `841d062`, 06:02:13Z).
- **Production:** deployed `841d062`, Vercel status success at 06:02:58Z.
- **Local `main`:** at `841d062`, equal to `origin/main`. The folder works from `main` again; the stale
  `reference/premium-redesign-package` is no longer checked out.

**Live check (read-only `curl` of https://www.tayshofer.dev/), VL:**
- No `github.com/taysh123/Gravity-Game` link in the page.
- No "swappable detail".
- The Contact label reads "two pages, 79 KB".
- The Aegis and DeveloperOS repo links are still present.
- `/resume/Tay-Shofer-Software-Engineer-Resume.pdf` is 80,593 bytes, byte-identical to `main`'s file, with
  no `Gravity-Game` link.

**Cleanup:**
- Deleted the merged local branches `docs/m0-audit` and `fix/content-accuracy` (both tips verified as
  ancestors of `main` first). Remote branches were left for Tay (D8).
- Removed session scratch (the scratch PyMuPDF venv, PDF copies, logs, scripts), Playwright's ignored
  `test-results/`, and the ignored `redesign-reference/…/next-env.d.ts` leftover from the old branch.
- Kept: Tay's ignored `.preview/` screenshots, the empty pre-existing `New folder/`, and the `.next/`
  build cache.
- These final doc updates are on `docs/m0-closeout` (PR for Tay), so `main` stays clean.

**Next:** M1, the Product Plates evolution (art direction, tokens, layouts, motion spec), when Tay asks.
Open, non-blocking: D8, N1, N2, N4, N6, `data/projects.ts:172`, and the Context7 `/mcp` sign-in.

---

## 2026-11-18 — Session 3: Context7, GRAVITY FLOW private, résumé link, M0 closed (Claude Code)

**Scope:** Tay's go for Context7; N5 (the GRAVITY FLOW repo stays private, so fix the data); make PR #5
merge-ready; fix the served résumé; refresh these docs. Nothing merged or deployed; Tay pushes.
Skills used: code-review discipline and `superpowers:verification-before-completion`.

### What changed
- **Context7:** `claude plugin install context7@claude-plugins-official --scope user` → installed
  (`e6143c9807a0`, enabled). `claude mcp list`: `plugin:context7:context7 … (HTTP) - ! Needs
  authentication`. Tay completes it with `/mcp` → context7 → sign in.
- **Remote:** `git remote set-url origin https://github.com/taysh123/Portfolio.git`. No more "repository moved" warning.
- **`fix/content-accuracy` → PR #5** (Tay pushed; title and body updated via `gh pr edit`):
  - `36f6001`: `data/projects.ts:359` → `repo: { visibility: "private" }` (like T Poker), plus a new
    `tests/unit/private-repo.test.ts` case. Red/green: it fails without the data change and passes with it.
    The chapter drops its Source link; the case study shows "Private repository"; JSON-LD and the assistant
    prompt carry no URL.
  - `e105917`: the **served résumé PDF** loses the dead `github.com/taysh123/Gravity-Game` link and its
    "· GitHub" text (Tay's PyMuPDF redaction script, run on a copy because PyMuPDF won't save over the open
    file; PyMuPDF lived in a scratch venv only). Verified against the original:
    - URI links 13 → 12; only Gravity-Game was removed.
    - No trace of the URL in any object or stream.
    - Page 1 pixel-identical; page 2 has 923 changed pixels, all inside the two redaction boxes.
    - Text diff: only that line, now ending "| Live web build".
    - Still two pages; 81,782 → **80,593 bytes**. The page doesn't reflow, so a blank line-height gap
      remains where "GitHub" was.
    - Label `lib/dict.ts:49` → "two pages, **79 KB**" (78.7 KiB, same KiB rounding as the old 79.9 → 80).
      `tests/e2e/lower.spec.ts` pins **80593** bytes and checks "79 KB".
- **Local environment:** `npx playwright install chromium` (Playwright 1.62.1 needs Chromium v1234; only
  1243/1248 were present, so the first run failed 124 tests at browser launch).

### Verification (final tree `e105917`)
| Command | Result |
|---|---|
| `npm run typecheck` / `npm run lint` / `npm run build` | exit 0 / exit 0 / exit 0 |
| `GROQ_API_KEY= npx playwright test` | **132/132**, exit 0. Before the résumé fix: 131/132; `private-repo.spec.ts:9` caught the PDF link |
| `npm test` | 118/119; the only failure is N6 (`site.test.ts:78`, Windows-only, pre-existing) |

The empty `GROQ_API_KEY` keeps the real key in `.env.local` from loading, so the chat specs take the
offline path they are written for and nothing calls Groq.

---

## 2026-11-18 — Session 2: decisions recorded, branches prepared (Claude Code)

**Scope:** record Tay's decisions D1/D2/D5/D7; move the M0 docs onto `main`; remove the duplicate
skill; prepare a content-accuracy fix; Context7 install on Tay's go. Nothing pushed, merged, or deployed.
Skills used: code-review discipline (read before edit, minimal diffs, diff reviewed before each
commit) and `superpowers:verification-before-completion`.

### What changed
- `git fetch origin`: `origin/main` moved `e4af9e2` → `3f0c5e5`; the remote review branches were fetched.
- **`docs/m0-audit`** (from `origin/main` `3f0c5e5`, `--no-track`): `9f8eed1` (M0 docs + decisions) plus
  this worklog/decision update. Docs only.
- **`fix/content-accuracy`** (from `origin/main` `3f0c5e5`, `--no-track`): `7bddd19`, two lines in
  `data/projects.ts`:
  - `:150` T Poker billing: "…verifier interface with five implementations… so the payment provider is
    a swappable detail rather than a dependency." → "Billing verifies Apple and Google Play purchases,
    and its disabled mode fails closed." It keeps only facts the old sentence stated.
  - `:396` GRAVITY FLOW: "each of the seven mechanics" → "each of the **other six** mechanics". See finding 1.
  - `:172` (guest progress) is unchanged and still NC.
- **D4:** `.claude/skills/ui-ux-pro-max` is gone from the working folder. Its tracked files left with the
  switch to `main`; the 4 leftover ignored `__pycache__/*.pyc` files were deleted. Plugin 2.11.0 is still
  enabled (`claude plugin list`). No file or setting references the removed path.
  `~/.claude/settings.json` references only the plugin.
- **Local environment** (not committed): `npm ci` installed `main`'s lockfile (package files unchanged).
  npm 11 skipped the install scripts of `sharp` and `unrs-resolver` (not allowlisted); typecheck, lint,
  tests, and build all worked without them. `npx next typegen` regenerated `.next/types`, which was stale
  from an August build of the old branch and broke `tsc` by referencing the deleted `app/gl-spike` and
  `app/render-studio`.

### Verification (exact commands → results)
| Where | Command | Result |
|---|---|---|
| Baseline, unmodified `main` | `npm run typecheck` | exit 2 (stale `.next/types`). After `npx next typegen`: **exit 0** |
| Baseline | `npm run lint` | **exit 0** |
| Baseline | `npm test` | **117/118**. 1 failure: `tests/unit/site.test.ts:78` (pre-existing, Windows-only; finding 3) |
| `docs/m0-audit` | `npm test` | 117/118 (same single failure); `npx vitest run tests/unit/private-repo.test.ts` 4/4 with the docs tracked |
| `docs/m0-audit` | `npm run build`, twice: with `claude/` and with it moved out | both exit 0; CSS **identical** (sha1 `558ad9ae…`, `e536a9b1…`; 74,214 bytes), so the docs don't change production CSS |
| `fix/content-accuracy` | `npm run typecheck` / `npm run lint` | **exit 0** / **exit 0** |
| `fix/content-accuracy` | `npx vitest run tests/unit/content.test.ts tests/unit/tokens.test.ts tests/unit/work.test.ts` | **41/41** |
| `fix/content-accuracy` | `npm test` | 117/118 (same pre-existing failure, nothing new) |
| Not run | `npm run build` on the fix branch, `npx playwright test` | Run both before merging the fix PR |

### Findings this session
1. **GRAVITY FLOW has seven mechanics; the old sentence was wrong, not the count.** Read-only via `gh`
   from the game repo: `MechanicId = 'attractor' | 'zone' | 'magnet' | 'portal' | 'platform' | 'hazard' |
   'gate'  // the 7 mechanics` (`docs/architecture/LEVEL-ENGINE.md:67-68`); README:70, "150 levels and
   7 mechanics". `LevelConfig` has six optional mechanic fields (`src/types/index.ts:99-104`); the
   seventh, the attractor, is the player's input. So `data/projects.ts:356` ("seven core mechanics"),
   `:367` (stat "7") and PROJECT_CONTEXT §4.4 are **correct**. N3 is resolved. **VL**
2. **Broken link on the live site.** `taysh123/Gravity-Game` is now **private** (`gh api`: visibility
   private, last push 2026-11-09). A logged-out `GET https://github.com/taysh123/Gravity-Game` returns
   **404**, but `data/projects.ts:359` marks it `visibility: "public"`. The site therefore shows visitors a
   GitHub link that 404s, and the assistant's prompt includes it via `publicRepoUrl()`. The Aegis,
   DeveloperOS and job-assistant links return 200. **VL.** Decision N5.
3. **`tests/unit/site.test.ts:78` fails only on Windows.** `files()` builds paths with `path.join`
   (backslashes), but the filter checks `f.startsWith("app/api/")`, so the route file itself is tested. It
   passes on POSIX. The invariant it guards holds: `git grep -E 'GROQ_API_KEY|api\.groq\.com' -- app
   components data lib ':!app/api/**'` finds nothing. Normalising separators would be a one-line fix; not
   done (out of scope). **VL**
4. After moving off the old branch, `.next/` still holds its build output. Run `npx next typegen` (or a
   build) before `npm run typecheck`. **VL**

### Push / PR commands (for Tay). Done: pushed as PR #4 and PR #5
```bash
git push -u origin docs/m0-audit
gh pr create --repo taysh123/Portfolio --base main --head docs/m0-audit --title "docs: M0 audit, roadmap, decision log, refined agent context" --body "Documentation only (docs/, claude/START-HERE.md, CLAUDE.md); no app code. Production build verified locally: CSS byte-identical with and without the new files. 🤖 Generated with [Claude Code](https://claude.com/claude-code)"

git push -u origin fix/content-accuracy
gh pr create --repo taysh123/Portfolio --base main --head fix/content-accuracy --title "Content: T Poker billing framing; GRAVITY FLOW mechanics wording" --body "data/projects.ts:150 drops the swappable-provider framing (matches app/api/chat/route.ts:128); :396 says 'the other six' mechanics, matching its list and the game's 7 (attractor + six LevelConfig mechanics). typecheck, lint, vitest pass locally (one pre-existing Windows-only failure, site.test.ts:78). Run npm run build and npx playwright test before merging. 🤖 Generated with [Claude Code](https://claude.com/claude-code)"
```
Each push creates a Vercel Preview. Merging either PR into `main` deploys to Production.

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
| 2026-11-18 | Session 2 | M0 docs + decisions D1/D2/D5/D7 committed on `docs/m0-audit` (`9f8eed1` + follow-up); PROJECT_CONTEXT §9 language fixed; CREATIVE_DIRECTION status note | `docs/*.md`, `claude/START-HERE.md`, `CLAUDE.md` |
| 2026-11-18 | Session 2 | Content fixes on `fix/content-accuracy` (`7bddd19`) | `data/projects.ts:150`, `:396` |
| 2026-11-18 | Session 2 | Removed leftover project-local `ui-ux-pro-max` (untracked cache only) | working folder |
| 2026-11-18 | Session 3 | Context7 installed (user scope); `origin` set to `taysh123/Portfolio` | Claude Code config, `.git/config` |
| 2026-11-18 | Session 3 | PR #5: GRAVITY FLOW repo marked private (`36f6001`); served résumé link removed, size label 79 KB (`e105917`) | `data/projects.ts:359`, `tests/unit/private-repo.test.ts`, `public/resume/*.pdf`, `lib/dict.ts`, `tests/e2e/lower.spec.ts` |
| 2026-11-18 | Session 3 | M0 docs refreshed: N5 resolved, PRs #4/#5, Context7, résumé facts, E2E gotchas | `docs/*.md`, `claude/START-HERE.md`, `CLAUDE.md` |
| 2026-11-18 | M0 close-out | PRs #4 and #5 merged by Tay and deployed (`841d062`); docs record the final state; merged local branches deleted | `docs/*.md`, `claude/START-HERE.md`, `CLAUDE.md` (branch `docs/m0-closeout`) |
| 2026-11-18 | Session 4 | D8: one local and four remote merged branches deleted | git refs |
| 2026-11-18 | Session 4 | N6 test fix (`b4d5c73`); T Poker guest-to-account wording (`37ba41c`) on `fix/m0-followups` | `tests/unit/site.test.ts`, `data/projects.ts:172` |
| 2026-11-18 | Session 4 | M1 visual plan; state docs; N1/N2 recommendations; N7 Cloudflare finding | `docs/M1_VISUAL_PLAN.md`, `docs/*.md`, `claude/START-HERE.md`, `CLAUDE.md` |
