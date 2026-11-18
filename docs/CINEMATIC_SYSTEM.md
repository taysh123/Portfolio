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
- **Captures:** the first loads eagerly at high priority, the other three lazily.
- **Background:** two static glows, no field: the captures are the star.
- **JavaScript:** the page ships no client code of its own.

**Tokens it added** (in the layer, marked "Added by the Work slice"):
- **The site's own values:** `--cine-text-section` (= `--text-chapter`), `--cine-text-name` (= `--text-h2`),
  `--cine-section-y` (= `--section-y`), `--cine-radius-stage` (24px, the site's `--radius-xl`),
  `--cine-radius-device` (28px, `--radius-2xl`), `--cine-radius-window` (12px, `--radius-sm`), and
  `--cine-elevation` (= the dark theme's `--shadow-object`).
- **Two NEW values, for Tay's review:** `--cine-lift` (−4px) and `--cine-glow-lift` (a cyan halo at 30%).
