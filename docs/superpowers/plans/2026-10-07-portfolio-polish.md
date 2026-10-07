# Portfolio polish: audit and implementation plan (2026-10-07)

**Baseline.** Production at `main` d66277e: the portfolio with no cinematic entrance. The entrance is frozen on `feature/premium-portfolio-redesign-1mqmgf`, tagged locally as `entrance-v3-frozen-2026-10-07`. Nothing here touches it.

**Branch and release flow.** Work happens on `feature/portfolio-polish`, then goes to a Vercel Preview, then to user review. It merges to `main` only after user approval.

**Rules.**
- Keep the design language: dark stage, Inter display type, mono labels, a single blue accent, and the four project worlds.
- No cinematic opening, no scroll hijacking, no new gradients or glass.
- No claim that isn't in `data/projects.ts`, which was checked against each repository.

## 1. Audit

Method:
- `next build` and `next start`, then headless Chromium at 1440×900, 1280×720, 768×1024, 390×844, 360×780 and 375×667.
- At each size: the whole page was walked, and console warnings and errors, failed requests, horizontal overflow, targets under 44 px, images without `alt` and the heading outline were recorded.
- Viewport captures at each flagship scene's midpoint.
- The linked repositories were checked through git, and the tokens through their contrast notes.

### Already solid (keep)

| Area | Finding |
|---|---|
| Console and network | 0 errors, 0 warnings and 0 failed requests at all six sizes |
| Overflow | none at any size: `scrollWidth` equals the viewport everywhere. The DeveloperOS windows bleed but are clipped by `.flagship { overflow-x: clip }` |
| Images | every `<img>` has `alt`; project media totals 2.1 MB of pre-encoded WebP |
| Headings | one `h1`; `h2` per section and `h3` per project and card, in order |
| Touch targets | none under 44 px on phones or tablet. The desktop nav icon buttons are 36 px, which passes WCAG 2.2 AA (24 px) |
| Contrast | `--fg-subtle` is 5.4:1 dark (5.5:1 on raised), and the light-theme tokens are AA as documented in `globals.css` |
| SEO | title, description, canonical, OG and Twitter tags, a 1200×630 OG image, robots (disallow `/api/`), sitemap and JSON-LD all present |
| Links | Aegis, DeveloperOS, Gravity-Game, job-assistant and orders-delivery-management-system are public repositories. T Poker shows "Private repository" with no URL. The App Store, Google Play, app.tpoker.app and LinkedIn links can't be reached from this container; they were verified in the last release pass and get re-checked on the Preview |
| Truthfulness | 7,061 = T Poker 6,210 + DeveloperOS 363 + GRAVITY FLOW 221 + Job Assistant 162 + Aegis 105, as `data/skills.ts` derives it. It is consistent everywhere it appears (Stack and the OG image) |

### Problems, by priority

| # | Area | Problem | Evidence |
|---|---|---|---|
| H1 | Hero | It says *who* but not *what*. The lead ("polished products, real-time systems and production-ready software") is generic, and nothing above the fold names a project or a proof point | desktop and 390 folds: the lower 40 % of the desktop fold is empty |
| H2 | Hero | It gives no "where to explore" beyond one button. A recruiter can't see that one app is live in two stores without scrolling a full screen | — |
| H3 | Hero | The horizon arc's rim line cuts through the CTA row (desktop) and the GitHub button (phones), where it reads as a dome behind the buttons | folds |
| H4 | Hero and Contact | The same arc crosses Contact's channel buttons on phones | 390 contact |
| P1 | Projects | Metric values sit at different heights within a row because labels wrap to one or two lines: Aegis "8" vs "105", DeveloperOS "34", GRAVITY FLOW "7" | 1440 scene captures |
| P2 | Projects, mobile | The world (the product picture) comes after about 1.5 screens of copy, metrics, tags and actions, so on a phone each project is a wall of text before you see it | 390 sheet |
| P3 | Projects | The Aegis alert cards run past the viewport's right edge at 1440 and cut their text mid-word | 1440 Aegis |
| P4 | Projects | "v1.0.0-rc · Android-only" appears twice in GRAVITY FLOW: the status note and the world caption | 1440 GRAVITY FLOW |
| P5 | Projects | The DeveloperOS world's four screenshots are illegible at both sizes. The story says "file and line citations", but the picture can't show one | 1440 and 390 DeveloperOS |
| P6 | Projects | "What I built" is implicit; the copy never says these are solo, end-to-end projects. Wording must stay within the facts. | — |
| M1 | Mobile | Page copy shows through the fixed navbar, whose background is 82 % opaque | 390 sheet, frames 3–5 |
| M2 | Mobile | The gap between the "Selected work" intro and project 01 is about a full screen tall | 390 work |
| M3 | Mobile | The pinned "Think. Build. Ship." words sit flush under the navbar at mid-scene | 390 approach |
| S1 | SEO | The keywords say "software engineer" and "junior software engineer", while the role everywhere else is "Software Developer". The sitemap `lastmod` is fixed at 2026-09-26 | page head |
| A1 | A11y | The flagship "Case study" triggers are hand-styled `<button>`s, not the shared `Button`, so their focus and hover states can drift from the rest | `FlagshipScene.tsx`, `MoreWork.tsx` |

## 2. Plan (milestones, each ending in a Preview)

Every milestone runs `typecheck`, `lint`, `vitest`, the full Playwright suite, captures at 1440, 1280, 768, 390, 360 and 375, and a Vercel Preview. Tests are only added or tightened, never weakened.

### M1: Hero and chrome (H1–H4, M1)
- Keep the headline. Rewrite the lead from facts already in `data/projects.ts`: what I build and who for, in one sentence.
- Add a restrained **project index** under the CTAs. It lists the four flagships as a quiet row (name plus one status: *Live on iOS & Android*, *Open source*, *Released*, *Release candidate*), each a link to its scene. On phones it is a two-column list. It uses no new colours and only a hover underline.
- Add one proof line from existing data: "7,061 passing tests across five projects".
- Move the horizon arc below the CTA row on every viewport (arc top ≥ the CTA row's bottom + 24 px). Apply the same rule to Contact on phones.
- Raise the navbar background from 82 % to about 92 % opaque so copy doesn't show through. The blur stays.
- Tests: hero content (the index links resolve to the scene ids, and the proof value equals the Stack lead) and an e2e geometry check that the arc stays clear of the CTAs at the six sizes.

### M2: Project presentation (P1–P6)
- Align the metrics: values top-aligned and labels below, so values share one line regardless of how labels wrap.
- Mobile order: under 1024 px, show the world first, then the copy, so every project opens on its picture.
- Aegis: keep the overlay alert rows inside the world box.
- GRAVITY FLOW: drop the duplicate caption.
- DeveloperOS: replace the 2×2 thumbnail grid with one legible capture showing a cited answer. Use an existing screenshot cropped to the citation, with the 2×2 kept for wide screens if it stays legible.
- Add a short "What I built" line per flagship from facts in `projects.ts`: solo, end-to-end; nothing new claimed.
- Tests: the `work.test.ts` number guard still passes, plus an e2e check that values in a metric row share a top within 2 px.

### M3: Microinteractions and accessibility (A1, part of priority 7)
- Route the Case study triggers through the shared `Button` styles.
- Give cards and links one hover rule: border to `--line-strong`, a 150 ms colour change, no transform.
- Keyboard pass: Tab order, visible focus on every control, the palette and focus traps, the skip link.
- Reduced motion: no transform anywhere.
- Tests: extend `a11y.spec.ts` with the new hero index and button parity.

### M4: Mobile pass (M2, M3)
- Collapse the "Selected work" gap.
- Give the pinned Think · Build · Ship words a nav-height inset.
- Check landscape phone (844×390) and a narrow Android (360×640).

### M5: Performance
- Run the existing budget spec, then measure LCP, CLS and JS weight on a mobile profile.
- Below-fold world images get `loading="lazy"` and correct `sizes`.
- Confirm no unused client components ship. The entrance code is already gone from `main`.

### M6: Truthfulness and SEO (S1, priority 6)
- Align the keywords with "Software Developer" and generate the sitemap `lastmod` at build time.
- Re-check every number in the hero, project and Stack copy against `projects.ts`.
- On the Preview, fetch the App Store, Google Play, app.tpoker.app and LinkedIn links.
- Keep 7,061 only while it sums from the per-project counts. A unit test asserts that it does.

### M7: Final visual polish
- Do a light-theme pass on About, Stack and More Work at all sizes.
- Do a spacing-rhythm pass (section paddings on one scale).
- Write a final before/after contact sheet.

## 3. Out of scope

- Entrance work of any kind, Blender, renders, and the V2 branch.
- A visual redesign beyond the items above.
- New claims, new projects, and changes to the T Poker repository's visibility.

## 4. Progress

- **M1** (666bf28): hero lead, flagship index, derived proof line, arcs clear of controls, opaque scrolled nav.
- **M2a** (62a6e20): the flagship chapters:
  - chapter numbers as anchors and stat-tile metrics;
  - four compositions (product, system, evidence, orbit);
  - "Built solo" lines;
  - phone order of number → title → visual → copy.

  It also fixes P1–P6 and makes a Case study press before hydration replay instead of being lost.
- **M2b**: the rhythm around the chapters:
  - the Work opener with chapter contents, and no blank screen before 01 on phones;
  - About as an editorial chapter;
  - Stack as a range matrix;
  - Think · Build · Ship at signature scale, clear of the nav;
  - Contact as a four-channel action set.

  It also makes Ctrl+K before hydration replay instead of being lost.
- **Performance vs `main`** (1440 and 390):
  - first-load JS unchanged at 219 KB;
  - images after a full scroll 176 → 166 KB on desktop and 184 → 155 KB on phones;
  - CLS stays at 0.
