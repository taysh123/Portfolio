# P4 plan: the four explainers, back in Concept A

**Status: approved by Tay on 2026-11-21, with the decisions below (Session 29). No code changed.** Written on
`docs/p4-plan`, cut from `main` = `origin/main` = Production = `c29c0b1`. Each explainer is still its own session, branch
and PR, built on that session's brief.

Labels: **VL** = verified locally in S29 (files, git objects at `product-plates-final`, read-only `gh api` and `curl`).
**NC** = needs confirmation (an estimate, or a check left to the session that builds it).

Read with: `docs/ROADMAP.md` ("P4" and its restore record), `docs/CINEMATIC_SYSTEM.md` ("The Work slice", "Galleries
and the carousel"), `docs/PROJECT_CONTEXT.md` §4, `docs/RESEARCH_AND_DECISIONS.md` (R4, R6, R12).

---

## Decisions (Tay, 2026-11-21)

Tay approved the plan with these decisions. Where one differs from a recommendation below, the decision wins.

**The general decisions**
- **Q1, Q2, Q3, Q5, Q6:** approved as written (§2):
  - in the panel, not the dialog;
  - the slot becomes the panel's new row;
  - the marks go on the carousel's own slide;
  - the colour mapping, with no new value;
  - what doesn't come back.
- **Q7 and §6, the tests:** approved.
  - The two slot tests change once per session.
  - Each explainer's restored, retired, changed and new tests are approved as listed in §3 and §6.
  - Each test change goes in its own commit, naming this approval ("Tay, 2026-11-21, P4 plan decisions").

**T Poker (§3.1)**
- **Option A**, with option C as the fallback.
- **The carousel's no-JS change** (its server output carries slides 2 and 3) gets a final look from Tay at S32's start,
  before it is built.
- **The legend is visible:** "Walk through T Poker" (`dict.poker.walk`).
- **At S32's start (Tay):** go on option A as described; yes to two test changes outside §3.1's list
  (`lab-work.spec.ts:303`, the keyboard order, and `lab-work.test.ts:278`, the unit twin of the no-JS check) and to the
  three S30/S31-pattern tests; the no-JS `aria-hidden` edge accepted.
- **During S32, a correction to §3.1 (Tay accepted the cost):** "the browser fetches nothing for them" holds with
  JavaScript only. Without it, browsers ignore `loading="lazy"` (the HTML spec), so the two step captures in the server
  output are fetched on load: +15.7 KB at 1440, +25.3 KB at 390. With JS nothing extra is fetched, before hydration or
  after. Tay chose that over a CSS-image way of drawing them, or option C. Built in S32 (`docs/WORKLOG.md`, "Session
  32").

**Aegis (§3.2)**
- **Keep the ring.**
- **C1 is approved, in these exact words:** "Severity, a per-technique MITRE weight (higher for techniques that are
  harder to detect), and one minus the rule's false-positive rate multiply into one score, clamped to 0–1."
- **C2 is approved, in these exact words:** "The agent signs the request body with an HMAC; the API verifies it in
  constant time (no replay protection yet)."
- **C3 is not needed:** Q2 is approved and the ring stays, so "the highlighted row above" stays true.
- **The stacked branches below about 400px:** approved, subject to Tay's review of the screenshots.
- **The shared-schema note stays.**
- **The `onScreen` sentence is dropped.**

**DeveloperOS (§3.3)**
- **The rail's name is visible:** "From your files to an answer, as implemented" (`dict.dos.flow`).

**GRAVITY FLOW (§3.4)**
- **Numbered rings on the frame, and a legend in the slot.**
- **The lede is the legend's lead-in:** "Press and hold to place a gravity well, and pull a lost star home."
  (`flagships[3].lede`).
- **It waits for #18.**

**The order (§7) and S30 (§8)**
- **The order:** DeveloperOS (S30), Aegis, T Poker, then GRAVITY FLOW.
- **P4 goes before #22.** This changes the standing order "#18, #22, then P4" (Tay, S24). `docs/ROADMAP.md`,
  `claude/START-HERE.md` and `CLAUDE.md` take it in the next docs commit.
- **S30's scope:** as written in §8.

---

## 0. The short version

- **Where:** each explainer goes in its own panel's demo slot, always shown, with no click and nothing to open. It is
  server-rendered. The case-study dialog stays as it is.
- **The slot moves to a new row under the panel's first row.** That row spans both columns from 1024px, and it comes
  after the capture on phones.
  - The approved first row (the words and the capture) stays pixel-identical.
  - Every "Case study" button stays where it is.
- **Captures:** none is new, and none is shown twice.
  - The captures the explainers used are already the first slides of the panels' carousels.
  - The marks are drawn on that slide on the server, with no JavaScript: the Aegis row's ring, DeveloperOS's citation
    boxes, and GRAVITY FLOW's three points.
- **Cost:**
  - JS: zero for three of the four. T Poker's steps drive its carousel, for about +0.2 to 0.5 KiB.
  - CSS: about 12 KB raw, 2.5 to 3.5 KB gzip, for all four. HTML: about +15 to 18 KB, on a budget of 568 KB.
  - All four sit below the fold, so the LCP is still the hero's h1. Each session measures the real numbers.
- **Copy:** word for word from `data/work.ts` and `lib/dict.ts`.
  - Both files are still on `main`, unchanged since the tag, and `tests/unit/work.test.ts` still checks them.
  - One Aegis line is imprecise and needs Tay's exact words (C1). One addition is optional (C2).
- **Order:** DeveloperOS, Aegis, T Poker, then GRAVITY FLOW (after #18). One per session.
- **First session (S30):** DeveloperOS cite-or-decline. It also lays the groundwork the other three reuse: the slot's
  new row, a mark drawn on a carousel slide, the colour mapping, and the slot tests.

## 1. What the plan rests on (VL)

### 1.1 The explainers at the tag

All four were server components with **no client code**. The T Poker stepper's movement was pure CSS.

| Explainer | Files at `product-plates-final` | Captures it used | Where those captures are on `main` |
|---|---|---|---|
| T Poker stepper | `components/work/PokerChapter.tsx`, `poker.css` | `poker-home`, `poker-live`, `poker-settle`; the lockup art | T Poker's carousel, slides 1–3 (of 5) |
| Aegis trace | `components/work/AegisChapter.tsx`, `aegis.css` | `aegis-alerts` and its phone crop | Aegis's carousel, slide 1 (of 2) |
| DeveloperOS cite-or-decline | `components/work/DeveloperOSChapter.tsx`, `dos.css` | `dos-search` and its phone crop | DeveloperOS's carousel, slide 1 (of 4) |
| GRAVITY FLOW marked frame | `components/work/GravityChapter.tsx`, `gravity.css` | `gf-gameplay` (marked), `gf-boss` | GRAVITY FLOW's carousel, slides 1–2 (of 5) |

### 1.2 What is still on `main`

- **The copy.** `data/work.ts`, `lib/dict.ts`, `data/images.ts` and `lib/content.ts` are byte-identical to the tag:
  `git diff product-plates-final main` is empty for all four.
  - The strings: `pokerSteps`, `aegisTrace`, `aegisCopy`, `dosFlow`, `dosRefusal`, `dosRefusalCaption`, `gfFacts`, and
    `dict.poker`, `dict.aegis`, `dict.dos`, `dict.gf`.
- **The copy's tests.** `tests/unit/work.test.ts` still checks that copy against `data/projects.ts`: the numbers, the
  technical terms, the Detect threshold, the refusal word for word, and no physics claim.
- **What the release removed:** only the components, their stylesheets and the e2e tests in `tests/e2e/chapters.spec.ts`.
- **The geometry.**
  - Aegis: `AEGIS_ROW` and `AEGIS_CROPS` are still in `data/images.ts`.
  - DeveloperOS: the chips' boxes are the tag's `CHIPS`, which were never exported. `components/sections/panels.ts`
    keeps their labels as `DOS_CHIPS`.
  - GRAVITY FLOW: the marks are the tag's `MARKS`.
- **`Pic.tsx` is gone.** `components/sections/Shot.tsx` draws a capture now: AVIF and WebP, the real size, and the phone
  crop.

### 1.3 The page they go back into

- **The slot.** It is `components/sections/Work.tsx:66–68`: inside each panel's words column, after the links, empty
  and hidden.
  - It is pinned by `tests/unit/lab-work.test.ts:247` and `tests/e2e/lab-work.spec.ts:430–431`.
- **The panel.** A grid: from 1024px, the words beside the capture, on alternating sides.
  - T Poker and DeveloperOS show their capture on the left; Aegis and GRAVITY FLOW on the right.
  - On phones, the words come first, then the capture.
- **The carousel** (`components/sections/Reel.tsx`). The page renders each picture on the server and hands it in.
  - Before hydration, and without JS, only the first capture is mounted.
  - Each capture sits in a device frame that clips what is inside it. So a mark drawn inside a slide moves, turns and
    dims with the slide, and costs no JavaScript.
- **The case-study dialog.** It is client-only, loaded on the first "Case study" press, and in the site's dark theme
  (R3), not the layer. Its gallery already shows each project's captures.
- **The focus trap** (`lib/useFocusTrap.ts`, S25). In a modal, it moves focus itself on every Tab, over every visible
  link, button and input. So a radio group would be three Tab stops there, not one (§4).

### 1.4 The baseline to measure against

- **Production `/`** (S29, a read-only `curl` through Cloudflare with a browser `Accept` header):
  - HTML: 127,702 B.
  - Two stylesheets: 44,021 B and 28,727 B (9,889 B and 5,258 B at gzip -9). The second holds the layer and the
    sections.
- **First-load JS:** 187.06 KiB gzip (S28's build, identical to `main`'s), on a budget of 205.7.
- **Lighthouse mobile, median of 5:** Performance 100, LCP 1,061 ms (S26, local). Production in S24: 100, 1,064 ms. The
  LCP element is the hero's h1.
- **The suite:** unit 225/225; Playwright 197/197 (Chromium, S28).

---

## 2. Decisions that apply to all four (for Tay)

**Q1. In the panel, not in the dialog.** Recommended.
- A recruiter reads the panel, and the point of an explainer is a ten-second read without a click.
- In the panel it is server HTML. So it works without JS, it is indexable, and it costs no JavaScript.
- In the dialog it would ship as client code in the lazy chunk, and it would cost nothing on first load. But there:
  - no-JS has no meaning, because the dialog needs JS;
  - its gallery already repeats these captures;
  - the dialog is in the site's theme, not the layer;
  - a radio group meets the focus trap (§4).
- The dialog stays the depth path: problem, architecture, decisions, honest notes.

**Q2. The slot becomes a new row of the panel.** Recommended.
- The change: the slot moves from the end of the words column to the panel's last child.
  - From 1024px, it spans both columns under the first row; on phones, it comes after the capture.
  - It is a one-line markup move in `Work.tsx`.
- Why:
  - The first row stays pixel-identical, so the "Case study in the first screen" test (`chrome.spec.ts:170`) holds.
  - On phones the explainer no longer pushes the capture down.
  - The Aegis trace gets the width its forking line was drawn for.
  - Every explainer sits under its capture at every width, so the Aegis copy's "the highlighted row above" stays true.
- **T Poker and GRAVITY FLOW** place theirs under the capture's column only: the steps and the legend belong under the
  screen they refer to.
- **The alternative:** the slot stays in the words column, which is narrow (about 430 to 560px) and pushes the capture
  down on phones.

**Q3. Annotate the carousel's own slide; never bring a second copy of a capture.**
- What is drawn: the Aegis ring, the DeveloperOS boxes and the GRAVITY FLOW points.
- How:
  - Each is drawn inside that capture's slide on the server, from the tag's measured geometry.
  - Each is hidden from screen readers, because the capture's alt text already says what it marks.
  - Each has the phone crop's own positions below 640px, as the tag did.
- The cost: no client code, and no change to the carousel.
- The device frame needs a positioning context, which is one rule.

**Q4. Static, always shown.**
- Nothing animates by itself, and nothing reveals on scroll (motion rule 1).
- The one interactive explainer is T Poker's, and its movement is the carousel's own.

**Q5. Colours from the layer, no new value.**
- The plates' own colours are not in the duotone: gold, the alert red, the citation blue and the decline pink.
- If a value outside the mapping turns out to be needed, it comes to Tay first (`docs/CINEMATIC_SYSTEM.md`).

| Was (plate) | Becomes |
|---|---|
| Rails and hairlines | `--cine-hair` |
| Plain nodes | `--cine-faint` |
| Aegis: the Detect node, its segment of the line, and the row's ring (was the alert red) | `--cine-cyan` |
| DeveloperOS: the Evidence and Cite nodes, and the citation boxes (was blue) | `--cine-cyan` |
| DeveloperOS: the Decline node (was pink) | `--cine-violet` |
| T Poker: the chosen step's underline (was gold) | `--cine-cyan` |
| Panels and boxes (the refusal, the fork's branches, the step track) | `--cine-glass-ink`, edge `--cine-edge` |
| Names / bodies / small numbers | `--cine-ink` / `--cine-mist` / `--cine-faint` |

**Q6. What doesn't come back.**
- From the chapters:
  - the headings, ledes and "I built" lines (the panel has the name and the tagline);
  - T Poker's lockup and store badges (the case study has the stores);
  - the window title bars (the carousel draws its own frame);
  - the Aegis note beside the console (it repeats the Detect step and the capture's alt text);
  - GRAVITY FLOW's three facts (they repeat its tagline, its chips and its status);
  - DeveloperOS's "Released · v1.0.0" link.
- From `app/globals.css`: the plate tones and studio light.
- The restore record's shared `components/work/Work.tsx` and `work.css` stay retired: Concept A's `Work.tsx` hosts the
  explainers.

**Q7. Tests.**
- Each test change goes in its own commit, naming the approval. §6 lists them all.
- These stay unchanged: the WebGL, canvas, `three` and `lenis` guards; the JS and HTML budgets; the contrast floors; the
  institution, private-repo and English guards.

---

## 3. The four explainers

### 3.1 T Poker: the stepper

**1. What it showed, and what a recruiter learns in 10 seconds**
- On the navy plate, three real phone screens stood on a CSS 3D stage: one in front, two turned behind it.
- Under them was a three-part control: "1 Start a game · 2 Run the tournament · 3 Settle up". Choosing a part brought
  that screen to the front and showed its one-line caption.
- It was a native radio group, and the arrangement was pure CSS (`:has(:checked)`). So it worked before hydration and
  without JS. Step 2 was chosen by default.
- *In ten seconds:* T Poker is a real, shipped product with a whole loop, on its real screens:
  - start a game with no account;
  - run a tournament with a live blind clock and prize pool;
  - settle up to the cent at the end of the night.

**2. How it fits Concept A**
- **The catch:** its three screens are already slides 1–3 of T Poker's carousel (five captures, approved in session 11).
  Restoring its own stage would show them twice in one panel.
- **Option A, recommended: the steps drive the carousel.**
  - The slot holds only the three-part control and the captions, under the carousel (T Poker's capture column, the left
    one from 1024px).
  - Choosing a step brings that capture to the front of the carousel.
  - Moving the carousel to slide 1, 2 or 3 checks the matching step. Slides 4 and 5 (the podium and the stats) check none
    and show no caption. The captions share one grid cell, so nothing shifts.
  - Step 1 is chosen by default, because the carousel opens on the home screen.
- **Option B: the stepper as it was,** with its own three phones. Rejected: the same three screens twice.
- **Option C: a static three-step list,** with the captions and no control. It needs zero JS, and works without JS by
  nature, but it is no longer a stepper, and nothing ties a caption to its screen. It is the fallback if A's coupling
  proves fiddly.
- **Dark theme:**
  - the track on glass-ink, with the edge token;
  - the chosen part in ink, with a cyan underline (it was gold);
  - the step numbers in faint ink, and the caption in mist.
- **Motion:** the carousel's own move (`--cine-dur-move`) and a short hover tone (`--cine-dur-hover`). Nothing moves on
  its own.
- **Reduced motion:** the carousel is already a flat slider that swaps at once, and the control's transitions go.
- **Phones, 320 and 390:**
  - three equal parts in one row at every width, on one line where it fits and on two where it doesn't (the tag's rule,
    tested at 320, 360, 390 and 430);
  - the caption centred under them.
  - At 320 each part is about 90px wide (NC: measure).

**3. Keyboard, screen reader, no JS**
- **The markup:** a fieldset whose legend is "Walk through T Poker" (`dict.poker.walk`). At the tag it was for screen
  readers only; I'd show it as the control's small label (Tay's call; the same words).
- **The keyboard:**
  - Three native radios make one Tab stop, the chosen one. The arrow keys move between them and check them.
  - Each radio is described by its caption (`aria-describedby`).
  - The ring shows on the visible part. `chrome.spec.ts`'s Tab walk already reads a radio's ring from its visible
    sibling.
- **The Tab order in the panel:** the links and "Case study", then the carousel's three stops, then the steps.
- **Screen readers:** a step's name and its caption are spoken. When a step moves the carousel, the carousel skips its
  own polite announcement, or the caption and the alt text would both be read.
- **No JS: keeping the bar.**
  - The server renders the steps with step 1 chosen and all three captions, and CSS shows the chosen caption.
  - For the screen to follow as well, the carousel's server output must include slides 2 and 3's pictures. Today it
    includes only the first.
  - They are kept out of layout (`display: none`) until chosen, so the browser fetches nothing for them. A CSS `:has()`
    rule per step applies before hydration only.
  - **This changes an approved component's no-JS behaviour, for Tay's approval.** Without it, the caption would change
    but the screen wouldn't, and the bar would not be met.
- **Safari:** its default Tab skips links and, without macOS keyboard navigation, buttons (S25). Whether it skips radios
  too is NC. Once a radio has focus, the arrows work. If it does skip them, the new Tab test joins #22's WebKit list.

**4. Cost (estimates, NC)**
- **JS:** the carousel gains the two-way sync and the no-JS rendering of three pictures, for about +0.2 to 0.5 KiB gzip
  of first-load JS (the carousel ships in it). The headroom is 18.6 KiB. Option C costs 0.
- **CSS:** about 3 KB raw, 0.6 to 0.9 KB gzip: the control and the captions from `poker.css`, plus the pre-hydration
  slide rules. Its stage, lockup, stores and layout don't come back.
- **HTML:** about +2.5 to 3 KB for the control and the captions, and about +3 KB for the two extra pictures' markup.
- **LCP:** the stepper is below the fold, and the extra pictures are lazy and out of layout until chosen: nothing more
  is fetched on load.
- **Captures:** `poker-home`, `poker-live` and `poker-settle` are reused from the carousel. None is new. The lockup's
  art is not restored.

**5. Facts check** (against `docs/PROJECT_CONTEXT.md` §4.1)

| Line (source) | Check |
|---|---|
| "Start a cash game or tournament straight from the home screen—no account needed." (`pokerSteps[0]`) | Guest mode runs a game locally, offline included |
| "The live tournament dashboard on the host's phone: blind clock, blinds, and prize pool." (`pokerSteps[1]`) | What the capture shows (its alt text; `data/projects.ts`'s gallery). §4.1 doesn't list it and doesn't contradict it |
| "End-of-night settlement: who pays whom, exact to the cent." (`pokerSteps[2]`) | Integer cents on the device, fixed-point on the server. No claim of fewest transfers. `work.test.ts` ties "exact to the cent" to the data |
| "Start a game", "Run the tournament", "Settle up"; "Walk through {name}" | The steps' labels and `dict.poker.walk` |

- No copy change is needed.
- **For Tay:** whether the legend is visible (the same words).

**6. Tests**
- **Come back, adapted to the panel** (`chapters.spec.ts` at the tag):
  - `:7` ×4: three equal parts in one row at the four phone sizes, and no label spills out. As it was, with new
    selectors.
  - `:20`: a radio group, where each step brings its screen to the front, is described, and moves with the arrow keys.
    "Front" is read from the carousel's front slide instead of a z-index.
  - `:40`: with JS off, choosing a step still brings its screen to the front.
- **Retired for good:** "T Poker on desktop", `:70` ×2. It tested the chapter's two-column Tab order, and that layout is
  gone. The web app, the private label and the store listings were already ported to the panel and its case study in
  S20 (`:49`).
- **On `main`, unchanged:** the T Poker cases in `work.test.ts`.
- **New:**
  - the steps and the carousel stay in step both ways: the dots, the arrows, a swipe, a click on a side capture; slides 4
    and 5 check no step;
  - the Tab order: the links, the carousel, then the steps as one stop;
  - reduced motion swaps at once;
  - nothing extra is fetched on load, without JS too.
- **Changed (for approval):** `lab-work.spec.ts`'s no-JS carousel check, because T Poker's server output carries three
  pictures with one shown. Plus the slot tests (§6).

### 3.2 Aegis: one alert, start to finish

**1. What it showed, and what a recruiter learns in 10 seconds**
- On the steel plate, the real Alerts page, cropped to the port-scan row, with a ring around the row and its
  transcription beside it.
- Then "One alert, start to finish": Ingest → Normalise → Detect, then "Then, in parallel" (Threat scoring, and Alert
  stream), then Live.
  - It was drawn as a line that forks: five columns on wide screens, and on phones a rail with two side-by-side branches.
- Then the honest note on the shared PostgreSQL schema.
- *In ten seconds:* Tay built an event-driven security pipeline, and can walk one alert through it end to end, with the
  real primitives:
  - an HMAC checked in constant time;
  - RabbitMQ and MassTransit;
  - a Redis HyperLogLog port-scan detector;
  - a weighted threat score;
  - SignalR.

  And the copy is open about the pipeline's coupling.

**2. How it fits Concept A**
- **Mount:** the slot's row under both columns from 1024px, where the wide layout fits as drawn. On phones it comes
  after the carousel, as the vertical rail.
- **Opens:** in the panel, always shown. There is no control.
- **The capture:**
  - Aegis's carousel already opens on the alert-row crop.
  - The ring comes back as a mark on that slide (Q3), cyan instead of red, using `AEGIS_ROW` and both crops as the tag
    did. It ties "Live" to the screen.
  - The console's title bar and the note beside it don't come back. The note repeats the Detect step, and the row's text
    is already in the capture's alt text.
- **Dark theme:**
  - rails in hairline ink; nodes in faint ink;
  - the Detect node and its segment in cyan;
  - the branch boxes on glass-ink with the edge token;
  - names in ink, bodies in mist.
- **Motion:** none; it holds still. Reduced motion: nothing to change.
- **Phones:** the tag tested its phone layout at 390 only.
  - At 320, each branch box would be about 125px wide with 12px of padding, so the threat-scoring text (about 150
    characters) wraps to more than ten lines.
  - **Proposal:** below about 400px the branches stack: Threat scoring, then Alert stream with Live under it, still
    joined by the rail. That is new geometry, for Tay's review on screenshots.

**3. Keyboard, screen reader, no JS**
- **Keyboard:** nothing is focusable, so no Tab stop is added.
- **Structure:**
  - a figure, captioned "One alert, start to finish" (`dict.aegis.traceTitle`), around an ordered list;
  - the fork is a nested list after "Then, in parallel", so a screen reader hears both the order and the branching;
  - the rail, the nodes and the ring are decoration.
- **No JS:** all of it is server HTML and CSS, so it is identical with JS off.

**4. Cost (estimates, NC)**
- **JS:** 0. It is a server component, and the ring is a server-drawn mark.
- **CSS:** about 5 KB raw, 1.0 to 1.5 KB gzip: the trace's rules and the ring. The head and the console's frame don't
  come back.
- **HTML:** about +5 to 6 KB. It has the longest copy of the four, and the page's RSC payload carries it a second time.
- **LCP:** below the fold, with no image of its own. The risk is the extra layout before the first paint: Stack measured
  +46 ms on a phone at 4× CPU in session 13. Measure it.
- **Captures:** only the carousel's own `aegis-alerts`. None is new.

**5. Facts check** (against `docs/PROJECT_CONTEXT.md` §4.2, and the `data/projects.ts` lines `work.test.ts` ties the
copy to)

| Step | Check |
|---|---|
| Ingest: an HMAC over the body, verified in constant time | §4.2 (HMAC); `data/projects.ts:261` (constant time). §4.2 also says there is no timestamp or replay protection yet: see C2 |
| Normalise: validated, one canonical shape, over MassTransit and RabbitMQ | §4.2 |
| Detect: a Redis HyperLogLog, fixed 60-second windows, fires at 20 | `data/projects.ts:253`; `work.test.ts` pins the sentence |
| Threat scoring: "…and the rule's false-positive rate multiply into one 0–1 score" | **Imprecise.** The data: score = (severity ÷ 100) × MITRE weight × (1 − false-positive rate), clamped to 0–1 (`data/projects.ts:257`). One minus the rate is what multiplies. See C1 |
| Alert stream: SignalR, to every connected analyst dashboard | §4.2 |
| Live: "It appears in the analyst's live feed—the highlighted row above." | True with Q2 and the ring kept: the ringed capture is above the trace at every width. See C3 |
| The note: the API host composes the modules in process; each has its own DbContext; all share one PostgreSQL schema | A modular monolith, not microservices, and the shared schema is an acknowledged coupling (§4.2) |

- **No AI claim.** The trace has no AiAnalysis step and says nothing about AI. If one is ever added, it says that the
  provider is a deterministic template, and that no external LLM is called (§4.2).
- **NC, for the Aegis session:** re-read the fork (Detection publishes each alert once, and two consumers take it in
  parallel) in Aegis's public repository at its current HEAD before shipping. `data/work.ts` says "as implemented",
  checked in M10.

**Copy that needs Tay's exact words**

| # | Now | Proposed |
|---|---|---|
| **C1** (needed) | "Severity, a per-technique MITRE weight (higher for techniques that are harder to detect), and the rule's false-positive rate multiply into one 0–1 score." | "Severity, a per-technique MITRE weight (higher for techniques that are harder to detect), and one minus the rule's false-positive rate multiply into one score, clamped to 0–1." |
| **C2** (optional) | "The agent signs the request body with an HMAC; the API verifies it in constant time." | "The agent signs the request body with an HMAC; the API verifies it in constant time (no replay protection yet)." |
| **C3** (only without Q2) | "It appears in the analyst's live feed—the highlighted row above." | "It appears in the analyst's live feed—the highlighted row in the capture." |

- C1 and C2 change `data/work.ts` only. `work.test.ts` pins neither sentence: it checks their numbers and terms, which
  stay.
- **For Tay:**
  - whether the shared-schema note stays (it partly repeats the tagline);
  - whether the note's sentence "so the detector never stores the events themselves" (`aegisCopy.onScreen`) earns a
    place: the Detect step doesn't say it.

**6. Tests**
- **Come back, adapted** (`chapters.spec.ts` at the tag):
  - `:96`: the order Ingest, Normalise, Detect, "Then, in parallel", Live; both branches; RabbitMQ and the PostgreSQL
    schema; never "open source".
  - `:107`: wide screens draw the fork (at 1440).
  - `:118` ×2: the ring frames the real port-scan row, at 1440 and 390. Now it is inside the carousel's first slide.
  - `:155`: at 390, a single column with the fork as two branches, and Live under the alert stream.
- **Retired for good:** `:145`, the chapter's order (heading, console, trace). The slot-row test (§3.3) replaces it. The
  case-study check (`:170`) was ported in S20.
- **On `main`, unchanged:** `work.test.ts`, "Aegis: the trace is the implemented path".
- **New:**
  - at 320, the branches stack and Live follows the alert stream (if Tay takes the proposal);
  - the strings are imported, never typed.
- **Changed:** the slot tests (§6).

### 3.3 DeveloperOS: cite, or decline

**1. What it showed, and what a recruiter learns in 10 seconds**
- On the violet plate, the real search window, with its first three file:line chips framed.
- A five-step rail: Index → Retrieve → Evidence → Cite → Or decline. Evidence and Cite were marked in the citation
  colour, and Decline in its own.
- Then the refusal, as the app's own words in HTML text: "I don't have enough indexed material to teach that. Try
  `devos index <path>`, give a file path, or rephrase the topic. (Not guessing.)"
- *In ten seconds:* DeveloperOS answers from your own code with file-and-line citations. When the index can't support an
  answer, it says so before any model is called. That is grounded retrieval, shown with the real refusal.

**2. How it fits Concept A**
- **Mount:** the slot's row. From 1024px it spans both columns: the rail on the left, the refusal on the right (the
  tag's two-part refusal layout, from 900px). On phones it comes after the carousel: the rail, then the refusal.
- **Opens:** in the panel, always shown. There is no control.
- **The citation boxes:**
  - They are marks on the carousel's first slide, the search capture, placed from the tag's measured `CHIPS`.
  - They apply to both the full capture and the phone crop: the crop starts at the capture's top-left corner, so the
    same pixels hold.
  - The chips are already named in the capture's alt text.
  - The window bar ("DeveloperOS · Search your code") doesn't return.
- **Dark theme:**
  - the rail in hairline ink; nodes in faint ink;
  - Evidence, Cite and the boxes in cyan;
  - Decline's node in violet;
  - the refusal box on glass-ink with the edge token, its text in ink;
  - the code chip on glass-ink, in the site's mono face.
- **Motion:** none. Reduced motion: nothing to change.
- **Phones:**
  - At 320, the window slide is about 86% of the stage (about 230px), so each box is about 110 by 9px: it reads as a
    mark, not as text (NC: screenshot).
  - The refusal wraps, but `devos index <path>` stays on one line (NC).

**3. Keyboard, screen reader, no JS**
- **Keyboard:** nothing is focusable.
- **Structure:**
  - The rail is an ordered list named "From your files to an answer, as implemented" (`dict.dos.flow`). At the tag that
    name was for screen readers only; showing it as the list's small title is an option.
  - The refusal is a figure, with its caption.
  - In the code, only the placeholder's angle brackets are hidden from screen readers, so it reads "devos index path".
    This is the tag's `withCode` helper, restored.
- **No JS:** identical.

**4. Cost (estimates, NC)**
- **JS:** 0.
- **CSS:** about 2.5 KB raw, 0.5 to 0.75 KB gzip.
- **HTML:** about +3 to 4 KB.
- **LCP:** below the fold, with no image of its own.
- **Captures:** `dos-search` and its phone crop, already slide 1. None is new.

**5. Facts check** (against `docs/PROJECT_CONTEXT.md` §4.3)

| Step | Check |
|---|---|
| Index: "Each index run hashes your files and re-indexes only what changed." | Incremental indexing on file hashes |
| Retrieve: "…a local SQLite FTS5 index, ranked with BM25, before any model is called." | §4.3; `work.test.ts` ties FTS5 and BM25 to the data |
| Evidence and Cite: a file and a line range for each result; the answers list them | File-and-line citations |
| Decline: "If nothing in the index matches, DeveloperOS declines before calling a model." | §4.3. **VL in S29** against DeveloperOS's public repository at `de7346c`: both the Q&A and the Learning Center return the refusal when retrieval returns no chunks, before the provider is called (`devos/modules/qa.py:119–124`, `devos/modules/learning.py:96–100`) |
| The refusal, word for word | **VL in S29:** `devos/modules/learning.py:30–33` at `de7346c` |
| The caption: "…(`devos learn` prints the same in a terminal):" | **NC:** check the CLI at the session's start. If it doesn't, the caption comes to Tay |

- Nothing implies a hosted service, or a real LLM by default. §4.3 says the default provider is an offline mock.
- No copy change is needed.
- **For Tay:** whether the rail's name is visible (the same words).

**6. Tests**
- **Come back, adapted** (`chapters.spec.ts` at the tag):
  - `:181`: the five steps in order, and "declines before calling a model".
  - `:187`: the refusal is real text, word for word, and shown once. Only the angle brackets are hidden, there is no
    image, and the code reads `devos index <path>`.
  - `:200` ×2: each box sits on its chip, at 1440 and 390, with the phone crop below 640. Now the boxes are inside the
    carousel's first slide.
- **Retired for good:**
  - `:213`, the chapter's reading order. The slot-row test below replaces it.
  - "Released · v1.0.0 links the release page": only the chapter had that link.
- **On `main`, unchanged:** `work.test.ts`, "DeveloperOS: evidence, then cite or decline".
- **New:**
  - **The slot-row test.** The explainer sits under the panel's first row: under both columns from 1024px, and after the
    carousel on phones. The first row is unchanged, so `chrome.spec.ts:170` passes as it is.
  - the strings come from `data/work.ts` and `lib/dict.ts`, never typed (a unit test in `lab-work.test.ts`'s style);
  - axe at 1440 and 390, with motion on and off.
- **Changed:** the slot tests (§6).

### 3.4 GRAVITY FLOW: the marked frame

**1. What it showed, and what a recruiter learns in 10 seconds**
- On the deep-teal plate, the real level-55 gameplay frame, large, with three marks on it:
  - "Your gravity well" (the held well, in the game's attractor violet);
  - "The star" (what the well pulls);
  - "Home" (the goal).
- A boss level stood behind it. Then three facts.
- *In ten seconds:* the game's whole mechanic, in one picture: one touch places a gravity well, and the well pulls the
  star home.

**2. How it fits Concept A**
- **Mount:** the marks go on the carousel's first slide (`gf-gameplay`), drawn on the server. The slot holds only their
  legend, under the capture's column.
- **The catch:** the tag's labels stood beside each point, and they ran past the phone's edge. Its frame didn't clip;
  the carousel's does.
  - The carousel's frame is also narrower: 250px at desktop, and on phones `min(190px, 48vw, 44svh × 0.46)`, about 154
    to 190px.
  - "Your gravity well" is about 115px wide at 13px. Set right of the well (58% across), it ends past the frame even at
    250px.
- **Proposal: numbered rings on the frame, and a legend in the slot.** The rings are 1 the well, 2 the star, 3 home. The
  legend reads "1 Your gravity well · 2 The star · 3 Home".
  - It reads at every width, it never covers the game, and it is real text.
  - Alternative: labels on the frame where they fit (desktop), and the legend on phones. That is two layouts to keep.
- **The legend dims when the marked capture isn't in front.** CSS reads the carousel's own `data-offset` on slide 1
  through `:has()`, so there is no JavaScript and no change to the carousel.
- **The facts don't come back** (Q6).
  - Option: the chapter's lede, "Press and hold to place a gravity well, and pull a lost star home." (`flagships[3].lede`),
    as the legend's lead-in. It says what the marks show.
- **Dark theme:**
  - rings in ink, with a dark halo (the tag's 90% white);
  - the numbers on small ink chips;
  - the legend in mist, with the numbers in cyan.
- **Motion:** none of its own. The rings move with the slide when the reader moves the carousel. Reduced motion:
  unchanged.
- **Phones:** the rings are 24px, the tag's phone size. At 320, the home ring (78% across, 19% down) and the well ring
  (58%, 47%) stay apart (NC: screenshot).

**3. Keyboard, screen reader, no JS**
- **Keyboard:** nothing is focusable.
- **Screen readers:**
  - The rings are hidden from them: the capture's alt text already names the well, the star and the goal.
  - The legend is a short list, named with the existing sentence "Marked on the frame: your gravity well, the star and
    home." (`dict.gf.marked`).
- **No JS:** slide 1 is the only slide mounted, so the rings and the legend show.

**4. Cost (estimates, NC)**
- **JS:** 0.
- **CSS:** about 1.7 KB raw, 0.35 to 0.5 KB gzip.
- **HTML:** about +1 to 1.5 KB.
- **LCP:** below the fold.
- **Captures:** `gf-gameplay`, already slide 1. None is new.

**5. Facts check** (against `docs/PROJECT_CONTEXT.md` §4.4)
- The marks agree with the tagline ("…built around a gravity well you place yourself").
- The lede, if used: `work.test.ts` holds "hold to place a gravity well", and no physics claim.
- There is no test count, no precision claim, no store claim and no global leaderboard.
- No copy change is needed: the numbers are presentational.
- **For Tay:** the numbered rings and the legend; and whether the lede is used.
- **A dependency on #18.** The marks are read off this exact frame (640×1280, level 55), and #18 swaps one GRAVITY FLOW
  capture for an image Tay provides.
  - If the swap replaces `gf-gameplay`, the marks must be read off the new frame, or the explainer rethought.

**6. Tests**
- **Come back, adapted:** the marked-frame part of `chapters.spec.ts:245` (at the tag):
  - the capture's alt text names the gravity well;
  - the marks are "Your gravity well", "The star" and "Home";
  - there is no test count and no physics claim.

  Its release-candidate part already lives in the ported `:245`.
- **Retired for good:** `:257` (the chapter's layout) and `:273` (the teal plate in both themes): the site is dark only,
  with no plates.
- **On `main`, unchanged:** `work.test.ts`, "GRAVITY FLOW: gameplay first, no physics claims". It reads the panel
  already.
- **New:**
  - each ring sits on its point of the capture at 320, 390 and 1440, measured from the tag's `MARKS` (the same method as
    DeveloperOS's boxes);
  - the legend dims when slide 1 leaves the front, and shows without JS.
- **Changed:** the slot tests (§6).

---

## 4. A radio group in a modal, and the S25 focus trap

- **Why it matters.**
  - In a modal, `useFocusTrap` takes every Tab itself and walks its stops: every visible link, button and input. Three
    radios would be three stops.
  - The WAI-ARIA radio group is one stop (the chosen radio), with the arrow keys inside it.
  - The arrows would still work, because the trap takes only Tab and Escape. But Tab would also land on the unchosen
    radios.
- **This plan avoids it.** The stepper stays on the page (Q1), where the browser's own Tab handles the group, and no
  explainer goes into the dialog.
- **If one ever does go into a modal:**
  - In the trap's list of stops, a named radio group counts as one stop: its chosen radio, or its first if none is
    chosen. That is what browsers do.
  - The trap leaves the arrow keys alone, as it does now.
  - `focus-trap.spec.ts` gains a case with a radio group in a modal, in all three engines.
  - That is a change to the shared trap and a test change, both for approval at the time. It is not part of P4 as
    planned.

## 5. Cost summary (estimates, NC: each session measures the real numbers)

| | First-load JS | CSS, raw / gzip | HTML | Captures | Above the fold? |
|---|---|---|---|---|---|
| T Poker (option A) | +0.2–0.5 KiB | ~3 KB / 0.6–0.9 KB | +5.5–6 KB | 3 reused | No; the extra pictures aren't fetched on load |
| Aegis | 0 | ~5 KB / 1.0–1.5 KB | +5–6 KB | 1 reused | No |
| DeveloperOS | 0 | ~2.5 KB / 0.5–0.75 KB | +3–4 KB | 1 reused | No |
| GRAVITY FLOW | 0 | ~1.7 KB / 0.35–0.5 KB | +1–1.5 KB | 1 reused | No |
| **All four** | **≤ +0.5 KiB** (187.06 → about 187.5; budget 205.7) | **~12 KB / 2.5–3.5 KB** (on 72.7 KB / 15.1 KB today) | **+15–18 KB** (127.7 → about 145 KB; budget 568 KB) | **0 new** | |

- **How these were estimated:** the tag's stylesheets, less the rules that don't come back; the copy's length, plus its
  markup, twice (the HTML and the RSC payload). The layer's sheet compresses at about 0.18 to 0.25.
- **LCP:** none of the four is in the first screen. Work starts under the hero, which fills it, and every capture on the
  page is lazy (`lab-work.test.ts` holds that). The LCP element stays the hero's h1.
  - What they can cost is indirect:
    - more render-blocking CSS (about +20% gzip across the two sheets);
    - more layout before the first paint. Stack measured +14 ms on desktop and +46 ms on a phone at 4× CPU in session
      13.
  - Each session measures Lighthouse mobile (median of 5) and phone LCP at 4× CPU, interleaved against `main` on the same
    machine. Tay keeps or drops the cost, as for Stack, Think · Build · Ship and Contact.
  - `content-visibility` was measured on the composed page in S21+S22 and not kept (#13), so it is not the fallback.

## 6. Tests, all together

**The slot tests change, once per session (for approval).**
- `tests/unit/lab-work.test.ts:247`, "one labelled, empty, hidden slot per panel". It becomes: one slot per panel, in its
  new row; it holds that panel's explainer once P4 has built it, and stays empty and hidden until then.
- `tests/e2e/lab-work.spec.ts:430–431`, "all four slots empty, hidden, not rendered". It changes the same way.
- `docs/CINEMATIC_SYSTEM.md`, "The P4 slot", is updated with each session.

**The restore record's tests:**

| Test at the tag | What happens |
|---|---|
| `chapters.spec.ts` T Poker `:7` ×4, `:20`, `:40` | Back, adapted (§3.1) |
| `chapters.spec.ts` "T Poker on desktop" `:70` ×2 | Retired: that layout is gone; a new Tab-order test |
| `chapters.spec.ts` Aegis `:96`, `:107`, `:118` ×2, `:155` | Back, adapted (§3.2) |
| `chapters.spec.ts` Aegis `:145` | Retired: the slot-row test replaces it |
| `chapters.spec.ts` DeveloperOS `:181`, `:187`, `:200` ×2 | Back, adapted (§3.3) |
| `chapters.spec.ts` DeveloperOS `:213`, release-page link | Retired |
| `chapters.spec.ts` GRAVITY FLOW `:245` (marked-frame part) | Back, adapted (§3.4) |
| `chapters.spec.ts` GRAVITY FLOW `:257`, `:273` | Retired: no chapter layout, no plates |
| `work.test.ts`, all four explainers' cases | Never left: unchanged on `main` |

- **Where the restored tests live:** `tests/e2e/lab-work.spec.ts`, beside the panels they now test.
  `chapters.spec.ts` keeps its Navigation and Case-study blocks.
- **Unchanged and still holding:**
  - "the carousel and Stack's filter are the only client code under the hero" (`lab-work.test.ts:251`). Three of the
    explainers are server code, and T Poker's change is inside the carousel itself.
  - "every capture on `/` is lazy".
  - the Tab walk (`chrome.spec.ts:268`): new stops must be ringed and clear of the header and the chat launcher;
  - `chrome.spec.ts:170`, the Case study in the first screen.
- **New tests run on Chromium only,** as the suite does today. #22 brings the per-browser projects, and they would
  cover these too.

## 7. Recommended order: one explainer per session

1. **DeveloperOS (S30).**
   - It is unblocked: no copy needs approval, and its two source claims were checked against the app's repository in
     S29.
   - It costs zero JS and uses one capture.
   - It builds what the other three reuse: the slot's row and its tests, a mark on a carousel slide, the colour mapping,
     and the measuring routine.
   - It sends a strong signal to a recruiter: answers grounded in the code, and a real refusal.
2. **Aegis (S31).**
   - It reuses all of that. It adds the longest copy and the trace's two layouts, plus the 320 proposal.
   - C1 (and C2, if wanted) can be approved at S30's review, so S31 starts unblocked.
   - It is the strongest backend story.
3. **T Poker (S32).**
   - It is the only explainer that touches client code and an approved component (the carousel), and the only one that
     carries Tay's no-JS bar for interaction.
   - Doing it once the slot pattern is settled keeps that risk in one focused PR.
4. **GRAVITY FLOW (S33).**
   - It is the smallest, but its marks are read off `gf-gameplay`, and #18 swaps one of GRAVITY FLOW's captures. It
     waits for #18, or for Tay's word on which capture the swap replaces.

Tay's standing order puts #18 and #22 before P4. #18 waits on Tay's image, and P4's first three sessions don't depend on
it. Whether S30 starts before #22 is Tay's call: nothing in P4 depends on #22.

## 8. The first session (S30): DeveloperOS, its scope

**Branch:** `feat/p4-developeros`, cut from an up-to-date `main`, then `npm ci`.

1. **Re-verify.**
   - DeveloperOS's HEAD against `de7346c`, and the decline paths.
   - Whether `devos learn` prints the same refusal (the caption's claim).
2. **The slot's row (Q2).**
   - `Work.tsx` moves the slot to the panel's last child, with the CSS for the new row.
   - T Poker, Aegis and GRAVITY FLOW keep their empty, hidden slots.
3. **The explainer.**
   - A server component in `components/sections/`: the rail from `dosFlow`, and the refusal from `dosRefusal` and
     `dosRefusalCaption`.
   - The tag's `withCode`, restored.
   - Its styles in `work.css`, with every value a `--cine-*` token.
4. **The citation boxes.**
   - On DeveloperOS's first carousel slide, from the tag's `CHIPS`, for both crops.
   - The device frame gets its positioning context.
5. **Tests.**
   - The two slot tests changed, one commit each, naming Tay's approval of this plan.
   - `:181`, `:187` and `:200` ×2 restored into `lab-work.spec.ts`.
   - The new tests in §3.3.
6. **Measure against `main`, interleaved, on the same machine.**
   - First-load JS (expected unchanged), the HTML, and `/`'s stylesheets (names, bytes, SHA-256).
   - Lighthouse mobile (median of 5), and phone LCP at 4× CPU.
   - CLS while scrolling through.
   - axe at 1440 and 390, with motion on and off.
   - The Tab walk: no new stop.
   - Screenshots at 320, 390, 1024 and 1440 for Tay.
7. **Validate and hand over.**
   - The full suite: typecheck, lint, unit, build, and Playwright cold and warm.
   - Docs, push, and a PR for Tay's review. No merge.

**Done when:** the explainer is in the DeveloperOS panel, every number above is measured and reported, and Tay has
reviewed it on the Preview.

## 9. What I need from Tay

- [ ] **Q1:** in the panel, not the dialog.
- [ ] **Q2:** the slot becomes the panel's new row (under both columns from 1024px; after the capture on phones).
- [ ] **Q3:** the marks go on the carousel's own slide; no capture is shown twice; none is new.
- [ ] **Q5:** the colour mapping (gold, red, blue and pink become cyan and violet), with no new value.
- [ ] **Q6:** what doesn't come back.
- [ ] **T Poker:**
  - option A (with its change to the carousel's no-JS output), or C;
  - the legend, visible or not.
- [ ] **Aegis:**
  - keep the ring;
  - **C1**, exact words; **C2**, optional;
  - the stacked branches below about 400px;
  - keep the schema note; and `onScreen`'s sentence, or not.
- [ ] **DeveloperOS:** the rail's name, visible or not.
- [ ] **GRAVITY FLOW:**
  - numbered rings and a legend;
  - the lede, or not;
  - it waits for #18 (or which capture #18 replaces).
- [ ] **The order** (§7) and **S30's scope** (§8).
- [ ] **The test changes:** the two slot tests, once per session; and, per explainer, the restored, retired, changed and
  new tests in §3 and §6.

## 10. Out of P4, and the risks

**Out of P4:**
- **A live "try it" sandbox.** For example, running DeveloperOS on the page. It would need a backend, or sample data the
  site would be inventing.
  - The slot's code comment says "try it". Per R6, P4 is the four explainers.
- **No new captures, no generated images, no new claims.** The case-study dialog is unchanged.
- **D2 is not reopened:** no WebGL, and no new canvas. The stepper's movement is the carousel's CSS perspective.

**The risks:**
- The panels get taller, so there is more scrolling before Two more and About.
- Layout before the first paint (measured each session).
- A Tailwind leak from new class names, comments or test strings: check `/`'s stylesheets each session.
- The engines:
  - Firefox's one-frame reduced-motion transitions, and WebKit's Tab rules, can trip new tests (#22's patterns);
  - read once the page settles, never in the same tick.
