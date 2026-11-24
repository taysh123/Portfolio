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

**Owner / approver:** Tay (every gate). **Last updated:** 2026-11-24 (S33: Tay's copy pass, PR #31 for his review, its Part B applied on his yes. S32: P4's third explainer, T Poker, PR #30 merged as `5427e45` after Tay's phone review. S31: P4's second
explainer, Aegis, PR #29 merged as `d0e5e45` after Tay's phone review. S30: P4's first explainer, DeveloperOS, PR #28 merged as `7505b91` after Tay's phone review. S29: the P4 plan, `docs/P4_PLAN.md`, PR #27 merged as `57b9743`, approved by Tay with his decisions. S28:
#24, PR #26 merged as `c29c0b1`. S27: #21, PR #25 merged as `5080de5`. S26: #19, Next 16.4.6, PR #24 merged as
`ce818a0`. S25: #20, PR #23 merged as `7ebff9c`. S24: Concept A is live, PR #21 merged as `3a98d22`. Next: P4 (GRAVITY FLOW,
after #18), then #22).

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
- **Concept A is not M2.** It is the active direction under the reopened D1 (Tay, 2026-11-18): a measured cinematic
  prototype on `proto/hero-a-cinematic`, never merged, with no WebGL. D2 is still not reopened.

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

### M7 — Release candidate and controlled production release · `DONE for Concept A` (S23, S24: PR #21, merged 2026-11-20 as `3a98d22`)

For Concept A, S23 and S24 met these criteria (below): the PR with its verification log, the Preview reviewed on Tay's
phone, Tay's merge with a known rollback, and the post-release checks.

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

### P5 (integration) and P6 (release) · `IN PROGRESS` (S17 done, 2026-11-19; S18+S19 done and approved by Tay, 2026-11-20; S20 done, 2026-11-20; S21+S22 done and approved by Tay, 2026-11-20; S23 done and approved by Tay, 2026-11-20; **S24 done, 2026-11-20: PR #21 merged as `3a98d22`, Concept A live, the
production checks pass**) · **`DONE`**

The work happens on `release/concept-a`, cut from an up-to-date `origin/main` (R1). Nothing on `main` changes until
Tay merges. Each test change goes in its own commit naming Tay's approval (R12); the WebGL guards stay unchanged.

| Session | One focused thing | Done when |
|---|---|---|
| **S17** | **The release branch and the baseline.** Cut `release/concept-a` from `origin/main`. Copy the prototype's source over unchanged in one commit: every non-doc path in `git diff --name-only main...proto/hero-a-cinematic`, after checking that none changed on `main` since the branch point. Measure production's baseline: Lighthouse mobile (median of 5), first-load JS and HTML bytes. Measure the chat launcher over LinkedIn mid-scroll on phones (#16) | The full suite passes with `/` byte-identical; the baseline is in the WORKLOG |
| **S18+S19** | **Compose `/`, with the case studies and Two more.** One page: the header (R2), the hero, Work, About, Stack, Think · Build · Ship, Contact and the live Footer. One `main` and one h1 (Work's title an h2, the products h3s); the live anchor ids (R7); dark `<html>` (R3); the layer imported by `/`. `/lab` and the retired live components deleted (the `data/` modules unit tests read stay). "Case study" buttons in the panels (R4) and the Two more block (R5); the dialogs checked with axe on the dark page. The approved guard edits (R12), the "still to name" ones included (approved as a group in S17), each in its own commit. JS and HTML budgets measured | `/` is the new page; `budget.spec.ts` and the tests the plan lists as unchanged pass. **Done, approved by Tay (2026-11-20):** `482d29e`…`7a85e92` (`docs/WORKLOG.md`, "Sessions 18+19") |
| **S20** | **The tests.** Retire the old page's feature specs (the approved set). Port `lab-hero-a.*` and `lab-work.*` to `/`, deleting the two prototype-only tests (`/`'s CSS pinned to `main`'s digest; Contact "as on the live `/`", which becomes fixed expected values). Add the new guards (R12) | The full suite passes. **Done (2026-11-20):** unit 218/218, Playwright 183/183, the two `@ts-nocheck` lines gone (`docs/WORKLOG.md`, "Session 20") |
| **S21+S22** | **Privacy and SEO surfaces, then the backlog on the composed page.** The `theme` cookie out and `/privacy` updated with N7's sentence: **Tay approves the exact wording before the commit** (R13). The dark social card and the headline in `siteMeta` (R8); the manifest and `themeColor`; the sitemap's date; the 404. Then the launcher fix (#16), #13 measured (R11), #14 re-checked, and the case-study dialog's two axe findings (#17). (#15 and the Work lede, R10, were done in S18+S19.) | Each change measured against S17's baseline; the suite passes. **Done, approved by Tay (2026-11-20):** `b97f92e`…`e58508b`; unit 225/225, Playwright 187/187 right after deleting `.next` and warm; #13 measured and not kept (`docs/WORKLOG.md`, "Sessions 21+22") |
| **S23** | **The release candidate.** Full validation on a production build: typecheck, lint, unit, e2e in Chromium **plus Playwright WebKit and Firefox runs**, axe, Lighthouse mobile (median of 5) against the baseline, headers, privacy and secret scans. Screenshots at the standard viewports. On Tay's go: push and open the PR, which builds a Preview. **Tay reviews it on his own phone.** (The GRAVITY FLOW capture swap is no longer part of S23: Tay, S21+S22 close; it is #18, after the release.) | Tay approves the Preview. **Done, approved by Tay (2026-11-20)** after his phone review. Chromium 187/187, Firefox 178/187, WebKit 169/187 (through the S23 proxy): every failure was traced and rerun alone ×3, and none is a release bug. The pre-existing F1 and F2 went to the backlog (#21, #20), and the engine-specific tests to #22. **Draft PR #21** is open (`docs/WORKLOG.md`, "Session 23" and its close-out) |
| **S24** | **The release.** The `product-plates-final` tag on `443a1f9` is already pushed (R15, done in S17); check it still points there. Tay merges. The production checks below. Close out the docs on `main`, `docs/CINEMATIC_SYSTEM.md` included; the prototype branch stays frozen | The production checks pass. **Done (2026-11-20):** Tay merged PR #21 with a merge commit, `3a98d22` (first parent `443a1f9`, second the PR head `5ea8d57`, the same tree); Vercel's Production deployment is `3a98d22`; every production check passes, Lighthouse mobile median 100 and LCP 1,064 ms against S17's 98 and 2,288 ms (`docs/WORKLOG.md`, "Session 24") |

**Rollback:** Vercel's Instant Rollback to `443a1f9`'s deployment (no rebuild), then a `git revert -m 1 <merge>` PR. The
merge is `3a98d22` (S24), so the revert is `git revert -m 1 3a98d22`.
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

**After the release, in this order (Tay, S24):**
1. **#20:** F2's fix in the shared focus trap, a small PR on `main`. **Done in S25** (PR #23, merged as `7ebff9c`).
2. **#19:** Next 16.3.8 → 16.4.6 for the `npm audit` advisories, a separate PR on `main` with the full suite and
   Lighthouse. **Done in S26** (PR #24, merged as `ce818a0`).
3. **#21:** F1, Firefox's bottom scroll padding. **Done in S27** (PR #25, merged as `5080de5`).
4. **#18:** the GRAVITY FLOW capture swap, a small PR whenever Tay provides the image.
5. **P4**, the project demos, **before #22** (Tay, 2026-11-21, approving `docs/P4_PLAN.md`; this changes S24's order,
   "#18, #22, then P4"). One explainer per session: DeveloperOS (**S30, PR #28, merged as `7505b91`**), Aegis (**S31,
   PR #29, merged as `d0e5e45`**), T Poker (**S32, PR #30, merged as `5427e45`**), then GRAVITY FLOW after #18.
6. **#22:** per-browser handling of the engine-specific tests.

**Between P4's sessions (Tay, 2026-11-21 to 2026-11-24): S33, his copy pass.** Eight strings in his exact words (PR
#31, for his review); four more checked against the projects' sources and applied on his yes; three line wraps fixed
(`docs/WORKLOG.md`, "Session 33").

**Low priority (Tay, S25):** **#23**, Safari's focus return after a modal opened by a mouse click. **And (Tay, S31):**
**#25**, VoiceOver on Safari and the site's styled lists.

**Later, a small separate PR (Tay, S27):** **#24**, dev-dependency audit hygiene. **Done in S28** (PR #26, merged as
`c29c0b1`). The 15 lint and unit-test advisories left in the whole tree stay as they are (Tay, S28's close).

### P4 (the project demos) · `IN PROGRESS` (plan approved by Tay on 2026-11-21; DeveloperOS, Aegis and T Poker live)

Each panel's demo slot (`data-demo-slot`) is now its own row, the panel's last child: under both columns from 1024px,
after the capture on phones (`docs/CINEMATIC_SYSTEM.md`, "The P4 slot"). An explainer mounts there; until then the slot
stays empty and hidden.

**The plan (S29): `docs/P4_PLAN.md`, approved by Tay on 2026-11-21** (PR #27, merged as `57b9743`), with his decisions at
its top. The four explainers return in their panels, one per session, in his order:

| Session | Explainer | State |
|---|---|---|
| S30 | **DeveloperOS**, cite or decline | **Done:** PR #28, merged by Tay as `7505b91` (Production) after his phone review; he kept `10dd203` (`docs/WORKLOG.md`, "Session 30") |
| S31 | **Aegis**, one alert start to finish | **Done:** PR #29, merged by Tay as `d0e5e45` (Production) after his phone review. C1 and C2 in his exact words; the ring on the carousel's first slide; the branches stack below 400px (his call in the review, so 390–393px phones stack too); `f8be0aa` kept (`docs/WORKLOG.md`, "Session 31") |
| S32 | **T Poker**, the stepper (option A) | **Done:** PR #30, merged by Tay as `5427e45` (Production) after his phone review. The steps drive the carousel both ways; its no-JS change approved at S32's start; without JS the two step captures are fetched on load (browsers ignore `loading="lazy"` then), a cost Tay accepted; first-load JS +183 B (`docs/WORKLOG.md`, "Session 32") |
| after #18 | **GRAVITY FLOW**, the marked frame | Numbered rings and a legend; waits for #18 |

P4 goes before #22 (Tay, 2026-11-21).

**P4 restore record (R6, Tay's condition).** The release removes the live chapters, and with them four explainers.
- **All four are intact at `443a1f9`** (`main` = production, 2026-11-19), which is tagged **`product-plates-final`**
  (R15: an annotated tag, `8f0a96a`, pushed in S17).
- **Confirmed in S24:** the release merge is **`3a98d22`**, and its first parent is **`443a1f9`** (=
  `product-plates-final`). Every file named below exists at `3a98d22^1`. At `3a98d22` the chapter components and their
  stylesheets are deleted, and `lib/content.ts`, `data/work.ts`, `data/images.ts` and `lib/dict.ts` remain.
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
| 11 | N7: ~~Cloudflare's beacon and Email Address Obfuscation~~ turned off by Tay 2026-11-18 (verified live). Left: `/privacy` names only Vercel, though Cloudflare proxies the site | Privacy wording. **Deferred to the end of the build** (Tay, session 9 close); **scheduled in session 16 (R13)** for the release's `/privacy` edit, with its exact wording shown to Tay before the commit. The draft is in `docs/RESEARCH_AND_DECISIONS.md` N7. **Done in S21+S22** (`2424e23`, on `release/concept-a`): Tay's approved wording, without the draft's "on the site's behalf" (Cloudflare's policy calls itself a controller of that data). The shipped text: `docs/RESEARCH_AND_DECISIONS.md`, N7. It reaches production with the release | P5: S21+S22 (done) |
| 12 | ~~N8: GRAVITY FLOW's private repository name in nine doc lines~~ Done in session 9, merged in PR #16 (live `a7a89fd`): the lines say "the private GRAVITY FLOW repository", and the guard pins both private repos by digest | — | any |
| 13 | Concept A: let the off-screen Stack, Think · Build · Ship and Contact skip their layout (`content-visibility: auto`), together with anchoring the violet glow so it no longer sits at a share of the page's height | Stack costs LCP +14 ms desktop and +46 ms on a phone at 4× CPU (session 13). Think · Build · Ship adds +2 / +42 ms (session 14; a first round +8 / +72), most of it its layout: `content-visibility` on it measured 852 ms against 932 as served (phone, through one interception). **Tay keeps both costs for now and added Think · Build · Ship to this fix** (session 13 and 14 closes). Contact adds +0 to +8 ms desktop and +4 to +18 ms phone (session 15, three rounds of 10 interleaved); **Tay keeps that cost too and added Contact to this fix** (session 15 close). `content-visibility` alone moves the glow when Stack renders (slice CLS 0.353 at 320px, measured), so the two go together. Details: `docs/WORKLOG.md`, sessions 13, 14 and 15. **Session 16 (R11):** composing `/` anchors the glow to its section anyway; then `content-visibility` is measured on the composed page, and kept only if phone LCP improves, scroll-through CLS stays 0 and nav jumps still land exactly. Otherwise the release ships without it, unless phone LCP is worse than production's baseline. **Measured in S21+S22 and not kept (R11):** phone LCP at most 20 ms better at 4× CPU (inside the noise; Lighthouse equal, 1,063 ms), a new layout shift from the violet glow (still at a share of `.wk`'s height; up to 0.10 at 320px), and jumps to `#approach` and `#contact` off by up to 311px. The release ships without it (`docs/WORKLOG.md`, "Sessions 21+22" §4) | P5: S21+S22 (measured, not kept) |
| 14 | Concept A: Stack's filter hold, with sections below it. **Done in session 14:** Tay keeps the hold as it is; its test's comment reworded (`a8062e6`). **Left for P5: re-check the visible gap case** | The hold (`app/lab/work/StackFilter.tsx`) is 0 at 1440×900 and 390×844 whenever the buttons are in view (session 14, with Think · Build · Ship below). It engages on tall screens with the buttons near the top (128–729px; up to 448px of space at 1440×1800) and after a press with the buttons out of view above (keyboard only; 579–1,215px of space), and that space now sits between the filtered list and the next section, until All is pressed. Without it the view would jump that far. **Session 15, with Contact below:** whenever the buttons are in view the hold is 0 at 1440×900, 390×844, 1920×1200 and 2560×1440, and 346px at 1440×1800 (0–81px of space; it was 729px). The page's-end case is unchanged (1,096px at 1440 wide, 1,619px at 390): there the hold always equals the full list's height, so no section below changes it. The view moved 0px in every case. `StackFilter.tsx`'s header comment fixed (`bbd9d55`, comment only). **Tay keeps the hold as it is** (session 15 close). Re-check the 1440×1800-class and the keyboard-only end cases once the page is composed. Details: `docs/WORKLOG.md`, sessions 14 and 15. **Session 16:** keep the hold; re-measure on the composed page, where the footer now follows Contact. **Re-checked in S21+S22** on the composed page: a press never moves the view; the hold is 0 except 239px with the buttons near the top at 1440×1800 (no visible gap), and the keyboard-only end case is unchanged (1,096px at 1440 and wider, 1,619px at 390). Kept as it is (`docs/WORKLOG.md`, "Sessions 21+22" §5) | P5: S21+S22 (re-checked) |
| 15 | Concept A: Contact repeats About's availability wording ("on-site, hybrid, or remote") and its three links (the résumé, GitHub, LinkedIn). **Re-check whether About keeps its links once the full page is assembled** | Logged by Tay (session 15). Contact uses the live Contact's lead and links word for word and target for target; About's line and links were approved in session 12, before Contact existed. Details: `docs/WORKLOG.md`, session 15. **Decided in session 16 (R10):** About drops its three links and its availability line and ends on the facts. Composed, the hero has the résumé and the availability pill, Contact has all four links, and the footer repeats them. Work also drops its lede, which repeats the hero's **Done in S18+S19** (Tay's brief brought it forward): About ends on the facts, and Work has no lede and no reveal of its own | P5: S18+S19 (done) |
| 16 | Concept A: the chat launcher passes over LinkedIn mid-scroll on phones (Tay, session 16). **Measured in S17** (`docs/WORKLOG.md`, S17 §8): the LinkedIn it covers is About's on `/lab/work` (23–54% of it full, 11–26% tucked); no focused target is ever wholly hidden, several partly (up to 82%, "More on Aegis" at 430); on the live `/`, the hero index's last tile sits partly under the full label on load at 320–375 | Measure in S17 (320–430, the label full and tucked): done. Fix in S21+S22: `scroll-padding-bottom` of the launcher's height plus a gap, so a link focused by keyboard is never under it (WCAG 2.4.11), and the Tab test's "unobscured" check extended to the launcher. #15 removes About's links, the case Tay reported. Don't move or hide the launcher. **Done in S21+S22** (`f3bd556`, `50d3bec`): the page's bottom scroll padding (5rem; 4.5rem on phones and short screens) and the Tab test's launcher check; a Tab walk at 9 sizes, motion reduced and on, finds no stop under the launcher | P5: S17, S21+S22 (done) |
| 17 | Concept A: fix the case-study dialog's two axe best-practice findings, even though production has them too (Tay, S18+S19 review): `aria-allowed-role` (the panel is an `<aside role="dialog">`: `components/ui/CaseStudyPanel.tsx`) on all six case studies, and `image-redundant-alt` (a gallery image whose alt repeats its caption) on three: T Poker, DeveloperOS and GRAVITY FLOW, at 1440 and 390 | Found by S18+S19's axe check with each overlay open (`docs/WORKLOG.md`, "Sessions 18+19" §5). The same script on `main`'s build gives the same two, so they are pre-existing. Both are axe best-practice rules, not WCAG A/AA. Fix them in the dialog, then check every case study with axe at 1440 and 390 on the dark page. **Done in S21+S22** (`addbd2f`, `e46b693`): the dialog is a div, and a gallery image is silent beside its caption, which said the same words; axe 18 findings → 0, held by `tests/e2e/case-study-axe.spec.ts` | P5: S21+S22 (done) |
| 18 | After the release: **the GRAVITY FLOW capture swap.** One of its captures changes for an image Tay provides (session 11: "Tay will swap one himself") | Moved out of S23 by Tay at the S21+S22 close-out (2026-11-20). A small PR of its own, whenever Tay provides the image; it follows the release and does not hold it | After the release |
| 19 | After S24: **Next 16.3.8 → 16.4.6**, in a separate PR on `main` (Tay, S23). Bump `next` and the matching `eslint-config-next`, `npm ci`, read `node_modules/next/dist/docs` for changes (AGENTS.md), then the full suite (unit, typecheck, lint, build, Playwright) and Lighthouse mobile (median of 5) against the release's numbers; re-measure the JS and HTML budgets (the chunks will change). Update CLAUDE.md's "Next 16.3.8" lines | Found in S23 (VL, `npm audit --omit=dev`, 2026-11-20): advisories against `next` `16.0.0`–`16.4.4`, fixed in 16.4.6. Critical: GHSA-2464-fhr4-w9xw (code execution in the image optimiser when SVG files are used) and GHSA-673q-mjm6-r5xr (code execution in `use cache` functions); high: GHSA-p3m5-59mp-jv5r (Server Actions denial of service); seven moderate. It is in production already (the lockfile is identical on `main` and the release), not added by the release. **Exposure, as read in S23:** no `use cache`, no server actions, no `dangerouslyAllowSVG`, no SVG under `public/`, no remote image patterns; the optimiser serves local images only. The share card is `next/og`'s `ImageResponse`, prerendered static, from the site's own modules (no fetch, params, `<img>`, or user-supplied or remote SVG). sharp: the project's `0.34.5` (dev, the image script) and Next's own `0.35.5`. **Done in S26, merged as `ce818a0`** (`19b9e16`, PR #24): `next` and `eslint-config-next` 16.4.6, exact; the lockfile moves only Next's own packages. The nine `next` advisories are gone (two critical, one high, six moderate in today's database); `npm audit --omit=dev` keeps two pre-existing build-time ones, `source-map-js` and `baseline-browser-mapping`, outside the brief. Next's sharp stays `0.35.5`. No code change; unit 225/225, Playwright 193/193 cold and warm. First-load JS 185.34 → 186.70 KiB (Next's runtime and its vendored React; the app's modules match), HTML 127,732 → 127,422 B, headers identical, the card byte-identical, Lighthouse 100, LCP 1,061 ms. Detail: `docs/WORKLOG.md`, "Session 26 (#19)" | After S24 (`main`): S26 (done; PR #24 merged as `ce818a0`) |
| 20 | Right after S24, **before #19**: **F2, Safari: focus escapes the menu sheet and the chat for one Tab.** A small PR on `main` that fixes it in the shared focus trap (`lib/useFocusTrap.ts`), for example by having the trap move focus itself on every Tab within its list. The trap serves every overlay (the case study, accessibility, the chat, the menu sheet), so check each in all three engines; WebKit's `chat.spec.ts:76` and `chrome.spec.ts:185` should then pass (Tay, S23) | Found in S23 (VL; `docs/WORKLOG.md`, "Session 23" §5). The trap steps in only at the first and last items of its list, which includes links. The last item is a link in both sheets: the menu sheet's "Get in touch" and the chat's Privacy. Safari's default Tab skips links, so the trap never sees that last item. From the menu sheet's "Accessibility settings", focus goes to a "Case study" button on the page behind; from the chat's field, to `body`. The next Tab comes back. **Pre-existing:** `main`'s sheet also ends on a link, and the hook is unchanged by the release. Not in PR #21 (Tay). **Done in S25** (`63565e8`, the fix; `43f86dd`, the new `tests/e2e/focus-trap.spec.ts`, approved in advance in Tay's brief; PR #23): in a modal the trap moves focus itself on every Tab, Shift+Tab and Option+Tab, in document order, whatever the browser counts as a stop. It keeps a scroll area with nothing focusable inside as a stop (the chat's long transcript, as Chromium and Firefox do), and the ring (`focus({ focusVisible: true })`). S25 found that the case study leaked too, and that each leak scrolled the locked page behind. WebKit: `chat.spec.ts:76` passes; `chrome.spec.ts:185`'s Tab loop passes, and the test now stops at `:200` (#22, #23). Detail: `docs/WORKLOG.md`, "Session 25 (#20)" | After S24 (`main`), before #19: S25 (done; PR #23 merged as `7ebff9c`) |
| 21 | After #20: **F1, Firefox ignores the bottom scroll padding for controls already on screen**, so a focused control can sit partly under the chat launcher (Tay, S23) | Found in S23 (VL; `docs/WORKLOG.md`, "Session 23" §5). #16's `html { scroll-padding-bottom }` works in Chromium (0 stops under the launcher at 8 sizes). Firefox's focus scroll ignores it for a target already inside the viewport: "Case study" at 375×667 (2% covered) and the hero's GRAVITY FLOW link at 390×844 (12%), found by Firefox's `chrome.spec.ts:268` at 390. Never wholly hidden, so WCAG 2.4.11 (AA) holds; #16's "never under it" does not. In a probe, `scroll-margin-bottom` on `:focus-visible` cleared one of the two. A reliable fix is a focus handler in the launcher's client code: measure first-load JS against the budget. Production has no bottom scroll padding at all. Not in PR #21 (Tay). **Done in S27** (`da224bb`, the fix; `d29f80d`, the new `tests/e2e/launcher-focus.spec.ts`, approved in advance in Tay's brief; PR #25): after a Tab press, once the browser's own scroll has settled, `ChatLauncher.tsx` moves a control still under the launcher up to #16's padding edge (Chromium's own position), instantly under reduced motion; never for a pointer, a touch or a script focus, nor inside an overlay or while a modal is open. In Chromium and WebKit it never fires (their Tab walks are identical to `main`'s at six sizes, both motion modes). S27 also found the GRAVITY FLOW link under it at 1024×768 and "Case study" at 430×932 (motion on); all four cases clear. JS +0.36 KiB, the stylesheets and CLS unchanged. `chrome.spec.ts:268` at 390 still fails in Firefox: it reads at the instant of the press, before the correction; Tay added it to #22's Firefox list at S27's close. Detail: `docs/WORKLOG.md`, "Session 27 (#21)" | After #20 (`main`): S27 (done; PR #25 merged as `5080de5`) |
| 22 | Later: **per-browser handling of the engine-specific tests.** Today's suite runs on Chromium only (the repo's config), and S23 ran WebKit and Firefox from scratch configs. Give WebKit and Firefox proper handling: their own projects, with each engine-specific test either made engine-neutral or annotated with its reason; never a silent skip. **No test changes until then** (Tay, S23) | From S23's runs (VL; `docs/WORKLOG.md`, "Session 23" §3–4), the tests that fail for an engine reason, not a site bug: **Chromium-only touch API** (CDP): `chrome.spec.ts:140`, `lab-work.spec.ts:269` (`:260` before S32). **Firefox's reduced-motion frame** (the `0.001ms` transitions in `app/globals.css` run for one frame, so a same-tick read sees the old style): `lab-work.spec.ts:351`, `:1105` (`:566` before S30, `:667` before S31 and `:833` before S32 added tests above it). **Sub-pixel exact compares:** `lab-work.spec.ts:1229` ×2 (`:690` before S30, `:791` before S31, `:957` before S32). **Firefox, a stop read before #21's correction** (added at S27's close (Tay)): `chrome.spec.ts:268` at 390×844 reads each stop the instant after the press, and #21's fix moves the hero's GRAVITY FLOW link clear of the launcher three frames later (`launcher-focus.spec.ts`, which reads once the page settles, passes). **WebKit:** Safari's Tab skips links (`chrome.spec.ts:268` ×2, `focus-ring.spec.ts:8` ×2, `lab-hero-a.spec.ts:192`, `lab-work.spec.ts:312` (`:303` before S32)); a click doesn't focus a button (`lab-work.spec.ts:1105`, the same Stack filter test: `:566` before S30, `:667` before S31, `:833` before S32; and, added in S25 (Tay), `chrome.spec.ts:185` at `:200`: the menu opened by a click returns focus to `body` on Escape, #23); no `mouse.wheel` in mobile WebKit (`chat.spec.ts:130`); a tap sets no `:hover` (`lab-work.spec.ts:351`); LCP reported after FCP (`lab-hero-a.spec.ts:93`); DPR 2 software canvas (`lab-hero-a.spec.ts:129`); the instant-`fill` focus race (`chat.spec.ts:174`, `page.spec.ts:138`; and, added in S25 (Tay), `chat.spec.ts:158`). The WebKit harness also needs the CSP's `upgrade-insecure-requests` dropped over `http://localhost`. **S32's new T Poker tests ran on Chromium only** (NC elsewhere: not run in Firefox or WebKit). By construction, two will need the same handling: `lab-work.spec.ts:782` swipes through CDP touch (Chromium-only), and `:832` ×2 ends its Tab walk on a link, which Safari's Tab skips (Playwright's WebKit reaches the radio group itself: S32's probe) | Later |
| 23 | Low priority (Tay, S25): **Safari: after a modal opened by a mouse click closes with Escape, focus goes to `body`, not to the button that opened it.** Pre-existing, the same on `main`. Not in #20's PR | Found in S25 (VL; `docs/WORKLOG.md`, "Session 25 (#20)" §4). Safari doesn't focus a button on click, so nothing is focused when the overlay opens, and `useFocusTrap` returns focus to what was focused then: `body`. Probed in WebKit at 390 on both `main`'s build (`2cc324c`) and the fix: opened by a click, Escape leaves focus on `body`; opened from the keyboard, Escape returns it to "Open menu". Keyboard users are unaffected. `chrome.spec.ts:185` tests it at `:200` (WebKit only; #22) | Later (low priority) |
| 24 | Later, a small separate PR (Tay, S27): **dev-dependency audit hygiene.** `source-map-js` (high) and `baseline-browser-mapping` (moderate), build-time through Next and Tailwind, and the project's own dev `sharp` 0.34.5 (three high; only the image script uses it). None of it ships to visitors | Found in S26 (VL, `npm audit`, 2026-11-20). `source-map-js` 1.2.1: high GHSA-68fv-2mgg-jv7q, fixed in 1.2.2, through `next`'s `postcss` and Tailwind. `baseline-browser-mapping` 2.10.32: moderate GHSA-w5vr-8v7q-w6rv, fixed in 2.11.0, through `next` and `browserslist`. Both show in `npm audit --omit=dev` because `next` depends on them; both are build-time tools, and `npm audit fix` would move them. The project's `sharp` 0.34.5 (dev): GHSA-f88m-g3jw-g9cj (libvips, fixed in 0.35.0), GHSA-rgj7-g3m4-5g8c (libheif, 0.35.4), GHSA-wq5f-xc86-pv6w (librsvg, 0.35.5); only `scripts/m10-images.mjs` uses it, and its AVIF output is not byte-reproducible across builds, so the existing captures stay as they are (run named jobs only). Next's own sharp is 0.35.5. Detail: `docs/WORKLOG.md`, "Session 26 (#19)" §3. **Done in S28** (`abb39f1`, `60c5aa5`; PR #26): a targeted `npm update` moves only `source-map-js` (1.2.1 → 1.2.4) and `baseline-browser-mapping` (2.10.32 → 2.11.39), the newest inside their declared ranges, lockfile only; the project's dev `sharp` `^0.34.5` → `^0.35.5`, the lowest release that clears all three, which npm dedupes with Next's own 0.35.5 (only sharp's own tree moves). S28 found that `scripts/shoot.mjs` and three unit tests use `sharp` too. `npm audit --omit=dev`: 0 (was 2); the whole tree 15 (was 18), all lint and unit-test tooling (Tay leaves them as they are, S28's close). The client build output is byte-identical to `main`'s; unit 225/225, Playwright 197/197 cold and warm. The image script, run into a scratch folder: WebP byte-identical, AVIF the same dimensions and about 5% larger; no image in the repo re-encoded. Detail: `docs/WORKLOG.md`, "Session 28 (#24)". **Merged as `c29c0b1`** (PR #26, 2026-11-21; its production check passed) | Later (a small PR on `main`): S28 (done; PR #26 merged as `c29c0b1`) |
| 25 | Low priority (Tay, S31): **VoiceOver on Safari doesn't announce the site's styled lists as lists.** Site-wide; consider `role="list"` on the lists whose structure carries meaning | Found in S31's final review (NC: known WebKit behaviour, not tested on a device here). The site's base styles (Tailwind's preflight) set `list-style: none` on every list, and Safari then drops the list role: VoiceOver reads the items in order but never says "list" or how many. It covers Aegis's trace (an ordered list, with the fork as a nested one), DeveloperOS's rail and the site's other styled lists; axe doesn't flag it. `role="list"` on each such list restores the role. Check which lists carry meaning, and whether a test pins their markup | Later (low priority) |
