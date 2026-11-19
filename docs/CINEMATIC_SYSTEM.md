# Cinematic system (Concept A): tokens and motion language

**Prototype only.** It lives on `proto/hero-a-cinematic` and applies only under `/lab` (D2 reopened by Tay, 2026-11-18).
The branch is never merged. Nothing here touches the live site's paper theme, `app/globals.css`, its contrast floors,
or `/`.

The system was **extracted from the locked hero** (`/lab/hero-a`), value for value. Nothing was invented: the hero is
its first consumer. After the extraction, its computed styles and pixels are unchanged (round 4 in `docs/WORKLOG.md`).

## Where it lives

| File | What it holds |
|---|---|
| `app/lab/_cinematic/cinematic.css` | The tokens (`--cine-*`), the scope chrome, the focus ring, duotone text, the one reveal |
| `app/lab/layout.tsx` | Its only importer, so only `/lab` routes load it |
| `app/lab/hero-a/hero-a.css` | The reference consumer: the hero's own geometry, every shared value read from the layer |
| `app/lab/hero-a/Constellation.tsx` | The reference live element: the loop contract below, in code |
| `app/lab/work/` | The second consumer: the Work slice (below), with no client code of its own |
| `tests/unit/lab-hero-a.test.ts` | Pins the scope, the contrast floors and the token integrity |
| `tests/e2e/lab-hero-a.spec.ts` | Pins the behaviour: budget, axe, no-JS, reduced motion, pause |

`_cinematic` is a private folder (the leading underscore): Next never routes it.

**Scope, twice over.**
- Only the `/lab` layout imports the sheet.
- Every selector needs a `.cine` root, or `:has(.cine)` for the page around it. So the sheet is inert anywhere else,
  even if it outlives a client navigation.

## How a section reuses it

```tsx
// Any page under app/lab/ already has the layer (through app/lab/layout.tsx).
<section className="cine my-section" data-theme="dark">
  <p className="my-section__eyebrow" data-reveal>…</p>
  <h2 className="my-section__title" data-reveal="settle">
    Plain words, then <span className="cine-duotone-text">one whole duotone clause.</span>
  </h2>
  <p className="my-section__lede" data-reveal>…</p>
</section>
```

```css
/* my-section.css: geometry only; every colour, size, step and timing is a token. */
.my-section__eyebrow { --reveal-i: 0; color: var(--cine-cyan); font-size: var(--cine-text-eyebrow); }
.my-section__title   { --reveal-i: 1; font-size: var(--cine-text-display); letter-spacing: var(--cine-tracking-display); }
.my-section__lede    { --reveal-i: 2; color: var(--cine-mist); margin-top: var(--cine-space-5); }
```

- **The root:** `.cine` with `data-theme="dark"`. It sets the field, the inks, `color-scheme`, and the shared names
  (`--bg`, `--fg`, `--accent`), so the site's own components read correctly inside it.
- **Colours and steps:** take them from tokens; never a new hex. A section that needs a value the hero never used should
  get that value from Tay first. Don't invent one.
- **Gradient text:** `.cine-duotone-text` on a whole clause, never on a single word. Large text only (violet's floor is
  3:1). It falls back to solid ink in high contrast and forced colours.
- **The opening:** `data-reveal` on each opening block, with `--reveal-i` in reading order. Use `data-reveal="settle"`
  on the block that will be the largest paint (see Motion language).
- **Don't write utility class names in lab files**, not even in comments, tests or object keys. Tailwind scans `app/`,
  `tests/` and `scripts/`, so a literal one adds a rule to the live page's stylesheet.
  - It happened twice: a test comment (round 4) and an object key named after a shadow utility (round 5).
  - `tests/e2e/lab-work.spec.ts` now pins `/`'s stylesheets to `origin/main`'s bytes, so a leak fails the suite.
- **Docs go in `docs/`**, which Tailwind skips.

## The token set

| Group | Tokens | Values (from the hero) |
|---|---|---|
| Bases | `--cine-abyss`, `--cine-navy` | `#04060d`, `#0a1020` |
| Inks | `--cine-ink`, `--cine-mist`, `--cine-faint` | `#eef2fb` (≥ 12:1), `#acb6c9` (≥ 7:1), `#95a0b6` (≥ 5.4:1) |
| Accents | `--cine-cyan` (+`-hover`), `--cine-violet`, `--cine-status`, `--cine-on-accent` | `#2ee6d6`, `#6cf1e5`, `#9b6bff`; the status dot is the brand cyan |
| Lines | `--cine-hair`, `--cine-edge` (+`-hover`) | ink at 12%, 40% (≥ 3:1), 70% |
| Surfaces | `--cine-sky`, `--cine-vignette`, `--cine-glow-cyan` / `-violet`, `--cine-glass-accent` (+`-edge`), `--cine-glass-ink` (+`-hover`), `--cine-glow-dot`, `--cine-duotone` | the sky gradient; glows at 17% and 20% peak; tinted glass at 6% / 26%; neutral glass at 3% / 7% |
| Type (Geist) | `--cine-text-display` · `-lead` · `-body` · `-eyebrow` · `-small` · `-label` · `-label-sm` | 36→80px · 18→21 · 16 · 15 · 14 · 13 · 12 |
| Weight, leading, tracking | `--cine-weight-*`, `--cine-leading-*`, `--cine-tracking-*` | weights 620 / 650 / 600 / 550 / 500; leading 1.02 / 1.55 / 1.4; tracking −0.04em display, 0.14em wordmark caps |
| Spacing | `--cine-space-1` … `-7`, `--cine-control-h` (+`-sm`), `--cine-target-min` | 4 · 8 · 12 · 16 · 24 · 28 · 36px; controls 52 / 48px; targets ≥ 44px |
| Radius | `--cine-radius-pill` · `-md` · `-sm` | 999px · 10px · 8px |
| Motion | `--cine-reveal-duration` · `-stagger` · `-distance`, `--cine-ease-reveal`, `--cine-ease`, `--cine-dur-hover`, `--cine-field-fade` · `-delay` | 700ms · 70ms · 16px, expo-out, out, 180ms, 1400ms · 200ms (built on the site's M1 D motion tokens) |

The scope also re-binds the site's shared names. It re-tones the site chrome around it: the overscroll colour, a
cyan focus ring on the skip link and the chat launcher, and a dark launcher. High contrast brightens the inks and
edges.

## Motion language

1. **One orchestrated moment.**
   - A section opens with a single staggered rise (`data-reveal`), in reading order, and then holds still. No
     per-element effects, no scroll-triggered entrances, no hover theatre.
   - Motion that answers a person (a hover, a press) is fine and short (`--cine-dur-hover`).
2. **Restraint over spectacle.**
   - At most one live element per screen; on the hero, the field.
   - Its energy stays inside it. The copy stays calm: masked to about 30% behind text.
   - The palette stays the duotone: no RGB wash, no neon.
3. **The largest paint is never hidden.**
   - The block that will be LCP (usually the headline) uses `data-reveal="settle"`: it rises without fading.
   - Text first painted at opacity 0 inside a compositor animation is never reported as LCP. Measured on the hero: no
     LCP at all.
   - Never "fix" this with a near-zero start opacity.
4. **Reduced motion is calm and still, not merely slower.**
   - The OS setting or the site's own switch turns the reveal off: everything is simply there.
   - A live element draws one still frame and never loops. Ambient drift stops and rests at its static position.
5. **Pause when nobody is looking.**
   - A loop runs only while its element is on screen (`IntersectionObserver`) and the tab is visible
     (`visibilitychange`).
   - It caps its draws (about 60 a second; about 30 on touch, narrow or ≤ 4-core devices), and its count adapts to
     measured cost.
   - Ambient motion rides the same loop at a low rate (the glows: 5 Hz). It is not a CSS animation: measured, one cost
     +5.3 pp of phone main thread.
6. **No JavaScript means nothing is missing.**
   - Every word and action is server-rendered HTML.
   - The reveal is CSS, so it runs and ends visible without JS.
   - Live layers are `aria-hidden` and `pointer-events: none`, and the page reads the same without them.
7. **Measure before keeping it.**
   - Compare before and after on the same machine, interleaved (`scripts/lab-hero-a.mjs`).
   - Keep FPS, INP, LCP and CLS flat; first-load JS ≤ 205.7 KiB; axe at 0 violations with motion on and off.

`Constellation.tsx` is the reference implementation of rules 4 and 5.

## The Work slice (`/lab/work`, round 5)

Four product panels: T Poker, Aegis, DeveloperOS, GRAVITY FLOW. In reading order, each gives the name and its one line,
then its status, three tech chips and its links. Beside them is a large real capture on a glass stage, alternating sides
on wide screens and below the words on phones.

**Content: nothing typed fresh.** `app/lab/work/panels.ts` derives every field, and `tests/unit/lab-work.test.ts`
checks each against its source:

| Field | Source |
|---|---|
| One line | the project's `tagline` (`data/projects.ts`), verbatim |
| Status | the interface's status strings, as the live hero reads them. Aegis shows "Runs locally" (its index state would repeat the link). DeveloperOS adds the version its own data states. |
| Chips | the project's `stack`, emphasised entries first, at most three |
| Links | the live product (T Poker's web app), else the public repository (Aegis, DeveloperOS). Each also links to its chapter on the live page. |
| Private repositories | T Poker and GRAVITY FLOW show the "Private repository" label, never a link or a slug |
| Captures and alt text | existing files in `public/work/` through `Pic` (real dimensions, AVIF and WebP), with alt text from `lib/dict.ts` or the project's media |

The DeveloperOS alt text names three file-and-line chips that `components/work/DeveloperOSChapter.tsx` does not export.
The slice keeps a copy, and the test holds it equal.

**The P4 slot.** Each panel holds `<div className="wk__demo" data-demo-slot="<id>" hidden />`, labelled by a comment in
`page.tsx`. A future "try it" demo mounts there.
- Until then the slot stays empty and hidden: no placeholder, no sample data, no "coming soon".
- The tests require all four to be empty, hidden and not rendered.

**Behaviour:**
- **Opening:** one reveal (eyebrow, the title settling, the lede). The panels hold still.
- **Stage elevation:** each stage lifts on `:hover`, `:focus-within` (keyboard focus on any of its links) and `:active`
  (touch): up by `--cine-lift`, with a cyan edge and the `--cine-glow-lift` halo.
  - With reduced motion it never moves; the edge and halo still answer.
  - iOS Safari applies `:active` only when a touch listener exists. A tap there still lifts through the browser's
    emulated hover. Not verified on a device.
- **Captures:** the page's first loads eagerly at high priority; every other capture (15 since session 11) is lazy.
- **Background:** two static glows, no field: the captures are the star.
- **JavaScript:** the page ships no client code of its own.

**Tokens it added** (in the layer, marked "Added by the Work slice"):
- **The site's own values:** `--cine-text-section` (= `--text-chapter`), `--cine-text-name` (= `--text-h2`),
  `--cine-section-y` (= `--section-y`), `--cine-radius-stage` (24px, the site's `--radius-xl`),
  `--cine-radius-device` (28px, `--radius-2xl`), `--cine-radius-window` (12px, `--radius-sm`), and
  `--cine-elevation` (= the dark theme's `--shadow-object`).
- **Two NEW values, for Tay's review:** `--cine-lift` (−4px) and `--cine-glow-lift` (a cyan halo at 30%).

### Galleries and the carousel (round 6)

**Each project's captures** are `PROJECT_GALLERIES` in `data/projects.ts`: image names from `data/images.ts` or
`data/lab-images.ts`, in order.
- It is a separate export, not a field of `projects`, so it reaches no bundle the live page loads. A build-to-build hash
  of every chunk shows only the lab's own chunks changed.
- One entry is a still capture with no carousel chrome; two or more become a carousel.
- Since session 11 all four are carousels:

| Project | Captures, in order | Count |
|---|---|---|
| T Poker | home, live, settle (the final count), podium, stats | 5 |
| Aegis | the alert row, the Incidents board (`hero-aegis`) | 2 |
| DeveloperOS | search, learning, career, dashboard | 4 |
| GRAVITY FLOW | gameplay, boss, gravity run, cosmetics, win | 5 |

- **Left out on Tay's answers (session 11):**
  - T Poker's "final count" is not added twice: `poker-settle` already is `final-count.webp`, re-encoded.
  - DeveloperOS's refusal strip has no reviewed alt text on `main`, and the learning capture already shows it.
  - DeveloperOS's AI-features capture shows the same results as the search capture: the search is a crop of that screen.
- Tay will swap one GRAVITY FLOW capture himself later; the existing two stay as they are.

**To add a capture:**
1. Add a job to `scripts/m10-images.mjs` at the widths of the captures beside it, then run only that job:
   `node scripts/m10-images.mjs <name>`. Named jobs run alone; the other outputs stand.
2. List it in **`data/lab-images.ts`, not `data/images.ts`**.
   - The live About visual (`components/sections/AboutVisual.tsx`) is client code that imports `IMAGES` whole.
   - So one more entry in `data/images.ts` ships in `/`'s first-load JavaScript.
3. Append its name to the project's array.

- Alt text comes from where the site already says it.
  - `mediaAlt(project, file)` in `app/lab/work/panels.ts` takes the project's own `media` entry for that source file:
    its lead image's alt text, or its gallery entry's.
  - The unit test then checks that the encoded capture really is that file, by pixels (a mean difference under 2 of 255).
  - With no such entry, write `{ image, alt }` in the gallery, with text Tay has reviewed. An entry with no alt text
    stops the build.
- **AVIF output depends on the machine.**
  - The same script and sharp 0.34.5 reproduce the committed WebP files byte for byte.
  - They do not reproduce the AVIF files: this Windows machine's encoder build writes them 5–10% larger.
  - The settings are the same; only the platform's aom build differs.

**The carousel** (`app/lab/work/Reel.tsx`, the slice's only client code) is a CSS 3D coverflow:
- The front capture is flat and whole. Its neighbours step aside, turn `--cine-flow-turn`, scale to `--cine-flow-scale`
  and dim under `--cine-flow-dim` of the field. This is perspective on 2D elements: no WebGL, no canvas.
- It follows the WAI-ARIA tabbed carousel pattern. The dots are tabs with a roving tabindex, so one carousel is three
  tab stops: previous, the chosen dot, next.
- Arrows, Home and End move between captures, and focus follows the dot. A sideways swipe works on touch (vertical
  swipes still scroll), and clicking a side capture brings it forward.
- A polite live region announces each change the reader makes. It never moves on its own.
- **No JS:** each project's first capture alone, and no controls.
- **Reduced motion:** a flat slider, one capture at a time, no turn, no movement.
- **Lazy:** a neighbour mounts only after hydration and only one step from the front; every capture but the page's
  first is `loading="lazy"`.
  - At five captures, two of them are never fetched until the reader moves toward them (an e2e test holds this).
- **Every slide keeps its capture's box, mounted or not.**
  - The server hands the island each capture's ratio (`boxes`), and its phone crop's ratio.
  - An empty slide holds that shape with a `::before` spacer, so a track is as tall as its tallest capture from the
    first paint, with or without JS.
  - Without it, Aegis's track grows from the alert row (89px) to the board (281px) at hydration: CLS 0.064 when the
    page opens there with slow scripts (measured, red/green).
  - Within a pixel: a loaded smaller encode keeps its own whole-pixel size (`hero-aegis-600` is 600 × 337), 0.27px
    under the reserved box.
- **Window carousels** (Aegis, DeveloperOS): the front window is 80% of the stage (86% below 640px), so its neighbours
  show either side. The same turn, scale and dim as the phones.
- **The narrowest phones:** five dots and two arrows are seven 44px targets (324px).
  - Below 390px the stage is narrower than that, so the dots take their own row under the capture and the arrows sit
    below them.
  - Focus still runs previous, the chosen dot, next.
- The server renders every `<picture>` (`Shot.tsx`) and hands them in. The island imports no data and no image table,
  and it draws its own arrow.
  - Both choices are measured. Importing the image table, or the site's `ArrowLeftIcon`, into client code changed
    `/`'s first-load chunks: Turbopack re-cut one, and tree-shaking kept a once server-only icon.

**Phone proportions:**
- A phone capture is capped by the screen's width *and* height: `min(190px, 48vw, 44svh × 0.46)`, at most about 45% of
  the screen tall.
- The stage and panel spacing tighten.
- Aegis and DeveloperOS swap in the live chapters' phone crops below 640px. Each crop's own ratio reserves its box, so
  nothing shifts (an e2e test holds every pending capture's height).

**Tokens it added:** `--cine-dur-move` (= the site's `--dur-slow`), plus three NEW values for Tay's review:
`--cine-flow-turn` 38deg, `--cine-flow-scale` 0.78, `--cine-flow-dim` 0.55.

Session 11 added no token. Its new values are the slice's own geometry in `work.css`: the window slide's 80% / 86%, and
the two-row controls below 390px.
