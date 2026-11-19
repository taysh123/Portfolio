# Worklog

Running log of sessions on the portfolio. Newest first. Each entry records what was checked, what
changed, and what is waiting on Tay.

**Labels used in audit entries**
- **VL** = VERIFIED LOCALLY. Observed in-session from this machine: local files and git objects, plus
  read-only `gh api` / `git ls-remote` against GitHub and a read-only `curl` of the live site.
- **VD** = VERIFIED FROM OFFICIAL DOCS (with URL).
- **NC** = NEEDS CONFIRMATION (inferred, partial, or depends on something not inspected).

---

## 2026-11-19 — Session 14: Think · Build · Ship (P3.5) on `/lab/work`; a glow scroll-anchor fix (prototype, D1 reopened) (Claude Code)

**Scope (Tay's brief):**
- Sync: `main` at `443a1f9`, this branch at `47998ee`.
- One task: the Think · Build · Ship section (P3.5) on `/lab/work`, below Stack. Lab-only; `/` untouched.
  - The live section's title, rows and lines word for word; every word from facts already in the repo. No metrics, test
    counts, years or institution. Each stage points to real evidence from the four flagships, from what
    `data/projects.ts` states; Aegis's AI is a deterministic mock and Aegis a modular monolith.
  - Short and scannable. The `.cine` tokens; no client JS without showing why first; it holds still, like About.
  - ROADMAP #14: check whether Stack's end-of-page hold is still needed now that this section sits below, or leaves an
    empty gap. Measure and recommend; don't change the hold or its test without Tay's OK.
- Step 1 a plan only (the exact copy, each line's source, the layout); Step 2 build and measure as last session; `/`,
  its stylesheet bytes, `/lab/hero-a` and the guards unchanged; screenshots at 390 and 1440 in scratch. Commit, push,
  update draft PR #18 (no merge, no deploy), the Preview URL. Don't close the session until Tay approves.

### 1. Preconditions (VL)
- `git fetch`: `origin/main` = **`443a1f9`**; local `main` level with it, clean.
- `proto/hero-a-cinematic` at **`47998ee`**, level with its remote, clean.

### 2. The plan and Tay's answers
- The plan kept the live title and rows word for word (`dict.tbs.title`, `pillars` in `data/approach.ts`), each live
  example being from one flagship (T Poker, GRAVITY FLOW, Aegis), and added one DeveloperOS line under Build so all four
  appear. The copy, every line with its source: `docs/CINEMATIC_SYSTEM.md`, "Think · Build · Ship (P3.5, session 14)".
- **Tay approved it with one change:** the plainer DeveloperOS line, "DeveloperOS: it declines when the index doesn't
  support an answer—before the provider is ever reached." The layout and the #14 approach as proposed.

### 3. What changed
- **`8382889`, the section:**
  - `app/lab/work/tbs.ts` reads every live string from `lib/dict.ts` and `data/approach.ts`; only the DeveloperOS line
    is typed (`DOS_EVIDENCE`). Each piece of evidence is split so its project's name can be set apart.
  - `TbsBlock.tsx`, a server component, renders it after Stack, inside `<main>`: the h2, then an ordered list of three
    rows (the word as an h3 with the live screen-reader colon, the line, the summary, the evidence).
  - `work.css`: its rules, layer tokens only. Its title shares About's and Stack's rule (top margin reset: no eyebrow).
    From 1024px the word and line take 5fr and the summary and evidence 7fr, lined up under About's words; stacked
    below. The word is a small label in the accent, the line in ink at the lead size, the evidence in mist with the
    project's name in ink.
  - **No token added** (the layer still defines 76). No client code, no link, no control, no reveal.
  - Tests: 8 unit (every string held to its source, the approved copy pinned, the DeveloperOS line's words found in
    its own text, no figure, all four flagships once) and 7 e2e (no JS; holds still ×2; layout at 1440, 1024, 390 and
    320, with the page's last line clearing the chat launcher). Two placement assertions and the structure test's h2
    count now include the section.
- **`d1c53a3`, no glow is a scroll anchor** (found by the #14 check, section 5): `overflow-anchor: none` on the two
  glows, and a new e2e test (red without the fix). The hold and its test are unchanged.

### 4. Measured (VL; local production builds, `47998ee` in a scratch worktree vs `d1c53a3`)
| | before | after |
|---|---|---|
| First-load JS `/lab/work` (the budget algorithm) | 181.77 KiB | **181.77 KiB** (every JS file byte-identical); budget 205.7 |
| HTML `/lab/work` | 97.66 KB (17.7 KB gzip) | **102.79 KB** (18.9 KB gzip); budget 568 |
| LCP desktop, median (range), 10 interleaved | 108 ms (96–116) | 110 ms (80–120) |
| LCP phone, 4× CPU and slow 4G, median (range), 10 interleaved | 968 ms (916–1060) | 1010 ms (952–1076) |
| CLS (load) | 0 | 0 |
| INP desktop / phone (`scripts/lab-hero-a.mjs`, worst per run, median) | 24 / 32 ms | 24 / 32 ms |
| FPS desktop / phone | 60.5 / 60.6 | 60.5 / 60.5 |

- **LCP:** a first round of 10 on `8382889` (before the glow fix, which adds 21 bytes of CSS and no layout) gave
  desktop 102 → 110 ms and phone 966 → 1038 ms; this round +2 and +42 ms. The LCP and FCP medians are equal, and the LCP
  element is the first capture.
- **The phone cost, diagnosed** (10 interleaved runs per variant, every variant through the same interception): the
  baseline 824 ms; this build 932; this build with the section's markup cut from the HTML 858; with
  `content-visibility: auto` on the section 852. So most of it is laying out the section's 32 elements before the first
  paint, the same kind of cost as Stack's, and the same fix (ROADMAP #13, with the glow) would win it back. Not used.
- **INP on the section's words** (3 runs; clicks or taps on its line, summary and evidence): desktop ≤ 16 ms; phone at
  4× CPU 24–32 ms. On About's words: < 16 / 16–24 ms before, 16 / 24 ms after.
- **Scroll-through CLS** (down and back up twice): the slice 0 before and after; the chat launcher's fold 0.0153 in both
  (pre-existing).
- **axe-core 4.11.4, WCAG 2.2 A/AA:** 0 violations at 1440 and 390, motion on and reduced, with Aegis pressed (the e2e
  suite and a probe). Needs review: at 390 the same two as before (the lede, T Poker's line); at 1440 none. The same in
  both builds.
- At the page's end the last line clears the chat launcher by 150px at 1440 and 102px at 390 and 320.
- **Built files:** 24 of 25 JS and CSS files byte-identical (all 20 JS). The lab's Work stylesheet: 14,121 → 15,401
  bytes.

### 5. ROADMAP #14: Stack's hold, with this section below it (VL)
`StackFilter.tsx` holds `max(0, view height − results top − everything below the results)`, so this section's height
now counts in "everything below". Measured on the final build (reduced motion; each project pressed from the keyboard):

| Screen | Buttons near the view's top | Buttons near its bottom | At the page's end (buttons out of view above) |
|---|---|---|---|
| 1440×900 | hold 0 | 0 | 1,096px; 579–815px of space under the filtered list |
| 390×844 | 0 | 0 | 1,619px; 903–1,215px of space |
| 1920×1200 | 128px, no space left | 0 | as at 1440×900 |
| 2560×1440 | 368px; 0–87px of space | 0 | as at 1440×900 |
| 1440×1800 | 729px; 212–448px of space | 0 | as at 1440×900 |

- Without the hold, the view would jump by exactly the space it leaves. With it, the view moves 0px in every case.
- **The space now sits between the filtered Stack and this section,** not at the page's end. It shows only on tall screens
  with the buttons near the top, or after a project is pressed with the buttons out of view (keyboard only), and only
  until All is pressed.
- **Recommendation: keep the hold as it is.** It is 0 at the common sizes whenever the buttons are in view, and it
  engages only by as much as a jump would be. The test's case 2 still exercises it; its comment ("Stack ends the
  page") is now out of date. Not changed (Tay's call).

**Found on the way: the glow anchored the scroll.**
- With the buttons low in the view, pressing a project moved the view up: 220–310px at 1440×900, 343–462px at 390×844.
  The hold was 0 there.
- **Cause:** the browser's scroll anchoring took the violet glow (at 38% of the page's height) as its anchor. When the
  list got shorter the glow moved up, and the view went with it: each jump is 0.38 × the page's shrink.
- **Pre-existing:** the baseline jumped the same way on tall screens (1920×1200, 2560×1440, 1440×1800). This section
  made the page tall enough to bring the glow into view at the common sizes too.
- **Fix (`d1c53a3`):** the glows opt out of anchoring. Leaving out the whole sky also fixed it, but at 390 the page's end
  then anchored to the text in view and moved the view by the hold's 1px rounding, which the hold's test caught. With
  only the glows left out, everything else anchors as before.

### 6. Unchanged (VL)
- **`/`, `/lab/hero-a`, `/privacy`:** every script and stylesheet byte-identical; the markup identical with build IDs
  masked. `/`'s stylesheets keep the pinned digests (`868e8b98…` 44,530 bytes; `4b84cc35…` 31,805).
- **Pixels (reduced motion, full page):** `/` 0 differing at 1440 and 390; the hero 0 with its canvas hidden;
  `/lab/work` from the top to Stack's end 0, with the sky and glows hidden.
  - With only the glows hidden it differs on most of its area by 1–3 levels of 255: the sky is one gradient over the
    whole page, so the taller page stretches it. Nothing else.
- **Guard files** identical to `origin/main` (`443a1f9`).

### 7. Validation (Git Bash)
| Command | Result |
|---|---|
| `npm test` | **208/208** (200 before, plus 8) |
| `npm run typecheck`, `npm run lint` | exit 0 |
| `npm run build`, then `GROQ_API_KEY= npx playwright test` | **204/204** (195 before, plus 7 for the section and 2 for the glow fix) |

### 8. Screenshots (scratch, not committed)
- At 1440 and 390: the section (motion on and reduced), the view a reader scrolls to, the seam from Stack, the page's
  end, and the full page.

### Waiting on Tay
- Review the section on the Preview.
- #14: keep the hold as it is (recommended)? And a go to reword the hold test's out-of-date comment.
- The glow fix (`d1c53a3`): keep it, or drop it.
- The phone LCP cost (+42 ms this round, +72 the first): keep it, or fold the section into #13's fix.

---

## 2026-11-19 — Session 13 close-out: Stack approved; its LCP cost kept and logged for P5 (Claude Code)

**Scope (Tay's brief):**
- Stack is approved. Keep the LCP cost, and log the `content-visibility` fix with the glow's repositioning as a P5
  (integration) item. Keep the live evidence sentences word for word.
- Log for the Contact session: the filter's end-of-page hold assumes Stack ends the page; re-check it once Contact sits
  below.
- Close out: WORKLOG, START-HERE, CLAUDE.md (with the stale `121d86b` reference) and the memory, on this branch. Push;
  PR #18 stays a draft. Remove the `d64763d` baseline worktree, clean scratch, and confirm `main` is clean and level
  with `origin/main`.

### Decisions (Tay)
- **Stack is approved** as built (`8955039`).
- **The LCP cost stays** (+14 ms desktop, +46 ms on a phone at 4× CPU). Logged as **`docs/ROADMAP.md` #13**, P5
  (integration): `content-visibility: auto` on Stack together with anchoring the violet glow.
- **The seven live evidence sentences stay word for word** (two name Job Assistant and Orders & Delivery).
- **Logged for the Contact session as `docs/ROADMAP.md` #14:** re-check the filter's hold once Contact sits below Stack.

### Docs and memory
- `CLAUDE.md`:
  - the prototype's code is `8955039` (it said `121d86b`), and Production was last verified at `443a1f9` (PRs #8–#20);
  - Stack is named on `/lab/work`, and the branch's WORKLOG covers sessions 10–13;
  - the prototype's unit suite is 200/200;
  - one new gotcha: the build fetches Geist from Google Fonts, so a network blip fails it (seen this session; retry).
- `claude/START-HERE.md`: Stack approved, the two logged items, and what waits on Tay.
- `docs/CINEMATIC_SYSTEM.md`: Stack marked approved; the cost line points at #13, and the hold at #14.
- `docs/ROADMAP.md`: backlog rows #13 and #14.
- The memory's state note and its measurement lessons: the session 13 state, and two lessons (a section that ends the
  page pulls the view up when it shrinks; a text line whose height changes with its content must sit inside the held
  box).

### Clean-up
- Removed the `d64763d` baseline worktree (`git worktree list` shows only the main checkout).
- Cleaned the scratchpad: the screenshots, probe scripts, logs and PR-body drafts.

### State (VL)
- `origin/main` = **`443a1f9`** = Production (`success`). Local `main` level with it, and clean.
- This branch: the code is `8955039`; the docs are on top. PR #18 is a draft.
- Validation after these docs (Git Bash): `npm test` 200/200; a production build's `/` Tailwind sheet at `868e8b98…`
  (44,530 bytes), and the pinned-stylesheet e2e test passes.

### Waiting on Tay
- **Decide what Concept A takes on next.**
- Swap the GRAVITY FLOW capture he has in mind. Move F: still his call.
- Optional, on `main`: the chat launcher's fold on scroll (0.0076 CLS).

---

## 2026-11-19 — Session 13, third pass: Stack's filter shows only the chosen project's tools, as pills (prototype, D1 reopened) (Claude Code)

**Scope (Tay's review of the second build):** he likes the colour change, but the filter is not clear enough.
- Every tool a pill: outlined under All, filled cyan for the chosen project's tools. Existing `.cine` tokens only.
- A project shows ONLY its tools: hide the rest, and any group left empty. All shows everything, as before.
- The live status line visible and prominent above the groups ("Showing the 19 tools Aegis uses."), `aria-live="polite"`.
- Evidence sentences under All only (the pills are the evidence for a project).
- Focus stays on the pressed button; no scroll jump when the section gets shorter; no transitions with reduced motion;
  the full list without JS; axe 0; 44px targets; keyboard operable.
- Re-measure first-load JS (the added KiB), LCP/CLS/INP on phone and desktop, INP on the filter's buttons; `/`, its
  stylesheet bytes, pixels and the guard files unchanged; the full tests. Screenshots at 390 and 1440 (All, Aegis,
  GRAVITY FLOW) in scratch. Commit, push, update PR #18. Don't close the session.

### 1. What changed (`8955039`)
- **The filter's rules** (`stack.ts`) are now the live FILTER's own: for the chosen project, every tool whose `data-p`
  doesn't name it, and every group left with none, take `display: none`. Still written from the four options.
- **Pills** (`work.css`): every tool is a pill (small text, the control edge `--cine-edge` at ≥ 3:1, the glass fill).
  With a project chosen, the tools that remain are filled cyan with on-accent ink, and the evidence sentences hide.
- **The status line** is at the lead size, in ink, between the buttons and the groups; empty under All, as live.
- **No scroll jump** (`StackFilter.tsx`): Stack ends the page, so a shorter list pulled the page up under the reader.
  On each press the results (the status line and the groups) take a `min-height` that keeps the page's end at or below
  the view's bottom edge; All lets go. Red/green at the page's end, GRAVITY FLOW pressed: the view moves 0px with it,
  815px (1440) and 1,214px (390) without it.
  - **Found by the e2e test:** a first version held only the groups. The status line is two lines at 390 for GRAVITY
    FLOW and one for T Poker, so going from one to the other moved the view 26px. The hold now includes the line.
- The buttons stay mounted, so focus stays on the one pressed (the e2e tests check it after a click, Enter and Space).
- Tests: the Stack unit tests follow the new rules (the live FILTER's own strings checked in
  `components/sections/Stack.tsx`; the hold; the pills; the evidence; one transition, dropped when reduced). E2E: 11
  Stack tests (no JS; the filter by the live mapping, with the groups each project leaves and focus; the keyboard; no
  scroll jump at 1440 and 390, with the buttons near the top of the view and at the page's end; holds still ×2; layout at
  1440, 1024, 390 and 320).

### 2. Measured (VL; local production builds, `d64763d` in a scratch worktree vs `8955039`)
| | before | after |
|---|---|---|
| First-load JS `/lab/work` (the budget algorithm) | 181.43 KiB | **181.77 KiB** (+351 bytes gzip); budget 205.7 |
| HTML `/lab/work` | 73.02 KB (14.0 KB gzip) | **97.66 KB** (17.8 KB gzip); budget 568 |
| LCP desktop, median (range), 10 interleaved | 90 ms (68–108) | 104 ms (96–112) |
| LCP phone, 4× CPU and slow 4G, median (range), 10 interleaved | 908 ms (884–944) | 954 ms (928–1028) |
| CLS (load) | 0 | 0 |
| INP desktop / phone (`scripts/lab-hero-a.mjs`, worst per run, median) | 24 / 32 ms | 24 / 32 ms |
| FPS desktop / phone | 60.4 / 60.5 | 60.4 / 60.5 |

- **LCP:** the same +14 ms desktop / +46 ms phone as the second build: more to lay out before the first paint (the LCP
  and FCP medians are equal). `content-visibility` stays unused (the glow; the first entry's section 5).
- **The added JS:** one chunk changed, the carousel's (it holds the island): 4,870 → 5,221 bytes gzip. Every other JS
  chunk is byte-identical to the baseline's.
- **INP on the filter's buttons** (3 runs): desktop 24 ms; phone at 4× CPU 48–80 ms. On About's words, the same in both
  builds (< 16 / 32 ms).
- **Scroll-through CLS:** the slice 0 before and after; 0.0076 outside it (the chat launcher's fold, pre-existing).
- **axe-core 4.11.4, WCAG 2.2 A/AA:** 0 violations at 1440 and 390, motion on and reduced, with All, Aegis and GRAVITY
  FLOW pressed. Needs review: at 390 the same two as before; at 1440 none.
- At page end the chat launcher clears the last line by 150px at 1440 and 102px at 390 and 320.

### 3. Unchanged (VL)
- **`/`, `/lab/hero-a`, `/privacy`:** every script and stylesheet byte-identical; the markup identical with build IDs
  masked. `/`'s stylesheets keep the pinned digests (`868e8b98…` 44,530 bytes; `4b84cc35…` 31,805).
- **Pixels (reduced motion, full page):** `/` 0 differing at 1440 and 390; the hero 0 with its canvas hidden;
  `/lab/work` from the top to About's end (glows hidden) 0.
- **Guard files** identical to `origin/main` (`443a1f9`).

### 4. Validation (Git Bash)
| Command | Result |
|---|---|
| `npm test` | **200/200** |
| `npm run typecheck`, `npm run lint` | exit 0 |
| `npm run build`, then `GROQ_API_KEY= npx playwright test` | **195/195** (184 before Stack, plus 11) |

### 5. Screenshots (scratch, not committed)
- At 1440 and 390: Stack with All, Aegis and GRAVITY FLOW pressed, and the full page.

### Waiting on Tay
- Review the filter on the Preview.
- The LCP cost: keep it, or anchor the violet glow so the off-screen Stack can skip its layout.
- Two live evidence sentences (under All) name Job Assistant and Orders & Delivery: fine, or trim them for the lab?

---

## 2026-11-19 — Session 13, continued: Stack rebuilt like the live Stack, with a filter (prototype, D1 reopened) (Claude Code)

**Scope (Tay's review of the first build):** one project line per tool is too busy. Rebuild Stack to work like the live
Stack on `/` (`data/skills.ts`, `data/stackLens.ts`, its filter), restyled in `.cine`:
- one row per group: its name, its tools inline (wrapping), the live evidence sentence under them, word for word;
- "Filter by project": All and the four flagships only; a project lights its tools and dims the rest, by the live
  `projectsFor()`; reuse the live filter's logic, don't fork the data;
- keep Security (Body HMAC, CSRF token) plus ONE "JWT" row mapped to T Poker · Aegis (replacing "JWT (RS256)"); write
  Security one sentence from the cited source lines only;
- tools with no featured project show under All and dim under every project;
- real buttons with `aria-pressed`, keyboard operable, 44px, visible focus; the full list without JS; no transitions
  with reduced motion; axe 0;
- one small island; report the exact added KiB; `/` unchanged. Re-measure against `d64763d`; screenshots (All and one
  project) at 390 and 1440 in scratch. Commit, push, update PR #18. Don't close the session.

### 1. What changed (`d3373b6`)
- `app/lab/work/stack.ts`: the live groups, tools and evidence sentences; each tool's flagships from `projectsFor`
  (kept to the four); Security; the filter's options (count and the live status line, `dict.stack.showing`); and the
  highlight rules, written from the options as the live Stack writes its FILTER.
- `StackBlock.tsx` (server): one row per group (an h3, the tools as a list named by it, the evidence). Each tool carries
  `data-p` and says its flagships in its accessible text and hover title, as the live Stack does ("C# (T Poker, Aegis)").
- `StackFilter.tsx` (client, the one new island): five toggle buttons in a group labelled "Filter by project", one
  pressed at a time; pressing one sets `data-lens` on the groups (server-rendered children) and fills the polite status
  line. It imports only React. Without JS, and until hydration, the buttons are not shown and their space is kept.
- `work.css`: the chips (the panels' pill at 44px, the pressed one filled in cyan), the rows, and the highlight's
  transitions, dropped with reduced motion. No token added.
- **The highlight:** the pressed project's tools turn cyan; every other tool, and the name of a group it lights nothing
  in, turns the faintest ink (≥ 5.4:1). Colour only: an e2e test compares every box before and after.
- Tests: 14 unit (every string held to its source, the mapping pinned, the Security sources, the island's imports and
  markup, reduced motion) and 9 e2e (no JS, the filter by the live mapping, the keyboard, holds still ×2, layout at 1440,
  1024, 390 and 320). The keyboard walk now has 29 stops (the five buttons after About's links); the axe runs press
  Aegis first, so the dimmed tools are checked; the no-JS test checks the filter is not shown.

**Security:**

| Row | Projects | Source |
|---|---|---|
| JWT | T Poker · Aegis | the live tool, moved from Services and APIs; `projectsFor("JWT")` |
| Body HMAC | Aegis | Aegis decision title: "Agent ingestion authenticated by body HMAC" |
| CSRF token | DeveloperOS | DeveloperOS decision: "A per-instance CSRF token compared with hmac.compare_digest" |

Security's sentence: "Aegis authenticates agent ingestion by body HMAC and uses JWT (RS256); DeveloperOS compares a
per-instance CSRF token with hmac.compare_digest." Built from Aegis's decision title, Aegis's stack entry "JWT (RS256)"
and DeveloperOS's decision; a unit test checks each phrase against its project's text.

**Worth knowing:** two live evidence sentences, kept word for word as asked, name the other two projects (Languages: Job
Assistant and Orders & Delivery; Product and interface: Orders & Delivery).

### 2. Found on the way (VL)
- A first "holds still" check compared viewport boxes, and a click scrolled the page by 1px. It now compares page
  coordinates; nothing moves.

### 3. Measured (VL; local production builds, `d64763d` rebuilt in a scratch worktree vs `d3373b6`)
| | before | after |
|---|---|---|
| First-load JS `/lab/work` (the budget algorithm) | 181.43 KiB | **181.66 KiB** (+239 bytes gzip); budget 205.7 |
| HTML `/lab/work` | 73.02 KB (14.0 KB gzip) | **98.60 KB** (17.9 KB gzip); budget 568 |
| LCP desktop, median (range), 10 interleaved | 92 ms (68–104) | 108 ms (96–112) |
| LCP phone, 4× CPU and slow 4G, median (range), 10 interleaved | 934 ms (892–960) | 988 ms (952–1108) |
| CLS (load) | 0 | 0 |
| INP desktop / phone (`scripts/lab-hero-a.mjs`, worst per run, median) | 24 / 32 ms | 24 / 32 ms |
| FPS desktop / phone | 60.5 / 60.5 | 60.5 / 60.5 |

- **The added JS:** one chunk changed, the carousel's (Turbopack put the island in it): 4,870 → 5,109 bytes gzip. Every
  other JS chunk is byte-identical to the baseline's.
- **The HTML:** Stack's own markup is 10.1 KB (1.8 KB gzip); most of the rest is Next's flight copy of the same tree.
- **LCP** is the first capture, and the LCP and FCP medians are equal. The shift is the same kind as the first build's (more to lay
  out before the first paint; diagnosed then). `content-visibility` stays unused (the glow, section 5 of the first entry).
- **INP on the filter's buttons** (3 runs): desktop < 16 ms; phone at 4× CPU 64–72 ms. On About's words, the same in
  both builds (< 16 / 32 ms).
- **Scroll-through CLS:** the slice 0 before and after; 0.0076 outside it (the chat launcher's fold, pre-existing).
- **axe-core 4.11.4, WCAG 2.2 A/AA:** 0 violations at 1440 and 390, motion on and reduced, with All, Aegis and GRAVITY
  FLOW pressed. Needs review: at 390 the same two as before; at 1440 none (it was one, Aegis's line).
- At page end the chat launcher clears the last line by 150px at 1440 and 102px at 390 and 320.

### 4. Unchanged (VL)
- **`/`, `/lab/hero-a`, `/privacy`:** every script and stylesheet byte-identical; the markup identical with build IDs
  masked. `/`'s stylesheets keep the pinned digests (`868e8b98…` 44,530 bytes; `4b84cc35…` 31,805).
- **Pixels (reduced motion, full page):** `/` 0 differing at 1440 and 390; the hero 0 with its canvas hidden;
  `/lab/work` from the top to About's end (glows hidden) 0.
- **Guard files** identical to `origin/main` (`443a1f9`).

### 5. Validation (Git Bash)
| Command | Result |
|---|---|
| `npm test` | **200/200** (186 before Stack, plus 14) |
| `npm run typecheck`, `npm run lint` | exit 0 |
| `npm run build`, then `GROQ_API_KEY= npx playwright test` | **193/193** (184 before Stack, plus 9) |

### 6. Screenshots (scratch, not committed)
- At 1440 and 390: Stack with All, Stack with Aegis pressed, and the full page.

### Waiting on Tay
- Review the rebuilt Stack on the Preview, and Security's sentence.
- The LCP cost (+16 ms desktop, +54 ms phone): keep it, or anchor the violet glow so the off-screen Stack can skip its
  layout.
- Two live evidence sentences name Job Assistant and Orders & Delivery: fine, or trim them for the lab?

---

## 2026-11-19 — Session 13: Stack (P3.4) on `/lab/work` (prototype, D1 reopened) (Claude Code)

**Scope (Tay's brief):**
- Sync: confirm PR #20 merged and delete its branch (after `git merge-base --is-ancestor`); this branch at `d64763d`.
- One task: the Stack section (P3.4) on `/lab/work`, below About. Lab-only; `/` untouched.
  - Group the skills by discipline, as the real data supports. Tie each skill to the featured projects that really use
    it (`data/projects.ts`, PROJECT_CONTEXT); never attach one that doesn't.
  - No logo wall, levels, percentages, years or institution. Every word from facts already in the repo. Aegis's AI is a
    deterministic mock: no LLM or ML claim. The `.cine` tokens; no client JS without showing why; it holds still.
  - Step 1 a plan only (groups, every skill with its evidence and source, the copy, the layout), then Tay's OK. Step 2
    build, measure as last session, confirm `/`, `/lab/hero-a`, the guards and `/`'s stylesheet bytes unchanged.
    Screenshots at 390 and 1440 in scratch, not committed.
- Commit, push, update draft PR #18 (no merge, no deploy); the Preview URL; START-HERE and WORKLOG.

### 1. Preconditions (VL)
- `git fetch`: **PR #20 merged** (2026-11-19 03:20Z, merge commit `443a1f9`). `origin/main` = **`443a1f9`**; Production
  `443a1f9` (`success`, 03:20Z). The live `/` Tailwind sheet is back to **44,530 bytes** (read-only `curl`; 44,829 with
  the leak). Its digest is not the local build's, so only the size is compared.
- **Deleted:** `docs/claude-md-tailwind-leak`, local and remote (tip `2e73766`; both tips ancestors of `origin/main`).
- `proto/hero-a-cinematic` at **`d64763d`**, level with its remote, clean.

### 2. The plan and Tay's answers
- The plan reused the live Stack's six groups (`data/skills.ts`), with no AI group (the only model tool is DeveloperOS's
  optional Ollama) and, at first, no Security group. Each skill's projects from the live site's own mapping
  (`projectsFor`, `data/stackLens.ts`), kept to the four flagships, each match checked by hand.
- **Tay approved it with four changes:**
  1. The tools no flagship uses (Java, JavaFX, C, C++, pytest, Framer Motion, Playwright) stay in their live groups,
     with no project line. No other project named, no new words.
  2. A **Security** group from techniques `data/projects.ts` already states, in its own words, each with the project
     that really uses it; JWT moves out of Services and APIs, so nothing appears twice.
  3. Two tool columns at 390px if they fit; one only at 320px.
  4. Everyday tools kept, with no projects.

### 3. What changed (`757c377`)
- `app/lab/work/stack.ts` derives every string: the live groups and tools in order, `projectsFor` kept to the
  flagships, the Security rows, and "(optional)" only where a project's own stack entry says so (DeveloperOS's Ollama).
- `StackBlock.tsx`, a server component, renders it after About, inside `<main>`: an eyebrow, the h2, and one row per
  group (an h3 and a list named by it). No link, no control, no reveal, no client code.
- `work.css`: its rules, layer tokens only. Its eyebrow and title share About's rules (grouped selectors). From 1024px
  each group's name takes 5fr and its tools 7fr, so they line up under About's words; stacked below; two tool columns
  from 360px, one at 320. A project's name never splits across two lines.
- **No token added:** the layer still defines 76.
- Tests: 10 unit (every string held to its source, the approved rows pinned, the Security source lines word for word,
  no AI or level claim) and 8 e2e (no JS, holds still ×2, layout at 1440, 1024, 390, 360 and 320). Two lab assertions
  now include Stack: About's placement (`<AboutBlock />` then `<StackBlock />`) and the structure test's h2 count.
- The copy, every row with its source: `docs/CINEMATIC_SYSTEM.md`, "Stack (P3.4, session 13)".

**The Security rows (labels in `data/projects.ts`'s own words):**

| Label | Project | Source line |
|---|---|---|
| JWT (RS256) | Aegis | Aegis `stack`: "JWT (RS256)" |
| Body HMAC | Aegis | Aegis decision title: "Agent ingestion authenticated by body HMAC" (first letter capitalised) |
| CSRF token | DeveloperOS | DeveloperOS decision "Loopback API hardened like a public one": "A per-instance CSRF token compared with hmac.compare_digest" |

- A unit test checks each label against its project's text, and that no other flagship's text says it.
- **A consequence:** T Poker's stack says "JWT" (HS256, per the `data/skills.ts` comment), not RS256, so with JWT moved
  into the RS256 row the lab Stack shows no JWT for T Poker.

### 4. Found on the way, fixed before the push
- At 390 a project name split across lines ("GRAVITY / FLOW"). Each name is now one unbreakable span with its separator
  after it, so lines break only between names; the e2e layout test holds it at all five widths.
- My first "holds still" e2e check failed under reduced motion: the site's reset sets every duration to 0.001ms
  (`app/globals.css`). The check now uses the 10 ms floor of the carousel's own reduced-motion test.

### 5. Measured (VL; local production builds, `d64763d` in a scratch worktree vs this branch)
| | before | after |
|---|---|---|
| First-load JS `/lab/work` (the budget algorithm) | 181.43 KiB | **181.43 KiB** (every script identical); budget 205.7 |
| HTML `/lab/work` | 73.02 KB (14.0 KB gzip) | **100.05 KB** (16.5 KB gzip); budget 568 |
| LCP desktop, median (range), 10 interleaved | 90 ms (72–116) | 114 ms (80–128) |
| LCP phone, 4× CPU and slow 4G, median (range), 10 interleaved | 956 ms (876–1052) | 998 ms (948–1100) |
| CLS (load) | 0 | 0 |
| INP desktop / phone (`scripts/lab-hero-a.mjs`, worst per run, median) | 32 / 32 ms | 32 / 32 ms |
| FPS desktop / phone | 60.6 / 60.5 | 60.5 / 60.5 |

- The LCP element is the first capture, and LCP = FCP in every run.
- **The LCP shift, diagnosed** (10 interleaved runs per variant, every variant through the same interception):
  - desktop flat: 108 / 106 ms;
  - phone 794 → 870 ms. With Stack's layout skipped until it nears the viewport (`content-visibility: auto`,
    injected), 816 ms. So most of the phone cost is laying out Stack's 201 elements before the first paint; the rest is
    its bytes.
  - **Not adopted:** with it, the page grows when Stack first renders, and the violet glow (at 38% of the page's height)
    moves: slice CLS **0.353** at 320px (0 at 1440, 1024 and 390), against 0 as served. Using it would mean the glow no
    longer depends on the page's height, which changes the existing slice. Left for Tay.
- **Scroll-through CLS** (a scratch probe, down and back up twice): the slice 0 before and after; the chat launcher's
  fold 0.0153 in both (0.0076 per pass, pre-existing).
- **INP on Stack's own words** (same probe in both builds, 3 runs): desktop < 16 ms; phone at 4× CPU 24–32 ms, the same
  as About's words before and after.
- **axe-core 4.11.4, WCAG 2.2 A/AA:** 0 violations at 1440 and 390, motion on and reduced (the e2e suite and a probe).
  - Needs review: at 390 the same two as before (the lede, T Poker's line).
  - At 1440, none; it was one (Aegis's line), because the taller page moves the violet glow down again.
- At page end the chat launcher clears the last tool by 150px at 1440 and 102px at 390 and 320.

### 6. Unchanged (VL)
- **`/`, `/lab/hero-a`, `/privacy`:** every script and stylesheet byte-identical; the markup identical with build IDs
  masked.
- **`/`'s stylesheets:** `868e8b98…` (44,530 bytes, the Tailwind sheet) and `4b84cc35…` (31,805), the pinned digests.
- **Built files:** 24 of 25 JS and CSS files byte-identical, all 20 JS chunks among them. The one that changed is the
  lab's Work stylesheet (11,158 → 12,427 bytes).
- **Pixels (reduced motion, full page):** `/` 0 differing at 1440 and 390; the hero 0 with its canvas hidden.
  `/lab/work` from the top to About's end, glows hidden: 0 differing at 1440 and 390.
- **Guard files** identical to `origin/main` (`443a1f9`): dead-code, budget, page, tokens, institution, private-repo
  (test, support, spec), the page support.
- `components/`, `lib/`, `public/`, `data/`, `app/globals.css`, `app/page.tsx`, the hero and the layer: unchanged since
  `d64763d`.

### 7. Validation (Git Bash)
| Command | Result |
|---|---|
| `npm test` | **196/196** (16 files; 186 before, plus 10 Stack tests) |
| `npm run typecheck`, `npm run lint` | exit 0 |
| `npm run build`, then `GROQ_API_KEY= npx playwright test` | **192/192** (184 before, plus 8) |

### 8. Screenshots (scratch, not committed)
- At 1440 and 390: the Stack section (motion on and reduced), the view a reader scrolls to, and the full page.

### 9. Limitations (NC unless stated)
- **No real phone.** Headless raster is SwiftShader.
- The phone LCP shift above (VL) stays until Tay decides on the glow.
- The branch's `CLAUDE.md` still names `121d86b` as the prototype's code commit; not updated (not in the brief).

### Waiting on Tay
- Review Stack on the Preview.
- Decide on the phone LCP cost: keep it, or anchor the violet glow so `content-visibility` can skip Stack's layout.
- T Poker's JWT (HS256) is no longer shown: fine as is, or a separate "JWT" row for T Poker in Security?
- Swap the GRAVITY FLOW capture he has in mind. Move F: still his call.

---

## 2026-11-19 — Session 12 close-out: About approved; PR #20 fixes `main`'s CSS leak (Claude Code)

**Scope (Tay's brief):**
- A one-line docs PR for `main` that fixes the CLAUDE.md Tailwind leak: from an up-to-date `origin/main`, only that
  line, the same rewording as `fb3bb41`. Confirm `/`'s sheet is back to 44,530 bytes in a production build, run
  `npm test`, push it and open the PR. No merge.
- Close out here: WORKLOG, START-HERE, CLAUDE.md and the memory with the final state. Push; PR #18 stays a draft.
- Delete `docs/session-10-closeout` locally and remotely after `git merge-base --is-ancestor`. Never delete this branch.
- Clean scratch, and confirm `main` is clean.

### Decisions (Tay)
- **About is approved** as built (`121d86b`).
- A go for the `main` fix (below).

### PR #20: the leak fix for `main` (VL)
- Branch **`docs/claude-md-tailwind-leak`** from `origin/main` `1c57789` (`--no-track`). One commit, `CLAUDE.md` only,
  +2/−2: the gotcha bullet now describes the three utilities in words, as `fb3bb41` does here.
  - Only that bullet. The branch's other two edits in `fb3bb41` (the "covers this file" clause and the "fourth time"
    note) are not in it.
- `npm run build` on it: `/`'s Tailwind sheet is **44,530 bytes**, SHA-256 `868e8b98…`, the sheet before PR #19. The
  other sheet is unchanged (31,805 bytes).
- `npm test` (Git Bash): **122/122**. No utility name is left in `CLAUDE.md`.
- Pushed, and **PR #20** opened into `main`: https://github.com/taysh123/Portfolio/pull/20. Not merged.
- Until it merges, Production serves the 44,829-byte sheet (299 bytes of unused rules; nothing renders differently).

### Branches (each checked with `git merge-base --is-ancestor`)
- **Deleted:** `docs/session-10-closeout`, local and remote (`2101ef6`, merged as PR #19; both tips are ancestors of
  `origin/main`).
- **Kept:**
  - `proto/hero-a-cinematic` (active; never delete);
  - `docs/claude-md-tailwind-leak` (PR #20, open);
  - `reference/premium-redesign-package` and the six D8 branches, none merged.

### Scratch
- Cleaned: the session's scratchpad (screenshots, measurement scripts, build logs) and the `5d4610b` baseline worktree
  (removed during the session; `git worktree list` shows only the main checkout).

### State (VL)
- `origin/main` = **`1c57789`**, Production `1c57789`. Local `main` level with it, and clean.
- This branch: the code is `121d86b`; the docs are on top. PR #18 is a draft.
- Validation after this close-out's docs (Git Bash): `npm test` 186/186; a production build's `/` Tailwind sheet at
  `868e8b98…` (44,530 bytes), and the pinned-stylesheet e2e test passes.

### Waiting on Tay
- **Merge PR #20** (docs only), so the live `/` sheet loses the 299 unused bytes.
- **Decide what Concept A takes on next.** The carousels, the five layer values and About are approved.
- **Swap the GRAVITY FLOW capture** he has in mind.
- **Move F:** not started; still his call.
- Optional, on `main`: the chat launcher's fold on scroll (0.0076 CLS).

---

## 2026-11-19 — Session 12: About (P3.3) on `/lab/work`; the D2 comments reworded (prototype, D1 reopened) (Claude Code)

**Scope (Tay's brief):**
- List the five NEW layer values awaiting review, without changing them.
- One task: the About section (P3.3) on `/lab/work`, below the panels. Lab-only: noindex, unlinked, `/` untouched.
  - No photo, no institution. Readable by a recruiter in about 10 seconds.
  - Copy only from facts already in the repo. Links: GitHub, LinkedIn and the résumé, at the live site's targets; the
    résumé PDF unchanged. The `.cine` tokens and motion; no new token without showing why first.
  - Step 1 a plan only (the exact copy, the layout, every fact's source), then Tay's OK. Step 2 build and measure.
- Separately: reword the 11 "D2 reopened" comments and test titles. Wording only.
- Commit, push, update draft PR #18 (no merge, no deploy). Screenshots at 390 and 1440, kept in scratch.

### 1. Preconditions (VL)
- `git fetch`: PR #19 merged (2026-11-19 01:49Z). `origin/main` = **`1c57789`**; Production `1c57789`.
- `proto/hero-a-cinematic` at **`5d4610b`**, level with its remote, clean.

### 2. The five NEW layer values (listed for Tay; unchanged)
| Token | Value | Used at | Replaced |
|---|---|---|---|
| `--cine-lift` | −4px | `work.css`: the stage's `translate` on hover, focus-within, `:active`; none with reduced motion | nothing (round 5, `a5f2845`) |
| `--cine-glow-lift` | `0 0 56px -12px` cyan at 30% | the same rule's halo; stays with reduced motion | nothing (round 5) |
| `--cine-flow-turn` | 38deg | the side slides' `rotateY` | nothing (round 6, `4a9612a`) |
| `--cine-flow-scale` | 0.78 | the side slides' `scale()` | nothing (round 6) |
| `--cine-flow-dim` | 0.55 | the dark layer over each side capture | nothing (round 6) |

**Tay: approved, keep them as they are.**

### 3. The plan and Tay's answers
- The copy, every word with its source: `docs/CINEMATIC_SYSTEM.md`, "About (P3.3, session 12)".
- **Tay approved the plan** and chose:
  - the joined availability line, "Available for software engineering roles: on-site, hybrid, or remote.";
  - screenshots kept in scratch, not committed.

### 4. What changed
- **`4dccdf8`, wording only:** the 11 header comments now say "D1 reopened by Tay, 2026-11-18; D2 not reopened, so no
  WebGL", rewrapped to 120 columns. No test title carried the phrase. No logic, selector, value or assertion changed.
- **`121d86b`, About:**
  - `app/lab/work/about.ts` derives every string from `data/about.ts`, `data/socials.ts` and `lib/dict.ts`;
  - `AboutBlock.tsx`, a server component, renders it after the Work section, inside `<main>`;
  - `work.css` gains its rules, layer tokens only. The layout: title beside the words from 1024px (5fr / 7fr), stacked
    below; the facts two by two on hairlines (one column on phones); the résumé the one filled control.
  - It holds still: no reveal of its own (the page keeps its 3 reveal blocks), no client code.
  - **No token added:** the layer still defines 76.
- **`fb3bb41`, CLAUDE.md (a fourth Tailwind leak, below).**

### 5. Found on the way: PR #19 leaked into `/`'s stylesheet, live (VL)
- The pinned-digest e2e test failed on the first full run: `/`'s Tailwind sheet was 44,829 bytes, not 44,530.
- **The baseline (`5d4610b`, built in a scratch worktree) had the same 44,829-byte sheet**, so it predates this work.
- The extra rules are exactly the three earlier leaks: zero opacity (21 bytes), the small elevation (about 248) and
  the small corner radius (30); 299 bytes in all.
- **Source:** the session 11 close-out's CLAUDE.md gotcha line, which spelled those three utility names. Tailwind scans
  the repo root (only `docs/`, `design/`, `.claude/` and `.impeccable/` are skipped).
- **Live:** `main` has the same line since PR #19. Production (`1c57789`) serves a 44,829-byte Tailwind sheet
  (read-only `curl`). No element on `/` uses those classes (source and live HTML checked), so nothing renders
  differently.
- **Fixed here** (`fb3bb41`): the line describes them in words. `/`'s sheet is back to `868e8b98…`, the pinned digest.
- **Not fixed on `main`:** that needs a docs PR, on Tay's go.

### 6. Measured (VL; local production builds, interleaved against `5d4610b`, 10 runs each)
| | before | after |
|---|---|---|
| First-load JS `/lab/work` (the budget algorithm) | 181.43 KiB | **181.43 KiB** (every script identical); budget 205.7 |
| HTML `/lab/work` | 67.46 KB | **73.02 KB** (14.0 KB gzip); budget 568 |
| LCP desktop (median; range) | 76 ms (72–88) | 80 ms (76–120) |
| LCP phone, 4× CPU and slow 4G | 950 ms (888–1032) | 932 ms (876–976) |
| CLS (load) | 0 | 0 |
| INP desktop / phone (`scripts/lab-hero-a.mjs`, worst per run, median) | 36 / 40 ms | 32 / 32 ms |
| FPS desktop / phone | 60.5 / 60.6 | 60.5 / 60.5 |

- The LCP element is the first capture, and LCP = FCP in every run.
- **Scroll-through CLS** (a scratch probe, whole page): 0.0076 before and after, all of it from the chat launcher's fold
  (pre-existing); 0 from the slice or About.
- **INP inside About:** desktop 16 ms (clicks on the lede, Tab through its links); phone at 4× CPU 32 ms (taps).
- **axe-core 4.11.4, WCAG 2.2 A/AA:** 0 violations at 1440 and 390, motion on and reduced (the e2e suite and a probe).
  - Needs-review items, before → after: at 390 the same two (the lede, T Poker's line).
  - At 1440, one new: Aegis's line. The violet glow sits at 38% of the section's height, so the taller page moves it
    down behind that line. Covered by the layer's floor (mist ≥ 7:1 at the glow peak).
- At page end the three links clear the chat launcher at 320, 390 and 1440 (86–206px).

### 7. Unchanged (VL)
- **`/`, `/lab/hero-a`, `/privacy`:** every script byte-identical; the markup identical with build IDs masked. The only
  difference is the Tailwind sheet: here it is the pinned `main` digest, and the baseline carries the leak (section 5).
- **Every built JS chunk:** 20 of 20 byte-identical to the baseline.
- **Pixels (reduced motion, full page):** `/` 0 differing at 1440 and 390. The hero 0 with its canvas hidden. Its
  still frame is random per load: the baseline against itself differs by 92,709 pixels at 1440, the baseline against
  this build by 90,622.
- **Guard files** identical to `origin/main`: dead-code, budget, page, tokens, institution, private-repo (test, support,
  spec), the page support.
- `components/`, `lib/`, `public/` (the PDF included), `data/`, `app/globals.css` and `app/page.tsx`: unchanged since
  `5d4610b`.

### 8. Validation (Git Bash)
| Command | Result |
|---|---|
| `npm test` | **186/186** (16 files; 179 before, plus 7 About tests) |
| `npm run typecheck`, `npm run lint` | exit 0 |
| `npm run build`, then `GROQ_API_KEY= npx playwright test` | **184/184** (176 before, plus 8: no-JS, the PDF, holds still ×2, layout ×4) |

### 9. Pushed: the Preview (Tay's brief)
- `4dccdf8`, `121d86b` and `fb3bb41` pushed (`5d4610b..fb3bb41`). Vercel built a **Preview** (`production_environment=false`,
  `success`, 02:31Z). Production stays on `1c57789`.
- Preview of `/lab/work` (About is at the bottom):
  - this build: `https://tay-shofer-portfolio-pfdxoepzk-tays-projects-d5aefd6e.vercel.app/lab/work`;
  - the branch's own link, which follows each push:
    `https://tay-shofer-portfolio-git-proto-he-65ec6d-tays-projects-d5aefd6e.vercel.app/lab/work`.
  - Both sit behind Vercel's login (a logged-out request gets a 302 to `vercel.com/sso-api`). The deployed page was not
    fetched: the connector's fetch would create a 23-hour share link, which the brief did not ask for.
- This docs commit follows on top, and PR #18's description is updated. It is still a draft.

### 10. Screenshots (scratch, not committed)
- At 1440 and 390: the About block (motion on and reduced), the view a reader scrolls to, and the full page.

### 11. Limitations (NC unless stated)
- **No real phone.** Headless raster is SwiftShader.
- At 320px a title half may wrap to two lines (the layout test allows it there only).
- The `docs/session-10-closeout` branch (merged as PR #19) is still there, local and remote: not deleted this session.

### Waiting on Tay
- Review About on the Preview.
- A go for the one-line CLAUDE.md docs PR on `main` (section 5).
- Swap the GRAVITY FLOW capture he has in mind.
- Move F: not started; still his call.

---

## 2026-11-19 — Session 11 close-out: carousels approved; `main`'s close-out PR refreshed (Claude Code)

**Scope (Tay's brief):**
- Here: update WORKLOG, START-HERE and CLAUDE.md, and the memory. Push, and keep PR #18 a draft.
- `docs/session-10-closeout`:
  - refresh it to the current state;
  - make `main`'s START-HERE and CLAUDE.md name the Concept A prototype as the active direction (D1 reopened by Tay on
    2026-11-18; D2 still not reopened, so no WebGL);
  - rebase it onto `origin/main`, run `npm test`, push it, and open a docs-only PR into `main`. No merge.
- Clean scratch. Delete merged work branches only after `git merge-base --is-ancestor`; never delete this branch.
- Confirm `main` is clean.

### Decisions (Tay, session 11 close)
- **The carousels are approved:** T Poker 5, Aegis 2, DeveloperOS 4, GRAVITY FLOW 5.
- **The framing is corrected: D1 was reopened for Concept A (2026-11-18). D2 is still not reopened: no WebGL.**
  - Session 10's docs said "D2 reopened", and so do comments and test titles in 11 code and test files (`app/lab/**`,
    `tests/**/lab-*`, `scripts/lab-hero-a.mjs`).
  - The docs touched at this close now say D1: START-HERE, CLAUDE.md, CINEMATIC_SYSTEM, and this log's session 11
    title and change-log rows. Session 10's entry below is left as history.
  - The code files are unchanged at this docs-only close. Reword them with the next prototype commit.

### State (VL)
- `origin/main` = **`fb0f575`**, Production `success`. Local `main` fast-forwarded to it, and clean.
- **This branch:** the code is `9569bd8`, and this docs commit sits on top. PR #18 is a draft; the first line of its
  description now says D1.
- **CLAUDE.md here** is now `main`'s (`fb0f575`) plus the prototype section and the corrected direction. It is the same
  file the close-out PR puts on `main`.

### The close-out PR for `main` (from `docs/session-10-closeout`)
- Rebased onto `origin/main`: `c9696d6` (PR #17) dropped out, being upstream already.
- **Refreshed to this branch's tip:**
  - the sessions 10–11 summary in WORKLOG;
  - START-HERE and CLAUDE.md naming Concept A as the active direction;
  - RESEARCH_AND_DECISIONS, with the reopening recorded under D1 (it had been under D2) and D2 marked still closed.
- `npm test` there, then pushed, and a docs-only PR opened into `main`. Not merged.

### Branches (each checked with `git merge-base --is-ancestor`)
- **Deleted:** `docs/session-9-closeout`, local and remote (`c9696d6`, merged as PR #17).
- **Kept:**
  - `proto/hero-a-cinematic` (active; never delete);
  - `docs/session-10-closeout` (the close-out PR);
  - `reference/premium-redesign-package` and the six D8 branches, none merged.

### Scratch
- Cleaned: the session's scratchpad (screenshots, contact sheets, measurement scripts) and both scratch worktrees (the
  `0f38825` baseline and the close-out worktree).

### Waiting on Tay
- **Merge the close-out PR** (docs only).
- **Swap the GRAVITY FLOW capture** he has in mind.
- **Decide what Concept A takes on next.** The five NEW layer values still wait for review.
- **Move F:** not started; still his call.
- **Optional, on `main`:** the chat launcher's fold on scroll (0.0076 CLS).

---

## 2026-11-19 — Session 11: every flagship's real captures in its Work carousel (prototype, D1 reopened) (Claude Code)

**Scope (Tay's brief):**
- Enrich the four per-project carousels on `/lab/work` with the real captures already in `public/projects/`.
- Use the existing encoding pipeline and the reviewed alt text.
- Only the first slide is eager.
- Keyboard, touch, reduced motion and no-JS must work at the new counts, with the phone proportions kept.
- `/` and the locked hero stay unchanged, the guard files stay identical to `main`, and no WebGL.
- Commit, push and update draft PR #18: no merge, no deploy.

Skills: `systematic-debugging` (the CLS check), `verification-before-completion`.

### 1. Preconditions (VL)
- `git fetch`: `origin/main` = **`fb0f575`** (PR #17, the session 9 close-out, merged). Production `fb0f575`, GitHub
  status `success`.
- `proto/hero-a-cinematic` was at **`0f38825`**, level with its remote.
- This branch's `claude/START-HERE.md` still described the calm direction at session 9, from before PR #17. It was
  flagged, and updated at the end of this session (section 9).

### 2. The brief against the files: three questions, Tay's answers (VL)
- **T Poker's "final count" is already in.**
  - `poker-settle` is `final-count.webp` re-encoded (mean pixel difference 0.83 of 255).
  - There are 5 distinct T Poker captures, so 6 would need a duplicate. **Tay: 5, no duplicate.**
- **DeveloperOS refusal** (`refusal.webp`, 1400 × 188):
  - it has no alt text on `main`; the only text ever written for it is in an unmerged October commit (`62a6e20`);
  - the learning capture already shows the same refusal. **Tay: skip it.**
- **DeveloperOS AI features** shows the same "ollama provider" results as the search capture (the search is a crop of
  that screen). **Tay: skip it.**
- **Result:** T Poker 5, Aegis 2, DeveloperOS 4, GRAVITY FLOW 5. GRAVITY FLOW's two existing captures are unchanged
  (Tay will swap one himself).

### 3. What changed (`9569bd8`)
- **Encoding: 8 jobs in `scripts/m10-images.mjs`**, at the widths of the captures beside them.
  - Poker and GRAVITY FLOW at 320/480/640; DeveloperOS at 800/1200/1600.
  - The script's own settings: AVIF q60 and WebP q80, effort 6.
  - The script now runs named jobs alone, so nothing else was re-encoded: 48 new files, and no existing file changed.
  - WebP output reproduces the committed files byte for byte. AVIF does not: it comes out 5–10% larger here, with the
    same sharp 0.34.5 and settings but a different platform build of aom.
- **`data/lab-images.ts` (new):** the lab's captures in `data/images.ts`'s shape, with lookups over both lists.
  - Not in `data/images.ts`, the documented step until now: `components/sections/AboutVisual.tsx` is a client component
    that imports `IMAGES` whole, so an entry there ships in `/`'s first-load JS.
  - A unit test holds that nothing outside `app/lab/` names the new file, except a type import in `data/projects.ts`.
- **Galleries and alt text:**
  - `PROJECT_GALLERIES` holds the counts above.
  - `mediaAlt(project, file)` takes the project's own media entry for the source file, word for word.
  - A unit test compares each re-encode's pixels against that file (all under 2 of 255).
- **Mixed shapes:** every slide keeps its capture's box, mounted or not. The server passes `boxes` (each capture's
  ratio), and an `:empty::before` spacer holds it.
- **Window carousels:** the front window is 80% of the stage (86% below 640px), and `sizes` matches.
- **Narrow phones:** seven 44px targets need 324px, and the stage is 254px at 320 and 294px at 360, so the arrows were
  clipped. Below 390px the dots take their own row and the arrows sit below them.
- No token was added. The layer, the hero, `/` and every live source are unchanged.

### 4. Found on the way (VL)
- **The CLS check read 0.0076.** Every shift's source was `button.chat-launcher`.
  - The site's chat launcher folds its label as the page scrolls, and unfolds it at the top.
  - The same on `0f38825` (0.00764), and on `/` at 1440 and 390 (0.0076).
  - Pre-existing live code, not changed. The test now counts shifts inside the slice (0) and logs the launcher's share.
- **A hydration shift hides locally.**
  - With the box reservation removed, the Aegis track still grows 89 → 281px, but at 89 ms, before the first paint
    (100 ms), so CLS reads 0.
  - The test now holds the scripts back 1.2 s and opens at `#wk-aegis`.
  - Red/green: 0.064 without the reservation (0.068 opening at DeveloperOS), 0 with it.
- **Sub-pixel:** a loaded smaller encode keeps its own whole-pixel size (600 × 337), 0.27px under the reserved box.
  Heights are compared within 1px.
- **The Tailwind leak, a third time.**
  - A test comment's word added a border-radius utility rule (30 bytes) to `/`'s stylesheet.
  - The pinned-digest e2e test caught it. The comment is reworded, and both sheets are byte-identical again.

### 5. Measured (VL; local production builds, lab data, interleaved against `0f38825`)
| | before | after |
|---|---|---|
| First-load JS `/lab/work` (the budget algorithm) | 181.39 KiB (carousel 4.72) | **181.43 KiB** (4.76); budget 205.7 |
| HTML `/lab/work` | 52.98 KB (13.1 KB gzip) | **67.46 KB** (14.4 KB gzip); budget 568 |
| LCP desktop (median of 5; range) | 72 ms (68–76) | 92 ms (72–120) |
| LCP phone, 4× CPU and slow 4G | 928 ms (884–956) | 880 ms (844–952) |
| CLS | 0 | 0 |
| INP desktop / phone (`scripts/lab-hero-a.mjs`: empty-space interactions) | 40 / 40 ms | 40 / 48 ms |
| FPS desktop / phone | 60.5 / 60.6 | 60.5 / 60.4 |

- **The LCP element is the first capture, and LCP = FCP in every run:** it paints in the first frame.
  - Desktop first paint, broken down over 10 more interleaved loads: TTFB +3.4 ms and DOM interactive +7.8 ms.
  - Both come from the larger HTML, which carries each lazy capture's server-rendered markup for the island.
  - The FCP ranges overlap: 64–108 ms before, 60–124 ms after.
  - No lazy capture becomes the LCP, and none is fetched before it.
- **INP on the carousel controls** (Next, 3 taps per carousel × 3 rounds; phone at 4× CPU):
  - T Poker: median 48 → 56 ms, worst 80 → 80;
  - GRAVITY FLOW: median 72 → 64 ms, worst 112 → 104;
  - new: Aegis median 56 ms (worst 168), DeveloperOS 64 (worst 136);
  - desktop medians 24–40 ms, worst 64.
- **Image bytes:** 838,474 on disk (AVIF 386,944, WebP 451,530). A visit gets one format at one width:

  | | before | after, scrolling through | after, every capture viewed |
  |---|---|---|---|
  | desktop | 61.6 KiB | 94.2 KiB | 138.8 KiB |
  | phone @3x | 107.8 KiB | 178.3 KiB | 271.2 KiB |

  Captures two steps from the front are never fetched until the reader moves toward them (an e2e test).
- **axe-core 4.11.4, WCAG 2.2 A/AA, after every carousel has moved:** 0 violations at 1440 and 390, with motion on and
  reduced.
  - At 390, two need-review contrast items: mist text over the glows, covered by the layer's floor.

### 6. Unchanged (VL)
- **`/`, `/lab/hero-a`, `/privacy`** (the final build against `0f38825`): the same 12, 13 and 10 first-load assets, byte
  for byte. The HTML is identical except the per-build ID.
- **Pixels, full page:**
  - `/`: 0 differing at 1440 and 390, with motion on and off.
  - The hero: 0 with reduced motion.
  - The hero with motion on: differences of at most 1 of 255, 419–6,359 pixels varying by run, from its glows' drift.
    The same build against itself gives 0.
- **Guard files** identical to `origin/main` (`fb0f575`): dead-code, budget, page, tokens, institution, and the
  private-repo test and support.

### 7. Validation (Git Bash)
| Command | Result |
|---|---|
| `npm test` | **179/179** (16 files; 177 before, plus 2) |
| `npm run typecheck`, `npm run lint` | exit 0 |
| `npm run build`, then `GROQ_API_KEY= npx playwright test` | **176/176** (173 before, plus 3: lazy at any count, mixed shapes, axe at 390 reduced) |

### 8. Pushed: the Preview (Tay's brief)
- `9569bd8` pushed. Vercel built a **Preview** (`production_environment=false`). Production stays on `fb0f575`.
- Preview of `/lab/work`:
  - this build: `https://tay-shofer-portfolio-hqpcueiom-tays-projects-d5aefd6e.vercel.app/lab/work`;
  - the branch's own link, which follows each push:
    `https://tay-shofer-portfolio-git-proto-he-65ec6d-tays-projects-d5aefd6e.vercel.app/lab/work`.
  - Both sit behind Vercel's login (a logged-out request gets a 302 to `vercel.com/sso-api`).
- PR #18's description is updated with the session's table and numbers. It is still a draft.

### 9. Limitations (NC unless stated)
- **No real phone.** Headless raster is SwiftShader, so the controls' worst phone taps are a pessimistic bound.
- **Aegis's board** (`hero-aegis`) is encoded up to 900px wide. A 2× desktop asks for about 1000px, so it is slightly
  soft. Its full source capture is not on this machine (`M10_CAPTURES`).
- **The new DeveloperOS captures have no phone crop.** At 390 they are desktop windows about 279px wide, and their text
  is small.
- **Copy:** `refusal.webp` and `ai-features.webp` stay in `public/projects/`, unused by the lab.

### Waiting on Tay
- Review the four carousels on the Preview, and swap the GRAVITY FLOW capture he has in mind.
- Decide whether Concept A goes further. Its NEW values still wait for review: `--cine-lift`, `--cine-glow-lift`,
  `--cine-flow-turn`, `--cine-flow-scale`, `--cine-flow-dim`.
- **Move F:** the session 9 close set it for "next session" (on `main`). It has not been started: sessions 10–11 went to
  Concept A.
- Optional, on `main`: the chat launcher's fold on scroll (0.0076 CLS on `/`). His call; untouched here.

---

## 2026-11-18 — Session 10: Concept A, the cinematic hero, as a measured prototype (prototype, D2 reopened) (Claude Code)

**Scope (Tay's brief):**
- Build Concept A, the hero only, as a **measured prototype**. This consciously reopens D2 (Tay approved, 2026-11-18).
- Branch `proto/hero-a-cinematic` only: never merged, never deployed. The live homepage is not touched.
- Behind a noindex route, not linked from the live site.
- Measure it against the 205.7 KiB budget and the CWV thresholds, plus a11y, reduced motion and no-JS.

Skills: `frontend-design` (design plan and self-critique from screenshots), `verification-before-completion`.

### 1. Preconditions (VL)
- `git fetch`: `origin/main` = `a7a89fd` (PR #16). PR #17 (`docs/session-9-closeout`) is still open.
- Branch `proto/hero-a-cinematic` from `origin/main` (`--no-track`), then `npm ci`.

### 2. What was built (all new files; no tracked file changed)
- `app/lab/layout.tsx`: every `/lab` page is `noindex, nofollow, nocache`, with the root's canonical dropped.
  - It is not a robots.txt Disallow: a blocked crawler never sees the noindex.
  - `/lab` is not in the sitemap, and nothing on `/` links to it.
- `app/lab/hero-a/page.tsx`: everything a reader needs is server-rendered HTML:
  - the wordmark and the availability pill (gated on `availability.open`);
  - the role (`siteMeta.role`), the H1 and the lede (the brief's copy);
  - both actions ("Explore my work" to `/#work`; "Download CV" is the real résumé file);
  - the four flagships, each with its state from `heroIndex` (`data/proof.ts`).
- `app/lab/hero-a/featured.ts`: one tag per flagship. A unit test checks every word against that project's own
  tagline and summary. "Physics" is not in the data, so GRAVITY FLOW is a "gravity puzzler".
- `app/lab/hero-a/Constellation.tsx`: the one live element.
  - A 2D canvas (no WebGL), `aria-hidden`, `pointer-events: none`.
  - Drifting duotone nodes and proximity links; a mouse or pen gathers nearby nodes; touch is ignored.
  - The loop runs only while the field is on screen and the tab is visible.
  - The node count comes from the area: 40–120, or 22–48 on the light path (touch, < 640px, or ≤ 4 cores).
  - Pixel ratio capped at 2, or 1.5 on the light path. Links batched by colour × alpha; halos from sprites.
  - The count steps down when the draw cost stays over budget.
  - ≤ 60 draws a second, ≤ 30 on the light path.
  - Reduced motion (the OS or the site's own switch) draws one still frame.
- `app/lab/hero-a/hero-a.css`: scoped under `.hxa`, with its own dark tokens.
  - It reuses Geist, `--text-lead`, `--tracking-display`, `.shell` and the motion tokens.
  - Every rule outside the scope is conditioned on `:has(.hxa)`, so it is inert off the route.
  - One CSS load sequence: it runs, and ends visible, without JS, and is off with reduced motion.
  - The chat launcher is re-toned for the dark field, and the last strip is kept clear for it.
- `tests/unit/lab-hero-a.test.ts` (18 tests) and `tests/e2e/lab-hero-a.spec.ts` (16 tests).
- `scripts/lab-hero-a.mjs`: a reproducible CWV and FPS measurement, `/` against `/lab/hero-a`.

### 3. Guard changes: none were needed (VL)
- Scoping the guards for the prototype was approved, but nothing needed it.
- `git diff origin/main` on `tests/unit/dead-code.test.ts`, `tests/e2e/page.spec.ts` and `tests/e2e/budget.spec.ts` is
  empty.
- They still pass unchanged, because:
  - `dead-code.test.ts` bans WebGL, `three` and `lenis` (the field is a 2D context);
  - `page.spec.ts` and `budget.spec.ts` load only `/`, which still has no `<canvas>` and no WebGL.
- The prototype route has its own tests, held to the same 205.7 KiB budget.

### 4. Measured (VL; lab numbers from a local production server, never field data)
First-load JS, gzip, the `budget.spec.ts` algorithm:

| | JS | Scripts | HTML |
|---|---|---|---|
| `/lab/hero-a` (this branch) | **182.45 KiB** (budget 205.7) | 10 | 31.45 KB |
| `/` on `origin/main` | 181.79 KiB | 9 | 156.44 KB |
| `/` on this branch | 182.20 KiB (+0.41) | 10 | 156.51 KB |

- The +0.41 KiB on `/` (this branch's build only) contains no prototype code.
  - Turbopack split Next's own error-boundary styles into a new shared chunk (`errorStyles`, `WarningIcon`) once a
    second route shared them.
  - The marker test confirms no first-load script of `/` carries the field.

`scripts/lab-hero-a.mjs`, median of 5 cold runs:
- `/` was measured on a separate `origin/main` build.
- Mobile is 390×844 @3x with 4× CPU and slow-4G figures, applied through DevTools.
- INP is the worst of 6 interactions; FPS is frames delivered to an independent rAF counter over 3 s.

| | LCP (element) | CLS | INP | FPS | Main thread busy |
|---|---|---|---|---|---|
| desktop `/` | 140 ms (h1) | 0 | 24 ms | 60.4 | 5% |
| desktop `/lab/hero-a` | 84 ms (h1) | 0 | 56 ms | 60.2 | 13.6% |
| mobile `/` | 1592 ms (h1) | 0 | 40 ms | 60.5 (min 51.4) | 9.8% |
| mobile `/lab/hero-a` | 992 ms (h1) | 0 | 40 ms | 60.3 (min 60.1) | 23.7% |

All inside "good" (LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1).

### 5. Findings fixed on the way (VL)
- **The reveal hid the page from LCP.** As first built, every block faded in from `opacity: 0`. Chromium then
  reported **no LCP entry at all**, and FCP at about 1.75 s (desktop) and 2.2 s (mobile, 4×).
  - Cause: the text is first painted inside a compositor-run opacity-0 animation, and paint timing never re-reports it.
  - Variants were tested on 3 runs each: no reveal; fade from 0.01; the H1 rising without fading.
  - Fix: the H1 rises without fading. LCP is then the H1, at first paint (~80 ms desktop).
  - Rejected: fading from 0.01. It "passes" only by counting text no reader can see yet.
  - A new e2e test pins LCP = the H1 = FCP.
- **Mobile main thread 41% → 23.7%.** CDP breakdown on the 4× profile:
  - the field's script is only ~5%;
  - hiding the canvas's paint drops busy time to 11%, so raster is most of the cost; the mask is not.
  - The light path now draws ≤ 30 a second, and INP fell from 88 to 40 ms.
- **Contrast.** The unit test reads the floors from the CSS, on the base and under the brightest glow behind text:
  - the muted and faint inks were lifted (`#acb6c9` ≥ 7:1, `#95a0b6` ≥ 5.4:1, the site's own floors);
  - the brief's violet `#9b6bff` is 5.7:1 on the base and 4.2:1 over the violet glow. It is only in the 36–80px H1
    (large text, floor 3:1).
- **A11y bugs found by the tests:**
  - the wordmark's accessible name ran together ("Tay ShoferPortfolio");
  - the site chrome's paper-iris focus ring was under 3:1 on the dark field;
  - at 390px the wordmark target was 43.99px;
  - at 320×568 the CTAs ended below the first screen.
  - All four are fixed.

### 6. Accessibility (VL)
- axe-core 4.11.4 (already installed through `eslint-config-next`), WCAG 2.2 A/AA: **0 violations** at 1440 with
  motion, 390 with motion, and 1440 with reduced motion. 24 rules pass in each.
- axe could not judge two nodes, both expected:
  - the gradient clause (`background-clip: text`), covered by the unit contrast test;
  - the `aria-hidden` arrow glyph.
- Keyboard order: skip link, wordmark, both actions, the four projects, the chat launcher. Each has a solid 2px cyan
  ring.
- One h1; banner, main, and a labelled nav. Targets ≥ 44px at 1440, 1024, 390 and 320. No horizontal overflow.
- Reduced motion (the OS, and the site's switch through the `a11y` cookie): a still frame, 0 rAF callbacks, no reveal.
- No JS: everything visible, all links work, and the canvas is an empty, transparent layer.

### 7. Validation (Git Bash)
| Command | Result |
|---|---|
| `npm test` | **140/140** (15 files: 122 from `main` plus 18) |
| `npm run typecheck` | exit 0 |
| `npm run lint` | exit 0 |
| `npm run build`, then `GROQ_API_KEY= npx playwright test` | **148/148** (132 from `main` plus 16) |

### 8. Limitations (NC unless stated)
- Headless Chromium's GPU is SwiftShader (VL: the WebGL renderer string), so canvas raster ran on the CPU. The mobile
  numbers are a pessimistic bound. Not measured on a real phone.
- INP comes from 6 scripted interactions; it is not field INP. No Lighthouse run (not installed; not added).
- The loop runs continuously while the hero is visible and the tab is open (with the cap and the pauses above).
- At 390×844 the hero is about 50px taller than the screen: the second row of Featured work starts below it. The H1
  and both actions are in the first screen at 1440, 1024, 390 and 320 (tested).
- Copy that differs from the live site, by the brief's choice:
  - "Download CV" (the site says "résumé");
  - an eyebrow, which `page.spec.ts` bans on `/`;
  - "Available for opportunities", where `/` deliberately shows no availability line.

### 9. Pushed for a Preview (Tay's go)
- `proto/hero-a-cinematic` pushed at `fd93dd8`. Draft PR #18 opened against `main` (not for merge).
- Vercel built a **Preview** deployment (GitHub: `production_environment=false`). Production stayed on `a7a89fd`.
- The preview is behind Vercel Deployment Protection (a logged-out request gets a 302 to `vercel.com/sso-api`).
  Vercel adds `X-Robots-Tag: noindex`.
- No share link was made: the connector's fetch tool would create one.

### 10. Round 2: more life in the field (Tay: "too calm") (VL)
Only the field changed: `Constellation.tsx` and its tests. The copy, palette, CSS and every safeguard are the same.
- **Desktop:** 130 nodes at 1440×900 (was 108; ≤ 140), and drift of 7–18 px/s (was 5–14). The light path's count and
  drift are unchanged.
- **Twinkle:** every node's radius pulses slowly (4–10 s a cycle, each on its own phase). Bright nodes' halos breathe
  with it.
- **Pointer:** a soft pull that fades to nothing at the centre, with no repel. Links near it brighten, nodes within
  150px tether to it, and a faint glow (200px sprite) follows it.
  - The first tune (pull 60, fade inside 64px) packed nodes into a tight knot. The pull went to 20: against the
    0.8/s relax that is an inward drift of about 25 px/s, like the field's own.
- **Signals:** a soft duotone head with a short tail rides real links, 1–3 hops. It lights the link it rides and
  flashes the node it reaches.
  - Desktop: up to 3 at once, one every 1.6–3.2 s. Light path: up to 2, one every 3–5.5 s.
  - None with reduced motion (a still frame; `data-pulses` stays 0).
- **Trims found by measuring:**
  - In-page op knock-outs (desktop, pointer moving) put most of the first draft's added cost on image stamps (2.7 pp)
    and strokes (2.3 pp).
  - The glow shrank from 280 to 200px and the bright share returned to 12% (from 14%).
  - Links under 12% of the reach (≤ 4% alpha, about a fifth of all links by area) are no longer drawn, except near
    the pointer.

**Measured.** Same session; `fd93dd8` from a scratch worktree, interleaved before / after, 5 rounds each, medians.
The machine's load varied through the session: the identical `fd93dd8` build measured 21.7–31.8% phone busy across
rounds. So only the interleaved comparison counts, not the absolute numbers against section 4.

| | before | after |
|---|---|---|
| desktop FPS / worst frame gap | 60.2 / 17 ms | 60.2 / 17 ms |
| desktop INP (median, max) | 40, 56 ms | 24, 56 ms |
| desktop main thread busy | 12.7% | 14.1% (+1.4 pp) |
| phone FPS / worst frame gap | 60.2 / 17 ms | 60.2 / 17 ms |
| phone INP (median, max) | 40, 40 ms | 40, 48 ms |
| phone main thread busy | 21.7% | 22.3% (+0.6 pp; run spread 20.7–22.8) |
| LCP desktop / phone (h1) | 84 / 976 ms | 96 / 968 ms |
| CLS | 0 | 0 |

- First-load JS for `/lab/hero-a`: **183.49 KiB** (was 182.45; +1.04 KiB; budget 205.7). `/` is unchanged (182.20).
- axe WCAG 2.2 A/AA: 0 violations at 1440 with motion, 390 with motion, and 1440 with reduced motion. The same 2
  need-review items as before.
- The contrast floors pass (no CSS change).
- Validation:
  - `npm test` **141/141**;
  - typecheck and lint exit 0;
  - `npm run build`, then `GROQ_API_KEY= npx playwright test`: **150/150**. The 2 new tests check that signals
    appear and stay capped, at 3 on desktop and 2 on a phone.
- The guard files are still byte-identical to `origin/main`.

### 11. Round 2 pushed; round 3, the final energy pass (Tay: "better, still a touch calm") (VL)
- Round 2 was pushed on Tay's go (`b7092b0`). The Preview rebuilt (Vercel success; `production_environment=false`).
  Production stayed on `a7a89fd`.
- **Signals get more presence:**
  - desktop cap 3 → 4 (light path stays 2);
  - launch spacing 1.6–3.2 → 1.4–2.8 s (light path 3–5.5 → 2.6–4.6 s);
  - about a third take one more hop (1–4);
  - a longer, thicker tail, a larger head, a brighter ridden link.
  - The first draft (1.2–2.4 s) was eased: by Little's law it put about 56% more signals on screen.
  - Expected average signals at once: desktop ≈ 0.96 → 1.29 (+34%), phone ≈ 0.50 → 0.69 (+38%).
  - 15-second samples are too noisy to judge this: the same build gave 68% and 91% of time with a signal.
- **The sky breathes:**
  - the two glows are now their own elements;
  - the field's clock drifts them by transform and opacity, 5 times a second (26 s and 34 s cycles, about 3% travel,
    6% scale, opacity 0.8–1);
  - they pause with the loop and rest under reduced motion. Without JS they sit where they always were.
  - Measured and rejected: a CSS animation of the same drift cost **+5.3 pp** of phone main thread (style and layout
    2.4%: Chrome serviced it every frame). At 5 Hz the cost is about +1 pp.
  - `will-change` on the glows was also dropped. The first `translate3d()` promotes them after first paint; with it,
    2 of 5 desktop LCPs ran about 40 ms late.
- **Desktop drift:** 7–18 → 8–20 px/s.
- **CTA:** "Download CV" → "Download résumé". The link has no `aria-label`: its accessible name is the text plus the
  sr-only note, now "Download résumé (PDF · two pages, 79 KB)". Same file and download target.

**Measured.** Interleaved against `b7092b0` (scratch worktree), 5 rounds each, medians:

| | before | after |
|---|---|---|
| desktop FPS / worst frame gap | 60.2 / 17 ms | 60.2 / 17 ms |
| desktop INP (median, max) | 24, 56 ms | 40, 48 ms |
| desktop main thread busy | 14.1% | 14.0% |
| desktop LCP (h1) | 92 ms | 72 ms |
| phone FPS / worst frame gap | 60.3 / 17 ms | 60.2 / 17 ms |
| phone INP (median, max) | 40, 40 ms | 40, 48 ms |
| phone main thread busy | 21.6% | 22.8% (+1.2 pp; run spreads 19.9–23.2 vs 19–25.2) |
| phone LCP (h1) | 928 ms | 968 ms (run spreads 924–1028 vs 880–1048) |
| CLS | 0 | 0 |

- First-load JS for `/lab/hero-a`: **183.71 KiB** (+0.22; budget 205.7). `/` unchanged at 182.20.
- axe WCAG 2.2 A/AA: 0 violations at 1440 with motion, 390 with motion, and 1440 with reduced motion.
  - At 1440 a third need-review item: `.hxa__lede`, "partially overlaps other elements". Its box now overlaps the
    violet glow element.
  - It is covered by the unit floor (mist ≥ 7:1 on the violet peak). The glows' peak alphas are unchanged (0.17,
    0.2), and their opacity only dims.
- The contrast floors pass (7/7).
- Validation:
  - `npm test` **142/142**;
  - typecheck and lint exit 0;
  - `npm run build`, then `GROQ_API_KEY= npx playwright test`: **150/150**. The glow and signal tests were updated:
    the cap is 4 on desktop; the glows move with the loop, stop with it and rest under reduced motion.
- The guard files are still identical to `origin/main`.

### 12. Round 3 pushed; round 4, the cinematic system extracted (2026-11-19) (VL)
- Round 3 was pushed on Tay's go (`ca81fc4`). The Preview rebuilt (Vercel success). Production stayed on `a7a89fd`.
- **The layer:** `app/lab/_cinematic/cinematic.css`, documented in `docs/CINEMATIC_SYSTEM.md`.
  - Extracted from the locked hero, value for value: colours (two bases, three inks, cyan / violet, the status dot as
    the brand cyan), glass and glow surfaces, Geist type (sizes, weights, leading, tracking), spacing steps, control
    heights, radii and motion tokens.
  - Plus the scope chrome, the focus ring, `.cine-duotone-text` and the one reveal (`[data-reveal]`, with `settle`
    for the largest paint).
  - Only `app/lab/layout.tsx` imports it, and every selector needs a `.cine` root (or `:has(.cine)`).
- **The hero is its first consumer:**
  - root `cine hxa`;
  - six `data-reveal` blocks (the H1 `settle`);
  - `hero-a.css` keeps only its geometry, with no hex and no local tokens;
  - the canvas's and the SVG mark's colours are pinned to the layer by a test.
- **Proof the hero is unchanged.**
  - Before and after builds compared: every element's and pseudo-element's computed style in 5 modes (reduced motion
    1440 and 390, no JS, motion on, high contrast), and full-page pixels with the random canvas hidden.
  - **0 of 163,871 computed values differ, and 0 pixels differ.**
- **Found and fixed: a branch-only leak into `/`'s stylesheet.**
  - Since round 1, a comment in `tests/unit/lab-hero-a.test.ts` held a literal utility name.
  - Tailwind scans `tests/`, and so added one rule (21 bytes) to the global stylesheet of this branch's build.
  - The comment is reworded. Both of `/`'s stylesheets are now byte-identical to `origin/main`'s.
  - The doc records the rule: never write utility names in lab files; docs go in `docs/`.
- **`/` against `origin/main`** (scratch worktree build):
  - every source `/` imports is identical (`git diff`);
  - both stylesheets are byte-identical;
  - the markup is identical with script tags and chunk paths masked.
  - What remains is round 1's bundle split: the same JavaScript in 10 chunks instead of 9 (+180 bytes raw). It comes
    from a second route existing, and only in this branch's build.
- **Against the branch before this task:** every script on `/` is byte-identical. The stylesheet changed only by
  losing that stray rule.
- Validation:
  - `npm test` **148/148** (`tokens.test.ts` 15/15);
  - typecheck and lint exit 0;
  - `npm run build`, then `GROQ_API_KEY= npx playwright test`: **150/150**. axe: 0 violations with motion on and off.
  - The guard files, `app/globals.css`, `lib/tokens.ts`, the root layout, `/` and every live source are identical to
    `origin/main`.
  - First-load JS for `/lab/hero-a` is unchanged at 183.71 KiB.

### 13. Round 5: the Work slice in the cinematic language (2026-11-19) (VL)
- **The route:** `/lab/work`, under the `/lab` layout (noindex, not linked).
  - Files: `app/lab/work/{page.tsx, panels.ts, work.css}`.
  - A server component with no client code of its own; first-load JS is the shared runtime only.
- **Four product panels** (T Poker, Aegis, DeveloperOS, GRAVITY FLOW), recruiter-first:
  - name and one line first;
  - then the status, three stack chips and the links;
  - the real capture on a glass stage, alternating sides from 1024px.
- **Content derived from the data, nothing typed fresh** (`docs/CINEMATIC_SYSTEM.md`, "Work slice"):
  - taglines verbatim and the site's status strings;
  - chips from each stack;
  - links: T Poker's web app, and the Aegis and DeveloperOS repositories; plus each chapter on the live page;
  - "Private repository" labels for T Poker and GRAVITY FLOW, with no slug or URL anywhere;
  - existing captures and alt text.
- **One empty, hidden, labelled P4 demo slot per panel:** no demo, no placeholder.
- **Behaviour:**
  - the opening's one reveal (the title settles);
  - stages lift on hover, keyboard focus and touch, and stay still with reduced motion;
  - the first capture is eager and high priority, the other three lazy;
  - static glows only.
- **Layer additions:**
  - seven tokens equal to the site's own values (type tiers, section rhythm, radius steps, the dark object shadow);
  - two NEW values for Tay's review: `--cine-lift` −4px, and `--cine-glow-lift`.
  - The hero is still unchanged: 0 of 163,871 computed values and 0 pixels differ against the round 4 baseline.
- **Found and fixed: the Tailwind leak, again.**
  - An object key in the new e2e spec, named like the shadow utility, put one rule (+248 bytes) into `/`'s stylesheet.
  - Renamed. A new e2e test now pins `/`'s two stylesheets to `origin/main`'s SHA-256, so any future leak fails the
    suite.
  - `/` against `origin/main`: both stylesheets byte-identical; markup identical with script tags and chunk paths
    masked; the same 9 → 10 chunk split as since round 1.

**Measured** (`scripts/lab-hero-a.mjs`, 5 cold runs):

| | LCP (element) | CLS | INP | FPS | main thread busy |
|---|---|---|---|---|---|
| desktop | 80 ms (the first capture) | 0 | 32 ms | 60.5 | 3.2% |
| phone (4× CPU, slow 4G) | 916 ms (the first capture) | 0 | 32 ms | 60.4 | 6.6% |

- First-load JS for `/lab/work`: **180.19 KiB** (budget 205.7). HTML 45.17 KB.
- axe WCAG 2.2 A/AA: 0 violations at 1440 with motion, 390 with motion, and 1440 with reduced motion.
  - At 390, three need-review items: the lede and two project lines, mist text whose boxes overlap the glow
    elements.
  - They are covered by the layer's floor: mist ≥ 7:1 on the glow peaks.
- **Keyboard:** skip link, then per panel the product's link and its chapter link, then the launcher. Each has a solid
  2px cyan ring, and focus lifts its own panel.
- **No JS:** every name, line, state, chip, capture (lazy, native) and link is present and works.
- Validation:
  - `npm test` **168/168** (`tokens.test.ts` 15/15);
  - typecheck and lint exit 0;
  - `npm run build`, then `GROQ_API_KEY= npx playwright test`: **165/165** (132 `main`, 18 hero, 15 Work);
  - the guard files are identical to `origin/main`.
- Not verified: iOS Safari's `:active` (it needs a touch listener; a tap lifts through emulated hover instead), and
  any real device.

### 14. Round 5b: the title, and the push (2026-11-19) (VL)
- Tay changed the title to "Four projects, built end to end." (not all four are shipped products). A unit test pins it.
- Rounds 4, 5 and the title were pushed on Tay's go (`377ce22`). The Preview rebuilt. PR #18 is still a draft, and
  Production stayed on `a7a89fd`.

### 15. Round 6: per-project carousels, and phone proportions (2026-11-19) (VL)
- **Galleries** in `data/projects.ts` (`PROJECT_GALLERIES`, a separate pure export), exactly as Tay listed:
  - T Poker: home, live, settle;
  - GRAVITY FLOW: gameplay, boss;
  - Aegis: the alert row;
  - DeveloperOS: the search.
  - The alt text is the site's own: `gf-boss` is `public/projects/gravity-flow/boss.webp` re-encoded (a unit test
    measures it), so it takes that entry's "World boss encounter".
  - The phone crops are the live chapters'.
- **The carousel** (`Reel.tsx`): a CSS 3D coverflow (perspective and rotateY; no WebGL), the WAI-ARIA tabbed pattern,
  arrows, swipe, no autoplay; a flat slider with reduced motion; the first capture alone without JS. Single-capture
  projects stay still. Details: `docs/CINEMATIC_SYSTEM.md`, "Galleries and the carousel".
- **Phone proportions:**
  - T Poker's capture went from 280 × 607 to 171 × 370 at 390 × 844;
  - phone captures are capped at 190px wide and ≤ 45% of the screen tall;
  - the spacing is tighter.
- **Found and fixed on the way (all measured):**
  - **`/`'s first-load chunks changed twice.**
    - The client carousel imported the image table, and Turbopack re-cut one of `/`'s chunks.
    - It imported the site's `ArrowLeftIcon`, and app-wide tree-shaking kept that once server-only icon in `/`'s chunk
      (+120 bytes).
    - Fix: the server renders each capture and hands them in, and the island draws its own arrow.
    - After the fix, `/` is byte-identical to `377ce22`: the HTML and all 12 first-load assets.
    - Every built chunk was hashed before and after: only the lab's three (the Work page script, its CSS, the layer
      CSS) differ. The case-study chunk is unchanged.
  - **Phone CLS 0.017 → 0.** A blanket `aspect-ratio: …, auto` override had dropped the box reservation that width and
    height give. It is now limited to captures with a phone crop.
    - A new e2e test holds the images pending and asserts every box keeps its height.
    - Red/green: the old rule collapses two captures to 0px.
- **Measured:**
  - first-load JS for `/lab/work` **181.39 KiB** (the carousel's own chunk 4.72 KiB; budget 205.7);
  - desktop LCP 88 ms, CLS 0, INP 40 ms, FPS 60.5;
  - phone (4× CPU, slow 4G) LCP 916 ms, CLS 0, INP 48 ms, FPS 60.4 (3 runs).
  - axe: 0 violations at 1440 with motion, 390 with motion, and 1440 with reduced motion, after the carousel has
    moved.
- **The hero is unchanged:** 0 of 163,871 computed values and 0 pixels.
- **Against `origin/main`:** both of `/`'s stylesheets byte-identical (pinned by the e2e test), and the same 9 → 10
  chunk split as since round 1.
  - `data/projects.ts` differs by the 19-line gallery export (Tay's brief).
  - The guard files, `globals.css`, `lib/tokens.ts`, the root layout, `/`, `components/`, `lib/` and `public/` are
    identical.
- Validation:
  - `npm test` **177/177** (`tokens.test.ts` and `dead-code.test.ts` 21/21);
  - typecheck and lint exit 0;
  - `npm run build`, then `GROQ_API_KEY= npx playwright test`: **173/173** (132 `main`, 18 hero, 23 Work).
- Not verified: a real phone (iOS Safari's `:active` and touch feel), and real-device carousel performance.

### Waiting on Tay
- Decide whether Concept A goes further. Round 6 is committed locally, not pushed: pushing updates PR #18's Preview.
- Review the NEW layer values: `--cine-lift` and `--cine-glow-lift` (round 5); `--cine-flow-turn`,
  `--cine-flow-scale` and `--cine-flow-dim` (round 6).
- Captures to add (Aegis and DeveloperOS have one each): `docs/CINEMATIC_SYSTEM.md`, "To add a capture".
- On `main`, the next close-out should record "D2 reopened for a measured prototype" in RESEARCH_AND_DECISIONS. This
  branch is never merged.

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
| 2026-11-18/19 | Session 10 | Concept A prototype (D1 reopened, D2 not: Tay's correction at the session 11 close; branch `proto/hero-a-cinematic`, draft PR #18, never merged): the `/lab/hero-a` hero, the cinematic layer, the `/lab/work` slice and its carousels (rounds 1–6) | `app/lab/**`, `data/projects.ts` (galleries), `docs/CINEMATIC_SYSTEM.md`, `scripts/lab-hero-a.mjs`, `tests/**/lab-*` |
| 2026-11-19 | Session 11 | Every flagship's real captures in its carousel (`9569bd8`): 8 captures encoded, the lab's own image list, box reservation for mixed shapes, window carousels, two-row controls below 390px; START-HERE brought up to date | `app/lab/work/*`, `data/lab-images.ts`, `data/projects.ts`, `scripts/m10-images.mjs`, `public/work/*` (48 new), `tests/**/lab-work*`, `docs/CINEMATIC_SYSTEM.md`, `docs/WORKLOG.md`, `claude/START-HERE.md` |
| 2026-11-19 | Session 11 close | Carousels approved by Tay; the D1/D2 framing corrected (D1 reopened, D2 not); CLAUDE.md brought level with `main`'s plus the prototype; the close-out PR for `main` refreshed from `docs/session-10-closeout`; `docs/session-9-closeout` deleted | `CLAUDE.md`, `claude/START-HERE.md`, `docs/WORKLOG.md`, `docs/CINEMATIC_SYSTEM.md` |
| 2026-11-19 | Session 12 | About (P3.3) on `/lab/work` from the live About's own words (`121d86b`); the 11 "D2 reopened" comments reworded (`4dccdf8`); the five NEW layer values approved as they are; a fourth Tailwind leak found (PR #19's CLAUDE.md line, live on `main`) and fixed on this branch (`fb3bb41`) | `app/lab/work/{about.ts,AboutBlock.tsx,page.tsx,work.css}`, `tests/{unit,e2e}/lab-work.*`, 11 lab headers, `CLAUDE.md`, `docs/CINEMATIC_SYSTEM.md`, `claude/START-HERE.md`, `docs/WORKLOG.md` |
| 2026-11-19 | Session 12 close | About approved by Tay; PR #20 opened into `main` (the CLAUDE.md Tailwind gotcha bullet reworded: `/`'s sheet back to 44,530 bytes); `docs/session-10-closeout` deleted (merged as #19); scratch cleaned | `docs/WORKLOG.md`, `claude/START-HERE.md`, `CLAUDE.md`, `docs/CINEMATIC_SYSTEM.md` (PR #20: `CLAUDE.md`) |
| 2026-11-19 | Session 13 | PR #20 merged and its branch deleted. Stack (P3.4) on `/lab/work`, in three passes on Tay's reviews: a project line per tool (`757c377`); the live Stack's layout with a dimming filter (`d3373b6`); a filter that shows only the chosen project's tools, as pills, with a no-scroll-jump hold (`8955039`). Security group; one small island (+351 bytes gzip) | `app/lab/work/{stack.ts,StackBlock.tsx,StackFilter.tsx,page.tsx,work.css}`, `tests/{unit,e2e}/lab-work.*`, `docs/CINEMATIC_SYSTEM.md`, `claude/START-HERE.md`, `docs/WORKLOG.md` |
| 2026-11-19 | Session 13 close | Stack approved; its LCP cost kept and logged as a P5 item (ROADMAP #13); the Contact re-check logged (#14); CLAUDE.md's stale code reference, verified commit and counts updated | `CLAUDE.md`, `claude/START-HERE.md`, `docs/{WORKLOG,ROADMAP,CINEMATIC_SYSTEM}.md` |
| 2026-11-19 | Session 14 | Think · Build · Ship (P3.5) under Stack from the live section's own words, plus one DeveloperOS line in Tay's wording (`8382889`); the #14 hold re-checked (keep, recommended); no glow is a scroll anchor (`d1c53a3`) | `app/lab/work/{tbs.ts,TbsBlock.tsx,page.tsx,work.css}`, `tests/{unit,e2e}/lab-work.*`, `docs/{CINEMATIC_SYSTEM,ROADMAP,WORKLOG}.md`, `claude/START-HERE.md` |
