# Plan 2: The Site After the Entrance, Final Look-Dev and Cleanup — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the approved redesign. That means:
- the Work storytelling (four art-directed flagship worlds and More Work), About, Stack, Think/Build/Ship, Contact and Footer;
- final-quality entrance look-dev behind a blocking human visual gate, then the final landscape and portrait frame sequences, which replace the preview frames;
- removal of every superseded August component, route, asset and dependency;
- a complete verification of the whole site.

The Plan 1 entrance stays a stable, regression-tested baseline throughout.

**Architecture:**
- **Sections are server components.** Scroll-driven motion comes from one tiny client primitive, `ScrollScene`. It writes the scene's progress into CSS custom properties (`--p`, `--assemble`, `--hold`, `--recede`), and each world's CSS turns them into `transform`/`opacity` with `calc()`. No React re-render happens per scroll frame, and no new runtime dependency is added.
- **Pinning is decided per viewport** by a pure, unit-tested `pinEligible()` (≥ 1024 × 600 and motion allowed). Everywhere else a scene is a full-height, settled composition.
- **Heavy interactive UI is deferred:** the case-study panel via `next/dynamic`, and the GRAVITY FLOW field loads only in view. This keeps first-load JS under the 286 KB hard budget.
- **Final render:**
  - The Blender pipeline gains light groups, multilayer EXR, compositor haze and glare, a look-dev quality tier, and `audit.py`, which asserts the spec §4.6 targets.
  - Final-quality key frames are presented at a **blocking** gate.
  - Only after written approval does the multi-hour batch run, in background chunks, while the section work continues.

**Tech Stack:** Next.js 16.2.6 (App Router), React 19.2.4, TypeScript 5 strict, Tailwind v4 (`@theme inline`), Framer Motion 12 (`useScroll`), Lenis 1.3. Tooling: Vitest 5, Playwright 1.62 (`playwright/test`, Chromium at `/opt/pw-browsers/chromium` via `PW_CHROMIUM`), sharp 0.34, and Blender 5.0.1 `bpy` (pip wheel in the gitignored `bpyenv`, Python 3.11, dev-only).

**Spec:** `docs/superpowers/specs/2026-09-25-cinematic-laptop-redesign-design.md`. Approved 2026-09-25, together with the preview key frames K0/K1/K2 and the §4.6 look-dev refinement requirements. Read it alongside this plan; §4.6, §4.7, §5–§10 are the parts this plan implements.

**Baseline:**
- Plan 1 is accepted: `docs/superpowers/plans/2026-09-25-plan-1-cinematic-entrance.md` and its verification log.
- The branch is `feature/premium-portfolio-redesign-1mqmgf` at `5e596c8` or later.

**Scope — this is Plan 2 of 2.** It covers:
- spec phase D (sections);
- C2 (final look-dev, the gate, the final render and the swap-in);
- E (cleanup and verification);
- the final fresh whole-branch review.

It does **not** merge, open a production PR or deploy.

---

## Global Constraints

- **Read the relevant guide in `node_modules/next/dist/docs/` before writing Next.js code** (AGENTS.md). In Next 16:
  - `next/image` takes `preload`, not `priority`;
  - `next/dynamic` works in client components;
  - server components are the default.
- **No new runtime dependency.** No GSAP, no R3F, no animation or UI library. Dev-only additions need a written reason in the ledger. `OpenEXR` inside `bpyenv` is allowed, because it is not a `package.json` dependency.
- **First-load JS for `/` ≤ 286 KB gzip, hard.** Plan 1 measured 279.6 KB, which leaves 6.4 KB of headroom.
  - Measure after **every** task that adds or changes client code (`npm run measure`), and record the delta in the ledger.
  - A task that would cross the budget must simplify or defer. Do not move large components client-side. Never relax the budget.
- **HTML for `/` ≤ 568 KB.** CLS < 0.02. LCP ≤ 1.2 s (local, production build).
- **Frames before `load`:** 0, except the poster or still.
- **Frame payloads:**
  - landscape ≤ 2.5 MB at the 1280 tier and ≤ 4 MB at the 1920 tier;
  - portrait ≤ 1.2 MB.
- **Idle work:** 0 animation-frame callbacks per second while no looping scene is in view (asserted at Contact).
- **Main-thread time per scroll frame in the entrance:** ≤ 8 ms (Chrome trace).
- **Motion (§7):**
  - compositor properties only (`transform`, `opacity`; `filter: blur` only on small elements);
  - one primary moving thing per viewport;
  - no time-based loop beside body text, except the one named exception, GRAVITY FLOW's orbital field (in view only, never under reduced motion);
  - exits run at about 65% of enter duration;
  - parallax ≤ 48 px;
  - list stagger 60 ms;
  - easings `--ease-out: cubic-bezier(.16,1,.3,1)` and `--ease-in-out: cubic-bezier(.65,0,.35,1)`;
  - durations 180 / 320 / 560 ms.
- **Pinning (§5):**
  - only when width ≥ 1024 px, height ≥ 600 px, and motion is allowed (neither the OS setting nor the in-app `data-reduced-motion`);
  - "Pinned for N svh" means container height;
  - flagship scenes and Think/Build/Ship pin for 200svh.
- **Type (§3.2):**

  | Role | Size | Weight | Tracking |
  |---|---|---|---|
  | Section titles | `clamp(2.25rem, 5vw, 4.5rem)` | 600 | |
  | Lead | `clamp(1.125rem, 1.5vw, 1.3125rem)` | | |
  | Body | 17 px, line-height 1.6, ≤ 62ch | | |
  | Labels | 11 px Geist Mono, uppercase | | +0.16em |

- **Layout (§3.2):**
  - content shell `min(1240px, 100vw − 2×gutter)`; gutter `clamp(20px, 4vw, 40px)`;
  - section rhythm `clamp(7rem, 14vh, 12rem)`;
  - radius 10 / 16 / 24 / pill;
  - one elevation shadow, for floating objects only.
- **Accessibility (§8):**
  - landmarks `header`/`nav`, one `main`, `footer`;
  - one `h1` (the hero's), then `h2` per section and `h3` per project, in sequence;
  - visible focus (2 px `--accent` ring plus offset);
  - targets ≥ 44 px below `lg`;
  - no hover-only content; zoom never disabled;
  - overlays keep their focus traps and focus restoration.
- **Truth:**
  - Every number, status and claim comes from `data/*.ts`, the repositories, or real command output.
  - No invented metrics. No check mark or pass status for anything that was not executed and passed at the frozen snapshot.
  - Banned claims stay out: "6+ Shipped", "1,077 roles", `poker-home-games-three`, and any "7 languages" stat.
- **The Plan 1 entrance is a stable baseline.** Do not redesign or destabilise it to make later sections easier.
  - Any task that touches shared tokens, the nav, the Hero, the accessibility controls, `EntranceStage`, `SmoothScroll` or `lib/entrance/*` must run `tests/e2e/entrance.spec.ts` **and** `tests/e2e/entrance-geometry.spec.ts` (Task 1) and keep them green.
  - Tests are never weakened.
- **Git:**
  - Commit at task boundaries, and push only `feature/premium-portfolio-redesign-1mqmgf`.
  - Never merge to `main`, never open a production PR, never deploy.
  - Never force-push, and never rewrite published history.
  - Commit messages end with the session attribution lines supplied by the harness.
- **Ledger:** append to `.superpowers/sdd/2026-09-26-plan-2-sections-final-render/progress.md` (gitignored) at every task boundary. Record the commit, the deviations with reasons, and the JS/HTML measurements.

## Decisions recorded before this plan (the user, 2026-09-26)

1. **VERIFY monitor:**
   - The CI check rows (✓ typecheck, ✓ lint, ✓ build) stay exactly as they are, drawn only for a command that exited 0 at the frozen snapshot.
   - The per-project rows lose their check mark and status icon, because those suites were not executed for the snapshot.
   - The counts remain as factual metadata ("T Poker — 892 tests" and so on) with a neutral bullet.
   - The panel is titled so that it does not imply a run. Truthfulness beats decorative consistency. (This is Task 7.)
2. **Small-text contrast:** `--fg-subtle` at 5.4:1 is accepted. It must never go lower. Task 2's token test pins a floor of 5.4:1 in both themes.
3. **Light theme:**
   - The entrance and the Hero stay dark in the light theme. This is already implemented: `.entrance__stage[data-theme="dark"]`.
   - Plan 2 defines how the later sections enter the light theme (next section) and must not change the dark entrance or Hero.
4. **JavaScript budget:** the headroom is treated as extremely limited.
   - No new runtime animation or UI dependencies.
   - No large components moved client-side.
   - Bundle impact is measured during implementation (`npm run measure` after every client-touching task), not left to the final gate.

## Decisions this plan takes (override at plan review)

1. **The light theme's dark spine.** In the light theme these are dark stages (`data-theme="dark"` on the section):
   - the entrance and Hero (decided);
   - the four **flagship worlds**, which are product cinematography (phones, monitors and windows lit in darkness, like the dark product bands of a light product page);
   - **Contact**, which is the planet-horizon bookend that echoes the opening frame.

   More Work, About, Stack, Think/Build/Ship and the Footer follow the site theme. Each dark-to-light or light-to-dark boundary is a designed **seam**: a 96 px gradient band, painted as the section's own background edge and not as a separate element (Task 5). In the dark theme the seams are invisible.
2. **Flagship order and numbering:** 01 T Poker · 02 Aegis · 03 DeveloperOS · 04 GRAVITY FLOW (spec §5.2). GRAVITY FLOW is a flagship even though `featured` is false in `data/projects.ts`. `data/work.ts` owns the flagship list, and `featured` is left untouched.
3. **T Poker "Source" button** (spec §13 open fact): `data/work.ts` carries `sourcePrivate: true` for T Poker **only if** the user confirms at plan review that `taysh123/poker-home-games` is private. In that case the button reads "Private repository", with no link. Until then the existing `repoUrl` link stays.
4. **Hue lock in the room:** the preview scene's status LEDs use `led_green` (#8affc4), and the spec hue lock bans green. Look-dev (Task 8) recolours them to ice. This is a truthful hardware colour, since many devices have ice/white LEDs, and it is not a redesign.
5. **Command-palette "Home"** now dispatches `entrance:skip`, so it lands on the hero at identity. It previously targeted `#top`, which Plan 1 removed, so it silently did nothing: a live regression, fixed in Task 4.

6. **Aegis (user decision, 2026-09-26).** The project formerly called SentinelAI is **Aegis**: the id is `aegis`, the display name is `Aegis`, and the assets live in `/projects/aegis/`. It was applied before Task 1 in commit "Rename SentinelAI to Aegis across the portfolio".
   - **"Formerly SentinelAI" appears only in the case study's context line, driven by `projects[].formerly`.** It is not designed into the flagship composition (user note, 2026-09-26). Keep it while the repository URL still carries the old name; drop the field once nothing visible does. The old name is still visible in two places:
     - The captured screenshots show the app's own wordmark. They are kept unedited: re-drawing a wordmark would misrepresent the software. Their alt text says they predate the rename.
     - The repository was **not renamed**: `taysh123/sentinelai` is public and owned by the user, but this session has no GitHub API that can rename a repository. The name `aegis` is free among the repositories visible to this session. The repository's docs plan a Vercel + Railway deployment (`docs/DEPLOYMENT.md`), so whether a live integration exists must be checked in the Vercel dashboard before renaming. GitHub redirects the old URL after a rename, and `repoUrl` should then be updated.
   - `tests/unit/rename.test.ts` fails on any `SentinelAI` in site source outside a line that explains the former name, and on display variants such as "AegisAI".
   - VERIFY: `make_screens.py` labels the row "Aegis". The **preview** frames still show the old label on the VERIFY monitor until the final frames replace them (Task 22).
   - **The current Aegis screenshots are temporary fallback and reference assets.** The user will supply new captures of the rebranded app. Until then:
     - do not delete them, and never edit their pixels;
     - the file paths already moved to `/projects/aegis/`; do not rename the image content itself;
     - keep the Aegis world light-touch (Task 14 Step 4).
   - **When the new screenshots arrive,** at any point during or after this plan, run the Aegis asset swap:
     1. Add the files under `public/projects/aegis/`, with new names such as `overview.webp` so both sets coexist.
     2. Point `projects.ts` `media` (image, gallery, alt) and `data/work.ts` `worldAssets` at them. Re-measure the row centres, and rewrite the alt texts without the "captured before the rename" note.
     3. Run `grep -rn "dashboard.webp\|live-alerts.webp\|incident-kanban.webp\|ai-analysis.webp\|architecture.webp" app components data`. For each old file, confirm by that grep and a built-page check (no request for the file on `/` or in either case study) that it is unused, then `git rm` only the unused ones.
     4. If the app's own UI no longer shows the old name, reconsider `formerly`: keep it only while the repository URL carries the old name.
     5. Run `rename.test.ts`, `work.test.ts` and the sections e2e, re-shoot the Aegis world in both themes, and commit "Aegis: canonical screenshots".

## Review Focus

The five input classes or conditions most likely to bite a real visitor that no task's natural tests would exercise. Each has a test in its owning task:

1. **Jumping into the middle of a pinned flagship scene** (palette "Work", a nav click, a browser back to a restored scroll position) must show a settled, legible composition in that frame: the copy is always readable, and no world element is left mid-transform with `opacity: 0`. Owner: Task 12 (`sections.spec.ts`, "restored scroll inside a pinned scene").
2. **Resizing across the pin threshold** (1100 × 700 → 900 × 700, or an iPad rotating) must re-evaluate pinning live. The scene either pins with fresh vars or drops to the settled layout with every inline var cleared, and never keeps a 200svh container without sticky content. Owner: Task 5 (`scene.spec.ts`).
3. **Reduced motion switched on mid-page, from either source, while inside a pinned scene or with the GRAVITY FLOW field running:**
   - pinning drops at once;
   - the loop stops (0 rAF callbacks);
   - the composition settles.

   Owner: Task 16 (`sections.spec.ts`) and Task 5.
4. **Keyboard traversal through the Work section:**
   - Tab through every flagship's CTAs, open a case study with Enter, close it with Escape, and focus returns to the "Case study" button that opened it, even when that button's scene is pinned.
   - The case-study chunk loads on demand and never on first load.

   Owner: Task 12.
5. **Light theme end to end:**
   - The dark spine stays dark and the theme sections are light.
   - Every text token passes its contrast floor on the surface it actually sits on.
   - Toggling the theme mid-page causes no layout shift (CLS stays < 0.02 across a toggle).

   Owner: Task 2 (unit contrast), Task 21 (e2e theme walk).

---
## File structure

**New files:**

| Path | Responsibility |
|---|---|
| `scripts/measure.mjs` | Budget measurement against a running `next start`: first-load JS gzip, HTML, LCP and whole-page CLS. Exits 1 on a hard-budget failure. |
| `scripts/shoot.mjs` | Real-browser screenshot sets of entrance beats and sections, per theme and viewport, plus contact sheets. The visual-pass tool. |
| `lib/scene.ts` | Pure scroll-scene maths: `pinEligible`, `scenePhases`, `pillarState`. |
| `components/scenes/ScrollScene.tsx` | The only client scroll primitive for sections. It pins through CSS and writes progress vars when pinned, and clears them when not. |
| `components/scenes/scene.css` | Pinned and settled layout for scenes; the seam gradients. |
| `data/work.ts` | Flagship and More Work storytelling config (numbers, kickers, story lines, chosen metrics, assets, diagrams). |
| `components/work/Work.tsx` | The Work section: header, four flagship scenes, More Work, case-study host. |
| `components/work/FlagshipScene.tsx` | One flagship: an always-legible copy column plus the world slot. |
| `components/work/CaseStudyHost.tsx` | Client. Delegated "Case study" buttons; `next/dynamic` loads `CaseStudyPanel` on demand. |
| `components/work/worlds/PokerWorld.tsx` | The T Poker world. Server; CSS vars only. |
| `components/work/worlds/AegisWorld.tsx` | The Aegis world. Server; CSS vars plus a one-shot scan. |
| `components/work/worlds/DeveloperOSWorld.tsx` | The DeveloperOS world. Server; CSS vars only. |
| `components/work/worlds/GravityWorld.tsx` | The GRAVITY FLOW world. Server shell. |
| `components/work/worlds/GravityField.tsx` | Client canvas star field: the site's one time-based loop, in view only. |
| `components/work/worlds/worlds.css` | Each world's CSS. |
| `components/work/MoreWork.tsx` | The two unpinned "More work" rows. |
| `components/work/PipelineDiagram.tsx` | SVG of a pipeline shape (collect → filter → dedup → deliver; client ⇄ TCP ⇄ server). |
| `data/about.ts` | The About copy and facts (content-tested). |
| `components/sections/Stack.tsx` | The Stack bento (replaces `Skills.tsx`). |
| `components/ui/PointerLight.tsx` | Client. One delegated pointer listener lights the hovered card; off on touch and under reduced motion. |
| `components/sections/ThinkBuildShip.tsx` | Think / Build / Ship (replaces `EngineeringPanel.tsx`). |
| `components/sections/ThinkBuildShip.css` | Word lighting and the hairline, from `--p`. |
| `design/render/blender/audit.py` | The spec §4.6 assertions on key frames: composition, hue lock, luminance, and light-group energy shares from EXR. |
| `design/render/blender/test_audit.py` | Unit tests for `audit.py` on synthetic images, run with `bpyenv/bin/python`, which has numpy (system Python does not). |
| `design/render/blender/batch.py` | Chunked, resumable final batch that encodes and commits per chunk. |

**Test files:** `tests/unit/{tokens,scene,work,about,approach}.test.ts` and `tests/e2e/{budget,entrance-geometry,scene,chrome,sections,theme,idle,a11y}.spec.ts`.

**Modified:**
- `app/globals.css`, `lib/tokens.ts`;
- `components/providers/SmoothScroll.tsx`;
- `components/layout/{Navbar,Footer}.tsx`;
- `components/ui/{CommandPalette,AccessibilityPanel,AIChatWidget,CaseStudyPanel}.tsx`;
- `components/entrance/EntranceStage.tsx`, adding one listener (`entrance:skip`). This is the only Plan 1 runtime change, and it is regression-tested;
- `components/sections/{About,Contact}.tsx` (rewritten);
- `app/page.tsx`;
- `data/approach.ts` (adds `pillars`);
- `design/render/blender/{scene.py,render.py,make_screens.py}`;
- `scripts/encode-frames.mjs`;
- `public/entrance/*` (final frames);
- `package.json` (scripts; removes `three` and `@types/three`).

**Deleted (Task 23):** see that task's list.

## Execution order and the visual gate

```
Phase G   Task 1   guardrails (budget, entrance geometry, measure/shoot tools)
Phase F   Tasks 2–5  tokens · idle loops · nav & chrome · scene primitive
Phase L   Tasks 6–8  render pipeline upgrade · texture freeze · look-dev + final-quality key frames
          Task 9   ■ BLOCKING HUMAN VISUAL GATE ■  (stop; present; wait for written approval)
          Task 10  final batch — starts only after approval; runs in background chunks
Phase S   Tasks 11–21 sections (run while Task 10 renders)
Phase E   Task 22  swap in final frames (when Task 10 completes)
          Task 23  remove superseded code, routes, assets, deps
          Task 24  full verification: gate, budgets, perf trace, visual pass, a11y/UX review
          Task 25  fresh whole-branch review, fix pass, push, report, stop
```

- **At Task 9 the executor stops** and reports to the user. It does not continue until the user replies.
- If the user's reply approves the key frames, Task 10 starts. If it asks for changes, return to Task 8, with at most three look-dev passes per frame before bringing options instead.
- The user may also say "continue with the sections while I review". Only in that case do Tasks 11–21 run before approval, and Task 10 still waits.
- Tasks 11–21 never touch `design/render` or `public/entrance`, so they cannot interfere with a render in flight.

## Per-task gate (every task, before its commit)

```bash
npm run typecheck && npm run lint && npm test
npm run build && PW_CHROMIUM=/opt/pw-browsers/chromium npm run test:e2e
# client-code tasks, with the server on :3400 (the e2e webServer or `npx next start --port 3400`):
PW_CHROMIUM=/opt/pw-browsers/chromium npm run measure
```

- Record the `measure` JSON line in the ledger.
- Playwright reuses an existing server (`reuseExistingServer: true`). A hand-started `next start` must be run with `E2E_FIXTURES=1`, or the scene fixture 404s and `scene.spec.ts` fails.
- The rAF counters in `idle.spec.ts` and `sections.spec.ts` wrap `window.requestAnimationFrame` after load. Framer's frame loop keeps its own captured reference, so those counters cover Lenis, the stage and GravityField, but not Framer. Framer's loop is event-driven and does not idle-loop, so this is acceptable.
- Stop the stray `next start` before rebuilding. Kill the server **by its process ID from a pid file**. Never use `pkill -f` with a pattern that also matches your own shell command.
- **Long background jobs (renders, the batch, texture generation) are tracked by PID file, never by process-name matching.** A waiter such as `while pgrep -f "render.py …"` matches its own command line and never exits; that happened on 2026-09-26 and cost about 90 minutes after the renders had finished.
  - Launch with a wrapper that records `$!` to `<name>.pid` and writes the exit code to `<name>.exit`.
  - Wait with `while kill -0 $(cat <name>.pid); do sleep 10; done`, then read `<name>.exit`.
  - Before waiting on anything that has been running longer than expected, inspect `ps` and the log.

---

### Task 1: Guardrails — budget tests, entrance geometry regression, measure and shoot tools

**Files:**
- Create: `scripts/measure.mjs`, `scripts/shoot.mjs`, `tests/e2e/budget.spec.ts`, `tests/e2e/entrance-geometry.spec.ts`
- Modify: `package.json` (scripts `measure`, `shoot`)

**Interfaces:**
- Consumes: `coverFit`, `quadToViewport`, `circumscribed1610` from `lib/entrance/surface.ts`; `public/entrance/manifest.json` (Plan 1 shape `{version, snapshot, landscape, portrait}`).
- Produces:
  - `npm run measure`: prints one JSON line `{scripts, jsGzipKB, htmlKB, runs:[{viewport, lcpMs, cls}]}`, and exits 1 when `jsGzipKB > 286`, `htmlKB > 568`, any `cls ≥ 0.02` or `lcpMs > 1200`.
  - `npm run shoot -- --out <dir> --theme dark|light --sizes 1440x900,390x844 [--entrance 0,0.1,…] [--sections hero,work,…]`: writes PNGs and `<dir>/sheet-<theme>.png`.

- [ ] **Step 1: Write the entrance geometry regression test.** It pins the Plan 1 baseline numerically, so later tasks can't silently move the screen off the laptop.

```ts
// tests/e2e/entrance-geometry.spec.ts
import { test, expect, type Page } from "playwright/test";
import fs from "node:fs";
import sharp from "sharp";
import { coverFit, quadToViewport } from "../../lib/entrance/surface";
import type { Manifest, Quad } from "../../lib/entrance/types";

const manifest = JSON.parse(fs.readFileSync("public/entrance/manifest.json", "utf8")) as Manifest;

async function gotoP(page: Page, p: number) {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.evaluate((p) => {
    const c = document.getElementById("entrance")!;
    window.scrollTo({ top: c.offsetTop + p * (c.offsetHeight - innerHeight), behavior: "instant" as ScrollBehavior });
  }, p);
}

/** The surface element's four transformed corners in viewport px (transform-origin 0 0). */
const surfaceCorners = (page: Page) => page.locator(".entrance__surface").evaluate((el: HTMLElement) => {
  const m = new DOMMatrix(getComputedStyle(el).transform);
  const x0 = parseFloat(el.style.left), y0 = parseFloat(el.style.top), w = el.offsetWidth, h = el.offsetHeight;
  return [[0, 0], [w, 0], [w, h], [0, h]].map(([x, y]) => { const q = m.transformPoint(new DOMPoint(x, y)); return { x: q.x / q.w + x0, y: q.y / q.w + y0 }; });
});

const maxErr = (a: { x: number; y: number }[], b: Quad) => Math.max(...a.map((p, i) => Math.hypot(p.x - b[i].x, p.y - b[i].y)));

test("landscape: at p = 0.6 the hero surface sits exactly on the k1-on screen quad", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoP(page, 0.6);
  const set = manifest.landscape, f = set.frames.find((x) => x.file === "k1-on")!;
  const want = quadToViewport(f.quad!, set.width, set.height, coverFit(set.width, set.height, 1440, 900, 1.03));
  await expect.poll(async () => maxErr(await surfaceCorners(page), want), { timeout: 8000 }).toBeLessThan(1.5);
});

test("portrait: at p = 0.6 the band maps onto the k1-on quad", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoP(page, 0.6);
  const set = manifest.portrait, f = set.frames.find((x) => x.file === "k1-on")!;
  const want = quadToViewport(f.quad!, set.width, set.height, coverFit(set.width, set.height, 390, 844, 1.03));
  // The band is the centred 16:10 strip of the full-viewport surface.
  const band = () => page.locator(".entrance__surface").evaluate((el: HTMLElement) => {
    const m = new DOMMatrix(getComputedStyle(el).transform), w = el.offsetWidth, bh = w / 1.6, by = (el.offsetHeight - bh) / 2;
    return [[0, by], [w, by], [w, by + bh], [0, by + bh]].map(([x, y]) => { const q = m.transformPoint(new DOMPoint(x, y)); return { x: q.x / q.w, y: q.y / q.w }; });
  });
  // Polled like the landscape case: the stage renders in a later frame, after frames decode.
  await expect.poll(async () => maxErr(await band(), want), { timeout: 8000 }).toBeLessThan(1.5);
});

test("the canvas brightens across p 0 → 0.12 (spec §10), measured through the veil", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const mean = async (p: number) => { await gotoP(page, p); await page.waitForTimeout(700);
    const png = await page.screenshot({ clip: { x: 360, y: 225, width: 720, height: 450 } });
    const { data } = await sharp(png).greyscale().raw().toBuffer({ resolveWithObject: true });
    return data.reduce((a, b) => a + b, 0) / data.length; };
  expect(await mean(0.12)).toBeGreaterThan(await mean(0));
});

for (const [w, h] of [[1440, 900], [390, 844]] as const) {
  test(`${w}x${h}: at p = 1 the surface is exactly identity and fills the viewport`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await gotoP(page, 1);
    await expect.poll(() => page.locator(".entrance__surface").evaluate((el) => getComputedStyle(el).transform)).toMatch(/^(none|matrix\(1, 0, 0, 1, 0, 0\)|matrix3d\(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1\))$/);
    const r = await page.locator("#hero").evaluate((el) => el.getBoundingClientRect().toJSON());
    expect(Math.abs(r.left)).toBeLessThan(1); expect(Math.abs(r.width - w)).toBeLessThan(1);
  });
}
```

- [ ] **Step 2: Run it against the current build:**
  `npm run build && PW_CHROMIUM=/opt/pw-browsers/chromium npx playwright test tests/e2e/entrance-geometry.spec.ts`.
  Expected: PASS. It is a baseline pin, not TDD red. If it fails, the Plan 1 baseline has drifted: stop and report, and do not adjust tolerances.

- [ ] **Step 3: Write the budget test**

```ts
// tests/e2e/budget.spec.ts — hard budgets (spec §9), asserted in every e2e run.
import { test, expect } from "playwright/test";
import zlib from "node:zlib";

test("first-load JS for / ≤ 286 KB gzip and HTML ≤ 568 KB", async ({ request, baseURL }) => {
  const html = await (await request.get("/")).text();
  const srcs = [...new Set([...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]))];
  let gz = 0;
  for (const s of srcs) gz += zlib.gzipSync(await (await request.get(new URL(s, baseURL).toString())).body()).length;
  expect(gz / 1024, `JS ${(gz / 1024).toFixed(1)} KB over ${srcs.length} scripts`).toBeLessThanOrEqual(286);
  expect(Buffer.byteLength(html) / 1024).toBeLessThanOrEqual(568);
});

test("the case-study panel is not part of first-load JS", async ({ page }) => {
  const js: string[] = [];
  page.on("response", async (r) => { if (r.url().endsWith(".js")) js.push(await r.text().catch(() => "")); });
  await page.goto("/", { waitUntil: "networkidle" });
  // A string that only CaseStudyPanel renders:
  expect(js.some((t) => t.includes("Close case study"))).toBe(false);
});
```

  The second test is expected to FAIL now, because August's `Projects.tsx` imports the panel statically. Mark it `test.fixme(…)` **with the comment `// un-fixme in Task 12`**. Task 12 must remove the `fixme`; this is tracked in the ledger. Skipping it silently is forbidden.

- [ ] **Step 4: Create `scripts/measure.mjs`**

```js
// Budget measurement against a running production server (spec §9). Exits 1 on a hard-budget failure.
// usage: npm run measure [-- http://localhost:3400]
import zlib from "node:zlib";
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:3400";
const BUDGET = { jsGzipKB: 286, htmlKB: 568, cls: 0.02, lcpMs: 1200 };
const html = await (await fetch(BASE + "/")).text();
const srcs = [...new Set([...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]))];
let gz = 0;
for (const s of srcs) gz += zlib.gzipSync(Buffer.from(await (await fetch(new URL(s, BASE))).arrayBuffer())).length;
const out = { scripts: srcs.length, jsGzipKB: +(gz / 1024).toFixed(1), htmlKB: +(Buffer.byteLength(html) / 1024).toFixed(1), runs: [] };

const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(() => {
    window.__cls = 0; window.__lcp = 0;
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
  });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  const lcpMs = await page.evaluate(() => window.__lcp);
  // Walk the whole page, not just the entrance: every section's reveals count toward CLS.
  for (let i = 0; i < 600; i++) {
    const atEnd = await page.evaluate(() => innerHeight + scrollY >= document.documentElement.scrollHeight - 2);
    if (atEnd) break;
    await page.mouse.wheel(0, h * 0.3); await page.waitForTimeout(40);
  }
  await page.waitForTimeout(600);
  out.runs.push({ viewport: `${w}x${h}`, lcpMs: Math.round(lcpMs), cls: +(await page.evaluate(() => window.__cls)).toFixed(4) });
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(out));
const fail = out.jsGzipKB > BUDGET.jsGzipKB || out.htmlKB > BUDGET.htmlKB || out.runs.some((r) => r.cls >= BUDGET.cls || r.lcpMs > BUDGET.lcpMs);
process.exit(fail ? 1 : 0);
```

- [ ] **Step 5: Create `scripts/shoot.mjs`.** It is the Plan 1 scratch shooter, made permanent and extended to sections.

```js
// Real-browser screenshots for visual passes. Writes PNGs and a contact sheet per theme.
// usage: npm run shoot -- --out shots/x --theme dark --sizes 1440x900,390x844 --entrance 0,0.45,1 --sections work,about
import fs from "node:fs";
import { chromium } from "playwright";
import sharp from "sharp";

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const out = arg("out", "shots"), theme = arg("theme", "dark"), base = arg("base", "http://localhost:3400");
const sizes = arg("sizes", "1440x900,1366x768,768x1024,390x844,375x667,844x390").split(",");
const beats = arg("entrance", "").split(",").filter(Boolean).map(Number);
const sections = arg("sections", "").split(",").filter(Boolean);
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
const files = [], report = [];
for (const size of sizes) {
  const [w, h] = size.split("x").map(Number);
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addCookies([{ name: "theme", value: theme, url: base }]);
  const page = await ctx.newPage();
  page.on("pageerror", (e) => report.push(`${size} pageerror ${e}`));
  await page.goto(base + "/", { waitUntil: "networkidle" });
  const shots = [...beats.map((p) => ({ kind: "entrance", key: p })), ...sections.map((s) => ({ kind: "section", key: s }))];
  for (const s of shots) {
    await page.evaluate(({ kind, key }) => {
      if (kind === "entrance") { const c = document.getElementById("entrance"); window.scrollTo({ top: c.offsetTop + key * (c.offsetHeight - innerHeight), behavior: "instant" }); }
      else { const el = document.getElementById(key); window.scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: "instant" }); }
    }, s);
    await page.waitForTimeout(1100);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    if (overflow > 0) report.push(`${size} ${s.key} horizontal overflow ${overflow}px`);
    const file = `${out}/${theme}-${size}-${s.kind === "entrance" ? "p" + s.key : s.key}.png`;
    await page.screenshot({ path: file }); files.push(file);
  }
  await ctx.close();
}
await browser.close();
// Contact sheet: 4 across, 480 px thumbnails, labelled by filename order.
const thumbs = await Promise.all(files.map((f) => sharp(f).resize(480).png().toBuffer()));
const metas = await Promise.all(thumbs.map((t) => sharp(t).metadata()));
const rowH = Math.max(...metas.map((m) => m.height)), cols = 4, rows = Math.ceil(files.length / cols);
await sharp({ create: { width: cols * 486, height: rows * (rowH + 6), channels: 3, background: "#282828" } })
  .composite(thumbs.map((input, i) => ({ input, left: (i % cols) * 486, top: Math.floor(i / cols) * (rowH + 6) })))
  .png().toFile(`${out}/sheet-${theme}.png`);
console.log(files.join("\n")); if (report.length) { console.error(report.join("\n")); process.exitCode = 1; }
```

- [ ] **Step 6: Add the scripts to `package.json`:** `"measure": "node scripts/measure.mjs"` and `"shoot": "node scripts/shoot.mjs"`. Add `/shots` to `.gitignore`.

- [ ] **Step 7: Run the gate.**
  - `npm run build`, then the full e2e suite. Expected: all green, with the one `fixme`.
  - Start the server and run `PW_CHROMIUM=/opt/pw-browsers/chromium npm run measure`. Expected: exit 0, with a JSON line close to the Plan 1 figures (JS ≈ 279.6 KB, HTML ≈ 502 KB).
  - Record the line in the ledger.

- [ ] **Step 8: Commit:** "Add Plan 2 guardrails: budget and entrance-geometry regression tests, measure and shoot tools".

---

### Task 2: Tokens — the light theme, contrast floors and the dark-stage scope

**Files:**
- Modify: `app/globals.css` (the `[data-theme="light"]` block; the `--fg-subtle-raised` token; the `.raised` utility; the seam utilities), `lib/tokens.ts`
- Test: `tests/unit/tokens.test.ts`

**Interfaces:**
- Consumes: the Plan 1 dark tokens, with `:root, [data-theme="dark"]` as the scope selector.
- Produces:
  - CSS tokens, both themes: `--bg`, `--bg-raised`, `--fg`, `--fg-muted`, `--fg-subtle`, `--fg-subtle-raised`, `--accent`, `--accent-solid`, `--accent-solid-hover`, `--line`, `--line-strong`, `--screen`.
  - Tailwind colours `bg-raised`, `text-fg-subtle-raised`, `border-line`, `border-line-strong`.
  - The utility class `.raised`: background `--bg-raised`, and it rebinds `--fg-subtle` to `--fg-subtle-raised`, so an 11 px label on a card keeps ≥ 5.4:1.
  - `.seam-top-dark`, `.seam-bottom-dark`: 96 px gradient edges into and out of a dark stage. They are drawn as `::before` and `::after` pseudo-elements, so one element can carry both.

- [ ] **Step 1: Write the failing test.** It parses the real stylesheet, so the numbers can't drift from the CSS.

```ts
// tests/unit/tokens.test.ts
import { describe, it, expect } from "vitest";
import fs from "node:fs";

const css = fs.readFileSync("app/globals.css", "utf8");
function block(selectorStart: string): Record<string, string> {
  const i = css.indexOf(selectorStart); if (i < 0) throw new Error(`no block ${selectorStart}`);
  const body = css.slice(css.indexOf("{", i) + 1, css.indexOf("\n}", i));
  return Object.fromEntries([...body.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)].map((m) => [m[1], m[2]]));
}
const lum = (hex: string) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

const dark = block(":root,\n[data-theme=\"dark\"] {");
const light = block("[data-theme=\"light\"] {");

describe.each([["dark", dark], ["light", light]] as const)("%s theme contrast floors", (_, t) => {
  it("text on --bg", () => {
    expect(ratio(t.fg, t.bg)).toBeGreaterThanOrEqual(15);
    expect(ratio(t["fg-muted"], t.bg)).toBeGreaterThanOrEqual(7);
    expect(ratio(t["fg-subtle"], t.bg)).toBeGreaterThanOrEqual(5.4);   // the user-approved floor; never lower
    expect(ratio(t.accent, t.bg)).toBeGreaterThanOrEqual(4.5);
  });
  it("labels on raised surfaces keep the same floor", () => {
    expect(ratio(t["fg-subtle-raised"], t["bg-raised"])).toBeGreaterThanOrEqual(5.4);
    expect(ratio(t["fg-muted"], t["bg-raised"])).toBeGreaterThanOrEqual(7);
  });
  it("white on the solid accent (primary buttons)", () => {
    expect(ratio("#ffffff", t["accent-solid"])).toBeGreaterThanOrEqual(4.5);
    expect(ratio("#ffffff", t["accent-solid-hover"])).toBeGreaterThanOrEqual(4.5);
  });
});

it("--screen is the dark screen black in both themes", () => {
  expect(dark.screen.toLowerCase()).toBe("#05070a"); expect(light.screen.toLowerCase()).toBe("#05070a");
});
```

- [ ] **Step 2: Run** `npx vitest run tests/unit/tokens.test.ts`. Expected: FAIL (`fg-subtle-raised` is missing; the light `bg-raised` and `accent-solid` are missing).

- [ ] **Step 3: Add the tokens.**
  - In the dark block, after `--fg-subtle`:

    ```css
      /* On --bg-raised an 11px label at --fg-subtle would drop to 5.2:1; cards rebind to this (5.5:1). */
      --fg-subtle-raised: #8089a0;
    ```

  - In `[data-theme="light"]`, replace the `--bg`, `--fg*` and accent lines with the spec §3.2 light set. Each ratio was computed against `#f5f6f8`:

    ```css
      --bg: #f5f6f8;            /* paper */
      --bg-raised: #ffffff;
      --screen: #05070a;
      --surface-0: var(--bg);
      --fg: #0b0e14;            /* ink, 17.9:1 */
      --fg-muted: #414a63;      /* 8.1:1 */
      --fg-subtle: #566079;     /* 5.8:1 */
      --fg-subtle-raised: #566079;  /* 6.3:1 on white */
      --accent: #1459d9;        /* 5.6:1 */
      --accent-solid: #1459d9;  /* white 6.1:1 */
      --accent-solid-hover: #0f4bbd;
    ```

    Keep the existing light `--surface-*`, `--border-*` and `--accent-*` soft and line values. Update the `/* Contrast … */` comment to the new figures.

  - Add `--color-fg-subtle-raised: var(--fg-subtle-raised);` and `--color-raised: var(--bg-raised);` to `@theme inline`.
  - **Define the shared names that later tasks use.** They do not exist yet: `globals.css` has `--border*` and `--ease-out-expo`. Add them to the dark block; the light block inherits the aliases:

    ```css
      --line: var(--border);                          /* hairline alias used by every Plan 2 section */
      --line-strong: var(--border-strong);
      --ease-out: cubic-bezier(0.16, 1, 0.3, 1);      /* spec §3.2 motion tokens */
      --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
    ```

    Add `--color-line: var(--line); --color-line-strong: var(--line-strong);` to `@theme inline`, **only if** those Tailwind colours are not already defined. They are: `--color-line` exists and maps to `--border`. So add the CSS custom properties only, and leave `@theme` alone.
  - Extend `tokens.test.ts` with a check that parses `globals.css` and asserts `--line`, `--line-strong`, `--ease-out` and `--ease-in-out` are declared. A later task's CSS must never reference an undefined token.
  - Add the utilities:

    ```css
    /* A raised card. Rebinds the label colour so 11px text on it keeps ≥ 5.4:1 (tokens.test.ts). */
    .raised { background: var(--bg-raised); --fg-subtle: var(--fg-subtle-raised); }

    /* Seams between the light theme and a dark stage (Plan 2 decision 1). Painted as the section's own
       edge so they add no element and no layout; invisible in the dark theme, where both sides are --bg. */
    .seam-top-dark, .seam-bottom-dark { position: relative; }
    .seam-top-dark::before, .seam-bottom-dark::after { content: ""; position: absolute; inset-inline: 0; height: 96px; pointer-events: none; z-index: 0; }
    .seam-top-dark::before { top: 0; background: linear-gradient(to bottom, var(--seam-edge, transparent), transparent); }
    .seam-bottom-dark::after { bottom: 0; background: linear-gradient(to top, var(--seam-edge, transparent), transparent); }
    [data-theme="light"] .seam-top-dark, [data-theme="light"] .seam-bottom-dark { --seam-edge: #f5f6f8; }
    ```

    - The seams belong to a dark section. `[data-theme="light"]` is matched on `<html>`, so in the light theme each seam fades from the light paper into the dark stage.
    - In the dark theme `--seam-edge` is transparent and the seam is invisible.
    - They are pseudo-elements, so they add no DOM, no layout and no conflict when a section carries both classes.
    - Content sits above them: give the direct children `position: relative; z-index: 1`. This holds for the Work stage and Contact.

- [ ] **Step 4: Mirror the values in `lib/tokens.ts`:** add `bgLight: "#f5f6f8"`, `fgLight: "#0b0e14"`, `accentLight: "#1459d9"` and `fgSubtleRaised: "#8089a0"`.

- [ ] **Step 5: Run** the token test (PASS), then the full gate.
  - Screenshot the site in the light theme with `npm run shoot -- --out shots/t2 --theme light --sizes 1440x900 --entrance 1 --sections work,about,skills,contact`.
  - The entrance and Hero must be unchanged (dark).
  - The August sections render in the new light palette.

- [ ] **Step 6: Commit:** "Light-theme tokens, raised-label contrast floor and dark-stage seams, pinned by a stylesheet-parsing test".

---

### Task 3: Idle-loop discipline — Lenis runs only while scrolling

**Files:**
- Modify: `components/providers/SmoothScroll.tsx`
- Test: `tests/e2e/idle.spec.ts`

**Interfaces:**
- Consumes: the Lenis 1.3 API: `new Lenis(opts)`, `lenis.raf(t)`, `lenis.isScrolling` (`false | "native" | "smooth"`), `lenis.on("scroll", cb)`, `lenis.destroy()`.
- Produces: no always-on rAF loop. Any later loop (GRAVITY FLOW only) must be in view and gated.

- [ ] **Step 1: Write the failing test**

```ts
// tests/e2e/idle.spec.ts — spec §9 "Idle work": 0 animation-frame loops when nothing loops in view.
import { test, expect, type Page } from "playwright/test";

const countRaf = async (page: Page, ms: number) => page.evaluate(async (ms) => {
  let n = 0; const orig = window.requestAnimationFrame;
  window.requestAnimationFrame = (cb) => orig((t) => { n++; cb(t); });
  await new Promise((r) => setTimeout(r, ms));
  window.requestAnimationFrame = orig; return n;
}, ms);

test("no animation-frame loop runs once scrolling settles at the bottom of the page", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" as ScrollBehavior }));
  await page.waitForTimeout(1200);  // let Lenis and any reveals finish
  expect(await countRaf(page, 1000)).toBe(0);
});

test("wheel scrolling still animates smoothly (the loop restarts on input)", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.mouse.move(700, 450);
  const before = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, 600); await page.waitForTimeout(700);
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(before + 300);
});
```

  Counting wraps `requestAnimationFrame` *after* settling. An already-scheduled self-rescheduling loop is counted when it calls the wrapped function again, so a live loop reads ≥ 50 per second.

- [ ] **Step 2: Run** `npm run build && … npx playwright test tests/e2e/idle.spec.ts`. Expected: the first test FAILS (about 60 per second from Lenis's perpetual loop).

- [ ] **Step 3: Implement.** Replace the loop in `SmoothScroll.tsx`:

```tsx
    // The loop runs only while Lenis is actually moving. Input restarts it; when the scroll settles
    // it stops, so an idle page schedules no animation frames at all (spec §9 "Idle work").
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = lenis.isScrolling ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => { if (!raf && !document.hidden) raf = requestAnimationFrame(loop); };
    const inputs = ["wheel", "touchstart", "touchmove", "keydown", "pointerdown"] as const;
    for (const e of inputs) window.addEventListener(e, kick, { passive: true });
    window.addEventListener("scroll", kick, { passive: true });   // programmatic and anchor scrolls
    lenis.on("scroll", kick);
    kick();

    const onVisibility = () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else kick(); };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      for (const e of inputs) window.removeEventListener(e, kick);
      window.removeEventListener("scroll", kick);
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
```

  Lenis registers its own wheel listener in its constructor, before ours, so its target is already set when `kick` schedules the first frame.

  If `isScrolling` reads `false` on the very first frame after a wheel event, the loop would stop too early. The second test catches that. In that case keep the loop alive for 2 extra frames:

  ```ts
  let grace = 2; … raf = lenis.isScrolling || grace-- > 0 ? … : (grace = 2, 0)
  ```

  Record that in the ledger.

- [ ] **Step 4: Run** the idle tests (PASS), then the entrance suites (`entrance.spec.ts`, `entrance-geometry.spec.ts`): Lenis drives the entrance scroll, so they must stay green. Then the full gate.

- [ ] **Step 5: Commit:** "SmoothScroll: run Lenis's frame loop only while scrolling (0 idle rAF)".

---

### Task 4: Nav and chrome — availability, links, palette, floating controls

**Files:**
- Modify: `components/layout/Navbar.tsx`, `components/ui/CommandPalette.tsx`, `components/ui/AccessibilityPanel.tsx`, `components/ui/AIChatWidget.tsx`, `components/entrance/EntranceStage.tsx` (one listener), `components/entrance/entrance.css`
- Test: `tests/e2e/chrome.spec.ts`

**Interfaces:**
- Consumes: `availability` (`data/socials.ts`); the `html[data-entrance-done]` attribute; `skipIntro()` inside `EntranceStage`.
- Produces:
  - the window event `entrance:skip`, which any UI can dispatch to land on the hero at identity with focus on the `h1`;
  - the `[data-floating-control]` attribute on the accessibility and chat launchers;
  - palette sections `hero`, `work`, `about`, `skills`, `approach`, `contact`.

- [ ] **Step 1: Write the failing tests**

```ts
// tests/e2e/chrome.spec.ts
import { test, expect } from "playwright/test";

test("desktop nav: TS · Work · About · Stack · Contact · availability pill, palette and theme buttons", async ({ page }) => {
  await page.goto("/"); await page.locator("[data-skip-intro]").click();
  const nav = page.locator("header[data-entrance-nav] nav");
  for (const l of ["Work", "About", "Stack", "Contact"]) await expect(nav.getByRole("link", { name: l, exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: /Available for work/ })).toHaveAttribute("href", "#contact");
  await expect(nav.getByRole("button", { name: /command palette/i })).toBeVisible();
  await expect(nav.getByRole("button", { name: /theme|light mode|dark mode/i })).toBeVisible();
});

test("below lg: TS, the availability dot (with text for screen readers) and the menu button", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/"); await page.locator("[data-skip-intro]").click();
  await expect(page.locator("header[data-entrance-nav] [data-availability-dot]")).toBeVisible();
  await expect(page.locator("header[data-entrance-nav] [data-availability-dot]")).toHaveAccessibleName(/Available for work/);
  await page.getByRole("button", { name: "Open menu" }).click();
  const sheet = page.getByRole("dialog");
  for (const l of ["Work", "About", "Stack", "Contact"]) await expect(sheet.getByRole("link", { name: l, exact: true })).toBeVisible();
});

test("mobile sheet: keyboard reaches the theme toggle and palette, Escape restores focus (spec §10)", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/"); await page.locator("[data-skip-intro]").click();
  const menu = page.getByRole("button", { name: "Open menu" });
  await menu.focus(); await page.keyboard.press("Enter");
  const sheet = page.getByRole("dialog"); await expect(sheet).toBeVisible();
  const reached: string[] = [];
  for (let i = 0; i < 14; i++) { await page.keyboard.press("Tab"); reached.push((await page.evaluate(() => document.activeElement?.getAttribute("aria-label") ?? document.activeElement?.textContent ?? "")).trim()); }
  expect(reached.some((r) => /theme|light mode|dark mode/i.test(r))).toBe(true);
  expect(reached.some((r) => /palette|search/i.test(r))).toBe(true);
  await page.keyboard.press("Escape"); await expect(sheet).toBeHidden(); await expect(menu).toBeFocused();
});

test("floating controls hide during the entrance and appear at the portal", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-floating-control]").first()).toBeHidden();
  await page.locator("[data-skip-intro]").click();
  await expect(page.locator("[data-floating-control]").first()).toBeVisible();
});

test("static mode shows the floating controls from first paint", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" }); const page = await ctx.newPage();
  await page.goto("/");
  await expect(page.locator("[data-floating-control]").first()).toBeVisible();
  await ctx.close();
});

test("palette 'Home' lands on the hero at identity with the h1 focused (the removed #top regression)", async ({ page }) => {
  await page.goto("/"); await page.locator("[data-skip-intro]").click();
  // Start from a focused control far down the page, as a keyboard user would: the trap restores focus
  // here on close, and Home must still win.
  await page.locator("footer a").first().focus();
  await page.keyboard.press("Control+k");
  await page.getByRole("option", { name: "Home" }).click();
  await expect(page.locator("#hero-title")).toBeFocused();
  await expect(page.locator("#hero-title")).toBeInViewport();
});

test("every palette section target exists", async ({ page }) => {
  await page.goto("/");
  for (const id of ["hero", "work", "about", "skills", "approach", "contact"]) await expect(page.locator(`#${id}`)).toHaveCount(1);
});
```

  - The palette's option role and name come from `CommandPalette.tsx`. If it renders `role="option"` under another name, match the component's real accessible names; the command labels stay the ones given in Step 4.
  - `#approach` and the new `#skills` exist only after Tasks 19 and 20. Until then, the last test runs on `hero`, `work`, `about`, `skills`, `approach` and `contact` as the August sections provide them (`EngineeringPanel` already has `id="approach"`). It must stay green through every later task.

- [ ] **Step 2: Run** the tests. Expected: FAIL (the availability pill, the dot, `data-floating-control` and palette Home).

- [ ] **Step 3: Update the Navbar.**
  - Replace the desktop "Get in touch" `ButtonLink` with:

    ```tsx
    <a href="#contact" className="label inline-flex h-9 items-center gap-2 rounded-full border border-line px-3.5 text-fg-muted hover:text-fg">
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--status-live)]" />
      {availability.open ? "Available for work" : "Contact"}
    </a>
    ```

  - Below `lg`, before the menu button:

    ```tsx
    <a href="#contact" data-availability-dot aria-label="Available for work — contact" className="inline-flex h-11 w-11 items-center justify-center rounded-full">
      <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[var(--status-live)]" />
    </a>
    ```

    Render both only when `availability.open`.
  - **Mobile sheet.** Spec §5 requires the links, the theme toggle, the palette and "Get in touch" inside it. Today it has only the links and "Get in touch", and the theme toggle sits in the header outside the focus trap. Inside the sheet's dialog, after the links, add:

    ```tsx
    <div className="mt-6 flex items-center gap-3 border-t border-line pt-6">
      <ThemeToggle />
      <IconButton label="Open command palette" onClick={() => { setOpen(false); window.dispatchEvent(new CustomEvent("palette:open")); }}>
        <SearchIcon size={18} />
      </IconButton>
    </div>
    ```

    `setOpen` is the sheet's existing state setter. Check its real name in `Navbar.tsx`; the header palette button already dispatches `palette:open`, at line ~77. Keep the header's own `ThemeToggle` for the closed state.
  - `LINKS` already reads Work, About, Stack, Contact (Plan 1).

- [ ] **Step 4: Update the command palette `SECTIONS`:**

```ts
const SECTIONS = [
  { id: "hero", label: "Home" },
  { id: "work", label: "Work" },
  { id: "about", label: "About" },
  { id: "skills", label: "Stack" },
  { id: "approach", label: "Think · Build · Ship" },
  { id: "contact", label: "Contact" },
];
```

  In `go`:
  - for `hero`, call `close()`, then dispatch **after** the focus trap has restored focus: `setTimeout(() => window.dispatchEvent(new Event("entrance:skip")), 0)`. `useFocusTrap`'s cleanup refocuses the previously focused element; dispatching first would let that pull focus, and the scroll, back.
  - otherwise keep `scrollIntoView`.

- [ ] **Step 5: Add the listener in `EntranceStage`.** It is the one Plan 1 runtime change. In the effect, beside `onHash`:

```ts
    const onSkip = () => skipIntro();
    window.addEventListener("entrance:skip", onSkip);
    // …and in cleanup:
    window.removeEventListener("entrance:skip", onSkip);
```

  In static mode (the `reduced` branch, which returns early) the hero is in flow, so also add a static-mode listener: an effect that runs only when `reduced` is true.

  ```ts
  useEffect(() => {
    if (!reduced) return;
    const f = () => { document.getElementById("hero")?.scrollIntoView(); document.getElementById("hero-title")?.focus(); };
    window.addEventListener("entrance:skip", f);
    return () => window.removeEventListener("entrance:skip", f);
  }, [reduced]);
  ```

- [ ] **Step 6: Floating controls.**
  - Add `data-floating-control` to the root wrappers of the `AccessibilityPanel` and `AIChatWidget` launchers.
  - In `entrance.css`:

    ```css
    /* Spec §5: the floating buttons stay hidden until the entrance completes; static mode shows them at once. */
    html:not([data-entrance-done="true"]) [data-floating-control] { visibility: hidden; }
    ```

  - Static mode sets `data-entrance-done="true"` on mount (Plan 1). To avoid a first-paint flash in static mode, also add:

    ```css
    @media (prefers-reduced-motion: reduce) { html [data-floating-control] { visibility: visible !important; } }
    [data-reduced-motion="true"] [data-floating-control] { visibility: visible !important; }
    ```

- [ ] **Step 7: Run** `chrome.spec.ts` (PASS), then `entrance.spec.ts` and `entrance-geometry.spec.ts` (PASS, unchanged), then the full gate and `npm run measure`. Record the JS delta; expect under +0.5 KB.

- [ ] **Step 8: Commit:** "Nav availability, palette Home via entrance:skip, floating controls hidden until the portal".

---

### Task 5: The scene primitive — pinning, progress vars, settled fallback

**Files:**
- Create: `lib/scene.ts`, `components/scenes/ScrollScene.tsx`, `components/scenes/scene.css`
- Test: `tests/unit/scene.test.ts`, `tests/e2e/scene.spec.ts`

**Interfaces:**
- Consumes: `segment`, `easeOut`, `easeInOut` (`lib/timeline.ts`); `useReducedMotionPref` (Plan 1 fix: subscribes to OS changes).
- Produces:

  ```ts
  export const PIN_MIN: { readonly w: 1024; readonly h: 600 };
  export function pinEligible(vw: number, vh: number, reduced: boolean): boolean;
  export type ScenePhases = { assemble: number; hold: number; recede: number };
  export function scenePhases(p: number): ScenePhases;          // 0–.30 assemble (easeOut), .30–.70 hold (linear), .70–1 recede (easeInOut)
  export function pillarState(p: number): { lit: 0 | 1 | 2; line: number };
  ```

  - The component: `<ScrollScene id labelledBy className? dark? pinSvh=200 phases="flagship"|"pillars">`.
  - It renders `<section class="scene" data-scene data-pinned="true|false" data-inview="true|false">`, with its children inside `.scene__stage`.
  - When pinned, it writes the CSS vars `--p`, `--assemble`, `--hold`, `--recede` (flagship) or `--p`, `--tbs-line` (pillars) on the section, plus `data-lit` in pillars mode.
  - When not pinned, it removes every var and `data-lit`, and the CSS defaults give the settled composition: `--assemble: 1; --hold: .5; --recede: 0; --tbs-line: 1`.
  - The pillar hairline variable is deliberately **not** `--line`, which is the hairline colour token (Task 2).

- [ ] **Step 1: Write the failing unit test**

```ts
// tests/unit/scene.test.ts
import { describe, it, expect } from "vitest";
import { pinEligible, scenePhases, pillarState, PIN_MIN } from "@/lib/scene";

describe("pinEligible", () => {
  it("pins only at ≥ 1024×600 with motion allowed", () => {
    expect(pinEligible(1024, 600, false)).toBe(true);
    expect(pinEligible(1023, 800, false)).toBe(false);   // portrait tablets, phones
    expect(pinEligible(1366, 599, false)).toBe(false);   // short landscape
    expect(pinEligible(1440, 900, true)).toBe(false);    // reduced motion, either source
    expect(PIN_MIN).toEqual({ w: 1024, h: 600 });
  });
});
describe("scenePhases", () => {
  it("assembles over 0–.30, holds .30–.70, recedes .70–1, clamped and monotonic", () => {
    expect(scenePhases(0)).toEqual({ assemble: 0, hold: 0, recede: 0 });
    expect(scenePhases(0.3).assemble).toBe(1);
    expect(scenePhases(0.5).hold).toBeCloseTo(0.5);
    expect(scenePhases(0.7)).toMatchObject({ assemble: 1, hold: 1, recede: 0 });
    expect(scenePhases(1)).toEqual({ assemble: 1, hold: 1, recede: 1 });
    expect(scenePhases(-1)).toEqual(scenePhases(0)); expect(scenePhases(2)).toEqual(scenePhases(1));
    let prev = -1; for (let p = 0; p <= 1; p += 0.01) { const r = scenePhases(p).recede; expect(r).toBeGreaterThanOrEqual(prev); prev = r; }
  });
});
describe("pillarState", () => {
  it("lights Think, Build, Ship in turn as the hairline travels", () => {
    expect(pillarState(0)).toEqual({ lit: 0, line: 0 });
    expect(pillarState(0.5).lit).toBe(1);
    expect(pillarState(0.95)).toEqual({ lit: 2, line: 1 });
  });
});
```

- [ ] **Step 2: Run it.** Expected: FAIL (module missing).

- [ ] **Step 3: Implement `lib/scene.ts`**

```ts
import { segment, easeOut, easeInOut, linear } from "@/lib/timeline";

/** Spec §5: scenes pin only at ≥ 1024 × 600 with motion allowed. */
export const PIN_MIN = { w: 1024, h: 600 } as const;
export const pinEligible = (vw: number, vh: number, reduced: boolean) => !reduced && vw >= PIN_MIN.w && vh >= PIN_MIN.h;

export type ScenePhases = { assemble: number; hold: number; recede: number };
/** A flagship scene over its 200svh container (spec §5.2): the world assembles, holds, then recedes. */
export const scenePhases = (p: number): ScenePhases => ({
  assemble: segment(p, 0, 0.3, easeOut), hold: segment(p, 0.3, 0.7, linear), recede: segment(p, 0.7, 1, easeInOut),
});

/** Think/Build/Ship (spec §5.5): the hairline travels 10–90%; each third lights the next word. */
export function pillarState(p: number): { lit: 0 | 1 | 2; line: number } {
  const line = segment(p, 0.1, 0.9, linear);
  return { lit: (line < 1 / 3 ? 0 : line < 2 / 3 ? 1 : 2) as 0 | 1 | 2, line };
}
```

  `segment` already clamps and throws on an empty range (Plan 1); `linear` is exported from `lib/timeline.ts`. Run the test: PASS.

- [ ] **Step 4: Write `scene.css`**

```css
/* A scroll scene (spec §5): pinned 200svh at ≥1024×600 with motion allowed, otherwise a settled,
   full-height composition. The CSS defaults ARE the settled state, so no-JS, reduced motion and
   small screens need no script at all. */
.scene { position: relative; --p: 1; --assemble: 1; --hold: 0.5; --recede: 0; --tbs-line: 1; }
.scene__stage { position: relative; min-height: 100svh; display: grid; align-items: center; }
@media (min-width: 1024px) and (min-height: 600px) and (prefers-reduced-motion: no-preference) {
  html:not([data-reduced-motion="true"]) .scene { height: var(--pin-h, 200svh); }
  html:not([data-reduced-motion="true"]) .scene__stage { position: sticky; top: 0; height: 100svh; overflow: clip; }
}
```

  `.scene` sets the defaults, and the inline vars written by JS override them only while the scene is pinned. The JS removes them when pinning stops (Step 5), so the defaults take over again. There is no `!important` race with static mode. This is the Plan 1 lesson: the static rules must win the moment they apply.

- [ ] **Step 5: Implement `ScrollScene.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { pinEligible, scenePhases, pillarState } from "@/lib/scene";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";
import "./scene.css";

const VARS = ["--p", "--assemble", "--hold", "--recede", "--tbs-line"];

/**
 * The one client primitive behind every scroll-driven section. It writes progress into CSS vars
 * only while the scene is pinned; the world's CSS turns them into transform/opacity. Nothing
 * re-renders per frame, and the settled composition is the CSS default (scene.css).
 */
export function ScrollScene({ id, labelledBy, className, dark = false, pinSvh = 200, phases = "flagship", children }: {
  id?: string; labelledBy: string; className?: string; dark?: boolean; pinSvh?: number;
  phases?: "flagship" | "pillars"; children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotionPref();
  const [pinned, setPinned] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // Re-evaluated live: resize across the threshold and either reduced-motion source (Review Focus 2, 3).
  useEffect(() => {
    const check = () => setPinned(pinEligible(window.innerWidth, window.innerHeight, reduced));
    check(); window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [reduced]);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    el.dataset.pinned = String(pinned);
    if (!pinned) { for (const v of VARS) el.style.removeProperty(v); delete el.dataset.lit; }
    else write(scrollYProgress.get());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinned]);

  // One-shot in-view flag for reveals and the GRAVITY FLOW loop gate.
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { el.dataset.inview = String(e.isIntersecting); }, { threshold: 0.15 });
    io.observe(el); return () => io.disconnect();
  }, []);

  function write(p: number) {
    const el = ref.current; if (!el) return;
    el.style.setProperty("--p", p.toFixed(4));
    if (phases === "flagship") {
      const s = scenePhases(p);
      el.style.setProperty("--assemble", s.assemble.toFixed(4)); el.style.setProperty("--hold", s.hold.toFixed(4)); el.style.setProperty("--recede", s.recede.toFixed(4));
    } else {
      const s = pillarState(p);
      el.style.setProperty("--tbs-line", s.line.toFixed(4)); el.dataset.lit = String(s.lit);
    }
  }
  useMotionValueEvent(scrollYProgress, "change", (p) => { if (pinned) write(p); });

  return (
    <section ref={ref} id={id} aria-labelledby={labelledBy} data-scene data-pinned="false" data-theme={dark ? "dark" : undefined}
      className={["scene", className].filter(Boolean).join(" ")} style={{ ["--pin-h" as string]: `${pinSvh}svh` }}>
      <div className="scene__stage">{children}</div>
    </section>
  );
}
```

  - `write` is a plain function declared in the component body and called only from effects and events. If the React Compiler lint flags it, as Plan 1's stage was flagged, move it and the vars logic into the effect and reach it through a ref, exactly as Plan 1 D1 did.
  - Keep `children` server-rendered: they are passed through, and server components can be children of a client component.

- [ ] **Step 6: Write the scene e2e test** against a test fixture. The fixture is needed because no real scene exists yet. Create `app/e2e-fixtures/scene/page.tsx`. It is **not** `app/__…`: underscore folders are private in the App Router and never route. It 404s unless the server runs with `E2E_FIXTURES=1`:

```tsx
// Test fixture for ScrollScene (Plan 2 Task 5). 404s unless the server runs with E2E_FIXTURES=1.
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { ScrollScene } from "@/components/scenes/ScrollScene";
export const metadata = { robots: { index: false, follow: false } };
export default async function Page() {
  await connection();                          // request-time: read the env of the running server, not the build
  if (process.env.E2E_FIXTURES !== "1") notFound();
  return (
    <main>
      <div style={{ height: "100svh" }} />
      <ScrollScene id="fx" labelledBy="fx-t"><h2 id="fx-t">Fixture</h2><div data-probe style={{ transform: "translateY(calc((1 - var(--assemble)) * 100px))" }}>probe</div></ScrollScene>
      <div style={{ height: "100svh" }} />
    </main>
  );
}
```

  - Set `E2E_FIXTURES=1` in the Playwright `webServer.env`.
  - `await connection()` (Next 15+; confirm it in `node_modules/next/dist/docs` before use) makes the check run per request, so the same build serves the fixture under e2e and 404s in production.
  - `app/sitemap.ts` must not list it. Add an assertion to the Task 23 dead-code test that the sitemap has no `e2e-fixtures` URL.

```ts
// tests/e2e/scene.spec.ts
import { test, expect } from "playwright/test";
const probeY = (page: import("playwright/test").Page) => page.locator("[data-probe]").evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m42);

test("pins at 1440×900 and drives --assemble from scroll", async ({ page }) => {
  await page.goto("/e2e-fixtures/scene");
  await expect(page.locator("#fx")).toHaveAttribute("data-pinned", "true");
  await expect(page.locator("#fx .scene__stage")).toHaveCSS("position", "sticky");
  await page.evaluate(() => window.scrollTo({ top: document.getElementById("fx")!.getBoundingClientRect().top + scrollY, behavior: "instant" as ScrollBehavior }));
  await expect.poll(() => probeY(page)).toBeGreaterThan(90);   // p = 0 → assemble 0 → 100px
});

test("resizing below the threshold unpins live and clears every var (Review Focus 2)", async ({ page }) => {
  await page.goto("/e2e-fixtures/scene");
  await page.evaluate(() => window.scrollTo({ top: document.getElementById("fx")!.getBoundingClientRect().top + scrollY, behavior: "instant" as ScrollBehavior }));
  await page.setViewportSize({ width: 900, height: 700 });
  await expect(page.locator("#fx")).toHaveAttribute("data-pinned", "false");
  await expect(page.locator("#fx .scene__stage")).toHaveCSS("position", "relative");
  expect(await page.locator("#fx").evaluate((el) => el.getAttribute("style") ?? "")).not.toMatch(/--assemble/);
  await expect.poll(() => probeY(page)).toBe(0);                // settled composition
});

test("reduced motion mid-scene settles it (Review Focus 3)", async ({ page }) => {
  await page.goto("/e2e-fixtures/scene");
  await page.evaluate(() => window.scrollTo({ top: document.getElementById("fx")!.getBoundingClientRect().top + scrollY, behavior: "instant" as ScrollBehavior }));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("#fx")).toHaveAttribute("data-pinned", "false");
  await expect.poll(() => probeY(page)).toBe(0);
});

test("no JavaScript: settled composition, not pinned", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false }); const page = await ctx.newPage();
  await page.goto("/e2e-fixtures/scene");
  // Without JS the CSS still pins (media query) but the defaults are the settled state; the stage is legible.
  expect(await probeY(page)).toBe(0);
  await ctx.close();
});
```

  A note on no-JS: the CSS pin applies without JS, but with the settled defaults the scene simply holds its final composition for 200svh. **Decision:** without JS, scenes must not pin at all, or a visitor scrolls 100svh through a frozen frame. Enforce it with the Plan 1 `<noscript>` pattern. Add to the root layout's existing `<noscript>`, or a new one in `app/page.tsx`:

  ```html
  <noscript><style>{`.scene{height:auto!important}.scene__stage{position:relative!important;height:auto!important}`}</style></noscript>
  ```

  Extend the last test to assert `position: relative` on `.scene__stage`.

- [ ] **Step 7: Run** the unit and e2e tests (PASS), then the full gate and `npm run measure`. Record the delta; `ScrollScene` should cost under 1 KB, since Framer's `useScroll` is already in the bundle.

- [ ] **Step 8: Commit:** "Add ScrollScene: CSS-var scroll scenes that pin only at ≥1024×600 with motion allowed".

---
### Task 6: Render pipeline upgrade — light groups, EXR passes, compositor, quality tiers, `audit.py`

**Files:**
- Create: `design/render/blender/audit.py`, `design/render/blender/test_audit.py`
- Modify: `design/render/blender/render.py`, `design/render/blender/scene.py` (object names only; tag the groups), `design/render/blender/camera_path.py` (shot names), `package.json` (`render:lookdev`, `render:final`, `render:audit`)

**Interfaces:**
- Consumes: `build_scene(out_dir, lid_deg, screen_on) -> {"scene","screen","hinge"}`; `SEQUENCE`, `frame_state`, `screen_faces_camera` (`camera_path.py`).
- Produces:
  - `render.py --quality preview|lookdev|final --framing landscape|portrait|all [--names a,b] [--exr] [--out DIR]`. It writes `DIR/<framing>/<name>.png` and `.json`. The JSON is `{p, quad|null, shot, laptop_bbox, corner_coc_px, spp, weights}`. With `--exr` it also writes `DIR/<framing>/<name>/lg_<group>.exr` and `mist.exr`.
  - `audit.py <frame.png> [--kind K0|lid|K1off|K1on|push|K2|P0|P1|P2]` prints a JSON report and exits 1 on any failed assertion.
  - `LIGHT_GROUPS`, a prefix → group table, in `render.py`.

- [ ] **Step 1: Write the failing audit tests.** These run on synthetic images under the `bpyenv` interpreter, which has numpy; system Python does not.

```python
# design/render/blender/test_audit.py — run: bpyenv/bin/python -m unittest design/render/blender/test_audit.py
import unittest
import numpy as np
from audit import srgb_to_lum, title_zone_p95, black_floor_share, violet_share, off_lock_share, median_lum, bottom_rows_black, group_shares, width_share, pass_group

def img(rgb, h=90, w=160):
    a = np.zeros((h, w, 3), np.float32); a[:] = np.array(rgb, np.float32) / 255; return a

class Audit(unittest.TestCase):
    def test_luminance_endpoints(self):
        self.assertAlmostEqual(float(srgb_to_lum(img((255, 255, 255))).mean()), 1.0, 3)
        self.assertAlmostEqual(float(srgb_to_lum(img((0, 0, 0))).mean()), 0.0, 3)
    def test_title_zone_uses_the_centre_band_only(self):
        a = img((10, 12, 16)); a[:5] = 1.0                    # bright top rows are outside 40–54%
        self.assertLess(title_zone_p95(a), 0.15)
        a[40:48, 60:100] = 1.0                                 # a bright block inside the zone
        self.assertGreater(title_zone_p95(a), 0.15)
    def test_black_floor(self):
        self.assertAlmostEqual(black_floor_share(img((5, 7, 10))), 1.0)
        self.assertAlmostEqual(black_floor_share(img((30, 34, 40))), 0.0)
    def test_violet_and_hue_lock(self):
        a = img((12, 14, 20)); a[:9, :16] = np.array((140, 100, 255)) / 255   # 1% violet
        self.assertAlmostEqual(violet_share(a), 0.01, 3)
        b = img((12, 14, 20)); b[:9, :16] = np.array((40, 220, 60)) / 255      # saturated green
        self.assertAlmostEqual(off_lock_share(b), 0.01, 3)
        c = img((12, 14, 20)); c[:9, :16] = np.array((91, 156, 255)) / 255     # ice — inside the lock
        self.assertEqual(off_lock_share(c), 0.0)
    def test_median_and_bottom_rows(self):
        self.assertTrue(0.0 < median_lum(img((60, 64, 70))) < 0.1)
        a = img((40, 44, 50)); a[-3:] = np.array((5, 7, 10)) / 255
        self.assertTrue(bottom_rows_black(a))
    def test_group_shares_mask_emitters(self):
        g = {"lg_key": np.full((10, 10, 3), 0.8, np.float32), "lg_monitors": np.full((10, 10, 3), 0.1, np.float32), "lg_warm": np.full((10, 10, 3), 0.1, np.float32)}
        s = group_shares(g)
        self.assertAlmostEqual(s["atmosphere"], 0.8, 3); self.assertAlmostEqual(s["screens"], 0.1, 3); self.assertAlmostEqual(s["warm"], 0.1, 3)
    def test_width_share(self):
        self.assertAlmostEqual(width_share({"x0": 0.25, "x1": 0.52}), 0.27)
    def test_pass_group_names(self):
        self.assertEqual(pass_group("Combined_lg_key.exr"), "lg_key")
        self.assertEqual(pass_group("Combined_lg_monitors0001.exr"), "lg_monitors")
        self.assertIsNone(pass_group("Mist0001.exr")); self.assertIsNone(pass_group("notes.txt"))

if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Run** `cd design/render/blender && ../../../bpyenv/bin/python -m unittest test_audit`. Expected: FAIL (`No module named audit`).

- [ ] **Step 3: Implement `audit.py`.** It is pure numpy, reading PNGs through Blender's image loader only in `main()`.

```python
"""Spec §4.6 assertions for a rendered key frame. Pure numpy; main() loads images via bpy.

Thresholds are the spec's. Where the APPROVED preview composition (K0/K1/K2, 2026-09-25) measures
differently from a spec target, Task 6 Step 6 calibrates the target to the approved value and logs it:
the approval supersedes a pre-approval number, never the other way round.
"""
import json, os, sys
import numpy as np

ATMOS = ("lg_world", "lg_bias", "lg_key", "lg_card", "lg_sweep", "lg_backlight", "lg_practical")
SCREENS = ("lg_monitors", "lg_screen")
FLOOR = np.array((5, 7, 10)) / 255


def srgb_to_lum(a):
    c = np.where(a <= 0.04045, a / 12.92, ((a + 0.055) / 1.055) ** 2.4)
    return 0.2126 * c[..., 0] + 0.7152 * c[..., 1] + 0.0722 * c[..., 2]


def _hsv(a):
    mx, mn = a.max(-1), a.min(-1); d = mx - mn + 1e-9
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    h = np.where(mx == r, (g - b) / d % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    s = np.where(mx > 0, (mx - mn) / (mx + 1e-9), 0)
    return h, s, mx


def title_zone_p95(a):
    """Centred zone: 40–54% of the height, 36% of the width (spec §4.6 title quiet zone)."""
    H, W = a.shape[:2]
    z = a[int(H * 0.40):int(H * 0.54), int(W * 0.32):int(W * 0.68)]
    return float(np.percentile(srgb_to_lum(z), 95))


def black_floor_share(a):
    return float((np.abs(a - FLOOR).max(-1) <= 2 / 255).mean())


def violet_share(a):
    h, s, v = _hsv(a)
    return float(((h >= 245) & (h <= 290) & (s > 0.35) & (v > 0.2)).mean())


def off_lock_share(a):
    """Saturated pixels outside the cool band (185–235°) and the one amber (20–45°), violet counted separately."""
    h, s, v = _hsv(a)
    sat = (s > 0.5) & (v > 0.25)
    ok = ((h >= 185) & (h <= 235)) | ((h >= 20) & (h <= 45)) | ((h >= 245) & (h <= 290))
    return float((sat & ~ok).mean())


def median_lum(a, mask=None):
    l = srgb_to_lum(a)
    return float(np.median(l[mask] if mask is not None else l))


def bottom_rows_black(a):
    """True if any row in the bottom 5% sits at the black floor (K0 forbids it)."""
    H = a.shape[0]
    rows = a[H - max(1, int(H * 0.05)):]
    return bool((np.abs(rows - FLOOR).max(-1) <= 2 / 255).all(-1).any())


def group_shares(groups):
    """Energy share per class over non-emissive pixels (emitters masked where screens dominate)."""
    tot = sum(g.sum(-1) for g in groups.values()) + 1e-9
    scr = sum(groups[k].sum(-1) for k in SCREENS if k in groups)
    mask = (scr / tot) < 0.5
    e = {k: float(v.sum(-1)[mask].sum()) for k, v in groups.items()}
    T = sum(e.values()) + 1e-9
    return {"atmosphere": sum(e.get(k, 0) for k in ATMOS) / T, "screens": sum(e.get(k, 0) for k in SCREENS) / T,
            "warm": e.get("lg_warm", 0) / T, "mask_share": float(mask.mean())}


def width_share(bbox):
    return round(bbox["x1"] - bbox["x0"], 4)


def pass_group(filename):
    """'Combined_lg_key0001.exr' / 'Combined_lg_key.exr' → 'lg_key'; anything else → None.
    Blender's File Output node names files after the item and may append the frame number."""
    import re
    m = re.fullmatch(r"Combined_(lg_[a-z]+)\d*\.exr", filename)
    return m.group(1) if m else None


# kind → list of (name, value_fn(report) -> float, lo, hi). Calibrated targets are loaded from
# targets.json (Step 6) and override these spec defaults key by key.
SPEC = {
    "K0": [("laptop_width", 0.25, 0.29), ("title_p95", 0, 0.15), ("black_floor", 0, 0.05), ("violet", 0, 0.002),
           ("off_lock", 0, 0.003), ("median_atmos", 0.05, 0.08), ("atmos_share", 0.80, 0.88), ("screens_share", 0.08, 0.14), ("warm_share", 0.03, 0.06)],
    "lid": [("title_p95", 0, 0.15), ("violet", 0, 0.002), ("off_lock", 0, 0.003), ("atmos_share", 0.80, 0.88), ("warm_share", 0.03, 0.06)],
    "K1off": [("laptop_width", 0.44, 0.48), ("violet", 0, 0.002), ("off_lock", 0, 0.003), ("atmos_share", 0.80, 0.88), ("warm_share", 0, 0.03), ("corner_coc", 0, 1.0)],
    "K1on": [("laptop_width", 0.44, 0.48), ("violet", 0, 0.002), ("off_lock", 0, 0.003), ("warm_share", 0, 0.03), ("corner_coc", 0, 1.0)],
    "push": [("violet", 0, 0.002), ("off_lock", 0, 0.003), ("corner_coc", 0, 1.0), ("bokeh_p90", 0.10, 1.0)],
    "K2": [("violet", 0, 0.002), ("off_lock", 0, 0.003), ("corner_coc", 0, 1.0), ("warm_share", 0, 0.0001), ("bokeh_p90", 0.10, 1.0)],
    "P0": [("laptop_width", 0.40, 0.50), ("violet", 0, 0.002), ("off_lock", 0, 0.003), ("black_floor", 0, 0.05)],
    "P1": [("laptop_width", 0.80, 0.90), ("violet", 0, 0.002), ("off_lock", 0, 0.003), ("corner_coc", 0, 1.0)],
    "P2": [("violet", 0, 0.002), ("off_lock", 0, 0.003), ("corner_coc", 0, 1.0)],
}


def outside_quad_p90(a, quad):
    """K2/late push depth (look-dev note 4): the studio behind the laptop must still carry bokeh."""
    if quad is None: return 1.0
    H, W = a.shape[:2]
    ys, xs = np.mgrid[0:H, 0:W]; px, py = (xs + 0.5) / W, (ys + 0.5) / H
    inside = np.ones((H, W), bool)
    for i in range(4):
        a0, b0 = quad[i], quad[(i + 1) % 4]
        inside &= (b0["x"] - a0["x"]) * (py - a0["y"]) - (b0["y"] - a0["y"]) * (px - a0["x"]) >= 0
    out = srgb_to_lum(a)[~inside]
    return float(np.percentile(out, 90)) if out.size > H * W * 0.02 else 1.0   # screen fills the frame: n/a


def report(png, meta, groups, kind, targets):
    r = {"title_p95": title_zone_p95(png), "black_floor": black_floor_share(png), "violet": violet_share(png),
         "off_lock": off_lock_share(png), "bottom_black": bottom_rows_black(png),
         "laptop_width": width_share(meta["laptop_bbox"]) if meta.get("laptop_bbox") else None,
         "corner_coc": meta.get("corner_coc_px"), "bokeh_p90": outside_quad_p90(png, meta.get("quad"))}
    if groups:
        s = group_shares(groups); r.update({"atmos_share": s["atmosphere"], "screens_share": s["screens"], "warm_share": s["warm"]})
        tot = sum(g.sum(-1) for g in groups.values()) + 1e-9
        scr = sum(groups[k].sum(-1) for k in SCREENS if k in groups)
        r["median_atmos"] = median_lum(png, (scr / tot) < 0.5)
    fails = []
    for name, lo, hi in [(n, *targets.get(kind, {}).get(n, (lo, hi))) for n, lo, hi in SPEC[kind]]:
        v = r.get(name)
        if v is None: fails.append(f"{name}: not measured"); continue
        if not (lo <= v <= hi): fails.append(f"{name}={v:.4f} outside [{lo}, {hi}]")
    if kind == "K0" and r["bottom_black"]: fails.append("a bottom-5% row sits at the black floor")
    return r, fails


def main():
    import bpy  # noqa: F401 — only for image IO
    png_path, kind = sys.argv[1], sys.argv[sys.argv.index("--kind") + 1]
    load = lambda p: np.array(bpy.data.images.load(p).pixels[:], np.float32).reshape(-1, 4)
    im = bpy.data.images.load(png_path); W, H = im.size
    png = np.flipud(load(png_path).reshape(H, W, 4)[..., :3])
    meta = json.load(open(png_path[:-4] + ".json"))
    d = png_path[:-4]; groups = {}
    if os.path.isdir(d):
        for f in os.listdir(d):
            g = pass_group(f)
            if g: groups[g] = np.flipud(load(os.path.join(d, f)).reshape(H, W, 4)[..., :3])
    tpath = os.path.join(os.path.dirname(os.path.abspath(__file__)), "targets.json")
    targets = json.load(open(tpath)) if os.path.exists(tpath) else {}
    r, fails = report(png, meta, groups, kind, targets)
    print(json.dumps({"frame": png_path, "kind": kind, "report": r, "fails": fails}, default=float))
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
```

  Run the tests. Expected: PASS.

- [ ] **Step 4: Upgrade `render.py`.**
  - Replace `QUALITY`:

    ```python
    QUALITY = {"preview": {"landscape": (960, 540), "portrait": (540, 960), "spp": 16},
               "lookdev": {"landscape": (960, 540), "portrait": (540, 960), "spp": 64},
               "final": {"landscape": (1920, 1080), "portrait": (1080, 1920), "spp": 64}}
    PUSH_B_SPP = 96          # spec §4.6: f/2.0 bokeh meets small LEDs in the second half of the push
    PUSH_SPLIT = 12          # push frames j >= 12 are shot "push-b"
    ```

  - Light groups, keyed by object-name prefix. The world goes to `lg_world`, and emissive meshes follow their object:

    ```python
    LIGHT_GROUPS = [("L1_", "lg_bias"), ("L2_", "lg_bias"), ("shelfstrip", "lg_bias"), ("L4_", "lg_key"), ("L5_", "lg_key"),
                    ("L0_", "lg_key"), ("L6", "lg_key"), ("L7", "lg_card"), ("L8_", "lg_sweep"), ("lightbar_diff", "lg_key"),
                    ("mon_", "lg_monitors"), ("lap_screen", "lg_screen"), ("L9_", "lg_screen"), ("key_backlight", "lg_backlight"),
                    ("mech_halo", "lg_backlight"), ("t_", "lg_practical"), ("fan", "lg_practical"), ("led", "lg_practical"),
                    ("pad", "lg_practical"), ("lamp", "lg_warm"), ("opal", "lg_warm")]

    def assign_light_groups(scene, view_layer):
        for g in sorted({g for _, g in LIGHT_GROUPS} | {"lg_world"}):
            if g not in view_layer.lightgroups: view_layer.lightgroups.add(name=g)
        scene.world.lightgroup = "lg_world"
        for ob in scene.objects:
            for prefix, g in LIGHT_GROUPS:
                if ob.name.startswith(prefix): ob.lightgroup = g; break
    ```

    Before relying on the table, run `bpyenv/bin/python -c "…build_scene…; print(sorted(o.name for o in scene.objects))"` and rename objects in `scene.py` so that every emitter and light matches exactly one prefix. Examples: the laptop screen mesh becomes `lap_screen`; the monitor screens become `mon_c_screen`, `mon_r_screen`, `mon_l_screen`. Add a test to `test_camera_path.py`'s neighbour, `test_groups.py`, that runs under `bpyenv`: it builds the scene at K1-on and asserts that every light and every object with a non-zero emission strength has a `lightgroup`.

  - Per-beat weights, applied by scaling light energy and emission strength before the render (spec §4.6 "Light across the beats"):

    ```python
    def beat_weights(step):
        w = {g: 1.0 for _, g in LIGHT_GROUPS}; w["lg_world"] = 1.0
        if step["shot"] == "lid": w["lg_screen"] = 0.0
        if step["shot"] == "push":
            t = step["j"] / (step["n"] - 1)
            for g in w:
                if g not in ("lg_screen", "lg_backlight", "lg_card"): w[g] = 1 - 0.4 * t     # room recedes to ×0.6
            w["lg_warm"] = max(0.0, 1 - t / 0.85) if t < 1 else 0.0                              # exactly 0 at K2
        return w

    def apply_weights(scene, weights):
        # Scale each light datablock and each emissive material ONCE: several objects share a material
        # (e.g. the fan rings), and scaling per object would compound the weight.
        lights, mats = {}, {}
        for ob in scene.objects:
            k = weights.get(ob.lightgroup, 1.0)
            if ob.type == "LIGHT": lights[ob.data.name] = (ob.data, k)
            elif ob.type == "MESH":
                for slot in ob.material_slots:
                    if slot.material: mats[slot.material.name] = (slot.material, k)
        for data, k in lights.values(): data.energy *= k
        for m, k in mats.values():
            n = m.node_tree and m.node_tree.nodes.get("Principled BSDF")
            if n and k != 1.0: n.inputs["Emission Strength"].default_value *= k
    ```

    Materials are shared between objects of different groups only by accident. `test_groups.py` also asserts that no emissive material is used by two groups.

  - The compositor: bloom and mist haze in every quality tier, and EXR passes when `--exr` is set. This is the Blender 5 node-group API, verified in this container on 2026-09-26:

    ```python
    def setup_compositor(scene, view_layer, exr_dir=None):
        view_layer.use_pass_mist = True
        scene.world.mist_settings.start, scene.world.mist_settings.depth = 1.5, 2.0      # haze between 1.5 and 3.5 m
        ng = bpy.data.node_groups.new("comp", "CompositorNodeTree"); scene.compositing_node_group = ng
        ng.interface.new_socket("Image", in_out="OUTPUT", socket_type="NodeSocketColor")
        rl, out = ng.nodes.new("CompositorNodeRLayers"), ng.nodes.new("NodeGroupOutput")
        glare = ng.nodes.new("CompositorNodeGlare")
        glare.inputs["Type"].default_value = "Bloom"
        glare.inputs["Threshold"].default_value = 1.0; glare.inputs["Strength"].default_value = 0.12
        mix = ng.nodes.new("ShaderNodeMix"); mix.data_type = "RGBA"; mix.blend_type = "ADD"
        sock = {s.identifier: s for s in mix.inputs}
        ng.links.new(rl.outputs["Image"], glare.inputs["Image"])
        ng.links.new(glare.outputs["Image"], sock["A_Color"])
        ng.links.new(rl.outputs["Mist"], sock["Factor_Float"])
        sock["B_Color"].default_value = (0.043 * 0.12, 0.078 * 0.12, 0.133 * 0.12, 1)   # #0b1422 at ≤12%
        ng.links.new(next(o for o in mix.outputs if o.identifier == "Result_Color"), out.inputs[0])
        if exr_dir:
            # Files land as "<item name>[frame digits].exr", e.g. Combined_lg_key0001.exr; audit.pass_group parses exactly that.
            fo = ng.nodes.new("CompositorNodeOutputFile"); fo.directory = exr_dir + "/"; fo.file_name = ""
            fo.format.media_type = "IMAGE"; fo.format.file_format = "OPEN_EXR"; fo.format.color_depth = "32"; fo.format.exr_codec = "PIZ"
            for name in [o.name for o in rl.outputs if o.enabled and (o.name.startswith("Combined_lg_") or o.name == "Mist")]:
                fo.file_output_items.new("FLOAT" if name == "Mist" else "RGBA", name)
                ng.links.new(rl.outputs[name], fo.inputs[name])
    ```

    `ShaderNodeMix` with the ADD blend adds the haze colour scaled by the Mist pass. The literal `0.12` is the spec's 0–12% haze ceiling.

  - Render settings from spec §4.6: clamp direct 8 / indirect 3; filter glossy 0.5; adaptive threshold 0.015; light paths total 8, diffuse 3, glossy 3, transmission 4, volume 0; fixed seed 7; persistent data on; OIDN with albedo and normal (`c.denoising_input_passes = "RGB_ALBEDO_NORMAL"`).
  - Per step, `spp = PUSH_B_SPP if quality == "final" and step["shot"] == "push" and step["j"] >= PUSH_SPLIT else QUALITY[quality]["spp"]`. Record it in the JSON.
  - Laptop bbox and corner blur go into the JSON:

    ```python
    def laptop_bbox(scene, cam):
        lap = bpy.data.objects["laptop"]; pts = []
        for ob in [lap, *lap.children_recursive]:
            if ob.type == "MESH":
                pts += [world_to_camera_view(scene, cam, ob.matrix_world @ Vector(c)) for c in ob.bound_box]
        xs = [p.x for p in pts]; return {"x0": max(0.0, min(xs)), "x1": min(1.0, max(xs))}

    def corner_coc_px(scene, cam, screen, width_px):
        """Thin-lens circle of confusion at the four screen corners, in output pixels."""
        cd = cam.data; f = cd.lens / 1000; N = cd.dof.aperture_fstop; s = cd.dof.focus_distance
        sensor = cd.sensor_width / 1000; worst = 0.0
        for v in screen.data.vertices:
            d = (cam.matrix_world.inverted() @ (screen.matrix_world @ v.co)).z * -1
            c = abs((f * f / N) * (d - s) / (d * (s - f)))          # blur diameter on the sensor, metres
            worst = max(worst, c / sensor * width_px)
        return worst
    ```

  - Add the `--exr`, `--out` and `--quality lookdev` arguments. The `still` shot keeps its Plan 1 behaviour.

- [ ] **Step 5: Add `package.json` scripts.**

  ```
  "render:lookdev": "bpyenv/bin/python design/render/blender/render.py --quality lookdev --exr --out design/render/blender/out-lookdev"
  "render:final": "bpyenv/bin/python design/render/blender/batch.py"
  "render:audit": "bpyenv/bin/python design/render/blender/audit.py"
  ```

  Add `out-lookdev/`, `out-final/` and `keyframes/` to `design/render/blender/.gitignore`.

- [ ] **Step 6: Calibrate against the approved composition.** The approval supersedes, and this is logged.
  - Re-render the approved preview key frames at look-dev quality with EXR:

    ```bash
    npm run render:lookdev -- --framing landscape --names lid-00,lid-20,k1-on,push-14,push-27
    npm run render:lookdev -- --framing portrait --names lid-00,k1-on,push-11
    ```

  - Audit each one with its kind: K0 = `lid-00`, lid = `lid-20`, K1on = `k1-on`, push = `push-14`, K2 = `push-27`; P0/P1/P2 = portrait `lid-00`, `k1-on`, `push-11`.
  - For every **geometric** target the approved frame misses, write the measured value ±10% into `design/render/blender/targets.json`. Geometric targets are laptop width and title P95; the approved camera keys (Plan 1 `camera_path.py`) differ from the pre-approval spec numbers, and the user approved the result.
  - **Light-balance, hue-lock, black-floor and corner-blur targets are never calibrated.** They are look-dev work (Task 8).
  - Commit `targets.json`, and list each calibrated target with its spec value, the approved value and the reason in the ledger. **No target is relaxed for any other reason.**

- [ ] **Step 7: Check that the output is unchanged by default.**
  - `npm run render:preview -- --framing landscape --names k1-on` still produces a quad identical (within 1e-6) to the committed `public/entrance/manifest.json` entry for `k1-on`. The camera and scene geometry are untouched.
  - The pixels differ only through haze and bloom. The glare and mist are part of the approved look direction, so review them visually on the contact sheet.
  - Unit tests PASS: `test_camera_path`, `test_audit`, `test_groups`.

- [ ] **Step 8: Commit:** "Render pipeline: light groups, EXR passes, bloom and mist compositor, look-dev tier, spec audit".

---

### Task 7: Texture freeze — truthful VERIFY, lower code density, source provenance

**Files:**
- Modify: `design/render/blender/make_screens.py`, `scripts/encode-frames.mjs`, `lib/entrance/types.ts`, `lib/entrance/manifest.ts`
- Test: `tests/unit/manifest.test.ts` (extend), `tests/unit/verify-provenance.test.ts`

**Interfaces:**
- Consumes: the real exit codes of `npx tsc --noEmit`, `npx eslint`, `npx vitest run` and `npx next build` at a clean HEAD (`make_screens.py` refuses a dirty tree, per the Plan 1 fix).
- Produces:
  - `out/screens.json` becomes `{snapshot, checks:{…}, drawn_checks:[…], verify_counts:{"T Poker":892,…}, sources:{"data/projects.ts":"<sha256>", "<editor file>":"<sha256>"}}`.
  - The manifest gains `sources?: Record<string, string>` and `verifyCounts?: Record<string, number>`, both copied by the encoder.
  - `validateManifest` requires both, **only for the final set**, signalled by `set.width >= 1920`.

- [ ] **Step 1: Write the failing provenance test**

```ts
// tests/unit/verify-provenance.test.ts — the VERIFY monitor's counts must still be true (spec §4.6 provenance).
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import { projects } from "@/data/projects";

const m = JSON.parse(fs.readFileSync("public/entrance/manifest.json", "utf8"));
describe.runIf(Boolean(m.verifyCounts))("VERIFY counts drawn in the frames", () => {
  it("each count is still that project's test metric in data/projects.ts", () => {
    for (const [name, n] of Object.entries(m.verifyCounts as Record<string, number>)) {
      const p = projects.find((x) => x.name === name);
      expect(p, name).toBeDefined();
      expect(p!.metrics.some((mt) => /test/i.test(mt.label) && mt.value.replace(/,/g, "") === String(n)), `${name} ${n}`).toBe(true);
    }
  });
  it("the total drawn equals the sum", () => {
    const total = Object.values(m.verifyCounts as Record<string, number>).reduce((a, b) => a + b, 0);
    expect(total).toBe(1742);
  });
});
```

  Note that `runIf` makes this a no-op until the final manifest carries `verifyCounts` (Task 22). Task 22's checklist requires it to *run* and pass there.

  - T Poker's metric reads "892" under "Tests across both stacks".
  - Aegis's reads "105" under "Tests, incl. Testcontainers".
  - DeveloperOS's metric value is "363", with the label "Tests · 0.82:1 to source".
  - GRAVITY FLOW's is "220" under "Tests over 28 files".
  - Job Assistant's is "162" under "Tests".

  All five match `/test/i`.

- [ ] **Step 2: Edit VERIFY in `make_screens.py`.** This is the user's decision 1.
  - Replace the "test suites" block with:

```python
# Project test suites — FACTUAL METADATA from data/projects.ts, not runs. They were not executed for
# this snapshot, so no check mark, no pass colour, no "passed" wording (user decision, 2026-09-26).
y0 = 290 + len(CHECKS) * 130 + 40
d.text((60, y0), "project test suites", font=F(MONO, 34), fill=MUTED)
d.text((60, y0 + 44), "counts from data/projects.ts", font=F(MONO, 26), fill=(96, 108, 128))
NEUTRAL_BAR = (58, 70, 92)
mx = max(n for _, n in counts)
for i, (name, n) in enumerate(counts):
    y = y0 + 110 + i * 240
    d.rounded_rectangle((60, y, W - 60, y + 210), 20, fill=PANEL, outline=LINE, width=2)
    d.ellipse((96, y + 58, 112, y + 74), fill=(120, 132, 152))              # neutral bullet, not a status
    d.text((140, y + 30), name, font=F(SANS, 58), fill=FG)
    t = f"{n} tests"
    d.text((W - 100 - d.textlength(t, font=F(MONO, 50)), y + 38), t, font=F(MONO, 50), fill=FG)
    bx0, bx1, by = 100, W - 100, y + 145
    d.rounded_rectangle((bx0, by, bx1, by + 22), 11, fill=(22, 30, 44))
    d.rounded_rectangle((bx0, by, bx0 + (bx1 - bx0) * n / mx, by + 22), 11, fill=NEUTRAL_BAR)
```

  - The CI `check()` rows above it stay exactly as they are: drawn only for exit 0, and including `tests` because `vitest run` exits 0 in this repo.
  - The footer total keeps its neutral wording, "1,742 tests across 5 projects". It is a count, not a run.

- [ ] **Step 3: Lower the code density on WRITE and BUILD.** This is the "still open for look-dev" item.
  - The WRITE editor shows `lib/entrance/surface.ts` (the solver that places this very screen; spec §4.6) at 36 px instead of 30, with the first 26 lines. The explorer shows 28 entries.
  - BUILD shows at most 22 build lines and 20 log lines, at 32 px.
  - Every drawn string still goes through `strings.txt`.

- [ ] **Step 4: Record provenance.** `make_screens.py` builds the `screens.json` dict inline in `json.dump(...)`. First bind it to a variable, `payload = {...}; json.dump(payload, ...)`. Then add:

```python
import hashlib
sha = lambda p: hashlib.sha256(open(R + p, "rb").read()).hexdigest()
payload["verify_counts"] = dict(counts)
payload["sources"] = {"data/projects.ts": sha("data/projects.ts"), "lib/entrance/surface.ts": sha("lib/entrance/surface.ts")}
```

  In `encode-frames.mjs`, read these values from **`design/render/blender/out/screens.json`**, the frozen texture output. Do not read them from `--src`, since `out-final/` has no `screens.json`. Write `manifest.snapshot`, `manifest.sources` and `manifest.verifyCounts` from that file. Extend `types.ts`:

  ```ts
  export type Manifest = { version: 1; snapshot: string; sources?: Record<string, string>; verifyCounts?: Record<string, number>; landscape: FrameSet; portrait: FrameSet };
  ```

  Extend `validateManifest`: if `m.landscape.width >= 1920`, then require `sources["data/projects.ts"]` and a non-empty `verifyCounts`. Add a unit case for each in `manifest.test.ts`.

- [ ] **Step 5: Freeze.**
  1. Commit Steps 1–4 (the tree must be clean).
  2. Run `npm run render:screens`. Expected: `drawn_checks` equals `["typecheck","lint","tests","build"]`, and `snapshot` equals HEAD.
  3. Read `out/strings.txt` line by line. Every number must trace to a file or command output, and no path, e-mail or secret may appear. Record the review in the ledger.
  4. Write the snapshot hash to `design/render/blender/SNAPSHOT` (committed).

  From now until Task 10 completes, every look-dev and final render uses these textures. If the container is reclaimed, regenerate them with `git worktree add /tmp/snap $(cat design/render/blender/SNAPSHOT) && (cd /tmp/snap && npm ci && npm run render:screens)`, then copy `out/*.png` and `out/*.json`.

- [ ] **Step 6: Commit:** "Texture freeze: VERIFY shows project test counts as metadata, not runs; provenance hashes into the manifest".

---

### Task 8: Look-dev — the six approved refinement requirements, final-quality key frames

**Files:**
- Modify: `design/render/blender/scene.py`, `design/render/blender/camera_path.py` (only if an audit target requires it)
- Create: `design/render/blender/keyframes.py` (renders the key-frame set), `design/render/blender/overlay_dom.py` (K2 with the real DOM), `design/render/blender/sheet.py` (side-by-side sheets)

**Interfaces:**
- Consumes: Task 6 (`render.py --quality final --exr`, `audit.py`, `targets.json`) and Task 7 (frozen textures).
- Produces: `design/render/blender/keyframes/` (gitignored) holding the final-quality 1920×1080 and 1080×1920 key frames, their audit JSON, `sheet-final-vs-preview.png`, `sheet-final-vs-prototype2.png` and `k2-with-dom.png`. Only the sheets get committed, under `docs/superpowers/specs/assets/2026-09-26-final-*.webp`, at Task 9.

Look-dev is iterative art direction. Every change below is a **starting value**, and the audit plus the side-by-side review decide. The approved K0/K1/K2 composition and look are the baseline, and this task refines it — it does not redesign it. **At most three passes per key frame.** A frame that has not converged after three passes goes to the user with options (spec §4.6).

- [ ] **Step 1: Write the key-frame set definition** (`keyframes.py`).

```python
"""The spec §4.6 key-frame set, rendered at FINAL quality with EXR passes, then audited.
usage: bpyenv/bin/python design/render/blender/keyframes.py [--only K0,K1on]"""
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, "keyframes")
PY = os.path.join(HERE, "..", "..", "..", "bpyenv", "bin", "python")
# (key, framing, frame name in camera_path.SEQUENCE or "still", audit kind)
KEYS = [("K0", "landscape", "lid-00", "K0"), ("crack", "landscape", "lid-03", "lid"), ("mid", "landscape", "lid-24", "lid"),
        ("K1off", "landscape", "lid-35", "K1off"), ("K1on", "landscape", "k1-on", "K1on"), ("still", "landscape", "still", "K1on"),
        ("push78", "landscape", "push-14", "push"), ("K2", "landscape", "push-27", "K2"),
        ("P0", "portrait", "lid-00", "P0"), ("P1", "portrait", "k1-on", "P1"), ("P2", "portrait", "push-11", "P2"), ("Pstill", "portrait", "still", "P1")]
only = sys.argv[sys.argv.index("--only") + 1].split(",") if "--only" in sys.argv else None
results = {}
for key, framing, name, kind in KEYS:
    if only and key not in only: continue
    subprocess.run([PY, os.path.join(HERE, "render.py"), "--quality", "final", "--exr", "--out", OUT, "--framing", framing, "--names", name], check=True)
    a = subprocess.run([PY, os.path.join(HERE, "audit.py"), os.path.join(OUT, framing, name + ".png"), "--kind", kind], capture_output=True, text=True)
    results[key] = json.loads(a.stdout.strip().splitlines()[-1]); print(key, "PASS" if a.returncode == 0 else "FAIL", results[key]["fails"], flush=True)
json.dump(results, open(os.path.join(OUT, "audit.json"), "w"), indent=1, default=float)
```

  - Frame names, from Plan 1 `SEQUENCE`: `lid-03` sits in the crack hold, and `lid-35` is the last lid frame (K1-off).
  - **Choose the "mid" frame by angle, not by index.** Print `frame_state(...)["lid_deg"]` for every lid frame and pick the one nearest 70°. `lid-24` is about 91°, not 70°. Update `KEYS` with that name before the first render.
  - Each final frame takes about 3.6 min, so the full set is about 45 min. Run it in the background and do the next step's scene work in the meantime.

- [ ] **Step 2: Look-dev pass 1 in `scene.py`.** Each item maps to one approved requirement, with starting values. Keep a `LOOKDEV` dict at the top of `scene.py`, so every tuned value lives in one reviewable place.

  1. **Colour separation.** Keep obsidian/navy, ice/cyan light and neutral dark materials distinct.
     - Neutral materials: slats `#1b1c20` → `#18191c` at roughness 0.55 (spec value); plaster `#0b0e14` unchanged; desk ash `#0f0e0d`–`#16130f` with the satin coat per spec (currently absent — add coat 0.3, coat roughness 0.18).
     - Lights: `L2_graze` power 30 → 18, and `L1_halo` 55 → 40, so the blue lives in the bias light rather than washing the room.
     - Hue lock: `led_green` → ice `#9cc4ff`, strength 6 (Plan 2 decision 4).
     - Audit targets: `off_lock` ≤ 0.3%, `median_atmos` 0.05–0.08, and on K0 each depth layer separated by ≥ 1.5× luminance (checked on the sheet).
  2. **The laptop as product photography.**
     - Body `#9aa0a8`, metallic, roughness 0.30, anisotropy 0.25 (spec).
     - Chamfers: a dedicated 1 mm bevel strip on **both** the base top edge and the lid edge, at roughness 0.08.
     - Hinge: a darker anodised barrel (`#2a2e35`), with a 1 mm recessed slot in near-black `#060708` on each side, so the hinge reads as a part.
     - Keyboard depth: sink the key plane 1.2 mm into a well with a 0.6 mm chamfered lip, and give the key tops a 0.3 mm bevel so the gaps catch the key-backlight line.
     - Trackpad: a satin glass look, `#2b2f35`, roughness 0.35, coat 0.3 at roughness 0.08. It shows a restrained hint of the light bar, never a mirror.
     - Contact shadows: feet with a visible 0.5 mm air gap; the L5 key stays 1.0 × 0.7 m for soft contact shadows.
  3. **Reflections.**
     - The screen glass already has coat 1.0. Verify on K1-off that the light bar reads as a hairline, and that the monitor arc reads during the lid move (`mid`).
     - Add **L8, the lid-sweep card:** a glossy-only, camera-invisible area light with gradient emission `#9cb4d8`, driven per lid frame (`lg_sweep`). Its weight ramps to 0 over the last 6 lid frames (spec).
     - The aluminium must show a soft reflection of the monitor arc: raise the environment contribution by keeping metallic 1 with roughness ≤ 0.30. Do not add fake reflection maps.
  4. **Depth in K2 and the late push.**
     - The audit's `bokeh_p90 ≥ 0.10` on `push78` asserts that the region outside the screen quad still carries lit bokeh.
     - On the sheet, the monitor arc, tower, slats and homelab must remain recognisable discs and shapes.
     - If the region reads as a uniform blue wash, reduce the haze (the mix factor 0.12 → 0.08) before touching the lights.
  5. **VERIFY / WRITE / BUILD:** unchanged roles, using the frozen textures (Task 7).
  6. **Truth:** the audit cannot check this. It is enforced by `make_screens.py` and the `strings.txt` review.

- [ ] **Step 3: Render and audit.**
  - Render with `bpyenv/bin/python design/render/blender/keyframes.py`, in the background, logging to the scratchpad.
  - Read `keyframes/audit.json`. Every key must PASS, and a FAIL gets the next pass.
  - Look at every frame at full size, not only the numbers. Record per frame what changed and why.

- [ ] **Step 4: Overlay the real DOM on K2** (`overlay_dom.py`, system Python and PIL).

```python
"""Composite a real browser screenshot of the hero onto the K2 frame through its screen quad.
usage: python3 overlay_dom.py <k2.png> <k2.json> <hero.png> <out.png>"""
import json, sys
from PIL import Image

def coeffs(src, dst):
    # Solve the 8 perspective coefficients mapping dst→src (PIL's transform convention).
    import itertools
    A, b = [], []
    for (x, y), (u, v) in zip(dst, src):
        A += [[x, y, 1, 0, 0, 0, -u * x, -u * y], [0, 0, 0, x, y, 1, -v * x, -v * y]]; b += [u, v]
    n = 8; M = [row[:] + [bv] for row, bv in zip(A, b)]
    for c in range(n):                                   # Gaussian elimination, partial pivoting
        p = max(range(c, n), key=lambda r: abs(M[r][c])); M[c], M[p] = M[p], M[c]
        for r in range(n):
            if r != c:
                f = M[r][c] / M[c][c]; M[r] = [a - f * bb for a, bb in zip(M[r], M[c])]
    return [M[i][n] / M[i][i] for i in range(n)]

k2, meta, hero, out = sys.argv[1:5]
base = Image.open(k2).convert("RGB"); W, H = base.size
q = json.load(open(meta))["quad"]
dst = [(p["x"] * W, p["y"] * H) for p in q]
h = Image.open(hero).convert("RGB"); hw, hh = h.size
src = [(0, 0), (hw, 0), (hw, hh), (0, hh)]
warped = h.transform((W, H), Image.PERSPECTIVE, coeffs(src, dst), Image.BICUBIC)
mask = Image.new("L", (hw, hh), 255).transform((W, H), Image.PERSPECTIVE, coeffs(src, dst), Image.BICUBIC)
base.paste(warped, (0, 0), mask); base.save(out); print(out)
```

  Take `hero.png` with `npm run shoot -- --sizes 1920x1200 --entrance 1`, which gives the hero at identity at 16:10, matching the screen's aspect.

- [ ] **Step 5: Side-by-side sheets** (`sheet.py`, system Python and PIL).
  - Each row is: final key frame | the approved preview key frame (`docs/superpowers/specs/assets/2026-09-25-preview-K{0,1,2}.webp`) | prototype 2 (`assets/2026-09-25-render-spike-cyber-studio.webp`).
  - Label each tile with its key name and the audit PASS/FAIL line.
  - Also check off every row of the spec's "Prototype 2 weakness" table against the final frames in a Markdown checklist, `keyframes/weakness-check.md`: fixed or not, with one sentence of evidence each.

- [ ] **Step 6: Iterate** passes 2 and 3 on failing or unconvinced frames only, re-rendering with `--only`.
  - Stop when every key passes the audit **and** clearly beats its preview and prototype-2 counterparts on the sheet.
  - Also run the recruiter-test stand-in: the pixel audit plus a side-by-side review against the concept frames 01–03, in which the frame must read "software engineer", never "gamer/streamer". Apply the §4.6 ordered cut list on any gaming read.

- [ ] **Step 7: Measure render time.** Take the per-frame time at final quality from the Blender log. If a 64-spp frame projects above 3.5 min, apply the §4.7 budget-gate cuts **in order**, and record them in the ledger:
  1. keyboard halo and tower interior become emission-only;
  2. the mug;
  3. the niche strip;
  4. lid frames drop to 48 spp;
  5. push-b drops to 64 spp.

  Estimate the whole batch: 65 landscape + 29 portrait + 2 stills.

- [ ] **Step 8: Commit** the scene, the scripts, `targets.json` changes and the sheets (as WebP under `docs/superpowers/specs/assets/2026-09-26-final-*.webp`): "Look-dev: final-quality key frames against the six approved refinements; audit passing".

---

### Task 9: ■ BLOCKING HUMAN VISUAL GATE ■ — approve the final key frames before the batch

**Files:** `docs/superpowers/specs/2026-09-25-cinematic-laptop-redesign-design.md` (append the gate record), `.superpowers/sdd/…/progress.md`

- [ ] **Step 1: Push the branch** so the committed sheets are available.

- [ ] **Step 2: Report to the user and stop.** Send the sheets with `SendUserFile`:
  - `final-vs-preview`;
  - `final-vs-prototype2`;
  - `k2-with-dom`;
  - the portrait P0/P1/P2 sheet;
  - the full-size K0, K1-on and K2.

  The message must contain:
  - the audit table (every key × every assertion, with values), and the calibrated targets with their reasons;
  - the spec §10 render checks that `audit.py` does **not** measure, each marked "checked on the sheet" with a one-line finding: laptop centring (±2%); the leading-line band in the bottom 2–15%; K2 perpendicular within 0.1° with 2–4% overscan (the latter from the K2 quad in its JSON); D0–D5 separation ≥ 1.5×; prop clearance ≥ 2 cm; K0 monitor text 4–6 px soft. Report plainly any that could not be verified;
  - `weakness-check.md`;
  - the recruiter-test stand-in result;
  - the measured per-frame render time and the projected batch duration, plus any budget-gate cuts applied;
  - the list of changes per approved requirement (1–6);
  - the explicit question: **"Approve these key frames for the final render batch (≈ N hours in background chunks), or request changes?"**

  The truth rule applies: report any FAIL or unconverged frame plainly, with options.

- [ ] **Step 3: Wait.** Do not start Task 10 without the user's written approval of the key frames. Then proceed as follows:
  - **Changes requested:** return to Task 8 with the notes. The three-pass limit applies per frame.
  - **The user says to continue with the sections while they review:** proceed with Task 11 onward, leaving Task 10 waiting.
  - **Approved:** append to spec §4.6 an "Approved 2026-09-2x: final key frames" record with the sheet links, commit "Record final key-frame approval", and go to Task 10.

---

### Task 10: The final batch — chunked, resumable, background; encoded per chunk (after approval only)

**Files:**
- Create: `design/render/blender/batch.py`
- Modify: `scripts/encode-frames.mjs` (arguments `--src`, `--dst`, `--check-budget`)
- Output: `public/entrance-final/` (committed per chunk; **not** used by the site until Task 22)

**Interfaces:**
- Consumes: approved key frames; frozen textures; `render.py --quality final`.
- Produces:
  - `public/entrance-final/{manifest.json, landscape/{1280,1920}/*.avif, portrait/720/*.avif, poster-*.{avif,jpg}, still-*.{avif,jpg}}`;
  - `encode-frames.mjs --src DIR --dst DIR [--check-budget]`, which exits 1 when a payload budget fails.

- [ ] **Step 1: Extend the encoder.**
  - Add arguments (default `SRC` and `DST` are unchanged, so Plan 1 usage still works).
  - Final tiers: landscape `[1280, 1920]` from the 1920 masters; portrait `[720]` from the 1080 masters.
  - Add a budget check:

```js
if (process.argv.includes("--check-budget")) {
  const size = async (d) => (await Promise.all((await fs.readdir(d)).map(async (f) => (await fs.stat(`${d}/${f}`)).size))).reduce((a, b) => a + b, 0);
  const b = { l1280: await size(`${DST}/landscape/1280`), l1920: await size(`${DST}/landscape/1920`), p720: await size(`${DST}/portrait/720`) };
  console.log(JSON.stringify(b));
  if (b.l1280 > 2.5e6 || b.l1920 > 4e6 || b.p720 > 1.2e6) { console.error("payload budget exceeded (spec §9) — apply the §4.7 levers in order"); process.exit(1); }
}
```

  The poster AVIF must be 60–90 KB (spec §9). Log it.

- [ ] **Step 2: Write `batch.py`.** It is resumable, with a chunk of 8 frames per framing; each chunk encodes and commits.

```python
"""Final batch (spec §4.7): chunks of 8, resumable, each chunk encoded and committed so a reclaimed
container loses at most one chunk. usage: bpyenv/bin/python design/render/blender/batch.py [--framing landscape|portrait]"""
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
sys.path.insert(0, HERE)
from camera_path import SEQUENCE
PY = os.path.join(REPO, "bpyenv", "bin", "python"); OUT = os.path.join(HERE, "out-final")
BRANCH = "feature/premium-portfolio-redesign-1mqmgf"
TRAILER = os.environ.get("COMMIT_TRAILER")   # the harness's attribution lines, exported by the executor before launch
if not TRAILER: sys.exit("batch.py: set COMMIT_TRAILER to the commit attribution lines from the harness reminder")
def done(kind, name): return all(os.path.exists(os.path.join(OUT, kind, name + ext)) for ext in (".png", ".json"))
def sh(*a): subprocess.run(a, cwd=REPO, check=True)
def git_retry(*a, tries=6):
    import time
    for i in range(tries):                     # index.lock clashes with the executor's own git calls
        if subprocess.run(("git", *a), cwd=REPO).returncode == 0: return
        time.sleep(5 * (i + 1))
    raise SystemExit(f"git {' '.join(a)} failed after {tries} tries")
framings = [sys.argv[sys.argv.index("--framing") + 1]] if "--framing" in sys.argv else ["landscape", "portrait"]
for kind in framings:
    names = [s["name"] for s in SEQUENCE[kind]] + ["still"]
    todo = [n for n in names if not done(kind, n)]
    for i in range(0, len(todo), 8):
        chunk = todo[i:i + 8]
        sh(PY, os.path.join(HERE, "render.py"), "--quality", "final", "--out", OUT, "--framing", kind, "--names", ",".join(chunk))
        # Encode this framing's finished frames only (tiers + a partial manifest.<kind>.json); the full
        # manifest.json is written once, after both framings complete (Step 4).
        sh("node", "scripts/encode-frames.mjs", "--src", os.path.relpath(OUT, REPO), "--dst", "public/entrance-final", "--only-framing", kind)
        # Commit ONLY this path: the executor may have files staged for a section task in the same index.
        git_retry("add", "--", "public/entrance-final")
        git_retry("commit", "--only", "-m", f"Final frames: {kind} {chunk[0]}…{chunk[-1]}", "-m", TRAILER, "--", "public/entrance-final")
        git_retry("push", "origin", BRANCH)
        print("chunk done", kind, chunk, flush=True)
```

  - Before launching, export `COMMIT_TRAILER` with the exact attribution lines from the harness's system reminder (the `Co-Authored-By` and `Claude-Session` lines). `batch.py` refuses to run without it.
  - Extend `encode-frames.mjs` with `--only-framing <kind>`:
    - it encodes only that framing's tiers from the frames present;
    - it writes `DST/manifest.<kind>.json` holding that framing's `FrameSet`;
    - it does not write `manifest.json`.
  - The run without the flag, in Step 4, merges both partial manifests into the final `manifest.json`, with `sources` and `verifyCounts`, and deletes the partials.
  - Portrait runs first (`--framing portrait`), then landscape.
  - Frame counts stay at Plan 1's 65 landscape and 29 portrait, plus the stills. Spec §13 decision 12 projected 31 portrait frames; the 16-lid / 12-push portrait split was fixed in Plan 1. Record the difference in the ledger. It is a deviation that saves time without affecting the approved look.

- [ ] **Step 3: Launch in the background, at low priority,** through the PID-file wrapper (per-task gate section): portrait first, `bgjob final-portrait <log> nice -n 15 npm run render:final -- --framing portrait`, then landscape. Wait on the PID only, never on a `pgrep -f` pattern.
  - While a chunk renders, CPU contention inflates `npm run measure`'s LCP and slows e2e.
  - Record budget measurements only between chunks, or with the render paused: `kill -STOP <pid>` for the measurement, then `kill -CONT`.
  - Note in the ledger when a measurement was taken under contention. Check progress by reading the log. Continue with Tasks 11–21 while it runs. **Tasks 11–21 must not touch `design/render` or `public/entrance*`.**

- [ ] **Step 4: After the last chunk:**
  - Run `node scripts/encode-frames.mjs --src design/render/blender/out-final --dst public/entrance-final --check-budget`.
  - If it exceeds a budget, apply the §4.7 payload levers **in order**, re-encode and re-check:
    1. lower AVIF quality on push frames;
    2. serve push frames beyond p 0.80 from the 1280 tier;
    3. soften the slats with depth of field (a re-render — only if 1 and 2 are insufficient);
    4. portrait only: lower quality, then 16 → 12 lid frames.

    The budget never relaxes.
  - **Banding check:** open three push frames from the 1920 tier at 200%. The encoder is 8-bit, because prebuilt sharp rejects 10-bit. If banding is visible in the screen glow or the haze, add a ±0.5/255 ordered dither in the encoder for those frames only, and re-check the budget. Record this in the ledger.
  - Run `npx vitest run tests/unit/manifest.test.ts` against the final manifest. Temporarily point the test at `public/entrance-final/manifest.json` with an env var `MANIFEST=…`; add that switch to the test in this step. Expected: PASS, including the `sources` and `verifyCounts` requirements.

- [ ] **Step 5: Commit** the final encode and budget JSON: "Final entrance frame set encoded (budgets: …)". Push.

---
### Task 11: `data/work.ts` — the storytelling config, content-tested

**Files:**
- Create: `data/work.ts`
- Test: `tests/unit/work.test.ts`

**Interfaces:**
- Consumes: `projects` and `Project` (`data/projects.ts`).
- Produces:

```ts
export type WorldKey = "poker" | "aegis" | "developeros" | "gravity-flow";
export type WorldAssets = { monitor: string; rows?: { src: string; centres: number[] } };
export type Flagship = { id: WorldKey; number: "01" | "02" | "03" | "04"; kicker: string; story: [string, string];
  metricLabels: [string, string, string]; statusNote?: string; sourcePrivate?: boolean;
  /** Images a world composes. Data, not code: swapping screenshots is a data change (Aegis, decision 6). */
  worldAssets?: WorldAssets };
export type MoreWorkRow = { id: "job-assistant" | "orders-delivery"; diagram: { kind: "pipeline" | "duplex"; nodes: string[] }; metricLabels: [string, string] };
export const flagships: Flagship[];
export const moreWork: MoreWorkRow[];
export function projectOf(id: string): Project;            // throws if the id is unknown
```

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/work.test.ts — every storytelling line is condensed from data/projects.ts; nothing new is claimed.
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import { flagships, moreWork, projectOf } from "@/data/work";

const numbers = (s: string) => (s.match(/\d[\d,.]*/g) ?? []).map((n) => n.replace(/[,.]$/, ""));
const source = (id: string) => { const p = projectOf(id); return [p.tagline, p.summary, p.description, p.context, ...p.metrics.map((m) => `${m.value} ${m.label}`), p.caseStudy.honestNote ?? ""].join(" "); };

describe("flagships", () => {
  it("are the four spec §5.2 projects in order 01–04", () => {
    expect(flagships.map((f) => [f.number, f.id])).toEqual([["01", "poker"], ["02", "aegis"], ["03", "developeros"], ["04", "gravity-flow"]]);
  });
  it("every number in a kicker or story line appears in that project's data", () => {
    for (const f of [...flagships]) for (const line of [f.kicker, ...f.story, f.statusNote ?? ""])
      for (const n of numbers(line)) expect(source(f.id), `${f.id}: "${n}" in "${line}"`).toContain(n);
  });
  it("chosen metrics exist verbatim in the project's metrics", () => {
    for (const r of [...flagships, ...moreWork]) for (const l of r.metricLabels) expect(projectOf(r.id).metrics.map((m) => m.label)).toContain(l);
  });
  it("every world asset exists on disk", () => {
    for (const f of flagships) { const p = projectOf(f.id); for (const src of [p.media?.image, ...(p.media?.gallery ?? []).map((g) => g.src), f.worldAssets?.monitor, f.worldAssets?.rows?.src].filter(Boolean)) expect(fs.existsSync(`public${src}`), src).toBe(true); }
  });
  it("story lines are two sentences, each ending in a full stop", () => {
    for (const f of flagships) for (const s of f.story) expect(s).toMatch(/^[A-Z].*[.]$/);
  });
});
describe("more work", () => {
  it("is Job Assistant and Orders & Delivery with their real pipeline shapes", () => {
    expect(moreWork.map((r) => r.id)).toEqual(["job-assistant", "orders-delivery"]);
    expect(moreWork[0].diagram).toEqual({ kind: "pipeline", nodes: ["collect", "filter", "dedup", "deliver"] });
    expect(moreWork[1].diagram).toEqual({ kind: "duplex", nodes: ["client", "TCP", "server"] });
    expect(projectOf("orders-delivery").status).toBe("coursework");
  });
});
```

- [ ] **Step 2: Run it.** Expected: FAIL (module missing).

- [ ] **Step 3: Implement.** The copy is condensed from each project's `description`, `tagline` and `honestNote`. Every clause below exists in `data/projects.ts`.

```ts
import { projects, type Project } from "@/data/projects";

export type WorldKey = "poker" | "aegis" | "developeros" | "gravity-flow";
export type WorldAssets = { monitor: string; rows?: { src: string; centres: number[] } };
export type Flagship = { id: WorldKey; number: "01" | "02" | "03" | "04"; kicker: string; story: [string, string];
  metricLabels: [string, string, string]; statusNote?: string; sourcePrivate?: boolean;
  /** Images a world composes. Data, not code: swapping screenshots is a data change (Aegis, decision 6). */
  worldAssets?: WorldAssets };
export type MoreWorkRow = { id: "job-assistant" | "orders-delivery"; diagram: { kind: "pipeline" | "duplex"; nodes: string[] }; metricLabels: [string, string] };

/**
 * The Work story (spec §5.2): four flagship worlds, then two "more work" rows.
 * Copy is condensed from data/projects.ts — tests/unit/work.test.ts fails on any number that isn't there.
 * `featured` in projects.ts is untouched; this list decides the order and the flagships.
 */
export const flagships: Flagship[] = [
  { id: "poker", number: "01", kicker: "A poker study platform and home-game manager, shipped from one codebase",
    story: ["One Expo codebase renders iOS, Android and the live web app, backed by an ASP.NET Core CQRS service over PostgreSQL.",
            "The financial core runs in integer cents and is covered by 892 tests across both languages."],
    metricLabels: ["Tests across both stacks", "Targets from one codebase", "CI jobs per push"] },
  { id: "aegis", number: "02", kicker: "A Security Operations Centre where module isolation is enforced by the compiler",
    story: ["Security events flow from ingestion through detection and threat scoring to alerts over MassTransit and RabbitMQ, and reach the dashboard live over SignalR.",
            "The whole stack comes up from one Docker command that mints its own RS256 keys."],
    metricLabels: ["Bounded contexts", "Cross-context references", "Tests, incl. Testcontainers"],
    statusNote: "Runs locally — the live stream shown is a local demo",
    // TEMPORARY: pre-rename captures (in-app wordmark reads SentinelAI) until the user supplies Aegis screenshots.
    worldAssets: { monitor: "/projects/aegis/dashboard.webp", rows: { src: "/projects/aegis/live-alerts.webp", centres: [0.34, 0.46, 0.58] } } },
  { id: "developeros", number: "03", kicker: "A local-first code workspace that refuses to answer without evidence",
    story: ["It indexes your own projects into a private SQLite FTS5 index and answers with real file and line citations, declining when the index can't support an answer.",
            "It ships as one Python package with no runtime dependencies: a CLI, a browser dashboard, an installable PWA or a Windows desktop window."],
    metricLabels: ["Tests · 0.82:1 to source", "Runtime dependencies", "Decision records"] },
  { id: "gravity-flow", number: "04", kicker: "One touch, 150 hand-tuned levels, and physics that had to feel fair",
    story: ["Press and hold to spawn an inverse-square gravity well and pull a lost star home, across 150 data-driven levels in 15 worlds.",
            "Built on Phaser 3 in strict TypeScript, with a Vitest suite that pins both the physics and the progression."],
    metricLabels: ["Levels across 15 worlds", "Tests over 28 files", "Core mechanics"],
    statusNote: "v1.0.0-rc · Android-only · not yet in a store" },
];

export const moreWork: MoreWorkRow[] = [
  { id: "job-assistant", diagram: { kind: "pipeline", nodes: ["collect", "filter", "dedup", "deliver"] }, metricLabels: ["Source adapters", "Tests"] },
  { id: "orders-delivery", diagram: { kind: "duplex", nodes: ["client", "TCP", "server"] }, metricLabels: ["Protocol routes", "Concurrent clients"] },
];

export function projectOf(id: string): Project {
  const p = projects.find((x) => x.id === id);
  if (!p) throw new Error(`unknown project ${id}`);
  return p;
}
```

  The status notes must trace to the data:
  - GRAVITY FLOW's comes from its `honestNote`: "v1.0.0-rc", "not shipped to a store", "Android-only".
  - Aegis's "Runs locally" is its `status` label (`Tag.tsx`). The "local demo" wording is spec §5.2's required label for the streaming indicator.

  The number check passes for "1.0.0"? It does not: the regex extracts `1.0.0`, and the `honestNote` contains `v1.0.0-rc`. Confirm when you run it. If the extraction splits differently, fix the extractor, never the copy.

  If the user confirmed at plan review that the T Poker repository is private, add `sourcePrivate: true` to the poker entry, together with a test asserting it (Plan 2 decision 3).

- [ ] **Step 4: Run it.** Expected: PASS. Then the full unit suite.

- [ ] **Step 5: Commit:** "Add the Work storytelling config, condensed from project data and content-tested".

---

### Task 12: Work shell — `Work`, `FlagshipScene`, on-demand case study, page wiring

**Files:**
- Create: `components/work/Work.tsx`, `components/work/FlagshipScene.tsx`, `components/work/CaseStudyHost.tsx`, `components/work/worlds/worlds.css`
- Modify: `components/ui/CaseStudyPanel.tsx` (restyle to the new tokens; no behaviour change), `app/page.tsx` (replace `<Projects />`), `tests/e2e/budget.spec.ts` (remove the `fixme`)
- Test: `tests/e2e/sections.spec.ts` (created here, extended by later tasks)

**Interfaces:**
- Consumes: `flagships`, `moreWork`, `projectOf` (Task 11); `ScrollScene` (Task 5); `StatusChip`, `StoreBadge`, `ButtonLink` (existing); `CaseStudyPanel({ project, onClose })` (existing).
- Produces:
  - `<Work />` with `id="work"`, `h2#work-title`, and one `h3` per project.
  - Case-study triggers use `button[data-case-study="<id>"]`.
  - `FlagshipScene` renders a world through the prop `world: React.ReactNode`, which Tasks 13–16 supply.
  - Until those tasks land, a placeholder world is used: the project's `media.image` in a plain frame. It is not a stub: it is the settled composition's key image, which the real world wraps.

- [ ] **Step 1: Write the failing e2e tests**

```ts
// tests/e2e/sections.spec.ts
import { test, expect, type Page } from "playwright/test";
const skip = async (page: Page) => { await page.goto("/"); await page.locator("[data-skip-intro]").click(); };

test("Work: one h2, four flagship h3s in order, then two more-work h3s", async ({ page }) => {
  await skip(page);
  await expect(page.locator("#work h2")).toHaveCount(1);
  await expect(page.locator("#work h3")).toHaveText(["T Poker", "Aegis", "DeveloperOS", "GRAVITY FLOW", "Job Assistant", "Orders & Delivery"]);
});

test("restored scroll inside a pinned flagship shows a legible composition (Review Focus 1)", async ({ page }) => {
  await skip(page);
  await page.evaluate(() => { const s = document.getElementById("work-aegis")!; window.scrollTo({ top: s.getBoundingClientRect().top + scrollY + s.offsetHeight * 0.4, behavior: "instant" as ScrollBehavior }); });
  await page.reload(); await page.waitForTimeout(600);
  // Scroll targets are always document-relative (getBoundingClientRect().top + scrollY): #work-* sits inside
  // the positioned .work__stage, so offsetTop would be off by the whole entrance height.
  const copy = page.locator("#work-aegis .flagship__copy");
  await expect(copy).toBeInViewport();
  expect(await copy.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
  await expect(page.locator("#work-aegis h3")).toBeVisible();
});

test("case study: Enter opens, Escape closes, focus returns to the opener — loaded on demand (Review Focus 4)", async ({ page }) => {
  const chunks: string[] = []; page.on("response", (r) => { if (r.url().endsWith(".js")) chunks.push(r.url()); });
  await skip(page);
  const before = chunks.length;
  const opener = page.locator("button[data-case-study='developeros']");
  await opener.focus(); await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(chunks.length).toBeGreaterThan(before);                       // the panel chunk arrived on demand
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(opener).toBeFocused();
});

test("copy never depends on scroll position: every flagship's copy is opaque at scene p = 0, .5 and 1", async ({ page }) => {
  await skip(page);
  for (const id of ["poker", "aegis", "developeros", "gravity-flow"]) for (const f of [0.02, 0.5, 0.98]) {
    await page.evaluate(({ id, f }) => { const s = document.getElementById(`work-${id}`)!; window.scrollTo({ top: s.getBoundingClientRect().top + scrollY + (s.offsetHeight - innerHeight) * f, behavior: "instant" as ScrollBehavior }); }, { id, f });
    await page.waitForTimeout(150);
    expect(await page.locator(`#work-${id} .flagship__copy`).evaluate((el) => getComputedStyle(el).opacity), `${id}@${f}`).toBe("1");
  }
});
```

  These fail until Step 5. The `h3` list includes More Work, so the first test goes green only at Task 17. Mark only it `test.fixme` with `// un-fixme in Task 17`, and track that in the ledger.

- [ ] **Step 2: Create `FlagshipScene.tsx`** (server).

```tsx
import { ScrollScene } from "@/components/scenes/ScrollScene";
import { StatusChip } from "@/components/ui/Tag";
import { StoreBadge } from "@/components/ui/StoreBadge";
import { ButtonLink } from "@/components/ui/Button";
import { projectOf, type Flagship } from "@/data/work";

/** One flagship world (spec §5.2). The copy column is never transformed — it is legible the whole
 *  time the scene is visible; only the world responds to --assemble / --hold / --recede. */
export function FlagshipScene({ f, world }: { f: Flagship; world: React.ReactNode }) {
  const p = projectOf(f.id);
  const metrics = f.metricLabels.map((l) => p.metrics.find((m) => m.label === l)!);
  const store = p.stores?.find((s) => s.status === "live" && s.url);
  return (
    <ScrollScene id={`work-${p.id}`} labelledBy={`work-${p.id}-title`} className={`flagship flagship--${p.id}`}>
      <div className="shell flagship__grid">
        <div className="flagship__copy">
          <p className="label flex items-center gap-3 text-fg-subtle"><span aria-hidden="true" className="flagship__num">{f.number}</span><StatusChip status={p.status} /></p>
          <h3 id={`work-${p.id}-title`} className="mt-4 text-[clamp(2rem,4vw,3.25rem)] font-semibold tracking-[-0.03em] text-fg">{p.name}</h3>
          <p className="mt-3 text-fg-muted" style={{ fontSize: "var(--text-lead)" }}>{f.kicker}</p>
          <p className="mt-5 max-w-[62ch] text-fg-muted">{f.story[0]} {f.story[1]}</p>
          {f.statusNote && <p className="label mt-4 text-fg-subtle">{f.statusNote}</p>}
          <dl className="mt-7 grid grid-cols-3 gap-4 border-t border-line pt-5">
            {metrics.map((m) => (<div key={m.label}><dt className="label order-2 mt-1 text-fg-subtle">{m.label}</dt><dd className="text-[clamp(1.5rem,2.4vw,2rem)] font-semibold text-fg">{m.value}</dd></div>))}
          </dl>
          <ul className="mt-5 flex flex-wrap gap-2" aria-label={`${p.name} stack`}>
            {p.stack.slice(0, 5).map((s) => <li key={s.label} className="label rounded-full border border-line px-2.5 py-1 text-fg-muted">{s.label}</li>)}
          </ul>
          <div className="mt-7 flex flex-wrap gap-3">
            <button type="button" data-case-study={p.id} className="case-study-trigger inline-flex h-11 items-center rounded-full bg-accent-solid px-5 text-sm font-medium text-white hover:bg-accent-solid-hover">Case study</button>
            {p.liveUrl && <ButtonLink href={p.liveUrl} variant="secondary" external>{p.liveLabel ?? "Live"}</ButtonLink>}
            {store && <StoreBadge listing={store} />}
            {f.sourcePrivate
              ? <span className="label inline-flex h-11 items-center px-3 text-fg-subtle">Private repository</span>
              : <ButtonLink href={p.repoUrl} variant="ghost" external>Source</ButtonLink>}
          </div>
        </div>
        <div className="flagship__world" data-world={p.id}>
          {/* "…it recedes while the next number arrives" (spec §5.2): each scene's ghost number assembles
              with its world, so the next number rises as the previous world recedes. */}
          <span aria-hidden="true" className="flagship__ghost">{f.number}</span>
          {world}
        </div>
      </div>
    </ScrollScene>
  );
}
```

  - `dt`/`dd` order: the value displays first. Use CSS `display: flex; flex-direction: column-reverse` on each `div`, so the DOM order stays `dt`, then `dd`.
  - `.shell` is the content shell class: `width: min(1240px, 100vw - 2*var(--gutter)); margin-inline: auto`. Add it to `globals.css` if it is absent.

- [ ] **Step 3: Create `CaseStudyHost.tsx`** (client, on demand).

```tsx
"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { projects, type Project } from "@/data/projects";

// Not in first-load JS: the panel's chunk is requested on the first "Case study" activation (budget.spec.ts).
const CaseStudyPanel = dynamic(() => import("@/components/ui/CaseStudyPanel").then((m) => m.CaseStudyPanel), { ssr: false });

/** One delegated listener for every server-rendered [data-case-study] button on the page. */
export function CaseStudyHost() {
  const [project, setProject] = useState<Project | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const b = (e.target as Element | null)?.closest?.<HTMLElement>("[data-case-study]"); if (!b) return;
      opener.current = b; setProject(projects.find((p) => p.id === b.dataset.caseStudy) ?? null);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { if (project) setMounted(true); }, [project]);
  const close = useCallback(() => { setProject(null); requestAnimationFrame(() => opener.current?.focus()); }, []);
  // Stay mounted after the first open with project = null, so the panel's own AnimatePresence plays its exit.
  return mounted || project ? <CaseStudyPanel project={project} onClose={close} /> : null;
}
```

  - Importing `projects` pulls the project data into the client chunk. That is acceptable, since August's `Projects.tsx` already shipped it.
  - Measure with `npm run measure`. If `CaseStudyHost` adds more than 3 KB, fetch the project by id inside the dynamic chunk instead: pass only the id, and have the panel wrapper import `projects`.

  Add the no-JS rule: `<noscript><style>{".case-study-trigger{display:none}"}</style></noscript>` in `Work.tsx`. Without JS the button would do nothing, and the Source and Live links remain.

- [ ] **Step 4: Create `Work.tsx`** (server) and `worlds.css`.

```tsx
import { FlagshipScene } from "./FlagshipScene";
import { CaseStudyHost } from "./CaseStudyHost";
import { flagships, projectOf } from "@/data/work";
import Image from "next/image";
import "./worlds/worlds.css";

/** Spec §5.2 "each project becomes the whole website". The flagship run is a dark stage in both themes
 *  (Plan 2 decision 1); More Work follows the site theme. */
export function Work({ worlds = {} }: { worlds?: Partial<Record<string, React.ReactNode>> }) {
  return (
    <section id="work" aria-labelledby="work-title">
      {/* Hero above is dark in both themes, so no top seam; the bottom seam leads into the themed More Work. */}
      <div data-theme="dark" className="work__stage seam-bottom-dark bg-[var(--bg)]">
        <header className="shell pt-[clamp(7rem,14vh,12rem)] pb-10">
          <p className="label text-fg-subtle">Work</p>
          <h2 id="work-title" className="mt-4 text-[clamp(2.25rem,5vw,4.5rem)] font-semibold tracking-[-0.035em] text-fg">Selected work</h2>
          <p className="mt-4 max-w-[62ch] text-fg-muted" style={{ fontSize: "var(--text-lead)" }}>Four flagship projects, and two more worth a look.</p>
        </header>
        {flagships.map((f) => {
          const p = projectOf(f.id);
          return <FlagshipScene key={f.id} f={f} world={worlds[f.id] ?? (
            <div className="world-frame"><Image src={p.media!.image!} alt={p.media!.alt ?? ""} width={1600} height={900} sizes="(min-width:1024px) 50vw, 100vw" className="h-auto w-full" /></div>)} />;
        })}
      </div>
      {/* More Work (Task 17) renders here, in the site theme. */}
      <CaseStudyHost />
      <noscript><style>{".case-study-trigger{display:none}"}</style></noscript>
    </section>
  );
}
```

  `worlds.css` starts with the shared layout:

```css
.flagship__grid { display: grid; gap: clamp(2rem, 4vw, 4rem); align-items: center; padding-block: clamp(4rem, 10vh, 7rem); }
@media (min-width: 1024px) { .flagship__grid { grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); } }
.flagship__copy { position: relative; z-index: 2; }                /* never transformed: always legible */
.flagship__copy dl > div { display: flex; flex-direction: column-reverse; }
.flagship__world { position: relative; min-height: min(62svh, 640px); }
.world-frame { border-radius: 16px; overflow: hidden; border: 1px solid var(--line-strong); box-shadow: var(--shadow-float); }
.flagship__num { font-variant-numeric: tabular-nums; }
/* Unpinned (small screens) — spec §5.2 "a single in-view reveal"; never under reduced motion, never in no-JS
   (data-inview is only ever written by script). One-shot, transform/opacity only. */
.scene[data-pinned="false"][data-inview="true"] .flagship__world { animation: world-reveal 560ms var(--ease-out) both; }
@keyframes world-reveal { from { opacity: 0; transform: translateY(24px) scale(0.96); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .flagship__world { animation: none !important; } }
[data-reduced-motion="true"] .flagship__world { animation: none !important; }
.flagship__ghost { position: absolute; right: -2%; top: -8%; z-index: 0; pointer-events: none; font: 600 clamp(8rem, 18vw, 16rem)/1 var(--font-sans);
  letter-spacing: -0.06em; color: var(--fg); opacity: calc(0.06 * var(--assemble) * (1 - var(--recede)));
  transform: translateY(calc((1 - var(--assemble)) * 48px - var(--recede) * 32px)); }
```

- [ ] **Step 5: Wire up the page.**
  - In `app/page.tsx`, replace `<Projects />` (inside `Stage`) with `<Work />`, placed after `</Entrance>` and outside `Stage`. The remaining August sections stay in `Stage` until their tasks.
  - Restyle `CaseStudyPanel.tsx` to the new tokens only, mapping `--surface-*` to `--bg-raised` / `.raised` and `border-white/x` to `border-line`. Its behaviour and focus trap are untouched.
  - Remove `test.fixme` from the budget test's "case-study panel is not part of first-load JS" (Task 1).

- [ ] **Step 6: Run** `sections.spec.ts` (PASS, except the documented `fixme`), `budget.spec.ts` (now 2 active tests, PASS), both entrance suites, and the full gate, then `npm run measure`. Moving the panel out of first-load should *reduce* JS: record the delta.

- [ ] **Step 7: Screenshot**
  - Run `npm run shoot -- --out shots/t12 --theme dark --sections work,work-poker,work-aegis --sizes 1440x900,390x844`, and the same for `--theme light`.
  - Review the sheets: the copy is legible, the stage is dark in both themes, the seams are soft, and nothing overflows.

- [ ] **Step 8: Commit:** "Work section shell: flagship scenes with always-legible copy, case study loaded on demand".

---

### Task 13: T Poker world — three phones in depth over a reflective floor

**Files:**
- Create: `components/work/worlds/PokerWorld.tsx`
- Modify: `components/work/worlds/worlds.css`, `app/page.tsx` (`<Work worlds={{ poker: <PokerWorld /> }} />`)
- Test: `tests/e2e/sections.spec.ts` (append)

**Interfaces:**
- Consumes: the CSS vars `--assemble`, `--hold` and `--recede` from the enclosing `.scene` (Task 5); `projectOf("poker")`.
- Produces: `<PokerWorld />` (server).

- [ ] **Step 1: Write the failing test**

```ts
test("poker world: three phones, the front one rises as the others fan (transform-only)", async ({ page }) => {
  await page.goto("/"); await page.locator("[data-skip-intro]").click();
  const at = async (f: number) => {
    await page.evaluate((f) => { const s = document.getElementById("work-poker")!; window.scrollTo({ top: s.getBoundingClientRect().top + scrollY + (s.offsetHeight - innerHeight) * f, behavior: "instant" as ScrollBehavior }); }, f);
    await page.waitForTimeout(200);
    return page.locator(".world-poker__phone").evaluateAll((els) => els.map((el) => new DOMMatrix(getComputedStyle(el).transform)));
  };
  await expect(page.locator(".world-poker__phone")).toHaveCount(3);
  const early = await at(0.02), held = await at(0.5);
  expect(held[1].m42).toBeLessThan(early[1].m42);                    // front phone (index 1) has risen
  expect(Math.abs(held[0].m41)).toBeGreaterThan(Math.abs(early[0].m41)); // side phones fanned out
  await expect(page.locator(".world-poker img").first()).toHaveAttribute("alt", /.+/);
});
```

- [ ] **Step 2: Run it.** Expected: FAIL.

- [ ] **Step 3: Implement.**

```tsx
import Image from "next/image";
import { projectOf } from "@/data/work";

const SHOTS = ["/projects/poker/tournament-live.webp", "/projects/poker/home.webp", "/projects/poker/final-count.webp"];

/** Spec §5.2 world 01: generic phones (no device branding) in depth over a dark reflective floor. */
export function PokerWorld() {
  const p = projectOf("poker");
  const alt = (src: string) => [p.media?.image === src ? p.media?.alt : undefined, ...(p.media?.gallery ?? []).filter((g) => g.src === src).map((g) => g.alt)].find(Boolean) ?? "";
  return (
    <div className="world-poker">
      <div className="world-poker__floor" aria-hidden="true" />
      {SHOTS.map((src, i) => (
        <figure key={src} className={`world-poker__phone world-poker__phone--${["left", "front", "right"][i]}`}>
          <Image src={src} alt={alt(src)} width={1290} height={2796} sizes="(min-width:1024px) 16vw, 40vw" />
        </figure>
      ))}
    </div>
  );
}
```

```css
/* ── World 01 — T Poker ─────────────────────────────────────────────── */
.world-poker { position: relative; height: min(70svh, 680px); }
.world-poker__floor { position: absolute; inset: auto -10% 0; height: 42%;
  background: radial-gradient(60% 55% at 50% 0%, var(--light-cool), transparent 72%), linear-gradient(to bottom, #0a0e14, #05070a); }
.world-poker__phone { position: absolute; bottom: 16%; left: 50%; width: clamp(140px, 15vw, 220px); aspect-ratio: 1290 / 2796; margin: 0;
  border-radius: 26px; overflow: hidden; border: 1px solid var(--line-strong); background: #000; box-shadow: var(--shadow-float);
  translate: -50% 0; will-change: transform; }
.world-poker__phone img { width: 100%; height: 100%; object-fit: cover; }
/* Parallax per layer: 12 px (back) → 40 px (front) across the hold (spec §5.2). */
.world-poker__phone--front { z-index: 3;
  transform: translateY(calc((1 - var(--assemble)) * 120px - (var(--hold) - 0.5) * 40px - var(--recede) * 60px)) scale(calc(0.94 + var(--assemble) * 0.06));
  opacity: calc(0.35 + var(--assemble) * 0.65 - var(--recede) * 0.5); }
.world-poker__phone--left { z-index: 1;
  transform: translateX(calc(var(--assemble) * -64%)) translateY(calc(24px - (var(--hold) - 0.5) * 12px)) rotate(calc(var(--assemble) * -7deg)) scale(0.9);
  opacity: calc(var(--assemble) * 0.85 - var(--recede) * 0.6); }
.world-poker__phone--right { z-index: 1;
  transform: translateX(calc(var(--assemble) * 64%)) translateY(calc(24px - (var(--hold) - 0.5) * 12px)) rotate(calc(var(--assemble) * 7deg)) scale(0.9);
  opacity: calc(var(--assemble) * 0.85 - var(--recede) * 0.6); }
```

  In the settled defaults (`--assemble: 1`, `--hold: .5`, `--recede: 0`) the phones are fanned, fully opaque and at rest. That is the reduced-motion and small-screen composition. The largest parallax travel is 40 px, which is ≤ 48 px (§3.2).

- [ ] **Step 4: Run** the test (PASS) and the full gate, then `npm run measure`. The JS delta must be about 0, since this is a server component.

- [ ] **Step 5: Screenshot** `--sections work-poker` at all six sizes, dark and light, plus the pinned p = 0.02, 0.5 and 0.95 via an ad-hoc `page.evaluate` in `shoot.mjs` (`--sections work-poker@0.02,work-poker@0.5`). Extend the section parser for `id@fraction` in this step. Compute the target as `el.getBoundingClientRect().top + scrollY + (el.offsetHeight - innerHeight) * fraction`. Never use `offsetTop`, which is relative to the positioned Work stage. Review the result.

- [ ] **Step 6: Commit:** "World 01: T Poker phones in depth, transform-only parallax".

---

### Task 14: Aegis world — the dashboard monitor, one scan pass, live-alert rows

**Files:**
- Create: `components/work/worlds/AegisWorld.tsx`
- Modify: `worlds.css`, `app/page.tsx`
- Test: `sections.spec.ts` (append)

- [ ] **Step 1: Write the failing test**

```ts
test("aegis world: dashboard monitor, three alert rows, one scan pass per entry (not a loop)", async ({ page }) => {
  await page.goto("/"); await page.locator("[data-skip-intro]").click();
  await page.evaluate(() => document.getElementById("work-aegis")!.scrollIntoView());
  await expect(page.locator(".world-aegis__row")).toHaveCount(3);
  const scan = page.locator(".world-aegis__scan");
  await expect(scan).toHaveCSS("animation-name", "aegis-scan");      // the animation actually resolved (valid tokens)
  await expect(scan).toHaveCSS("animation-iteration-count", "1");
  await expect(page.locator(".world-aegis")).toContainText(/local demo/i);
});
```

- [ ] **Step 2: Run it.** Expected: FAIL.

- [ ] **Step 3: Implement.** The alert rows are three horizontal crops of the real `live-alerts.webp`, not invented data.

```tsx
import Image from "next/image";

import { flagships, projectOf } from "@/data/work";

/** Spec §5.2 world 02: the real dashboard on a large monitor; alert rows slide in from the real live-alerts capture.
 *  Every image and alt comes from data (flagships[].worldAssets + projects media), so replacing the screenshots
 *  is a data-only change — no edit here (decision 6). */
export function AegisWorld() {
  const a = flagships.find((f) => f.id === "aegis")!.worldAssets!, p = projectOf("aegis");
  const alt = (src: string) => (p.media?.image === src ? p.media.alt : p.media?.gallery?.find((g) => g.src === src)?.alt) ?? "";
  return (
    <div className="world-aegis">
      <div className="world-aegis__monitor">
        <Image src={a.monitor} alt={alt(a.monitor)} width={3840} height={2160} sizes="(min-width:1024px) 55vw, 100vw" />
        <span className="world-aegis__scan" aria-hidden="true" />
      </div>
      {a.rows && <div className="world-aegis__rows" aria-hidden="true">
        {a.rows.centres.map((y, i) => (
          <div key={y} className="world-aegis__row" style={{ ["--i" as string]: i }}>
            <Image src={a.rows!.src} alt="" width={3840} height={2160} sizes="30vw" style={{ objectPosition: `50% ${y * 100}%` }} />
          </div>
        ))}
      </div>}
      <p className="world-aegis__badge label"><span aria-hidden="true" className="world-aegis__dot" /> Streaming — local demo</p>
    </div>
  );
}
```

```css
/* ── World 02 — Aegis ───────────────────────────────────────────── */
.world-aegis { position: relative; }
.world-aegis__monitor { position: relative; border-radius: 14px; overflow: hidden; border: 1px solid var(--line-strong); box-shadow: var(--shadow-float);
  transform: translateY(calc((1 - var(--assemble)) * 60px - var(--recede) * 40px)) scale(calc(0.96 + var(--assemble) * 0.04)); opacity: calc(0.4 + var(--assemble) * 0.6 - var(--recede) * 0.5); }
.world-aegis__monitor img { display: block; width: 100%; height: auto; }
.world-aegis__scan { position: absolute; inset: 0 auto 0 -30%; width: 30%; pointer-events: none;
  background: linear-gradient(90deg, transparent, rgba(91,156,255,0.16), transparent); opacity: 0; }
/* One pass per entry: re-armed only when data-inview flips back to true (one-shot, never a loop). */
.scene[data-inview="true"] .world-aegis__scan { animation: aegis-scan 1.4s var(--ease-out) 0.2s 1 both; }
@keyframes aegis-scan { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(460%); } }
@media (prefers-reduced-motion: reduce) { .world-aegis__scan { animation: none !important; } }
[data-reduced-motion="true"] .world-aegis__scan { animation: none !important; }
.world-aegis__rows { position: absolute; right: -4%; bottom: -8%; width: 46%; display: grid; gap: 8px; }
.world-aegis__row { height: 54px; border-radius: 10px; overflow: hidden; border: 1px solid var(--line); background: #0a0e14;
  transform: translateX(calc((1 - clamp(0, var(--assemble) * 3 - var(--i) * 0.6, 1)) * 60px)); opacity: clamp(0, var(--assemble) * 3 - var(--i) * 0.6, 1); }
.world-aegis__row img { width: 100%; height: 100%; object-fit: cover; }
.world-aegis__badge { position: absolute; left: 16px; top: 16px; display: inline-flex; gap: 8px; align-items: center; color: var(--fg-muted);
  background: rgba(5,7,10,0.72); border: 1px solid var(--line); border-radius: 999px; padding: 6px 12px; }
.world-aegis__dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); }
```

- [ ] **Step 4: Keep this world light-touch** while it uses the temporary pre-rename captures (decision 6). Do not polish the composition around them; the geometry, motion and tests are what count now.

  Then measure the three row centres on the current image, and write them into `worldAssets.rows.centres` in `data/work.ts`. Repeat this when the Aegis screenshots replace the current ones. The current image is open `public/projects/aegis/live-alerts.webp`: find three distinct alert rows and record their vertical centres. The test does not check this, so review the crop visually on the screenshot. Each row must show a real alert, not a header or empty space.

- [ ] **Step 5: Run** the tests and the gate, then `npm run measure`, and screenshot both themes. Commit: "World 02: Aegis dashboard, one scan pass, real live-alert rows".

---

### Task 15: DeveloperOS world — four windows converge into one workspace

**Files:**
- Create: `components/work/worlds/DeveloperOSWorld.tsx`
- Modify: `worlds.css`, `app/page.tsx`
- Test: `sections.spec.ts` (append)

- [ ] **Step 1: Write the failing test**

```ts
test("developeros world: four windows converge as the scene assembles; the citation card is present", async ({ page }) => {
  await page.goto("/"); await page.locator("[data-skip-intro]").click();
  const spread = async (f: number) => {
    await page.evaluate((f) => { const s = document.getElementById("work-developeros")!; window.scrollTo({ top: s.getBoundingClientRect().top + scrollY + (s.offsetHeight - innerHeight) * f, behavior: "instant" as ScrollBehavior }); }, f);
    await page.waitForTimeout(200);
    return page.locator(".world-dos__win").evaluateAll((els) => els.reduce((a, el) => a + Math.hypot(new DOMMatrix(getComputedStyle(el).transform).m41, new DOMMatrix(getComputedStyle(el).transform).m42), 0));
  };
  await expect(page.locator(".world-dos__win")).toHaveCount(4);
  expect(await spread(0.5)).toBeLessThan(await spread(0.02));    // converged
  await expect(page.locator(".world-dos__card")).toHaveText(/Grounded answers · file:line citations/);
});
```

- [ ] **Step 2: Run it.** Expected: FAIL.

- [ ] **Step 3: Implement**

```tsx
import Image from "next/image";
import { projectOf } from "@/data/work";

const WINS = [
  { src: "/projects/developeros/dashboard.webp", dx: -220, dy: -120, dz: -260, r: -6 },
  { src: "/projects/developeros/ai-features.webp", dx: 240, dy: -90, dz: -180, r: 5 },
  { src: "/projects/developeros/learning.webp", dx: -200, dy: 150, dz: -320, r: 4 },
  { src: "/projects/developeros/career.webp", dx: 230, dy: 170, dz: -220, r: -5 },
];

/** Spec §5.2 world 03: four real windows start scattered in depth and converge into one organised workspace. */
export function DeveloperOSWorld() {
  const p = projectOf("developeros");
  const alt = (src: string) => (p.media?.image === src ? p.media.alt : p.media?.gallery?.find((g) => g.src === src)?.alt) ?? "";
  return (
    <div className="world-dos">
      {WINS.map((w, i) => (
        <figure key={w.src} className="world-dos__win" style={{ ["--dx" as string]: `${w.dx}px`, ["--dy" as string]: `${w.dy}px`, ["--dz" as string]: `${w.dz}px`, ["--r" as string]: `${w.r}deg`, ["--i" as string]: i }}>
          <Image src={w.src} alt={alt(w.src)} width={2880} height={1620} sizes="(min-width:1024px) 28vw, 50vw" />
        </figure>
      ))}
      <p className="world-dos__card">Grounded answers · file:line citations</p>
    </div>
  );
}
```

```css
/* ── World 03 — DeveloperOS ──────────────────────────────────────────── */
.world-dos { position: relative; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; perspective: 1600px; }
.world-dos__win { margin: 0; border-radius: 12px; overflow: hidden; border: 1px solid var(--line-strong); box-shadow: var(--shadow-float); background: #0a0e14;
  transform: translate3d(calc((1 - var(--assemble)) * var(--dx)), calc((1 - var(--assemble)) * var(--dy) - (var(--hold) - 0.5) * 16px), calc((1 - var(--assemble)) * var(--dz)))
             rotate(calc((1 - var(--assemble)) * var(--r)));
  opacity: calc(0.3 + var(--assemble) * 0.7 - var(--recede) * 0.5); }
.world-dos__win img { display: block; width: 100%; height: auto; }
.world-dos__card { position: absolute; left: 50%; bottom: -18px; translate: -50% 0; white-space: nowrap; padding: 10px 16px; border-radius: 999px;
  background: rgba(10,14,20,0.92); border: 1px solid var(--line-strong); color: var(--fg); font: 500 0.8125rem/1 var(--font-mono);
  transform: translateY(calc((1 - var(--assemble)) * 24px)); opacity: var(--assemble); }
```

  The hold parallax (16 px) stays ≤ 48 px. The settled defaults give the organised 2 × 2 workspace.

- [ ] **Step 4: Run** the gate, then `npm run measure`, and screenshot. Commit: "World 03: DeveloperOS windows converge into one workspace".

---

### Task 16: GRAVITY FLOW world — phone frame and the orbital field (the site's one loop)

**Files:**
- Create: `components/work/worlds/GravityWorld.tsx`, `components/work/worlds/GravityField.tsx`, `components/work/worlds/GravityFieldLazy.tsx`
- Modify: `worlds.css`, `app/page.tsx`
- Test: `sections.spec.ts`, `idle.spec.ts` (append)

**Interfaces:**
- Consumes: the `[data-inview]` and `--p` attributes and vars on the enclosing scene (Task 5); `useReducedMotionPref`.
- Produces: a loop that runs **only** while the scene is in view, the document is visible, and motion is allowed. It draws one static frame otherwise.

- [ ] **Step 1: Write the failing tests**

```ts
// sections.spec.ts
test("gravity world: the field loops only while in view, and never under reduced motion (Review Focus 3)", async ({ page }) => {
  await page.goto("/"); await page.locator("[data-skip-intro]").click();
  const raf = (ms: number) => page.evaluate(async (ms) => { let n = 0; const o = requestAnimationFrame; window.requestAnimationFrame = (cb) => o((t) => { n++; cb(t); }); await new Promise((r) => setTimeout(r, ms)); window.requestAnimationFrame = o; return n; }, ms);
  await page.evaluate(() => document.getElementById("work-gravity-flow")!.scrollIntoView());
  await page.waitForTimeout(900);
  expect(await raf(1000)).toBeGreaterThan(20);                 // running in view
  await page.emulateMedia({ reducedMotion: "reduce" }); await page.waitForTimeout(300);
  expect(await raf(1000)).toBe(0);                             // stopped under reduced motion
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.evaluate(() => document.getElementById("contact")!.scrollIntoView()); await page.waitForTimeout(900);
  expect(await raf(1000)).toBe(0);                             // stopped out of view
  await expect(page.locator(".world-gravity img")).toHaveAttribute("alt", /.+/);
  await expect(page.locator(".world-gravity")).toContainText(/Android-only/);
});
```

  `#contact` exists from the August section until Task 21 replaces it.

- [ ] **Step 2: Run it.** Expected: FAIL.

- [ ] **Step 3: Implement.**

```tsx
// GravityWorld.tsx (server)
import Image from "next/image";
import { GravityFieldLazy } from "./GravityFieldLazy";

/** Spec §5.2 world 04: the gameplay capture in a phone frame; the orbital field extends past the frame. */
export function GravityWorld() {
  return (
    <div className="world-gravity">
      <GravityFieldLazy />
      <figure className="world-gravity__phone">
        <Image src="/projects/gravity-flow/gameplay.webp" alt="GRAVITY FLOW gameplay: a gravity well pulling a star through a level" width={640} height={1280} sizes="(min-width:1024px) 14vw, 40vw" />
      </figure>
      <figure className="world-gravity__inset">
        <Image src="/projects/gravity-flow/boss.webp" alt="GRAVITY FLOW world boss encounter" width={640} height={1280} sizes="8vw" />
      </figure>
      <p className="world-gravity__note label">v1.0.0-rc · Android-only</p>
    </div>
  );
}
```

```tsx
// GravityFieldLazy.tsx — mounts the field only when its scene nears the viewport (keeps it out of first-load JS).
"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
const GravityField = dynamic(() => import("./GravityField").then((m) => m.GravityField), { ssr: false });
export function GravityFieldLazy() {
  const ref = useRef<HTMLDivElement>(null); const [near, setNear] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect(); } }, { rootMargin: "50% 0px" });
    if (ref.current) io.observe(ref.current); return () => io.disconnect();
  }, []);
  return <div ref={ref} className="world-gravity__field" aria-hidden="true">{near && <GravityField />}</div>;
}
```

```tsx
// GravityField.tsx — the site's ONE time-based loop (spec §7): in view only, visible tab only, never under reduced motion.
"use client";
import { useEffect, useRef } from "react";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";

type Star = { r: number; a: number; w: number; s: number };
export function GravityField() {
  const cv = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotionPref();
  useEffect(() => {
    const canvas = cv.current!, ctx = canvas.getContext("2d")!, scene = canvas.closest<HTMLElement>("[data-scene]")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0, raf = 0, last = 0, t = 0, px = 0, py = 0;
    const stars: Star[] = Array.from({ length: 90 }, (_, i) => ({ r: 40 + ((i * 37) % 260), a: (i * 2.399) % (Math.PI * 2), w: 0.00012 + ((i * 13) % 17) * 0.00001, s: 0.6 + ((i * 7) % 5) * 0.25 }));
    const size = () => { const r = canvas.getBoundingClientRect(); W = r.width; H = r.height; canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const draw = (dt: number) => {
      const p = parseFloat(scene.style.getPropertyValue("--p") || "0.5");     // inline var read: no style recalc
      const speed = 0.6 + p * 1.2;                                            // scroll sets orbit speed
      t += dt * speed; ctx.clearRect(0, 0, W, H);
      const cx = W / 2 + px * 12, cy = H / 2 + py * 12;                       // pointer bends paths gently (≤ 12 px)
      ctx.strokeStyle = "rgba(91,156,255,0.10)"; ctx.lineWidth = 1;
      for (const k of [90, 160, 240]) { ctx.beginPath(); ctx.ellipse(cx, cy, k, k * 0.42, -0.35, 0, Math.PI * 2); ctx.stroke(); }
      for (const s of stars) {
        const a = s.a + t * s.w; const x = cx + Math.cos(a) * s.r, y = cy + Math.sin(a) * s.r * 0.42;
        ctx.fillStyle = "rgba(210,225,255,0.75)"; ctx.beginPath(); ctx.arc(x, y, s.s, 0, Math.PI * 2); ctx.fill();
      }
    };
    const loop = (now: number) => { draw(last ? now - last : 16); last = now; raf = requestAnimationFrame(loop); };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; last = 0; };
    const sync = () => {
      const run = !reduced && scene.dataset.inview === "true" && !document.hidden;
      if (run && !raf) raf = requestAnimationFrame(loop); else if (!run && raf) stop();
      if (!run) draw(0);                                                       // one static frame
    };
    const onPointer = (e: PointerEvent) => { if (e.pointerType === "touch") return; const r = canvas.getBoundingClientRect(); px = ((e.clientX - r.left) / r.width - 0.5) * 2; py = ((e.clientY - r.top) / r.height - 0.5) * 2; };
    size(); sync();
    const mo = new MutationObserver(sync); mo.observe(scene, { attributes: true, attributeFilter: ["data-inview"] });
    const ro = new ResizeObserver(() => { size(); if (!raf) draw(0); }); ro.observe(canvas);
    document.addEventListener("visibilitychange", sync); scene.addEventListener("pointermove", onPointer);
    return () => { stop(); mo.disconnect(); ro.disconnect(); document.removeEventListener("visibilitychange", sync); scene.removeEventListener("pointermove", onPointer); };
  }, [reduced]);
  return <canvas ref={cv} className="h-full w-full" />;
}
```

```css
/* ── World 04 — GRAVITY FLOW ─────────────────────────────────────────── */
.world-gravity { position: relative; display: grid; place-items: center; min-height: min(70svh, 680px); }
.world-gravity__field { position: absolute; inset: -12% -20%; pointer-events: none; }
.world-gravity__phone { position: relative; margin: 0; width: clamp(150px, 14vw, 220px); aspect-ratio: 1 / 2; border-radius: 26px; overflow: hidden;
  border: 1px solid var(--line-strong); box-shadow: var(--shadow-float); background: #000;
  transform: translateY(calc((1 - var(--assemble)) * 80px - (var(--hold) - 0.5) * 24px - var(--recede) * 50px)); opacity: calc(0.4 + var(--assemble) * 0.6 - var(--recede) * 0.5); }
.world-gravity__phone img { width: 100%; height: 100%; object-fit: cover; }
.world-gravity__note { position: absolute; bottom: 4%; color: var(--fg-subtle); }
.world-gravity__inset { position: absolute; right: 8%; top: 12%; margin: 0; width: clamp(80px, 7vw, 110px); aspect-ratio: 1 / 2; border-radius: 16px; overflow: hidden;
  border: 1px solid var(--line-strong); box-shadow: var(--shadow-float); transform: translateY(calc((1 - var(--assemble)) * 40px + (var(--hold) - 0.5) * -12px)); opacity: calc(var(--assemble) * 0.9 - var(--recede) * 0.6); }
.world-gravity__inset img { width: 100%; height: 100%; object-fit: cover; }
```

  - `data-inview` flips when the scene's IntersectionObserver fires (Task 5); scrolling away stops the loop. The MutationObserver watches only that attribute.
  - Under reduced motion `ScrollScene` does not pin, but `data-inview` still updates, so `sync` still stops the loop because `reduced` is true. The effect re-runs when `reduced` changes, because it is a dependency.

- [ ] **Step 4: Run** the tests (PASS), `idle.spec.ts` (still 0 at the page bottom), the entrance suites and the gate, then `npm run measure`. The field must stay **out** of first-load JS: its chunk loads only near the scene. Record the delta. Screenshot the result and commit: "World 04: GRAVITY FLOW phone and orbital field — the one in-view-only loop".

---

### Task 17: More Work — two wide rows with the real pipeline shapes

**Files:**
- Create: `components/work/MoreWork.tsx`, `components/work/PipelineDiagram.tsx`
- Modify: `components/work/Work.tsx` (render `<MoreWork />` where the comment marks it), `sections.spec.ts` (remove the Task 12 `fixme`)
- Test: `tests/unit/work.test.ts` (diagram labels), `sections.spec.ts`

- [ ] **Step 1: Write the failing e2e test**

```ts
test("more work: two unpinned rows with their pipeline diagrams, and the coursework label", async ({ page }) => {
  await page.goto("/"); await page.locator("[data-skip-intro]").click();
  const rows = page.locator(".more-work__row");
  await expect(rows).toHaveCount(2);
  await expect(rows.nth(0).locator("svg text")).toHaveText(["collect", "filter", "dedup", "deliver"]);
  await expect(rows.nth(1).locator("svg text")).toHaveText(["client", "TCP", "server"]);
  await expect(rows.nth(1)).toContainText("Coursework");
  await expect(page.locator(".more-work .scene")).toHaveCount(0);          // never pinned
});
```

- [ ] **Step 2: Implement `PipelineDiagram.tsx`** (server SVG, `role="img"` with a text alternative).

```tsx
/** The real shape of a system, drawn small (spec §5.2 More Work): a left-to-right pipeline, or a duplex link. */
export function PipelineDiagram({ uid, kind, nodes, label }: { uid: string; kind: "pipeline" | "duplex"; nodes: string[]; label: string }) {
  const W = 520, H = 72, gap = W / nodes.length, bw = Math.min(118, gap - 22);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="h-auto w-full max-w-[520px]">
      {nodes.map((n, i) => {
        const x = i * gap + (gap - bw) / 2;
        return (
          <g key={n}>
            <rect x={x} y={16} width={bw} height={40} rx={10} fill="none" stroke="var(--line-strong)" />
            <text x={x + bw / 2} y={41} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={13} fill="var(--fg-muted)">{n}</text>
            {i < nodes.length - 1 && (
              <path d={`M${x + bw + 4} 36 H${x + gap - 4}`} stroke="var(--accent)" strokeWidth={1.25}
                markerEnd={`url(#arrow-${uid})`} markerStart={kind === "duplex" ? `url(#arrow-back-${uid})` : undefined} />
            )}
          </g>
        );
      })}
      <defs>
        <marker id={`arrow-${uid}`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="var(--accent)" /></marker>
        <marker id={`arrow-back-${uid}`} viewBox="0 0 8 8" refX="1" refY="4" markerWidth="8" markerHeight="8" orient="auto"><path d="M8 0 L0 4 L8 8 z" fill="var(--accent)" /></marker>
      </defs>
    </svg>
  );
}
```

  `uid` keeps the SVG marker ids unique when both rows render on the same page.

- [ ] **Step 3: Implement `MoreWork.tsx`** (server, site theme).

```tsx
import { moreWork, projectOf } from "@/data/work";
import { PipelineDiagram } from "./PipelineDiagram";
import { StatusChip } from "@/components/ui/Tag";
import { ButtonLink } from "@/components/ui/Button";

export function MoreWork() {
  return (
    <div className="more-work shell py-[clamp(5rem,10vh,8rem)]">
      <p className="label text-fg-subtle">More work</p>
      <div className="mt-8 grid gap-6">
        {moreWork.map((r) => {
          const p = projectOf(r.id); const ms = r.metricLabels.map((l) => p.metrics.find((m) => m.label === l)!);
          return (
            <article key={r.id} className="more-work__row raised grid gap-6 rounded-[24px] border border-line p-[clamp(1.5rem,3vw,2.5rem)] lg:grid-cols-[1.1fr_1fr] lg:items-center">
              <div>
                <p className="label flex items-center gap-3 text-fg-subtle"><StatusChip status={p.status} /><span>{p.context}</span></p>
                <h3 className="mt-3 text-[clamp(1.5rem,2.6vw,2rem)] font-semibold text-fg">{p.name}</h3>
                <p className="mt-2 max-w-[62ch] text-fg-muted">{p.summary}</p>
                <dl className="mt-5 flex gap-8">{ms.map((m) => <div key={m.label} className="flex flex-col-reverse"><dt className="label text-fg-subtle">{m.label}</dt><dd className="text-2xl font-semibold text-fg">{m.value}</dd></div>)}</dl>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button type="button" data-case-study={p.id} className="case-study-trigger inline-flex h-11 items-center rounded-full border border-line px-5 text-sm text-fg hover:border-line-strong">Case study</button>
                  <ButtonLink href={p.repoUrl} variant="ghost" external>Source</ButtonLink>
                </div>
              </div>
              <PipelineDiagram uid={r.id} kind={r.diagram.kind} nodes={r.diagram.nodes} label={`${p.name}: ${r.diagram.nodes.join(r.diagram.kind === "duplex" ? " ⇄ " : " → ")}`} />
            </article>
          );
        })}
      </div>
    </div>
  );
}
```

  The `Coursework` text comes from `StatusChip` (`Tag.tsx`, `STATUS_COPY.coursework`).

- [ ] **Step 4: Run** the tests (PASS, including the un-fixme'd `h3` order test) and the gate, then `npm run measure`. Screenshot More Work in both themes; it follows the site theme. Commit: "More Work: Job Assistant and Orders & Delivery rows with their real system shapes".

---
### Task 18: About — "Engineer by training. / Builder by nature." and the facts row

**Files:**
- Create: `data/about.ts`
- Rewrite: `components/sections/About.tsx` (a server component; drops `ArchitectureBoard`, `Panel` and `Reveal`)
- Test: `tests/unit/about.test.ts`, `sections.spec.ts` (append)

**Interfaces:**
- Produces: `about = { title: [string, string]; paragraphs: [string, string]; facts: { value: string; label: string }[] }`, plus `<About />` with `id="about"` and `h2#about-title`.

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/about.test.ts
import { it, expect } from "vitest";
import { about } from "@/data/about";

it("uses the spec §5.3 title and the approved facts row", () => {
  expect(about.title).toEqual(["Engineer by training.", "Builder by nature."]);
  expect(about.facts).toEqual([
    { value: "B.Sc.", label: "Computer Science" }, { value: "Full stack", label: "Web · Mobile · Backend" },
    { value: "Israel", label: "GMT+3 · works in English" }, { value: "∞", label: "Still learning" }]);
});
it("is two paragraphs with no new claims: no counts at all (1,742 lives only in Stack, spec §5.3)", () => {
  expect(about.paragraphs).toHaveLength(2);
  for (const p of about.paragraphs) { expect(p).not.toMatch(/\d/); expect(p).not.toMatch(/6\+|shipped projects/i); }
});
```

- [ ] **Step 2: Run it.** Expected: FAIL.

- [ ] **Step 3: Create `data/about.ts`.** The paragraphs are condensed from the August About copy (`components/sections/About.tsx` at `5e596c8`). Every clause below exists there. The "1,742 tests" clause is dropped per spec §5.3, and the three-paragraph original becomes two.

```ts
/** About (spec §5.3). Condensed from the August About copy; nothing added. */
export const about = {
  title: ["Engineer by training.", "Builder by nature."] as [string, string],
  paragraphs: [
    "I'm a Computer Science graduate, and nearly everything I build comes back to one idea: make the wrong thing hard to express. Money moves in integer cents, so a rounding error has nowhere to live. Module boundaries are compile errors, not code-review habits. A retrieval layer that can't cite a file and a line refuses to answer rather than guess.",
    "That started in C and C++, where nothing is handed to you and the machine is honest about what you got wrong. It carries into the C#/.NET, TypeScript and Python work I do now — each taken from an empty repo to a running system. I'm looking for a junior software development role on a team that ships.",
  ] as [string, string],
  facts: [
    { value: "B.Sc.", label: "Computer Science" },
    { value: "Full stack", label: "Web · Mobile · Backend" },
    { value: "Israel", label: "GMT+3 · works in English" },
    { value: "∞", label: "Still learning" },
  ],
};
```

- [ ] **Step 4: Rewrite `About.tsx`** (server).

```tsx
import { about } from "@/data/about";

export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="shell py-[clamp(7rem,14vh,12rem)]">
      <p className="label text-fg-subtle">About</p>
      <h2 id="about-title" className="mt-4 text-[clamp(2.25rem,5vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-fg">
        {about.title[0]}<br /><span className="text-fg-muted">{about.title[1]}</span>
      </h2>
      <div className="mt-10 grid gap-6 text-[17px] leading-[1.6] text-fg-muted lg:grid-cols-2 lg:gap-12">
        {about.paragraphs.map((p) => <p key={p.slice(0, 24)} className="max-w-[62ch]">{p}</p>)}
      </div>
      <dl className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-[16px] border border-line bg-[var(--line)] lg:grid-cols-4">
        {about.facts.map((f) => (
          <div key={f.value} className="raised flex flex-col-reverse gap-2 p-6">
            <dt className="label text-fg-subtle">{f.label}</dt>
            <dd className="text-[clamp(1.75rem,3vw,2.5rem)] font-semibold tracking-[-0.03em] text-fg">{f.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
```

  Add `sections.spec.ts` checks: `#about h2` contains "Builder by nature.", the four `dd`s are in order, and there is no overflow at 375 px.

- [ ] **Step 5: Run** the gate, then `npm run measure`. It should *drop*, because `ArchitectureBoard` and `Reveal` leave the About path; record it. Screenshot both themes, then commit: "About: engineer by training, builder by nature — condensed copy, approved facts row".

---

### Task 19: Stack — the six groups as a bento, pointer light on the hovered card

**Files:**
- Create: `components/sections/Stack.tsx`, `components/ui/PointerLight.tsx`
- Modify: `app/page.tsx` (replace `<Skills />`)
- Test: `sections.spec.ts` (append)

**Interfaces:**
- Consumes: `skillGroups` (`data/skills.ts`, unchanged), `GroupGlyph({ glyph, className })`.
- Produces: `<Stack />` with `id="skills"` (nav, palette and deep links keep working) and `h2#stack-title`. `<PointerLight />` is a client listener over `[data-pointer-light]` containers, targeting `[data-card]`.

- [ ] **Step 1: Write the failing test**

```ts
test("stack: six groups in data order, the two lead groups are wide with their figures", async ({ page }) => {
  await page.goto("/"); await page.locator("[data-skip-intro]").click();
  await expect(page.locator("#skills h2")).toHaveText("The tools I build with.");
  await expect(page.locator("#skills")).toContainText("Enough range to own a product end to end.");
  await expect(page.locator("#skills [data-card] h3")).toHaveText(["Languages", "Interface", "Services & APIs", "Data & State", "Delivery", "Verification"]);
  await expect(page.locator("#skills [data-card][data-wide]")).toHaveCount(2);
  await expect(page.locator("#skills [data-card][data-wide]").nth(1)).toContainText("1,742");
});

test("pointer light follows the hovered card only, and not under reduced motion", async ({ page }) => {
  await page.goto("/"); await page.locator("[data-skip-intro]").click();
  const card = page.locator("#skills [data-card]").first(); await card.scrollIntoViewIfNeeded();
  const box = (await card.boundingBox())!; await page.mouse.move(box.x + 40, box.y + 30);
  await expect.poll(() => card.evaluate((el) => el.style.getPropertyValue("--mx"))).toMatch(/px$/);
  await page.emulateMedia({ reducedMotion: "reduce" }); await page.mouse.move(box.x + 90, box.y + 60);
  await expect.poll(() => card.evaluate((el) => el.style.getPropertyValue("--mx"))).toBe("");
});
```

- [ ] **Step 2: Implement**

```tsx
// Stack.tsx (server)
import { skillGroups } from "@/data/skills";
import { GroupGlyph } from "@/components/ui/GroupGlyph";
import { PointerLight } from "@/components/ui/PointerLight";

/** Spec §5.4: the six groups exactly as data/skills.ts has them; the two lead groups are wide. */
export function Stack() {
  return (
    <section id="skills" aria-labelledby="stack-title" className="shell py-[clamp(7rem,14vh,12rem)]">
      <p className="label text-fg-subtle">Stack</p>
      <h2 id="stack-title" className="mt-4 text-[clamp(2.25rem,5vw,4.5rem)] font-semibold tracking-[-0.035em] text-fg">The tools I build with.</h2>
      <p className="mt-4 text-fg-muted" style={{ fontSize: "var(--text-lead)" }}>Enough range to own a product end to end.</p>
      <div data-pointer-light className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {skillGroups.map((g) => (
          <article key={g.id} data-card data-wide={g.lead ? "" : undefined} className={`stack-card raised relative overflow-hidden rounded-[24px] border border-line p-7 ${g.lead ? "lg:col-span-2" : ""}`}>
            <GroupGlyph glyph={g.glyph} />
            <h3 className="mt-5 text-lg font-semibold text-fg">{g.title}</h3>
            {g.lead && <p className="mt-3 flex items-baseline gap-3"><span className="text-[clamp(2.5rem,5vw,4rem)] font-semibold tracking-[-0.04em] text-fg">{g.lead.value}</span><span className="label text-fg-subtle">{g.lead.unit}</span></p>}
            <ul className="mt-5 flex flex-wrap gap-2">{g.items.map((i) => <li key={i.label} className={`label rounded-full border px-2.5 py-1 ${i.emphasis ? "border-line-strong text-fg" : "border-line text-fg-muted"}`}>{i.label}</li>)}</ul>
            <p className="mt-5 text-[15px] leading-relaxed text-fg-muted">{g.evidence}</p>
          </article>
        ))}
      </div>
      <PointerLight />
    </section>
  );
}
```

```tsx
// PointerLight.tsx — one delegated listener; lights only the hovered card; off on touch and reduced motion.
"use client";
import { useEffect } from "react";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";
export function PointerLight() {
  const reduced = useReducedMotionPref();
  useEffect(() => {
    const clear = () => document.querySelectorAll<HTMLElement>("[data-pointer-light] [data-card]").forEach((c) => { c.style.removeProperty("--mx"); c.style.removeProperty("--my"); });
    if (reduced) { clear(); return; }
    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const card = (e.target as Element).closest?.<HTMLElement>("[data-pointer-light] [data-card]"); if (!card) return;
      const r = card.getBoundingClientRect(); card.style.setProperty("--mx", `${e.clientX - r.left}px`); card.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    const leave = (e: PointerEvent) => { const c = (e.target as Element).closest?.<HTMLElement>("[data-card]"); c?.style.removeProperty("--mx"); c?.style.removeProperty("--my"); };
    document.addEventListener("pointermove", move, { passive: true }); document.addEventListener("pointerout", leave, { passive: true });
    return () => { document.removeEventListener("pointermove", move); document.removeEventListener("pointerout", leave); clear(); };
  }, [reduced]);
  return null;
}
```

  Put this CSS in `components/sections/stack.css`, imported by `Stack.tsx`. The card's content must sit above the light, so give the card's direct children `position: relative; z-index: 1`:

```css
.stack-card > * { position: relative; z-index: 1; }
/* Pointer light (spec §5.4): drawn only while --mx is set, i.e. on the hovered card, with a fine pointer. */
.stack-card::before { content: ""; position: absolute; inset: 0; pointer-events: none; opacity: 0; transition: opacity var(--dur-mid, 320ms);
  background: radial-gradient(320px circle at var(--mx, 50%) var(--my, 50%), var(--light-cool), transparent 70%); }
@media (hover: hover) and (pointer: fine) { .stack-card:hover::before { opacity: 1; } }
```

  The `pointerout` handler above fires when moving between children of the same card. Filter it with `if (c && e.relatedTarget instanceof Node && c.contains(e.relatedTarget)) return;`, so the light does not flicker inside a card.

- [ ] **Step 3: Run** the tests, the gate and `npm run measure` (under +1 KB). Screenshot both themes, then commit: "Stack: the six data groups as a bento, pointer light on the hovered card".

---

### Task 20: Think · Build · Ship — a typographic, pinned sequence

**Files:**
- Modify: `data/approach.ts` (add `pillars`)
- Create: `components/sections/ThinkBuildShip.tsx`, `components/sections/ThinkBuildShip.css`
- Modify: `app/page.tsx` (replace `<EngineeringPanel />`)
- Test: `tests/unit/approach.test.ts`, `sections.spec.ts`, `tests/e2e/scene.spec.ts` (the `data-lit` cleared case)

**Interfaces:**
- Consumes: `approachSteps` (ids `understand`, `design`, `build`, `verify`, `ship`).
- Produces:
  - `pillars: { word: "Think" | "Build" | "Ship"; line: string; example: string; project: string; from: string[] }[]`, where `from` holds source step ids;
  - `<ThinkBuildShip />` with `id="approach"` (the palette target) and `h2#approach-title`.

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/approach.test.ts — each condensed example is drawn from the steps it cites (spec §5.5).
import { it, expect } from "vitest";
import { approachSteps, pillars } from "@/data/approach";

const words = (s: string) => new Set(s.toLowerCase().match(/[a-z]{4,}/g) ?? []);
it("lines are the spec's", () => {
  expect(pillars.map((p) => [p.word, p.line])).toEqual([["Think", "Architecture before implementation."], ["Build", "Clean, maintainable systems."], ["Ship", "Test. Deploy. Improve."]]);
});
it("each example shares ≥ 60% of its content words with the evidence it cites, and adds no numbers", () => {
  for (const p of pillars) {
    const src = p.from.map((id) => approachSteps.find((s) => s.id === id)!).map((s) => `${s.summary} ${s.evidence} ${s.project}`).join(" ");
    const w = [...words(p.example)], hit = w.filter((x) => words(src).has(x)).length;
    expect(hit / w.length, p.word).toBeGreaterThanOrEqual(0.6);
    for (const n of p.example.match(/\d+/g) ?? []) expect(src).toContain(n);
  }
});
```

- [ ] **Step 2: Add `pillars` to `data/approach.ts`.**

```ts
/** Think · Build · Ship (spec §5.5): three words, each with one real example condensed from the steps above. */
export const pillars = [
  { word: "Think", line: "Architecture before implementation.", from: ["understand"], project: "T Poker",
    example: "The hard part of T Poker wasn't the poker UI: it was guaranteeing the money is exact on a phone with no signal, and still correct when the server reconnects." },
  { word: "Build", line: "Clean, maintainable systems.", from: ["design"], project: "Aegis",
    example: "Eight bounded contexts, structured so a cross-module reference fails to compile — verified by a script, not by code review." },
  { word: "Ship", line: "Test. Deploy. Improve.", from: ["verify", "ship"], project: "T Poker · Aegis",
    example: "The TypeScript settlement fixtures mirror the C# service case for case, and Aegis comes up from a single Docker command that gates on health." },
] as const;
```

  Run the test: PASS.

- [ ] **Step 3: Test `ScrollScene`'s pillars mode.** It already writes `data-lit` and `--tbs-line`, and clears both when unpinned (Task 5). Extend `scene.spec.ts` with a pillars fixture: add a second `ScrollScene phases="pillars"` to `app/e2e-fixtures/scene/page.tsx`. Assert that `data-lit` is set while pinned, and absent after resizing below the threshold.

- [ ] **Step 4: Implement the section.**

```tsx
import { ScrollScene } from "@/components/scenes/ScrollScene";
import { pillars } from "@/data/approach";
import "./ThinkBuildShip.css";

/** Spec §5.5: pinned 200svh where pinning applies; otherwise (and under reduced motion) a static stacked list. */
export function ThinkBuildShip() {
  return (
    <ScrollScene id="approach" labelledBy="approach-title" phases="pillars" className="tbs">
      <div className="shell">
        <h2 id="approach-title" className="sr-only">Think. Build. Ship.</h2>
        <p aria-hidden="true" className="tbs__words">
          {pillars.map((p, i) => <span key={p.word} data-i={i} className="tbs__word">{p.word}.</span>)}
        </p>
        <div className="tbs__line" aria-hidden="true"><span /></div>
        <ol className="tbs__slots">
          {pillars.map((p, i) => (
            <li key={p.word} data-i={i} className="tbs__slot">
              <h3 className="text-xl font-semibold text-fg"><span className="sr-only">{p.word}: </span>{p.line}</h3>
              <p className="mt-3 max-w-[62ch] text-fg-muted">{p.example}</p>
              <p className="label mt-3 text-fg-subtle">{p.project}</p>
            </li>
          ))}
        </ol>
      </div>
    </ScrollScene>
  );
}
```

```css
/* Static (default, reduced motion, small screens, no JS): every word lit, all three slots stacked. */
.tbs__words { display: flex; gap: 0.4em; flex-wrap: wrap; font-size: clamp(3rem, 9vw, 8rem); font-weight: 600; letter-spacing: -0.045em; line-height: 1; }
.tbs__word { color: var(--fg); transition: color 320ms var(--ease-out); }
.tbs__line { margin-top: 24px; height: 1px; background: var(--line); }
.tbs__line > span { display: block; height: 100%; background: var(--accent); transform-origin: 0 50%; transform: scaleX(var(--tbs-line)); }
.tbs__slots { margin-top: 40px; display: grid; gap: 40px; }
/* Pinned: data-lit is present → one word lit, one slot shown (the others stay in the DOM for screen readers). */
.tbs[data-lit] .tbs__word { color: var(--fg-subtle); }
.tbs[data-lit="0"] .tbs__word[data-i="0"], .tbs[data-lit="1"] .tbs__word[data-i="1"], .tbs[data-lit="2"] .tbs__word[data-i="2"] { color: var(--fg); }
.tbs[data-lit] .tbs__slots { display: grid; grid-template-areas: "slot"; }
.tbs[data-lit] .tbs__slot { grid-area: slot; opacity: 0; transform: translateY(12px); transition: opacity 320ms var(--ease-out), transform 320ms var(--ease-out); }
.tbs[data-lit="0"] .tbs__slot[data-i="0"], .tbs[data-lit="1"] .tbs__slot[data-i="1"], .tbs[data-lit="2"] .tbs__slot[data-i="2"] { opacity: 1; transform: none; transition-duration: 320ms; }
```

  - The slot swap is a discrete, one-shot transition, not a loop, and it animates `transform` and `opacity` only.
  - Exit runs at about 65% of the enter duration: set the non-lit rule's `transition-duration: 210ms`.
  - The slots are a real list with `h3` headings, so the heading order is `h2` → `h3`.

- [ ] **Step 5: Add e2e checks in `sections.spec.ts`.**
  - Pinned at 1440 × 900: at p ≈ 0.2 only "Think." has `color == --fg`; at p ≈ 0.85, "Ship.".
  - At 390 × 844, all three slots are visible, stacked.
  - Under reduced motion, stacked.

  Run the gate, then `npm run measure`. Screenshot both themes, then commit: "Think · Build · Ship: a typographic sequence pinned where it pins, a stacked list elsewhere".

---

### Task 21: Contact, Footer and the page composition

**Files:**
- Rewrite: `components/sections/Contact.tsx` (server, plus the existing client `PhoneReveal`), `components/layout/Footer.tsx`
- Modify: `app/page.tsx` (final order; drop the `Stage` and `AmbientGlow` usage)
- Test: `sections.spec.ts`, `tests/e2e/theme.spec.ts`, `tests/e2e/a11y.spec.ts`, `idle.spec.ts` (at Contact)

**Interfaces:**
- Consumes: `socials`, `siteMeta`, `availability` (`data/socials.ts`); `PhoneReveal` (unchanged: it is the only decoder of `phoneEncoded`); `ButtonLink`; icons.
- Produces: the final `<main>`, in this order: `Entrance(Hero)`, `Work`, `About`, `Stack`, `ThinkBuildShip`, `Contact`. After it, `<Footer>`.

- [ ] **Step 1: Write the failing e2e tests**

```ts
// tests/e2e/a11y.spec.ts — landmarks and heading outline for the whole page (spec §8).
import { test, expect } from "playwright/test";
test("landmarks and heading outline", async ({ page }) => {
  await page.goto("/"); await page.locator("[data-skip-intro]").click();
  await expect(page.locator("main")).toHaveCount(1); await expect(page.locator("footer")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveCount(1);
  const outline = await page.evaluate(() => [...document.querySelectorAll("main h1, main h2, main h3")].map((h) => Number(h.tagName[1])));
  for (let i = 1; i < outline.length; i++) expect(outline[i] - outline[i - 1], `h${outline[i - 1]} → h${outline[i]} at ${i}`).toBeLessThanOrEqual(1);
  expect(await page.locator("main h2").allTextContents()).toEqual(["Selected work", "Engineer by training.Builder by nature.", "The tools I build with.", "Think. Build. Ship.", "Let's buildsomething great."]);
});
test("every interactive element is ≥ 44px below lg", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto("/"); await page.locator("[data-skip-intro]").click();
  const small = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>("main a[href], main button, footer a[href]")]
    .filter((el) => el.offsetParent && getComputedStyle(el).visibility !== "hidden")
    .map((el) => ({ t: el.textContent?.trim().slice(0, 30), ...el.getBoundingClientRect().toJSON() }))
    .filter((r) => r.height < 44 && r.width > 0));
  expect(small).toEqual([]);
});
```

```ts
// tests/e2e/theme.spec.ts — Review Focus 5.
import { test, expect } from "playwright/test";
test("light theme: the dark spine stays dark, theme sections are light, a toggle shifts no layout", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addCookies([{ name: "theme", value: "light", url: "http://localhost:3400" }]);
  const page = await ctx.newPage(); await page.goto("/"); await page.locator("[data-skip-intro]").click();
  const bg = (sel: string) => page.locator(sel).first().evaluate((el) => getComputedStyle(el).getPropertyValue("--bg").trim());
  expect(await bg(".entrance__stage")).toBe("#05070a");
  expect(await bg(".work__stage")).toBe("#05070a");
  expect(await bg("#contact")).toBe("#05070a");
  expect(await bg("#about")).toBe("#f5f6f8");
  expect(await bg("#skills")).toBe("#f5f6f8");
  await page.evaluate(() => { (window as unknown as { __cls: number }).__cls = 0; new PerformanceObserver((l) => { for (const e of l.getEntries() as PerformanceEntry[] & { value: number; hadRecentInput: boolean }[]) if (!e.hadRecentInput) (window as unknown as { __cls: number }).__cls += e.value; }).observe({ type: "layout-shift" }); });
  await page.evaluate(() => document.getElementById("about")!.scrollIntoView());
  await page.getByRole("button", { name: /dark mode|light mode|theme/i }).first().click(); await page.waitForTimeout(500);
  expect(await page.evaluate(() => (window as unknown as { __cls: number }).__cls)).toBeLessThan(0.02);
  await ctx.close();
});
```

  Extend `idle.spec.ts` with "0 rAF while Contact is in view": scroll to `#contact`, wait 1.2 s, count over 1 s, expect 0 (spec §9).

- [ ] **Step 2: Rewrite Contact** (server; a dark stage in both themes, which is Plan 2 decision 1).

```tsx
import { socials, siteMeta, availability } from "@/data/socials";
import { ButtonLink } from "@/components/ui/Button";
import { PhoneReveal } from "@/components/ui/PhoneReveal";
import { GithubIcon, LinkedinIcon, MailIcon } from "@/components/ui/icons";

/** Spec §5.6: "Let's build / something great." over the planet-horizon light; one primary action. */
export function Contact() {
  const channel = "inline-flex min-h-11 items-center gap-2.5 rounded-full border border-line px-4 text-sm text-fg-muted hover:border-line-strong hover:text-fg";
  return (
    <section id="contact" aria-labelledby="contact-title" data-theme="dark" className="contact seam-top-dark seam-bottom-dark relative overflow-hidden bg-[var(--bg)]">
      <div className="contact__horizon" aria-hidden="true" />
      <div className="shell relative py-[clamp(8rem,18vh,14rem)] text-center">
        {availability.open && <p className="label inline-flex items-center gap-2 text-fg-muted"><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--status-live)]" />{availability.label}</p>}
        <h2 id="contact-title" className="mt-6 text-[clamp(2.75rem,7vw,6rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-fg">
          Let&apos;s build<br /><span className="text-fg-muted">something great.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-[52ch] text-fg-muted" style={{ fontSize: "var(--text-lead)" }}>{availability.detail}</p>
        <div className="mt-10 flex justify-center"><ButtonLink href={`mailto:${socials.email}?subject=${encodeURIComponent("Hello Tay")}`} size="lg">Get in touch</ButtonLink></div>
        <address className="mt-8 flex flex-wrap justify-center gap-3 not-italic">
          <a className={channel} href={socials.github.url} target="_blank" rel="noopener noreferrer"><GithubIcon size={16} />GitHub<span className="sr-only"> (opens in a new tab)</span></a>
          <a className={channel} href={socials.linkedin.url} target="_blank" rel="noopener noreferrer"><LinkedinIcon size={16} />LinkedIn<span className="sr-only"> (opens in a new tab)</span></a>
          <a className={channel} href={`mailto:${socials.email}`}><MailIcon size={16} />Email</a>
          <PhoneReveal className={channel} />
        </address>
        <p aria-hidden="true" className="label mt-16 text-fg-subtle">Ideas / Build / Ship / Repeat.</p>
        <p className="sr-only">{siteMeta.name}</p>
      </div>
    </section>
  );
}
```

Put this CSS in `components/sections/contact.css`, imported by `Contact.tsx`:

```css
/* Planet-horizon light (spec §5.6): a CSS arc, a faint grid, cool light pooling. No image, no loop. */
.contact__horizon { position: absolute; inset: auto -20% -62% -20%; height: 110%; border-radius: 50% 50% 0 0 / 100% 100% 0 0;
  background: radial-gradient(60% 40% at 50% 0%, rgba(91,156,255,0.20), transparent 70%), #05070a;
  box-shadow: 0 -1px 0 rgba(155,190,255,0.35), 0 -40px 120px rgba(91,156,255,0.12); }
.contact__horizon::after { content: ""; position: absolute; inset: 0; opacity: 0.25;
  background-image: linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px); background-size: 56px 56px;
  mask-image: radial-gradient(60% 50% at 50% 0%, #000, transparent 75%); }
```

  - Check `PhoneReveal`'s `className` prop against the component before use (`PhoneReveal({ className })` exists).
  - Check the icon `size` prop against `icons.tsx` (`IconProps`).

- [ ] **Step 3: Rewrite the Footer** (theme-following).

```tsx
import { socials, siteMeta } from "@/data/socials";
const LINKS = [{ href: `mailto:${socials.email}`, label: "Email" }, { href: socials.github.url, label: "GitHub", ext: true }, { href: socials.linkedin.url, label: "LinkedIn", ext: true }, { href: "#hero", label: "Back to top" }];
export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line">
      <div className="shell flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <p className="label text-fg-subtle">TAY SHOFER — PORTFOLIO · BUILT TO SHIP.</p>
        <nav aria-label="Footer"><ul className="flex flex-wrap gap-2">{LINKS.map((l) => (
          <li key={l.label}><a href={l.href} className="inline-flex min-h-11 items-center px-3 text-sm text-fg-muted hover:text-fg" {...(l.ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{l.label}</a></li>))}</ul></nav>
        <p className="label text-fg-subtle">© {year} {siteMeta.domain}</p>
      </div>
    </footer>
  );
}
```

  "Back to top" goes to `#hero`, which `EntranceStage`'s click handler turns into a landing at identity (Plan 1). `new Date()` in a server component is fine: the page is already dynamic, because the layout reads theme cookies.

- [ ] **Step 3b: Add the hero's one atmospheric element** (spec §5.1, not built in Plan 1): the dark horizon arc in CSS.
  - This changes the Plan 1 Hero, so the entrance suites (`entrance.spec.ts`, `entrance-geometry.spec.ts`) must stay green.
  - The arc is a decorative, `aria-hidden` first child of `#hero`. It is static (no motion), sits behind the content (`z-index: 0`, content `relative z-10`), and applies the same `.contact__horizon` recipe at 40% intensity, so the page's first and last frames rhyme.
  - While the hero is the laptop's screen, the arc is part of the screen image. That is intended, because it is on the concept's screen.

  ```tsx
  <div aria-hidden="true" className="hero-horizon pointer-events-none absolute inset-x-[-20%] bottom-[-70%] h-full rounded-[50%_50%_0_0/100%_100%_0_0]
    [background:radial-gradient(60%_40%_at_50%_0%,rgba(91,156,255,0.10),transparent_70%)] [box-shadow:0_-1px_0_rgba(155,190,255,0.18)]" />
  ```

  Extend `theme.spec.ts`: at p = 1 in **both** themes, `getComputedStyle(#hero's surface parent).backgroundColor` is `rgb(5, 7, 10)`. This is spec §10's "hero background equals `--bg`", with the dark hero decided in the user's decision 3.

  Extend `a11y.spec.ts` with a whole-page run that collects `console` errors and `pageerror` events while scrolling from the top to the footer in wheel steps, then asserts the list is empty (spec §10, "zero console errors").

- [ ] **Step 4: Compose the page.**

```tsx
export default function Page() {
  return (
    <>
      <Navbar />
      <main id="main" className="relative">
        <Entrance><Hero /></Entrance>
        <Work worlds={{ poker: <PokerWorld />, aegis: <AegisWorld />, developeros: <DeveloperOSWorld />, "gravity-flow": <GravityWorld /> }} />
        <About />
        <Stack />
        <ThinkBuildShip />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
```

  Remove the imports of `Stage`, `AmbientGlow`, `Projects`, `Skills`, `EngineeringPanel` and the August `Contact`, and update the page docblock to describe the new order. Every other overlay (palette, chat, accessibility panel) is mounted in the layout or providers and is unchanged.

- [ ] **Step 5: Run everything.**
  - All e2e specs: entrance, geometry, chrome, scene, sections, theme, a11y, idle, budget.
  - The gate, then `npm run measure`. JS should now be clearly **below** Plan 1's 279.6 KB, because the August client sections are gone. Record it.
  - A visual pass: `npm run shoot` across all six sizes and both themes, with the sections `hero,work,work-poker,work-aegis,work-developeros,work-gravity-flow,about,skills,approach,contact`. Review every sheet for geometry, clipping, z-index, wrapping, pin lengths, overflow, contrast and nav timing, and fix what you see.
  - Commit: "Contact, Footer and the final page composition".

---

### Task 22: Swap in the final frames (when Task 10 has completed)

**Files:**
- Move: `public/entrance-final/*` → `public/entrance/*` (via `git rm -r public/entrance` and `git mv public/entrance-final public/entrance`)
- Modify: `components/entrance/Entrance.tsx` (only if the poster or still file names changed; they should not)
- Test: every entrance suite, `verify-provenance.test.ts` (must now *run*), `manifest.test.ts`

- [ ] **Step 1: Before the swap,** run `npx vitest run tests/unit/manifest.test.ts` with `MANIFEST=public/entrance-final/manifest.json`: PASS. Also `node scripts/encode-frames.mjs … --check-budget`: PASS.

- [ ] **Step 2: Swap:** `git rm -r -q public/entrance && git mv public/entrance-final public/entrance`.

- [ ] **Step 3: Run**
  - `npx vitest run`. `verify-provenance.test.ts` now runs (not skipped) and passes. Confirm with `--reporter=verbose` that it is not reported as skipped.
  - `npm run build && npm run test:e2e`. `entrance-geometry.spec.ts` recomputes from the new manifest and must pass at 1.5 px; it is the guarantee that the final quads drive the surface exactly.
  - `npm run measure`. LCP ≤ 1.2 s, now with the final poster (60–90 KB). CLS < 0.02.
  - Frames before `load`: 0.

- [ ] **Step 4: Visual pass on the finals.**
  - Run `npm run shoot -- --entrance 0,0.1,0.25,0.45,0.6,0.78,0.9,1` at all six sizes in both themes.
  - Check: the poster fills the frame with no letterbox; the surface sits exactly on the laptop screen from 0.45 to 0.68; no bounce at the hand-off; the hero equals the page at 1.0; the nav appears at the end; no horizontal overflow.
  - Compare with the approved final key frames from the Task 9 sheets.

- [ ] **Step 5: Commit:** "Swap in the final entrance frames". Push.

---

### Task 23: Remove superseded August code, routes, assets and dependencies

**Files (delete):**
- `components/effects/{Workstation,WorkstationGL,ScreenPortfolio,HeroVisual,ArchitectureBoard,PipelineRun,AmbientGlow}.tsx`
- `components/sections/{IntroSequence,Projects,Skills,EngineeringPanel}.tsx`
- `components/ui/{ProjectStage,ProjectDeck,ProjectRow,FeaturedProject,ProjectCard,Stage,PanelReveal,Panel,SectionHeader,Section,Eyebrow,MaskReveal,Parallax,Reveal}.tsx` — **each only if it has no remaining importer** (Step 1 decides)
- `app/gl-spike/`, `app/render-studio/`
- `design/render/scene.ts`, `design/render/capture.mjs`
- `public/arrival/`
- `heroStats` in `data/socials.ts` (spec §6). Its last importer is `app/opengraph-image.tsx`. Move the three stats the card shows (Live, 1,742, B.Sc.) into that file as a local, commented `CARD_STATS`, since they are the social card's own copy, then delete `heroStats`. In the same step, restyle the OG card to the Plan 1 palette: `brand.bg` `#05070a`, `brand.accent` `#5b9cff`. Plan 1 changed only its headline.

**Modify:**
- `package.json`: remove `three` and `@types/three`, then `npm install` to update the lockfile.
- `design/references/README.md` (or create it): mark `arrival-workspace-reference.png` as superseded by `cinematic-laptop-concept.webp`.
- `app/sitemap.ts`, if it lists the removed routes.

**Test:** `tests/unit/dead-code.test.ts`.

- [ ] **Step 1: Write the failing test.** Every component file must be imported somewhere, and `three` must be gone.

```ts
// tests/unit/dead-code.test.ts
import { it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const files = (d: string): string[] => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? files(path.join(d, e.name)) : [path.join(d, e.name)]);
const src = [...files("app"), ...files("components"), ...files("lib")].filter((f) => /\.(tsx?|css)$/.test(f));
const all = src.map((f) => fs.readFileSync(f, "utf8")).join("\n");

it("every component module is imported by something", () => {
  const orphans = files("components").filter((f) => /\.tsx?$/.test(f)).filter((f) => {
    const base = path.basename(f).replace(/\.tsx?$/, "");
    // static `from ".../X"` or dynamic `import(".../X")` (CaseStudyPanel and GravityField are loaded only dynamically)
    return !new RegExp(`(from\\s*|import\\(\\s*)["'][^"']*/${base}["']`).test(all);
  });
  expect(orphans).toEqual([]);
});
it("three.js and the spike routes are gone", () => {
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
  expect(pkg.dependencies?.three).toBeUndefined(); expect(pkg.devDependencies?.["@types/three"]).toBeUndefined();
  expect(fs.existsSync("app/gl-spike")).toBe(false); expect(fs.existsSync("app/render-studio")).toBe(false); expect(fs.existsSync("public/arrival")).toBe(false);
});
it("the e2e fixture route is never in the sitemap", () => {
  expect(fs.readFileSync("app/sitemap.ts", "utf8")).not.toMatch(/e2e-fixtures/);
});
```

- [ ] **Step 2: Run it.** Expected: FAIL, listing every orphan. The orphan list decides which of the conditional deletions above happen; keep anything that is still imported.

- [ ] **Step 3: Delete** the orphans, routes, assets and dependencies. Then run `npm install`, typecheck, lint and build. Fix any stray import.
  - `grep -rn "arrival\|gl-spike\|render-studio\|heroStats\|IntroSequence" app components lib data` must be empty, except comments explaining history. Remove those too, unless they are load-bearing.

- [ ] **Step 4: Run** the full gate, all e2e and `npm run measure` (JS and HTML should drop again; record them). Commit: "Remove superseded August components, spike routes, arrival assets and three.js".

---

### Task 24: Full verification — gate, budgets, performance trace, visual pass, accessibility and UX review

**Files:** append a "Verification log" to the end of this plan document.

- [ ] **Step 1: The full gate:**

  ```bash
  npm run typecheck && npm run lint && npm test && npm run build && PW_CHROMIUM=/opt/pw-browsers/chromium npm run test:e2e
  ```

  Then run it again with `--repeat-each=3` for e2e: every test must be stable, and there must be no flakes.

- [ ] **Step 2: Budgets.** Record every value in the log against its budget:
  - `npm run measure`: JS, HTML, LCP desktop and mobile, whole-page CLS;
  - the frame payloads (`encode-frames --check-budget` numbers);
  - the poster size;
  - frames before `load`;
  - idle rAF at Contact.

- [ ] **Step 3: Main-thread time per scroll frame in the entrance** (≤ 8 ms). Record a Chrome trace while wheel-scrolling through the entrance, then take the p95 of per-frame main-thread time and record it:

```js
// scripts/trace-entrance.mjs (create in this step)
import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3400/", { waitUntil: "networkidle" });
await b.startTracing(page, { categories: ["devtools.timeline"] });
for (let i = 0; i < 60; i++) { await page.mouse.wheel(0, 120); await page.waitForTimeout(16); }
const trace = JSON.parse((await b.stopTracing()).toString());
const tasks = trace.traceEvents.filter((e) => e.name === "RunTask" && e.dur).map((e) => e.dur / 1000).sort((a, c) => a - c);
const p95 = tasks[Math.floor(tasks.length * 0.95)];
console.log(JSON.stringify({ tasks: tasks.length, p95ms: +p95.toFixed(2), max: +tasks.at(-1).toFixed(2) }));
await b.close(); process.exit(p95 > 8 ? 1 : 0);
```

  If it exceeds 8 ms, profile the worst frames and simplify the effect. The budget never relaxes.

- [ ] **Step 4: Visual pass.**
  - Run `npm run shoot` at 1440×900, 1366×768, 768×1024, 390×844, 375×667 and 844×390, in both themes, across the entrance beats and every section (including pinned mid-points).
  - Inspect every sheet yourself: geometry, clipping, z-index, wrapping, pin lengths, overflow, contrast, nav timing, seams and the dark spine.
  - Fix, re-shoot and record in the log.
  - **Plan 1 open item:** at 844×390, the floating accessibility button must not overlap the hero CTAs at p = 1. If it does, add `padding-bottom` at max-height 500 px to the hero so the CTAs clear it. Re-shoot to confirm.
  - **Overlays** (spec §6, "restyled"): open and screenshot at 1440×900 and 390×844, in both themes:
    - the command palette;
    - the accessibility panel;
    - the chat widget;
    - both case studies (a flagship and a More Work row);
    - the mobile menu sheet.

    They take the new tokens through their CSS variables. Fix any literal colour left from August, which the violet-glow grep in Task 23 helps find: `grep -rn "b47cff\|180, 124, 255\|139, 92, 246" app components`, which must return nothing.
  - Send the final sheets to the user in the report (Task 25).

- [ ] **Step 5: The accessibility and UX review (UI UX Pro Max pre-delivery).**
  - Run `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "animation accessibility z-index loading scroll parallax" --domain ux`, and walk the Quick Reference §1–§3 against the whole page:
    - focus rings; 44 px targets (`a11y.spec.ts`);
    - contrast in both themes (`tokens.test.ts` plus the visual pass);
    - reduced motion from both sources (scene, sections and entrance tests);
    - no hover-only content; zoom;
    - CLS; loading feedback;
    - stacking contexts; one primary motion per viewport; no decorative infinite animation.
  - Also run a keyboard-only walk of the whole page and record it: the skip link, the nav, every flagship's CTAs, both case studies (open and close), More Work, Stack, Contact including `PhoneReveal`, and the footer.
  - Record each item as pass or fixed.

- [ ] **Step 6: Commit** the verification log and `trace-entrance.mjs`: "Plan 2 verification log". Push.

---

### Task 25: Fresh whole-branch review, fix pass, push, report — then stop

- [ ] **Step 1: Dispatch a fresh reviewer** (general-purpose, on the most capable model) over `git diff 3264b56..HEAD`. The diff base is intentionally the commit before Plan 1's execution (the same base Plan 1's review used), so the review covers the whole redesign, entrance included. with the same brief as Plan 1's final review. It is read-only and prioritises Critical / Important / Minor with file:line and a failure scenario. Its brief adds:
  - the scene primitive's pin and unpin lifecycle;
  - the GRAVITY FLOW loop gating;
  - the case-study lazy load and focus restoration;
  - the light-theme spine and seams;
  - the truth of every section's copy against `data/*.ts`;
  - the VERIFY texture change;
  - the render pipeline's audit logic;
  - dead code.

- [ ] **Step 2: Fix** every Critical and Important finding, and the cheap Minor ones, each with a test where one can pin it. Re-run the full gate, all budgets and a visual spot-check. Record the findings and the fixes in the verification log.

- [ ] **Step 3: Push** `feature/premium-portfolio-redesign-1mqmgf`. Do not merge, do not open a production PR, and do not deploy.

- [ ] **Step 4: Report to the user and stop:**
  1. the verification results;
  2. the performance-budget measurements (a table against the budgets);
  3. the screenshots of the entrance beats and every section on desktop and mobile, in both themes (the contact sheets);
  4. the deviations from this plan, with their reasons;
  5. the fresh reviewer's findings and what was fixed;
  6. anything left open.

  Follow the truth rule: report failures plainly.
