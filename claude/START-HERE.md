# START HERE — Portfolio

Orientation doc for the Portfolio Project. Read this first in any new chat here or any new
Claude Code session, then continue with the current task. Update it before each transition
(new chat / new session) so the next one starts informed.

> **Concept A is live** (2026-11-20). This copy reached `main` with the release (PR #21, merged as `3a98d22`). It
> carries the full prototype and release history. The prototype branch keeps its own session 16 copy, frozen.

## What the product is
Tay Shofer's live software-engineering portfolio at https://www.tayshofer.dev/.
Goal: get Tay interviews for junior/entry software roles. Next.js 16 / React 19 / TypeScript /
Tailwind v4, deployed on Vercel. Full stack and projects: see `docs/PROJECT_CONTEXT.md`.

## The tracks
1. **The live site, on `main`: Concept A, since 2026-11-20** (PR #21, merge `3a98d22`; S24 verified production).
   - A dark, cinematic, single page: the hero's 2D canvas field, the four product panels with their carousels, Two
     more, About, Stack, Think · Build · Ship, Contact.
   - Tay reopened **D1** for it (2026-11-18). **D2 is still not reopened, so no WebGL.**
   - The Product Plates site it replaced is tagged **`product-plates-final`** (`443a1f9`).
2. **Next, in this order (Tay, S24):** backlog #20 (F2, Safari's focus in the sheets), #19 (Next 16.4.6), #21 (F1,
   Firefox's scroll padding), #18 (the GRAVITY FLOW capture swap), #22 (per-browser tests); then **P4**, the project
   demos. `docs/ROADMAP.md` has each.
3. **The Concept A prototype, on `proto/hero-a-cinematic`: the frozen record.** Draft PR #18, never merged, never
   deleted (R1).
4. **The release track (session 16 to S24, done).** Concept A replaced the live `/` as soon as possible, because Tay is
   job hunting.
   - It shipped from `release/concept-a`, cut from `main` in S17, through PR #21, which Tay merged in S24.
   - **S18+S19 (2026-11-20): on that branch, `/` is now the Concept A page** and `/lab` is gone. **Approved by Tay**
     after his review on the Preview.
   - **S20 (2026-11-20): the tests.** The lab tests are ported to `/`, the old page's retired, R12's new guards added:
     unit 218/218, Playwright 183/183.
   - **S21+S22 (2026-11-20): the surfaces and the backlog, approved by Tay and closed out.** Unit 225/225,
     Playwright 187/187 cold and warm. Detail below and in `docs/WORKLOG.md`, "Sessions 21+22".
   - **S23 (2026-11-20): the release candidate, approved by Tay after his phone review, and closed out.** Detail
     below and in `docs/WORKLOG.md`, "Session 23" and its close-out.
   - **S24 (2026-11-20): the release.**
     - Tay merged PR #21 (https://github.com/taysh123/Portfolio/pull/21) with a merge commit, `3a98d22`.
     - Vercel's Production deployment is `3a98d22`, and every production check passes.
     - Detail: `docs/WORKLOG.md`, "Session 24".
   - The plan, S17 to S24: `docs/ROADMAP.md`, "Concept A: P4–P6". Tay's decisions, R1 to R15:
     `docs/RESEARCH_AND_DECISIONS.md`, "Resolved in session 16".

## What's live now (verified 2026-11-20 in S24: Production is `3a98d22`)
- **Concept A**, the page `release/concept-a` built in S18–S23 (detail in the next section). Measured on production
  in S24, through Cloudflare:
  - Lighthouse mobile, median of 5: Performance 100, LCP 1,064 ms (the h1), FCP 1,064 ms, TBT 33 ms, CLS 0, Speed
    Index 1,651 ms; 100/100/100.
  - First-load JS 185.36 KiB gzip over 9 scripts (budget 205.7); HTML 128,168 B.
  - The six security headers are exactly as before the merge.
  - One 2D canvas, `aria-hidden`, and zero WebGL contexts. 0 console errors at 390 and 1440.
- **Production** = GitHub `taysh123/Portfolio` **`main`**, the source of truth.
  - Deployed **`3a98d22`**: PR #21, 2026-11-20 02:53Z.
  - **Rollback**, if ever needed:
    - Vercel's Instant Rollback to `443a1f9`'s deployment.
    - Then a `git revert -m 1 3a98d22` PR.
    - `443a1f9` is tagged **`product-plates-final`**.
  - The S17 production baseline, for comparison: Performance 98, LCP 2,288 ms.
- **Cloudflare proxies the site in front of Vercel** (N7). Tay turned its two HTML changes off on 2026-11-18: Web
  Analytics is Disabled and Email Address Obfuscation is Off. In S24 the HTML through Cloudflare was byte-identical to
  Vercel's (`cf-cache-status: DYNAMIC`).
- **Flagship projects shown:** T Poker, Aegis, DeveloperOS, GRAVITY FLOW; plus Job Assistant and Orders & Delivery.
  Statuses and limitations: PROJECT_CONTEXT §4. T Poker's and GRAVITY FLOW's repositories are private ("Private
  repository" label).
- **Check your branch first.** Live work branches from an up-to-date `main`, and changes go through a PR that Tay
  merges. `reference/premium-redesign-package` is a stale September design branch: never build or deploy from it.

### Before the release (the record): Product Plates on `443a1f9`
- The site until 2026-11-20 was the calm, light **"Product Plates"** editorial design (M10), with the whole **M1 core,
  moves A–E**:
  - **A**, the iris accent: `#4a3fe0` light, `#a5a8ff` dark, `#b1b4ff` on the dark plates.
  - **C**, two heading tiers: `--text-chapter` 36→64 for the four products; `--text-h2` 30→42 for every paper section.
  - **D**, the motion tokens.
  - **B**, the studio light: a key and a cyan rim on the hero plates (they light up once) and on every phone and window.
    Also the dark "Email me" contrast fix.
  - **E**, the lower half: "Two more" as two lit paper plates; the About and Contact titles fully in ink.
  - Think · Build · Ship row words on the h3 tier (`--text-h3` 20→26), under the 42px title.

  The site had no WebGL, and tests on `main` enforced that (they still do). `tokens.test.ts` also guards the "Email me"
  fill (≥ 3:1 against `--bg-raised` and `--bg`, both themes).
- **Production until the release:**
  - Deployed **`443a1f9`**: PR #20, 2026-11-19 03:20Z.
  - The site code was PR #12's, since PRs #13–#20 change docs only.
  - PR #19's CLAUDE.md line had leaked three unused rules into `/`'s Tailwind sheet (44,530 → 44,829 bytes). **PR #20
    removed them:** the live sheet is 44,530 bytes again (read-only `curl`, session 13). This branch has the same
    change in `fb3bb41`.
  - `main` was green at the session 9 close: unit 122/122, typecheck and lint, and Playwright 132/132 on PR #12's code.
  - First-load JS on `/` is 181.79 KiB gzip (budget 205.7) and HTML 156.44 KB (budget 568), in a local build.
  - **The release baseline (S17, measured on production):** Lighthouse mobile, median of 5: performance 98, LCP
    2,288 ms, FCP 1,140 ms, TBT 35 ms, CLS 0. First-load JS 182.04 KiB gzip (9 scripts), HTML 160,584 B. Detail:
    `docs/WORKLOG.md`, S17 §7. Compare production with production, and a local build with a local build of `main`.
  - `443a1f9` is tagged **`product-plates-final`** (annotated, `8f0a96a`, pushed in S17: R15).

## The release branch: `release/concept-a` (S17 to S23; merged in S24 as `3a98d22`)
- **S18+S19 (2026-11-20): the swap, approved by Tay.** `/` is the Concept A page; detail in `docs/WORKLOG.md`,
  "Sessions 18+19" and its close-out.
  - **The page** (`app/page.tsx`): the header in its own `.cine` root; then `main`, holding the page's root (the hero,
    then one `.wk` region with Work, Two more, About, Stack, Think · Build · Ship and Contact) and the case-study host;
    then the live footer.
  - One `main`, one h1 (the hero's): Work's title is an h2, each product an h3. Every live id is kept (R7): `#hero`,
    `#work`, `#work-<id>`, `#more-work`, `#about`, `#skills`, `#approach`, `#contact`.
  - **The code:** the layer is `app/cinematic.css`, imported by `/` only. The sections are in `components/sections/`
    (moved with `git mv`, copy unchanged); their data is in `aboutBlock.ts`, `stackBlock.ts`, `tbsBlock.ts`,
    `contactBlock.ts` and `panels.ts`. Two more is new: `MoreWork.tsx`.
  - **The header (R2):** the hero's wordmark (`Logo.tsx`) and pill (`AvailabilityPill.tsx`). No theme toggle, and no
    surface at the top of the page. The pill sits in the bar from 1280px and opens the hero below that.
  - **On phones** the bar holds the wordmark and the menu. The accessibility button lives in the menu sheet, and a test
    checks it there at 320 and 390 (Tay's condition).
  - **Dark only (R3):** `<html data-theme="dark">`. `ThemeProvider` and `ThemeToggle` are deleted, and since S21+S22
    `THEME_COOKIE` too: `/privacy` names one cookie, `a11y`.
  - **Depth and the rest:** "Case study" buttons on the existing dialog (R4). Two more in the live words (R5), so six
    triggers. The hero's arrows are SVG icons (R9). About ends on the facts; Work has no lede and no reveal of its own
    (R10, in full).
  - **Deleted:** `/lab`, the Product Plates hero, chapters, About visual, Stack lens, TBS, Contact and Two more, and
    `Pic.tsx`. Also `globals.css`'s seams (they targeted the reused ids) and the toggle's glyph rules. The plate tokens
    stay, because `tokens.test.ts` reads them.
  - **Tests:** R12's edits and the S17 group, plus six Tay approved in-session (`english.spec.ts:45`, the phone toggle
    line, one phone header icon, the new phone accessibility test, at least 8 new-tab links, the Aegis captures). Each
    is its own commit.
  - Made in S21+S22, each in its own commit: `privacy.spec.ts:43`, `site.test.ts:161` (R12's `:160`) and
    `content.test.ts:20,22`.
  - **Results (at the S18+S19 close):** typecheck, lint and build exit 0. Unit 121/121, the two lab unit files failing
    at load. Must-pass e2e 70/70 + 6/6. S20 fixed the rest (below).
  - **The gate** (local production builds, Lighthouse 13.6.0 mobile, median of 5, interleaved): Performance 100, LCP
    1,061 ms (the h1). Local `main` gives 93 and 3,191 ms.
  - **Budgets:** first-load JS 185.00 KiB (budget 205.7), HTML 127,970 B (budget 568 KB).
  - **Status codes:** `/` serves `index, follow` with its canonical; `/lab/*` answers 404.
  - **axe with the overlays open:** the accessibility panel has 0 violations. The case study had two best-practice
    findings that production's code shares: `aria-allowed-role` on its `aside`, all six; `image-redundant-alt`, three.
    **Fixed in S21+S22** (ROADMAP #17): 0 findings.
  - **Preview:** `https://tay-shofer-portfolio-git-release-840354-tays-projects-d5aefd6e.vercel.app/` (the branch's
    link, behind Vercel's login).
- **S20 (2026-11-20): the tests, green.** Detail and every retired test's reason: `docs/WORKLOG.md`, "Session 20".
  - **Ported to `/`:** `tests/unit/lab-hero-a.test.ts` (26) and `lab-work.test.ts` (71, three new for Two more), and
    their two `@ts-nocheck` lines removed; `tests/e2e/lab-hero-a.spec.ts` and `lab-work.spec.ts`. They keep their
    names, because the code's comments and `docs/CINEMATIC_SYSTEM.md` point at them. Where the prototype compared
    itself with the Product Plates files the release deleted, the checks are fixed values from `product-plates-final`.
  - **Deleted as planned:** `/`'s CSS pin against `origin/main`'s digests, and "Contact matches the live Contact on
    /" (its fixed values were already in "Contact without JavaScript").
  - **Retired (R12):** `hero.spec.ts` (deleted); `chapters.spec.ts` down to Navigation, the Case study block and four
    ported checks; `lower.spec.ts` down to the résumé's bytes, the phones' overflow check and the footer. What still
    applied to `/` was ported first (18 tests).
  - **R12's new guards, in `page.spec.ts`:** `/` indexable (`index, follow`, one canonical, no noindex); `/lab`,
    `/lab/hero-a`, `/lab/work` answer 404; exactly one canvas, 2D and `aria-hidden`. The WebGL guards are unchanged.
  - **Results:** unit 218/218 (16 files), typecheck, lint and build exit 0, Playwright 183/183 (13 files) on the
    standard config. `/`'s stylesheets and JS chunks are byte-identical to before.
  - **One catch:** right after `.next` is deleted, the first full run failed `aegis.spec.ts:15` and the Case study
    block's image test: the Aegis case-study capture's first on-demand AVIF encode outlasted their polls. **Fixed in
    S21+S22** without touching a test: no case-study image goes through the optimiser now.
- **S21+S22 (2026-11-20): the surfaces and the backlog, approved by Tay.** Built after Tay's OK on Step 1; 21
  commits, `b97f92e` to `e58508b`, pushed, then the docs and the close-out. Detail: `docs/WORKLOG.md`, "Sessions 21+22"
  and its close-out.
  - **R8:** the hero's h1 and lede live in `siteMeta` (`headlineLines`, `headline`, `heroLead`); the page's words are
    unchanged. **The share card is dark:** the hero in miniature, with the h1 and the four flagships' names only, no
    states (Tay: a cached card outlives them). `lib/tokens.ts` mirrors the layer's field and inks (`cine`).
  - **R3:** the browser chrome and the manifest take the field's `#04060d`; the colour scheme is dark only.
  - **`/privacy` (R13, wording approved by Tay):** N7's Cloudflare sentence and one cookie, `a11y`. N7's draft said
    Cloudflare acts "on the site's behalf"; its policy calls it a controller of that data, so the phrase went.
  - **The sitemap's date:** 2026-11-20 (S24 moves it to the merge date). **The 404 and error pages:** already dark
    (R3); no wording changed.
  - **#16:** focus scrolls clear of the chat launcher (a bottom scroll padding of its height plus a gap); the Tab test
    also checks the launcher. **#17:** the dialog is a div, and a gallery image is silent where its caption says the
    same words.
  - **The cold cache:** Aegis's case-study capture is served as it is; DeveloperOS's and GRAVITY FLOW's come
    pre-encoded from the image script (two new DeveloperOS jobs). **The rings:** the header's four links, and the
    footer's six (found in this session; their own commit, for Tay to keep or drop), ring at once.
  - **#13 measured, not kept** (R11): at most 20 ms of phone LCP, inside the noise, against a new layout shift (the
    violet glow) and jumps that miss by up to 311px. **#14 re-checked:** the view never moves; the hold is unchanged.
  - **New tests** (new files only): `surfaces.test.ts`, `case-study-images.test.ts`, `case-study-axe.spec.ts`,
    `focus-ring.spec.ts`. Approved edits: R12's three, plus `hero.test.ts:43` and `privacy.spec.ts:49` (Tay, S21+S22).
  - **Results:** typecheck and lint exit 0; unit 225/225 (18 files); Playwright 187/187 cold (right after deleting
    `.next`) and warm. First-load JS 185.10 KiB (budget 205.7), HTML 127,732 B. Lighthouse mobile, median of 5:
    Performance 100, LCP 1,063 ms, TBT 20 ms, CLS 0, 100/100/100 (the session's start: 100, 1,065 ms).
- **S23 (2026-11-20): the release candidate, and draft PR #21. Approved by Tay** after his phone review. Detail:
  `docs/WORKLOG.md`, "Session 23" and its close-out (every failure in a per-test table, rerun alone ×3).
  - **Clean build:** typecheck and lint exit 0; unit 225/225; Playwright on Chromium 187/187, cold.
  - **Firefox 153: 178/187.** Each failure is traced: CDP is Chromium only (2); one load case passing alone 3/3 (1);
    timing (3: a headless frame rate at a threshold, and reduced motion's 1µs ease read in the same tick); a
    0.0000153px float (2); and F1 (1).
  - **WebKit 26.5: 169/187**, through a scratch proxy.
    - Over plain `http://localhost` WebKit applies the CSP's `upgrade-insecure-requests` to every file, so nothing
      loads (64/187). The proxy drops that one directive; production is HTTPS.
    - The 18 failures: Safari's Tab skips links and a click doesn't focus a button (7); APIs it lacks (3); a test-only
      focus race (2); software canvas at DPR 2 (1); LCP timing (1); tap hover (1); load (1); and F2 (2).
  - **Known issues, pre-existing, not in PR #21 (Tay):**
    - F2: in Safari, focus can leave a modal sheet for one Tab, because the trap's last item is a link Safari skips.
      ROADMAP #20: a small PR right after S24, before #19.
    - F1: in Firefox, two focus stops sit partly under the chat launcher at 375 and 390, because it ignores the bottom
      scroll padding for a target already in view. ROADMAP #21, after #20.
    - The engine-specific tests get per-browser handling later: ROADMAP #22. No test changes now.
    - No release bug was found, and no fix was made.
  - **The review of the diff:**
    - `/` is `index, follow` with one canonical, and `/lab/*` answers 404.
    - The six security headers equal production's; `proxy.ts` and `next.config.ts` are unchanged.
    - `GROQ_API_KEY` is read on the server only, and no secret is in the diff.
    - The guards pass, over the commits and the PR body too. No leftover marker. The résumé is unchanged.
  - **Lighthouse mobile, median of 5:** 100, LCP 1,058 ms (the h1), TBT 20 ms, CLS 0, 100/100/100. First-load JS
    185.10 KiB, HTML 127,732 B.
  - **Next 16.3.8's `npm audit` advisories** are already in production and not in this release: ROADMAP #19, a PR on
    `main` after S24 (Tay).
- **Cut from `origin/main` `443a1f9`** (`--no-track`), pushed in S17 with its upstream set: branch only, no PR, no
  merge.
- **The copy (R1):**
  - `8b77de1` copies the prototype unchanged from `92b08fd`: 77 of the 82 paths in
    `git diff --name-only main...proto/hero-a-cinematic`.
  - The other five (CLAUDE.md, this file, RESEARCH_AND_DECISIONS, ROADMAP, WORKLOG) had changed on `main` too, so
    `b4fd805` merges them three ways, as Tay chose. Nothing is dropped from either side.
  - Then the R12/R15 record (`2efac00`), CLAUDE.md for the release track (`0a889bf`), and the close-out.
- **Clean, at `8b77de1`:** unit 216/216, typecheck and lint exit 0, the build exit 0, Playwright 213/213.
- **`/` against `main`'s build** (`docs/WORKLOG.md`, S17 §5):
  - The stylesheets are byte-identical.
  - The markup is identical with the build ID masked, except for one extra script tag.
  - **The scripts are not byte-identical:** the same 177 modules, split into 10 files instead of 9 (+180 B raw,
    182.20 KiB gzip). That is the second-route split recorded in sessions 10–11, and it ends when the swap deletes
    `/lab`.
- **#16 measured** (report only; `docs/WORKLOG.md`, S17 §8):
  - The LinkedIn under the launcher is About's on `/lab/work`: 23–54% of it covered with the label full, 11–26% tucked.
    R10 removes those links.
  - No focused target is ever wholly hidden. Several are partly hidden, up to 82% ("More on Aegis" at 430).
  - On the live `/`, the hero index's last tile sits partly under the full label on load, at 320–375.
- **R12's "still to name" test changes are approved as a group** (Tay, S17). Each still goes in its own commit. None
  is made yet.

## The Concept A prototype (sessions 10–16)
- **Branch** `proto/hero-a-cinematic`: code at **`1369b00`** (session 15), with the docs on top.
  - Draft **PR #18**: never merge it, never deploy it.
  - Every push builds a Vercel **Preview**, behind Vercel's login. Production is untouched.
- **Routes** (noindex, not in the sitemap, never linked from `/`):
  - **`/lab/hero-a`**: the locked hero, a 2D-canvas constellation field (no WebGL). First-load JS 183.71 KiB.
  - **`/lab/work`**: the Work slice, four product panels in the cinematic language. Each has a CSS 3D coverflow of the
    project's real captures. Below them, **About** (session 12, approved), then **Stack** (session 13, approved), then
    **Think · Build · Ship** (session 14, approved), then **Contact**, which ends the page (session 15, approved).
    First-load JS 181.77 KiB, HTML 107.10 KB.
  - **P3 is complete: all six sections are approved** (the hero, the Work panels and carousels, About, Stack, Think ·
    Build · Ship, Contact).
- **The system:** `docs/CINEMATIC_SYSTEM.md` covers the `--cine-*` layer (extracted from the hero, value for value), the
  motion rules, the Work slice, the galleries and the carousel. Read it before touching `/lab`.
- **Session 11:** every flagship's real captures are now in its carousel. **Tay approved the carousels** at the close.
  - T Poker 5, Aegis 2, DeveloperOS 4, GRAVITY FLOW 5;
  - Tay left out a duplicate "final count", the DeveloperOS refusal strip and its AI-features capture.
  - The new captures are listed in `data/lab-images.ts`. **Never in `data/images.ts`:** the live About visual is client
    code that bundles that whole table into `/`.
- **Session 12: About (P3.3)** under the panels, built from the live About's own words. Tay approved every word, then
  **approved the built section** at the close.
  - The title, two sentences of the live copy, the four live facts, Tay's joined availability line, and three links at
    the live targets: the résumé, GitHub, LinkedIn.
  - No photo, no institution, no new claim. A server component; it holds still. No token added.
  - The five NEW layer values are **approved by Tay as they are** (session 12).
  - The "D2 reopened" comments in 11 code and test files now say D1 reopened, D2 not, no WebGL (`4dccdf8`).
- **Session 13: Stack (P3.4)** under About, **approved by Tay** at the close. Three passes on his reviews: one project
  line per tool (`757c377`, too busy); the live Stack's layout with a dimming filter (`d3373b6`, not clear enough); the
  filter that shows only the chosen project's tools (`8955039`, approved). It works like the live Stack, in the layer:
  - One row per group: its name, its tools on one wrapping line, and the live evidence sentence, word for word (Tay
    keeps all seven as they are, two of which name Job Assistant and Orders & Delivery).
  - Every tool is a pill: outlined under All; with a project chosen, only its tools remain (the live FILTER's rules,
    by `projectsFor` through `data-p`), filled cyan, with no empty group and no evidence. The live status line sits
    above the groups.
  - **"Filter by project":** All and the four flagships, as toggle buttons (`aria-pressed`, 44px; focus stays). No
    scroll jump when the list gets shorter. One small island (`StackFilter.tsx`, React only): +351 bytes gzip. Without
    JS the full list shows.
  - **Security:** JWT (T Poker, Aegis; moved from Services and APIs), Body HMAC (Aegis), CSRF token (DeveloperOS), and
    one sentence built from their source lines.
  - Tools no flagship uses show under All only. Everyday tools kept.
  - **Measured:** LCP +14 ms desktop, +46 ms phone at 4× CPU (more to lay out before the first paint). **Tay keeps the
    cost.** Skipping Stack's off-screen layout, with the violet glow repositioned, is logged as a P5 (integration) item
    (`docs/ROADMAP.md` #13).
  - **The filter's no-scroll-jump hold** was built when Stack ended the page. Re-checked in sessions 14 and 15 with the
    sections below it; **Tay keeps it as it is** (`docs/ROADMAP.md` #14).
- **Session 14: Think · Build · Ship (P3.5)** under Stack (`8382889`), **approved by Tay** at the close:
  - The live section's title and rows word for word (`dict.tbs.title`, `pillars`), plus one DeveloperOS line under
    Build in Tay's wording, so all four flagships appear: "DeveloperOS: it declines when the index doesn't support an
    answer—before the provider is ever reached."
  - Three ruled rows on About's and Stack's grid; each piece of evidence opens with its project's name in ink. A server
    component: no client code, no control, no reveal; no token added.
  - **Measured:** JS unchanged; HTML 97.66 → 102.79 KB; LCP +2 ms desktop and +42 ms phone (a first round +8 / +72),
    most of it the section's layout before the first paint. **Tay keeps the cost;** the section joins #13's P5 fix.
  - **#14 re-checked:** the hold is 0 at 1440×900 and 390×844 with the buttons in view. It engages on tall screens and
    after a press with the buttons out of view, and its space then sits between the filtered list and this section.
    **Tay keeps it as it is;** its test's comment is reworded (`a8062e6`, comment only). The visible gap case is a P5
    re-check (#14). `StackFilter.tsx`'s own header comment was fixed in session 15 (`bbd9d55`).
  - **Found and fixed (`d1c53a3`):** with the buttons low in the view, the browser's scroll anchoring followed the violet
    glow up (220–462px). The glows no longer anchor scrolling; the hold and its test are unchanged. **Kept by Tay.**
- **Session 15: Contact (P3.6)** under Think · Build · Ship (`56e3dea`, `1369b00`), **approved by Tay** at the close:
  - The live Contact's title, lead and four links, word for word and target for target (`lib/dict.ts`,
    `data/socials.ts`). Tay's answers: the live title (not the reference images' draft), the live mailto with its
    subject, the nav's "Contact" as the eyebrow, and the lead only while `availability.open`.
  - A server component on About's grid: no client code, no form, no reveal, no token added. Email is the one filled
    control; LinkedIn and GitHub stay together as a pair; the résumé is a quiet download under its own hairline.
  - **Its two columns start at 1100px, not 1024** (Tay's fix at the close, `1369b00`): from 1024 to 1100 Contact stacks,
    so the title keeps its two lines. Contact only; everything above it is pixel-identical to `a625c75`.
  - **Measured:** JS unchanged; HTML 102.79 → 107.10 KB; LCP +0 to +8 ms desktop, +4 to +18 ms phone (three rounds);
    axe 0 violations; every Contact link clears the chat launcher at the page's end (320, 390, 1024, 1100, 1440).
    **Tay keeps the phone cost;** Contact joins #13's P5 fix.
  - **#14 re-measured:** the hold is now 0 on tall screens up to 2560×1440 with the buttons in view (346px at
    1440×1800, was 729); the keyboard-only end case is unchanged. **Tay keeps the hold as it is.** `StackFilter.tsx`'s
    header comment fixed (`bbd9d55`, comment only).
  - **Logged for P5 (Tay):** Contact repeats About's availability wording and its three links; re-check whether About
    keeps its links once the page is assembled (`docs/ROADMAP.md` #15).
- **Session 16: the P5 (integration) and P6 (release) plan**, a plan only (no code changed), **approved by Tay**:
  - **How it ships (R1):**
    - S17 cuts `release/concept-a` from an up-to-date `origin/main`.
    - The prototype's source is copied over unchanged in one commit, with the suite passing and `/` byte-identical.
    - Then the swap. `/lab` is never shipped to `main`.
    - Tay merges. Rollback is Vercel's Instant Rollback to `443a1f9`'s deployment, then a revert PR.
  - **The page:**
    - The live header's behaviour, recoloured dark, without the theme toggle (R2).
    - Dark only, site-wide; the `theme` cookie goes (R3).
    - "More on X" becomes "Case study", the existing dialog (R4).
    - A Two more block (R5). The live anchor ids (R7). The live footer.
    - The hero's h1 and lede in `siteMeta`, and a dark social card (R8). The hero's arrow as the site's icon (R9).
  - **Retired for the release:** the live chapters' four explainers (R6). Their files and last commit are in
    `docs/ROADMAP.md`, "P4 restore record": all intact at `443a1f9`.
  - **The backlog:**
    - #15: About drops its links and availability line; Work drops its lede (R10).
    - #13 is measured on the composed page (R11). #14 is re-checked.
    - New #16: the chat launcher over LinkedIn mid-scroll on phones, measured in S17.
  - **Tests (R12):**
    - Approved as written: the canvas count (exactly one, the hero's 2D field), the animation-frame test, the dark-only
      theme tests, and the new guards (`/` indexable with its canonical; `/lab` answers 404).
    - Each change goes in its own commit naming the approval. **The WebGL guards stay unchanged.**
    - The old page's feature tests retire as a set. The string and colour changes left "still to name" were approved
      by Tay as a group in S17; each still gets its own commit.
  - **N7** goes into the `/privacy` edit, with its exact wording shown to Tay before the commit (R13).
  - **Move F is retired** (R14).
  - **`443a1f9` is tagged `product-plates-final`** before the merge, and the tag pushed (R15): done in S17
    (`8f0a96a`).
- **Preview of `/lab/work`** (the prototype branch's own link, which follows each push to it):
  `https://tay-shofer-portfolio-git-proto-he-65ec6d-tays-projects-d5aefd6e.vercel.app/lab/work`.
- **Kept identical on the prototype branch** (tests hold it; on `release/concept-a` this ended with the swap, S18+S19):
  - `/`'s stylesheets, pinned to `origin/main`'s digests;
  - every guard file;
  - `/`, `/lab/hero-a` and `/privacy`'s first-load assets (checked against the build before each round).
- **Watch for Tailwind:** it scans every folder except `docs/`, `design/`, `.claude/` and `.impeccable/`: `app/`,
  `data/`, `tests/`, `scripts/`, and the root `CLAUDE.md`, `README.md` and `claude/` too. A utility name written there,
  even in a comment or backticks, adds a rule to `/`'s stylesheet. It has happened four times (the fourth from
  CLAUDE.md, session 12); the digest test catches it. Describe a utility in words, never by its class name.

## Decided (Tay, 2026-11-18; details in `docs/RESEARCH_AND_DECISIONS.md` §1)
- **D1 Direction: reopened by Tay on 2026-11-18 for Concept A**, which replaced the live `/` on 2026-11-20 (session 16's
  R1–R15; released in S24).
  - Before that, the live site was calm / premium Product Plates (evolve, don't replace).
  - Still in force: the reference README's take / do-NOT-take (its text:
    `docs/references/premium-redesign-README.md`): no RGB wash, no holographic cube, no fabricated on-screen stats.
- **D2 3D: still not reopened. No WebGL**, on `main` or on the prototype.
  - The prototype's field is a 2D canvas; its carousels are CSS perspective on 2D elements.
  - The `three`/`lenis`/WebGL/`<canvas>` guard tests and the first-load JS budget are unchanged, and the prototype is
    held to the same 205.7 KiB.
  - Session 10's docs and the branch's code comments called this "D2 reopened". Tay corrected that at the session 11
    close; the comments were reworded in session 12 (`4dccdf8`).
- **D5** Public git history left as-is (no rewrite, repo stays public).
- **D7** Claude Code ↔ Tay in **English**; Chat Claude ↔ Tay in **Hebrew**.
- D3 docs merged (PR #4) · D4 duplicate ui-ux-pro-max removed · D6 content fixes merged (PR #5) ·
  D9 Context7 installed (user scope; needs a one-time `/mcp` sign-in); web-design-guidelines not yet;
  Impeccable skipped.
- **N5** GRAVITY FLOW repo **stays private**; the site marks it private like T Poker, and the dead link
  is removed from the served résumé PDF (PR #5, live).
- **M1** (`docs/M1_VISUAL_PLAN.md`): the core, moves **A–E**, is approved and **live** (PRs #8, #11, #12).
  - **F** (the desk plate): **retired by Tay in session 16 (R14).** It was a Product Plates move, and the Concept A
    release supersedes it.
  - **Keep Geist** (no display-face study). Use the plan's token values exactly; invent none.
- **Session 16: the release plan, R1–R15** (`docs/RESEARCH_AND_DECISIONS.md`, "Resolved in session 16"). Summary under
  "The Concept A prototype" above.
- **N1, N2** (merged in PR #14): the reference README's text is in `docs/references/`, byte for byte, with no image; the
  agent docs say "the institution" instead of its abbreviation.
- **N7, the Cloudflare toggles:** done (2026-11-18). **The `/privacy` wording: done in S21+S22**, its exact text
  approved by Tay (R13); live since the release (verified in S24).
- **N8** (merged in PR #16): GRAVITY FLOW's private repository name is out of the docs. The private-repo guard pins both
  private repos, T Poker and GRAVITY FLOW, by SHA-256 digest.
- **Session 11 (Tay's answers):** T Poker has 5 captures, not 6 (no duplicate). The DeveloperOS refusal and
  AI-features captures are left out. GRAVITY FLOW's existing two stay; Tay will swap one himself. **That swap comes
  after the release** (Tay, S21+S22 close-out): `docs/ROADMAP.md` #18, a small PR whenever he provides the image.

## What's next
- **S17 is done** (2026-11-19): the tag, the branch and the copy, the clean run, the baseline, #16, CLAUDE.md.
- **S18+S19 is done and approved by Tay (2026-11-20)**, and closed out. The plan it carried out:
  - One page: the header (R2), the hero, Work, About, Stack, Think · Build · Ship, Contact and the live Footer, with
    one `main` and one h1, the live anchor ids (R7), and dark `<html>` (R3).
  - `/lab` and the retired live components are deleted.
  - The "Case study" buttons (R4) and Two more (R5).
  - R12's approved test edits, the S17 group included, each in its own commit naming the approval.
  - Measure the JS and HTML budgets.
- **S20 is done** (2026-11-20): the lab tests ported to `/`, the old page's retired, the new guards added; the suite
  is green and pushed.
- **S21+S22 is done and approved by Tay (2026-11-20)**, and closed out: the privacy and SEO surfaces, then the
  backlog (#13 measured and not kept, #14 re-checked, #16, #17, the cold cache, the rings; the footer rings' fix kept).
- **S23 is done and approved by Tay (2026-11-20)**, and closed out.
- **S24 is done (2026-11-20): Concept A is live.**
  - Tay merged PR #21 with a merge commit, `3a98d22`.
  - Vercel's Production deployment is `3a98d22`, and every production check passes (`docs/WORKLOG.md`, "Session 24").
  - The docs close-out is its own PR, from `docs/s24-release-closeout`.
- **The release track (P5/P6) is done.** Next, in this order (Tay, S24), each a PR on `main`:
  1. **#20:** F2, Safari's focus leaving the menu sheet or the chat for one Tab; the fix goes in the shared focus trap.
  2. **#19:** Next 16.3.8 → 16.4.6 for the `npm audit` advisories, with the full suite and Lighthouse.
  3. **#21:** F1, Firefox ignoring the bottom scroll padding for controls already on screen.
  4. **#18:** the GRAVITY FLOW capture swap, whenever Tay provides the image.
  5. **#22:** per-browser handling of the engine-specific tests.
  6. Then **P4**, the project demos (`docs/ROADMAP.md`, P4, with the restore record).

## Open PRs / branches (S24, 2026-11-20)
- **PR #21** (`release/concept-a` → `main`), "Release: Concept A": **merged** by Tay on 2026-11-20 as `3a98d22`.
- **The S24 close-out PR**, from `docs/s24-release-closeout`: open, for Tay to merge.
- **Kept until Tay gives a per-branch yes** (S24; nothing deleted):
  - `release/concept-a` (tip `5ea8d57`, local and remote): **merged** into `main`, so it is safe to delete whenever
    Tay says so.
  - `proto/hero-a-cinematic` (tip `92b08fd`, local and remote; **draft PR #18**): not merged, by design. R1 keeps it
    frozen as the record ("never merge, never delete"), so deleting it would also need R1 changed.
- **Tag `product-plates-final`** (`8f0a96a`) on `443a1f9`, pushed in S17: the rollback and P4 restore point (R6, R15).
- Merged and deleted (each checked with `git merge-base --is-ancestor` first):
  - `docs/claude-md-tailwind-leak` (#20, tip `2e73766`, local and remote, in session 13);
  - `docs/session-10-closeout` (#19, tip `2101ef6`, local and remote, at the session 12 close);
  - `docs/session-9-closeout` (#17, tip `c9696d6`, local and remote, at the session 11 close);
  - `fix/n8-gravity-flow-slug` (#16), `docs/session-8-closeout` (#15), `docs/session-7-closeout` (#13);
  - `docs/backlog-n1-n2-n7` (#14), `feature/m1-lower-half` (#12), `feature/m1-studio-light` (#11),
    `docs/m1-pr1-closeout` (#10);
  - `feature/m1-iris-type-motion` (#8), `fix/docs-private-slug` (#9), `fix/m0-followups` (#7), `docs/m0-closeout` (#6).

## Waiting on Tay
- **Merge the S24 close-out PR** (docs, plus the sitemap's comment).
- **His manual steps after the release:**
  - Refresh the share card in LinkedIn's Post Inspector (https://www.linkedin.com/post-inspector/).
  - A reindex request for `https://tayshofer.dev/` if he uses Google Search Console.
- **A per-branch yes** for `release/concept-a` (merged) and `proto/hero-a-cinematic` (R1: never delete), whenever he
  wants.
- **Then #20**, in a new session.
- **The GRAVITY FLOW image** for the capture swap (ROADMAP #18), whenever he has it.
- **Optional, on `main`:** the site's chat launcher folds its label as the page scrolls. That is 0.0076 CLS on `/` at
  1440 and 390 (measured in session 11), well inside "good". Untouched.
- **A note from session 7's preview shots:** at 390px the TBS row word (20.3px, 600) is close to the row's lead line
  `.tbs__line` (19px, 600). It follows the plan exactly, and no change was made.
- **D8 remainder:** six unmerged remote branches are kept (`feature/portfolio-polish`,
  `feature/premium-portfolio-redesign-1mqmgf`, four `review/m10-*`), plus `reference/premium-redesign-package`. Delete
  only on a per-branch yes.

## Standing rules
- Live production site: no deploy/push/merge/secret/DNS change without Tay's explicit ask.
- Don't break working features. Keep accessibility, privacy, SEO, security headers, and
  performance budgets intact.
- The institution is not named, not even by abbreviation. Honest project facts only — no invented metrics/claims.
- Never write either private repository's name (T Poker's, GRAVITY FLOW's) in docs, commits or PR bodies. Run
  `npm test` (Git Bash) after a docs edit.
- Evidence before conclusions; don't claim done before verified.

## Handoff / state doc
Claude Code records session state in `docs/WORKLOG.md` (plus `docs/ROADMAP.md` for phases).
Update them at the end of each milestone. Since the release, `main`'s `docs/WORKLOG.md` carries sessions 10 to 24 in
full, with the old summary of sessions 10–11 too.

## Transition prompts (fill the task, paste into Claude Code)

**Close a session:**
> We're done for this session. Update docs/WORKLOG.md, claude/START-HERE.md, CLAUDE.md, and your
> memory with the current state; clean up scratch; delete merged work branches (verify each first);
> commit or PR anything uncommitted; then confirm main is clean.

**Open a new session (the prototype):**
> New session. First check out and update `proto/hero-a-cinematic` (`git fetch && git checkout proto/hero-a-cinematic
> && git pull`), then read claude/START-HERE.md, docs/WORKLOG.md, CLAUDE.md and docs/CINEMATIC_SYSTEM.md on that
> branch. Then: <the new task>.

**Open a new session (the live site; the default since the release):**
> New session. First `git fetch && git checkout main && git pull`, then `npm ci`, and read claude/START-HERE.md,
> docs/WORKLOG.md, CLAUDE.md and docs/ROADMAP.md (the backlog) on `main`. Then: <the new task, e.g. backlog #20>.

(The release sessions, S17–S24, opened on `release/concept-a`. That track is done.)
