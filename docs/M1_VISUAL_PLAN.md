# M1 — Visual plan: Product Plates, lit

> **Status (2026-11-18, session 7 close): the M1 core, A–E, is live. Only F (optional) remains; Tay decides it
> after previewing A–E live. Geist kept.**
> - A, C, D are live (PR #8).
> - B is live (PR #11), with two deviations from §8–§10: no plate lift, and no key on the chapter plates' top edge
>   (`docs/WORKLOG.md` session 6).
> - E, plus `.tbs__word` on the h3 tier, is live (PR #12, `81cf15d`; `docs/WORKLOG.md` session 7).
>
> Implementation notes for A/C/D are in PR #8's description and `docs/WORKLOG.md` session 5.
>
> It answers the M1
> acceptance criteria in `docs/ROADMAP.md`, under D1 (evolve Product Plates; calm/premium; restrained
> cyan/violet) and D2 (no 3D now; the 3D-guard tests and the JS budget are not touched). Every move below
> is CSS and tokens only: **zero new JavaScript, zero new dependencies, no new font files.**
>
> How to review: §4 lists six moves, **A–F**. Each one can be approved or declined on its own. §11 lists
> the tests each move would touch.

---

## 1. Mood statement

**The work, photographed.** Product Plates stays as it is: paper is the page, and each product sits on its
own plate. M1 adds the one thing a product photograph has and this page lacks: a single, consistent
**studio light**. Every plate and every object is lit the same way, by a soft key light from above and a
cool cyan rim along one edge. **Iris**, a violet-blue, becomes the only colour you can touch. Nothing glows,
nothing floats, and nothing counts things that weren't counted.

One rule carries the accents: **iris is what you can touch; cyan is the light the work sits in.** Violet
never decorates, and cyan never marks a link.

## 2. Moodboard direction

No reference images are committed. `reference-01..04` don't exist, and the README's PNG is AI-generated (see
N1). The board is therefore described, and the only pictures used are the site's own captures.

| Reference | Take | Leave |
|---|---|---|
| The live site (own captures, 1440 and 390, both themes, 2026-11-18) | Hero composition, plates as navigation, real captures, tone scopes | The generic lower half (§3) |
| Reference README (D1) | "The product-photograph feeling — an object staged deliberately"; matte black, brushed aluminium | RGB/LED wash, holographic cube, circuit mat, neon strips, fabricated stats, AI artefacts |
| Apple product pages | One light source across every object; generous empty field | Scroll-pinned film sequences |
| Linear | Violet-blue interaction on calm surfaces; restrained heading weights | Gradient hero glows |
| Raycast | A hairline highlight along the edge of a dark object (the rim) | Glassmorphism stacks |
| Stripe | Editorial rhythm with clear heading tiers | Animated gradient meshes |
| Vercel | Paper and ink; Geist | — |

**Materials, translated without textures:**
- matte black becomes the ink and the dark plates (and the desk plate, move F);
- brushed aluminium becomes the cool paper `#f3f4f6` and Aegis's steel, both already in place;
- walnut and oak are **not rendered**: no fake wood. The page's only warm note stays T Poker's gold `#d8b25c`.

## 3. What the audit of the live site shows

**Keep (it works):**
- The hero: a headline on paper, then four plates that double as navigation, each with a real capture
  (`components/sections/Hero.tsx`).
- Plates as tone scopes, so shared components re-ink on any plate (`app/globals.css:174-194`).
- One interaction colour (`app/globals.css`, rule 1 in the header) and a single focus treatment
  (`:focus-visible`, solid accent).
- Static seams between surfaces; no scroll library; Framer Motion only in lazy panels.

**Evolve (evidence):**
1. **The interaction colour is a stock cobalt** (`--accent: #1a4fe0`). It belongs to no plate and reads as
   a default link blue. D1 asks for violet/cyan.
2. **The plates are flat cut-outs.** Each sits on its own colour, but nothing lights them, so the "staged
   object" feeling depends entirely on the captures.
3. **The paper-section headings are inconsistent and as loud as the products.** Chapter titles, About and
   Contact use `--text-h2` (36→64px); Stack and Think/Build/Ship use their own clamp (32→56px,
   `stack.css:6`, `tbs.css:3`); "Two more" uses another (28→40px, `work.css:12`). The lower half shouts at
   chapter volume with three different voices.
4. **The muted second line** in the About and Contact titles (`about.css:5`, `contact.css:4`, `--fg-subtle`
   on the second span) reads as a template treatment.
5. **After GRAVITY FLOW the plate language stops.** "Two more", About, Stack, Think/Build/Ship and Contact are
   plain paper.

## 4. The six moves

| Move | What | Where | Risk |
|---|---|---|---|
| **A. Iris** | `--accent` cobalt becomes iris (violet-blue) in every theme, plate and contrast mode | tokens only | Low. All floors pass (§6). Two e2e assertions pin the old RGB (§11) |
| **B. Studio light** | Two new tokens: `--light-key` (top-edge highlight) and `--light-rim` (cyan right-edge rim). Applied to the hero tiles, the chapter plates, and device/window objects | `globals.css`, `hero.css`, chapter CSS | Low. Decorative inset shadows; no images animate |
| **C. Type tiers** | Two heading tiers: `--text-chapter` (the four products, unchanged size) and `--text-h2` (every paper section, 30→42px); lead and h3 one step up | tokens, 6 CSS rules | Low. Fewer sizes than today |
| **D. Motion tokens** | `--dur-fast`, `--dur-light`, `--stagger`; chrome literals move onto them | tokens | None |
| **E. Lower half** | "Two more" becomes two small paper plates under the same light; the muted second title line is retired | `work.css`, `about.css`, `contact.css` | Low |
| **F. Desk plate** *(optional)* | Contact sits on a matte-black "desk" plate, a fifth tone scope that closes the page the way the plates open it | `globals.css`, `Contact.tsx`, `contact.css` | Medium. A new tone scope needs a new (additive) floor test |

Recommendation: approve **A–E** as the core of M1; F as a separate yes/no after seeing A–E on a Preview.

## 5. Token diff against `app/globals.css` (proposed, not applied)

```diff
 :root,
 [data-theme="light"] {
   /* ── Accent (interaction) ── */
-  --accent: #1a4fe0;
-  --accent-hover: #1442c2;
-  --accent-solid: #1a4fe0;
-  --accent-solid-hover: #1442c2;
-  --accent-soft: rgba(26, 79, 224, 0.10);
-  --accent-line: rgba(26, 79, 224, 0.30);
-  --accent-ring: rgba(26, 79, 224, 0.55);
+  --accent: #4a3fe0;              /* iris: 6.2:1 on paper, 6.8:1 on white, 5.6:1 on Aegis steel */
+  --accent-hover: #3f35c9;
+  --accent-solid: #4a3fe0;        /* white 6.8:1 */
+  --accent-solid-hover: #3f35c9;  /* white 8.2:1 */
+  --accent-soft: rgba(74, 63, 224, 0.10);
+  --accent-line: rgba(74, 63, 224, 0.30);
+  --accent-ring: rgba(74, 63, 224, 0.55);
+
+  /* ── Studio light (B) ── one light for every plate and object: a key from above, a cool rim on the right
+     edge. Never text, never interaction. Composed in each rule, not in a token: a custom property resolves
+     var() where it is declared, so a composed token would carry :root's light onto the dark plates. */
+  --light-key: rgba(255, 255, 255, 0.80);
+  --light-rim: rgba(8, 145, 178, 0.18);

   /* ── Type ── */
-  --text-h2: clamp(2.25rem, 1.5rem + 3vw, 4rem);
-  --text-h3: clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem);
-  --text-lead: clamp(1.0625rem, 1rem + 0.3vw, 1.1875rem);
+  --text-chapter: clamp(2.25rem, 1.5rem + 3vw, 4rem);       /* 36→64: the four products (today's h2) */
+  --text-h2: clamp(1.875rem, 1.45rem + 1.7vw, 2.625rem);     /* 30→42: every paper section */
+  --text-h3: clamp(1.25rem, 1.1rem + 0.7vw, 1.625rem);       /* 20→26 */
+  --text-lead: clamp(1.125rem, 1.03rem + 0.4vw, 1.3125rem);  /* 18→21 */

   /* ── Motion ── */
+  --dur-fast: 180ms;     /* = lib/motion.ts DUR.fast; the chrome's literal 180/200ms move onto it */
+  --dur-light: 700ms;    /* the hero's lights-up, once */
+  --stagger: 70ms;
 }

 [data-theme="dark"] {
-  --accent: #5b9cff;
-  --accent-hover: #7fb0ff;
-  --accent-solid: #2563eb;        /* white 5.2:1 */
-  --accent-solid-hover: #1d4fd0;
-  --accent-soft: rgba(91, 156, 255, 0.13);
-  --accent-line: rgba(91, 156, 255, 0.34);
-  --accent-ring: rgba(91, 156, 255, 0.6);
+  --accent: #a5a8ff;              /* 9.0:1 on ink, 8.2:1 raised */
+  --accent-hover: #b1b4ff;
+  --accent-solid: #4f46e5;        /* white 6.3:1 */
+  --accent-solid-hover: #4338ca;  /* white 7.9:1 */
+  --accent-soft: rgba(165, 168, 255, 0.13);
+  --accent-line: rgba(165, 168, 255, 0.34);
+  --accent-ring: rgba(165, 168, 255, 0.6);
+  --light-key: rgba(255, 255, 255, 0.09);
+  --light-rim: rgba(103, 232, 249, 0.22);
 }

 /* plates */
-  .plate[data-plate="poker"] … --accent: #8fb4ff;
+  .plate[data-plate="poker"] … --accent: #b1b4ff;    /* 9.6:1 on navy */
-  .plate[data-plate="dos"]   … --accent: #8fb4ff;
+  .plate[data-plate="dos"]   … --accent: #b1b4ff;    /* 9.3:1 on violet; distinct from --cite #7fb0ff */
-  .plate[data-plate="gf"]    … --accent: #8fb4ff;
+  .plate[data-plate="gf"]    … --accent: #b1b4ff;    /* 9.3:1 on teal */
-  [data-theme="light"] .plate[data-plate="aegis"] … --accent: #1a4fe0;
+  [data-theme="light"] .plate[data-plate="aegis"] … --accent: #4a3fe0;   /* 5.6:1 on steel */
-  [data-theme="dark"]  .plate[data-plate="aegis"] … --accent: #6aa5ff;
+  [data-theme="dark"]  .plate[data-plate="aegis"] … --accent: #b1b4ff;   /* 8.2:1 on blue steel */

 /* high contrast */
-  --accent: #1238b0;   (light)
+  --accent: #2a1fa8;   /* 10.3:1 on paper */
-  --accent: #a9c6ff;   (dark)
+  --accent: #c9cbff;   /* 12.6:1 on ink, 11.6:1 on violet */

+/* F only: the desk plate, a fifth tone scope (data-theme="dark", like T Poker / DeveloperOS / GRAVITY FLOW). */
+  --plate-desk: #101114;
+  .plate[data-plate="desk"][data-plate] { --bg: var(--plate-desk); --fg: #f2f4f8; --fg-muted: #a3abb9;
+    --fg-subtle: #8f98a8; --accent: #b1b4ff; }
```

**Unchanged:** paper `#f3f4f6`, ink `#0c0d10`, all four plate hues, gold, alert, cite, flow, status
colours, borders, elevation, radii, rhythm (`--stage`, `--pad`, `--section-y`), the seams, Geist.

## 6. Contrast (computed with the exact formula in `tests/unit/tokens.test.ts`)

| Pair | Floor | Today | Proposed |
|---|---|---|---|
| accent on paper `#f3f4f6` | 4.5 | 5.89 (`#1a4fe0`) | **6.20** (`#4a3fe0`) |
| accent on Aegis steel `#e6e9ed` | 4.5 | 5.32 | **5.60** |
| white on accent-solid / hover (light) | 4.5 | 6.48 / 8.11 | **6.82 / 8.19** |
| accent on ink `#0b0c0f` / raised `#16181d` | 4.5 | 7.12 / 6.46 (`#5b9cff`) | **8.98 / 8.16** (`#a5a8ff`) |
| white on accent-solid / hover (dark) | 4.5 | 5.17 / 6.81 | **6.29 / 7.90** |
| plate accent on navy / violet / teal | 4.5 | 8.98 / 8.72 / 8.73 (`#8fb4ff`) | **9.60 / 9.32 / 9.33** (`#b1b4ff`) |
| plate accent on Aegis dark `#1c232d` | 4.5 | 6.36 (`#6aa5ff`) | **8.17** |
| HC accent: light on paper / dark on ink | — (not tested) | 8.60 / 11.37 | **10.26 / 12.55** |
| F: desk `#101114`: fg / muted / subtle / accent | 15 / 7 / 5.4 / 4.5 | — | **17.15 / 8.17 / 6.50 / 9.75** |

Every proposed pair clears its floor with margin; no floor is lowered. The cyan rim is decorative (no text,
no information), so it has no contrast requirement, and it never carries meaning.

## 7. Typography

**Typeface: keep Geist** (already self-hosted through `next/font`, zero new bytes; Vercel is one of the
references). M1 changes how it is set, not which face. A second display face would add font bytes and a
second voice for little gain under "evolve".

A **major-third (1.25) scale at 1440px**. The existing display (80) and chapter (64) sizes already sit on it.

| Token | Phone → desktop | Line height | Weight / tracking | Used by |
|---|---|---|---|---|
| `--text-display` | 40 → 80 (unchanged) | 0.98 | 620 / −0.04em | Hero headline |
| `--text-chapter` | 36 → 64 (= today's h2) | 1.0 | 620 / −0.04em | `.chapter__title`, case-study title |
| `--text-h2` | 30 → 42 (new value) | 1.05 | 600 / −0.03em | About, Stack, Think/Build/Ship, Two more, Contact |
| `--text-h3` | 20 → 26 | 1.2 | 600 / −0.02em | Group titles, case-study blocks |
| `--text-lead` | 18 → 21 | 1.45 | 400 | Hero lead, chapter ledes |
| body | 17 (unchanged) | 1.55 | 400 | Text |
| small / label | 15 / 13 (unchanged) | 1.5 / 1.4 | 500 for labels | Captions, tile caps |

Rules: sentence case everywhere (already); no all-caps labels; measure ≤ 68ch for body and ≤ 34em for leads;
tabular figures for every number (`.tnum`). The second title line takes `--fg` like the first, so the line
break alone carries the rhythm (move E).

## 8. Layouts

### Hero, desktop 1440 (composition unchanged; B adds the light)
```
 Tay Shofer             Work  About  Stack  Contact          a11y  theme  [Get in touch]

 I build software                                     Mobile apps, security systems,
 end to end.                                          developer tools, and games—
                                                      from interface to infrastructure.
                                                      [See the work]   GitHub (iris)
 ┌───────────────────┐┌──────────────┐┌──────────────┐┌───────────┐
 │ ▔▔▔ key ▔▔▔▔▔▔▔▔▔▔▕││ ▔▔▔▔▔▔▔▔▔▔▔▔▕││ ▔▔▔▔▔▔▔▔▔▔▔▔▕││ ▔▔▔▔▔▔▔▔▔▕│  ▔ key: 1px top highlight
 │ T Poker           ▕││ Aegis        ▕││ DeveloperOS  ▕││ GRAVITY   ▕│  ▕ rim: 1px cyan, right edge
 │   [two phones]    ▕││  [console]   ▕││  [window]    ▕││  [phone]  ▕│
 └───────────────────┘└──────────────┘└──────────────┘└───────────┘
   plates run to the hero's bottom edge and meet the T Poker chapter (unchanged)
```

### Hero, phone 390 (unchanged 2×2; same light)
```
 Tay Shofer                  theme  menu
 I build software
 end to end.
 Mobile apps, security systems, …
 [See the work]   GitHub
 ┌──────────┐┌──────────┐
 │ T Poker ▕││ Aegis   ▕│
 ├──────────┤├──────────┤
 │ DevOS   ▕││ GRAVITY ▕│
 └──────────┘└──────────┘
```

### Product chapters (compositions unchanged)
The four chapters keep their bespoke layouts (stepper, trace, flow, levels), which are pinned by e2e tests.
They gain: the chapter title on `--text-chapter`; the studio light on the plate's top edge; and the same
key/rim on device and window objects (`--shadow-object` stays; the inset highlight is added beside it).
Links on the plates turn iris.

### Lower half, desktop (E; F optional)
```
 Two more                                                   ← --text-h2 (was 28→40)
 ┌─ paper plate, lit ──────────────────┐ ┌─ paper plate, lit ──────────────────┐
 │ Job Assistant                       │ │ Orders & Delivery                   │
 │ [context line, unchanged]           │ │ [context line, unchanged]           │
 │ [summary, unchanged]                │ │ [summary, unchanged]                │
 │ [actions, unchanged]                │ │ [actions, unchanged]                │
 └─────────────────────────────────────┘ └─────────────────────────────────────┘
 All copy stays exactly as in data/; only the surface changes.

 Engineer by training.                      ← --text-h2, both lines ink
 Builder by nature.                         [About body, unchanged]
 [product collage, unchanged]

 Tools behind the work.                     ← --text-h2 (was 32→56); filter chip selected = iris
 Think. Build. Ship.                        ← --text-h2 (was 32→56)

 ┌─ F: desk plate, matte black, lit ──────────────────────────────────────────────┐
 │ Let's build something                         [Email me]  (iris solid)         │
 │ people use.                                   LinkedIn    GitHub               │
 │ I'm looking for a software engineering …      Download résumé (PDF)            │
 └────────────────────────────────────────────────────────────────────────────────┘
 Footer (paper, unchanged)
```
Without F, Contact stays on raised paper and only the heading tier and the title colour change.

### Lower half, phone 390
Two more: the plates stack, full width inside the gutter. Contact (F): the desk plate runs full width inside
the gutter, with actions stacked (Email first). Nothing new scrolls horizontally; `page.spec.ts`'s overflow
checks apply unchanged.

## 9. Hero storyboard (frame by frame)

| Frame | Time | What the visitor sees |
|---|---|---|
| F0 | first paint | The final layout: headline, lead, both actions, four plates with their captures, all **fully visible**. The light layer starts at opacity 0. **The LCP image is painted here and never animates.** |
| F1 | 0 ms | T Poker's light comes up: key highlight and rim fade 0 → 1 over `--dur-light` (700 ms, `--ease-out-expo`). |
| F2 | +70 / +140 / +210 ms | Aegis, then DeveloperOS, then GRAVITY FLOW, in reading order (row-major in the phone's 2×2). |
| F3 | ≈ 910 ms | Settled. Nothing else moves. The existing chat launcher entrance (200 ms delay, 360 ms) is unchanged. |
| Hover / focus | on input | The plate lifts 2px; its key highlight strengthens; existing focus ring. 240 ms. |
| Reduced motion (OS or the site toggle) | — | F0 = F3: the light is on at first paint; no lift, state change only. |
| No JavaScript | — | Identical: it is all CSS. |

The light layer is a pseudo-element **over** the plate, so the captures (Aegis's window on wide screens,
DeveloperOS's on phones, today's LCP candidates per `Hero.tsx`) are painted at F0 and are never faded or
moved. Lab LCP (2.9 s, `next.config.ts`) is not changed by M1. Improving it is backlog #7.

## 10. Motion spec

One orchestrated moment (the hero lights up). Everything else answers the visitor.

| Movement | Trigger | Property / timing | Reduced-motion replacement | Implementation |
|---|---|---|---|---|
| Hero lights up | load, once | opacity of the light pseudo-element, 700 ms, `--stagger` 70 ms | Light on at first paint | CSS keyframes |
| Plate lift | hover (`pointer: fine`), focus | `translateY(-2px)` + key highlight, 240 ms | Highlight only, no movement | CSS transition |
| Link underline (iris) | hover, focus | underline offset/thickness, `--dur-fast` | Instant | CSS transition |
| Nav underline, header hairline, theme glyph, menu sheet | existing | existing | existing (already gated in `globals.css`) | unchanged |
| About collage settle/drift | scroll (existing `animation-timeline: view()`) | existing | existing | unchanged |
| Chat, accessibility and case-study panels | open/close (existing) | `lib/motion.ts` DUR | existing | Framer Motion, lazy, unchanged |
| Section reveals on scroll | **none, deliberately** | — | — | Content is never hidden waiting for scroll |

Rules: transform and opacity only; no infinite animation anywhere (so nothing has to pause off-screen or in a
hidden tab); no new animation library; Framer Motion stays off first load (`budget.spec.ts:38`).

## 11. Budgets, guards and the tests each move touches

- **Untouched:** first-load JS ≤ 205.7 KiB and HTML ≤ 568 KB (`budget.spec.ts:7`); the
  `three`/`lenis`/WebGL/`<canvas>` guards (`dead-code.test.ts`, `budget.spec.ts:47`, `page.spec.ts`); the
  institution guard; English-only. All moves are CSS; JS bytes are unchanged by construction.
- **A** changes two e2e assertions that pin today's focus-ring RGB:
  `tests/e2e/chrome.spec.ts:271` (`rgb(26, 79, 224)`) and `:273` (`rgb(143, 180, 255)`). They would become
  the iris values (`rgb(74, 63, 224)`, `rgb(177, 180, 255)`). The test's intent, "the focus ring is the solid
  accent", is unchanged; its title wording ("ink-blue … light blue") would be updated too. **Needs your
  explicit OK**, per CLAUDE.md.
- **A** keeps every `tokens.test.ts` floor (§6). The test reads hex values from the blocks, so it validates
  the new values automatically.
- **F** needs one **additive** case in `tokens.test.ts` (the desk plate keeps the page's floors). Nothing is
  lowered.
- **B–E**: no test change expected. Verified at implementation by the full suite: typecheck, lint, unit,
  build, Playwright (both themes, axe, overflow, 12px floor).

## 12. Implementation sequence (only after approval; M3/M4 work)

1. **PR 1: A + C + D** (tokens and heading tiers). The smallest visible change, easy to judge on a Preview.
2. **PR 2: B** (studio light and the hero storyboard).
3. **PR 3: E** (lower half), then **F** if approved.

Each PR: a branch from `main`, the full suite, a Preview, and screenshots at 1440/390 in both themes for your
review before merge.

## 13. Your decisions

Tay, 2026-11-18:
- [x] **A** Iris replaces cobalt (including the two `chrome.spec.ts` assertions). *Live, PR #8.*
- [x] **B** Studio light (key + cyan rim) and the hero lights-up moment. *Live, PR #11.*
- [x] **C** Two heading tiers (chapters 64, paper sections 42). *Live, PR #8.*
- [x] **D** Motion tokens. *Live, PR #8.*
- [x] **E** Lower half: "Two more" as lit paper plates; second title line in ink. *Live, PR #12.*
- [ ] **F** *(optional)* Contact on a matte-black desk plate. *Deferred until Tay previews A–E.*
- [x] Keep Geist (no display-face study)
