# Cinematic system (Concept A): tokens and motion language

**Live on `/` since 2026-11-20** (PR #21, merge `3a98d22`; S24 verified production). Tay reopened D1 for Concept A
(2026-11-18) and approved it replacing the live `/` (session 16, R1–R15). D2 is still not reopened, so no WebGL: the
field is a 2D canvas, and the carousels are CSS perspective on 2D elements (corrected at the session 11 close: earlier
docs and code comments said "D2 reopened").

**How to read this file.**
- "Where it lives" below is the live map.
- The sections after it were written while the system was a prototype under `/lab` on `proto/hero-a-cinematic`.
  That branch stays frozen as the record (draft PR #18, never merged).
- Read their `app/lab/…` paths through the map at the end of this section. Each round's measurements stay as they were
  taken.

The system was **extracted from the locked hero** (`/lab/hero-a` then; the hero of `/` now), value for value. Nothing
was invented: the hero is its first consumer. After the extraction, its computed styles and pixels are unchanged (round
4 in `docs/WORKLOG.md`).

## Where it lives

| File | What it holds |
|---|---|
| `app/cinematic.css` | The tokens (`--cine-*`), the scope chrome, the focus ring, duotone text, the one reveal |
| `app/page.tsx` | Its only importer, so only `/` loads it (`/privacy`, the 404 and the error page never do) |
| `components/sections/hero.css`, `Hero.tsx` | The reference consumer: the hero's own geometry, every shared value read from the layer |
| `components/sections/Constellation.tsx` | The reference live element: the loop contract below, in code |
| `components/sections/` (Work, `panels.ts`, `Reel`, `Shot`, `MoreWork`, About, Stack, `StackFilter`, ThinkBuildShip, Contact, `work.css`) | The second consumer: Work, Two more and the sections below them |
| `components/layout/Navbar.tsx`, `Logo.tsx`, `AvailabilityPill.tsx` | The header, in its own `.cine` root (R2) |
| `tests/unit/lab-hero-a.test.ts`, `lab-work.test.ts` | Pin the scope, the contrast floors, the token integrity and every string's source |
| `tests/e2e/lab-hero-a.spec.ts`, `lab-work.spec.ts` | Pin the behaviour: budget, axe, no-JS, reduced motion, pause, the carousels, Stack's filter |

The four test files keep their prototype names (S20): code comments and this file point at them.

**The prototype's paths, then and now** (S18+S19, `482d29e`: the files moved with `git mv`, their copy unchanged; the
two lab pages were composed into one):

| On `proto/hero-a-cinematic` | On `main` |
|---|---|
| `app/lab/_cinematic/cinematic.css` | `app/cinematic.css` |
| `app/lab/layout.tsx` (the only importer) | `app/page.tsx` (the only importer) |
| `app/lab/hero-a/page.tsx`, `app/lab/work/page.tsx` | `app/page.tsx`, with `components/sections/Hero.tsx` and `Work.tsx` |
| `app/lab/hero-a/hero-a.css`, `Constellation.tsx`, `featured.ts` | `components/sections/hero.css`, `Constellation.tsx`, `featured.ts` |
| `app/lab/work/panels.ts`, `Reel.tsx`, `Shot.tsx`, `StackFilter.tsx`, `work.css` | `components/sections/`, the same names |
| `app/lab/work/about.ts`, `stack.ts`, `tbs.ts`, `contact.ts` | `components/sections/aboutBlock.ts`, `stackBlock.ts`, `tbsBlock.ts`, `contactBlock.ts` |
| `app/lab/work/AboutBlock.tsx`, `StackBlock.tsx`, `TbsBlock.tsx`, `ContactBlock.tsx` | `components/sections/About.tsx`, `Stack.tsx`, `ThinkBuildShip.tsx`, `Contact.tsx` |
| `/lab/hero-a`, `/lab/work` (noindex) | `/`; every `/lab` route answers 404 |

**Scope, twice over.**
- Only `app/page.tsx` imports the sheet (on the prototype, only the `/lab` layout did).
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
  - It happened four times: a test comment (round 4), an object key named after a shadow utility (round 5), a test
    comment (session 11), and the root `CLAUDE.md`'s own gotcha line (session 12). The repo root and `claude/` are
    scanned too: only `docs/`, `design/`, `.claude/` and `.impeccable/` are skipped.
  - On the prototype, `tests/e2e/lab-work.spec.ts` pinned `/`'s stylesheets to `origin/main`'s bytes, so a leak failed
    the suite. That pin was deleted in S20 (on `main`, `/` is this layer). Now check by hand: rebuild, and compare `/`'s
    stylesheets (names, bytes, SHA-256) before and after any edit outside `docs/`.
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
- **Two NEW values:** `--cine-lift` (−4px) and `--cine-glow-lift` (a cyan halo at 30%). **Approved by Tay as they are
  (session 12).**

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

**Tokens it added:** `--cine-dur-move` (= the site's `--dur-slow`), plus three NEW values, **approved by Tay as they
are (session 12)**: `--cine-flow-turn` 38deg, `--cine-flow-scale` 0.78, `--cine-flow-dim` 0.55. The layer's comments
still mark all five `NEW:` (a unit test pins those markers).

Session 11 added no token. Its new values are the slice's own geometry in `work.css`: the window slide's 80% / 86%, and
the two-row controls below 390px.

### About (P3.3, session 12)

Under the four panels, after a hairline: who, in about ten seconds. Tay approved every word before it was built, and
**approved the built section** at the session 12 close.

| Element | Text | Source |
|---|---|---|
| Eyebrow | About | `dict.nav.about` |
| Title (h2) | Engineer by training. / Builder by nature. | `about.title`, word for word, each half on its own line |
| Lede | I'm a Computer Science graduate who enjoys turning complex ideas into useful, dependable software. Today, I work with C#/.NET, TypeScript, and Python, taking projects from an initial idea to working software. | the first sentence of `about.paragraphs[0]` and the second of `about.paragraphs[1]`, word for word |
| Facts | B.Sc. in Computer Science · Full-stack: web, mobile, and backend · Based in Israel · Working in English and Hebrew | `about.facts`, word for word |
| Availability | Available for software engineering roles: on-site, hybrid, or remote. | `availability.label` + the end of `availability.detail`: the one joined line (Tay's choice). Shown only while `availability.open`. |
| Links | Download résumé · GitHub · LinkedIn | `resume.href` (the locked hero's control: label, screen-reader note, `download`), `socials.github.url`, `socials.linkedin.url` (new tab, `noopener noreferrer`) |

- **Files:** `app/lab/work/about.ts` derives every string; `AboutBlock.tsx` is a server component (no client code).
  `tests/unit/lab-work.test.ts` holds each string to its source and pins the approved copy.
- **Left out on purpose:** the photo, any institution, the graduation year, email, the rest of the live paragraphs, and
  the live About visual (the products sit right above).
- **Layout:** from 1024px the title takes the panels' words share (5fr) and the words take the capture's (7fr); stacked
  below. The facts are a two-by-two list on hairlines (one column on phones).
- **Controls:** the résumé is the one filled control (`.wk__go--fill`, the hero's primary in the panels' shape); GitHub
  and LinkedIn are the panels' outlined `.wk__go`.
- **Motion:** none of its own. It holds still (rule 1): the opening's one reveal stays the only one, and its links
  answer a hover in colour at `--cine-dur-hover`.
- **Tokens:** none added. Its rules read only layer tokens; the layer still defines 76, and a unit test holds that.
- **A side effect to know:** the violet glow sits at 38% of the section's height, so the taller page moves it down. At
  1440 it now lies behind the Aegis line, which axe lists as "needs review" (covered by the floor: mist ≥ 7:1 at the glow
  peak). axe: 0 violations.

### Stack (P3.4, session 13)

Under About, after a hairline: the tools behind the work, **as the live Stack shows them** (`components/sections/Stack.tsx`),
restyled in the layer. A first build gave each tool its own project line; Tay found that too busy. A second dimmed the
tools a project doesn't use; Tay liked the colour but asked for a clearer filter. This is the third, and **Tay
approved it** at the session 13 close.

| Element | Text | Source |
|---|---|---|
| Eyebrow | Stack | `dict.nav.stack` |
| Title (h2) | Tools behind the work. | `dict.stack.title`, the live Stack's title. No lede. |
| Filter | Filter by project · All · T Poker · Aegis · DeveloperOS · GRAVITY FLOW | `dict.stack.filter`, `dict.stack.all`, the four flagships' names (the live lens has six; the lab keeps the four it shows) |
| Filter status | Showing the {n} tools {name} uses. | `dict.stack.showing`, the live lens's polite line; n counts the tools the project lights here |
| Groups (h3) | Languages · Product and interface · Services and APIs · Security · Data, search and models · Delivery and testing · Everyday tools | the live `skillGroups` titles, in order; "Security" is Tay's group |
| Tools | the live labels, word for word, in the live order; JWT moves to Security | `data/skills.ts` |
| Evidence (one per group) | the live group's sentence, word for word | `skillGroups[].evidence` |
| Security evidence | Aegis authenticates agent ingestion by body HMAC and uses JWT (RS256); DeveloperOS compares a per-instance CSRF token with hmac.compare_digest. | built only from the cited source lines below (Tay, session 13) |
| A tool's accessible text and hover title | its flagships, comma-separated, e.g. "C# (T Poker, Aegis)" | the live Stack's own pattern; `projectsFor()` kept to the four |

**Security:**

| Row | Projects | Source (`data/projects.ts`) |
|---|---|---|
| JWT | T Poker · Aegis | the live tool, moved from Services and APIs; `projectsFor("JWT")` (T Poker's stack "JWT", Aegis's "JWT (RS256)") |
| Body HMAC | Aegis | Aegis decision title: "Agent ingestion authenticated by body HMAC" |
| CSRF token | DeveloperOS | DeveloperOS decision "Loopback API hardened like a public one": "A per-instance CSRF token compared with hmac.compare_digest" |

- **Tools no flagship uses** (Java, C++, C, JavaFX, Framer Motion, pytest, Playwright) and Everyday tools (Git, Linux,
  Claude Code) carry no project: they show under All only. Their live notes are not shown.
- **Two live evidence sentences name the other two projects**, kept word for word (Tay, session 13 close): Languages ("…Python
  DeveloperOS and Job Assistant; Java runs Orders & Delivery.") and Product and interface ("…JavaFX is Orders &
  Delivery's client.").
- **No AI group:** Aegis's analysis is a deterministic mock and DeveloperOS's default is offline; Ollama is the only
  model tool, and the Data evidence says "an optional local model".

**The filter** (`StackFilter.tsx`, the one client island in Stack):
- **Buttons** with `aria-pressed`, one pressed at a time, in a group labelled "Filter by project". Each is a 44px
  target with the layer's cyan ring; the pressed one is filled in cyan. They stay mounted, so focus stays on the one
  pressed.
- **Pressing a project** sets `data-lens` on the groups. The filtering is CSS written from the options in `stack.ts`,
  exactly as the live Stack writes its FILTER: every tool whose `data-p` doesn't name the project, and every group left
  with none, take `display: none`.
  - The tools that remain are filled cyan pills (on-accent ink); the evidence sentences hide (the pills are the evidence).
  - The live status line, "Showing the {n} tools {name} uses.", sits above the groups at the lead size, in ink, and is
    `aria-live="polite"`. Under All it is empty, as on the live page.
- **No scroll jump:** a shorter list would pull the page up under the reader whenever what follows Stack can't fill the
  rest of the view. (Stack ended the page when this was built; Think · Build · Ship and Contact now follow it.) On each
  press the results (the status line and the groups) take a `min-height` that keeps the page's end at or below the
  view's bottom edge, and no more: it is 0 whenever that is already so. All lets it go. The status line is held too because its height changes with the name (two lines at 390 for
  GRAVITY FLOW, one for T Poker: that 26px was found by the e2e test).
- **Without JavaScript,** and until hydration: the full list (All). The buttons are not shown (they would do nothing),
  and their space is kept, so nothing shifts when they appear.
- **Reduced motion:** no transitions (the buttons' hover fade is the only one, and it goes).
- **It imports only React:** the server hands in the options, their status lines and the groups (as children), so
  no data reaches the client.

**Layout:** one row per group, each on its own hairline. From 1024px its name takes the panels' words share (5fr) and
its tools and evidence the capture's (7fr), lined up under About's words; stacked below. Every tool is a pill (small
text, the control edge at ≥ 3:1, the glass fill), wrapping as needed; the evidence sits under them (mist, small).

- **Files:** `app/lab/work/stack.ts` derives every string and the filter's rules; `StackBlock.tsx` is a server component;
  `StackFilter.tsx` is the island. `tests/unit/lab-work.test.ts` holds each string to its source and pins the mapping.
- **Tokens:** none added. Its eyebrow and title share About's rules; its own rules read only layer tokens.
- **Its cost (measured against `d64763d`, session 13):**
  - first-load JS +351 bytes gzip (the island shares the carousel's chunk: 181.43 → 181.77 KiB);
  - HTML 73.02 → 97.66 KB (14.0 → 17.8 KB gzip; about two-thirds is Next's flight copy of the same tree);
  - LCP +14 ms desktop and +46 ms on a phone at 4× CPU (medians; the LCP and FCP medians are equal);
  - the filter's buttons answer in 24 ms on desktop and 48–80 ms on that phone.
  - `content-visibility: auto` would skip Stack's off-screen layout, but the violet glow (at 38% of the page's height)
    then moves when Stack renders: slice CLS 0.353 at 320px, measured on the first build. **Tay keeps the cost for now**
    (session 13 close); the fix and the glow's repositioning are a P5 (integration) item, `docs/ROADMAP.md` #13.
- **The scroll hold with sections below it:** re-checked in session 14 with Think · Build · Ship below, and in session 15
  with Contact (`docs/ROADMAP.md` #14; below).

### Think · Build · Ship (P3.5, session 14)

Under Stack, after a hairline: how the work gets done, **as the live section says it**
(`components/sections/ThinkBuildShip.tsx`), restyled in the layer. Tay approved every word before it was built, with one
change: the plainer DeveloperOS line. **Tay approved the built section** at the session 14 close.

| Element | Text | Source |
|---|---|---|
| Title (h2) | Think. Build. Ship. | `dict.tbs.title`, live. No eyebrow: the live section has none, and the nav has no label for it. |
| Think (h3) · line · summary | Find the hard part. · Usually, one constraint shapes everything else. | live `pillars[0]`, word for word |
| Think evidence | T Poker: the money has to be exact to the cent, even in a guest game on a phone with no signal. | the live example; T Poker's `caseStudy.problem` |
| Build (h3) · line · summary | Make the safe path the easy one. · Encode constraints in types, interfaces, and data models—not just in documentation. | live `pillars[1]`, word for word |
| Build evidence | GRAVITY FLOW: cosmetic items are defined by visual fields only, and every purchase grants cosmetics or ad removal—nothing that changes gameplay. | the live example; GRAVITY FLOW's decision "A cosmetics-only economy" |
| Build evidence (new) | DeveloperOS: it declines when the index doesn't support an answer—before the provider is ever reached. | Tay's wording (session 14): DeveloperOS's description ("declines outright when the index doesn't support an answer") and its decision "Refusal as a first-class code path" ("before the provider is ever reached") |
| Ship (h3) · line · summary | Ship it honestly. · Make the project reproducible, testable, and explicit about its known gaps. | live `pillars[2]`, word for word |
| Ship evidence | Aegis starts from one launcher script, and its repository keeps an audit document that lists the work still open. | the live example; Aegis's description ("one launcher script") and `learned` ("audit document") |

- **All four flagships, each once.** The live section names three; DeveloperOS's line joins Build, where its decision
  is the same idea (a constraint enforced in code, not left to an instruction).
- **No figure, year or institution**, no AI claim (the line says "the provider", and DeveloperOS's default is an offline
  mock), nothing about Aegis's AI or architecture.
- **Files:** `app/lab/work/tbs.ts` reads every live string from `data/approach.ts` and `lib/dict.ts`, so nothing is
  retyped; only `DOS_EVIDENCE` is typed, and a unit test finds each of its words in DeveloperOS's own text.
  `TbsBlock.tsx` is a server component. `tests/unit/lab-work.test.ts` holds each string to its source and pins the
  approved copy.
- **Structure:** the live one: an ordered list of three rows, each word an h3 with the live screen-reader colon
  ("Think:"), then the line, the summary and the evidence as paragraphs. Each piece of evidence opens with its project's
  name in its own span.
- **Layout:** each row on its own hairline, on About's and Stack's grid: from 1024px the word and its line take the words
  share (5fr) and the summary and evidence the capture's (7fr), lined up under About's words and Stack's tools; stacked
  below. The word is a small label in the accent (the eyebrow's size and weight), so the h2 above it, which already
  says all three words, stays the large one; the line is in ink at the lead size, like Stack's group names. The summary
  is mist at the body size; the evidence mist at the small size, its project's name in ink.
- **Motion:** none. No link, no control, no reveal, no client code; it holds still (rule 1).
- **Tokens:** none added. Its title shares About's and Stack's rule (its top margin reset, since no eyebrow sits above
  it); its own rules read only layer tokens. The layer still defines 76.
- **Its cost (measured against `47998ee`, session 14):**
  - first-load JS unchanged (every JS file byte-identical); HTML 97.66 → 102.79 KB (17.7 → 18.9 KB gzip);
  - LCP +2 ms desktop and +42 ms on a phone at 4× CPU (medians of 10 interleaved; a first round gave +8 and +72). Most of
    the phone cost is laying out the section before the first paint (diagnosed by cutting its markup, and by
    `content-visibility: auto`), the same kind as Stack's. **Tay keeps the cost** (session 14 close) and added the
    section to `docs/ROADMAP.md` #13's P5 fix.

### No glow is a scroll anchor (session 14)

The two glows carry `overflow-anchor: none`.
- **Why:** the violet glow sits at 38% of the page's height. With Stack's buttons low in the view, the browser's scroll
  anchoring took the glow as its anchor, and when a project shortened the list the glow moved up and the view went with
  it (220–462px, measured). It already happened on tall screens; Think · Build · Ship made the page tall enough for the
  common sizes too.
- Only the glows are left out, so everything else anchors as before. Leaving out the whole sky also fixed the jump, but
  at the page's end it moved the view by the hold's 1px rounding.
- `tests/e2e/lab-work.spec.ts` presses each project with the buttons low in the view at 1440 and 390.
- **Kept by Tay** (session 14 close).

**Stack's hold with this section below it (`docs/ROADMAP.md` #14, re-checked in session 14):** 0 at 1440×900 and
390×844 whenever the buttons are in view. It engages on tall screens with the buttons near the top (128–729px), and
after a project is pressed with the buttons out of view above (keyboard only; 1,096–1,619px). Its space then sits
between the filtered list and this section. Without it the view jumps by that much. **Tay keeps it as it is** (session 14
close); its test's comment is reworded, and the visible gap case is re-checked in P5 (#14).

**With Contact below as well (session 15):** whenever the buttons are in view the hold is 0 at 1440×900, 390×844,
1920×1200 and 2560×1440, and 346px at 1440×1800 (it was 729px). The page's-end case is unchanged: there the hold always
equals the full list's height, so no section below changes it. `StackFilter.tsx`'s header comment no longer says Stack
ends the page (`bbd9d55`, comment only). **Tay keeps the hold as it is** (session 15 close).

### Contact (P3.6, session 15)

Under Think · Build · Ship, after a hairline, ending the page: **the live Contact section**
(`components/sections/Contact.tsx`), restyled in the layer. Tay approved every word and link before it was built, and
**approved the built section** at the session 15 close, with one fix: its two columns start at 1100px (`1369b00`).
**With it, P3 is complete: all six sections are approved.**

| Element | Text | Source |
|---|---|---|
| Eyebrow | Contact | `dict.nav.contact`. The live section has none; About and Stack take their nav labels the same way (Tay, session 15). |
| Title (h2) | Let's build something / people use. | `dict.contact.title`, word for word, each half on its own line. The reference images' draft ("Let's build something meaningful.") is not used (Tay). |
| Lead | I'm looking for a software engineering opportunity that fits my skills—on-site, hybrid, or remote. | `availability.detail`, the live lead. Shown only while `availability.open` (Tay; the live section shows it always). |
| Email | Email me | `dict.contact.email`; `mailto:` + `socials.email` + `?subject=` + `dict.contact.subject` ("Hello Tay"), encoded as live: the live Contact's link, not the footer's bare one (Tay). Same tab. |
| Profiles | LinkedIn · GitHub | `dict.contact.linkedin`, `dict.contact.github`; `socials.linkedin.url`, `socials.github.url`, in the live order. New tab, `noopener noreferrer`, the arrow and `dict.common.newTab`. |
| Résumé | Download résumé (PDF) · two pages, 79 KB | `dict.contact.resume` and `dict.contact.resumeNote` (a no-break space before "KB", as live); `resume.href`, `download={resume.fileName}`, `type="application/pdf"`. The PDF is untouched. |

- **The same targets, attributes and accessible names as the live Contact on `/`:** an e2e test reads both pages and
  compares them.
- **Left out on purpose:** a form, any backend, the email address as text (the live section doesn't show it), any
  institution, year, or availability wording beyond the live lead.
- **Files:** `app/lab/work/contact.ts` derives every string and target; `ContactBlock.tsx` is a server component (no
  client code). `tests/unit/lab-work.test.ts` holds each to its source and pins the approved copy.
- **Layout:** on About's grid. From 1100px the eyebrow and title take the words share (5fr), and the lead, the links and
  the résumé the capture's (7fr), lined up under About's words; stacked below.
  - **Its two columns start at 1100px, not 1024 like the sections above** (Tay, session 15 close). From 1024 to 1100
    the words share (368px at 1024) is too narrow for "Let's build something", which wrapped to three lines; stacked,
    the title keeps its two. Contact only: everything above it is pixel-identical to `a625c75` at 1440, 1100, 1024, 390
    and 320. The e2e layout test runs at 1024 (stacked, with About still in two columns) and 1100 (two columns).
  - "Email me" is the one filled control (`.wk__go--fill`). LinkedIn and GitHub take the panels' outlined `.wk__go` and
    wrap as a pair, the live rule, so one is never stranded. On phones the pair fills its own line under the email
    action, 12px apart (at 24px it needs 282px, 2px more than a 320px screen gives).
  - The résumé is a quiet underlined download in ink under its own hairline, with the note in mist. The note stays
    whole: on the narrowest phones it drops under the link as one piece.
- **Motion:** none of its own. It holds still (rule 1); its links answer a hover in colour only.
- **Tokens:** none added. Its eyebrow, title and lead share About's rules; its own rules read only layer tokens. The
  layer still defines 76.
- **Its cost (measured against `a625c75`, session 15):** first-load JS unchanged (every JS file byte-identical); HTML
  102.79 → 107.10 KB (18.9 → 19.4 KB gzip); LCP +0 to +8 ms desktop and +4 to +18 ms on a phone at 4× CPU (medians of 10
  interleaved, three rounds). Scroll-through CLS in the slice 0. axe: 0 violations, and nothing to review in Contact.
  **Tay keeps the cost** and added Contact to `docs/ROADMAP.md` #13's P5 fix (session 15 close).
- **The chat launcher:** at the page's end every Contact link and the résumé's note sit above it at 1440, 1100, 1024,
  390 and 320 (e2e).
- **The repetition with About** ("on-site, hybrid, or remote", and the résumé, GitHub and LinkedIn) is logged for P5:
  re-check whether About keeps its links once the full page is assembled (`docs/ROADMAP.md` #15).
