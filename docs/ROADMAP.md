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

**Owner / approver:** Tay (every gate). **Last updated:** 2026-11-18 (M0 audit session).

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
- **No 3D now (D2):** the 3D-guard tests and the JS budget are not modified by any phase below unless
  Tay later approves a separate M2 prototype.

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
      `Gravity-Game` link in the page, no "swappable detail", label "two pages, 79 KB", and the served résumé
      is byte-identical to `main`'s 80,593-byte file with no dead link.

Risks: low. Content-only diffs; the existing tests already guard neighbouring claims.

### M1 — Art direction, design system, storyboard · `IN PROGRESS` (A–E approved 2026-11-18, F deferred; PR 1 = A/C/D live as PR #8; next B)

Scope per D1: **evolve** Product Plates (calm/premium, restrained cyan/violet accents). This is not a
replacement. The reference README's take / do-NOT-take applies (quoted in `docs/RESEARCH_AND_DECISIONS.md` §1).
The plan is **`docs/M1_VISUAL_PLAN.md`**: six independently approvable moves, A–F, all CSS and tokens, with
zero new JS.

Acceptance criteria:
- [ ] One approved mood statement for the evolution, with any reference images it relies on committed
      (the `reference-01..04` images are not in the repo; the README lives only on the stale branch, see N1).
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
| 11 | N7: Cloudflare Web Analytics beacon injected into the live page (CSP blocks it); `/privacy` names only Vercel | Console error on every load; privacy wording. Tay's call (Cloudflare settings) | any |
