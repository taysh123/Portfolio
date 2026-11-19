# Portfolio Redesign — Roadmap

> Phased plan for evolving the live portfolio (https://www.tayshofer.dev/) toward the target in
> `docs/CREATIVE_DIRECTION.md`, without breaking production. This is a **roadmap**, not an
> implementation plan: each phase gets its own task-level plan (superpowers `writing-plans`) only
> after its gate decision is approved. Nothing here authorises implementation, installs, or deploys.

**Goal:** Ship a more distinctive portfolio that still loads fast, stays accessible, and tells only
true project facts, through a prototype-first sequence with an owner approval gate per phase.

**Approach:** Measure the production baseline first. Settle the art direction on paper, prove the
riskiest piece (the hero) in isolation against hard budgets, then build sections, motion, and case
studies on a branch cut from production `main`. Release through a Vercel Preview and Tay's sign-off.

**Owner / approver:** Tay (every gate). **Last updated:** 2026-11-19 (session 16: the Concept A release plan,
"Concept A: P4–P6" below).

## Global constraints (apply to every phase)

- Work starts from up-to-date production `main` (GitHub `taysh123/Portfolio`, deployed commit
  `3f0c5e5` as of 2026-11-02). Never from `reference/premium-redesign-package`, which is a stale
  September design branch (see `docs/WORKLOG.md`).
- Production guard tests on `main` stay green unless Tay explicitly approves changing a specific one:
  first-load JS ≤ 205.7 KiB gzip and HTML ≤ 568 KB (`tests/e2e/budget.spec.ts:7`); no WebGL, `three`,
  or `lenis` (`tests/unit/dead-code.test.ts`, `tests/e2e/budget.spec.ts:47`, `tests/e2e/page.spec.ts`);
  contrast floors (`tests/unit/tokens.test.ts`); institution guard (`tests/support/institution.ts`).
- Core Web Vitals targets: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1. Lab is a proxy, not field evidence.
- Content stays truthful: no invented metrics, statuses, screenshots, or capabilities. Featured
  projects are T Poker, Aegis, DeveloperOS, GRAVITY FLOW. No institution named.
- Everything works without WebGL, with `prefers-reduced-motion`, by keyboard, and at phone width.
  Content and the CV link never wait for a scene.
- Security headers and CSP in `proxy.ts`, the privacy page, and `GROQ_API_KEY` staying server-side
  are preserved.
- No deploy, push, merge, or install without Tay's explicit ask.
- **Direction (D1, 2026-11-18):** evolve Product Plates; calm/premium, restrained cyan/violet accents;
  the reference README's do-NOT-take list applies (no RGB wash, no holographic cube, no fabricated stats).
  **D1 was reopened by Tay the same day for Concept A,** and in session 16 he approved replacing the live `/` with it
  ("Concept A: P4–P6" below). These rules hold on `main` until that release merges.
- **No 3D now (D2):** the 3D-guard tests and the JS budget are not modified by any phase below unless
  Tay later approves a separate M2 prototype. **The one exception (Tay, session 16, R12):** for the release,
  `tests/e2e/page.spec.ts:43` allows exactly one canvas, the hero's 2D `aria-hidden` field. The WebGL guards and the
  budget stay unchanged.

## Review focus (what is most likely to go wrong)

1. **A 3D hero quietly busting the JS budget or the no-WebGL guards.** Any 3D work has to be lazy,
   isolated, and either passing the existing tests or covered by an approved, deliberate change to them.
2. **Mobile and low-end GPUs.** A scene that runs well on a dev machine can drop frames or drain
   battery on a mid-range phone. The fallback has to be designed, not just a blank space.
3. **Reduced motion and keyboard users.** Scroll choreography must not trap scroll or hide content.
4. **Fact drift.** Copy changes made in the redesign must stay consistent with `data/projects.ts`,
   the assistant prompt in `app/api/chat/route.ts`, metadata, and the privacy page.
5. **Repeating October.** A cinematic entrance shipped in PR #1 and was pulled the same day in PR #2.
   The cause should be understood before building another (see M0 open item).

---

## Phases

Status key: `DONE` · `READY TO MERGE` · `IN PROGRESS` · `BLOCKED (decision)` · `DEFERRED` · `NOT STARTED`

### M0 — Audit, research, canonical docs · `DONE` (PR #4 merged 2026-11-18)

Scope: read-only audit, tool/skill/MCP inventory, roadmap, worklog, decision log.

Acceptance criteria:
- [x] Repo, git, package, routes, tokens, motion, security, budgets audited, with citations (`docs/WORKLOG.md`).
- [x] Project facts checked against PROJECT_CONTEXT §4; discrepancies listed.
- [x] Tool inventory taken; duplicates flagged; install plan written one item at a time
      (`docs/RESEARCH_AND_DECISIONS.md`).
- [x] Tay answered D1–D7 and D9 (2026-11-18); D8 and N1–N4 remain open, none blocking.
- [x] Docs moved onto `docs/m0-audit`, cut from current `main` (D3).
- [ ] Why the October entrance was pulled: moved to N4. Only needed before a future M2.

Risks: none left open.

### M0.5 — Production hygiene (independent of the redesign) · `DONE` (PR #5 merged and deployed 2026-11-18, `841d062`)

Small, separately reviewable fixes on `main` that are worth doing whatever the redesign becomes.
Each needs Tay's go-ahead; none changes the design.

Acceptance criteria:
- [x] T Poker billing sentence (`data/projects.ts:150`) reworded so it no longer presents the
      payment provider as "a swappable detail", consistent with `app/api/chat/route.ts:128`.
- [x] GRAVITY FLOW `data/projects.ts:396`: "the seven mechanics" → "the other six mechanics", matching
      its list. Verified against the game repo: 7 mechanics = the attractor + 6 `LevelConfig` mechanics, so the
      "7" stat and PROJECT_CONTEXT §4.4 stay correct.
- [x] N5: GRAVITY FLOW repo stays private (Tay). `data/projects.ts:359` is marked private like T Poker
      (`36f6001`), and the served résumé PDF no longer links it (`e105917`; 80,593 bytes, label "two pages, 79 KB").
- [x] `data/projects.ts:172` (guest → account upgrade): checked against the T Poker repo in session 4 and
      corrected on `fix/m0-followups` (`37ba41c`): the invite *reopens* after sign-in (no automatic join), and
      guest progress is claimed *on that device*, never over the account's own data. Merges with that branch.
- [x] N6 (`tests/unit/site.test.ts:78`, Windows-only): fixed on `fix/m0-followups` (`b4d5c73`); unit 119/119 on Windows.
- [ ] Optional: a regression test pinning each corrected sentence (pattern in `tests/unit/work.test.ts`).
      Not added; Tay asked for minimal diffs.
- [x] Final tree `e105917`: typecheck exit 0, lint exit 0, `npm run build` exit 0, **Playwright 132/132**,
      unit 118/119. The one failure is pre-existing and Windows-only (N6). Details in `docs/WORKLOG.md` sessions 2–3.
- [x] Merged (PR #5) and deployed (`841d062`, Vercel status success 2026-11-18). Live check: no
      link to the private GRAVITY FLOW repository in the page, no "swappable detail", label "two pages, 79 KB",
      and the served résumé is byte-identical to `main`'s 80,593-byte file with no dead link.

Risks: low. Content-only diffs; the existing tests already guard neighbouring claims.

### M1 — Art direction, design system, storyboard · `IN PROGRESS` (core A–E live 2026-11-18: A/C/D #8, B #11, E #12; F deferred to Tay's call after previewing A–E live; **F retired by Tay in session 16, R14**: the Concept A release supersedes it)

Scope per D1: **evolve** Product Plates (calm/premium, restrained cyan/violet accents). This is not a
replacement. The reference README's take / do-NOT-take applies (quoted in `docs/RESEARCH_AND_DECISIONS.md` §1).
The plan is **`docs/M1_VISUAL_PLAN.md`**: six independently approvable moves, A–F, all CSS and tokens, with
zero new JS.

Acceptance criteria:
- [ ] One approved mood statement for the evolution, with any reference images it relies on committed
      (the `reference-01..04` images are not in the repo; the reference README's text is on `main` as
      `docs/references/premium-redesign-README.md`, N1).
      *Drafted:* plan §1–§2 (a described moodboard; no images needed).
- [ ] Token proposal (colour, type, spacing, motion) expressed as a diff against `app/globals.css`,
      with contrast ratios computed against the existing floors in `tests/unit/tokens.test.ts`.
      *Drafted:* plan §5 (diff) and §6 (ratios computed with the test's own formula; all floors pass).
- [ ] Page layouts for desktop and phone; hero storyboard (frame-by-frame); motion spec stating
      what reduced motion replaces each movement with. *Drafted:* plan §8–§10.
- [ ] Tay signs off on the visual plan in writing (CREATIVE_DIRECTION §9: "No major implementation
      begins until…").

Risks: picking a direction that the site's own constraints can't support (budgets, no-WebGL guards).
The guards and D2 have to be decided alongside D1.

### M2 — Hero proof of concept + fallback + measurements · `DEFERRED` (D2: no 3D now)

Only if Tay later approves a separate, measured prototype. Built in isolation (separate route or
branch, never on the live page) and measured before anything reaches production. Until then, the hero
evolves within M1/M3 under the existing no-WebGL guards and JS budget.

Acceptance criteria:
- [ ] PoC on its own branch from `main`; the live `/` route is unchanged.
- [ ] Measured on representative hardware (mid-range Android over throttled 4G, plus desktop):
      LCP, INP, CLS, JS bytes (first load and lazy), GPU frame time. Numbers are recorded in `docs/WORKLOG.md`.
- [ ] Designed non-WebGL fallback; WebGL-unavailable and context-loss paths are exercised in a test.
- [ ] Reduced-motion path verified; content and CV reachable before the scene loads.
- [ ] Go/no-go note: does the PoC earn its cost against the review focus above?

Risks: performance and battery cost on phones; duplicating October's entrance. The prior art
is `feature/premium-portfolio-redesign-1mqmgf` (entrance v2/v3, frozen 2026-10-07) and the local
`design/render/` pipeline. Read them before starting; build nothing from them without Tay's approval.

### M3 — Main sections and responsive layout · `NOT STARTED`

Acceptance criteria:
- [ ] Sections rebuilt or restyled per M1 on a branch from `main`; section order and content
      hierarchy changes approved by Tay.
- [ ] No horizontal overflow at the viewports in `tests/e2e/page.spec.ts`; axe passes in both themes.
- [ ] Budget test still green (or an approved budget change, with the measurement that justifies it).

Risks: scope creep into a rewrite of working systems.

### M4 — Motion system and scroll choreography · `NOT STARTED`

Acceptance criteria:
- [ ] One animation system per property (no Framer Motion and GSAP fighting over the same element).
- [ ] Animation library stays off the first-load path, as `tests/e2e/budget.spec.ts:38` already requires.
- [ ] Reduced motion (OS setting and the site's own toggle) replaces large motion with state changes.
- [ ] Off-screen and hidden-tab animations pause.

Risks: the Lenis and scroll-hijack class of bugs. Lenis is currently banned by `dead-code.test.ts`.

### M5 — Project case studies and genuine assets · `NOT STARTED`

Acceptance criteria:
- [ ] Each flagship case study covers the CREATIVE_DIRECTION §5.3 checklist, sourced from real captures.
- [ ] Decision on dedicated case-study routes (shareable, indexable, per-project metadata) vs the
      current on-demand panel. If routes are added, `app/sitemap.ts` and metadata are updated
      (today the sitemap lists `/` only).
- [ ] Assistant prompt and `data/projects.ts` stay in sync (one source of truth where possible).

Risks: fact drift; replacing real captures with generated imagery.

### M6 — Performance, accessibility, security, SEO, visual QA · `NOT STARTED`

Acceptance criteria:
- [ ] Full suite on a production build: typecheck, lint, unit, Playwright (all viewports, both themes,
      axe), Lighthouse mobile (5 runs, median), privacy and secret scans. These mirror the M10 release checks.
- [ ] CSP and security headers unchanged or stricter; no new third-party origins without review.
- [ ] Screenshots at the standard viewports reviewed by Tay.

### M7 — Release candidate and controlled production release · `NOT STARTED`

Acceptance criteria:
- [ ] PR to `main` with the verification log; protected Vercel Preview reviewed by Tay.
- [ ] Tay explicitly approves the merge and release. A rollback path is known: Vercel instant
      rollback to the previous production deployment.
- [ ] Post-release check of the live site: headers, the main route, the chat path, `/privacy`, `/he` redirect.

M3–M7 were written for evolving Product Plates. For Concept A, the work they describe is done by P3 on the prototype,
then by P5 and P6 below (S23 is M6's validation, and S24 is M7's release and checks).

---

## Concept A: P4–P6 (plan approved by Tay, 2026-11-19, session 16)

P1–P3 (the hero and the six sections) are done and approved on `proto/hero-a-cinematic` (`docs/WORKLOG.md`, sessions
10–15). The plan's gap audit and test list are in `docs/WORKLOG.md` (session 16). Tay's decisions, R1–R15, are in
`docs/RESEARCH_AND_DECISIONS.md` ("Resolved in session 16"). Goal: the new site replaces the live `/` as soon as
possible, because Tay is job hunting; the demos (P4) come after the release.

### P5 (integration) and P6 (release) · `NOT STARTED` (approved; S17 is next)

The work happens on `release/concept-a`, cut from an up-to-date `origin/main` (R1). Nothing on `main` changes until
Tay merges. Each test change goes in its own commit naming Tay's approval (R12); the WebGL guards stay unchanged.

| Session | One focused thing | Done when |
|---|---|---|
| **S17** | **The release branch and the baseline.** Cut `release/concept-a` from `origin/main`. Copy the prototype's source over unchanged in one commit: every non-doc path in `git diff --name-only main...proto/hero-a-cinematic`, after checking that none changed on `main` since the branch point. Measure production's baseline: Lighthouse mobile (median of 5), first-load JS and HTML bytes. Measure the chat launcher over LinkedIn mid-scroll on phones (#16) | The full suite passes with `/` byte-identical; the baseline is in the WORKLOG |
| **S18+S19** | **Compose `/`, with the case studies and Two more.** One page: the header (R2), the hero, Work, About, Stack, Think · Build · Ship, Contact and the live Footer. One `main` and one h1 (Work's title an h2, the products h3s); the live anchor ids (R7); dark `<html>` (R3); the layer imported by `/`. `/lab` and the retired live components deleted (the `data/` modules unit tests read stay). "Case study" buttons in the panels (R4) and the Two more block (R5); the dialogs checked with axe on the dark page. The approved guard edits (R12), and the "still to name" ones confirmed with Tay first. JS and HTML budgets measured | `/` is the new page; `budget.spec.ts` and the tests the plan lists as unchanged pass |
| **S20** | **The tests.** Retire the old page's feature specs (the approved set). Port `lab-hero-a.*` and `lab-work.*` to `/`, deleting the two prototype-only tests (`/`'s CSS pinned to `main`'s digest; Contact "as on the live `/`", which becomes fixed expected values). Add the new guards (R12) | The full suite passes |
| **S21+S22** | **Privacy and SEO surfaces, then the backlog on the composed page.** The `theme` cookie out and `/privacy` updated with N7's sentence: **Tay approves the exact wording before the commit** (R13). The dark social card and the headline in `siteMeta` (R8); the manifest and `themeColor`; the sitemap's date; the 404. Then #15 and the Work lede (R10), the launcher fix (#16), #13 measured (R11), #14 re-checked | Each change measured against S17's baseline; the suite passes |
| **S23** | **The release candidate.** Full validation on a production build: typecheck, lint, unit, e2e in Chromium **plus Playwright WebKit and Firefox runs**, axe, Lighthouse mobile (median of 5) against the baseline, headers, privacy and secret scans. Screenshots at the standard viewports. On Tay's go: push and open the PR, which builds a Preview. **Tay reviews it on his own phone.** **The GRAVITY FLOW capture swap:** ask Tay for the image then | Tay approves the Preview |
| **S24** | **The release.** **Before the merge: tag `443a1f9` as `product-plates-final` and push the tag** (R15). Tay merges. The production checks below. Close out the docs on `main`, `docs/CINEMATIC_SYSTEM.md` included; the prototype branch stays frozen | The production checks pass |

**Rollback:** Vercel's Instant Rollback to `443a1f9`'s deployment (no rebuild), then a `git revert -m 1 <merge>` PR.
After an instant rollback, Vercel stops promoting new production deployments automatically until the rollback is undone
(NC: confirm in Vercel's docs at the time).

**The production checks (S24, read-only):**
- The Production deployment is the merge's SHA.
- `/` answers 200 with `index, follow`, the canonical, the title, OG, JSON-LD and the new h1.
- Every security header is present, and `X-Powered-By` is absent.
- `/privacy` 200, `/nope` 404, `/he` 308, `/lab/work` 404. Robots, the sitemap and the social card are served.
- The résumé is 80,593 bytes.
- `POST /api/chat` with an empty body answers 400, and Tay asks one real question.
- Cloudflare's HTML matches Vercel's.
- A Playwright check at 390 and 1440: no console errors, one 2D canvas, no WebGL.
- Lighthouse mobile (median of 5) against S17's baseline.
- Tay's manual steps: LinkedIn's Post Inspector to refresh the share card, and a reindex request if he uses Search
  Console.

### P4 (the project demos) · `NOT STARTED` (after the release)

Each panel keeps its empty, hidden demo slot (`data-demo-slot`; `docs/CINEMATIC_SYSTEM.md`, "Work slice"). A demo mounts
there.

**P4 restore record (R6, Tay's condition).** The release removes the live chapters, and with them four explainers.
- **All four are intact at `443a1f9`** (`main` = production, 2026-11-19), which is tagged **`product-plates-final`**
  before the release merges (R15). S24 confirms that the release merge's first parent still has them, and adds both
  SHAs here.
- **Restore one:** `git checkout product-plates-final -- <its paths>`, or read it with
  `git show product-plates-final:<path>`.
- **Shared by all four:** `components/work/Work.tsx` (last changed in `fddc36e`), `components/work/work.css`
  (`a4d0e99`), `lib/content.ts` (`fddc36e`, which hands each chapter its data), the plate tones and studio light in
  `app/globals.css` (the `[data-plate]` rules, `b5941cf`), and the captures in `public/work/` through `data/images.ts`
  (`fddc36e`).

| Explainer | Component and styles (last changed in) | Data, strings, captures (last changed in) | The tests that held it |
|---|---|---|---|
| **T Poker stepper:** three steps as a radio group, each bringing its real screen to the front; works without JS | `components/work/PokerChapter.tsx` (`fddc36e`), `components/work/poker.css` (`b5941cf`) | `pokerSteps` in `data/work.ts` (`fddc36e`); `dict.poker` in `lib/dict.ts` (`e105917`); the captures `poker-home`, `poker-live`, `poker-settle` | `tests/e2e/chapters.spec.ts`, "T Poker" and "T Poker on desktop"; the T Poker cases in `tests/unit/work.test.ts` (`fddc36e`) |
| **Aegis trace:** ingest → normalise → detect, the parallel fork, then live; the highlighted port-scan row on the alerts capture | `components/work/AegisChapter.tsx` (`fddc36e`), `components/work/aegis.css` (`b5941cf`) | `aegisTrace`, `aegisCopy` in `data/work.ts`; `AEGIS_ROW`, `AEGIS_CROPS` and the captures `aegis-alerts`, `aegis-alerts-phone` in `data/images.ts`; `dict.aegis` | `chapters.spec.ts`, "Aegis"; `work.test.ts`, "Aegis: the trace is the implemented path" |
| **DeveloperOS cite-or-decline:** index → retrieve → evidence → cite, or decline; the refusal as real text; citation boxes on the capture's file:line chips | `components/work/DeveloperOSChapter.tsx` (`fddc36e`), `components/work/dos.css` (`b5941cf`) | `dosFlow`, `dosRefusal`, `dosRefusalCaption` in `data/work.ts`; the captures `dos-search`, `dos-search-phone`; `dict.dos` | `chapters.spec.ts`, "DeveloperOS"; `work.test.ts`, "DeveloperOS: evidence, then cite or decline" |
| **GRAVITY FLOW marked frame:** the mechanic marked on the real gameplay frame, then the facts | `components/work/GravityChapter.tsx` (`fddc36e`; the marks are its `MARKS`), `components/work/gravity.css` (`b5941cf`) | `gfFacts` in `data/work.ts`; the captures `gf-gameplay`, `gf-boss`; `dict.gf` | `chapters.spec.ts`, "GRAVITY FLOW"; `work.test.ts`, "GRAVITY FLOW: gameplay first, no physics claims" |

---

## Prioritised backlog (not yet scheduled)

| # | Item | Why | Phase |
|---|------|-----|-------|
| 1 | ~~Resolve D1/D2~~ Done 2026-11-18 (evolve Product Plates; no 3D now) | — | M0 |
| 2 | ~~Merge PR #4~~ Merged 2026-11-18 | — | M0 |
| 3 | ~~Merge PR #5~~ Merged and live 2026-11-18 | — | M0.5 |
| 4 | ~~N5: GRAVITY FLOW repo link~~ Fixed in PR #5 (repo stays private) | — | M0.5 |
| 5 | ~~Confirm `data/projects.ts:172`~~ Checked and corrected on `fix/m0-followups` (session 4) | — | M0.5 |
| 6 | ~~Old content in public history~~ D5: leave as-is | — | — |
| 7 | Establish a measured baseline (Lighthouse mobile on the production build; field data if any exists) | `next.config.ts` notes a lab mobile LCP of 2.9 s, above the 2.5 s target | M2 prep |
| 8 | Prune stale remote branches (with Tay) | Merged ones deleted in session 4 (D8). Six unmerged ones remain, each needing its own yes | any |
| 9 | Consider adding `/privacy` to `app/sitemap.ts` | Currently `/` only. Minor; Tay's call | M5/M6 |
| 10 | Consider a nonce-based CSP (`script-src` currently allows `'unsafe-inline'`) | The route is already dynamic (cookies), so nonces are feasible. Needs measurement | M6 |
| 11 | N7: ~~Cloudflare's beacon and Email Address Obfuscation~~ turned off by Tay 2026-11-18 (verified live). Left: `/privacy` names only Vercel, though Cloudflare proxies the site | Privacy wording. Tay approves or rejects the draft (`docs/RESEARCH_AND_DECISIONS.md` N7) | any |
| 12 | ~~N8: GRAVITY FLOW's private repository name in nine doc lines~~ Done in session 9 on the N8 PR: the lines say "the private GRAVITY FLOW repository", and the guard pins both private repos by digest | — | any |
| 13 | Concept A: let the off-screen Stack, Think · Build · Ship and Contact skip their layout (`content-visibility: auto`), together with anchoring the violet glow so it no longer sits at a share of the page's height | Stack costs LCP +14 ms desktop and +46 ms on a phone at 4× CPU (session 13). Think · Build · Ship adds +2 / +42 ms (session 14; a first round +8 / +72), most of it its layout: `content-visibility` on it measured 852 ms against 932 as served (phone, through one interception). **Tay keeps both costs for now and added Think · Build · Ship to this fix** (session 13 and 14 closes). Contact adds +0 to +8 ms desktop and +4 to +18 ms phone (session 15, three rounds of 10 interleaved); **Tay keeps that cost too and added Contact to this fix** (session 15 close). `content-visibility` alone moves the glow when Stack renders (slice CLS 0.353 at 320px, measured), so the two go together. Details: `docs/WORKLOG.md`, sessions 13, 14 and 15. **Session 16 (R11):** composing `/` anchors the glow to its section anyway; then `content-visibility` is measured on the composed page, and kept only if phone LCP improves, scroll-through CLS stays 0 and nav jumps still land exactly. Otherwise the release ships without it, unless phone LCP is worse than production's baseline | P5: S21+S22 |
| 14 | Concept A: Stack's filter hold, with sections below it. **Done in session 14:** Tay keeps the hold as it is; its test's comment reworded (`a8062e6`). **Left for P5: re-check the visible gap case** | The hold (`app/lab/work/StackFilter.tsx`) is 0 at 1440×900 and 390×844 whenever the buttons are in view (session 14, with Think · Build · Ship below). It engages on tall screens with the buttons near the top (128–729px; up to 448px of space at 1440×1800) and after a press with the buttons out of view above (keyboard only; 579–1,215px of space), and that space now sits between the filtered list and the next section, until All is pressed. Without it the view would jump that far. **Session 15, with Contact below:** whenever the buttons are in view the hold is 0 at 1440×900, 390×844, 1920×1200 and 2560×1440, and 346px at 1440×1800 (0–81px of space; it was 729px). The page's-end case is unchanged (1,096px at 1440 wide, 1,619px at 390): there the hold always equals the full list's height, so no section below changes it. The view moved 0px in every case. `StackFilter.tsx`'s header comment fixed (`bbd9d55`, comment only). **Tay keeps the hold as it is** (session 15 close). Re-check the 1440×1800-class and the keyboard-only end cases once the page is composed. Details: `docs/WORKLOG.md`, sessions 14 and 15. **Session 16:** keep the hold; re-measure on the composed page, where the footer now follows Contact | P5: S21+S22 |
| 15 | Concept A: Contact repeats About's availability wording ("on-site, hybrid, or remote") and its three links (the résumé, GitHub, LinkedIn). **Re-check whether About keeps its links once the full page is assembled** | Logged by Tay (session 15). Contact uses the live Contact's lead and links word for word and target for target; About's line and links were approved in session 12, before Contact existed. Details: `docs/WORKLOG.md`, session 15. **Decided in session 16 (R10):** About drops its three links and its availability line and ends on the facts. Composed, the hero has the résumé and the availability pill, Contact has all four links, and the footer repeats them. Work also drops its lede, which repeats the hero's | P5: S21+S22 |
| 16 | Concept A: the chat launcher passes over LinkedIn mid-scroll on phones (Tay, session 16). Not measured yet | Measure in S17 (320–430, the label full and tucked). Fix in S21+S22: `scroll-padding-bottom` of the launcher's height plus a gap, so a link focused by keyboard is never under it (WCAG 2.4.11), and the Tab test's "unobscured" check extended to the launcher. #15 removes About's links, the case Tay reported. Don't move or hide the launcher | P5: S17, S21+S22 |
