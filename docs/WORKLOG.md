# Worklog

Running log of sessions on the portfolio. Newest first. Each entry records what was checked, what
changed, and what is waiting on Tay.

**Labels used in audit entries**
- **VL** = VERIFIED LOCALLY. Observed in-session from this machine: local files and git objects, plus
  read-only `gh api` / `git ls-remote` against GitHub and a read-only `curl` of the live site.
- **VD** = VERIFIED FROM OFFICIAL DOCS (with URL).
- **NC** = NEEDS CONFIRMATION (inferred, partial, or depends on something not inspected).

---

## 2026-11-18 — Session 9 close-out: PR #16 merged and live, N8 done (Claude Code)

**Scope (Tay's brief):**
- Record the state, and delete the merged N8 branch after the ancestry check.
- Keep `reference/*` and the six review/feature branches.
- Record two decisions.
- CLAUDE.md: fix the two stale deployment lines only.
- One docs commit, pushed as a close-out PR. No merge, and no start on Move F.

### State (VL)
- `git fetch --prune`: `origin/main` = **`a7a89fd`**, the PR #16 merge (merged 19:05:19Z; head `5a9d8a3`).
- Production deployment `a7a89fd`, GitHub status `success` (19:05:42Z).
- Local `main` fast-forwarded to `a7a89fd`: clean, and equal to `origin/main`.
- `npm test` (Git Bash) on `a7a89fd`: **122/122** (14 files).
- **N8 is done and live.** The docs carry neither private repo's name, and the private-repo guard pins both by digest.
  Tay approved the guard change at merge.

### Decisions (Tay, 2026-11-18)
- **The N7 `/privacy` wording is deferred to the end of the build.** It is not a now-task and shouldn't be raised as
  pending. The draft stays in `docs/RESEARCH_AND_DECISIONS.md` N7.
- **Move F is to be built on a preview branch next session.** It was not started in this session.

### Branches
- **`fix/n8-gravity-flow-slug`:** the local and remote tips (`5a9d8a3`) are both ancestors of `origin/main`
  (`git merge-base --is-ancestor`). Deleted with `git branch -d` and `git push origin --delete`; GitHub returns 404.
- **Kept:** `reference/premium-redesign-package` (local and remote), `feature/portfolio-polish`,
  `feature/premium-portfolio-redesign-1mqmgf`, and the four `review/m10-*` branches.
- **New:** `docs/session-9-closeout` (from `a7a89fd`) holds these docs, and goes up as a close-out PR.

### Docs
- This entry and the change log.
- START-HERE: live `a7a89fd`, the F plan, `/privacy` deferred and not pending, N8 merged, and the branches.
- CLAUDE.md, the two stale lines only: the last verified deployment (`a7a89fd`, PRs #8–#16), and the Windows unit
  count (122/122 on `a7a89fd`).
- `docs/RESEARCH_AND_DECISIONS.md`: N7 marked "deferred to the end of the build", N8 merged, and a history row.
- `docs/ROADMAP.md`: the M1 heading (F's plan), backlog row 11 (`/privacy` deferred), and row 12 (merged).
- **Left as is:** CLAUDE.md lines 7 and 67 still say F is deferred until Tay's yes, because the brief limited CLAUDE.md
  to the two deployment lines. The next session's brief is that yes.

### Cleanup
- The scratchpad was empty; session 9's scratch files were deleted before PR #16. No `.playwright-mcp/` exists, and
  port 3400 is free.

---

## 2026-11-18 — Session 9: N8, GRAVITY FLOW's private repository name out of the tree (Claude Code)

**Scope (Tay's brief):**
- N8 only. Scrub GRAVITY FLOW's repository slug from `docs/`, and pin it in the private-repo guard next to T Poker's.
- Files: `docs/*`, `tests/support/private-repo.ts`, `tests/unit/private-repo.test.ts`, and the state docs
  (`claude/START-HERE.md`, one line in `CLAUDE.md`).
- No site code, styles, other guards, `/privacy` copy or budgets. A slug found outside `docs/` means stop and ask.
- Delete `docs/session-7-closeout` and `docs/session-8-closeout`, local and remote, after the ancestry check.
- One PR into `main` with the state docs inside it. No merge, no deploy.

Skills: `superpowers:test-driven-development` (the guard), `superpowers:verification-before-completion`.

### 1. Preconditions (VL)
- `git fetch`: `origin/main` = **`b6f0bb6`** (PR #15 merged, on top of PR #14).
- Production deployment `b6f0bb6`, GitHub status `success`.
- Local `main` fast-forwarded to `b6f0bb6`. Branch `fix/n8-gravity-flow-slug` from `origin/main` (`--no-track`), then
  `npm ci`.
- `npm test` on the untouched branch: **121/121** (14 files).

### 2. The docs scrub (VL)
- `git grep -i -I` over every tracked file found the hyphenated slug on exactly **9 lines, all in `docs/`**:
  PROJECT_CONTEXT §4.4 (1), RESEARCH_AND_DECISIONS N5 (1), ROADMAP M0.5 (1), and the WORKLOG's session 3 and M0 audit
  entries (6).
- Nothing turned up in `app`, `components`, `data`, `lib`, `public` or `tests`. No binary file matched, and no other
  spelling (underscore, dotted, joined) exists.
- Each line now says "the private GRAVITY FLOW repository" (or "a link to" it), and keeps its meaning.
- The display-name correction notes are untouched: the same 4 lines before and after.
- A scratch script made the edits. It required each old string to match exactly once and kept the files' line endings.

### 3. The guard: a test change for Tay's approval at merge (VL)
- `tests/support/private-repo.ts`: the single `PRIVATE_SLUG` digest becomes `PRIVATE_SLUGS`, a set of the SHA-256
  digests of both lower-cased slugs. T Poker's digest is unchanged, and GRAVITY FLOW's (`2157fcbe…`) is added. Only the
  digests are stored.
- `privateRepoLeaks(text, slugs = PRIVATE_SLUGS)` tests every candidate token, and each of its hyphen-prefixes, against
  the set. `slugDigest` is exported so the self-test can build throwaway digests.
- The one-argument callers are unchanged and now check both slugs: `content.test.ts`, the tracked-file scan, and
  `tests/e2e/private-repo.spec.ts`.
- **TDD:** the new self-test failed first (`PRIVATE_SLUGS` undefined), then passed.
- **The new digest catches the slug:** the new guard reports one hit (`2157fcbe…`) in each of `origin/main`'s four
  pre-scrub docs, and 0 on this branch.

### 4. The self-test (`tests/unit/private-repo.test.ts`)
- Exactly 2 digests are pinned, each 64 hex characters.
- On an injected throwaway pair of slugs, a token hashing to each is found: inside a URL path with `.git`, in upper
  case, with a hyphen suffix, and both in one text. A spaced name or a longer word is not a hit.
- Like the institution self-test, it names neither real slug. The tracked-file test is now titled "either private
  repository's name".

### 5. Branches (VL)
- `docs/session-7-closeout` (`7a235a3`, PR #13) and `docs/session-8-closeout` (`f1f147a`, PR #15): the local and remote
  tips are all ancestors of `origin/main` (`git merge-base --is-ancestor`).
- Both were deleted with `git branch -d` and `git push origin --delete`. GitHub returns 404 for both.
- **Kept:** `reference/premium-redesign-package` (local and remote), `feature/portfolio-polish`,
  `feature/premium-portfolio-redesign-1mqmgf`, and the four `review/m10-*` branches.

### 6. Validation (Git Bash)
| Command | Result |
|---|---|
| `npm test` | **122/122** (14 files): the 121 from before plus the new self-test |
| `npm run typecheck` | exit 0 |
| `npm run lint` | exit 0 |
| `npm run build`, then `GROQ_API_KEY= npx playwright test tests/e2e/private-repo.spec.ts` | 4/4 (pages, scripts, source maps, résumé PDF) |
| Scratch script: the guards' own `privateRepoLeaks` and `namesAny` over every tracked text file | 0 private-repo hits, 0 institution hits (139 files) |
| `git grep -i -I` for the slug | 0 lines |
| The same scan over both commit messages and the PR description | 0 hits each |

- Not run: the full Playwright suite. No site code changed; only the private-repo spec's check got wider.

### 7. State docs
- This entry and the change log.
- START-HERE.
- CLAUDE.md: one line, saying the guard pins both private repos.
- `docs/RESEARCH_AND_DECISIONS.md`: N8 resolved, and a history row.
- `docs/ROADMAP.md`: backlog row 12.

### Waiting on Tay
- Review the N8 PR, and approve its guard change at merge.
- Unchanged: decide F; the N7 `/privacy` wording.

---

## 2026-11-18 — Session 8 close-out: PR #14 merged, N7's Cloudflare toggles done (Claude Code)

**Scope (Tay's brief):**
- Record the state.
- Clean up scratch.
- Delete the merged `docs/backlog-n1-n2-n7`, only after the ancestry check.
- Keep `reference/*`, the six unmerged branches and `docs/session-7-closeout`; deleting that one is not authorized.
- No new task.

### State (VL)
- `git fetch --prune`: `origin/main` = **`d80cb4c`**, the PR #14 merge (merged 18:19:52Z; head `ee96fc3`).
- Production deployment `d80cb4c`, GitHub status `success` (18:20:17Z).
- `npm test` (Git Bash) on `d80cb4c`: **121/121** (14 files).
- **N7, both dashboard toggles done by Tay:** Cloudflare Web Analytics set to Disable, and Email Address Obfuscation
  set to Off.
- Checked live with browser headers, two fetches each of `/` and `/privacy`:
  - 0 beacon tags, 0 `email-protection` links, 0 decode scripts;
  - plain `mailto:` links again (2 and 1);
  - `Server: cloudflare` (still proxied).
- **Still pending Tay:**
  - the `/privacy` wording (draft in `docs/RESEARCH_AND_DECISIONS.md` N7);
  - N8, whether to scrub GRAVITY FLOW's private repository name from the docs (next session).

### Branches
- **`docs/backlog-n1-n2-n7`:** the local and remote tips (`ee96fc3`) are both ancestors of `origin/main`
  (`git merge-base --is-ancestor`). Deleted with `git push origin --delete` and `git branch -d`.
- **Kept:**
  - `docs/session-7-closeout` (local and remote);
  - `reference/premium-redesign-package` (local and remote);
  - `feature/portfolio-polish`, `feature/premium-portfolio-redesign-1mqmgf`, and the four `review/m10-*` branches.
- **New, local only:** `docs/session-8-closeout` (from `d80cb4c`) holds these docs. Tay pushes it.

### Cleanup
- The session's scratchpad files are deleted: the guard-scan script, the PR body draft, the commit-message scratch file
  and the `next start` log.
- `.playwright-mcp/` had already been removed before PR #14's commits. Port 3410 is free.

### Docs
- This entry and START-HERE.
- CLAUDE.md: the last verified deployment `d80cb4c`, the Cloudflare note, the unit-count commit.
- `docs/RESEARCH_AND_DECISIONS.md`: N7 status and a history row.
- `docs/ROADMAP.md`: backlog row 11.

---

## 2026-11-18 — Session 8: the deferred backlog. N1 and N2 done, N7 investigated (Claude Code)

**Scope (Tay's brief):**
- Docs and content only. No change to the live site's code, styles, `/privacy` copy, guard tests or budgets.
- N1: copy the reference README's text. N2: take the institution's abbreviation out of the agent docs. N7: investigate
  and propose only.
- Delete the remote `feature/m1-studio-light` once its tip is verified in `main`.
- Push a work branch and open a PR. No merge, no deploy.

Skill: `superpowers:verification-before-completion`.

### 1. Preconditions (VL)
- `git fetch --prune`: `origin/main` = **`536e34b`** (PR #13 merged). PR #12's merge `81cf15d` is an ancestor.
  Production deployment `536e34b`, Vercel status `success`.
- Local `main` fast-forwarded to `536e34b`. Branch `docs/backlog-n1-n2-n7` from `origin/main` (`--no-track`), then
  `npm ci` (Next 16.3.8).
- `npm test` on the untouched branch: **121/121** (14 files).

### 2. N1: the reference README's text
- New `docs/references/premium-redesign-README.md`: a provenance header, then the stale branch's
  `design/references/README.md`, appended with `git show` so the bytes can't drift.
- **Byte-identical:** `git hash-object` of the 52 lines under the header is `1a39ff2…`, the source blob. The staged file
  is LF, like the rest of the repo's blobs.
- No image. The PNG it describes stays on the stale branch.
- D1 (`docs/RESEARCH_AND_DECISIONS.md`), ROADMAP M1 and START-HERE now point to it.

### 3. N2: "the institution"
- Four lines spelled the abbreviation out: `CLAUDE.md:52`, `claude/START-HERE.md:82`, `docs/PROJECT_CONTEXT.md:3` and
  `docs/CREATIVE_DIRECTION.md:5`.
- Each now says "the institution" plus "not even abbreviated", or "by name or abbreviation".
- **The guard doesn't scan docs.** `content.test.ts` and `site.test.ts` read only `app`, `components`, `data`, `lib` and
  `public`. So a scratch script (not committed, no test changed) ran the guards' own `namesAny` and `privateRepoLeaks`
  over every tracked and new text file:
  - before the edit: exactly those 4 files hit the institution check;
  - after: 0 institution hits and 0 private-repo hits (139 files);
  - `git grep -w` finds the abbreviation in 0 files.

### 4. N7: Cloudflare (investigated; nothing changed)
Full findings, Tay's dashboard steps and the draft `/privacy` wording are in `docs/RESEARCH_AND_DECISIONS.md` N7.
- **Repo (VL):**
  - `git grep` finds no Cloudflare reference outside these docs.
  - The source emits plain `mailto:` links.
  - A local `next start -p 3410` of `536e34b`, fetched with browser headers, has no beacon and no external
    `<script src>` on `/` or `/privacy`.
  - The server was stopped afterwards; ports 3410 and 3400 are free.
- **Live (VL):**
  - Cloudflare nameservers and Cloudflare addresses; `Server: cloudflare` and `CF-RAY` in front of `x-vercel-id`.
  - The beacon is injected only into requests that accept HTML. It was in 3/3 fetches with browser headers, and in none
    with curl's default `Accept`. That explains a plain `curl` missing it.
  - Chromium (Playwright MCP) visited the live home page:
    - the beacon is blocked by the CSP (console error, request `FAILED csp`, no `__cfBeacon`);
    - **new:** `/cdn-cgi/scripts/…/email-decode.min.js` loads with 200 and runs;
    - Email Address Obfuscation rewrites all three `mailto:` links on `/` and `/privacy` to
      `/cdn-cgi/l/email-protection#…`, and the decode script turns them back.
  - No `Set-Cookie` on either page.
- **The origin can't be checked directly:** the Vercel deployment URL answers 302 to Vercel Authentication. The local
  build stands in.
- **Dashboard paths (VD):** read from developers.cloudflare.com by a web-fetch subagent. The `/privacy` draft stays within
  Cloudflare's privacy policy §2 and §6.
- `/privacy` and `tests/e2e/privacy.spec.ts` were not touched.

### 5. Branches
- **`feature/m1-studio-light`:** nothing to delete. Its tip `63073bf` (PR #11's head) is an ancestor of `origin/main`.
  GitHub answers 404 for the branch, and `git ls-remote` doesn't list it: session 7's close already deleted it.
- **`docs/session-7-closeout`** (local and remote): merged (PR #13; tip `7a235a3` is an ancestor). Kept, because the
  brief didn't name it. It waits on Tay's yes.
- Kept as before: `reference/premium-redesign-package` and the six unmerged remote branches.

### 6. New: N8
The private-repo guard hashes only T Poker's name. GRAVITY FLOW's private repository name is still in nine doc lines.
Logged in `docs/RESEARCH_AND_DECISIONS.md` with a recommendation; not changed (out of scope).

### 7. Validation (final tree)
| Command | Result |
|---|---|
| `npm test` (Git Bash) | **121/121** (14 files) |
| `npx vitest run tests/unit/private-repo.test.ts tests/unit/content.test.ts tests/unit/site.test.ts` | 30/30 (the institution and private-repo guards) |
| `npx next typegen` · `npm run typecheck` · `npm run lint` | ✓ · exit 0 · exit 0 |
| Scratch scan with `namesAny` + `privateRepoLeaks`, docs included | 0 · 0 |
| `npm run build` | exit 0 (for the N7 local check) |

Playwright was not run: the diff is docs only, and no app file changed.

### 8. Docs
- New: `docs/references/premium-redesign-README.md`.
- `docs/RESEARCH_AND_DECISIONS.md`: the D1 pointer; N1 and N2 resolved; N7 rewritten; N8; a history row.
- `docs/ROADMAP.md`: the M1 criterion and backlog rows 11–12.
- This entry, START-HERE, and CLAUDE.md (the N2 line, the last verified deployment, a Cloudflare note, the unit-count
  commit).
- The N2 header comments in `docs/PROJECT_CONTEXT.md` and `docs/CREATIVE_DIRECTION.md`.

---

## 2026-11-18 — Session 7 close-out: the M1 core (A–E) is live (Claude Code)

**Scope (Tay's brief):** record the current state: the M1 core (A–E) is merged and live after PR #12, F is deferred
to Tay's call after previewing A–E live, and the N1 / N2 / N7 backlog is still open. Clean up scratch, delete the
work branches fully merged into `main` (the remote `feature/m1-studio-light` included), PR anything uncommitted, and
confirm `main` is clean.

### 1. State (VL)
- `git fetch --prune`: `origin/main` = **`81cf15d`**, the PR #12 merge (17:41:47Z).
- GitHub Production deployment `81cf15d`, status `success` (17:42:12Z).
- A read-only `curl` of https://www.tayshofer.dev/ returns 200. Its CSS carries E's `.more-work__row` plate
  (`--bg-raised`, key, rim and hairline insets) and `.tbs__word { font-size: var(--text-h3) }`.
- `npm test` (Git Bash) on `81cf15d`: **121/121** (14 files).

### 2. Branches
Each was checked with `git merge-base --is-ancestor <branch> origin/main` before it was deleted:

| Branch | Tip | PR | Deleted |
|---|---|---|---|
| `feature/m1-lower-half` | `010a924` | #12 | local and remote |
| `feature/m1-studio-light` | `63073bf` | #11 | remote (local deleted in session 7) |
| `docs/m1-pr1-closeout` | `d74db81` | #10 | remote (local deleted in session 7) |

Kept, because they are not merged (D8: delete only on a per-branch yes): `feature/portfolio-polish`,
`feature/premium-portfolio-redesign-1mqmgf`, the four `review/m10-*` branches, and `reference/premium-redesign-package`.

### 3. Cleanup
- Session 7's measuring scripts and before/after shots are gone from the scratchpad. None were in the repo.
- No server is listening on :3400, :3411 or :3412.
- The ignored `.preview/` folder (screenshots from June, before these sessions) was left untouched.

### 4. Docs (`docs/session-7-closeout`)
- This entry.
- START-HERE: what's live, what's next, branches, waiting on Tay.
- CLAUDE.md: the state line, the last verified deployment (`81cf15d`), F's condition, and the unit count.
- `docs/M1_VISUAL_PLAN.md`: the status banner, and B and E marked live in the approval list.
- `docs/ROADMAP.md`: the M1 heading.

### 5. Waiting on Tay
- **F** (yes/no), after previewing A–E live.
- **N1, N2, N7**, still open (`docs/RESEARCH_AND_DECISIONS.md`).
- The 390px Think · Build · Ship note (session 7, §4).
- The D8 remainder.

---

## 2026-11-18 — Session 7: M1 PR 3 (E lower half, TBS h3 tier) + the Email-me contrast guard (Claude Code)

**Scope (Tay's brief):**
- A, C, D and B are live. This session implements E; **F stays deferred and was not built.**
- Task 1: an additive `tokens.test.ts` guard, approved. It is the only test change this session.
- Task 2: Move E.
- Task 3: `.tbs__word` onto the h3 tier.
- CSS and tokens only.
- Push a work branch and open a PR; no merge, no deploy.

Skill: `superpowers:verification-before-completion`.

### 1. Preconditions (VL)
- `git fetch`: `origin/main` = **`f55fc45`**, PR #11 merged at 08:11:46Z. Production deployment `f55fc45`, status `success`.
- Branch `feature/m1-lower-half` from `origin/main` (`--no-track`), then `npm ci`.

### 2. Task 1: the guard (`4fffff5`)
- In `tokens.test.ts`, one `it` inside the per-theme `describe.each`, so it runs in both themes.
- It asserts that `--accent-solid` and `--accent-solid-hover` are each ≥ 3:1 against `--bg-raised` (where Contact's
  "Email me" sits) and against `--bg`.
- It uses the file's own `ratio()`. No existing floor was changed.
- **Green** on `main`: 15/15 in the file.
- **Red** with the pre-PR-#11 `globals.css` (`8f1dd5b`) swapped in temporarily: `expected 2.824454239779803 to be
  greater than or equal to 3`. The working file was then restored with `git restore`.

### 3. Task 2: Move E (`a4d0e99`)
- **Two more:** each `.more-work__row` (class kept: `private-repo.spec.ts:51` locates it) is now a paper plate.
  - The surface is `--bg-raised` with an 18px radius and the padding `clamp(1.5rem, 3vw, 2.25rem)`.
  - The edges: B's key on the top edge and rim on the right, then a `--border-subtle` hairline ring. Static.
  - It re-binds `--fg-subtle` to `--fg-subtle-raised`, as `.raised` does.
  - The actions sit on each plate's floor (`margin-top: auto`), so the two rows line up side by side. The plates
    stack on phones.
  - The ruled rows' `border-top` is gone, and the grid gap is 12px, like the hero's plates.
  - Copy and markup are unchanged. `MoreWork.tsx` changed only in its doc comment.
- **About and Contact titles:** the `span { color: var(--fg-subtle) }` rules are deleted, so both lines are `--fg`
  (plan §7).
- **Measured** in Chromium:

  | | Light | Dark |
  |---|---|---|
  | Context line and private-source label on the plate (floor 5.4) | 6.32 | 6.18 |
  | Link on the plate | 6.82 | 8.16 |

  Both title lines read `rgb(12, 13, 16)` in light and `rgb(242, 244, 248)` in dark.

### 4. Task 3: Think · Build · Ship (`f9e6bed`)
- `.tbs__word` changed from `clamp(1.75rem, 1.4rem + 1.2vw, 2.5rem)` / 1 / 620 / −0.035em to the plan's h3 tier:
  `var(--text-h3)` / 1.2 / 600 / −0.02em.
- **Measured:**

  | Width | Title | Row words before | Row words after |
  |---|---|---|---|
  | 1440 | 42px | 39.68px | **26px** |
  | 390 | 30px | 28px | **20.33px** |

- **For the preview:** at 390 the word (20.33px, 600) sits close to `.tbs__line` (19px, 600). The plan's values were
  kept, with no invention.

### 5. Validation (code tree `f9e6bed`)
| Command | Result |
|---|---|
| `npx next typegen` | ✓ Types generated |
| `npm run typecheck` / `npm run lint` | exit 0 / exit 0 |
| `npm test` (Git Bash) | **121/121** (14 files): 119 plus the new guard in two themes |
| `npm run build` | exit 0 |
| `GROQ_API_KEY= npx playwright test` | **132/132** (1.9 min), incl. `budget.spec.ts`, `private-repo.spec.ts`, axe in both themes at 1440/390 |
| Budgets (`budget.spec.ts` method) | JS **181.79 KiB** gzip (= main; ≤ 205.7), HTML **156.44 KB** (= main; ≤ 568), CSS 16.75 → 16.76 KiB gzip |

Before and after shots of Two more, About, Think · Build · Ship and Contact (1440/390, both themes) were taken in
scratch and not committed.

### 6. Docs
- This entry.
- START-HERE.
- The status line in `docs/M1_VISUAL_PLAN.md`: E done, only F (optional) left.
- CLAUDE.md: the state line and the last verified deployment.

---

## 2026-11-18 — Session 6: M1 PR 2 (B studio light) + the dark "Email me" a11y fix (Claude Code)

**Scope (Tay's brief):** Move B approved; E/F wait until B is previewed. Task 1: restore the dark "Email me" button's
non-text contrast to ≥ 3:1 (WCAG 1.4.11). Task 2: Move B per `docs/M1_VISUAL_PLAN.md`. CSS and tokens only: no new
JavaScript, dependencies or fonts; no guard, budget or contrast test touched. Push a work branch and open a PR; no merge,
no deploy. Skill: `superpowers:verification-before-completion`.

### 1. Preconditions (VL)
- `git fetch`: `origin/main` = **`8f1dd5b`** (PR #10 merged 07:53:42Z). PR #8 (`3103bfd`) and PR #9 (`f698c74`) are
  ancestors (`git merge-base --is-ancestor`). Production deployment `8f1dd5b`, status `success`.
- Branch `feature/m1-studio-light` from `origin/main` (`--no-track`), `npm ci` (Next 16.3.8).
- `npm test` on the untouched branch: **119/119**, `private-repo.test.ts` green.

### 2. Task 1: dark "Email me" (`40412cd`)
Measured in Chromium on `next start` (computed colours of the button and `#contact`). Ratios use the
`tokens.test.ts` formula:

| Dark theme, against raised `#16181d` | Before | After |
|---|---|---|
| Fill at rest (non-text, floor 3) | `#4f46e5` **2.82:1** | `#5651f0` **3.24:1** |
| Fill on hover (non-text, floor 3) | `#4338ca` **2.25:1** | `#5e5bfa` **3.68:1** |
| White label at rest / hover (floor 4.5) | 6.29 / 7.90 | **5.48 / 4.82** |
| Chat launcher icon (same token) | 2.82 | 3.24 |

- The new values keep `#4f46e5`'s hue and chroma and move one OKLCH lightness step up (0.511 → 0.541).
- The hover lightens instead of darkening, as dark `--accent-hover` already does. A darker hover can't clear 3:1 here.
- The light theme is unchanged: 6.82:1 at rest and 8.19:1 on hover, on white.
- The plan's alternative, a 1px light ring, would keep the white label at 6.29. A fill was chosen because:
  - the whole shape clears 3:1, not only a hairline;
  - one token also fixes the launcher icon;
  - no component file changes.

### 3. Task 2: Move B (`b5941cf`)
- **Tokens:** `--light-key` / `--light-rim` are set in `:root` with the plan's §5 values: `rgba(255,255,255,0.80)` and
  `rgba(8,145,178,0.18)`. The dark pair is `rgba(255,255,255,0.09)` and `rgba(103,232,249,0.22)`. It applies on
  `[data-theme="dark"]` and on everything dark in both themes that sits outside a dark scope:
  - the hero's three dark plates;
  - every phone and window.

  Without that, a light-theme dark object got the 0.80 white key. A `data-theme="dark"` scope there would also re-ink
  the hero focus ring, which sits on paper.
- **Hero plates:** the key (top edge) and the rim (right edge) sit on a `.tile::after` layer over the plate.
  - It fades in once: `tile-light`, 700ms `--dur-light`, `--ease-out-expo`.
  - Each plate starts 70ms (`--stagger`) after the one before, in DOM order, which is the reading order in every
    layout.
  - Under OS reduced motion or the site's switch, the animation isn't declared, so the light is lit at first paint.
  - Hover and focus fade in a second key on `::before` (opacity, 240ms).
- **Objects:** the same pair, static.
  - Phones (`.tile__phone`, `.pphone`, `.gf__phone`): an inset on the bezel.
  - Windows (`.tile__win`, `.console`, `.dwin`): an `::after` layer, because the title bar and the capture cover an
    inset. `.dwin` gains `position: relative` for this.
- **Verified in Chromium (scratch probe):**
  - With motion: four animations, delays 0/70/140/210ms, 700ms each, 1 iteration. All finished by 1.5s, and the
    plate light is at opacity 1.
  - With OS reduced motion, and with the site switch (`data-reduced-motion="true"`): no animation; opacity 1 at
    first paint.
  - Hover: `::before` 0 → 1.
  - The only animations still on the page are the existing About collage (scroll-driven) and the chat launcher's
    entrance.
- **Two deviations from the plan, for Tay's preview:**
  1. *No 2px plate lift on hover* (§9/§10). The hero plates meet the T Poker chapter flush, and `hero.css` already
     lifts the device instead so that no seam opens. That lift is unchanged.
  2. *No key on the chapter plates' top edge* (§8). It was implemented, then removed after zoomed (3×) screenshots
     showed what it did:
     - on Aegis/DeveloperOS/GRAVITY FLOW, a hard 1px rule at the end of each static seam;
     - on T Poker, a hairline under the hero plates.

     Both undo the seams the plan keeps. The chapters' light is on their devices and windows.
- **Untouched:** TSX, JS, tests, fonts, dependencies, the captures. The About collage stays unchanged (plan §8).

### 4. Validation (final tree `b5941cf`)
| Command | Result |
|---|---|
| `npx next typegen` | ✓ Types generated |
| `npm run typecheck` / `npm run lint` | exit 0 / exit 0 |
| `npm test` (Git Bash) | **119/119** (14 files) |
| `npm run build` | exit 0 |
| `GROQ_API_KEY= npx playwright test` | **132/132** (1.9 min), incl. `budget.spec.ts`, axe in both themes at 1440 and 390 |
| Budgets (`budget.spec.ts` method) | JS **181.79 KiB** gzip (= main; ≤ 205.7), HTML **156.44 KB** (= main; ≤ 568), CSS 16.45 → 16.75 KiB gzip |

Review screenshots (1440/390, both themes, hero, chapters, contact, plus 3× edge crops) were taken in scratch, not
committed.

### 5. Docs
- CLAUDE.md: the "last verified" deployment is now `8f1dd5b`.
- CLAUDE.md, new gotcha: Playwright reuses a server already on :3400. On Windows, a backgrounded `npx next start` can
  leave its `node` child on the port after the task stops.
- CLAUDE.md N6 note: PR #10 had already rewritten the stale note the brief named (`:87`, now `:88–90`), and it is
  accurate.
- START-HERE: brought to this state.

---

## 2026-11-18 — Session 5: M1 PR 1 (A iris, C type tiers, D motion tokens), live (Claude Code)

**Scope (Tay's brief):** M1 moves A–E approved, F deferred until Tay previews A–E, keep Geist. Implement PR 1 only
(A, C, D) with the plan's exact values; the only permitted test edit is the focus-ring assertions in
`tests/e2e/chrome.spec.ts`; push a work branch and open a PR; no merge, no deploy. Skills:
`superpowers:executing-plans` (rulings ledger, one fresh-context reviewer at the end),
`superpowers:verification-before-completion`.

### 1. Preconditions (VL)
`git fetch`: PR #7 (`5574007`) and PR #6 (`eb361ff`) merged into `origin/main`. Branch
`feature/m1-iris-type-motion` from `eb361ff`, then `npm ci` (Next 16.3.8). Baseline on `main`: first-load JS
181.79 KiB gzip, HTML 156.43 KB.

### 2. PR #8: what changed (all values from `docs/M1_VISUAL_PLAN.md` §5–§7; ratios re-computed with the
`tokens.test.ts` formula and matching §6)
- **A `ed45701`:** `--accent` and family become iris in both themes, all five plate scopes and both
  high-contrast blocks. The plan didn't list two other cobalt literals, and both now follow the tokens: the
  T Poker store-badge hover glyph (`poker.css:30`) and the unused `lib/tokens.ts` mirror. Test edit:
  `chrome.spec.ts:268-273`, the two assertions → `rgb(74, 63, 224)` / `rgb(177, 180, 255)`, plus the title's
  colour words per §11. RED on main's CSS first (`rgb(26, 79, 224)`), then GREEN.
- **C `6ce668a` + `2bc7f16`:** `--text-chapter` (the old h2, 36→64) for chapter titles and the case-study title
  (now also 620 / line-height 1.0, per §7). `--text-h2` 30→42 at 600 / 1.05 / `--tracking-heading` for Two more,
  About, Stack, Think/Build/Ship and Contact, which used three sizes before. `--text-lead` 18→21 (chapter ledes now
  use it, per §7). `--text-h3` has a new value but no consumer yet. The privacy, 404 and error page titles were
  re-pointed to `--text-chapter` and are pixel-identical.
- **D `ddff7ac`:** `--dur-fast` 180ms (= `lib/motion.ts` `DUR.fast`), `--dur-light` 700ms, `--stagger` 70ms
  (the last two are for B). The theme glyph and menu sheet moved onto `--dur-fast`, and the header onto
  `--dur-mid`; both are unchanged. The nav underline goes 200 → 180ms, the one timing change (§5). The menu
  panel's 240ms and the 140ms exit stay as literals.
- A fresh-context reviewer read the whole diff. It found nothing Critical and confirmed every value. Two of
  its points were applied in `2bc7f16`. Raised for Tay's preview:
  - the Think · Build · Ship title barely outranks its row words (42 vs ≈40px);
  - the dark solid iris fill is 2.82:1 against the raised page.

| Command (`2bc7f16`) | Result |
|---|---|
| `npx next typegen` / `npm run typecheck` / `npm run lint` | ✓ / exit 0 / exit 0 |
| `npm test` | 118/119: the one failure was pre-existing on `main` (see 3) |
| `npm run build` | exit 0 |
| `GROQ_API_KEY= npx playwright test` | **132/132** (1.9 min) |
| Budgets (`budget.spec.ts` method) | JS **181.79 KiB** (= main), HTML 156.44 KB, CSS +0.02 KiB gzip |

### 3. PR #9: the private-repo guard was failing on `main` (VL)
`tests/unit/private-repo.test.ts` ("no tracked text file carries the private repository's name") failed on
`main` since `1d81f4d` (session 4 docs, PR #6). That commit had named T Poker's private repository in
`RESEARCH_AND_DECISIONS.md:105` and in this file at `:43` and `:78`. Fixed on `fix/docs-private-slug`
(`747274e`): each mention now reads "the private T Poker repository". Unit 119/119; the guard test itself is
unchanged. Lesson recorded in CLAUDE.md: docs are scanned too.

### 4. Merged and live (VL, close-out)
- Tay merged PR #8 (`3103bfd`, 07:46:54Z) and PR #9 (`f698c74`, 07:48:53Z).
- Production deployment `f698c74`: status `success`. A `curl` of https://www.tayshofer.dev/ serves the iris,
  `--text-chapter` and `--dur-fast` tokens.
- `main` at `f698c74`: unit **119/119**, typecheck, lint. Its code is identical to PR #8's head (only #9's docs
  differ), which ran Playwright 132/132.

### 5. Cleanup
- Branches deleted locally and on `origin`, each verified first as an ancestor of `origin/main`:
  `feature/m1-iris-type-motion` (`2bc7f16`), `fix/docs-private-slug` (`747274e`), `fix/m0-followups` (`37ba41c`),
  `docs/m0-closeout` (`1d81f4d`).
- Kept: `reference/premium-redesign-package` and six unmerged remote branches.
- Scratch removed: the ledger, logs, probe scripts, review screenshots and the docs-fix worktree.

**Next:** M1 PR 2 = Move B, plus the dark "Email me" button a11y fix (numbers in `claude/START-HERE.md`). Then E,
then F if approved.

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
- No link to the private GRAVITY FLOW repository in the page.
- No "swappable detail".
- The Contact label reads "two pages, 79 KB".
- The Aegis and DeveloperOS repo links are still present.
- `/resume/Tay-Shofer-Software-Engineer-Resume.pdf` is 80,593 bytes, byte-identical to `main`'s file, with
  no link to the private GRAVITY FLOW repository.

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
  - `e105917`: the **served résumé PDF** loses the dead link to the private GRAVITY FLOW repository and its
    "· GitHub" text (Tay's PyMuPDF redaction script, run on a copy because PyMuPDF won't save over the open
    file; PyMuPDF lived in a scratch venv only). Verified against the original:
    - URI links 13 → 12; only the link to the private GRAVITY FLOW repository was removed.
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
2. **Broken link on the live site.** The site links what is now the private GRAVITY FLOW repository (`gh api`:
   visibility private, last push 2026-11-09). A logged-out `GET` of that link returns
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
| 2026-11-18 | Session 5 | M1 PR 1: A iris, C type tiers, D motion tokens (PR #8, merged `3103bfd`, live) | `app/globals.css`, section/work CSS, `CaseStudyPanel.tsx`, page titles, `lib/tokens.ts`, `tests/e2e/chrome.spec.ts:268-273` |
| 2026-11-18 | Session 5 | Private T Poker slug removed from the docs; `main` green again (PR #9, merged `f698c74`) | `docs/RESEARCH_AND_DECISIONS.md`, `docs/WORKLOG.md` |
| 2026-11-18 | Session 5 | Close-out: four merged branches deleted; state docs, M1 plan status, ROADMAP, CLAUDE.md:87 note | `docs/*.md`, `claude/START-HERE.md`, `CLAUDE.md` |
| 2026-11-18 | Session 8 | N1: the reference README's text copied byte for byte, with no image | `docs/references/premium-redesign-README.md`, `docs/RESEARCH_AND_DECISIONS.md` (D1) |
| 2026-11-18 | Session 8 | N2: the abbreviation replaced with "the institution" | `CLAUDE.md`, `claude/START-HERE.md`, `docs/PROJECT_CONTEXT.md`, `docs/CREATIVE_DIRECTION.md` |
| 2026-11-18 | Session 8 | N7 investigated (beacon + Email Address Obfuscation at the Cloudflare edge; draft `/privacy` wording); N8 logged; state docs | `docs/RESEARCH_AND_DECISIONS.md`, `docs/ROADMAP.md`, `docs/WORKLOG.md`, `claude/START-HERE.md`, `CLAUDE.md` |
| 2026-11-18 | Session 8 close | PR #14 merged (`d80cb4c`, live); N7 Cloudflare toggles done by Tay, verified live; `docs/backlog-n1-n2-n7` deleted; state docs | `docs/WORKLOG.md`, `claude/START-HERE.md`, `CLAUDE.md`, `docs/RESEARCH_AND_DECISIONS.md`, `docs/ROADMAP.md` |
| 2026-11-18 | Session 9 | N8: GRAVITY FLOW's private repository name scrubbed from 9 doc lines; the private-repo guard pins both private repos by digest (guard change for Tay's approval); `docs/session-7-closeout` and `docs/session-8-closeout` deleted; state docs | `docs/*.md`, `tests/support/private-repo.ts`, `tests/unit/private-repo.test.ts`, `claude/START-HERE.md`, `CLAUDE.md` |
| 2026-11-18 | Session 9 close | PR #16 merged (`a7a89fd`, live); `fix/n8-gravity-flow-slug` deleted; `/privacy` wording deferred to the end of the build; Move F to be built on a preview branch next session; state docs | `docs/WORKLOG.md`, `claude/START-HERE.md`, `CLAUDE.md`, `docs/RESEARCH_AND_DECISIONS.md`, `docs/ROADMAP.md` |
