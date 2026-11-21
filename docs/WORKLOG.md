# Worklog

Running log of sessions on the portfolio. Newest first. Each entry records what was checked, what
changed, and what is waiting on Tay.

**Labels used in audit entries**
- **VL** = VERIFIED LOCALLY. Observed in-session from this machine: local files and git objects, plus
  read-only `gh api` / `git ls-remote` against GitHub and a read-only `curl` of the live site.
- **VD** = VERIFIED FROM OFFICIAL DOCS (with URL).
- **NC** = NEEDS CONFIRMATION (inferred, partial, or depends on something not inspected).

---

## 2026-11-21 — Session 28 (#24): dev-dependency audit hygiene; PR #26 (Claude Code)

**Scope (Tay's brief, #24; he approved these dependency changes and nothing else):**
1. Baseline: `npm audit` (the whole tree and `--omit=dev`), `npm ls source-map-js baseline-browser-mapping sharp`;
   which advisories reach production dependencies and which are dev or build-only.
2. `source-map-js` and `baseline-browser-mapping` within their declared ranges (`npm audit fix` without `--force`, or
   a targeted `npm update`). Stop and report if anything else would move, or if it needs `--force` or an override.
3. The project's dev `sharp` 0.34.5 → the lowest release that clears its advisories, in the repo's style. Prove
   `scripts/m10-images.mjs` still works, into a scratch folder; no image re-encoded or committed.
4. Validate on a clean build; compare with `main`'s build (the lockfile, first-load JS, `/`'s stylesheets and scripts,
   the headers); `npm audit` after. No test or guard edit.
5. Docs: #21 merged, Firefox's `chrome.spec.ts:268` at 390 into #22, #24 done, this entry. 6. Push and a PR. No merge.

### 0. Preconditions (VL)
- `git fetch`, `main` pulled: `main` = `origin/main` = Production = **`5080de5`**, the tree clean; the only open PR is
  #18 (the prototype, a draft). `chore/dev-audit` cut from it (`--no-track`); `npm ci` exit 0. Node 24.18.0, npm
  11.16.0.
- **PR #25 (#21) is merged:** Tay merged it at 2026-11-20 23:34:58Z as `5080de5` (parents `ce818a0` and `00feb6c`; the
  tree is the PR head's). Its Production deployment (`7955095550`) was `success` at 23:37:37Z. `fix/f1-launcher-focus`
  was deleted, local and remote, after `git merge-base --is-ancestor` (S27's close-out).
- **S27's production check** (Chromium, through Cloudflare): `/` at 390 and 1440 answered 200 with 0 console errors, 0
  CSP violations and 0 failed requests, and the served scripts carry the fix. In Firefox at 390 on production, the
  hero's GRAVITY FLOW link settles at 772 (the launcher's top is at 782), `scrollY` 34: F1 is fixed live.
- **Tay's decision at S27's close:** Firefox's `chrome.spec.ts:268` at 390×844 joins #22's list (now in
  `docs/ROADMAP.md`).

### 1. The baseline (VL; `main`'s lockfile)
| `npm audit` | `main` (`5080de5`) |
|---|---|
| Whole tree | 18: 7 high, 10 moderate, 1 low (no critical) |
| `--omit=dev` | 2: `source-map-js` 1.2.1 (high GHSA-68fv-2mgg-jv7q, fixed in 1.2.2) and `baseline-browser-mapping` 2.10.32 (moderate GHSA-w5vr-8v7q-w6rv, fixed in 2.11.0) |

- **`npm ls`:**
  - `source-map-js` 1.2.1, one copy, through Tailwind's `@tailwindcss/node`, the root `postcss` and Next's own `postcss`.
  - `baseline-browser-mapping` 2.10.32, one copy, through `next` and `browserslist` (the Babel under
    `eslint-config-next`).
  - `sharp` twice: the project's 0.34.5 (dev) and Next's optional 0.35.5, nested under `next`.
- **What reaches production:**
  - `--omit=dev` counts `source-map-js` and `baseline-browser-mapping` because `next`, a production dependency, depends
    on them. Neither ships. The server's file traces (every `.nft.json` under `.next`, on `main` and on this branch)
    list neither, and the client gets only the built bundles. Both run while building (`postcss`'s source maps,
    `browserslist`'s data).
  - The project's `sharp` 0.34.5 is dev. On `main` the server trace lists only its `package.json` (resolution
    metadata), not its code or binary. At runtime Next's image optimiser calls `require('sharp')` from
    `next/dist/server/image-optimizer/transform.js`, which resolved Next's nested 0.35.5. The site never ran 0.34.5.
  - The other 15 (the whole tree only) are lint and unit-test tooling, under `eslint`, `eslint-config-next` and
    `vitest` (§5).
- **A correction to #24's premise:** `sharp` is not used only by `scripts/m10-images.mjs`. `scripts/shoot.mjs` (the
  contact sheet) and three unit tests (`case-study-images`, `lab-work`, `rename`: metadata and a 48px pixel compare)
  import it too.

### 2. The transitive fixes (`abb39f1`)
- **`npm audit fix` was not used:** it would also fix the fifteen other flagged dev packages (Babel, `vitest`, `vite`,
  `zod`, `typescript-eslint`, `brace-expansion`, `js-yaml`, `browserslist`…), which means many more moves (§5).
- **A targeted `npm update source-map-js baseline-browser-mapping`** installs the newest release inside every declared
  range:
  - `source-map-js` (^1.2.1 from Tailwind's node package and both `postcss`): 1.2.1 → **1.2.4**;
  - `baseline-browser-mapping` (^2.9.19 from `next`, ^2.10.12 from `browserslist`): 2.10.32 → **2.11.39**.
  - Its dry run and the lockfile agree: **only these two entries move.** `package.json` is unchanged; no `--force`, no
    override.
- **Both releases were two days old** (published 2026-11-19), so they were checked before being accepted (VL, the
  tarballs unpacked in a scratch folder):
  - Neither has an install script.
  - `source-map-js` 1.2.4 rewrites 1.2.2's lib (about 2,250 diff lines). Its one maintainer published every version. The
    `require` set is the same eight internal modules, and nothing touches `fs`, the environment, processes or the
    network. It drops 1.2.2's `new Function` path (its comment: for CSPs without `'unsafe-eval'`).
  - `baseline-browser-mapping` 2.11.39 is published by GitHub Actions with SLSA provenance, as 2.10.32 and 2.11.0 were.
    Only its two index bundles and `package.json` differ from 2.11.0.
  - The lockfile's integrity hashes equal the inspected tarballs'.

### 3. The project's sharp (`60c5aa5`)
- `npm install --save-dev sharp@0.35.5`: `package.json` `^0.34.5` → **`^0.35.5`** (a caret devDependency, as before).
  - 0.35.5 is the lowest release that clears all three: GHSA-f88m-g3jw-g9cj (libvips, fixed in 0.35.0),
    GHSA-rgj7-g3m4-5g8c (libheif, 0.35.4), GHSA-wq5f-xc86-pv6w (librsvg, 0.35.5).
  - It needs Node ≥ 20.9 (here 24.18.0) and loads libvips 8.18.7. It has no install script, so `npm ci`'s
    allow-scripts warning now names only `unrs-resolver`.
- **The lockfile: only sharp's own tree moves.** Next's optional `sharp` (^0.35.5) was already 0.35.5, so npm dedupes
  the two:
  - the root `sharp` 0.34.5 → 0.35.5, now `devOptional` (shared with `next`); `next`'s nested copy goes;
  - its 23 platform packages move to the root at Next's versions (13 `@img/sharp-*` 0.34.5 → 0.35.5, 10
    `@img/sharp-libvips-*` 1.2.4 → 1.3.4), with **the same integrity hashes as Next's nested copies**;
  - 0.34.5's `@img/sharp-wasm32` goes (0.35.5's wasm packages were already at the root, through Next);
  - sharp's `semver` is 7.8.6 (^7.8.5). 0.34.5's was 7.8.1, and Next's nested copy's 7.8.5. 7.8.6 (2026-11-02,
    GitHub Actions, SLSA provenance, no install script) replaces a regular expression in its range parsing with a
    plain whitespace trim.
  - Nothing outside sharp's tree changes.
- **The API the repo calls:** in the two versions' type definitions, the calls used here (`metadata`, `extract`,
  `resize`, `avif`, `webp`, `png`, `composite`, `create`, `toBuffer`, `toFile`, `removeAlpha`, `raw`) keep their
  signatures. `toBuffer` now returns `Buffer<ArrayBuffer>`, and AVIF's effort range starts at 1 (was 3). 0.35 no
  longer exports `sharp/package.json`; nothing here reads it (`sharp.versions` has the version).
- **The image script works** (VL): the repo's own `scripts/m10-images.mjs`, unmodified, run with its working directory
  in a scratch folder holding a copy of `public/projects`, so every output landed there. It ran the 21 jobs whose
  sources are public, named:
  - the two T Poker brand jobs need the gitignored brand art, and without it the script calls `python3`, the Windows
    stub here;
  - the Aegis jobs need `M10_CAPTURES`.

  Exit 0, 124 files in 27 s. Against the committed `public/work` files:
  - **all 124 have the same dimensions and format**;
  - **the 62 WebP files are byte-identical**;
  - the 62 AVIF files differ, as AVIF always has across encoder builds: 4.7% more bytes in all (1,015,394 →
    1,063,104 B), and a mean pixel difference of at most 0.506 at the unit tests' 48px compare (`hero-gf-240.avif`;
    their threshold is 2).
  - Nothing in the repo was re-encoded or written: `git status` showed only the two package files.
- **`scripts/shoot.mjs` works too:** a run into a scratch folder against the branch's build (390 and 1440, two
  sections) wrote the PNGs and the sharp-composited contact sheet, which looks right.
- **Next's runtime path:** `/_next/image` (a local capture at 640, q 75) answers byte-identical AVIF and WebP from
  `main`'s build and the branch's: the same 0.35.5, now at the root. No image on `/` uses the optimiser.
- **The server trace** (`.next/next-server.js.nft.json`): `main`'s carried Next's nested sharp 0.35.5 (its code and
  the 0.35.5 binary) plus the dev sharp's `package.json`. The branch's carries the root sharp 0.35.5 (the same code and
  binary) and its `semver` 7.8.6.

### 4. Validation (VL; the final tree, `.next` deleted, `npx next typegen` first)
| Check | Result |
|---|---|
| `npm run typecheck` · `npm run lint` | exit 0 · exit 0 |
| `npm test` (Git Bash) | 225/225, 18 files (the three sharp tests included) |
| `npm run build` | exit 0; the same route table as `main`'s |
| `GROQ_API_KEY= npx playwright test` (Chromium), cold | **197/197**, 17 files, 2.1 min |
| The same, warm | **197/197**, 2.1 min |

**Against `main`** (`5080de5` built in a scratch worktree with its own `npm ci`, on :3402; the branch on :3401; both
`next start`, keyless):

| | `main` (`5080de5`) | This branch |
|---|---|---|
| The build's static files (every chunk, both stylesheets, the fonts: 22) | — | **byte-identical** (names and SHA-256); the build-ID folder too, with the ID masked |
| First-load JS (gzip, `budget.spec.ts`'s method) | 187.06 KiB, 9 scripts, 612,067 B raw | **the same**; budget 205.7 |
| `/`'s scripts | 9 | **the same names, bytes and SHA-256** |
| `/`'s stylesheets | `278gwr1omn8ec.css` 44,021 B, `3_ro9fti2b1c6.css` 28,727 B | **the same names, bytes and SHA-256** |
| HTML of `/` | 127,422 B | 127,422 B |
| Headers on `/` and `/privacy` | 200, 14 headers | **identical**, the CSP and the six security headers included |

The newer `baseline-browser-mapping` data and `source-map-js` change nothing in the output: no chunk, stylesheet or
font moved.

### 5. `npm audit` after (VL)
| `npm audit` | `main` | This branch |
|---|---|---|
| `--omit=dev` | 2 (1 high, 1 moderate) | **0** |
| Whole tree | 18: 7 high, 10 moderate, 1 low | **15: 5 high, 9 moderate, 1 low** |

- **Gone:** `source-map-js` (GHSA-68fv-2mgg-jv7q), `baseline-browser-mapping` (GHSA-w5vr-8v7q-w6rv) and `sharp`
  (GHSA-f88m-g3jw-g9cj, GHSA-rgj7-g3m4-5g8c, GHSA-wq5f-xc86-pv6w). No new advisory.
- **Left, all dev-only lint and unit-test tooling, outside the brief:**
  - under `eslint` and `eslint-config-next`: `brace-expansion`, `js-yaml`, `browserslist` 4.28.2 (Babel's, not
    Next's) and `zod` (high); `minimatch` and the six `typescript-eslint` packages it reaches (moderate); `@babel/core`
    (low);
  - under `vitest` (a direct devDependency): `vite` (high), `@vitest/mocker` and `vitest` (moderate).
- **`npm audit fix` (no `--force`) would clear them,** but its dry run (on this branch) changes 56 packages and adds
  one, among them Tailwind's `postcss` (8.5.28 → 8.5.33), `caniuse-lite` and `vitest` (5.0.2 → 5.1.1). Tay's call; not
  done.

### 6. Docs, push, the PR
- **This docs commit:** this entry, plus one line in S27's entry recording its merge; `docs/ROADMAP.md` (#21 merged,
  Firefox's `chrome.spec.ts:268` at 390 in #22, #24 done); `claude/START-HERE.md`; `CLAUDE.md` (Production `5080de5`,
  the backlog line, the suite, and a note on running the image script).
- `npm test` after it: 225/225. `/` rebuilt from a clean `.next` with these docs in place: its stylesheets are the
  same names and bytes (CLAUDE.md and `claude/` are scanned).
- `chore/dev-audit` pushed; **PR #26**, ready for review, not merged.

### Clean-up (VL)
- The scratch worktree of `main` is removed; the tarballs, the image outputs and the probes are deleted.
- Ports 3400–3431 are free.

### State (VL)
- `main` = `origin/main` = Production = **`5080de5`**. Untouched.
- `chore/dev-audit`: `abb39f1` (the transitive update), `60c5aa5` (sharp), then this docs commit; pushed; PR #26 open.
- `proto/hero-a-cinematic`: frozen; PR #18 a draft.

### Waiting on Tay
- **Review and merge PR #26.** Then the close-out: the ancestor check, delete `chore/dev-audit`, `main` clean, the
  merge's Production deployment `success`, and `/` with 0 console errors and 0 CSP violations at 390 and 1440.
- **His call, later:** the 15 lint and unit-test advisories (§5).
- **For #18:** the image script's AVIF from sharp 0.35.5 is about 5% larger than 0.34.5's at the same settings (WebP
  identical). Run the one named job.
- **Next (Tay's order):** #18 (whenever he has the image), #22, then P4. Low priority: #23.

---

## 2026-11-21 — Session 27 (#21): F1 fixed, a Tab never leaves a control under the chat launcher; PR #25 (Claude Code)

> **Merged** by Tay on 2026-11-20 at 23:34:58Z as `5080de5`; Production since 23:37:37Z, and S27's production check
> passed (Session 28, §0).

**Scope (Tay's brief, #21):**
1. Diagnose: reproduce in Playwright Firefox, list every control affected at 320, 375, 390 and 1440, confirm the cause.
   Continue unless the fix needs more than a small focus handler.
2. Fix: after keyboard focus lands on a control the launcher overlaps, scroll just enough to clear it (instant under
   reduced motion). Keyboard only, never while a modal is open, #16's padding kept. No change in Chromium or WebKit, no
   CLS, no new dependency, no class-like words.
3. **Approved in advance:** one new regression spec in its own commit. No edit to an existing test or guard; Firefox and
   WebKit only through a scratch config, deleted after.
4. Validate: typecheck, lint, unit, build, Chromium cold and warm; full Firefox and WebKit runs, each failure in S23's
   or S25's tables (anything new: stop). JS, `/`'s stylesheets and CLS before and after.
5. Docs: #19 merged, #21 done, this entry, a backlog item for dev-dependency audit hygiene. 6. Push and a PR. No merge.

### 0. Preconditions (VL)
- `git fetch`, `main` pulled: `main` = `origin/main` = Production = **`ce818a0`**, the tree clean; the only open PR is
  #18 (the prototype, a draft). `fix/f1-launcher-focus` cut from it (`--no-track`); `npm ci` exit 0.
- **PR #24 (#19) is merged:** Tay merged it at 2026-11-20 21:19:17Z as `ce818a0` (parents `7ebff9c` and `7acc149`; the
  tree is the PR head's). Its Production deployment (`7952836512`) was `success` at 21:22:33Z. `chore/next-16-4-6` was
  deleted, local and remote, after `git merge-base --is-ancestor` (S26's close-out).
- **S26's production checks** (through Cloudflare, and on `tay-shofer-portfolio.vercel.app`):
  - `/` and `/privacy`: 200, the CSP and the six security headers exact, `index, follow`, one canonical, no `noindex`.
  - Chromium at 390 and 1440, both pages: 0 CSP violations, 0 console errors, 0 failed requests.
  - The scripts carry Next 16.4.6 and React `19.3.0-canary-278794d7-20261002`. First-load JS 186.97 KiB, HTML 127,702 B.
  - The chat answered a real question (200, 0.80 s) correctly: Aegis's "AI analysis" is a deterministic template
    provider, not a language model. An empty POST: 400. `/lab/*`: 404.
  - robots, the sitemap and the manifest: 200, the right types, the bytes of the local build. Through Cloudflare all
    three are brotli (83 → 74, 256 → 178, 387 → 239 B). Vercel's own domain sends those three uncompressed
    (`Content-Length: 83` for robots) while it compresses the favicon (25,931 → 9,309 B) and the pages: a minimum size,
    by the look of it (NC: Vercel's docs didn't say).

### 1. The diagnosis (VL; `main`'s build; Firefox 153, Chromium 151, WebKit 26.5)
A Tab walk of `/`, each stop read right after the press and again once the page settles:

| Firefox 153 | 320×568 | 375×667 | 390×844 | 1440×900 |
|---|---|---|---|---|
| Stops under the launcher, motion reduced and on | 0 | **"Case study", 1.6%** | **the hero's GRAVITY FLOW link, 12.4%** | 0 |

- In both, Firefox's `scrollY` doesn't move on the Tab (4219 and 0): the control is already on screen.
- Chromium: 0 at all four once settled. With motion on, two stops overlap for a moment right after the press, while its
  own smooth focus scroll runs. So a fix has to look only after the browser's own scroll has settled.
- **The cause, probed at 390×844:** both engines compute `html`'s `scroll-padding-bottom` as 72px. Firefox honours it
  for `scrollIntoView({ block: "nearest" })` (the link moves to 668–772, and 772 = 844 − 72) but not for focus:
  `scrollY` stays 0. Chromium's focus applies it (`scrollY` 34).
- **Found while verifying, at sizes S23 didn't walk** (it walked 1024×500, not 1024×768): Firefox also leaves the
  GRAVITY FLOW link 1.8% under at 1024×768 (both motion modes) and "Case study" 5.1% under at 430×932 with motion on.

### 2. The fix (`da224bb`, `components/chat/ChatLauncher.tsx`: one effect, no new module or dependency)
- After a Tab press (Shift and Option too; not Ctrl or Cmd), on `focusin` the effect waits for the browser's own scroll
  to settle: three frames without a move.
- If the control still overlaps the launcher, the page moves up just far enough for the control's bottom to meet #16's
  padding edge, read from `html`'s computed `scroll-padding-bottom`. That is where Chromium and Safari put it. It
  never moves so far that the control's top goes under the header (`scroll-padding-top`).
- It uses `scrollBy` with the page's own `scroll-behavior`: smooth, or instant under reduced motion (both the system
  setting and the site's own switch).
- **It never acts:**
  - on a pointer, touch or script focus (only a Tab press counts);
  - inside an overlay (`role="dialog"`), or while any `aria-modal="true"` dialog is open;
  - on the launcher itself.
- #16's padding is unchanged.

### 3. Verified (VL; scratch probes, `main` on :3402 against the fix on :3401; WebKit through S23's CSP proxy)
**No change in Chromium or WebKit.** A Tab walk at 320×568, 375×667, 390×844, 430×932, 1024×768 and 1440×900, motion
reduced and on, every stop read once settled, with `window.scrollBy` counted (only the fix calls it):

| | Chromium 151 | WebKit 26.5 | Firefox 153 (the fix only) |
|---|---|---|---|
| Stops, and settled `scrollY` per stop, against `main` | **identical** in all 12 | **identical** in all 12 | — |
| The fix's scrolls | **0** | **0** | 1 each at 375, 390, 1024×768 (both modes), 430×932 (motion on) |
| Stops under the launcher | 0 | 0 | **0 at all 12** (`main`: the four cases in §1) |

In Firefox the corrected positions are Chromium's own: "Case study" at 551–595 (`scrollY` 4231; Chromium 4230) and the
link at 668–772 (`scrollY` 34, as in Chromium).

**The gates, in Firefox:**

| Case | Result |
|---|---|
| (a) Script focus of the link under the launcher | not moved, 0 scrolls |
| (b) A mouse press on it (focused, not released) | not moved, 0 |
| (c) A touch tap on it | the link's own jump only, 0 |
| (d) The menu sheet open, 12 Tabs inside | 0 |
| (e) The corrected "Case study" (1 scroll), then Enter, 8 Tabs inside, Escape | still 1, and focus returns with the page unmoved |
| (f) Reduced motion | one jump, 0 → 34, three frames after the press |
| (f) Motion on | a glide over about 20 frames |

**CLS (Chromium; load, then a 52-Tab walk; 390 and 1440, both motion modes):**
- Load: 0. CLS without input: 0.
- The only shifts are the chat launcher folding its label (pre-existing), all during input.
- Their count and total are identical on `main` and the fix: 0.0182 / 0.0153 at 390, 0.0097 / 0.0076 at 1440.

**Tried and dropped: correcting in the next task under reduced motion.** It made `chrome.spec.ts:268` pass in Firefox,
but WebKit defers its own focus scroll to the next rendering update, even with motion reduced. Probed 3 times at
375×667: `scrollY` at `focusin`, in the next task and in the first frame is the old one, and the second frame has
WebKit's. The early check therefore fired in WebKit once per walk ("Case study": 11 px, one frame before WebKit's own
move to the same place). From the page, a browser that will still scroll (WebKit) and one that won't (Firefox) can't be
told apart at that point, so the fix waits for the page to settle.

### 4. The spec (`d29f80d`, new, approved in advance in Tay's brief)
- `tests/e2e/launcher-focus.spec.ts` Tabs through `/` at 320×568 and 390×844, motion reduced and on. It reads each
  stop once `scrollY` has held for 10 frames, so it holds in every engine's Tab model. The walk ends at the launcher,
  the page's last stop (Firefox's Tab then leaves the page and `activeElement` stays on it).
- Red on `main` in Firefox at 390×844, both modes ("GRAVITY FLOW…"); green with the fix: **12/12** in Chromium, Firefox
  and WebKit.

### 5. Validation (VL; the final tree, `.next` deleted, `npx next typegen` first)
| Check | Result |
|---|---|
| `npm run typecheck` · `npm run lint` | exit 0 · exit 0 |
| `npm test` | 225/225, 18 files |
| `npm run build` | exit 0 |
| `GROQ_API_KEY= npx playwright test` (Chromium) | **197/197**, 17 files (S25's 193 + the 4 new), 2.1 min cold and 2.1 min warm |
| Firefox 153, the scratch config | **187/197**; the new spec 4/4 |
| WebKit 26.5, the scratch config and proxy | **180/197**; the new spec 4/4 |

**Firefox, the 10 failures:** all in the tables.
- In S23's: `lab-hero-a.spec.ts:129`, `chrome.spec.ts:140`, `lab-work.spec.ts:260`, `:566`, `:690` ×2.
- In S25's parallel-load class, passing alone ×3: `chapters.spec.ts:10` at 1440 and 1280, and
  `case-study-axe.spec.ts:12` at 1440.
- **`chrome.spec.ts:268` at 390×844, F1's own entry, still fails (0/3 alone).** It reads each stop the instant after the
  key press, and the fix moves the link three frames later. Once the page settles, the link is clear: the new spec,
  which reads then, passes. An earlier run also failed `aegis.spec.ts:6` and `chrome.spec.ts:63`, both S25's parallel
  load.

**WebKit, the 17 failures:** all in the tables. They are S25's 18 except `chrome.spec.ts:89`, which passed this time.
- S23's: `chat.spec.ts:130`, `chrome.spec.ts:140`, `chrome.spec.ts:268` ×2, `focus-ring.spec.ts:8` ×2,
  `lab-hero-a.spec.ts:93`, `:129`, `:192`, `lab-work.spec.ts:260`, `:303`, `:338`, `:566`, `page.spec.ts:138`.
- S25's: `chat.spec.ts:158`, `chrome.spec.ts:185`, and `page.spec.ts:30` at 1920×1080 (parallel load: 30/30 alone ×3).

**Bytes** (`budget.spec.ts`'s method, `next start`, keyless):

| | `main` (`ce818a0`) | This branch |
|---|---|---|
| First-load JS (gzip) | 186.70 KiB, 9 scripts | **187.06 KiB**, 9 scripts (+0.36 KiB: only the launcher's chunk changed); budget 205.7 |
| HTML of `/` | 127,422 B | 127,422 B |
| `/`'s stylesheets | `278gwr1omn8ec.css` 44,021 B, `3_ro9fti2b1c6.css` 28,727 B | **the same names, bytes and SHA-256** |
| Headers on `/` | — | identical |

### 6. Docs, push, the PR
- **This docs commit:** this entry, plus one line in S26's entry recording its merge; `docs/ROADMAP.md` (#19 merged,
  #21 done, the new **#24**); `claude/START-HERE.md`; `CLAUDE.md` (Production `ce818a0`, the backlog line, the
  suite).
- **#24 (new):** dev-dependency audit hygiene, a small separate PR later.
- `npm test` after it: 225/225. `/` rebuilt from a clean `.next` with these docs in place: its stylesheets are the
  same names and bytes (CLAUDE.md and `claude/` are scanned).
- `fix/f1-launcher-focus` pushed; **PR #25**, ready for review, not merged.

### Clean-up (VL)
- The scratch config, the proxy, the probes and their results are deleted; the scratch worktree of `main` is removed.
- Ports 3400–3431 are free.

### State (VL)
- `main` = `origin/main` = Production = **`ce818a0`**. Untouched.
- `fix/f1-launcher-focus`: `da224bb` (the fix), `d29f80d` (the spec), then this docs commit; pushed; PR #25 open.
- `proto/hero-a-cinematic`: frozen; PR #18 a draft.

### Waiting on Tay
- **Review and merge PR #25.** Then the close-out: the ancestor check, delete `fix/f1-launcher-focus`, `main` clean,
  the merge's Production deployment `success`, and `/` with 0 console errors at 390 and 1440.
- **His call:** `chrome.spec.ts:268` at 390×844 in Firefox reads a stop the instant after the press, so it still fails
  after this fix. It could join #22's Firefox list (a read once the page settles, or an annotation). No test changed
  here.
- **Optional, on a real Firefox:** Tab from the hero at a phone width (390) and at 1024×768: the GRAVITY FLOW tile
  should glide clear of the launcher.
- **Next (Tay's order):** #18 (whenever he has the image), #22, then P4. Low priority: #23. Later, a small separate
  PR: #24.

---

## 2026-11-20 — Session 26 (#19): Next 16.3.8 → 16.4.6, the security release; PR #24 (Claude Code)

> **Merged** by Tay on 2026-11-20 at 21:19:17Z as `ce818a0`; Production since 21:22:33Z, and S26's production checks
> passed (Session 27, §0).

**Scope (Tay's brief, #19; he approved this one dependency change and no other):**
1. Upgrade `next` to exactly 16.4.6, with whatever must move in lockstep, in the repo's pinning style. Read the 16.4
   notes and the bundled docs for changes that touch the repo; stop and report if more than a trivial type fix is needed.
2. Security facts: `npm audit` before and after; `npm ls sharp` (Next's sharp ≥ 0.35.5; the project's own reported,
   not changed).
3. Validate on a clean build: typecheck, lint, unit, build, Playwright on Chromium cold and warm. No test or guard edit.
4. Compare with `main`'s build: JS, HTML, `/`'s stylesheets, headers and CSP, the card, `/lab/*`, the résumé, the chat
   route; Lighthouse mobile against S23's local numbers.
5. Docs; 6. push and a PR, ready for review. No merge, deploy, env or DNS change.

### 0. Preconditions (VL)
- `git fetch` (one DNS blip for github.com, retried), `main` pulled: `main` = `origin/main` = Production = **`7ebff9c`**,
  the tree clean.
  - **PR #23 (#20) is merged:** Tay merged it at 20:16:29Z as `7ebff9c`. The Production deployment of `7ebff9c` was
    created at 20:16:54Z and its status is `success`. `fix/f2-focus-trap` is gone from `origin`.
- `chore/next-16-4-6` cut from `main` (`--no-track`). Node 24.18.0, npm 11.16.0.

### 1. The upgrade (VL)
- `npm install --save-exact next@16.4.6 eslint-config-next@16.4.6`, then `npm ci` from the new lockfile: exit 0, with
  the known allow-scripts warning (`sharp@0.34.5`, `unrs-resolver`).
- **`package.json`:** `next` and `eslint-config-next`, 16.3.8 → 16.4.6, both exact as before. Nothing else.
- **The lockfile moves only Next's own packages:** `next`, `@next/env`, `@next/eslint-plugin-next`, the eight
  `@next/swc-*` binaries and `eslint-config-next` (and the root's two version strings).
  - The Linux SWC packages now declare their `libc`.
  - `next`'s optional `sharp` range is `^0.35.5` (was `^0.35.4`).
  - `eslint-config-next` asks for `eslint-plugin-react-hooks ^7.1.0` and `typescript-eslint ^8.56.0`. The installed
    7.1.1 and 8.59.4 already satisfy both, so neither moved.
  - 16.4.6 declares the same dependencies as 16.3.8, apart from its own packages.
- **No code change was needed.** Typecheck, lint and the build pass on the untouched code.

### 2. What 16.4 changes that touches the repo (VL: the two versions' bundled `node_modules/next/dist/docs`, 129 files differ)
- **`proxy.ts`:** the docs add a "Limitations" section: `use cache`, `use server` and `fetch`'s caching options do
  nothing in Proxy. Ours only sets the six headers. No change; the headers are identical (§4).
- **`next.config.ts`:** nothing it uses changed. The upgrade guide adds that a direct `/_next/image` request with a `q`
  outside `images.qualities` answers 400 (ours: 75 and 90; no case-study image goes through the optimiser). The image
  docs now say Next never optimises SVG, and that the default `dangerouslyAllowSVG: false` rejects it (not set here).
- **`next/font`:** wording only. The built output changed: the Geist class names are shorter (§4).
- **Metadata, `next/og`, the route handler:** no change the repo uses. The card is byte-identical (§4); the chat route
  answers as before.
- **`error.js`:** the docs now type its `error` prop `unknown` (it was `Error & { digest?: string }`), since a value
  thrown in a client component reaches it as-is. `app/error.tsx` keeps the old type; 16.4.6 doesn't enforce the new
  one (typecheck and build pass). Left unchanged: changing it is code, not part of this brief.
- **Tooling:** `next experimental-analyze` is now `next analyze`; `next upgrade --agent` is new; `eslint-config-next`
  supports ESLint 10 (the repo stays on 9). The repo's scripts use none of these.
- **AGENTS.md:** when `next dev` runs under a detected coding agent, it adds or updates a managed block in AGENTS.md.
  16.3.8 does the same; 16.4 only adds an opt-out (`experimental.agentRules`). Our AGENTS.md has no such block, and no
  validation here runs `next dev`.

### 3. The security facts (VL)
| `npm audit` | Before (16.3.8) | After (16.4.6) |
|---|---|---|
| Whole tree | 19: 1 critical, 7 high, 10 moderate, 1 low | **18: 0 critical**, 7 high, 10 moderate, 1 low |
| `--omit=dev` | 3: `next` (critical), `source-map-js` (high), `baseline-browser-mapping` (moderate) | **2**: `source-map-js`, `baseline-browser-mapping` |

- **Gone, all nine against `next` 16.0.0–16.4.4:** critical GHSA-2464-fhr4-w9xw (image optimiser and SVG) and
  GHSA-673q-mjm6-r5xr (`use cache`); high GHSA-p3m5-59mp-jv5r (Server Actions); moderate GHSA-mfr8-8qww-v76h,
  GHSA-vc7v-qv4w-wrv8, GHSA-7qx7-33qx-rqx2, GHSA-f3mh-rxg3-f5g2, GHSA-pc58-hwjq-p385, GHSA-rhh4-g77r-r9qj. **No new
  advisory.** (S23 counted seven moderate; today's database lists six against `next`.)
- **Left, pre-existing, outside the brief:** `source-map-js` 1.2.1 (high GHSA-68fv-2mgg-jv7q, fixed in 1.2.2; through
  `next`'s `postcss` and Tailwind) and `baseline-browser-mapping` 2.10.32 (moderate GHSA-w5vr-8v7q-w6rv, fixed in
  2.11.0; through `next` and `browserslist`). Both are build-time tools; `npm audit fix` would move them. Not done.
- **`npm ls sharp`:** `next@16.4.6 └── sharp@0.35.5` (≥ 0.35.5, as required). The project's own `sharp@0.34.5` (dev;
  only `scripts/m10-images.mjs` uses it) is unchanged. `npm audit` flags it high: GHSA-f88m-g3jw-g9cj (libvips, fixed in
  0.35.0), GHSA-rgj7-g3m4-5g8c (libheif, 0.35.4), GHSA-wq5f-xc86-pv6w (librsvg, 0.35.5).

### 4. Validation and the comparison (VL)
**The suite**, from `.next` deleted, `npx next typegen` first:

| Check | Result |
|---|---|
| `npm run typecheck` | exit 0 |
| `npm run lint` | exit 0, no findings |
| `npm test` (Git Bash) | 225/225, 18 files |
| `npm run build` | exit 0; the same 8 routes as `main`'s table (`/`, `/privacy`, `/api/chat` dynamic; the rest static) |
| `GROQ_API_KEY= npx playwright test`, cold | **193/193**, 16 files, 2.0 min |
| The same, warm | **193/193**, 2.1 min |

**Against `main`** (`7ebff9c` built in a scratch worktree with its own `npm ci`, on :3402; the branch on :3401; both
`next start`, keyless):

| | `main` (16.3.8) | This branch (16.4.6) |
|---|---|---|
| First-load JS (gzip, `budget.spec.ts`'s method) | 185.34 KiB, 9 scripts, 607,569 B raw | **186.70 KiB**, 9 scripts, 611,060 B raw; budget 205.7 |
| HTML of `/` | 127,732 B | 127,422 B |
| `/`'s Tailwind sheet | `1v6nld9ia-p76.css`, 44,069 B | `278gwr1omn8ec.css`, 44,021 B |
| `/`'s cinematic sheet | `3_ro9fti2b1c6.css`, 28,727 B | **the same file**, byte-identical |
| Headers on `/` and `/privacy` | 14 | **identical**, the CSP and the six security headers included, but for `link` (below) |
| `/` | `index, follow`, one canonical | the same |
| `/lab`, `/lab/hero-a`, `/lab/work` | 404 | 404 |
| The résumé | 80,593 B | byte-identical |
| The card (`/opengraph-image`) | 126,193 B | byte-identical; looked at: the dark card, the four names, no states |
| robots, sitemap, manifest, favicon | 83, 256, 387, 25,931 B | byte-identical |
| `POST /api/chat`, empty JSON body | 400 | 400 |
| The same, no content type | 415 | 415 |
| A question, no key (the offline path) | 503, "The assistant is offline right now…" | the same |

**Each difference, explained:**
- **The Tailwind sheet (−48 B), two causes; nothing else differs once both are masked, and no selector is added or
  removed:**
  - `next/font` names the two Geist classes with a short hash instead of the longer module-style name: 24 B shorter
    each. The five font files get new hashed names; their bytes are identical.
  - The CSS minifier now writes the full-pill radius (Tailwind's "infinite" radius) as `2147483647px` instead of
    `3.40282e38px`, in its two rules. The two values have the same length, and a browser clamps either one to a pill.
- **The `link` header** preloads the same Geist file under its new name.
- **First-load JS (+1.36 KiB gzip):** 8 of the 9 chunks changed. Parsed module by module (acorn, as in S17), every app
  module matches `main`'s once two 16.4 build changes are masked:
  - the minifier's local names;
  - Turbopack's shorter module export names in production (the `siteMeta` export ships as a one-letter name).

  The modules that differ are Next's own client runtime (the router, the bootstrap with its version string) and the
  React canary that Next vendors for the App Router: `19.3.0-canary-cbb046ab-20260731` → `19.3.0-canary-278794d7-20261002`.
- **The HTML (−310 B):** with the scripts and preloads removed and the per-build names masked, the markup is
  identical. The difference is Next's own output: the RSC payload's rows are ordered and keyed differently, and the
  Turbopack bootstrap is now an inline script that lists the other chunks. The CSP's script source already allows
  inline scripts, unchanged; the suite saw no console error.
- **`next start` now gzips the metadata routes** (favicon, manifest, robots, sitemap); 16.3.8 sent them uncompressed.
  The bytes are the same. Production compresses at Vercel's edge (NC: check it after the merge).

**Lighthouse 13.6.0** (`npx --yes`, as since S17; mobile defaults, simulated throttling; HeadlessChrome 158; the two
builds interleaved run by run, 5 each; no run warnings; benchmark index 4,061–4,419):

| Median of 5 | `main` 16.3.8 (this session) | **This branch 16.4.6** | S23 (local, the release candidate) |
|---|---|---|---|
| Performance | 100 | **100** | 100 |
| LCP | 1,062 ms | **1,061 ms** | 1,058 ms |
| FCP | 1,062 ms | 1,061 ms | 1,058 ms |
| TBT | 17 ms | **27 ms** | 20 ms |
| CLS | 0 | **0** | 0 |
| Speed Index | 1,348 ms | 1,388 ms | 1,353 ms |
| A11y / BP / SEO | 100 / 100 / 100 | 100 / 100 / 100 | 100 / 100 / 100 |
| Total bytes | 390,062 | 374,785 | 389,820 |

- The LCP element is the h1 (`h1#hxa-title`) in all 10 runs.
- TBT: the branch's five runs are 19–43 ms and `main`'s 14–23 ms. The difference is inside one run's spread.
- Total bytes fall by 15 KB mostly because the favicon is now gzipped locally (transfer 26,262 → 9,680 B). Scripts are
  +1.4 KB.

### 5. Docs, push, the PR
- **This docs commit:** this entry; `docs/ROADMAP.md` (#19 done, #20 merged); `claude/START-HERE.md` (the state,
  "Open PRs / branches", "Waiting on Tay"); `CLAUDE.md` (Production `7ebff9c`, the backlog line, Next 16.4.6, the
  suite); `docs/PROJECT_CONTEXT.md` (Next.js 16.4.6). S25's entry gets one line recording its merge.
- **A separate commit Tay can drop:** `README.md`'s two version mentions (the badge and the stack table). README isn't
  on the brief's list, but both lines describe the current stack.
- `npm test` after the docs: 225/225. `/` rebuilt from a clean `.next` with the docs in place: its two stylesheets have
  the same names and bytes as before the docs (CLAUDE.md, README and `claude/` are scanned).
- `chore/next-16-4-6` pushed; **PR #24**, ready for review, not merged.

### State (VL)
- `main` = `origin/main` = Production = **`7ebff9c`**. Untouched.
- `chore/next-16-4-6`: `19b9e16` (the upgrade), this docs commit, the README commit; pushed; PR #24 open.
- `proto/hero-a-cinematic`: frozen; PR #18 a draft.

### Waiting on Tay
- **Review and merge PR #24.** Then the close-out: the ancestor check, delete `chore/next-16-4-6`, `main` clean, and
  the merge's Production deployment `success`, serving `/` correctly (`index, follow`, the canonical, the headers).
- **Not in this PR, his call:** `source-map-js` and `baseline-browser-mapping` (transitive, build-time; `npm audit
  fix`), and the project's dev `sharp` 0.34.5 (three high advisories; only the image script uses it).
- **Next:** #21.

---

## 2026-11-20 — Session 25 (#20): F2 fixed in the shared focus trap; PR #23 (Claude Code)

> **Merged** by Tay on 2026-11-20 at 20:16:29Z as `7ebff9c`; its Production deployment is `success` (Session 26, §0).

**Scope (Tay's brief, #20):**
1. Diagnose first: trace the trap, list every overlay that uses it, confirm the cause in Playwright WebKit. Continue
   unless the fix needs more than the trap.
2. Fix it in the shared trap so it works whatever the browser treats as tabbable (Safari's default, Option+Tab,
   Chromium, Firefox; Shift+Tab too). Keep Escape, the focus return, and the menu sheet's accessibility button. No new
   dependency.
3. **Approved in advance:** a new regression spec in its own commit. No edit to an existing test or guard; WebKit and
   Firefox only through a scratch config outside the repo.
4. Validate: typecheck, lint, unit, build, Chromium; WebKit and Firefox full runs. Anything not in S23's tables: stop
   and report.
5. Docs; 6. push and a PR, ready for review. No merge.

**Added by Tay after the first report** (I stopped at step 4 on five unlisted failures, §4):
- Continue to the docs and the PR.
- Confirm the three modals hold no radio group, positive tabindex, select, iframe, contenteditable or shadow root (§5).
- Backlog: `chat.spec.ts:158` and `chrome.spec.ts:185`'s `:200` join #22's WebKit list; a new **#23**, low priority
  (§4). Record the parallel-load failures and the `chat.spec.ts:158` probe numbers here.

### 0. Preconditions (VL)
- `git fetch`, `main` pulled: `main` = `origin/main` = Production = **`2cc324c`** (deployment created 17:00:33Z), the tree
  clean. `fix/f2-focus-trap` cut from it. `npm ci` exit 0 (the known allow-scripts warning).
- Verified for the stale lines: PR #22 merged at 17:00:05Z as `2cc324c`. `release/concept-a` and
  `docs/s24-release-closeout` are gone, local and remote. The only open PR is #18 (the prototype, a draft).

### 1. The diagnosis (VL; the unfixed build; WebKit 26.5 through S23's proxy, Firefox 153, Chromium 1234)
- **The path:** `lib/useFocusTrap.ts` let the browser move focus on every Tab and stepped in only when focus already
  sat on its last item (first, for Shift+Tab). Its list includes links. Safari's Tab skips links, so focus never
  reached a last item that was a link, and the browser's own move left the dialog.
- **Who uses it:**

  | Overlay | Where | Modal | Last item | WebKit, unfixed |
  |---|---|---|---|---|
  | The menu sheet | `Navbar.tsx:56` | yes | "Get in touch" (link) | leaks to a "Case study" button behind it; 3 of 9 presses |
  | The chat | `ChatPanel.tsx:55` | only as the phone sheet | Privacy (link) | leaks to `body`; 3 of 9 |
  | The case study | `CaseStudyPanel.tsx:66` | yes | a link | **leaks too** (not in S23): from Close to the chat launcher, as every other control is a link; 4 of 8 |
  | Accessibility; the chat on wide screens | `AccessibilityPanel.tsx:52`; `ChatPanel.tsx:55` | no (by design) | — | Tab is not held; unaffected |

- **A side effect S23 did not record:** the leak scrolls the locked page behind it. In the menu sheet, `scrollY` went
  from 0 to 964 at 390 and to 1,241 at 320.
- **Chromium and Firefox:** 0 leaks in every overlay.
- **Two constraints found:**
  - Playwright's WebKit treats Alt+Tab exactly as Tab (links still skipped), so a key press can't reproduce Option+Tab.
  - Chromium and Firefox make a **scroll area with nothing focusable inside** a Tab stop of its own: the chat's
    transcript, once it scrolls. Script focus of it: Chromium yes, Firefox no, WebKit no (probed with a transcript
    taller than its box; none of the three focuses it while it doesn't scroll). A trap that only called `focus()` would
    drop that stop in Firefox.

### 2. The fix (`63565e8`; `lib/useFocusTrap.ts` only)
- In a modal, the trap now moves focus itself on every Tab, Shift+Tab and Option+Tab, in document order, wrapping at
  both ends, whatever the browser counts as a stop. Ctrl and Cmd+Tab stay with the browser.
- From the container itself or from outside, it counts from where focus sits in the document: Tab enters at the first
  stop after it, Shift+Tab at the last before it. A stop that refuses focus is passed over.
- **The list keeps a scroll area with nothing focusable inside**, as Chromium and Firefox do. Where script can't focus
  one (Firefox, WebKit), it holds `tabindex="-1"` only while focused.
- **The ring: `focus({ focusVisible: true })`.** The first version's walks found no `:focus-visible` on WebKit's
  Option+Tab stops. Probed: script focus during a Tab press, with no ring already showing:

  | Key | Chromium | Firefox | WebKit | With `focusVisible` |
  |---|---|---|---|---|
  | Tab | ring | ring | ring | ring in all three |
  | Alt+Tab | **none** | ring | **none** | ring in all three |
  | Shift+Tab | ring | ring | **none** | ring in all three |
  | Shift+Alt+Tab | ring | ring | **none** | ring in all three |

  The cast `as FocusOptions` is needed: TypeScript's DOM types don't list `focusVisible` yet.
- **A stylesheet detour:** the first build added one rule to `/`'s first stylesheet, `.blur` (44,069 → 44,281 B, a new
  file name). Tailwind read the event name in `addEventListener("blur", …)`, a string in code, not a comment, as a
  class. The listener uses `focusout` (the same here: the scroller has nothing focusable inside), and the stylesheets
  are back to identical.
- **And a second one, caught at the docs step:** a comment in the new spec said the click point keeps clear of the
  dialog's `rounded` corner. That word is a utility too, so the builds the first report's full runs used carried one
  unused rule, `.rounded` (44,069 → 44,099 B). The comment now says
  "curved", folded into the spec's own commit before the push. The final build's stylesheets are the baseline's, names
  and bytes. The first report's JS figure (185.33 KiB) was also measured before `focusVisible`; the final build's is
  185.34 KiB. The final full runs (§4) are on the final build.
- **Unchanged:** Escape (including the non-modal rule), the focus moved in on open, the focus return, the stack of
  overlays, the scroll lock, the non-modal popovers.
- **What changes for a visitor:** Chromium's and Firefox's order is identical to before, the long transcript's stop
  included (compared stop for stop with the unfixed walks). Safari now reaches every control in a modal, the menu's
  four section links and "Get in touch" included, which its default Tab skipped, and the long transcript.

### 3. The new spec (`43f86dd`; `tests/e2e/focus-trap.spec.ts`, approved in advance)
- Six tests: the menu sheet (390, 320), the chat sheet (390, and with a transcript taller than its box), the case study
  (T Poker at 1440, Aegis at 390). Each runs four Tab models:
  - Chromium's own Tab;
  - Option+Tab;
  - Safari's default (`tabindex="-1"` takes the links out of Chromium's Tab order while the trap still lists them);
  - Safari without keyboard navigation (links and buttons out).
- Each model checks:
  - The walk: the overlay opened from the keyboard, then two full turns each way from a pointer click on the dialog's
    surface (focus on the dialog, the ring off), so every stop's ring comes from the press.
  - Every stop in document order, focus never outside, every stop ringed.
  - The page behind never moves; Escape returns focus to the trigger.
- **On the unfixed trap** (Chromium): every Safari model leaks (focus outside, no ring). The case study's page behind
  scrolled 1,271 → 6,739 at 1440 and 1,850 → 8,241 at 390. Before `focusVisible`, the Option+Tab model failed only its
  ring check, in all six.
- **With the fix:** 6/6 in Chromium (40 s), and 6/6 in Firefox and WebKit in their full runs.
- No existing test or guard is changed. The suite's config still runs Chromium only (#22).

### 4. Validation (VL; the fixed build, `.next` deleted first)
| Command | Result |
|---|---|
| `npm run typecheck`, `npm run lint` | exit 0 |
| `npm test` | **225/225**, 18 files |
| `npm run build` | exit 0 |
| `GROQ_API_KEY= npx playwright test` (the repo's config, Chromium) | **193/193** (S23's 187 plus the 6 new tests), 2.1 min, in both the first and the final run |
| Firefox 153: the same tests through a scratch config outside the repo (`Desktop Firefox`, 1440×900; S23's setup) | first run **182/193** (4.0 min); final build **183/193** (3.8 min) |
| WebKit 26.5: the same, `Desktop Safari`, through S23's CSP proxy | first run **175/193** (4.2 min); final build **175/193** (4.1 min), the same 18 |

The first runs were on the build of the first report; the final runs on the pushed tree (§2: it differs only by the
unused `.rounded` rule and the 0.01 KiB of `focusVisible`).

Besides the suites, a scratch probe walked the fixed build 84 times (3 engines × Tab and Option+Tab × forward-first and
backward-first × 7 overlays): 0 stops outside, 0 stops without a ring, and the page behind never moved.

**Firefox, the failures (first run 11, final run 10):**

| Test | First / final | In S23's table? | Class | Alone ×3 |
|---|---|---|---|---|
| `chrome.spec.ts:140`, `lab-work.spec.ts:260` | both | yes | engine-only (CDP) | — |
| `lab-hero-a.spec.ts:129` | both | yes | timing (headless canvas) | — |
| `lab-work.spec.ts:566` | both | yes | timing (reduced motion's frame) | — |
| `lab-work.spec.ts:690` ×2 | both | yes | sub-pixel | — |
| `chrome.spec.ts:268` 390×844 | both | yes | F1 (#21) | — |
| `chapters.spec.ts:10` at 1440×900 | both | **no** | **parallel load**: a hash jump that never scrolled (the panel 1,193 px away after 5 s), among the run's first tests | **3/3 pass** |
| `chapters.spec.ts:10` at 1280×720, 390×844 | first | **no** | the same (957 / 475 px away) | **3/3 pass** each |
| `aegis.spec.ts:6` | first | **no** | **parallel load**: the case study did not appear within 5 s of the click; the run's first test | **3/3 pass** |
| `case-study-axe.spec.ts:12` at 1440×900 | final | **no** | **parallel load**: the case study did not appear within 5 s of the click, so axe never ran | **3/3 pass**, at 1440 and 390 (axe clean with every case study open) |
| `chrome.spec.ts:63` | final | **no** | **parallel load**: the header's surface read `rgba(0, 0, 0, 0)`, early in the run | **3/3 pass** |

Not failing in either run: `lab-work.spec.ts:228` (S23: starvation) and `:338` (S23: intermittent).

**WebKit, the 18 failures (the same in both runs):**
- **15 are in S23's table:** `chat.spec.ts:130`, `chrome.spec.ts:89`, `chrome.spec.ts:140`, `chrome.spec.ts:268` ×2,
  `focus-ring.spec.ts:8` ×2, `lab-hero-a.spec.ts:93`, `:129`, `:192`, `lab-work.spec.ts:260`, `:303`, `:338`, `:566`,
  `page.spec.ts:138`.
- **3 are not:**

  | Test | Class | Alone ×3 |
  |---|---|---|
  | `page.spec.ts:30` 1920×1080 | **parallel load**: an image-decode wait (20 s) timed out | **3/3 pass** (all 10 viewports, 30/30) |
  | `chat.spec.ts:158` | S23's instant-`fill` race (below) | 0/3 |
  | `chrome.spec.ts:185` | its F2 loop (`:199`) **passes**; it now stops at `:200`: Safari doesn't focus a button on click (below) | 0/3 |

- **Now passing: `chat.spec.ts:76` (F2).** Also passing in both runs: `chat.spec.ts:174` (the race, by chance).

**The `chat.spec.ts:158` race, probed on both builds** (WebKit, 1440, the test's steps: open, `fill`, Enter; 10 runs
each):
- **`main` (`2cc324c`):** Enter's `keydown` landed on Close **6/10** times (no request; the panel closed). On the field
  4/10 (one request; the answer came).
- **The fix:** on Close **8/10**, on the field 2/10. An earlier 5-run probe on the fix: 3/5.
- The same race on both builds: the trap's on-open focus move, the passive effect this PR doesn't touch, lands after
  Playwright's instant `fill`. It passed in S23's full run by chance. Tay: added to #22's WebKit list.

**`chrome.spec.ts:185`'s `:200`, probed on both builds** (WebKit, 390, the menu):
- Opened by a click: focus inside goes to Close; after Escape, `body`. Identical on `main` and the fix.
- Opened from the keyboard (focus the button, Enter): after Escape, "Open menu". Identical on both.
- Safari doesn't focus a button on click, so the trap had nothing to return to. S23 never reached `:200`, because the
  F2 loop failed first. Tay: added to #22's WebKit list, and the behaviour itself is backlog **#23** (low priority,
  pre-existing, not in this PR).

**The rest of step 4:**
- Axe on the case study (`case-study-axe.spec.ts`, every case study at 1440 and 390) passes in Chromium and WebKit in
  both runs. In Firefox it passes in the first run, and alone ×3 after the final run's load failure (above).
- The accessibility button in the menu sheet (`chrome.spec.ts:208` at 320 and 390) passes in all three engines.
- The new spec passes 6/6 in all three, in both runs.

### 5. Tay's check: what the trap's own walk could get wrong (VL)
- **The rendered DOM** (Chromium; the menu sheet and the chat sheet at 390, all six case studies at 1440 and 390):
  - Nothing found, in every modal: 0 radio inputs or radio roles, 0 positive `tabindex`, 0
    `select`/`iframe`/`frame`/`object`/`embed`, 0 contenteditable, 0 `audio`/`video`, 0 `details`/`summary`, 0 shadow
    roots, 0 custom elements.
  - The menu sheet has 24 elements, the chat sheet 25, the case studies 97–177. No `tabindex` attribute inside any of
    them (only the dialog roots' own `-1`).
- **The source:** a search of `app`, `components`, `lib` and `data` finds none of these.
- The page's only shadow root is Next's `next-route-announcer`, at the body level, outside every dialog.

### 6. Bytes (VL; `budget.spec.ts`'s algorithm)
| | Before (`2cc324c`) | After |
|---|---|---|
| First-load JS (gzip, 9 scripts) | 185.10 KiB (606,933 B raw) | **185.34 KiB** (607,569 B raw); budget 205.7 |
| HTML | 127,732 B | 127,732 B |
| `/`'s stylesheets | `1v6nld9ia-p76.css` 44,069 B, `3_ro9fti2b1c6.css` 28,727 B | **the same names and bytes** |

Against production's own copy, the first stylesheet's selectors are identical. Its bytes differ only in the fonts'
hashed file names, which come from Vercel's build.

### 7. Docs, push, the PR
- **This docs commit:**
  - `docs/ROADMAP.md`: #20 done; #22's WebKit list gains `chat.spec.ts:158` and `chrome.spec.ts:185`'s `:200`; the
    new #23.
  - This entry.
  - `claude/START-HERE.md`: the state, and its stale "Open PRs / branches".
  - `CLAUDE.md`: its stale release-branch line, and the suite's count.
- `npm test` after it: 225/225. `/` rebuilt with these docs in place: its stylesheets are the baseline's, names and
  bytes (CLAUDE.md and `claude/` are scanned).
- `fix/f2-focus-trap` pushed; **PR #23**, ready for review, not merged.

### Clean-up (VL)
- The scratch Playwright config, the CSP proxy, the probes and their results are deleted.
- A temporary worktree of `main` (`2cc324c`), built for the comparisons, is removed (`git worktree prune`).
- Ports 3400–3431 are free.

### State (VL)
- `main` = `origin/main` = Production = **`2cc324c`**. Untouched.
- `fix/f2-focus-trap`: `63565e8` (the fix), `43f86dd` (the spec), then this docs commit; pushed; PR #23 open.
- `proto/hero-a-cinematic`: frozen; PR #18 a draft.

### Waiting on Tay
- **Review and merge PR #23.** Then the close-out: delete `fix/f2-focus-trap` after the ancestor check, and confirm
  `main` is clean.
- **Optional, on a Mac (NC here):** Playwright's WebKit can't reproduce Option+Tab or Safari with macOS keyboard
  navigation off. Desktop Safari on the Preview would confirm both: open the menu at a narrow width, the chat sheet, a
  case study; Tab, Option+Tab and Shift+Tab should wrap inside, each stop ringed.
- **Next:** #19.

---

## 2026-11-20 — Session 24: the release verified; Concept A is live at `3a98d22` (Claude Code)

**Scope (Tay's brief, S24, read-only on production):**
1. Confirm the merge commit on `main`, and that Vercel's Production deployment is that SHA.
2. The production checklist through Cloudflare with a browser `Accept` header, pass or fail with evidence. On any
   failure, stop and report: no fix on `main`, no rollback.
3. If all pass, a small branch from `main`: the sitemap date at the merge date, and the docs close-out (START-HERE,
   this log, the ROADMAP, CLAUDE.md). `npm test`, push, a PR; no merge.
4. Delete no branch; list `release/concept-a` and `proto/hero-a-cinematic` for a later per-branch yes.

### 0. A first attempt, stopped (VL)
- The brief's first version said PR #21 was merged. After `git fetch` and `pull`, `main` was still `443a1f9`.
- `gh pr view 21`: OPEN, still a draft, `mergedAt` null. Production was still `443a1f9`.
- Nothing was run on production, and nothing was changed. Reported to Tay; GitHub won't merge a draft before "Ready
  for review".
- Tay then marked it ready, merged it with a merge commit, and asked for S24 from step 1.

### 1. The merge and the deploy (VL)
- **PR #21: MERGED** 2026-11-20 02:53:15Z, merge commit **`3a98d22`**.
  - First parent `443a1f9` (= `product-plates-final`, whose tag still points there); second parent the PR head
    `5ea8d57`.
  - The tree is identical to the PR head (`git diff 5ea8d57 3a98d22`: empty).
- **Vercel's Production deployment is `3a98d22`:** deployment `7931917395`, created 02:53:47Z, status `success`. The
  commit's combined status is `success`. It is the latest Production deployment.

### 2. The production checklist (VL; `https://www.tayshofer.dev` through Cloudflare, browser `Accept`, 2026-11-20)
| Check | Result | Evidence |
|---|---|---|
| `/`: `index, follow`, one canonical, no noindex | **Pass** | 200. `robots` "index, follow", `googlebot` "index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1". Canonical `["https://tayshofer.dev"]` (one). "noindex" nowhere in the HTML; no `X-Robots-Tag` |
| `/`: the h1 and lede are Concept A's | **Pass** | One h1, "Building software. Turning ideas into products."; the lede, "I build end to end — mobile apps, security systems, developer tools and games, from the interface down to the infrastructure." `data-theme="dark"`; 2 JSON-LD blocks; no Product Plates markup. Title "Tay Shofer — Software Engineer" |
| Security headers and CSP equal to `main` before the merge | **Pass** | The six headers (CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`) on `/` and `/privacy` are **identical** to production's at `443a1f9`, captured in S23 the same way. `X-Powered-By` absent; no `Set-Cookie` on either |
| `/privacy`: the Cloudflare sentence, one cookie | **Pass** | 200. The approved sentence and its link to `cloudflare.com/privacypolicy/`. "One first-party cookie exists only if you change a setting yourself", naming `a11y`; no theme cookie. "Last updated 20 November 2026" |
| The 404 page dark | **Pass** | `/nope` 404 with `data-theme="dark"`. In Chromium, `/lab/work`'s 404 body is `rgb(11, 12, 15)`: "That page doesn't exist." (`robots` "noindex, follow" on the 404 only) |
| `/lab`, `/lab/hero-a`, `/lab/work` | **Pass** | 404, 404, 404. `/he` 308 → `/` |
| `robots.txt`, `sitemap.xml` | **Pass** | Robots 200: `Allow: /`, `Disallow: /api/`, the sitemap link. Sitemap 200: `https://tayshofer.dev`, `lastmod` 2026-11-20 |
| The OG image (dark, names only) and its meta tags | **Pass** | `og:image` 200, `image/png`, 126,193 B, 1200×630. Viewed: the dark hero in miniature with the h1, and "T Poker, Aegis, DeveloperOS, GRAVITY FLOW" only, no states. Meta: `og:title` "Tay Shofer — Software Engineer", `og:type` profile, `og:url`, `og:image:alt` "Tay Shofer — Building software. Turning ideas into products.", 1200×630 `image/png`, `twitter:card` `summary_large_image`, `twitter:image`, `theme-color` `#04060d`, `color-scheme` dark |
| The résumé PDF, 80,593 bytes | **Pass** | 200, `application/pdf`, **80,593 B**; its SHA-256 equals the repo's file |
| The chat answers (one real question) | **Pass** | An empty POST: 400. "What is Aegis, and is its AI analysis a real LLM?": 200 in 0.97 s, a correct answer that says Aegis's "AI analysis" is a deterministic template engine, not a language model |
| Cloudflare's HTML == Vercel's | **Pass** | `www.tayshofer.dev` (`Server: cloudflare`, `cf-cache-status: DYNAMIC`) and `tay-shofer-portfolio.vercel.app` (`Server: Vercel`), twice each with the same headers: **byte-identical**, 128,168 B, SHA-256 `3a963e9e5cd4de4f…`, the same chunk and stylesheet names. The deployment's own URL and the team aliases answer 302 to Vercel's login; the connector's authenticated fetch was not used (it creates a share link). The `.vercel.app` alias serves this same build, which the identical chunk names prove. No cache purge needed |
| One 2D `aria-hidden` canvas, zero WebGL | **Pass** | Chromium at 390×844 (DPR 3, touch) and 1440×900, every `getContext` call recorded from the first script, then the page scrolled through. One canvas, in `#hero`, `aria-hidden="true"`, `data-state="running"`. 13 contexts requested, all `"2d"`: the field's own, plus its 12 detached sprite canvases (a sprite and a glow per hue, `Constellation.tsx:117–136`). **0 WebGL**, 0 console errors, 0 failed requests, no horizontal overflow |
| Lighthouse mobile, median of 5, against S17 | **Pass** | Performance **100** (S17: 98), LCP **1,064 ms** (S17: 2,288 ms). Below |

**Lighthouse 13.6.0 on production** (`npx --yes`, mobile defaults: simulated throttling, 412×823; HeadlessChrome 158;
five runs in a row; benchmark index 3,990–4,071, against S17's 3,971–4,036; no run warnings):

| Run | Perf | A11y | BP | SEO | FCP | LCP | TBT | CLS | SI | Bytes |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 100 | 100 | 100 | 100 | 1,060 ms | 1,060 ms | 7 ms | 0 | 1,394 ms | 380,004 |
| 2 | 100 | 100 | 100 | 100 | 1,066 ms | 1,066 ms | 39 ms | 0 | 1,775 ms | 380,126 |
| 3 | 100 | 100 | 100 | 100 | 1,053 ms | 1,053 ms | 32 ms | 0 | 1,462 ms | 380,004 |
| 4 | 100 | 100 | 100 | 100 | 1,064 ms | 1,064 ms | 57 ms | 0 | 1,651 ms | 380,070 |
| 5 | 99 | 100 | 100 | 100 | 1,272 ms | 1,272 ms | 33 ms | 0 | 2,865 ms | 380,028 |
| **Median** | **100** | **100** | **100** | **100** | **1,064 ms** | **1,064 ms** | **33 ms** | **0** | **1,651 ms** | **380,028** |
| S17 (`443a1f9`) | 98 | 100 | 100 | 100 | 1,140 ms | 2,288 ms | 35 ms | 0 | 1,439 ms | 345,031 |

- The LCP element is the h1 (`h1#hxa-title`). S17's was a hero tile's image.
- **Speed Index is 212 ms above the baseline** (1,651 against 1,439; run 5 alone 2,865). It is still well inside
  "good". The page's first screen carries the hero's living field, whose drawing keeps the visual progress moving
  (NC as the whole cause). Performance and LCP, the two numbers the brief compares, are both better.
- **Bytes** (`budget.spec.ts`'s algorithm, through Cloudflare): first-load JS **185.36 KiB** gzip over 9 scripts
  (607,522 B raw; budget 205.7; S17 production 182.04), HTML **128,168 B** (S17: 160,584). Vercel's chunks run a little
  larger than a local build's (185.10 KiB), as S17 recorded.

**Everything passes**, so step 3 went ahead.

### 3. The close-out branch `docs/s24-release-closeout` (from `main` `3a98d22`)
- **(a) The sitemap date:** `CONTENT_LAST_MODIFIED` is already `2026-11-20`, the merge's date (02:53Z UTC; 04:53 local),
  so the value stays. Only its comment changes: "S24 moves it to the merge date" became "live since PR #21 merged on
  this date (S24)".
- **(b) The docs:**
  - **START-HERE:** Concept A is live; the release track is done; next, #20, #19, #21, #18, #22, then P4. Product
    Plates is kept as the record. The branches are listed, and the live-site session prompt replaces the release one.
  - **`docs/ROADMAP.md`:**
    - P5/P6 done, the S24 row done, and M7 done for Concept A.
    - The rollback names `3a98d22`.
    - "After the release" in Tay's order.
    - The P4 restore record's two SHAs: every file it names exists at `3a98d22^1` = `443a1f9`.
  - **CLAUDE.md:**
    - The intro and "Where production code is" (Production `3a98d22`, the live page's files, S24's checks, the
      rollback, which Vercel URLs are public).
    - The release branch as merged; D1 live; the suite on `main`; the Chromium-only config and WebKit's localhost CSP
      note (#22).
  - **`docs/CINEMATIC_SYSTEM.md`** (the ROADMAP's S24 row lists it): the status (live on `/`), "Where it lives" with
    the live paths, and a map of the prototype's paths to `main`'s, so the prototype-era sections below stay readable.
    The CSS-pin line says the pin was deleted in S20.

### 4. The branches (VL; none deleted)
- **Kept for a per-branch yes:**
  - `release/concept-a` (`5ea8d57`, local and remote): **merged** into `main`; safe to delete on Tay's word.
  - `proto/hero-a-cinematic` (`92b08fd`, local and remote; **draft PR #18** open): not merged, by design. R1 keeps it
    frozen as the record ("never merge, never delete").
- **Unchanged since D8** (unmerged, kept): `feature/portfolio-polish`, `feature/premium-portfolio-redesign-1mqmgf`, the
  four `review/m10-*`, and `reference/premium-redesign-package` (stale; never build from it).

### Waiting on Tay
- **Merge the close-out PR.**
- **His manual steps:**
  - Refresh the share card in LinkedIn's Post Inspector (https://www.linkedin.com/post-inspector/).
  - A reindex request for `https://tayshofer.dev/` if he uses Google Search Console (URL Inspection → Request
    indexing).
- **A per-branch yes** for `release/concept-a` and `proto/hero-a-cinematic`, whenever he wants.
- **Next:** backlog #20, in a new session.

---

## 2026-11-20 — Session 23 close-out: the phone review approved; every engine failure traced ×3; F1, F2 to the backlog (Claude Code)

**Scope (Tay's brief):** the phone review is done ("everything works on my phone"), approved on one condition: list
all 18 WebKit failures one by one, like Firefox's, each with its test, error and class. Rerun every suspected flake
alone three times. Stop before fixing if any is a real site bug introduced by the release. Then log F1 and F2 (not in
PR #21) and the engine-specific tests in the ROADMAP, and close S23: the PR body, START-HERE, this log and the ROADMAP
in one docs commit; `npm test`; push; delete the scratch Playwright config; confirm `main` and Production.

### Decisions (Tay)
- **The phone review: approved, 2026-11-20** (the Preview).
- **F1 and F2 are not in PR #21.**
  - F2 is backlog **#20**: a small PR right after S24, before #19, that fixes it in the shared focus trap.
  - F1 is backlog **#21**, after #20.
- **The engine-specific tests** are backlog **#22**, a later item for proper per-browser handling. No test changes now.

### 1. Every failure, alone ×3 (VL; one worker, `--repeat-each=3`; WebKit through the S23 proxy)
**No failure is a site bug introduced by the release**, so the close went ahead.

The classes:
- **engine-only:** an API or behaviour the engine lacks or does differently.
- **starvation:** passes alone; failed under 8 parallel workers.
- **timing:** a measurement or race window, not the page.
- **sub-pixel:** an exact float compare.
- **F1 / F2:** the known issues.

**WebKit 26.5 (18):**

| Test | Error (full run) | Class | Alone ×3 |
|---|---|---|---|
| `chat.spec.ts:76` | focus inside the chat panel: expected true, received false | F2 | 0/3 |
| `chat.spec.ts:130` | `mouse.wheel: Mouse wheel is not supported in mobile WebKit` | engine-only (API) | 0/3 |
| `chat.spec.ts:174` | the reply's count: expected 1, received 0 (1440 twice, 390 once) | timing: the trap's deferred focus after an instant `fill` | 0/3 |
| `chrome.spec.ts:89` | the underline at "about": expected `""`, received `"#work"` | starvation | 3/3 |
| `chrome.spec.ts:140` | `CDP session is only available in Chromium` | engine-only (API) | 0/3 |
| `chrome.spec.ts:185` | focus inside the menu sheet: expected true, received false | F2 | 0/3 |
| `chrome.spec.ts:268` 1440×900 | the first stop: expected "Skip to content", received "Accessibility settings" | engine-only: Safari's Tab skips links | 0/3 |
| `chrome.spec.ts:268` 390×844 | the same, received "Open menu" | engine-only: Safari's Tab | 0/3 |
| `focus-ring.spec.ts:8` 1440×900 | the walk: expected > 40 stops, received 25 | engine-only: Safari's Tab | 0/3 |
| `focus-ring.spec.ts:8` 390×844 | the same, 25 | engine-only: Safari's Tab | 0/3 |
| `lab-hero-a.spec.ts:93` | LCP = FCP: expected 127, received 237 (×3: 78/183, 75/181) | timing: WebKit files the h1's LCP late (below) | 0/3 |
| `lab-hero-a.spec.ts:129` | rAF count: expected > 10, received 0 (×3: 3, 4, 3) | timing: software canvas at Desktop Safari's DPR 2 | 0/3 |
| `lab-hero-a.spec.ts:192` | 14 lines differ: every link is missing from the order | engine-only: Safari's Tab | 0/3 |
| `lab-work.spec.ts:260` | the same CDP error | engine-only (API) | 0/3 |
| `lab-work.spec.ts:303` | 8 lines differ: the panels' and Two more's links are missing | engine-only: Safari's Tab | 0/3 |
| `lab-work.spec.ts:338` | the phone tap (`:348`): expected `"0px -4px"`, received `"none"` | engine-only: a tap sets no `:hover` in mobile WebKit | 0/3 |
| `lab-work.spec.ts:566` | `toBeFocused()`: received inactive | engine-only: Safari doesn't focus a button on click | 0/3 |
| `page.spec.ts:138` | "offline right now": element not found | timing: the same race as `chat.spec.ts:174` | 0/3 |

**Firefox 153 (9):**

| Test | Error (full run) | Class | Alone ×3 |
|---|---|---|---|
| `chrome.spec.ts:140` | `CDP session is only available in Chromium` | engine-only (API) | 0/3 |
| `lab-work.spec.ts:260` | the same | engine-only (API) | 0/3 |
| `lab-hero-a.spec.ts:129` | rAF count: expected > 10, received 4 | timing: headless canvas at the threshold (the miss alone received 10) | 2/3 |
| `lab-work.spec.ts:228` | a side-capture click: expected 4, received 0 | starvation | 3/3 |
| `lab-work.spec.ts:338` | the hovered edge unchanged | timing: reduced motion's frame | 1/3 |
| `lab-work.spec.ts:566` | C#'s fill: received `rgba(238, 242, 251, 0.03)` | timing: reduced motion's frame | 1/3 |
| `lab-work.spec.ts:690` (motion on) | `5001.63313293457` against `5001.633117675781` | sub-pixel | 0/3 |
| `lab-work.spec.ts:690` (reduced motion) | the same | sub-pixel | 0/3 |
| `chrome.spec.ts:268` 390×844 | GRAVITY FLOW under the chat launcher | F1 | 0/3 (1440: 3/3 pass) |

### 2. Two probes added at the close (VL)
- **WebKit's LCP (`lab-hero-a.spec.ts:93`): not the reveal.** The hero is new in the release, so this one was checked against the stop rule.
  - Three loads at DPR 2: the h1 is `opacity 1`, `visible` from its first sampled frame, which lands at FCP (120/121, 75/77, 113/114 ms). Geist has loaded before FCP (49–109 ms).
  - WebKit files the h1's LCP entry later (239, 183, 205 ms). Chromium files it at FCP (116, 116, 112).
  - So the h1 shows with the first paint in both. The gap is WebKit's LCP timing.
- **Firefox's frame rate:** headless Firefox 153 draws a blank page at 73 frames per 600 ms, and `/` with the field at 12–16. The loop runs correctly, and real Firefox draws on the GPU. A real Firefox window was not measured (NC); Tay can open the Preview in desktop Firefox.

### 3. Docs and the PR
- **`docs/ROADMAP.md`:**
  - Backlog **#20** (F2, right after S24, before #19), **#21** (F1, after #20) and **#22** (the engine-specific tests, later; no test changes now).
  - The "After the release" lines.
  - P5/P6: S23 done and approved, S24 next. The S23 row marked done.
- **This log:** the close-out, plus two refinements in "Session 23" (§3 Firefox's `:129` and `:228`; §4 the race's viewports).
- **`claude/START-HERE.md`:** S23 approved and closed; what's next (S24); what waits on Tay.
- **PR #21's body:**
  - "Phone review: approved by Tay, 2026-11-20".
  - Both engines' failures as per-test tables (test, error, class, alone ×3).
  - "Known issues (pre-existing, not in this release)": F1, F2 and #22.
  - The backlog order.
  - Still a draft: not marked ready, not merged.

### Clean-up (VL)
- The scratch Playwright configs (`xbrowser.config.ts`, `webkit-uir.config.ts`) are deleted, with their results folders. Ports 3400–3411 are free.
- `.next` is this tree's build.

### State (VL)
- `origin/main` = **`443a1f9`** = Production, tagged `product-plates-final`. Untouched.
- `release/concept-a`: S23's docs commits, pushed. **Draft PR #21**, approved on the phone.
- `proto/hero-a-cinematic`: frozen; PR #18 a draft.

### Waiting on Tay (S24)
- **Before the merge:** check that `product-plates-final` still points at `443a1f9`.
- **Mark PR #21 ready, and merge it** (a merge commit, so `git revert -m 1` works for the rollback).
- **Then the production checks** in the PR body, read-only, in a session.
- **His manual steps:** LinkedIn's Post Inspector for the card; a reindex request if he uses Search Console.

---

## 2026-11-20 — Session 23: the release candidate; draft PR #21 opened (Claude Code)

**Scope (Tay's brief, S23):**
1. Full validation on a clean build, then the suite on WebKit and Firefox. Installing Playwright's two browsers is approved; no project dependency. Report per browser. A real bug gets its own commit. Show Tay any test that can't apply to a browser; skip none silently.
2. A final review of `git diff main...release/concept-a`: noindex, `/lab`, headers and CSP, `GROQ_API_KEY` and secrets, the private-repo and institution guards, leftover markers, the résumé.
3. Lighthouse mobile (median of 5) on a local production build, with first-load JS and HTML; screenshots of `/` at 390 and 1440 in scratch.
4. Push, then a **draft** PR "Release: Concept A" into `main`. Do not merge it or mark it ready. Then the PR link, the Preview, START-HERE and this log. The session stays open until Tay reviews on his phone.

**Added by Tay mid-session:**
- The Next 16.3.8 advisories are not in this release: backlog #19 (a separate PR on `main` after S24).
- Two facts for the report, read-only: the installed sharp version, and what the share card renders.

### 1. Preconditions (VL)
- `git fetch`, `release/concept-a` checked out and pulled: HEAD **`94d8330`**. `main` = `origin/main` = **`443a1f9`** = Production (`gh api …/deployments`, created 2026-11-19 03:20Z).
- `npm ci` exit 0 (the known allow-scripts warning for sharp and unrs-resolver). `.next` deleted; `npm run build` exit 0, 8 routes, no `/lab`.

### 2. Validation (VL, Git Bash)
| Command | Result |
|---|---|
| `npm run build` (`.next` deleted first) | exit 0 |
| `npx next typegen`, `npm run typecheck` | exit 0 |
| `npm run lint` | exit 0 |
| `npm test` | **225/225, 18 files** |
| `GROQ_API_KEY= npx playwright test` (the repo's config, Chromium), cold, right after the clean build | **187/187**, 15 files, 2.0 min |
| `npx playwright install webkit firefox` (approved) | Firefox 153.0 (v1538), WebKit 26.5; no project file changed |
| Firefox: the same tests, server and timeout, through a scratch config that swaps only the browser (`Desktop Firefox`, 1440×900) | **178/187** (§3) |
| WebKit: the same scratch config with `Desktop Safari` | 64/187: the harness, not the site (§4) |
| WebKit through a scratch proxy that drops only `upgrade-insecure-requests` from the CSP | **169/187** (§4) |

The scratch configs import the repo's own Playwright and run `tests/e2e` unchanged; nothing in the repo changed for them.

### 3. Firefox: the 9 failures, each traced (VL)
- **2 can't apply:** `chrome.spec.ts:140` and `lab-work.spec.ts:260` open a CDP session, which is Chromium only ("CDP session is only available in Chromium").
- **2 pass alone (load):** `lab-hero-a.spec.ts:129` (4 frames in 600 ms under 8 Firefox workers) and `lab-work.spec.ts:228` (the side-capture click). Both pass alone with one worker.
  - **Refined at the close-out (×3 alone):** `:228` passes 3/3, so it is starvation. `:129` passes 2/3 (the miss received 10 against "> 10"), so it is timing: headless Firefox draws the field at 12–16 frames per 600 ms.
- **2 read reduced motion's 1µs transitions in the same tick:**
  - The source: `app/globals.css:382` and `:392`, `transition-duration: 0.001ms !important` (unchanged from `main`).
  - Firefox creates real transitions for them and finishes them on the next frame; Chromium reports the end value at once.
  - Probed:
    - Stack: right after a press, `getAnimations()` lists background, border and colour transitions and the pill is still the glass ink; at 50 ms it is cyan.
    - The stage's hover edge: old at the read in 2 of 8 tries, with five 0.001 ms transitions "running"; at 50 ms, 8 of 8 changed.
  - The tests: `lab-work.spec.ts:566` (deterministic) and `:338` (intermittent, 2 of 3). To a visitor it is one frame.
- **2 sub-pixel:** `lab-work.spec.ts:690` ×2. The title's top reads `5001.633117675781` against `5001.63313293457` (0.0000153px; Firefox lays out in 1/60 px units) under exact equality.
- **1 real finding, F1** (`chrome.spec.ts:268` at 390×844; below).

### 4. WebKit (VL)
**The first run (64/187) is the harness.** A probe of `/` over `http://localhost:3401` in WebKit 26.5:
- Every `/_next/static` request went to `https://localhost:3401` and failed: 15 requests, "SSL connect error".
- No stylesheet applied (the body transparent), no JS, no hydration, and the case study did not open.
- The cause is the CSP's `upgrade-insecure-requests`, which WebKit applies to localhost. Chromium and Firefox treat localhost as trustworthy, and both loaded everything (0 failed requests, the dialog opens).
- Production is HTTPS, where the directive changes nothing; `main` has the same `proxy.ts`.
- `openssl` is blocked here, and a Windows certificate would go into Tay's store, so no local TLS.

**The second run goes through a scratch proxy instead** (`uir-proxy.mjs`, Node's `http` only):
- It forwards every request and response unchanged, except that it removes that one directive from the `Content-Security-Policy` header. Every other directive stays enforced.
- The one test that reads the CSP only checks that it is present (`english.spec.ts:24`).
- Probed through it: 0 failed requests, 0 console errors, both stylesheets applied, and the case study opens.

**169/187. The 18 failures, each traced:**
- **Safari's keyboard model (7).**
  - By default Safari's Tab skips links (they need Option+Tab or a system setting). The walks start at a button ("Accessibility settings" at 1440, "Open menu" at 390) instead of "Skip to content", and reach 25 stops, not 40+. Every missing stop in the diffs is a link.
  - The tests: `chrome.spec.ts:268` ×2, `focus-ring.spec.ts:8` ×2, `lab-hero-a.spec.ts:192`, `lab-work.spec.ts:303`.
  - Safari also doesn't focus a button on click: `lab-work.spec.ts:566` ("Expected: focused, Received: inactive").
- **APIs not in WebKit (3):** CDP (`chrome.spec.ts:140`, `lab-work.spec.ts:260`); "Mouse wheel is not supported in mobile WebKit" (`chat.spec.ts:130`).
- **A focus race, not visitor-facing (2):** `chat.spec.ts:174` and `page.spec.ts:138`. The full run failed `:174` at 390; alone ×3 it failed at 1440 twice and at 390 once, so the viewport doesn't matter.
  - Instrumented: with the text typed the instant the panel appears, Enter's `keydown` lands on a **button**. `useFocusTrap`'s passive effect (unchanged) moves focus to Close after Playwright's `fill`, so Enter presses Close.
  - With 500 ms before typing, `keydown` lands on the field and the form submits (one request). Chromium runs the effect before the `fill` at both waits.
  - A plain HTML form submits on a page-level Enter in the same WebKit, desktop and mobile. `textbox.press("Enter")` and tapping Send both work at 390.
- **Software canvas (1):** `lab-hero-a.spec.ts:129`, 0 frames counted.
  - `Desktop Safari`'s scale factor is 2 (`Desktop Chrome`'s and `Desktop Firefox`'s are 1). The test's own counter in WebKit gives 16–17 frames in 600 ms at DPR 1, 3–4 at DPR 2, and 0 under the suite's load. The field is "running" throughout, with the page visible.
  - Headless WebKit on Windows draws canvas in software, which is pessimistic like headless Chromium's SwiftShader. The field already caps its DPR (`Constellation.tsx:132`: 2, or 1.5 in its light mode).
- **LCP timing (1):** `lab-hero-a.spec.ts:93`. WebKit's LCP element is the h1 (`hxa__title`) at 160 ms, FCP 118 ms (Chromium 112 / 112). The reveal doesn't hide it; the test's equality is Chromium's report.
- **Touch hover (1):** `lab-work.spec.ts:338`. After a tap in mobile WebKit the panel matches neither `:hover` nor `:active`, so the stage doesn't lift (Chromium: `:hover`, lifted). Cosmetic; a real iPhone shows the truth (NC).
- **Load (1):** `chrome.spec.ts:89` passes alone.
- **A real finding, F2 (2):** `chat.spec.ts:76`, `chrome.spec.ts:185` (below).

### 5. Found in this session, for Tay (neither caused by the release; no fix made)
- **F1, Firefox: a focused control partly under the chat launcher at two phone widths.**
  - #16 relies on `html { scroll-padding-bottom }`. Firefox's focus scroll ignores it when the target is already inside the viewport.
  - Probed at 390×844: the hero's GRAVITY FLOW link at 702–806, the launcher at 782–832; Firefox leaves the page at `scrollY` 0, where Chromium's scroll leaves the link ending at 772.
  - A Tab walk at 8 sizes (320×568 to 1440×900, plus 1024×500): Firefox has 2 stops partly under it, "Case study" at 375×667 (2%) and that link at 390×844 (12%). Chromium has 0 at all 8. None is wholly hidden, so WCAG 2.4.11 (AA) holds; #16's "never under it" does not.
  - Production has no bottom scroll padding (only the header's `scroll-padding-top`); S17 measured the same tile under the label on load at 320–375.
  - Tried in a probe only: a `scroll-margin-bottom` on `:focus-visible` cleared the 375 stop but not the 390 one. A reliable fix is a focus handler in the launcher's client code. Tay's call.
- **F2, Safari: focus can leave a modal sheet for one Tab** (pre-existing).
  - `lib/useFocusTrap.ts` (unchanged from `main`) steps in only at the first and last items of its list, which includes links. The last item is a link in both sheets: the menu sheet's "Get in touch" and the chat's Privacy.
  - Safari's default Tab skips links, so the trap never sees the last item:
    - From the menu sheet's "Accessibility settings", focus goes to a "Case study" button on the page behind.
    - From the chat's field, it goes to `body`.
    - The next Tab comes back to Close.
  - `main`'s sheet also ends on its "Get in touch" link, so this is pre-existing.
  - A fix (the trap moving focus itself on every Tab) changes a hook every overlay shares. Tay's call.

### 6. The review of `git diff main...release/concept-a` (VL; 149 files: 86 added, 22 deleted, 41 modified)
- **`/` indexable, `/lab` gone** (the build on `:3401`):
  - `index, follow` (robots and googlebot), exactly one canonical `https://tayshofer.dev`, no `noindex` in the HTML or `X-Robots-Tag`, and none in `app`, `components`, `lib`, `data`, `proxy.ts` or `next.config.ts`.
  - `/lab`, `/lab/hero-a`, `/lab/work` answer 404. `/privacy` 200, `/nope` 404, `/he` 308 → `/`.
  - Robots, the sitemap, the card (126,193 B PNG) and the manifest answer 200. The résumé is 80,593 B. `POST /api/chat` with an empty body answers 400.
- **Headers and CSP identical:**
  - `proxy.ts` and `next.config.ts` have 0 diff lines.
  - The six security headers on `/` and `/privacy` of the release build equal live production's, byte for byte (a read-only `curl` with a browser `Accept`: `Server: cloudflare`, a `CF-RAY`, an `x-vercel-id`). `X-Powered-By` is absent on both.
  - The one inline script in the diff is `main`'s early-click handler, moved unchanged from `components/work/Work.tsx` to `app/page.tsx`. Both canvas contexts in the added code are `"2d"`.
- **`GROQ_API_KEY`:**
  - Read only in `app/api/chat/route.ts` (0 diff lines). The diff mentions it only in doc lines.
  - No `GROQ_API_KEY`, `gsk_` or `api.groq.com` anywhere in `.next/static`. No `NEXT_PUBLIC_` in the tracked code. No `.env` file tracked.
- **Secrets:** a pattern scan of every added line (key prefixes, private keys, tokens, assignments of long secrets) finds none. The only new external URL in the code is Cloudflare's privacy policy.
- **The guards:**
  - The unit suite's private-repo and institution guards pass over the tree.
  - `tests/support/`'s own functions, run in Node over every commit message on the branch and over the PR body, find nothing.
  - The guard files (`dead-code.test.ts`, `budget.spec.ts`, `tokens.test.ts`, `tests/support/*`, both private-repo tests, `smoke`, `chat`, `chat-route`) have 0 changed lines; `english.spec.ts` has 2 (R12, `3784a48`).
- **Leftovers:** none of `TODO`, `FIXME`, `@ts-nocheck`, `@ts-ignore`, `eslint-disable`, `.only(`, `.skip(`, `.fixme(` or `test.fail(` on an added line, or anywhere in the code and test tree.
- **The résumé:** the same blob on both sides (`70e4b7e`, 80,593 B), with 0 diff lines.
- **Copy:** project statuses and limitations are unchanged; `data/projects.ts` changes only media fields (`direct`, `encoded`, `PROJECT_GALLERIES`). The headline has one source (`siteMeta`), read by the hero and the card.
- **Dependencies:**
  - `package.json` and the lockfile have 0 diff lines.
  - `npm audit --omit=dev`: advisories against `next` 16.0.0–16.4.4 (two critical, one high, seven moderate), fixed in 16.4.6, already in production. Tay: backlog #19 (`505d1e1`).
  - The two facts Tay asked for:
    - `npm ls sharp`: `sharp@0.34.5` (the project's own, dev) and `next@16.3.8 └── sharp@0.35.5`.
    - `app/opengraph-image.tsx` is `next/og`'s `ImageResponse`, prerendered static. It draws inline JSX and SVG elements from `siteMeta`, `heroIndex` and `cine`: no fetch, params, `<img>`, or remote or user-supplied SVG.
- **Nits, dev-only, left as they are:**
  - `scripts/lab-hero-a.mjs` defaults to `/lab/hero-a` (now 404).
  - `scripts/m10-images.mjs:71`'s comment mentions the deleted About visual.

### 7. Lighthouse, bytes, screenshots (VL)
**Bytes** (`budget.spec.ts`'s algorithm, the build on `:3401`): first-load JS **185.10 KiB** gzip over 9 scripts (606,933 B raw; budget 205.7), HTML **127,732 B** (budget 568 KB). Both are the same as the S21+S22 close. The stylesheets are the same two files (44,069 B and 28,727 B).

**Lighthouse 13.6.0** (`npx --yes`, as since S17; mobile defaults, simulated throttling, 412×823; HeadlessChrome 158; 5 runs in a row on an idle machine, benchmark index 4,054–4,115, no run warnings):

| Run | Perf | A11y | BP | SEO | FCP | LCP | TBT | CLS | SI | Bytes |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 100 | 100 | 100 | 100 | 1,059 ms | 1,059 ms | 65 ms | 0 | 1,378 ms | 389,820 |
| 2 | 100 | 100 | 100 | 100 | 1,059 ms | 1,059 ms | 20 ms | 0 | 1,059 ms | 389,820 |
| 3 | 100 | 100 | 100 | 100 | 1,058 ms | 1,058 ms | 35 ms | 0 | 1,353 ms | 389,820 |
| 4 | 100 | 100 | 100 | 100 | 1,058 ms | 1,058 ms | 19 ms | 0 | 1,362 ms | 389,820 |
| 5 | 100 | 100 | 100 | 100 | 1,058 ms | 1,058 ms | 16 ms | 0 | 1,341 ms | 389,820 |
| **Median** | **100** | **100** | **100** | **100** | **1,058 ms** | **1,058 ms** | **20 ms** | **0** | **1,353 ms** | **389,820** |

- The LCP element is the h1 (`section#hero > div.hxa__main > div.hxa__hero > h1#hxa-title`).
- Against the S21+S22 close (100, 1,063 ms) and a local `main` (S18+S19: 93, 3,191 ms). Production's S17 baseline (98, 2,288 ms) is S24's yardstick, production against production.

**Screenshots** (scratch, not committed; the first screen and the full page at 390×844 DPR 3 and 1440×900): no horizontal overflow, 0 console errors, one canvas, inside `#hero` and `aria-hidden`, at both sizes. At 390 the launcher sits over the GRAVITY FLOW tile's last line on load: S17's at-rest overlap, pre-existing.

### 8. Pushed, and the draft PR
- `505d1e1`: ROADMAP backlog #19 (Next 16.4.6 after S24) and the "After the release" line.
- `release/concept-a` pushed: `94d8330..505d1e1`, then this docs commit.
- **Draft PR #21**, "Release: Concept A", `release/concept-a` → `main`: https://github.com/taysh123/Portfolio/pull/21. Not merged and not marked ready.
  - Its body: what changes for visitors, R1–R15, every test and guard change with its commit and approval, the S23 results above, F1 and F2, the rollback plan, and the S24 checklist.
- Production is still `443a1f9`.

### State (VL)
- `origin/main` = **`443a1f9`** = Production, tagged `product-plates-final`. Untouched.
- `release/concept-a`: S23's two docs commits, pushed. **Draft PR #21** open.
- `proto/hero-a-cinematic`: frozen; PR #18 a draft.

### Waiting on Tay
- **The review on his phone**, through the Preview (behind Vercel's login). Then the session closes.
- **F1 and F2** (§5): fix now in the PR, log for after the release, or leave.
- **S24:** his merge of PR #21 (mark it ready first), then the production checks in the PR body.

---

## 2026-11-20 — Sessions 21+22 close-out: approved by Tay; the GRAVITY FLOW swap moves after the release (Claude Code)

**Scope (Tay's brief):** S21+S22 reviewed and approved; keep the footer rings' fix (`fa5c23d`). Close out: CLAUDE.md
(drop the two stale notes), the ROADMAP rows, N7 in RESEARCH_AND_DECISIONS (the shipped wording), START-HERE, this log
and the memory; remove the scratch worktree and clean scratch; `npm test`; push `release/concept-a` (no PR, no merge);
confirm `main` is clean and level with `origin/main`. **New:** the GRAVITY FLOW capture swap is no longer part of S23;
it becomes a post-release item (a small PR whenever Tay provides the image).

### Decisions (Tay)
- **S21+S22 approved** as built and pushed (`b97f92e`…`e58508b`, docs `00ea86d`).
- **The footer rings' fix (`fa5c23d`) is kept.**
- **The GRAVITY FLOW capture swap moves out of S23**, to after the release: `docs/ROADMAP.md` #18.

### Docs
- **`CLAUDE.md`:** the S21+S22 summary under the release branch; the suite counts (unit 225/225 in 18 files,
  Playwright 187/187 in 15, cold and warm). **Dropped:** the gotcha about the first full run after deleting `.next`
  failing two tests (fixed by the pre-encoded case-study captures), and the one about the header links' ring easing in
  (fixed in `5d937ca`, `fa5c23d`). **Added:** no case-study image goes through the optimiser (`direct` or
  `media.encoded`; a new capture needs a script job); the page's bottom scroll padding (#16) makes Playwright's
  `click()` scroll a target out of the launcher's strip first.
- **`docs/ROADMAP.md`:** last updated; P5/P6 status (S21+S22 done and approved, S23 next); the S21+S22 row's commits
  and results; the S23 row without the capture swap; "After the release" under the production checks; backlog #11
  (N7) done, #13 measured and not kept, #14 re-checked, #16 and #17 done; **new #18**, the swap after the release.
- **`docs/RESEARCH_AND_DECISIONS.md`:** N7 resolved, with the shipped wording and why it drops the draft's "on the
  site's behalf"; R13 done; the session note on S23 records the swap's move; two decision-history rows.
- **`claude/START-HERE.md`:** S21+S22 approved and closed out; what's next (S23, then S24; the swap after the
  release); what waits on Tay.
- **The memory:** the state note, and the measurement lessons (content-visibility on the composed page; Satori's
  radial gradients; the scroll padding and Playwright's clicks).

### Clean-up (VL)
- **The scratch worktree of `4b6a8e2`:** `git worktree remove --force` deleted it, `node_modules` included, and
  `git worktree prune` ran; `git worktree list` shows only the repo.
- **Scratch:** every file deleted (the probes, the Lighthouse reports, the renders and screenshots, the diffs).
- Ports 3400–3402 are free.

### Validation (Git Bash)
| Command | Result |
|---|---|
| `npm test` after the docs edits | **225/225 tests, 18/18 files**; the private-repo and institution guards pass over the new docs |
| `npm run build` (Turbopack cache cleared), with the close-out docs and without them (`git stash`) | `/`'s two stylesheets identical in name, size and SHA-256 (`1v6nld9ia-p76.css` 44,069 B, `3_ro9fti2b1c6.css` 28,727 B): CLAUDE.md and START-HERE add or remove no utility |

### State (VL)
- `origin/main` = **`443a1f9`** = Production, tagged `product-plates-final`. Untouched.
- `release/concept-a`: S21+S22 and this close-out, pushed. No PR.
- `proto/hero-a-cinematic`: frozen; PR #18 a draft.

### Waiting on Tay
- **S23** in a new session, on `release/concept-a`: the release candidate (WebKit and Firefox runs, axe, Lighthouse,
  headers, privacy and secret scans, screenshots; Tay's review on his own phone; on his go, the PR).
- **After the release:** the GRAVITY FLOW image for the capture swap (#18).

---

## 2026-11-20 — Sessions 21+22: privacy and SEO surfaces, then the backlog (#13, #14, #16, #17, the cold cache, the rings) (Claude Code)

**Scope (Tay's brief, S21+S22):**
- **A. Surfaces:** `/privacy` (the `theme` cookie out, N7's Cloudflare sentence); R8 (the hero's h1 and lede into
  `siteMeta`, a dark OG/Twitter card); the manifest and `themeColor` in the field's colour; the sitemap's date; the
  dark 404 and error pages. The approved test edits, each in its own commit.
- **B. Backlog:** #16 (`scroll-padding-bottom`, and the Tab test's unobscured check extended to the launcher; the
  launcher not moved or hidden); #17 (the case-study dialog's two axe findings); the case studies' captures
  pre-encoded with the image script's settings, so the cold-cache failures go without touching the tests; the header
  links' ring at once; #13 measured (kept only if phone LCP improves, scroll CLS stays 0 and jumps land exactly); #14
  re-checked.
- Step 1 shown first (the `/privacy` diff, the card's text and render, any 404/error wording change); Step 2 after
  Tay's OK. The full suite cold and warm; Lighthouse mobile (median of 5); first-load JS and HTML. Push the branch (no
  PR, no merge), the Preview URL, START-HERE and this log. The session stays open until Tay reviews.

### 1. Preconditions (VL)
- `git fetch`, `release/concept-a` checked out and pulled: HEAD **`4b6a8e2`**. `main` = `origin/main` = **`443a1f9`**
  = Production (`gh api …/deployments`, created 2026-11-19 03:20Z). `npm ci` exit 0; `.next` deleted; `npm run build`
  exit 0 (8 routes).
- **N7 re-checked live** (read-only `curl` with a browser `Accept` header, 2026-11-20): `/` and `/privacy` answer
  `Server: cloudflare` with a `CF-RAY` and an `x-vercel-id`; no beacon, no `email-protection` link, no decode script,
  no external `<script src>`, no `Set-Cookie`. Cloudflare still proxies; "loads no third-party scripts" holds.
- **Cloudflare's privacy policy** (`https://www.cloudflare.com/privacypolicy/`, 200, "effective as of November 4th,
  2025") was read for the sentence. It lists End Users' "IP addresses, traffic routing data, system configuration
  information, and other information about traffic", and says "Cloudflare is a data controller for the personal
  information collected from all categories of data subjects listed above", a processor only of Customer Logs, some
  settings, and content that transits its network. **So N7's draft phrase "on the site's behalf" went beyond the
  policy and was dropped.**

### 2. Step 1, and Tay's answers
- Shown: the exact `/privacy` diff, the card's text with a render in scratch, and the 404/error pages (no wording
  change: both are already dark through the root layout's `data-theme="dark"`, on the site's dark `#0b0c0f`, as R3
  says; every word still true for the one page).
- **Approved by Tay**, with one change: the card shows the four names only, no states ("cached cards outlive
  statuses": GRAVITY FLOW's "Release candidate" will change). Also approved: the `/privacy` wording with the corrected
  N7 sentence; `colorScheme` "dark"; the manifest and `themeColor` `#04060d`; the sitemap date 2026-11-20 (S24 moves it
  to the merge date).
- **Test edits approved by Tay**, each in its own commit: `hero.test.ts:43` (the regex as proposed) and
  `privacy.spec.ts:49` (count 3, plus "through Cloudflare"), both new in this session; and R12's `privacy.spec.ts:43`,
  `site.test.ts:161` (R12 said `:160`; an S18+S19 comment moved it) and `content.test.ts:20,22`.

### 3. What changed (VL; 21 commits, `b97f92e`…`e58508b`)
**A. Surfaces**
- `b97f92e` **R8:** `siteMeta.headlineLines` (the h1's two lines), `siteMeta.headline` (joined) and `siteMeta.heroLead`
  (the hero's lede, word for word); `Hero.tsx` reads them. `/`'s h1 and lede markup is byte-identical (§6).
- `11a2ef5` test: `content.test.ts:20,22` take the new strings. `143733f` test: `hero.test.ts:43` ends
  `/, from the interface down to the infrastructure\.$/`.
- `1bfebb5` **The dark card** (`app/opengraph-image.tsx`): the hero's sky, its two glows placed and sized as
  `.hxa__glow`, a seeded still of the constellation (no node or link midpoint on the copy), the wordmark with its
  glyph, `tayshofer.dev`, "Software Engineer" as the eyebrow, the h1 with its second line in the duotone, and under a
  hairline the four names only. `og:image:alt` is "Tay Shofer — Building software. Turning ideas into products."
  `lib/tokens.ts` gains `cine`, the TypeScript mirror of the layer's field and inks.
- `e6733c4` **R3:** `themeColor` `#04060d` (one colour), `colorScheme` "dark"; the manifest's `background_color` and
  `theme_color` `#04060d`. The Product Plates `brand` mirror had no user left and is removed.
- `d16c814` test (new file): `surfaces.test.ts` holds `cine` to the layer's base values, the manifest and viewport to
  `cine.abyss`, and the card to the h1 and names with no state, figure or availability.
- `2424e23` **`/privacy` (R3, R13):** N7's sentence after Vercel's: "Requests reach Vercel through Cloudflare, which
  sits in front of the site as its network proxy and processes information about that traffic, such as your IP
  address: Cloudflare's privacy policy." (a third new-tab link). The cookie paragraph names one cookie, `a11y` ("It
  holds nothing else, can last up to a year …": "can last" keeps `site.test.ts`'s "last up to a year" pin). The meta
  and OG descriptions say "one optional preference cookie". Last updated 20 November 2026. `lib/theme.ts` drops
  `THEME_COOKIE`.
- `5753bdc` test: `privacy.spec.ts:43` `["a11y"]`. `0b543a4` test: `site.test.ts:161` drops the `THEME_COOKIE` match.
  `a632a66` test: `privacy.spec.ts:49` counts 3 and checks "through Cloudflare".
- `6fa14a8` the sitemap's `CONTENT_LAST_MODIFIED` is `2026-11-20`.
- The 404 and error pages: unchanged (§2).

**B. Backlog**
- `f3bd556` **#16:** `html { scroll-padding-bottom }` of the launcher's edge, height and a 12px gap (5rem; 4.5rem on
  phones and short screens) plus the bottom safe area, in `components/chat/chat.css`. The launcher is unchanged.
  `50d3bec` test: `chrome.spec.ts`'s Tab walk also fails a stop that overlaps the launcher's box at all (red before
  the fix: the hero's GRAVITY FLOW link at 390×844).
  - A scratch Tab walk of `/` at 320×568, 360×780, 375×667, 390×844, 414×896, 430×932, 768×1024, 1024×768 and
    1440×900, motion reduced and on: **no stop overlaps the launcher** (47–52 stops each). Anchor jumps still land:
    `chapters.spec.ts` Navigation ×3 and `lab-hero-a.spec.ts`'s Featured work jump, 4/4.
- `addbd2f` **#17:** the dialog is a `div` (an `aside` may not take `role="dialog"`), and each gallery image is
  silent (`alt=""`): its unchanged figcaption, which repeated the alt word for word, names the figure. No description
  invented; `data/projects.ts`' alt text unchanged. axe (WCAG 2.2 A/AA + best-practice), each case study open, 1440
  and 390: **18 findings before, 0 after.** `e46b693` test (new file): `case-study-axe.spec.ts` (it waits for the
  dialog's fade: mid-fade, axe flags half-drawn text's contrast).
- **The cold cache (S20 §4), fixed without touching a test:**
  - `ada732d` the image script gains `dos-ai-features` and `dos-desktop` (the case study's two DeveloperOS captures
    the carousel does not show; AVIF q60 / WebP q80, effort 6, at 800/1200/1600), run for those two jobs only; listed
    in `data/lab-images.ts`. 314 KiB.
  - `cfb5b5f` Aegis's case study serves its one capture as it is (`direct: true`): it is the script's own output at the
    crop's size (1108×623, 29 KiB), so `aegis.spec.ts:29`'s `incident-board-open.webp` pin holds. DeveloperOS and
    GRAVITY FLOW list each capture's pre-encoded files (`media.encoded`, the tables' names and widths, repeated because
    client code never imports the tables: `lab-work.test.ts:157–176`), and the panel's new `Capture` serves them in a
    `<picture>`, AVIF then WebP. T Poker unchanged (`direct`).
  - Checked: all 16 case-study images load at 1440 and 390 (DPR 3) with **0 requests to `/_next/image`**; the dialogs
    look as before (screenshots in scratch). `e1e1654` test (new file): `case-study-images.test.ts`.
- **The focus rings:**
  - `5d937ca` the header's four links ease only their text colour (their colour utility also eased `outline-color`),
    so the ring is cyan on its first frame. **Found while probing:** the footer's six links (Email, GitHub, LinkedIn,
    Résumé, Privacy, Back to top) did the same, at both widths; S20's note named only the header.
  - `fa5c23d` the same one-word fix in the footer, **in its own commit so Tay can drop it**. A Tab walk with motion on:
    rings that ease in, 10 → 0 at 1440 and 6 → 0 at 390.
  - `e58508b` test (new file): `focus-ring.spec.ts`.

### 4. ROADMAP #13: `content-visibility` on the composed page: measured, **not kept** (VL)
- **Variant B** (a scratch worktree of the final tree, never committed): `content-visibility: auto` on Stack, Think ·
  Build · Ship and Contact, `contain-intrinsic-block-size: auto` at their measured heights (412 wide: 1,883 / 761 /
  462 px; 1440 wide, from 1024: 1,342 / 576 / 263 px). The violet glow still sits at `top: 38%` of the whole `.wk`
  region (composing did not anchor it to a section, as R11 had expected).
- **Phone LCP:** Lighthouse 13.6.0 mobile, interleaved, 5 each: A 1,063 ms, B 1,063 ms (Performance 100 both).
  Directly at 4× CPU (CDP throttling, 412×823, a fresh context per load, two rounds of 15 interleaved): medians A 424 /
  B 416 ms, then A 372 / B 352 ms, ranges overlapping (280–660 ms). The h1 is the LCP element in every run. At most a
  20 ms gain, inside the noise.
- **Scroll CLS** (the whole page in 120px steps, no input; 7 sizes from 320×568 to 1440×1800, motion reduced and on):
  A's only shifts are the chat launcher folding its label (0.0032–0.0244, the known pre-existing source). B adds the
  violet glow moving as the sections render: 0.0105–0.1021 (0.0777 of it the glow at 320×568).
- **Jumps** (`#about`, `#skills`, `#approach`, `#contact` from a fresh load, 1.6 s and 3.1 s after): A lands every
  target within ±0.5px, except where the page's end clamps the scroll (`#contact` at 768 and wider, `#approach` at
  1440×1800; the same in both). B misses `#approach` by −17 to −311px and `#contact` by −11 to −71px at several sizes.
- **R11: the release ships without it.** Two of the three conditions fail, and the LCP gain is within noise. Nothing
  changed on the branch.

### 5. ROADMAP #14: Stack's filter hold, re-checked on the composed page (VL; report only)
- A press from All on each project, with the buttons at the top, middle and bottom of the view (clicks dispatched in
  the page: Playwright's `click()` first scrolls a target out of #16's bottom strip, which a mouse never does), at
  1440×900, 390×844, 1920×1200, 2560×1440 and 1440×1800:
  - **The view never moves** (0px in every case).
  - The hold is 0 everywhere except with the buttons near the top at 1440×1800: **239px** (session 15: 346px), with
    **no visible gap** (the filtered list still fills it).
  - **The keyboard-only end case** (a button focused, the page scrolled to its end, Enter): the hold is the full list's
    height, **1,096px** at 1440 and wider and **1,619px** at 390, as in session 15; the space shows under the filtered
    list (815px and 1,215px) until All is pressed; the scroll does not move.
- Tay kept the hold in sessions 14–16; nothing changed.

### 6. Validation (VL, Git Bash, the final tree `e58508b`)
| Command | Result |
|---|---|
| `npm run typecheck` (after `npx next typegen`) | exit 0 |
| `npm run lint` | exit 0 |
| `npm test` | **225/225 tests, 18/18 files** (was 218/16: +3 `surfaces`, +4 `case-study-images`) |
| **Cold:** `.next` deleted, `npm run build`, `GROQ_API_KEY= npx playwright test` | **187/187**, 2.0 min (was 183: +2 `case-study-axe`, +2 `focus-ring`). The two S20 cold-cache failures pass with no test changed |
| **Warm:** the same run again | **187/187**, 2.0 min |
| `.next/cache/images` after both runs | does not exist: nothing in the suite went through the on-demand optimiser |

**Against the session's start** (`4b6a8e2`, built in a scratch worktree, both served by `next start`):

| | Start `4b6a8e2` | Final `e58508b` |
|---|---|---|
| First-load JS gzip (budget 205.7 KiB) | 185.00 KiB, 9 scripts | **185.10 KiB**, 9 scripts (+0.10: `siteMeta`'s new strings in the client chunks that already carried it) |
| HTML (budget 568 KB) | 127,970 B | **127,732 B** |
| Stylesheets | 43,672 + 28,727 B | 44,069 + 28,727 B: exactly three new rules (the links' colour-only transition, the two `scroll-padding-bottom` rules), no stray utility |
| Markup | | Differs only in the theme-color and color-scheme metas, the card's URL hash and alt, the ten links' class, and the same in the RSC payload |

**Lighthouse 13.6.0 mobile** (defaults: simulated throttling, 412×823; HeadlessChrome 158; interleaved, 5 each; this
machine's benchmark index 2,067–3,280 today, against 3,912–4,086 in S18+S19):

| Median of 5 | S18+S19 (`270ab27`) | Start `4b6a8e2` | **Final `e58508b`** |
|---|---|---|---|
| Performance | 100 | 100 | **100** |
| LCP (the h1) | 1,061 ms | 1,065 ms | **1,063 ms** |
| FCP | 1,061 ms | 1,065 ms | **1,063 ms** |
| TBT | 23 ms | 22 ms | **20 ms** |
| CLS | 0 | 0 | **0** |
| Speed Index | 1,063 ms | 1,329 ms | **1,362 ms** |
| A11y / BP / SEO | 100 / 100 / 100 | 100 / 100 / 100 | **100 / 100 / 100** |
| Bytes loaded | 389,747 | 389,749 | **389,818** |

No run warnings. Start and final match within noise; Speed Index is higher for both today with the slower benchmark.
Production's baseline (S17) stays the yardstick for S24.

### 7. Pushed, and the Preview
- `release/concept-a` pushed: `4b6a8e2..e58508b` (21 commits), then this docs commit. No PR, no merge; Production is
  still `443a1f9`.
- The branch's Preview link (behind Vercel's login):
  `https://tay-shofer-portfolio-git-release-840354-tays-projects-d5aefd6e.vercel.app/`.
- Scratch, for Tay: the card, `step1/card-names-only.png`; today's card and 404, `step1/today-*.png`; the case
  studies, `step1/cs-*.png`.

### State (VL)
- `origin/main` = **`443a1f9`** = Production, tagged `product-plates-final`. Untouched.
- `release/concept-a`: S21+S22's 21 commits and this docs commit, pushed. No PR.
- `proto/hero-a-cinematic`: frozen; PR #18 a draft.
- A scratch worktree of `4b6a8e2` (for the comparison builds) is still registered; the close-out removes it.

### Waiting on Tay
- **Review** on the Preview: the share card (shown by a share preview, or at `/opengraph-image`), `/privacy`, the
  case studies' images and axe fixes, the rings, the launcher's clearance on a phone.
- **The footer rings (`fa5c23d`)**: outside the brief's "header links", in its own commit; keep or drop.
- **Then the close-out** (on Tay's word): CLAUDE.md's two gotchas that this session made stale (the cold-cache failure
  and the ring that eased in), ROADMAP (the S21+S22 row; #13, #14, #16, #17), RESEARCH_AND_DECISIONS (N7 resolved),
  the memory, the scratch worktree.
- **S23** next: the release candidate (WebKit and Firefox, Tay's phone, the GRAVITY FLOW capture swap).

---

## 2026-11-20 — Session 20: the tests (the lab tests ported to `/`, the old page's retired, R12's new guards) (Claude Code)

**Scope (Tay's brief, S20, tests only; no page or copy change):**
- Port the lab specs and unit tests to `/` (`lab-hero-a.*`, `lab-work.*`) and remove both temporary `@ts-nocheck`
  lines. Delete the two lab-only tests as planned: the CSS pin against `origin/main`'s digests, and "Contact matches
  the live Contact on /", which becomes fixed values.
- Retire the old page's tests (`hero.spec.ts`, `chapters.spec.ts` and `lower.spec.ts` outside their kept tests). Before
  deleting any test, port each assertion that still covers something on the new `/`. List every retired test with
  its reason.
- Add R12's new guards: `/` index, follow with the canonical; `/lab`, `/lab/hero-a`, `/lab/work` answer 404; exactly
  one canvas, 2D and `aria-hidden`. The WebGL guards unchanged; no guard weakened.
- The full suite green, small commits, push the branch (no PR, no merge), close out.

### 1. Preconditions (VL)
- `git fetch`, `release/concept-a` checked out and pulled: HEAD **`24240ad`**. `main` = `origin/main` = **`443a1f9`**
  = Production (`gh api …/deployments`, created 2026-11-19 03:20Z). `npm ci`, `.next` deleted, `npm run build` exit 0.

### 2. Before (VL, on `24240ad`, Git Bash)
| Suite | Result |
|---|---|
| `npm test` | **121/121 tests**; 14 of 16 files. The two lab unit files fail at load (their 26 + 68 tests never ran) |
| `npx playwright test --list` | **212 tests in 14 files** |
| `GROQ_API_KEY= npx playwright test --fully-parallel --timeout=15000` (the fast listing run; the standard config waits 60 s per dead route) | **88 passed, 124 failed**: `hero` 0/12, `chapters` 8/32, `lower` 7/17, `lab-hero-a` 3/18 (the 3 are axe on the 404 page), `lab-work` 1/63, and `chat.spec.ts:174` 10/11 under the parallel load (it passes on the standard config, §5) |

### 3. What changed (each its own commit)
**The unit tests, ported in place** (the files keep their names: a dozen code comments and
`docs/CINEMATIC_SYSTEM.md` point at them):
- `8b495f0` `tests/unit/lab-hero-a.test.ts` (26, as before): reads `components/sections/` (Hero, Constellation,
  `hero.css`, `featured.ts`), `app/cinematic.css`, the header's `AvailabilityPill`, `Navbar` and `Logo`. R9's SVG
  arrows; R2's header row as the reveal's first step (indices 0, 0, 1–5), the one rule in `hero.css` that is not the
  hero's. "Never indexed" turns round: the root layout's `index, follow` and canonical, no `app/lab`, nothing links
  `/lab`. The layer is imported by `app/page.tsx` alone.
- `c290ee7` `tests/unit/lab-work.test.ts` (71: 68 ported, 3 new for Two more): R4's "Case study" buttons, R5's Two
  more, R10 (no lede or reveal in Work; About ends on the facts, its dropped links checked where they live now),
  every capture lazy, the page order from `app/page.tsx`. **Fixed values from `product-plates-final`** where the
  prototype read files the release deleted: the chapters' phone crops and DeveloperOS chips, the Product Plates
  Stack's FILTER rules, the Product Plates Contact. The image-table check now covers every client component.

**The two prototype-only e2e tests, deleted as planned:**
- `eb765e7` `/`'s stylesheets pinned to `origin/main`'s digests (`/` differs from `main` by design now).
- `b8451cc` "Contact's links are the live Contact's": checked by hand against
  `product-plates-final:components/sections/Contact.tsx`, `CONTACT_LINKS` and the attribute table in "Contact without
  JavaScript" are exactly its targets, order, attributes and names, as fixed values.

**The e2e specs, ported to `/`:**
- `6f09caf` `lab-hero-a.spec.ts` (18): the field's code ships with `/` and not `/privacy`; "never linked" (the sitemap
  lists only `/`); no-JS (the header's row in the reveal, one pill shown, in-page links); LCP is the h1; both
  reduced-motion paths; the loop's pauses; the signals; four viewports; keyboard from the skip link through the
  header (R2) and the hero into Work, every ring the layer's cyan; structure; axe ×3.
- `67de511` `lab-work.spec.ts` (61): every carousel, CLS, lift, viewport, axe, Stack, Think · Build · Ship and
  Contact test, on `/`. R4: the six "Case study" buttons hidden without JS; R10: no lede, About with no link; R12:
  one canvas, none under the hero; every capture lazy; the hero's h1 over six h2s; the keyboard walk from the hero's
  last control through Work, Two more, the filter and Contact, then out to the footer.

**The old page's tests, retired (R12), with what still applies ported first:**
- `848d55c` **`hero.spec.ts` deleted (12).** Ported to `lab-hero-a.spec.ts` (6 tests): Featured work links the four
  panels with their verified states, never "open source" (`:5`); following a link lands its panel under the header,
  1440 and 390 (`:112`); on the four phones the actions come before Featured work, in the first screen, 16px or more
  apart (`:97`). Retired: `:22`, `:37`, `:51` the plates' layouts; `:64` their windows; `:83` their end line (the plates
  are gone); `:97`'s two-line Product Plates headline; `:125` the hero's eager images (no image in the hero now).
- `9ceb6d6` **`chapters.spec.ts`, 32 → 11.** The Case study block is byte for byte (4). Navigation (`:284`, 1440,
  1280×720, 390) stays: its selectors fit `/`, and it adds the 390 jump and the "under its own centre" check. Ported
  (4): T Poker's web app and private label on the panel, both store listings and no retired figures in its case study
  (`:49`); Aegis's renamed score decision and schema note, and no "open source" (`:170`, `:96`); DeveloperOS's Source
  link (`:237`); GRAVITY FLOW a release candidate with no test count, physics claim or store link (`:245`). `:40`'s
  hidden trigger without JS is in `lab-work.spec.ts`. Retired (R6, the explainers are gone): the T Poker stepper and
  its no-JS path (`:7` ×4, `:20`, `:40`) and its two-column Tab order (`:70` ×2); the Aegis trace, fork, port-scan
  highlight, order and phone trace (`:96`, `:107`, `:118` ×2, `:145`, `:155`); the DeveloperOS flow, refusal, citation
  boxes and reading order (`:181`, `:187`, `:200` ×2, `:213`) and its release-page link (only the chapter had one);
  GRAVITY FLOW's marked frame, lede and "not yet published" line (`:245`), its layout (`:257`), the teal plate in two
  themes (`:273`).
- `ab2e8a5` **`lower.spec.ts`, 17 → 6.** `:142` (the résumé's bytes) and `:164` (the footer) verbatim; `:153` (the
  four phones' overflow, by the live ids) stays, since it passes on `/`. Ported to `lab-work.spec.ts` (8): the four
  facts, **no institution anywhere in the served page**, the rejected render gone (`:8`); each tool's accessible text
  and title, Everyday tools naming none, never monospace (`:78`); Think · Build · Ship unpinned (`:106`); on the four
  phones LinkedIn and GitHub on one line and "79 KB" unbroken (`:118` ×4); the résumé in Contact and the footer, never
  the header (`:128`). Retired: `:8`'s measure and the About visual (deleted); `:50` the radio lens and `:69` its no-JS
  path (toggle buttons now, Tay, session 13; without JS the full list shows); `:78`'s 16px tools and "Related projects"
  and `:95`'s rows (Tay chose 14px pills, each tool naming its projects; page.spec keeps the 12px floor).
  - That commit's message first said 9 ports. It is 8: the ninth in its check run was the résumé test ported earlier.
    Corrected before the push (the four commits rebuilt with `git commit-tree`, same trees, authors and dates).

**R12's new guards, in `page.spec.ts`** (each its own commit naming the approval; no other guard changed):
- `113c6e5` `/` is indexable: `index, follow` (robots and googlebot metas), exactly one canonical
  `https://tayshofer.dev`, no noindex or nofollow in the HTML or `X-Robots-Tag`.
- `b886176` `/lab`, `/lab/hero-a`, `/lab/work` answer 404, with no redirect.
- `4aff12c` exactly one canvas, inside `#hero`, `aria-hidden`; every context any canvas requests is recorded, and only
  `"2d"` appears (1440 and 390, motion on and reduced, after scrolling the page). Red-checked: a WebGL request on a
  detached canvas is recorded. The WebGL count, `budget.spec.ts` and `dead-code.test.ts` are unchanged.

### 4. Found while porting (nothing on the page changed)
- **The header's four links ease their focus ring in.** Their colour transition also eases `outline-color`, so the
  ring's first frame is the link's own mist and it reaches the layer's cyan 150 ms later (measured: `getAnimations()`
  shows one `outline-color` transition). Every other control rings cyan at once. The ported keyboard tests read each
  ring once its transitions finish. Not a defect; for Tay to judge.
- **Contact's "79 KB" keeps its no-break space** (`contactBlock.ts`) inside a no-wrap note, as the Product Plates
  Contact did. A first draft of the unit test had lost the character; corrected before the commit.
- **A cold image cache times out two existing tests on the first full run** (§5). Nothing here changed them, and
  nothing was changed to make them pass.
  - The case studies' captures go through Next's on-demand optimiser, AVIF first, except T Poker's (`direct: true` in
    `data/projects.ts`). The Aegis capture (`/projects/aegis/incident-board-open.webp`) is the first the suite asks
    for: `aegis.spec.ts` is the first file, and `chapters.spec.ts`'s Case study block opens Aegis second.
  - With `.next/cache/images` empty and 8 workers starting at once, its first encodes outlast `aegis.spec.ts:28`'s
    5 s poll and the Case study block's 15 s one. The cache files written in run 1 carry that image's ETag
    (0x7592 = its 30,098 bytes) at three widths, the first two written 8.7 s apart.
  - Alone, from a cold cache, both pass; with the cache warm, the full run passes.
  - Before S20 the same cold run passed both (§2). Likely why (NC): the ported specs now draw the canvas and the
    carousels at the suite's start, where the lab specs used to fail on a 404 at once.
  - For Tay: either serve the case studies' captures pre-encoded (`direct: true`, a page change: S21+S22), or give the
    two polls a longer wait (a test change; the Case study block is one R12 kept). Until then, run the suite twice
    after deleting `.next` (CLAUDE.md gotcha).
- `docs/CINEMATIC_SYSTEM.md` still describes the CSS pin and the lab routes (lines 21–22, 64). Its close-out is S24's
  (ROADMAP), so it is left as it is.

### 5. Validation (VL, Git Bash, the final tree)
| Command | Result |
|---|---|
| `grep` for `.only`, `.skip`, `.fixme`, `test.fail` under `tests/` | none |
| `npm test` | **218/218 tests, 16/16 files** (was 121, 14/16) |
| `npm run typecheck` | exit 0 |
| `npm run lint` | exit 0 |
| `npm run build` (`.next` deleted first) | exit 0; the same 8 routes |
| `/`'s stylesheets and `.next/static/chunks` against the session's first build | **byte-identical** (43,672 B and 28,727 B; every JS chunk's SHA-256): the new tests add no Tailwind rule |
| `npx playwright test --list` | **183 tests in 13 files** (was 212 in 14) |
| `GROQ_API_KEY= npx playwright test` (the standard config), run 1, right after the clean build (the image optimiser's cache empty) | 181/183: `aegis.spec.ts:15` and `chapters.spec.ts:68` (the kept "every case study's images finish loading") time out on the Aegis case study's capture (§4) |
| The same two alone, cache emptied again | 2/2 |
| The full run again, cache emptied again | 181/183, the same two: reproduced |
| **The full run with the cache warm** | **183/183**, 2.1 min |

Per file, before → after: `lab-hero-a` 18 → 24, `lab-work` 63 → 69, `hero` 12 → 0, `chapters` 32 → 11, `lower` 17 → 6,
`page` 18 → 21; `aegis` 3, `budget` 5, `chat` 11, `chrome` 19, `english` 5, `privacy` 4, `private-repo` 4, `smoke` 1,
unchanged.

### State (VL)
- `origin/main` = **`443a1f9`** = Production, tagged `product-plates-final`. Untouched.
- `release/concept-a`: S20's 12 test commits and this close-out, pushed. No PR.
- `proto/hero-a-cinematic`: frozen; PR #18 a draft.

### Waiting on Tay
- **S21+S22** in a new session: `/privacy` with N7's sentence (its exact wording to Tay before the commit, R13), the
  `theme` cookie out, R8's headline and dark card, the manifest and `themeColor`, the sitemap's date, the 404; then
  #13, #14, #16 and #17.
- **The cold-cache timeouts (§4):** pick a fix (pre-encoded case-study captures, or longer polls), or leave it.
- Optional: the header links' ring easing in (§4).

---

## 2026-11-20 — Sessions 18+19 close-out: approved by Tay; #17 logged for S21+S22 (Claude Code)

**Scope (Tay's brief):** S18+S19 reviewed and approved. Log one item for S21+S22. Close out: CLAUDE.md, START-HERE
and this log on `release/concept-a`; remove the scratch build of `main` and clean up scratch; push (no PR, no merge);
confirm `main` is clean and level with `origin/main`.

### Decisions (Tay)
- **S18+S19 approved** as built and pushed (`482d29e`…`7a85e92`; the Preview at `7a85e92`).
- **New: ROADMAP #17, for S21+S22.** Fix the case-study dialog's two axe best-practice findings, even though production
  has them too:
  - `aria-allowed-role`: the panel is an `<aside role="dialog">` (`components/ui/CaseStudyPanel.tsx`). All six case
    studies.
  - `image-redundant-alt`: a gallery image whose alt repeats its caption. Three: T Poker, DeveloperOS, GRAVITY FLOW.
- Added to the S21+S22 row in `docs/ROADMAP.md`. #15 and the Work lede are marked done there (S18+S19).

### Docs
- **A correction:** the S18+S19 entry below said `image-redundant-alt` was on four case studies. The results show
  three. Fixed there and in #17.
- **`docs/ROADMAP.md`:** P5/P6 status (S18+S19 done and approved, S20 next); the S18+S19 row's commits; the S21+S22 row
  (#17 added, #15 and the Work lede moved out); #15 done; #17 new.
- **`CLAUDE.md`:**
  - The release branch after the swap, and its Preview link.
  - The prototype record's layer, now at `app/cinematic.css` on this branch.
  - The approved test changes: R12, plus the six from this session and Tay's phone condition.
  - The unit count, and new gotchas: the build type-checks tests; a removed route's e2e tests each wait out the timeout;
    the Vercel connector's authenticated fetch creates a share link; `git rm` of a folder's last files removes the
    folder.
- **`claude/START-HERE.md`:** S18+S19 approved; what's next (S20); what waits on Tay; #17.
- **The memory's state note.**

### Clean-up (VL)
- **The scratch worktree of `443a1f9`** (`main`'s comparison build):
  - `git worktree remove` deregistered it, but could not delete its folder. Some `node_modules` paths exceed Windows'
    260-character limit ("Filename too long").
  - The folder was deleted through the long-path prefix, and `git worktree prune` run. `git worktree list` shows only
    the repo.
- **Scratch:** every file and folder deleted. That covers the probes, the screenshots, the Lighthouse reports, the
  Playwright logs, the commit-split scripts and drafts, and the per-test S20 list. The per-file S20 table is in the
  S18+S19 entry §4.
- Ports 3400–3402 are free.

### Validation (Git Bash)
| Command | Result |
|---|---|
| `npm test` after the docs edits | **121/121 tests**; the two lab unit files fail at load until S20, as in S18+S19. The private-repo and institution guards pass over the new docs |
| `npm run build` (Turbopack cache cleared), then `/`'s two stylesheets | Unchanged: the same two files, 43,672 B and 28,727 B. CLAUDE.md and START-HERE add no utility |

### State (VL)
- `origin/main` = **`443a1f9`** = Production (`gh api …/deployments`), tagged `product-plates-final`. Untouched.
- `release/concept-a`: S18+S19 and this close-out, pushed. No PR.
- `proto/hero-a-cinematic`: frozen; PR #18 a draft.

### Waiting on Tay
- **S20** in a new session, on `release/concept-a`: the tests. Port the lab specs and unit tests to `/`, delete the two
  prototype-only ones, remove the temporary `@ts-nocheck` lines, retire the old page's specs, and add the new guards.
- In S21+S22: N7's final `/privacy` wording (R13), and #17.

---

## 2026-11-20 — Sessions 18+19: `/` is the Concept A page; `/lab` and the retired code deleted (Claude Code)

**Scope (Tay's brief, S18+S19 exactly as planned):**
- Compose `/`: the header (R2), the hero, Work, About (R10), Stack, Think · Build · Ship, Contact, Two more (R5), the
  footer. One `main`, one h1, every live id, dark-only `<html>` (R3). "More on X" opens the case-study dialog (R4).
- axe on the dark page with the dialog and the accessibility panel open.
- Delete `/lab` and the retired code. The approved guard edits, each in its own commit naming its approval. The WebGL
  guards unchanged.
- No new copy. The release gate: Lighthouse mobile (median of 5) on a local production build of this branch and of
  `main`, plus the JS and HTML budgets.
- `/lab/*` answers 404; `/` is `index, follow` with its canonical. Screenshots at 390 and 1440 in scratch.
- Commit and push the branch (no PR, no merge, no deploy), and give Tay the Preview URL. The session stays open until
  Tay reviews.

### 1. Preconditions (VL)
- `git fetch`, `release/concept-a` checked out and pulled: HEAD **`af0af8d`**. `main` = `origin/main` = **`443a1f9`** =
  Production (`gh api …/deployments`, status success). `npm ci` clean.

### 2. What changed (VL)
**`482d29e`, the swap** (61 files; the prototype's files moved with `git mv`, their copy unchanged):
- **The page** (`app/page.tsx`): the header, then `<main>` holding the page in a `.cine` root: `#hero`, then one `.wk`
  region (its sky and two glows) with `#work`, Two more (`#more-work`), `#about`, `#skills`, `#approach`, `#contact`.
  Then the case-study host and the live footer. One `main`, one h1 (the hero's). Work's title is an h2, each product an
  h3. Every live id is kept (R7), `#approach` included.
- **Where the code lives:** the layer at `app/cinematic.css`, imported by `/` only (`/privacy`, the 404 and the error
  page never load it). The sections in `components/sections/`: `Hero`, `Constellation`, `featured`, `Work`, `panels`,
  `Reel`, `Shot`, `MoreWork` (new), `About`, `Stack`, `StackFilter`, `ThinkBuildShip`, `Contact`, with their data in
  `aboutBlock.ts`, `stackBlock.ts`, `tbsBlock.ts`, `contactBlock.ts`. Hero and Stack keep the paths `hero.test.ts`
  reads.
- **The header (R2):** `Navbar.tsx`'s behaviour, re-toned in the layer.
  - The hero's wordmark (`Logo.tsx`) and its availability pill (`AvailabilityPill.tsx`, shared with the hero). The four
    anchors with a cyan current-section underline, the accessibility button, "Get in touch" as the layer's outlined
    control. The phone menu sheet, with the layer's cyan "Get in touch".
  - No theme toggle. **At the top of the page it shows no surface**; once scrolled it is the field at 88%, frosted,
    with a hairline.
  - The scrolled flag is set in the scroll event itself, so the surface is never a frame late. The phone swipe test
    counts one header colour on every frame.
  - **The pill:** in the bar from 1280px. Below that the bar has no room for it (measured: at 1024 the right cluster
    would overlap the links), so it opens the hero under the header, where the locked hero wrapped it under the
    wordmark. CSS displays exactly one of the two.
- **Dark only (R3):** `<html data-theme="dark">` whatever the cookie. `ThemeProvider` and `ThemeToggle` are deleted,
  and nothing reads or writes the `theme` cookie. `THEME_COOKIE` stays in `lib/theme.ts` only because `/privacy` still
  names it; that paragraph is S21+S22's (R13).
- **The layer's scope chrome:** it set `--accent` to cyan on the whole body, written for the lab's light `<html>`. Now
  only the skip link and the chat launcher take it. The overlays keep the site's dark accent (R3).
- **Depth (R4):** each panel's "More on X" link is a "Case study" button with `data-case-study`, on the existing lazy
  dialog. The early-click script and the no-JS rule came along.
- **Two more (R5):** `MoreWork.tsx`, the live words only (`dict.more.title`, each project's name, `context` and
  `summary`). Two ruled rows on About's grid: the name and context on one side, the summary, the source link (or the
  site's label) and "Case study" on the other. Six case-study triggers in all.
- **R9:** the hero's arrows are the site's SVG icons: `ArrowUpRightIcon` for the ↗, and `ArrowDownIcon` for the ↓, so
  the pair matches (About's résumé on the slice already drew ↓ that way).
- **R10:** About ends on the facts (no availability line, no links). Work drops its lede and its own reveal: the hero's
  is the page's one. Both apply R10 in full; the brief named it beside About.
- **Captures:** none is a load priority any more (the hero fills the first screen), so every capture is lazy.
- **Composition fixes, found in the screenshots:**
  - The hero's sky ended navy with its violet glow, and Work's sky starts at the base: a hard edge. The hero's sky now
    fades into the field over its last `--cine-section-y`, under the vignette; the copy and the field sit above it.
  - Work's cyan glow box started 12vh above its region (the lab page's top hid that cut), so `.wk` drew a line across
    it. Its top is now 0.
- **Deleted:**
  - `app/lab/` (the layout, both routes).
  - The Product Plates hero, the four chapters and `work/Work.tsx`, `MoreWork`, the About visual, Stack and its lens,
    Think · Build · Ship, Contact, and their stylesheets. `Pic.tsx` (orphaned).
  - From `globals.css`: the section seams (they targeted the ids this page reuses and drew bands over it) and the
    toggle's glyph rules. The plate tokens stay, because `tokens.test.ts` reads them.
  - The explainers can be restored from `product-plates-final` (`docs/ROADMAP.md`, P4 restore record).
- **Comments** in the moved files now point at their new paths, or at `product-plates-final:` for the retired ones.

**`270ab27`, a landmark fix found by the axe check (§5):** the header has its own `.cine` root, and the case-study host
sits inside `<main>`, after the page's root, as on the Product Plates page. Outside `<main>`, the dialog's own
`<header>` was a second banner.

**`ea7cdcc`, the build:** the production build type-checks every test file, and the two lab unit tests import the
deleted `/lab` modules. So the build, and the Preview with it, failed. Each file gets a temporary `@ts-nocheck` with a
one-rule ESLint disable and a note; no assertion changed. S20 removes both lines when it ports them.

### 3. The test changes (each its own commit, naming its approval)
**R12, approved in session 16:**
- `d6dab35` `page.spec.ts:43`: exactly one canvas, the hero's, `aria-hidden`.
- `3a52f22` `:75`: 0.5 and 1 unchanged; the top runs with reduced motion.
- `23666d5` `chrome.spec.ts:12`: the toggle line dropped.
- `acc3077` `:26`: "dark is the only theme, cookie or not" (no cookie, `light`, `dark`; body `rgb(4, 6, 13)`).
- `e56a121` `:36`: the toggle-layout test deleted.
- `b811b1c`: `:70`, `:132`, `:147` and `page.spec.ts:93`, dark only.
- `932e631` `site.test.ts:145`: writes the `a11y` cookie.

**R12's S17 group:**
- `e72edbf` `page.spec.ts:10,13`: the new h1 and h2 strings.
- `89694aa` `chrome.spec.ts:255`: the Tab order's labels; Contact's résumé matched by its whole name.
- `aa640ca` `:268`: the focus ring, cyan on the hero and on a panel.
- `2e4cf7f` `work.test.ts:99` and `:163–176`: GRAVITY FLOW's check reads its panel; the About visual's case goes.

**Approved by Tay in this session** (outside R12's list; found by running the suite):
- `3784a48` `english.spec.ts:45`: the new h1.
- `a7d9a94` `chrome.spec.ts:188`: the phone test's toggle line dropped.
- `62bb951` `:132`: one icon button in the phone header, the menu. A second can't fit: the wordmark and two 44px
  buttons overflow 320px.
- `5a9bd52`: **Tay's condition on that approval.** The accessibility button lives in the phone menu sheet, and a new
  test checks at 320×568 and 390×844 that it is hidden in the bar, visible, wholly in view and ≥ 44px in the sheet,
  and opens the panel.
- `ca45dcb` `:272`: at least 8 new-tab links. R10 left exactly 8; each is still checked.
- `595f00d` `aegis.spec.ts:20`: the Aegis panel's captures include the Incidents board crop (`hero-aegis`), its
  approved second capture.

**Not made yet, and why:**
- `privacy.spec.ts:43` (`["a11y"]`) and `site.test.ts:160` (the `THEME_COOKIE` match): both hold `/privacy`'s cookie
  paragraph, which changes in S21+S22 with N7 (R13). Both pass as they are.
- `content.test.ts:20,22`: R8 (the headline into `siteMeta`, and the social card) is S21+S22's. They pass as they are.
- The new guards (`/` indexable with its canonical; `/lab` answers 404): S20 adds them. Checked by hand here (§6).

### 4. Validation (VL, Git Bash, the final tree)
| Command | Result |
|---|---|
| `npm run typecheck` | exit 0 |
| `npm run lint` | exit 0 |
| `npm run build` (Turbopack cache cleared) | exit 0; the same 8 routes as `main`, no `/lab` |
| `npm test` | **121/121 tests**; 14 of 16 files pass. The two lab unit files fail at load (below) |
| `GROQ_API_KEY= npx playwright test` on every must-pass spec (aegis, budget, chat, chrome, english, page, privacy, private-repo, smoke) | **70/70** |
| The same for `chapters.spec.ts`'s "Case study" block and `lower.spec.ts:142` and `:164` | **6/6** |

Every guard passes: `dead-code`, `tokens`, the institution and private-repo guards, the budget, the WebGL counts, and
English only.

**What fails, all of it S20's** (run fully parallel with a 15 s timeout, to list it):

| File | Not passing | Why | S20 |
|---|---|---|---|
| `tests/unit/lab-hero-a.test.ts`, `lab-work.test.ts` | the whole file, at load | They import the deleted `/lab` modules and read `app/lab/*` | **Ported**, minus the two prototype-only tests |
| `tests/e2e/lab-hero-a.spec.ts` | 15 of 18 | `/lab/hero-a` answers 404. The 3 passes are vacuous (axe on the 404 page) | **Ported** |
| `tests/e2e/lab-work.spec.ts` | 62 of 63 | `/lab/work` answers 404. The 1 pass is the résumé PDF fetch | **Ported**; "/'s CSS pinned to main's digest" and "Contact as on the live /" are deleted |
| `tests/e2e/hero.spec.ts` | 12 of 12 | The Product Plates hero is gone (its plates, mosaic and index tiles) | **Retired** |
| `tests/e2e/chapters.spec.ts` | 24 of 32 | The chapters are gone: the stepper, the Aegis trace, cite-or-decline, the marked frame, the plates. The Case study block (4) passes, and so do 4 others that happen to hold on the panels | **Retired**, except the Case study block |
| `tests/e2e/lower.spec.ts` | 10 of 17 | The old About measure, the Stack lens and groups, TBS's words, Contact's old markup | **Retired**, except `:142` and `:164` (both pass) |

### 5. axe on the dark page, each overlay open (VL; a scratch script with the suite's tags; 1440 and 390)
- **The accessibility panel: 0 violations** at both widths. On phones it opens from the menu sheet.
- **The case-study dialog, each of the six:**
  - First run: `landmark-no-duplicate-banner` and `landmark-unique` on `.site-nav`, new with the swap. Fixed in
    `270ab27` (§2).
  - Left: `aria-allowed-role` (the panel is an `<aside role="dialog">`) on all six, and `image-redundant-alt` on three
    (T Poker, DeveloperOS, GRAVITY FLOW: gallery images whose alt repeats their caption). **The same on production's code:** the same script on `main`'s
    build gives exactly these two. Both are axe best-practice rules, not WCAG A/AA. Not changed here; for Tay.
- `page.spec.ts`'s axe test (the page, then the chat open, dark, 1440 and 390): **0 violations**.

### 6. The release gate (VL; local production builds, served by `next start`)
**Bytes** (`budget.spec.ts`'s algorithm):

| | `main` `443a1f9` | This branch |
|---|---|---|
| First-load JS gzip (budget 205.7 KiB) | 181.79 KiB, 9 scripts | **185.00 KiB**, 9 scripts (+3.21) |
| HTML (budget 568 KB) | 160,194 B | **127,970 B** |
| Stylesheets | 44,530 + 31,805 B | 43,672 + 28,727 B |

**`/`:** `index, follow`, canonical `https://tayshofer.dev`, no noindex anywhere in it. **`/lab`, `/lab/hero-a`,
`/lab/work`: 404.** `/privacy` 200, `/nope` 404.

**Lighthouse** `npx --yes lighthouse@13.6.0`: mobile defaults (simulated throttling, 412×823), HeadlessChrome 158, the
two builds interleaved run by run, 5 each, on the final tree:

| Median of 5 | `main` `443a1f9` | This branch `270ab27` |
|---|---|---|
| Performance | 93 | **100** |
| LCP | 3,191 ms | **1,061 ms** |
| FCP | 1,063 ms | 1,061 ms |
| TBT | 17 ms | 23 ms |
| CLS | 0 | 0 |
| Speed Index | 1,063 ms | 1,063 ms |
| A11y / BP / SEO | 100 / 100 / 100 | 100 / 100 / 100 |
| Bytes loaded | 356,089 | 389,747 |

Every run of each build gave the same Performance score (93 and 100); the benchmark index was 3,912–4,086, with no run
warnings.

- **No flag:** LCP is far inside 2.5 s, and Performance is not below `main`'s.
- The LCP element moved: on `main` it is a hero tile's image (as on production); here it is the h1, which paints with
  the first paint.
- Locally, `main` measures LCP 3.19 s and Performance 93, against production's 2.29 s and 98 (S17): a local
  `next start` is not Vercel's CDN. That is why the gate compares local with local, by the same method.
- **The first round** (before `270ab27`, which changes only where the host and the header sit) gave the same medians
  for this branch: Performance 100, LCP 1,062 ms.

### 7. Screenshots (scratch, not committed)
`final-shots/` in the session scratch: the first screen and the full page at 390×844 and 1440×900, plus 320, 1024 and
1280. At every size: no horizontal overflow, no console errors, and the header row fits (the pill in the bar from
1280px).

### 8. Pushed, and the Preview
- `release/concept-a` pushed: `af0af8d..270ab27` (20 commits), then this docs commit. No PR, no merge, nothing deployed
  to Production, which is still `443a1f9`.
- Vercel built the Preview from `270ab27`: READY (`dpl_9Dt57A7vnKSZRPBGAaeTeahKTHpT`; GitHub deployment `7928707611`,
  success).
- **The branch's link, which follows each push:**
  `https://tay-shofer-portfolio-git-release-840354-tays-projects-d5aefd6e.vercel.app/`.
- This build's own link: `https://tay-shofer-portfolio-hwz2i7m75-tays-projects-d5aefd6e.vercel.app/`.
- Both are behind Vercel's login (302 to its SSO), like every Preview.
- Claude did not open the Preview's pages: the connector's authenticated fetch would create a share link, which opens
  the deployment to anyone holding the link for 23 hours. The checks in §4–§6 ran on the same code, built locally.

### Waiting on Tay
- **Review the whole page on his phone** through the Preview, then close the session.
- To look at:
  - The pill below 1280px opening the hero.
  - "Get in touch" as the outlined control.
  - The ↓ drawn as an SVG too.
  - Work without its lede (R10, done now).
  - The hero's sky fading into Work's.
  - The case study's two pre-existing best-practice findings (§5).
- Next: S20 (the tests), then S21+S22 (`/privacy` with N7's wording, R8's headline and card, the manifest and
  `themeColor`, #13–#16).

---

## 2026-11-19 — Session 17: the release branch, the unchanged copy, and production's baseline (Claude Code)

**Scope (Tay's brief, S17 only):**
- Tag `443a1f9` as `product-plates-final` and push the tag.
- Cut `release/concept-a` from an up-to-date `origin/main`, and copy the prototype over unchanged in one commit.
- Prove the copy is clean, with `/` byte-identical to `main`'s build.
- Production's baseline: Lighthouse mobile (median of 5), first-load JS and HTML bytes.
- #16: measure the chat launcher over links on phones. Report only; fix nothing.
- CLAUDE.md for the release track.
- Push the branch (no PR, no merge, no deploy), and close out.

### 1. Preconditions (VL)
- `git fetch`, then `main` checked out and pulled: `main` = `origin/main` = **`443a1f9`**, clean.
- Production (`gh api …/deployments?environment=Production`): `443a1f9`, status success (2026-11-19 03:20Z).
- `proto/hero-a-cinematic` at **`92b08fd`**; PR #18 is still a draft.

### 2. Tay's answers (S17)
- **R12's "still to name" test changes are approved as a group** (the h1/h2 strings, the focus ring's colour, the Tab
  order's labels, the headline pins, the two `work.test.ts` cases that read deleted files). Each change still goes in its
  own commit. Recorded in `docs/RESEARCH_AND_DECISIONS.md`, R12 (`2efac00`). None is made in S17.
- **Lighthouse:** it was installed nowhere (not in the repo, the npx cache or globally). Tay approved
  `npx --yes lighthouse@13.6.0` (stable, published 2026-10-27). It runs from the npx cache: `package.json` and the
  lockfile are unchanged.
- **The five docs that changed on both sides** come over by a three-way merge, in their own commit (§4).

### 3. The tag (R15) (VL)
- `product-plates-final`: an annotated tag, object **`8f0a96a`**, pointing at **`443a1f9`**. Pushed:
  `git ls-remote` shows it, with `^{}` = `443a1f9`.
- R15 put this in S24; Tay's brief brought it forward. S24 now only checks it.

### 4. The release branch and the copy (VL)
- `release/concept-a` from `origin/main` `443a1f9` (`--no-track`).
- The branch point is **`a7a89fd`**. Since then, `main` has had 7 commits (PRs #17, #19, #20), all docs, touching 5 files.
- `git diff --name-only main...proto/hero-a-cinematic` lists **82 paths** (75 added, 7 modified). **5 of them changed
  on `main` too:** `CLAUDE.md`, `claude/START-HERE.md`, `docs/RESEARCH_AND_DECISIONS.md`, `docs/ROADMAP.md`,
  `docs/WORKLOG.md`. No code path did.
- **`8b77de1`:** the other **77 paths**, byte for byte (`git checkout 92b08fd -- <paths>`). The staged blobs equal
  `92b08fd`'s for every path (`git diff --cached --quiet 92b08fd -- <paths>`, exit 0).
- **`b4fd805`:** the 5 docs, merged three ways (`git merge-file`; base `a7a89fd`, `main`, the prototype), with every
  conflict resolved by hand and nothing dropped from either side:
  - **CLAUDE.md and START-HERE:** the prototype's copies. Every line only `main` had was an older snapshot of the same
    facts.
  - **RESEARCH_AND_DECISIONS:** D1 keeps `main`'s bullets and gains the session 16 note. D2 keeps both sides. N7 keeps
    `main`'s deferral and adds R13. The history has both sides' rows.
  - **ROADMAP:** D2's R12 exception, plus `main`'s "Concept A is not M2". Backlog #11 has `main`'s deferral and R13's
    schedule, #12 `main`'s merged state, and #13–#16 the prototype's rows.
  - **WORKLOG:** the prototype's sessions 10–16 in full, plus `main`'s summary of sessions 10–11 and its session 9
    close-out, each in date order. The change log has both sides' rows.

### 5. The copy is clean (VL, at `8b77de1`, Git Bash)
| Command | Result |
|---|---|
| `npx next typegen`, then `npm test` | **216/216** (16 files) |
| `npm run typecheck` | exit 0 |
| `npm run lint` | exit 0 |
| `npm run build` | exit 0 (12 routes; `/lab/hero-a` and `/lab/work` among them) |
| `GROQ_API_KEY= npx playwright test` | **213/213** (1.9 min), the stylesheet pin and the budget test among them |

**`/` against `main`'s build.** `main` (`443a1f9`) was built in a scratch worktree with its own `npm ci`. Both builds
were served with `next start` (`:3402` and `:3401`) and compared over HTTP, `/privacy` too:
- **Stylesheets: byte-identical.** The same two files, `0qut0t360w_q7.css` (44,530 B) and `04srp7qcwoz8q.css`
  (31,805 B), with equal SHA-256.
- **Markup: identical with the build ID masked**, except for one extra `<script>` tag and the chunk file names.
- **Scripts: not byte-identical.**
  - `/` loads **10 files instead of 9**: 600,362 → 600,542 B raw (+180), and 186,150 → 186,569 B gzip
    (181.79 → 182.20 KiB, budget 205.7).
  - **It is the same code.** Parsed with `acorn`, both sides carry the same **177 modules**. 100 are byte-identical. The
    other 77 match token for token once identifiers and chunk file names are masked: minifier renaming, and the names
    of the lazily loaded chunks.
  - The Turbopack runtime differs only in its chunk list and names.
  - The cause is the split sessions 10–11 recorded: Turbopack cuts the same JavaScript differently once a second route
    exists. It goes away with `/lab` in the swap (S18+S19).
  - So the brief's "`/` byte-identical" holds for the stylesheets and the markup, not for the script bytes.
- `/privacy` behaves the same way: 8 → 9 scripts, 173 modules of the same shape, and the same stylesheet.

### 6. CLAUDE.md for the release track (`0a889bf`)
- Move F retired (R14). The release track: R1–R15, S17–S24, `release/concept-a` (the copy, what `/` ships until the
  swap, the rollback, the tag). The prototype branch is the frozen record.
- Also: D1's release approval; D2 unchanged on all three branches; R12's list and the one canvas exception; the unit
  count on this branch; Lighthouse via npx; `npm ci`'s allow-scripts warning.
- **Rebuilt clean.** The first rebuild compiled in 0.5 s from Turbopack's cache (`.next/cache/turbopack`), so the cache
  was cleared and the build run again (2.9 s, uncached).
- `/`'s two stylesheets are still byte-identical to `main`'s build, and the markup and the 177 modules are as in §5.
  `GROQ_API_KEY= npx playwright test tests/e2e/lab-work.spec.ts -g "byte-identical"`: **1/1**.

### 7. The release baseline: production `/` (VL, 2026-11-19 18:38–18:41Z, `443a1f9`)
**Lighthouse 13.6.0, mobile.** Default settings: simulated throttling (150 ms RTT, 1.6 Mbps, 4× CPU) and a 412×823
screen. The host's HeadlessChrome is 158.0.0.0, benchmark index 3,971–4,036. Five runs in a row, with nothing else
running:

| Run | Perf | A11y | BP | SEO | FCP | LCP | TBT | CLS | SI | Bytes |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 98 | 100 | 100 | 100 | 1,341 ms | 2,391 ms | 16 ms | 0 | 2,648 ms | 345,031 |
| 2 | 98 | 100 | 100 | 100 | 1,175 ms | 2,263 ms | 33 ms | 0 | 1,439 ms | 345,109 |
| 3 | 98 | 100 | 100 | 100 | 1,140 ms | 2,275 ms | 35 ms | 0 | 1,520 ms | 339,930 |
| 4 | 98 | 100 | 100 | 100 | 1,139 ms | 2,288 ms | 49 ms | 0 | 1,376 ms | 339,889 |
| 5 | 98 | 100 | 100 | 100 | 1,130 ms | 2,330 ms | 37 ms | 0 | 1,351 ms | 345,204 |
| **Median** | **98** | **100** | **100** | **100** | **1,140 ms** | **2,288 ms** | **35 ms** | **0** | **1,439 ms** | **345,031** |

- The median-score run is run 4.
- The LCP element is a hero index tile's image (`span.tile__stage > span.tile__win > picture > img`).
- No run warnings.
- LCP 2.29 s is inside the 2.5 s target, with 0.21 s to spare. **This is R11's yardstick:** ROADMAP #13 ships only if
  phone LCP would otherwise be worse than this.

**Bytes** (`tests/e2e/budget.spec.ts`'s algorithm, fetched with a browser's headers through Cloudflare;
`Server: cloudflare`, with an `x-vercel-id`):

| | Production `/` | A local build of `443a1f9` |
|---|---|---|
| First-load JS (gzip, budget 205.7 KiB) | **182.04 KiB** (9 scripts, 600,941 B raw) | 181.79 KiB (9, 600,362 B) |
| HTML (budget 568 KB) | **160,584 B** (156.82 KB) | 160,194 B |
| Stylesheets | 44,530 B + 31,805 B | 44,530 B + 31,805 B |

Vercel's build differs a little from a local one: its chunks live under `/_next/static/immutable/`, and the Tailwind
sheet's digest differs as known, though not its size. **Compare later production numbers with production, and local
before/after numbers with a local build of `main`.**

### 8. #16: the chat launcher over links on phones (VL; report only, nothing changed)
**Method:**
- The probe is a scratch script, not committed.
- Pages: the live `https://www.tayshofer.dev/` and `/lab/work`. `/lab/work` came from this branch's production build
  on `:3401`, which is the prototype's code `1369b00`.
- Sizes: 320×568, 360×780, 375×667, 390×844, 414×896 and 430×932. Headless Chromium, mobile and touch, DPR 2.
- The launcher was measured in both states, full and tucked, set through its `data-compact` attribute, with its own
  transitions off.
- Targets: every visible link, button and tab outside the launcher, `aria-hidden` and closed dialogs.
- Each page was swept every 16px from top to bottom. Each target's largest covered share was recorded, plus the rest
  positions (the top, every in-page anchor jump, the page's end) and a Tab walk from the top. The Tab walk leaves the
  launcher in whatever state the page's own script sets.

**The launcher on phones:**
- Full ("Ask AI"): 97.5×50px. Tucked: 50×50px.
- 12px from the right and bottom edges, so it spans x = W−109.5…W−12 when full and W−62…W−12 when tucked.

**Results:**

| | Live `/` | `/lab/work` |
|---|---|---|
| Targets ever under it mid-scroll | 3–8 full, 0–5 tucked (of 50) | 12–18 full, 6–11 tucked (of 44) |
| **LinkedIn** | Only the footer's, at 320: 14% full, 0 tucked. Contact's LinkedIn never | **About's**, at every width: 23–54% full, 11–26% tucked. Contact's LinkedIn never (its GitHub, on the pair's right, does: 20–70%) |
| Wholly covered at some point (full label) | The footer's "Privacy" at 430 (tucked: 65%) | T Poker's "Capture 5 of 5" dot at 320. "Next capture" (T Poker, GRAVITY FLOW) at 414 and 430 (tucked: 20–39%) |
| Covered at rest | **At the top on load:** the hero index's "GRAVITY FLOW" tile, 19/2/13% full at 320/360/375 (9/1/6% tucked). After the `#contact` jump at 375: the footer's "Résumé (PDF)", 65% full, 23% tucked. After `#work-developeros` at 375: its "Source on GitHub", 24% full | Nothing at the top or the end. The page has no in-page anchors |
| At the page's end | Nothing (the footer's clear strip) | Nothing (as session 15 measured) |
| Tab focus partly under it | The "GRAVITY FLOW" tile, at 320/360/375: 19/2/13% (full) | At 390–430, over two walks: "More on Aegis" 28–82%; Stack's "DeveloperOS" filter 53%; "Next capture" 5–37%; DeveloperOS "Source on GitHub" 6–8%. Which stops hit varies with the label's state, which follows scroll timing |
| Tab focus wholly under it | None | None |

**Reading it:**
- Mid-scroll passes are inherent to a fixed control. #16's planned fix (S21+S22, `docs/ROADMAP.md`) is about focus and
  rest: `scroll-padding-bottom`, and the Tab test's "unobscured" check extended to the launcher.
- No focused target was ever entirely hidden (WCAG 2.4.11, AA). Several were partly hidden, which 2.4.12 (AAA) counts.
- **Tay's case, LinkedIn mid-scroll, is About's LinkedIn on `/lab/work`.** R10 removes About's links in S21+S22.
- On the live `/`, the hero index's last tile sits partly under the full label at 320–375 on load. It is pre-existing,
  on production.
- Tucking cuts every overlap. At 414 on the live page, nothing passes under the tucked launcher.

**Limitations (NC):**
- Emulation, not a real phone. Safe-area insets are 0 here; on an iPhone the launcher sits higher by the bottom inset.
- The Tab walk follows one scroll path per size.
- `/lab/work` was measured on a local production build, not the Preview. The composed page (S18+S19) will differ:
  the header, Two more, the footer, and About without links.

### 9. Close-out (VL, Git Bash)
- **START-HERE, ROADMAP (#16 measured; P5/P6 in progress) and this log updated** (this commit).
- `npm test` after each docs commit: **216/216**.
- **The final tree, rebuilt clean** after the START-HERE edit (Turbopack cache cleared; 2.8 s uncached):
  - against `main`'s build, `/`'s and `/privacy`'s stylesheets are byte-identical;
  - the markup differs only by the one extra script tag;
  - all 177 modules match, as in §5.
  - `GROQ_API_KEY= npx playwright test tests/e2e/lab-work.spec.ts -g "byte-identical"`: **1/1**.
- `release/concept-a` pushed with its upstream set: branch only, no PR, no merge.
- Clean-up:
  - the scratch worktree of `443a1f9` removed (`git worktree remove`), and the scratch files deleted;
  - ports 3400–3402 are free;
  - `main` is clean and level with `origin/main`.

### State (VL)
- `origin/main` = **`443a1f9`** = Production, tagged `product-plates-final`. Untouched this session.
- `release/concept-a`: the copy, the merged docs, R12/R15, CLAUDE.md and this close-out. Pushed.
- `proto/hero-a-cinematic` = `92b08fd`, frozen; PR #18 a draft.

### Waiting on Tay
- **S18+S19** in a new session, on `release/concept-a`: compose `/`, with the case studies and Two more.
- In S21+S22, approve N7's final `/privacy` wording. In S23, the GRAVITY FLOW image and the review on his phone.

---

## 2026-11-19 — Session 16: the P5 (integration) and P6 (release) plan, approved (Claude Code)

**Scope (Tay's brief):**
- Sync both branches.
- A plan only, for P5 and P6. No code changed.
- The goal: the new site (the locked hero and the approved sections) replaces the live `/` as soon as possible,
  because Tay is job hunting. The demos (P4) come after the release.
- Then: record the decisions, update START-HERE and this log on this branch, run `npm test`, push, and close out.
  S17 does not start this session.

### 1. Preconditions (VL)
- `git fetch`: `origin/main` = **`443a1f9`**; local `main` level with it, clean.
- `proto/hero-a-cinematic` at **`d8f3ef4`**, level with its remote, clean.

### 2. What the plan found (VL, by reading the code on both branches)
- **The prototype only adds files.** Outside docs and tests, `git diff --stat main...HEAD` touches 70 files, +2,295
  lines, 0 deletions. It can be copied onto a branch from `main` exactly as it is.
- **The root layout already serves `/lab`:**
  - the skip link (to `#main`), the providers with the chat launcher and its panel, the accessibility panel's
    provider, JSON-LD, and the early-chat script;
  - plus the root metadata, which the lab layout overrides with noindex and no canonical.

  What `/lab` lacks is in `app/page.tsx`: `Navbar` and `Footer`.

**The gap audit (live `/` against the prototype):**

| Area | Live `/` | Prototype | Plan |
|---|---|---|---|
| Header | Fixed `Navbar`: `#work #about #skills #contact` with a current-section underline, accessibility button, theme toggle, "Get in touch", phone menu sheet | The hero's own top bar (wordmark, availability pill), not fixed; section ids are `wk-*` | R2, R7 |
| Hero links | In-page | `/#work`, `/#work-<id>` (links to the live page) | In-page `#work`, `#work-<id>` (R7) |
| Outline | One `main`, one h1 | Two routes, each with its own `main#main` and h1 | One `main`; the hero's h1; Work's title an h2, the products h3s |
| Footer | Identity, the channels, the résumé, Privacy, Back to top (`#hero`), © and the legal name | None | The live Footer as it is |
| Chat | Launcher and panel | The same, from the root layout. The layer recolours only the launcher; by the code, the panel opens in `<html>`'s theme, which defaults to light (NC: to confirm on the Preview) | R3 |
| Theme | Light by default, dark on request, `theme` cookie | Dark only | R3 |
| Accessibility panel | Header button | No button, so the panel can't be opened on `/lab`; the layer honours reduced motion and high contrast | Keep the button (R2); check large text on the layer |
| Depth | Six "Case study" buttons and the lazy dialog; the chapters' explainers | "More on X" to `/#work-<id>`, which the swap removes | R4, R6 |
| Two more | Job Assistant, Orders & Delivery, each with a case study | Missing (Stack's evidence names both) | R5 |
| Metadata and the card | Root metadata; light card with `siteMeta.headline` | Lab titles, noindex | Root route inherits index and canonical; R8; manifest and `themeColor` to the dark field |
| noindex | Index | All of `/lab` | `/lab` never shipped; a guard (R12) |
| 404, error page | Light-themed | — | Dark theme (R3); the 404's copy kept |
| Résumé | Same PDF | Linked four times once composed | R10 |
| Headers and CSP | `proxy.ts` on every route | No new origin; the 2D canvas and the two inline scripts are already allowed | No change; verify on the Preview and production |
| Retired code | Plates hero, chapters, About visual, Stack lens | — | Deleted in the release PR (`dead-code.test.ts` fails on orphaned components) |

**The tests the release touches** (detail: `docs/RESEARCH_AND_DECISIONS.md`, R12).
- **Unchanged if R2, R4, R5 and R7 are taken.** Read, not yet run:
  - `budget.spec.ts` (its three case-study tests open `button[data-case-study='aegis']`);
  - `dead-code.test.ts`, `tokens.test.ts`, the institution and private-repo guards;
  - `english.spec.ts`, `privacy.spec.ts:15`, `site.test.ts:24`;
  - `chat.spec.ts` (`:99` needs the footer and a case-study button);
  - `chapters.spec.ts:304–352` (six triggers);
  - `private-repo.spec.ts` (`:49` needs the `more-work__row` class, or a one-selector change);
  - `aegis.spec.ts` (needs `#work-aegis`);
  - `hero.test.ts` (`heroIndex` hrefs are `#work-<id>`);
  - `chrome.spec.ts:276`, and `:284`, which checks that every in-page link's target exists.
- **Likely to pass; verify by running:** `page.spec.ts:18`, `:50`, `:111`, `:120` (the layer's smallest text is
  exactly 12px).

**The rest of the plan:**
- The backlog (#13–#16): ROADMAP.
- The mechanism and the production checks: ROADMAP, "Concept A: P4–P6".
- Ruled out:
  - merging the prototype branch: never merged, and it carries `/lab`;
  - a route flag keeping the old page alongside: two homes, twice the tests, and Vercel's rollback already covers it.

### 3. Tay's decisions
All recorded as **R1–R15** in `docs/RESEARCH_AND_DECISIONS.md`, "Resolved in session 16":
- **Approved as recommended:** decisions 1–5, 7–12 and 14.
- **6, the explainers:** they retire for the release, provided ROADMAP P4 records their files and last commit.
  Done: "P4 restore record". All four are intact at `443a1f9`, last changed in `fddc36e` (markup and data) and
  `b5941cf` (styles).
- **13, N7:** it goes into S21's `/privacy` edit, but its exact final wording is shown to Tay before the commit.
- **15:** tag `443a1f9` as `product-plates-final` before the merge, and push the tag (an S24 step, not done now).
- **Tests:**
  - §2 A (the canvas and rAF changes, plus the dark-only theme tests) and E (the new guards) are approved as written.
    Each change goes in its own commit naming the approval. The WebGL guards stay unchanged.
  - The other §2 A rows follow from R7–R9, but Tay hasn't named them yet: the h1 and h2 strings, the focus-ring
    colour, the Tab order's labels, the headline pins, and the two `work.test.ts` cases that read deleted files.
    They are logged as "still to name" and get confirmed in S18+S19.
- **Sessions:**
  - S18 and S19 are paired, and so are S21 and S22.
  - S23 adds WebKit and Firefox runs, Tay's review on his own phone through the Preview, and the GRAVITY FLOW capture
    swap (ask Tay for the image then).
  - The plan S17–S24: `docs/ROADMAP.md`.

### 4. What changed (docs only)
- **`docs/RESEARCH_AND_DECISIONS.md`:**
  - D1: the reopening for Concept A, which this log had never recorded, and the session 16 approval.
  - D2: the one approved `<canvas>` exception, with the WebGL guards unchanged.
  - New: "Resolved in session 16" (R1–R15).
  - N7: decided for S21+S22.
  - The history row.
- **`docs/ROADMAP.md`:**
  - New: "Concept A: P4–P6". It holds the S17–S24 table as merged, the rollback, the production checks, and P4 with
    the restore record.
  - Global constraints: D1 and D2 amended. M1: Move F retired (R14). A note mapping M3–M7 to P3–P6.
  - Backlog: #13–#15 decided and scheduled, plus a new **#16**, the chat launcher over LinkedIn mid-scroll on phones.
- **`claude/START-HERE.md`** and this entry.
- **The memory's state note.**

### 5. Validation (Git Bash)
| Command | Result |
|---|---|
| `npm test` | **216/216** (the private-repo guard scans these docs) |
| `npm run build`, then `GROQ_API_KEY= npx playwright test tests/e2e/lab-work.spec.ts -g "byte-identical"` | **1/1**: `/`'s stylesheets still equal `origin/main`'s bytes after the START-HERE edit (Tailwind scans `claude/`) |

- Production checked read-only (`gh api …/deployments`): `443a1f9`, status success.
- The full e2e suite was not run: no code changed.

### State (VL)
- `origin/main` = **`443a1f9`** = Production. Local `main` level with it, and clean.
- This branch: the code is still `1369b00`; the docs are on top. PR #18 is a draft.

### Waiting on Tay
- **S17 is next:** the release branch, the unchanged copy of the prototype, and production's baseline.
- In S18+S19, confirm the "still to name" test changes.
- In S21+S22, approve N7's final `/privacy` wording.
- In S23, the GRAVITY FLOW image.

---

## 2026-11-19 — Session 15 close-out: Contact approved with the 1100px fix; P3 complete (Claude Code)

**Scope (Tay's brief):**
- Contact is approved, with one fix: from 1024 to 1100px Contact stacks (the title above the content), so the title keeps
  its two lines; its two columns start at 1100px. Contact only; the other sections unchanged. A layout test at 1024 and
  1100, and everything above Contact still pixel-identical.
- Decisions: Contact's phone LCP cost joins ROADMAP #13's P5 fix; #14, keep the hold as it is.
- Close out: WORKLOG, START-HERE, CLAUDE.md and the memory, on this branch, with the final state (P3 complete: all six
  sections approved). Full tests, push; PR #18 stays a draft. Remove the `a625c75` baseline worktree, clean scratch, and
  confirm `main` is clean and level with `origin/main`.

### Decisions (Tay)
- **Contact is approved** (`56e3dea`), with the 1100px fix (`1369b00`).
- **P3 is complete: all six sections are approved:** the hero (`/lab/hero-a`), the Work panels and their carousels,
  About, Stack, Think · Build · Ship and Contact.
- **Contact's phone LCP cost stays;** Contact joins `docs/ROADMAP.md` #13's P5 fix (`content-visibility` with the glow
  anchored), beside Stack and Think · Build · Ship.
- **#14: the hold stays as it is.**
- **#15 (P5), logged at Step 1:** Contact repeats About's availability wording and its three links; re-check whether
  About keeps its links once the full page is assembled.

### What changed
- **`1369b00`:** `.wk__contact`'s two columns start at 1100px (the sections above keep 1024). From 1024 to 1100 Contact
  stacks, and the title keeps its two lines. The e2e layout test now also runs at 1100 (two columns) and checks 1024
  (stacked, with About still in two columns, and each half of the title on one line); the unit test pins the 1100px rule
  and that Contact's rules have no 1024px one.
- **Pixels (VL; reduced motion, sky and launcher hidden):** `/lab/work` from the top to Think · Build · Ship's end, 0
  differing pixels against `a625c75` at 1440, 1100, 1024, 390 and 320.
- **Bytes (VL):** every JS file byte-identical to `a625c75`; only the lab's Work stylesheet differs (16,758 bytes, the
  same size as before the fix). `/`, `/lab/hero-a` and `/privacy` identical with build IDs masked.
- **Docs:** CLAUDE.md (the prototype's code is `1369b00`; Contact on `/lab/work`; P3 complete; sessions 10–15; unit
  216/216), START-HERE, CINEMATIC_SYSTEM (Contact approved, the 1100px rule, the cost and the hold kept), ROADMAP (#13
  with Contact; #14 kept), this entry. The memory's state note and two measurement lessons.

### Validation (Git Bash, the final tree)
| Command | Result |
|---|---|
| `npm test` | **216/216** |
| `npm run typecheck`, `npm run lint` | exit 0 |
| `npm run build`, then `GROQ_API_KEY= npx playwright test` | **213/213** (212, plus the layout test at 1100) |

- `/`'s Tailwind sheet keeps `868e8b98…` (44,530 bytes) after these docs (CLAUDE.md and START-HERE are scanned).
- axe (the e2e suite): 0 violations at 1440 and 390, motion on and reduced.

### Clean-up
- Removed the `a625c75` baseline worktree; cleaned the scratchpad (probes, logs, screenshots, PR-body drafts).

### State (VL)
- `origin/main` = **`443a1f9`** = Production (deployment of 2026-11-19 03:20Z). Local `main` level with it, and clean.
- This branch: the code is `1369b00`; the docs are on top. PR #18 is a draft.

### Waiting on Tay
- **Decide what Concept A takes on next** (P3 complete). P5 items: ROADMAP #13, #14 and #15.
- Swap the GRAVITY FLOW capture he has in mind. Move F: still his call.
- Optional, on `main`: the chat launcher's fold on scroll (0.0076 CLS).

---

## 2026-11-19 — Session 15: Contact (P3.6) ends `/lab/work` (prototype, D1 reopened) (Claude Code)

**Scope (Tay's brief):**
- Sync: `main` at `443a1f9`, this branch at `a625c75`.
- One task: the Contact section (P3.6), the last section on `/lab/work`, below Think · Build · Ship. Lab-only; `/`
  untouched.
  - The live Contact's title, copy and links, word for word, from their source files. The brief's draft title "Let's
    build something meaningful." comes from AI reference images: shown only as an alternative, used only if Tay picks it.
  - Email (a plain mailto from the live source), LinkedIn, GitHub and the résumé, with the live targets and attributes.
    The résumé PDF unchanged. No form, no backend; no institution, no years, no availability claim beyond the live
    wording.
  - The `.cine` tokens; no client JS without showing why first; it holds still, like About.
  - The chat launcher must cover no Contact link at the page's end, at 320, 390 and 1440.
  - Re-measure Stack's filter hold (ROADMAP #14) and report it; no change without Tay's OK.
- Step 1 a plan only; Step 2 build, and fix `StackFilter.tsx`'s out-of-date header comment in its own comment-only
  commit. Measure as last session; `/`, its stylesheet bytes, `/lab/hero-a` and the guards unchanged; screenshots at
  390 and 1440 in scratch. Commit, push, update draft PR #18 (no merge, no deploy), the Preview URL. Don't close the
  session until Tay approves.

### 1. Preconditions (VL)
- `git fetch`: `origin/main` = **`443a1f9`**; local `main` level with it, clean.
- `proto/hero-a-cinematic` at **`a625c75`**, level with its remote, clean.

### 2. The plan and Tay's answers
- The copy, every string with its source: `docs/CINEMATIC_SYSTEM.md`, "Contact (P3.6, session 15)".
- **Tay's answers:**
  1. The live title, "Let's build something / people use." (not the reference images' draft).
  2. The live Contact's mailto, with its subject (`?subject=Hello%20Tay`), not the footer's bare one.
  3. Keep the "Contact" eyebrow (`dict.nav.contact`), as About and Stack take theirs.
  4. Show the lead only while `availability.open` (the live section shows it always).
- **Logged for P5 (Tay):** Contact repeats About's availability wording ("on-site, hybrid, or remote") and its three
  links. Re-check whether About keeps its links once the full page is assembled (`docs/ROADMAP.md` #15).

### 3. What changed
- **`56e3dea`, the section:**
  - `app/lab/work/contact.ts` reads every string and target from `lib/dict.ts` and `data/socials.ts`; nothing is typed.
  - `ContactBlock.tsx`, a server component, renders it after Think · Build · Ship, inside `<main>`: the eyebrow and h2
    on one side; the lead, "Email me" (the one filled control), LinkedIn and GitHub (the panels' outlined control, as a
    pair), and the résumé line under its own hairline on the other.
  - `work.css`: its rules, layer tokens only. Its eyebrow, title (each half on its own line) and lead share About's
    rules. From 1024px the title takes 5fr and the words 7fr, lined up under About's words; stacked below.
  - **No token added** (the layer still defines 76). No client code, no form, no reveal.
  - Tests: 8 unit (every string and target held to its source, the approved copy pinned, no form or client code, no
    figure but the résumé's size, no availability wording beyond the live lead) and 8 e2e (no JS; the same targets,
    attributes and accessible names as the live Contact on `/`; holds still ×2; layout at 1440, 1024, 390 and 320 with
    every link clear of the chat launcher at the page's end). The page order pins, the structure test's h2 count and the
    keyboard order now include the section; Think · Build · Ship's rule slice ends where Contact's begins.
- **Found while building, fixed in the same commit:**
  - At 320 the profile pair needed 282px and had 280, so GitHub dropped to its own line (the live rule is that the pair
    never splits). On phones the pair is now 12px apart, the links' own row gap: 270px.
  - At 320 the résumé note split after "two", and its second line fell below the link's 44px line. The note now stays
    whole and drops under the link as one piece ("· two pages, 79 KB"). The live page has the same split at 320.
- **Known, not changed:** from 1024 to about 1100px the title's first half wraps in its 368px column ("Let's build /
  something / people use."). It fits from 1100px. The e2e test pins this case.
- **`bbd9d55`, comment only:** `StackFilter.tsx`'s header no longer says Stack ends the page; the comment inside
  `press()` names the sections below. The built chunk is byte-identical.

### 4. Measured (VL; local production builds, `a625c75` in a scratch worktree vs this branch)
| | before | after |
|---|---|---|
| First-load JS `/lab/work` (the budget algorithm) | 181.77 KiB | **181.77 KiB** (every JS file byte-identical); budget 205.7 |
| HTML `/lab/work` | 102.79 KB (18.9 KB gzip) | **107.10 KB** (19.4 KB gzip); budget 568 |
| LCP desktop, medians of 10 interleaved, three rounds | 94 · 104 · 100 ms | 102 · 104 · 104 ms |
| LCP phone, 4× CPU and slow 4G, same | 1060 · 1034 · 1052 ms | 1072 · 1052 · 1056 ms |
| CLS (load) | 0 | 0 |
| INP desktop / phone (`scripts/lab-hero-a.mjs`, worst of 5 runs, two passes) | 32, 24 / 32, 32 ms | 24, 24 / 32, 32 ms |
| FPS desktop / phone | 60.5 / 60.5 | 60.4–60.5 / 60.4–60.5 |

- **LCP:** +8, 0 and +4 ms desktop; +12, +18 and +4 ms phone. The LCP and FCP medians are equal, and the LCP element is
  the first capture. Rounds 1 and 2 ran on the build before the last CSS change (the résumé note kept whole: one
  paragraph's layout); round 3 on the final build.
- **INP on Contact's words** (3 runs; clicks or taps on the title, the lead and the résumé's note): desktop < 16 ms;
  phone at 4× CPU 16 ms.
- **Scroll-through CLS** (down and back up twice): the slice 0 before and after; the chat launcher's fold 0.0153 in both
  (pre-existing).
- **axe-core 4.11.4, WCAG 2.2 A/AA:** 0 violations at 1440 and 390, motion on and reduced, with Aegis pressed (the e2e
  suite). Scoped to Contact at the page's end at 1440, 390 and 320, motion on and reduced: 0 violations, nothing to
  review. The page's "needs review" lines move with the violet glow (at 38% of the page's height): at 390 the lede and
  T Poker's line (the baseline also listed About's lede); at 320 the lede and About's lede (the baseline only the lede).
- **The chat launcher:** at the page's end every Contact link and the résumé's note sit above it at 1440, 1024, 390 and
  320 (e2e).
- **Built files:** 24 of 25 JS and CSS files byte-identical (all JS). The lab's Work stylesheet: 15,401 → 16,758 bytes.

### 5. ROADMAP #14: Stack's hold, with Contact below (VL)
Measured on both builds (reduced motion; each project pressed from the keyboard; "space" = the hold less the results'
own height, the empty band under the filtered list):

| Screen | Buttons near the view's top: before → after | Near its bottom | At the page's end (buttons out of view above) |
|---|---|---|---|
| 1440×900 | 0 → 0 | 0 | 1,096px both; 595–831px of space |
| 390×844 | 0 → 0 | 0 | 1,619px both; 919–1,231px of space |
| 1920×1200 | 128px → **0** | 0 | as at 1440×900 |
| 2560×1440 | 368px (0–103px of space) → **0** | 0 | as at 1440×900 |
| 1440×1800 | 729px (228–464px of space) → **346px (0–81px)** | 0 | as at 1440×900 |

- The view moved 0px in every case, in both builds.
- **Contact's height removes the tall-screen case** at 1920×1200 and 2560×1440 and shrinks it at 1440×1800.
- **The page's-end case is unchanged:** there the hold always equals the full list's height (the page must not get
  shorter while its end is in view), so no section below can change it. Its space sits between the filtered list and
  Think · Build · Ship, out of view, until All is pressed.
- This probe reads 16px more space than session 14's on the same baseline build (579–815 there); the difference is the
  method, and both builds read the same.
- **Not changed** (Tay's call). Recommendation: keep it as it is; #14's P5 re-check now has only 1440×1800-class screens
  and the keyboard-only end case left.

### 6. Unchanged (VL)
- **`/`, `/lab/hero-a`, `/privacy`:** every script and stylesheet byte-identical; the markup identical with build IDs
  masked. `/`'s stylesheets keep the pinned digests (`868e8b98…` 44,530 bytes; `4b84cc35…` 31,805).
- **Pixels:** `/lab/work` from the top to Think · Build · Ship's end, reduced motion, sky and launcher hidden: 0
  differing pixels at 1440 and 390.
- **Guard files** identical to `origin/main` (`443a1f9`), and the résumé PDF. `components/`, `lib/`, `app/globals.css`,
  `app/page.tsx`, `app/layout.tsx` and `data/socials.ts` too.

### 7. Validation (Git Bash)
| Command | Result |
|---|---|
| `npm test` | **216/216** (208 before, plus 8) |
| `npm run typecheck`, `npm run lint` | exit 0 |
| `npm run build`, then `GROQ_API_KEY= npx playwright test` | **212/212** (204 before, plus 8) |

### 8. Screenshots (scratch, not committed)
- At 1440 and 390: the section (motion on and reduced), the seam from Think · Build · Ship, the page's end with the
  launcher, and the full page. At 320 and 1024: the section and the page's end.

### Waiting on Tay
- Review Contact on the Preview.
- The title's three lines from 1024 to about 1100px: keep (as built), or a different arrangement there.
- The phone LCP cost (+4 to +18 ms): keep it, or add Contact to #13's P5 fix.
- #14: keep the hold as it is (recommended).

---

## 2026-11-19 — Session 14 close-out: Think · Build · Ship approved; the hold kept; the glow fix kept (Claude Code)

**Scope (Tay's brief):**
- Think · Build · Ship is approved.
- #14: keep the hold as it is; reword its test's out-of-date comment (comment only); log in ROADMAP #14 a P5 re-check
  of the visible gap case.
- Keep the glow scroll-anchoring fix (`d1c53a3`).
- Phone LCP: keep the cost, and add this section to ROADMAP #13's P5 fix.
- Close out: WORKLOG, START-HERE, CLAUDE.md and the memory, on this branch. `npm test`, push; PR #18 stays a draft.
  Remove the baseline worktree, clean scratch, and confirm `main` is clean and level with `origin/main`.

### Decisions (Tay)
- **Think · Build · Ship is approved** as built (`8382889`).
- **The hold stays as it is.** Its test's comment no longer says Stack ends the page (`a8062e6`, comment only: no
  assertion, value or logic changed). `StackFilter.tsx`'s own header comment still says it; not in the brief, left.
- **The glow fix stays** (`d1c53a3`).
- **The phone LCP cost stays;** this section joins `docs/ROADMAP.md` #13's P5 fix (`content-visibility` with the glow
  anchored).
- **Logged for P5 as `docs/ROADMAP.md` #14:** re-check the visible gap case, the hold's space between the filtered list
  and the next section on tall screens or after a press with the buttons out of view.

### Docs and memory
- `CLAUDE.md`: the prototype's code is `a8062e6`; Think · Build · Ship named on `/lab/work`; the branch's WORKLOG covers
  sessions 10–14; the prototype's unit suite is 208/208.
- `claude/START-HERE.md`: the section approved, the three decisions, what waits on Tay.
- `docs/CINEMATIC_SYSTEM.md`: the section approved; the cost, the glow fix and the hold marked as Tay's decisions.
- `docs/ROADMAP.md`: #13 now names both sections; #14 records the session 14 check and the P5 re-check.
- The memory's state note, and three measurement lessons (a decorative layer at a share of the page's height can become
  the browser's scroll anchor; a full-page gradient stretches with the page, so pixel checks hide it; cutting a
  section's markup through one interception separates its layout cost from its bytes).

### Clean-up
- Removed the `47998ee` baseline worktree (`git worktree list` shows only the main checkout).
- Cleaned the scratchpad: the probes, logs, screenshots and PR-body drafts.

### Validation (Git Bash)
- After the comment change: `npm run build`, then `npm test` 208/208 and `GROQ_API_KEY= npx playwright test` 204/204.
  `/`'s Tailwind sheet keeps `868e8b98…` (44,530 bytes).
- After these docs: `npm test` 208/208; a production build's `/` Tailwind sheet at `868e8b98…` (44,530 bytes), and the
  pinned-stylesheet e2e test passes.

### State (VL)
- `origin/main` = **`443a1f9`** = Production. Local `main` level with it, and clean.
- This branch: the code is `a8062e6`; the docs are on top. PR #18 is a draft.

### Waiting on Tay
- **Decide what Concept A takes on next.**
- Swap the GRAVITY FLOW capture he has in mind. Move F: still his call.
- Optional, on `main`: the chat launcher's fold on scroll (0.0076 CLS).

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

## 2026-11-18/19 — Sessions 10–11: Concept A, a measured cinematic prototype (D1 reopened; D2 not) (Claude Code)

**Scope (Tay's briefs):**
- Build Concept A, a dark cinematic direction, as a **measured prototype** on its own branch.
- **Tay reopened D1 for it (2026-11-18). D2 is still not reopened: no WebGL.** Session 10's docs called this "D2
  reopened"; Tay corrected that at the session 11 close.
- Never merged, never on Production, and `/` never touched.
- Per-round detail, with every number, is in `docs/WORKLOG.md` **on `proto/hero-a-cinematic`**: session 10 (sections
  1–15), session 11 and its close-out. This entry is the summary on `main`.

### 1. Where it is (VL, session 11 close)
- **Branch** `proto/hero-a-cinematic` at **`5d4610b`** (the code is `9569bd8`), equal to its remote, never merged.
- **PR #18** is a **draft** ("PROTOTYPE, do not merge"). Keep it a draft.
- **Vercel Preview**, behind Vercel Deployment Protection (sign in to view). The branch link follows each push:
  `https://tay-shofer-portfolio-git-proto-he-65ec6d-tays-projects-d5aefd6e.vercel.app/lab/work`, and `/lab/hero-a`.
  - It is `production_environment=false`.
  - Production stayed on `a7a89fd`, then `fb0f575` (PR #17), throughout.
- **Routes:** `/lab/hero-a` (the hero) and `/lab/work` (the Projects section), under a noindex `/lab` layout, and not
  linked from `/`.

### 2. What was built
- **The hero, LOCKED** (`app/lab/hero-a`), on a dark base with duotone cyan `#2ee6d6` and violet `#9b6bff`:
  - **The field:** a 2D-canvas constellation (no WebGL), pointer-reactive, with twinkle and travelling signals.
    - It pauses when the tab is hidden or the field is off screen.
    - It caps phones at about 30 draws a second and adapts its node count.
    - With reduced motion it is one still frame.
  - **One CSS reveal.** The H1 rises without fading: an opacity-0 start left Chromium with no LCP at all.
- **The design system** (`app/lab/_cinematic/cinematic.css`, doc `docs/CINEMATIC_SYSTEM.md`), extracted from the hero
  value for value:
  - `--cine-*` tokens, the scope chrome, the focus ring, duotone text and the one `[data-reveal]`.
  - Loaded only by the `/lab` layout, and scoped to a `.cine` root.
- **The Projects section** (`app/lab/work`): four product panels.
  - Every fact is derived from `data/projects.ts` and the site's own strings.
  - Private repositories are labels only, and each panel has one empty, hidden P4 demo slot.
  - The title is "Four projects, built end to end."
  - **CSS 3D coverflow carousels:** CSS perspective on 2D elements, no WebGL. The WAI-ARIA tabbed pattern, with arrows,
    swipe and no autoplay; a flat slider with reduced motion; the first capture alone without JS.
  - **Captures (session 11, approved by Tay):** T Poker 5, Aegis 2, DeveloperOS 4, GRAVITY FLOW 5, all real.
    - Left out on Tay's answers: a duplicate "final count", the DeveloperOS refusal strip and its AI-features capture.
    - The lab's captures are listed in `data/lab-images.ts`, not `data/images.ts`, which the live About visual bundles
      whole into `/`.
  - **Every slide holds its capture's box**, so mixed shapes never shift the page (red/green: CLS 0.064 without it).
  - **Fitting**: phone captures are capped by width and height; the window carousels show neighbours either side; below
    390px the dots take their own row.

### 3. Measured (VL; lab numbers, never field data)
| | first-load JS (budget 205.7 KiB) | LCP desktop / phone | CLS | INP desktop / phone |
|---|---|---|---|---|
| `/lab/hero-a` | 183.71 KiB | ~80–96 ms / ~1.0 s | 0 | ≤ 56 ms |
| `/lab/work` (session 11) | 181.43 KiB (HTML 67.46 KB) | 92 ms / 880 ms | 0 | 40 / 48 ms |

- The phone figures are 4× CPU with slow 4G. LCP on `/lab/work` is the first capture, painted in the first frame.
- axe WCAG 2.2 A/AA: 0 violations on both routes, with motion on and off.
- Validation at the session 11 code: unit tests 179/179, Playwright 176/176, typecheck and lint exit 0.

### 4. `/` and the live site
- On the branch, these are identical to `main`: the guard tests, `app/globals.css`, `lib/tokens.ts`, the root layout,
  `app/page.tsx`, `components/` and `lib/`.
- **Branch-only additions that reach no live bundle:**
  - `PROJECT_GALLERIES` (a separate export in `data/projects.ts`) and `data/lab-images.ts`;
  - 48 new files in `public/work/`, and 8 jobs in `scripts/m10-images.mjs`.
- **Measured unchanged:**
  - `/`, `/lab/hero-a` and `/privacy` load byte-identical first-load assets before and after session 11.
  - Both of `/`'s stylesheets are pinned to `main`'s by an e2e test.
- **The one standing difference**, in the branch's build only: Turbopack splits the same `/` JavaScript into 10 chunks
  instead of 9, because a second route exists.

### 5. Lessons worth keeping
These are now in CLAUDE.md's gotchas:
- the Tailwind leak (three times);
- client imports that change `/`'s JS (`data/images.ts` through the About visual);
- opacity-0 reveals hiding LCP;
- hydration that hides CLS locally;
- the chat launcher's own 0.0076 CLS on scroll;
- `MSYS_NO_PATHCONV`.

### 6. Session 11 close (VL)
- `origin/main` = **`fb0f575`** (PR #17 merged; Production `success`). Local `main` fast-forwarded to it, and clean.
- **These docs:** this PR, from `docs/session-10-closeout`, rebased onto `fb0f575`.
- **Deleted** after `git merge-base --is-ancestor`: `docs/session-9-closeout`, local and remote (`c9696d6`, PR #17).
- **Kept:** `proto/hero-a-cinematic` (active; never delete), `reference/premium-redesign-package` and the six D8
  branches (none merged).
- Scratch cleaned.

### Waiting on Tay
- **Merge this close-out PR** (docs only). Keep PR #18 a draft.
- Swap the GRAVITY FLOW capture he has in mind.
- Decide what Concept A takes on next. The five NEW layer values still wait for review: `--cine-lift`,
  `--cine-glow-lift`, `--cine-flow-turn`, `--cine-flow-scale` and `--cine-flow-dim` (`docs/CINEMATIC_SYSTEM.md` on the
  branch).
- Move F: not started; still his call.
- Optional: the chat launcher's fold on scroll (0.0076 CLS on `/`).

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
| 2026-11-18/19 | Session 10 | Concept A prototype (D1 reopened, D2 not: Tay's correction at the session 11 close; branch `proto/hero-a-cinematic`, draft PR #18, never merged): the `/lab/hero-a` hero, the cinematic layer, the `/lab/work` slice and its carousels (rounds 1–6) | `app/lab/**`, `data/projects.ts` (galleries), `docs/CINEMATIC_SYSTEM.md`, `scripts/lab-hero-a.mjs`, `tests/**/lab-*` |
| 2026-11-19 | Session 11 | Every flagship's real captures in its carousel (`9569bd8`): 8 captures encoded, the lab's own image list, box reservation for mixed shapes, window carousels, two-row controls below 390px; START-HERE brought up to date | `app/lab/work/*`, `data/lab-images.ts`, `data/projects.ts`, `scripts/m10-images.mjs`, `public/work/*` (48 new), `tests/**/lab-work*`, `docs/CINEMATIC_SYSTEM.md`, `docs/WORKLOG.md`, `claude/START-HERE.md` |
| 2026-11-19 | Session 11 close | Carousels approved by Tay; the D1/D2 framing corrected (D1 reopened, D2 not); CLAUDE.md brought level with `main`'s plus the prototype; the close-out PR for `main` refreshed from `docs/session-10-closeout`; `docs/session-9-closeout` deleted | `CLAUDE.md`, `claude/START-HERE.md`, `docs/WORKLOG.md`, `docs/CINEMATIC_SYSTEM.md` |
| 2026-11-18/19 | Sessions 10–11 | Concept A prototype on `proto/hero-a-cinematic` (draft PR #18, never merged; D1 reopened, D2 not): the hero, the cinematic layer, `/lab/work` and its carousels (approved: T Poker 5, Aegis 2, DeveloperOS 4, GRAVITY FLOW 5) | the branch only; summary here |
| 2026-11-19 | Session 11 close | This close-out: `main`'s START-HERE and CLAUDE.md name Concept A as the active direction; D1/D2 recorded correctly; `docs/session-9-closeout` deleted | `CLAUDE.md`, `claude/START-HERE.md`, `docs/WORKLOG.md`, `docs/RESEARCH_AND_DECISIONS.md` |
| 2026-11-19 | Session 12 | About (P3.3) on `/lab/work` from the live About's own words (`121d86b`); the 11 "D2 reopened" comments reworded (`4dccdf8`); the five NEW layer values approved as they are; a fourth Tailwind leak found (PR #19's CLAUDE.md line, live on `main`) and fixed on this branch (`fb3bb41`) | `app/lab/work/{about.ts,AboutBlock.tsx,page.tsx,work.css}`, `tests/{unit,e2e}/lab-work.*`, 11 lab headers, `CLAUDE.md`, `docs/CINEMATIC_SYSTEM.md`, `claude/START-HERE.md`, `docs/WORKLOG.md` |
| 2026-11-19 | Session 12 close | About approved by Tay; PR #20 opened into `main` (the CLAUDE.md Tailwind gotcha bullet reworded: `/`'s sheet back to 44,530 bytes); `docs/session-10-closeout` deleted (merged as #19); scratch cleaned | `docs/WORKLOG.md`, `claude/START-HERE.md`, `CLAUDE.md`, `docs/CINEMATIC_SYSTEM.md` (PR #20: `CLAUDE.md`) |
| 2026-11-19 | Session 13 | PR #20 merged and its branch deleted. Stack (P3.4) on `/lab/work`, in three passes on Tay's reviews: a project line per tool (`757c377`); the live Stack's layout with a dimming filter (`d3373b6`); a filter that shows only the chosen project's tools, as pills, with a no-scroll-jump hold (`8955039`). Security group; one small island (+351 bytes gzip) | `app/lab/work/{stack.ts,StackBlock.tsx,StackFilter.tsx,page.tsx,work.css}`, `tests/{unit,e2e}/lab-work.*`, `docs/CINEMATIC_SYSTEM.md`, `claude/START-HERE.md`, `docs/WORKLOG.md` |
| 2026-11-19 | Session 13 close | Stack approved; its LCP cost kept and logged as a P5 item (ROADMAP #13); the Contact re-check logged (#14); CLAUDE.md's stale code reference, verified commit and counts updated | `CLAUDE.md`, `claude/START-HERE.md`, `docs/{WORKLOG,ROADMAP,CINEMATIC_SYSTEM}.md` |
| 2026-11-19 | Session 14 | Think · Build · Ship (P3.5) under Stack from the live section's own words, plus one DeveloperOS line in Tay's wording (`8382889`); the #14 hold re-checked (keep, recommended); no glow is a scroll anchor (`d1c53a3`) | `app/lab/work/{tbs.ts,TbsBlock.tsx,page.tsx,work.css}`, `tests/{unit,e2e}/lab-work.*`, `docs/{CINEMATIC_SYSTEM,ROADMAP,WORKLOG}.md`, `claude/START-HERE.md` |
| 2026-11-19 | Session 14 close | Think · Build · Ship approved; the hold kept and its test's comment reworded (`a8062e6`); the glow fix kept; the section's LCP cost kept and added to ROADMAP #13; #14's visible gap case logged for P5; baseline worktree removed, scratch cleaned | `tests/e2e/lab-work.spec.ts` (comment), `CLAUDE.md`, `claude/START-HERE.md`, `docs/{WORKLOG,ROADMAP,CINEMATIC_SYSTEM}.md` |
| 2026-11-19 | Session 15 | Contact (P3.6) ends `/lab/work`, from the live Contact's own words and links (`56e3dea`); `StackFilter.tsx`'s header comment fixed (`bbd9d55`, comment only); #14 re-measured (the tall-screen case shrinks, the end case unchanged); About's repetition logged for P5 (ROADMAP #15) | `app/lab/work/{contact.ts,ContactBlock.tsx,page.tsx,work.css,StackFilter.tsx}`, `tests/{unit,e2e}/lab-work.*`, `docs/{CINEMATIC_SYSTEM,ROADMAP,WORKLOG}.md`, `claude/START-HERE.md` |
| 2026-11-19 | Session 15 close | Contact approved, with its two columns from 1100px (`1369b00`); P3 complete (all six sections approved); Contact's LCP cost kept and added to ROADMAP #13; the hold kept (#14); baseline worktree removed, scratch cleaned | `app/lab/work/work.css`, `tests/{unit,e2e}/lab-work.*`, `CLAUDE.md`, `claude/START-HERE.md`, `docs/{WORKLOG,ROADMAP,CINEMATIC_SYSTEM}.md` |
| 2026-11-19 | Session 16 | The P5/P6 plan (gap audit, the tests the release touches, the backlog, the mechanism), approved by Tay as R1–R15; the S17–S24 plan, S18+S19 and S21+S22 paired; the P4 restore record for the four explainers; the backlog's new #16. Docs only | `docs/{RESEARCH_AND_DECISIONS,ROADMAP,WORKLOG}.md`, `claude/START-HERE.md` |
| 2026-11-19 | Session 17 | `product-plates-final` (`8f0a96a`) on `443a1f9`, pushed. `release/concept-a` cut from `origin/main`: the prototype's 77 untouched paths copied unchanged (`8b77de1`), the 5 state docs merged three ways (`b4fd805`); unit 216/216, Playwright 213/213, `/`'s stylesheets and markup equal `main`'s build (its scripts the same 177 modules in 10 files instead of 9). R12's "still to name" group approved (`2efac00`). CLAUDE.md for the release track (`0a889bf`). Production baseline: Lighthouse mobile median 98, LCP 2,288 ms; first-load JS 182.04 KiB, HTML 160,584 B. #16 measured | `CLAUDE.md`, `claude/START-HERE.md`, `docs/*.md`, the copied paths |
| 2026-11-20 | Sessions 18+19 | `/` composed from the Concept A sections, in the layer: header (R2), hero, Work with "Case study" buttons (R4) and Two more (R5), About ending on the facts (R10), Stack, Think · Build · Ship, Contact, footer; dark only (R3); every live id (R7). `/lab` and the retired Product Plates code deleted (`482d29e`); the dialog back inside `<main>` (`270ab27`). R12's test edits and S17's group, plus 6 test commits Tay approved in-session, each its own commit. Must-pass e2e 70/70 + 6/6, unit 121/121 (the two lab unit files fail at load until S20). Gate: Lighthouse mobile median 100, LCP 1,061 ms (local `main` 93, 3,191 ms); first-load JS 185.00 KiB, HTML 127,970 B. Pushed; Preview READY | `app/`, `components/`, `lib/`, `data/`, `tests/`, `docs/WORKLOG.md`, `claude/START-HERE.md` |
| 2026-11-20 | Sessions 18+19 close | Approved by Tay. ROADMAP #17 logged for S21+S22 (the case study's two axe best-practice findings); #15 and the Work lede marked done; the S18+S19 entry's finding count corrected (three, not four). CLAUDE.md, START-HERE, the memory. The scratch worktree of `443a1f9` removed (long paths deleted by hand), scratch emptied | `CLAUDE.md`, `claude/START-HERE.md`, `docs/{ROADMAP,WORKLOG}.md` |
