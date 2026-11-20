# START HERE — Portfolio

Orientation doc for the Portfolio Project. Read this first in any new chat here or any new
Claude Code session, then continue with the current task. Update it before each transition
(new chat / new session) so the next one starts informed.

> **This copy is on `release/concept-a`** (S17, 2026-11-19), the release branch: cut from `main`, carrying the
> prototype. It has the full prototype detail; `main`'s copy has the essentials (PR #19). It reaches `main` with the
> release PR, which Tay merges. The prototype branch keeps its own session 16 copy, frozen.

## What the product is
Tay Shofer's live software-engineering portfolio at https://www.tayshofer.dev/.
Goal: get Tay interviews for junior/entry software roles. Next.js 16 / React 19 / TypeScript /
Tailwind v4, deployed on Vercel. Full stack and projects: see `docs/PROJECT_CONTEXT.md`.

## The tracks
1. **The live site, on `main`:** calm Product Plates with the M1 core (A–E). Nothing on the prototype branch reaches
   it.
2. **The Concept A prototype, on `proto/hero-a-cinematic`: the active direction.** A cinematic direction, measured,
   under the noindex `/lab` segment.
   - Tay reopened **D1** for it (2026-11-18). **D2 is still not reopened, so no WebGL.**
   - Draft PR #18, never merged, Vercel Preview only.
3. **The release (session 16, approved by Tay): Concept A replaces the live `/`** as soon as possible, because Tay is
   job hunting. The demos (P4) come after.
   - It ships from `release/concept-a`, cut from `main` in S17 and pushed (no PR yet), through a PR that Tay merges.
     The prototype branch stays frozen as the record.
   - **S18+S19 (2026-11-20): on that branch, `/` is now the Concept A page** and `/lab` is gone. **Approved by Tay**
     after his review on the Preview.
   - **S20 (2026-11-20): the tests.** The lab tests are ported to `/`, the old page's retired, R12's new guards added:
     unit 218/218, Playwright 183/183. S21+S22 is next.
   - The plan, S17 to S24: `docs/ROADMAP.md`, "Concept A: P4–P6". Tay's decisions, R1 to R15:
     `docs/RESEARCH_AND_DECISIONS.md`, "Resolved in session 16".

## What's live now (verified 2026-11-20 at the S20 close: Production is still `443a1f9`, status success)
- The current site is the calm, light **"Product Plates"** editorial design (M10), with the whole **M1 core, moves
  A–E**:
  - **A**, the iris accent: `#4a3fe0` light, `#a5a8ff` dark, `#b1b4ff` on the dark plates.
  - **C**, two heading tiers: `--text-chapter` 36→64 for the four products; `--text-h2` 30→42 for every paper section.
  - **D**, the motion tokens.
  - **B**, the studio light: a key and a cyan rim on the hero plates (they light up once) and on every phone and window.
    Also the dark "Email me" contrast fix.
  - **E**, the lower half: "Two more" as two lit paper plates; the About and Contact titles fully in ink.
  - Think · Build · Ship row words on the h3 tier (`--text-h3` 20→26), under the 42px title.

  The site has no WebGL, and tests on `main` enforce that. `tokens.test.ts` also guards the "Email me" fill (≥ 3:1
  against `--bg-raised` and `--bg`, both themes).
- **Production** = GitHub `taysh123/Portfolio` **`main`**, the source of truth.
  - Deployed **`443a1f9`**: PR #20, 2026-11-19 03:20Z.
  - The site code is still PR #12's, since PRs #13–#20 change docs only.
  - PR #19's CLAUDE.md line had leaked three unused rules into `/`'s Tailwind sheet (44,530 → 44,829 bytes). **PR #20
    removed them:** the live sheet is 44,530 bytes again (read-only `curl`, session 13). This branch has the same
    change in `fb3bb41`.
  - `main` was green at the session 9 close: unit 122/122, typecheck and lint, and Playwright 132/132 on PR #12's code.
  - First-load JS on `/` is 181.79 KiB gzip (budget 205.7) and HTML 156.44 KB (budget 568), in a local build.
  - **The release baseline (S17, measured on production):** Lighthouse mobile, median of 5: performance 98, LCP
    2,288 ms, FCP 1,140 ms, TBT 35 ms, CLS 0. First-load JS 182.04 KiB gzip (9 scripts), HTML 160,584 B. Detail:
    `docs/WORKLOG.md`, S17 §7. Compare production with production, and a local build with a local build of `main`.
  - `443a1f9` is tagged **`product-plates-final`** (annotated, `8f0a96a`, pushed in S17: R15).
- **Cloudflare proxies the site in front of Vercel** (N7). Tay turned its two HTML changes off on 2026-11-18: Web
  Analytics is Disabled and Email Address Obfuscation is Off.
- **Flagship projects shown:** T Poker, Aegis, DeveloperOS, GRAVITY FLOW; plus Job Assistant and Orders & Delivery.
  Statuses and limitations: PROJECT_CONTEXT §4. T Poker's and GRAVITY FLOW's repositories are private ("Private
  repository" label).
- **Check your branch first.** Live work branches from an up-to-date `main`, and changes go through a PR that Tay
  merges. `reference/premium-redesign-package` is a stale September design branch: never build or deploy from it.

## The release branch: `release/concept-a` (S17, S18+S19)
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
  - **Dark only (R3):** `<html data-theme="dark">`. `ThemeProvider` and `ThemeToggle` are deleted.
    `THEME_COOKIE` stays only while `/privacy` names it (S21+S22).
  - **Depth and the rest:** "Case study" buttons on the existing dialog (R4). Two more in the live words (R5), so six
    triggers. The hero's arrows are SVG icons (R9). About ends on the facts; Work has no lede and no reveal of its own
    (R10, in full).
  - **Deleted:** `/lab`, the Product Plates hero, chapters, About visual, Stack lens, TBS, Contact and Two more, and
    `Pic.tsx`. Also `globals.css`'s seams (they targeted the reused ids) and the toggle's glyph rules. The plate tokens
    stay, because `tokens.test.ts` reads them.
  - **Tests:** R12's edits and the S17 group, plus six Tay approved in-session (`english.spec.ts:45`, the phone toggle
    line, one phone header icon, the new phone accessibility test, at least 8 new-tab links, the Aegis captures). Each
    is its own commit.
  - Not yet, by plan: `privacy.spec.ts:43`, `site.test.ts:160` and `content.test.ts:20,22` (S21+S22).
  - **Results (at the S18+S19 close):** typecheck, lint and build exit 0. Unit 121/121, the two lab unit files failing
    at load. Must-pass e2e 70/70 + 6/6. S20 fixed the rest (below).
  - **The gate** (local production builds, Lighthouse 13.6.0 mobile, median of 5, interleaved): Performance 100, LCP
    1,061 ms (the h1). Local `main` gives 93 and 3,191 ms.
  - **Budgets:** first-load JS 185.00 KiB (budget 205.7), HTML 127,970 B (budget 568 KB).
  - **Status codes:** `/` serves `index, follow` with its canonical; `/lab/*` answers 404.
  - **axe with the overlays open:** the accessibility panel has 0 violations. The case study has two best-practice
    findings that production's code shares: `aria-allowed-role` on its `aside`, all six; `image-redundant-alt`, three.
    **Tay: fix both in S21+S22** (ROADMAP #17).
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
  - **One catch, for Tay:** right after `.next` is deleted, the first full run fails `aegis.spec.ts:15` and the Case
    study block's image test. The Aegis case-study capture's first on-demand AVIF encode outlasts their polls.
    Reproduced twice; with the cache warm, all pass. Nothing changed for it (WORKLOG, "Session 20" §4).
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
- **D1 Direction: reopened by Tay on 2026-11-18 for Concept A.** The cinematic prototype on `proto/hero-a-cinematic` is
  the active direction.
  - The live site stays calm / premium Product Plates (evolve, don't replace) until Tay decides otherwise.
  - On `main`: restrained cyan/violet accents, and the reference README's take / do-NOT-take (its text:
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
- **N7, the Cloudflare toggles:** done. The `/privacy` wording is **deferred to the end of the build** (Tay, session 9
  close). Don't raise it before then.
- **N8** (merged in PR #16): GRAVITY FLOW's private repository name is out of the docs. The private-repo guard pins both
  private repos, T Poker and GRAVITY FLOW, by SHA-256 digest.
- **Session 11 (Tay's answers):** T Poker has 5 captures, not 6 (no duplicate). The DeveloperOS refusal and
  AI-features captures are left out. GRAVITY FLOW's existing two stay; Tay will swap one himself.

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
- **S21+S22 is next** (privacy and SEO surfaces, then the backlog: #13 against S17's baseline, #14, #16, and #17, the
  case study's two axe findings; #15 was done in S18+S19),
  S23 (the release candidate: WebKit and Firefox runs, Tay's review on his own phone, the GRAVITY FLOW capture swap),
  S24 (check the tag, Tay's merge, the production checks).

## Open PRs / branches (S17, 2026-11-19)
- **`release/concept-a`**: the release branch, pushed in S17, in S18+S19 (the code at `270ab27`) and in S20 (tests
  only, then the close-out), with no PR yet. S23 opens it on Tay's go; Tay merges.
- **Tag `product-plates-final`** (`8f0a96a`) on `443a1f9`, pushed in S17: the P4 restore point (R6, R15).
- **PR #18** (`proto/hero-a-cinematic`, draft): the Concept A prototype. Never merge, never delete; Preview only.
- Merged and deleted (each checked with `git merge-base --is-ancestor` first):
  - `docs/claude-md-tailwind-leak` (#20, tip `2e73766`, local and remote, in session 13);
  - `docs/session-10-closeout` (#19, tip `2101ef6`, local and remote, at the session 12 close);
  - `docs/session-9-closeout` (#17, tip `c9696d6`, local and remote, at the session 11 close);
  - `fix/n8-gravity-flow-slug` (#16), `docs/session-8-closeout` (#15), `docs/session-7-closeout` (#13);
  - `docs/backlog-n1-n2-n7` (#14), `feature/m1-lower-half` (#12), `feature/m1-studio-light` (#11),
    `docs/m1-pr1-closeout` (#10);
  - `feature/m1-iris-type-motion` (#8), `fix/docs-private-slug` (#9), `fix/m0-followups` (#7), `docs/m0-closeout` (#6).

## Waiting on Tay
- **Start S21+S22** in a new session, on `release/concept-a`: privacy and SEO surfaces, then the backlog.
- **In S21+S22:** fix the case study's two axe best-practice findings (#17).
- **From S20:** the cold-cache timeouts on the Aegis case-study capture: pre-encode the case studies' captures (a page
  change), lengthen the two polls (a test change), or leave it.
- **In S21+S22:** approve N7's exact final `/privacy` wording before it is committed (R13).
- **In S23:** the GRAVITY FLOW image for the capture swap; the review on his own phone through the Preview.
- **In S24:** merge. The `product-plates-final` tag is already pushed (S17).
- **Optional, on `main`:** the site's chat launcher folds its label as the page scrolls. That is 0.0076 CLS on `/` at
  1440 and 390 (measured in session 11), well inside "good". Untouched.
- **A note from session 7's preview shots:** at 390px the TBS row word (20.3px, 600) is close to the row's lead line
  `.tbs__line` (19px, 600). It follows the plan exactly, and no change was made.
- **The N7 `/privacy` wording is scheduled:** it goes into S21+S22's `/privacy` edit (R13), with its exact final
  wording shown to Tay before the commit.
  - The draft is in `docs/RESEARCH_AND_DECISIONS.md` N7.
  - It needs an approved edit to `tests/e2e/privacy.spec.ts`, which pins 2 outbound links.
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
Update them at the end of each milestone. On this branch, `docs/WORKLOG.md` carries sessions 10 to 17 in full, and
`main`'s summary of sessions 10–11 too. `main`'s own copy ends with that summary until the release merges.

## Transition prompts (fill the task, paste into Claude Code)

**Close a session:**
> We're done for this session. Update docs/WORKLOG.md, claude/START-HERE.md, CLAUDE.md, and your
> memory with the current state; clean up scratch; delete merged work branches (verify each first);
> commit or PR anything uncommitted; then confirm main is clean.

**Open a new session (the prototype):**
> New session. First check out and update `proto/hero-a-cinematic` (`git fetch && git checkout proto/hero-a-cinematic
> && git pull`), then read claude/START-HERE.md, docs/WORKLOG.md, CLAUDE.md and docs/CINEMATIC_SYSTEM.md on that
> branch. Then: <the new task>.

**Open a release session (S18 onwards):**
> New session. First `git fetch && git checkout release/concept-a && git pull`, then `npm ci`, and read
> claude/START-HERE.md, docs/WORKLOG.md, CLAUDE.md, docs/ROADMAP.md ("Concept A: P4–P6") and
> docs/RESEARCH_AND_DECISIONS.md ("Resolved in session 16") there. Then: <Sn only>.

**Open a new session (the live site):**
> New session. First read claude/START-HERE.md, docs/WORKLOG.md, and CLAUDE.md on `main` to load the
> current state. Then: <the new task>.
