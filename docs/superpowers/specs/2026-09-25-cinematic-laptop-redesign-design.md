# Cinematic Laptop Redesign — Design Spec

**Date:** 2026-09-25
**Branch:** `feature/premium-portfolio-redesign-1mqmgf` (continues the August work; nothing is reset)
**Status:** Awaiting your approval. No production code has been written for this spec.
**Supersedes:** the arrival proposal (`2026-08-05-arrival-experience-design.md`, Concept B, the dual-monitor workspace) and the page composition of `2026-08-04-premium-portfolio-redesign-design.md`, wherever they conflict with this document. Their verified content, infrastructure and accessibility work stay.

Evidence referenced below lives in `docs/superpowers/specs/assets/` and `design/references/`.

---

## 1. Understanding

### What you asked for (stated)

- A cinematic, product-launch-quality portfolio for **Tay Shofer — Software Developer** that is itself evidence of frontend and engineering ability.
- An opening scene in which **you cause** a premium laptop on a real-looking desk to wake up. The screen then becomes the website, with no fade to black.
- Scroll story, as guidance: darkness lifts (0–12%) → lid opens (12–38%) → screen powers on and boots (38–53%) → identity (53–68%) → camera moves to the screen (68–88%) → the screen becomes the site (88–100%).
- After that, product storytelling: each important project gets its own visual world for several seconds of scroll. T Poker as a mobile product presentation, SentinelAI as a real-time security product, DeveloperOS as a workspace that assembles, and GRAVITY FLOW as playful and physical. Job Assistant and Orders & Delivery stay.
- Approved copy: *"I build software / people can actually use."*, *"Engineer by training. / Builder by nature."*, *"Think. Build. Ship."*, *"Let's build / something great."*
- Dark and restrained: obsidian, soft off-white, controlled ice-blue, a hint of warm desk light. No purple gradients, no neon, no glass everywhere, no card farms.
- The visual direction is fixed by `design/references/cinematic-laptop-concept.webp`, the image you attached, which is identical to the package's `docs/portfolio-concept.png`.
- The repository stays the source of truth for facts, links, SEO, API, accessibility and configuration.
- The reference package on `reference/premium-redesign-package` is reference material only.
- Real verification: typecheck, lint, tests, build, and browser screenshots at 1440×900, 1366×768, 768 and 390×844.

### What I am assuming (correct me at review)

1. **The September direction replaces the August arrival.** The branch's last work was Concept B, a dual-monitor workspace with its screen already on. Your concept image and brief describe a closed laptop that opens and boots, so Concept B is retired. Its *pipeline idea* is kept and upgraded: render offline, export screen corners, and map live DOM onto the render.
2. **The August section compositions are retired, but their facts stay.** That means the instrument-panel page, the topology board, the pipeline run and the arc carousel go, while every fact-checked number and caveat in `data/*.ts` stays.
3. **Copy that the new direction replaces:** "I build production software that solves real problems.", "Everything here runs. Come in and check." and "You've seen it run." give way to the approved lines above.
4. **The light theme keeps working** because the brief says to preserve theme behaviour. The site is designed dark-first, and the rendered entrance is always dark.

---

## 2. What the reference package gives us

I fetched it read-only (`git archive`, no checkout or merge), ran it locally, and captured its intro across the full scroll range.

![Reference intro, 0–36% of its scroll](assets/2026-09-25-reference-intro.webp)

| Area | Verdict | Why |
|---|---|---|
| Scroll storyboard and percentages (`ANIMATION_SPEC.md`) | **Port** (refined) | It matches your brief. Its numbers are the starting point for §4.2. |
| Section order and approved copy (Hero, Work, About, Stack, Think/Build/Ship, Contact, Footer) | **Port** | It matches the concept image. |
| Nav hidden during the intro, then "Available for work" | **Port** (rewritten) | The idea is right. Its trigger is a magic `3.2 × innerHeight`; ours listens to the entrance's actual progress. |
| Per-project "kinds" (phones / monitor / windows / orbit / terminal / flow) | **Port the idea, rebuild the worlds** | Right structure. The visuals render small and dim, and the scenes don't take over the viewport. |
| Bento stack with a pointer-follow light, Think/Build/Ship, planet-horizon contact | **Port** (restyled onto our tokens) | They match the concept. |
| Mobile gets a shorter intro timeline; reduced motion starts with the laptop open | **Port** (extended to the in-app toggle) | Its `useReducedMotion` ignores the site's own accessibility toggle. |
| CSS/DOM pseudo-3D laptop (`IntroScene.tsx`) | **Do not port** | See §4.1. On screen it reads as an illustration, and the August history already spent four CSS passes trying to get past that. |
| Portal = a `portal-veil` fading to solid `#05070a` | **Do not port** | It is exactly the "cheap fade-to-black followed by a normal webpage" the brief rules out. At 20% scroll the whole viewport goes black. |
| GSAP + ScrollTrigger | **Do not add** | See §7. It would be a second animation library doing Framer Motion's existing job. |
| `AmbientCanvas` particle field | **Rewrite** | Its `requestAnimationFrame` loop runs forever at 60 fps, including while offscreen. Ours runs only while visible and settles. |
| `data/*.ts` in the package | **Do not port**: it contradicts the repo in ways that are *factually wrong* (see below) | The repo was fact-checked against each project's own repository in August. |
| `scripts/sync-assets.mjs` | **Not needed** | The real screenshots are already in `public/projects/**` as WebP. The package's PNGs are identical placeholders. |

**Factual errors in the package that must not reach production:**

| Package says | Repository truth |
|---|---|
| T Poker live URL `poker-home-games-three.vercel.app` | `https://app.tpoker.app/`, plus the live App Store listing |
| GRAVITY FLOW "Live product" → `taysh123.github.io/Gravity-Game` | Removed in August: the link served a privacy policy. The game is `v1.0.0-rc` and Android-only |
| Orders & Delivery: "Node.js, REST, SQL, React", "state transitions" | 100% Java, JavaFX, raw TCP, a flat-file DAO. It is university coursework and says so |
| SentinelAI "AI-assisted" | The analysis mode is a deterministic template provider; no model is called |
| Job Assistant terminal: "1,077 roles collected / 103 matched" | 287 jobs collected over 61 runs. Crons are disabled; it runs as a Docker service |
| About: "6+ Shipped projects" | Not supportable: two projects run locally and one is coursework |

**One existing repo inconsistency, found while cross-checking:** the `Languages` evidence line in `data/skills.ts` says "C++ and C# carry SentinelAI and T Poker". Neither project contains C++. It will be corrected to what the data supports: C# carries both backends; TypeScript the clients; Python DeveloperOS and Job Assistant.

---

## 3. Design system

### 3.1 Research (UI UX Pro Max)

I ran `--design-system` with *"premium developer portfolio cinematic product-launch dark restrained immersive technical minimal spacious"*, plus style, colour, typography, landing, UX, `--stack nextjs` and `--stack threejs` searches.

| Recommendation | Adopted? |
|---|---|
| Style **Parallax Storytelling** (scroll-driven chapters, sticky sections, a mobile alternative, a skip option, a reduced-motion fallback) | **Yes.** It is the page's structure. |
| Style **Dark Mode (OLED)**: deep near-black, high-contrast text, minimal glow | **Yes**, as the base. |
| Accent **run green `#22C55E`** (the Developer Tool palette) | **No.** You approved ice-blue. Green is kept only for the "available" status dot, always paired with text. |
| Typography **Inter** | **No**, but only on grounds of redundancy. Geist is already the brand face, loaded via `next/font`, and occupies the same neo-grotesk register. Switching fonts buys nothing. |
| UX: reduced motion (High), no forced scroll effects (High), 1–2 animated elements per view (High), no horizontal scroll (High), ease-out in / ease-in out | **Yes**, all enforced (§7, §8). |
| Next.js: `next/dynamic` for heavy parts, `next/font`, reserve space (CLS), an LCP image hint | **Yes.** In Next 16 the hint is `preload`, not the deprecated `priority`. |
| three.js: DPR cap at 2, dispose resources, render on demand | Moot. The entrance ships **no WebGL** (§4.1). |
| Pre-delivery: contrast ≥ 4.5:1, focus rings, 44 px targets, 375 px and landscape checks, both themes | **Yes**, in the verification plan (§10). |

No persisted `design-system/MASTER.md` existed. I have not generated one, because this spec's tokens are the design system and a second, generated source of truth would drift. I will persist one with `--persist` if you want it.

### 3.2 Tokens

The token architecture stays as August built it: semantic CSS variables on `:root` and `[data-theme="light"]`, surfaced through Tailwind's `@theme inline`, with no literals in components. The **values** change:

| Role | Dark (default) | Notes |
|---|---|---|
| `--bg` | `#05070a` obsidian | Replaces the violet-tinted `#07070f` |
| `--bg-raised` | `#0a0e14` | Section and card base |
| `--fg` | `#f2f4f8` soft off-white | ≥ 17:1 |
| `--fg-muted` | `#9aa3b2` | ≥ 7:1 |
| `--fg-subtle` | `#7b8597` | ≥ 5:1. Labels are ~11 px, so held above 4.5 |
| `--accent` | `#5b9cff` ice-blue | Text and link use, ≥ 7:1 on `--bg` |
| `--accent-solid` | `#1d6ef5` | Primary button fill. White text on it is ≥ 4.5:1 |
| `--light-cool` | `rgba(91,156,255,.14)` | Atmosphere only: screen glow, horizon |
| `--light-warm` | `rgba(255,180,107,.10)` | Atmosphere only: the desk-lamp echo. Never text |
| `--line` / `--line-strong` | `rgba(255,255,255,.08 / .14)` | Hairlines |
| `--status-live` | `#4ade80` | Always with a text label |

**Retired:** `--glow` and `--glow-strong` (violet), the panel-fill gradients, the aurora field, `--device-*` (the CSS laptop) and `--desk-*`. The light theme gets a matching set (paper `#f5f6f8`, ink `#0b0e14`, accent `#1459d9`), checked for contrast independently.

**Type:** Geist Sans 400/500/600 and Geist Mono 500 for labels.

| Level | Size | Weight | Tracking |
|---|---|---|---|
| Hero display | `clamp(3rem, 7.2vw, 6.75rem)` | 600 | −0.045em |
| Section titles | `clamp(2.25rem, 5vw, 4.5rem)` | 600 | — |
| Lead | `clamp(1.125rem, 1.5vw, 1.3125rem)` | — | — |
| Body | 17 px, line-height 1.6, ≤ 62ch | — | — |
| Labels | 11 px mono, uppercase | — | +0.16em |

**Space and layout:** content shell `min(1240px, 100vw − 2×gutter)` and gutter `clamp(20px, 4vw, 40px)`. Section rhythm is `clamp(7rem, 14vh, 12rem)`, which gives low density and large negative space. Radius runs 10 / 16 / 24 / pill. There is one elevation shadow for floating objects (phones, windows) and none on text blocks.

**Motion tokens:** `--ease-out: cubic-bezier(.16,1,.3,1)`, `--ease-in-out: cubic-bezier(.65,0,.35,1)`, and durations 180 / 320 / 560 ms. Reveals use scale .96 → 1, y 24 px → 0 and blur 6 px → 0. Parallax distance is ≤ 48 px. Stagger is 60 ms, used only for lists.

---

## 4. The entrance

### 4.1 How to build it: three approaches, measured

| | **A. CSS/DOM pseudo-3D** (the package; also the August `Workstation.tsx`) | **B. Real-time three.js** (the August `/gl-spike`, `design/render/scene.ts`) | **C. Path-traced frame sequence + live DOM screen** ★ |
|---|---|---|---|
| Realism | Illustration. Measured twice: four August passes, and the package screenshot above | "Clean 3D mock-up". Rasterised lighting has no global illumination, soft bounce or depth of field ([August render](assets/2026-09-25-august-render.webp)) | Photographic. A Cycles path tracer gives real bounce light, soft shadows, reflections on the glass and keys, and depth of field |
| Lid reflections that evolve with the angle (brief) | Faked with gradients | Yes | Yes, physically |
| Runtime cost | Low | +~150 KB gzip JS, a GPU context, and per-device shader and lighting risk | **No WebGL, no new JS library.** A 2D canvas draws one or two images per scroll change |
| Payload | ~0 | ~150 KB JS | Frames: ~1.2 MB (1280 tier) to ~2.3 MB (1920 tier) desktop, ~1 MB portrait. Extrapolated from a measured ~11 KB per 960×540 AVIF frame. Fetched after first paint |
| Screen → website | Easy (it is DOM) | Hard (DOM projected onto a moving 3D quad) | Easy and exact: every frame carries its projected screen corners, and the DOM rides them via `matrix3d` |
| Failure mode | Looks cheap | Looks like a game asset, or janks on weak GPUs | A poster instead of motion, if frames fail to load |

**Recommendation: C.** It is the only option that can reach the concept image, and it is also the lightest at runtime. This is how Apple ships product reveals.

**Spike evidence (throwaway):** the official Blender 5.0 Python module (`bpy`, pip wheel, OpenImageDenoise included) runs in this container. Two quick iterations of a procedural desk rendered in **~35 s per frame at 960×540, 48 samples, on 4 CPU cores**:

![Spike: half-open, screen dark (left); open, screen awake (right)](assets/2026-09-25-render-spike.webp)

This is ten minutes of scene work, not art direction. The desk grain is too streaky, the laptop is small in frame, and the mug has no character. What it proves is the look: warm and cool practical light, a monitor of real code falling out of focus, the notebook, the plant, depth of field, and a lid that reflects the keyboard. None of that is reachable with A or B.

### 4.2 Scroll story (desktop, landscape)

The entrance is a pinned stage inside a **400svh** container, which gives 300svh of travel. Progress `p` runs 0 → 1 across that travel.

| `p` | Beat | What moves |
|---|---|---|
| 0.00 | **Arrival** | Near-black. The closed laptop is faintly readable. The chapter marker reads "01 — Scroll to begin" in mono, top-left. |
| 0.00–0.12 | **Darkness lifts** | An exposure veil goes 1 → 0 (ease-out), and the frame scales 1.00 → 1.03 (subtle push). "TAY SHOFER / Software Developer" fades in above the laptop, letterspaced, as in concept frames 01–02. |
| 0.12–0.38 | **Lid opens** | 36 frames: hinge 0° → 108°, with a slight rendered dolly. The glass reflects keys and room; the marker changes to "02 — Scroll to open". |
| 0.38–0.53 | **Power-on** | Cross-fade from the screen-off frame to the screen-on frame. The backlight spills onto the keys and desk *in the render*. The DOM screen wakes: backlight, then a restrained boot log (`> initializing portfolio…` / `> loading projects…` / `> ready.`). The room title fades out. |
| 0.53–0.68 | **Identity** | On the screen, the log gives way to **TAY SHOFER / Software Developer / Building products that ship.** The marker reads "03 — Welcome". |
| 0.68–0.88 | **Camera** | 28 frames: the camera dollies to the screen and the focus pulls. The desk, monitor, plant and mug drift out of focus and out of frame. The screen surface rides the projected corners the whole way. |
| 0.88–1.00 | **Portal** | The screen *becomes* the site (see §4.3). The nav fades in over 0.96–1.00, and the pin releases at 1.00. |

The percentages are your guidance. They will be tuned against the real frames in the browser, not by argument. A visible **Skip intro** control, and the skip link, jump straight to `p = 1` and move focus to the `h1`.

### 4.3 The portal: the screen *is* the hero

There is no duplicate hero and no cross-fade to a separate page:

- **The hero section is the screen surface.** The real `<section id="hero">` with the real `<h1>` is mounted inside the pinned stage. For `p < 1` its transform is the homography that maps it onto the laptop's screen quad in the current frame. At `p = 1` that transform is exactly the identity, so when the pin releases, the thing on screen simply *is* the hero and scrolls away like any section.
- **Aspect ratio:** the laptop screen is 16:10 and viewports are not. The surface is laid out at viewport size. The homography maps a centred 16:10 crop of it onto the screen quad, clipped to that crop. During the portal, the crop grows to the full viewport as the bezel passes the viewport edges. You see the screen *expand*, not a letterbox.
- **Content continuity:** "TAY SHOFER" glides and shrinks into the hero's name line and "Software Developer" merges into it. "Building products that ship." gives way to the headline *I build software / people can actually use.*, which rises in with a mask reveal, followed by the supporting line and CTAs. Every step is transform or opacity.
- **Background continuity:** the screen's black is `--bg`. The bezel and desk leave frame because they are *outside* the screen, so nothing fades to black.
- **Glass:** a faint reflection gradient sits over the surface while it is "inside" the laptop and fades to 0 as it reaches the viewport.

### 4.4 Mobile and portrait: its own composition

This applies whenever the viewport aspect is below 0.9, which covers phones and portrait tablets:

- A separate **portrait render** (camera re-framed, laptop filling the width, props reduced to soft light and the monitor glow) at **260svh**.
- Fewer frames: 24 lid, 1 wake, 16 push. The same beats, compressed. There is no room title, because the name appears on the screen instead.
- The portal expands a landscape screen into a portrait viewport. The 16:10 band opens vertically into the full screen, which reads as the screen unfolding, and it is designed rather than accidental.
- Native touch scroll only: Lenis already leaves touch alone, and there is no scroll-jacking.

### 4.5 Reduced motion, no JavaScript and failure

The **layout is decided in CSS at first paint**, which is what keeps CLS at 0. It is the same DOM in every mode, and CSS switches the stage between *pinned* and *static*:

- `prefers-reduced-motion: reduce`, the in-app toggle (`[data-reduced-motion="true"]`, already server-rendered from the cookie) or `<noscript>` all do the same thing. The container is **not pinned**: one static still (lid open, screen awake, identity on the screen), followed by the hero as a normal section. The hero surface drops out of its absolute, transformed position into normal flow. There is no frame sequence, dolly or parallax, and JS applies no transforms in this mode.
- **Frames fail to load:** the poster stays, the DOM surface still animates, and the portal still completes. It degrades to "less motion", never to "broken".
- **Save-Data or 2G/3G:** only every fourth frame is fetched, and cross-fades cover the gaps.

### 4.6 Asset pipeline (committed, reproducible)

```
design/render/blender/
  scene.py        procedural desk, laptop and props. No downloaded models, no licence surface
  render.py       renders a named shot (lid | wake | push) for a framing (landscape | portrait)
                  at a given quality (preview | final)
  textures/       code-screen, notebook and mug textures generated from real repo content
scripts/
  encode-frames.mjs   PNG → AVIF (+ WebP fallback) tiers with sharp, and writes manifest.json
public/entrance/
  landscape/{1280,1920}/lid-00.avif …   portrait/900/…   manifest.json
```

- `manifest.json` gives, for every frame, the four projected screen corners in 0..1 image space, generated by the renderer rather than measured by eye. It follows the same principle as August's `workspace.json`.
- **Preview renders** (quarter resolution, ~10 s per frame) are for iterating on timing and composition. **Final renders** (1920×1080 landscape, 1080×1920 portrait) run in the background and are committed in chunks, so a lost container never loses more than one chunk.
- Blender is a **dev-time tool only**: a `pip install bpy` into a venv, documented in the README. It is never a `package.json` dependency. `sharp` becomes an explicit devDependency, because the encoder uses it and it is currently only transitive through Next.
- **Art-direction targets from the concept:** a generic silver-aluminium laptop with no logo, a dark wood desk, one warm practical light right, a cool fill left, a secondary monitor of real code out of focus, a plant, a mug, and the notebook reading "Ideas / Build / Ship / Repeat.". No RGB. I'll share key frames with you as soon as they exist. That is a courtesy, not a blocking gate.

### 4.7 Runtime architecture

The entrance can be swapped without touching the rest of the site:

```
components/entrance/
  Entrance.tsx          server component: pinned container, poster <img>, still for reduced/no-JS,
                        and hosts <Hero/> as its screen surface
  EntranceStage.tsx     client: reads scroll progress, drives canvas + surface + overlays
  FramePlayer.ts        canvas renderer: cover fit, adjacent-frame cross-fade, DPR ≤ 2
  FrameStore.ts         prioritised fetch (sparse first, then fill), decode window of ImageBitmaps
                        around the playhead (released with close()), Save-Data mode
  screenSurface.ts      homography solver (4 points → CSS matrix3d) + aspect-crop maths
lib/timeline.ts         typed scroll timeline: segment(p, start, end, ease) and beats
```

`EntranceStage` depends only on a `SceneRenderer` interface (`drawAt(progress)`, `screenQuadAt(progress)`). A future WebGL scene could implement the same interface, which honours the brief's swap-ability requirement without building it now.

Work happens only while the entrance is on screen and progress is changing. There is no idle `requestAnimationFrame` loop, and nothing runs after the pin releases.

---

## 5. The page after the entrance

Order: **Hero (the screen) → Work → About → Stack → Think/Build/Ship → Contact → Footer.** The nav reads `TS · Work · About · Stack · Contact · ● Available for work`, following the concept. The command palette, accessibility panel and chat widget stay, restyled. Their floating buttons stay hidden until the entrance completes.

### 5.1 Hero

- A name line: "Tay Shofer · Software Developer", which is where the screen identity lands.
- The headline *I build software / people can actually use.* The second line is muted, as in the concept.
- The supporting line, adapted from the repo tagline: *"Computer Science graduate building polished products, real-time systems and production-ready software."*
- **Explore my work ↓** is the primary CTA. **GitHub ↗** is secondary.
- One quiet atmospheric element: the dark horizon arc from the concept, rendered in CSS.
- The `h1` is the name line plus the headline, and it is the page's only `h1`.

### 5.2 Work: "each project becomes the whole website"

On desktop, every flagship scene is pinned for **200svh**:

1. **0–30%:** the world assembles.
2. **30–70%:** it holds, with slow parallax and one live detail.
3. **70–100%:** it recedes while the next number arrives.

The copy (number, name, one-line kicker, two sentences, three verified metrics, stack, and CTAs to Case study, Live / App Store and Source) is readable the entire time the scene is visible. **It never depends on scroll position to be legible.**

| # | Project | World | Uses |
|---|---|---|---|
| 01 | **T Poker** | Three generic phones in depth over a dark reflective floor. The front phone rises as the others fan behind it, with 12–40 px parallax per layer. The real App Store badge link. | `home`, `tournament-live`, `final-count` screenshots; live URLs; `stores` |
| 02 | **SentinelAI** | A large monitor with the real dashboard. One scan pass per entry. Live-alert rows slide in from `live-alerts`. A "streaming" indicator is labelled as a local demo. | `dashboard`, `live-alerts`; honest status "Runs locally" |
| 03 | **DeveloperOS** | Four windows start scattered in depth and converge into one organised workspace as you scroll. A floating card reads "Grounded answers · file:line citations". | `dashboard`, `ai-features`, `learning`, `career` |
| 04 | **GRAVITY FLOW** | The gameplay capture in a phone frame. A canvas star field with orbital paths extends past the frame. Scroll sets orbit speed, and the pointer bends paths gently. It stops when offscreen. | `gameplay`, `boss`; `v1.0.0-rc`, Android-only |
| — | **Job Assistant**, **Orders & Delivery** | "More work": two wide, unpinned rows with the real pipeline shape (collect → filter → dedup → deliver; client ⇄ TCP ⇄ server) as small SVG diagrams | Repo data, including the coursework label |

The existing `CaseStudyPanel` (the full-viewport product page) is kept and restyled. It stays the deep-dive for every project.

On **mobile and reduced motion**, scenes are **not pinned**. Each is a full-height section showing its world's settled composition, with a single in-view reveal.

### 5.3 About

"Engineer by training. / Builder by nature." The two-paragraph bio is condensed from the repo's About copy, with no new claims. Then a facts row:

| Fact | Detail |
|---|---|
| **B.Sc.** | Computer Science |
| **Full stack** | Web · Mobile · Backend |
| **1,742** | Tests across the work (the repo's verified sum) |
| **∞** | Still learning |

This replaces the package's "6+ shipped projects".

### 5.4 Stack

"The tools I build with." Five spacious bento cards grouped from the real data:

- **Languages**
- **Web & Mobile**
- **Backend & Data** (wide)
- **Delivery & Tools** (wide)
- **Verification**

Each card has its chips and **one** evidence line kept from August, for example "8 bounded contexts over RabbitMQ, 0 cross-context references". A pointer-follow light lives on the hovered card only; it is off on touch and under reduced motion.

### 5.5 Think. Build. Ship.

A typographic sequence, not a card row. The three words sit large on one line. As you scroll, a hairline travels beneath them and each word brightens from `--fg-subtle` to `--fg` in turn. Under the lit word, one slot shows its line and one real example from `data/approach.ts`, condensed:

- **Think:** "Architecture before implementation." with T Poker's money-exactness constraint.
- **Build:** "Clean, maintainable systems." with SentinelAI's compiler-enforced boundaries.
- **Ship:** "Test. Deploy. Improve." with the mirrored settlement fixtures and one-command bring-up.

It is pinned for 150svh on desktop. On mobile and reduced motion it becomes a static stacked list.

### 5.6 Contact and footer

"Let's build / something great." sits over the planet-horizon light (a CSS arc with a faint grid, cool light pooling). There is one primary action, **Get in touch** (mailto), plus GitHub, LinkedIn, Email and the existing tap-to-reveal phone. "Ideas / Build / Ship / Repeat." echoes the notebook from the opening frame, which bookends the page.

The footer reads `TAY SHOFER — PORTFOLIO · BUILT TO SHIP.` with minimal links and ©.

---

## 6. What is preserved, replaced and removed

**Preserved as-is or restyled only:**

- `app/api/chat` (security hardening intact) and `AIChatWidget`
- `CommandPalette`, `AccessibilityPanel`, `ThemeProvider`, `AccessibilityProvider`
- `SmoothScroll` (Lenis), `useReducedMotionPref`, `useFocusTrap`
- `CaseStudyPanel`, `StoreBadge`, `ProjectImage`
- All of `data/*.ts`, with the one correction above and `siteMeta.headline` updated
- SEO: metadata, `JsonLd`, `sitemap`, `robots`, `manifest`, `opengraph-image` (restyled to the new headline and palette), `proxy.ts` security headers (the CSP already permits same-origin frame fetches), `not-found`, `error`

**Replaced by the new sections:** `IntroSequence`, `Hero`, `About`, `Projects`, `Skills`, `EngineeringPanel`, `Contact`, `Navbar`, `Footer`.

**Removed once replaced and verified:**

- Components: `Workstation`, `WorkstationGL`, `ScreenPortfolio`, `HeroVisual`, `ArchitectureBoard`, `PipelineRun`, `AmbientGlow`, `ProjectStage`, `ProjectDeck`, `ProjectRow`, `FeaturedProject`, `Stage`, `PanelReveal`, `PhoneReveal`, and any primitive left without a caller
- Routes: `/gl-spike` and `/render-studio`
- Render assets: `design/render/scene.ts` and `capture.mjs` (superseded by the Blender pipeline), and `public/arrival/*` (1.2 MB)
- The **`three` and `@types/three` dependencies**, which would no longer be used anywhere
- `design/references/arrival-workspace-reference.png` is kept but its README marks it as superseded by `cinematic-laptop-concept.webp`

**Added:**

- Dev dependencies: `vitest` for unit tests (TDD needs a runner, and the repo has none) and `sharp` (explicit)
- Scripts: `typecheck`, `test`, `test:e2e`, `render:*`, `encode:frames`
- **No new runtime dependency.**

---

## 7. Motion system

- **One animation library: Framer Motion (existing) plus Lenis (existing).** GSAP was considered, since the brief invites it and the package uses it. It is not added: every scroll-linked value here is "progress → number", which Framer's `useScroll` already provides and which the August intro shipped with. A second library for the same job is what the brief says not to do.
- **`lib/timeline.ts` owns the maths.** It holds typed segments, easing, and explicit clamping. This avoids the August bug where a flat-hold `useTransform` range interpolated into a V; the timeline is unit-tested instead.
- **Rules:**
  - Compositor-only properties (`transform`, `opacity`; `filter: blur` only on small elements).
  - One primary moving thing per viewport.
  - Nothing loops in the reading area.
  - Every continuous effect stops offscreen and under reduced motion.
  - No layout animation.
  - Exits run at about 65% of enter duration.

---

## 8. Accessibility

- Landmarks: `header`/`nav`, one `main`, `footer`. One `h1`, then `h2` per section and `h3` per project, in sequence.
- The entrance is `aria-hidden` except the hero surface, which carries the real `h1`. A screen reader gets the page, not 400svh of theatre.
- **Skip link** and **Skip intro** both land on the `h1`. The nav is always reachable by keyboard: it shows itself on `:focus-within` even while the entrance hides it.
- Focus rings are visible everywhere (2 px `--accent` ring plus offset). Targets are ≥ 44 px below `lg`. Contrast is verified per token (§3.2) in both themes.
- Case study and overlays keep their focus traps and focus restoration.
- Reduced motion, from the OS setting or the in-app toggle, removes pinning, sequences, parallax and loops (§4.5, §5).
- No content is hover-only. Browser zoom is never disabled.

---

## 9. Performance budgets

These are measured, not estimated. They are verified in a production build.

| Metric | Budget |
|---|---|
| CLS | **< 0.02** (layout mode is decided by CSS at first paint) |
| LCP (desktop, production build, local) | ≤ 1.2 s. The LCP element is the poster (~40 KB) or the hero text |
| First-load JS for `/` | ≤ today's baseline + 20 KB gzip (baseline recorded before work starts) |
| Entrance frames, desktop | ≤ 2.5 MB AVIF at the 1280 tier, ≤ 4 MB at the 1920 tier (DPR ≥ 1.5 and width ≥ 1280) |
| Entrance frames, portrait | ≤ 1.2 MB |
| Frames before `load` | **0**, except the poster |
| Main-thread time per scroll frame in the entrance | ≤ 8 ms (Chrome performance trace) |
| Offscreen work after the entrance | 0 active animation-frame loops (asserted in e2e) |

If a budget fails, the effect is simplified. The budget is not relaxed.

---

## 10. Testing and verification

**Unit (Vitest), test-first:**

- `lib/timeline.ts`: segments, clamping, easing, monotonicity.
- `screenSurface.ts`: the homography maps the four corners exactly, is identity at full viewport, and handles the aspect crop.
- `FrameStore` / `FramePlayer`: frame selection and cross-fade weights; decode-window admission and release; Save-Data sparsity.
- `manifest.json`: every file exists, quads stay within 0..1, the lid sequence is monotonic.
- Content: every project has a repo URL and existing images; banned claims (e.g. "6+", invented counts) stay out; nav targets exist.

**End-to-end (Playwright, already a devDependency):**

- One `h1`; no horizontal overflow at 390, 768, 1366 and 1440.
- Reduced-motion mode (both sources) has no pinned heights.
- Skip intro and the skip link focus the `h1`.
- Keyboard traversal of the nav and case study, with focus restored.
- The canvas brightens across 0–12%; the hero transform equals identity at `p = 1`.
- Zero console errors, zero loops running after the entrance.

**Visual:** screenshot sets at 1440×900, 1366×768, 768×1024 and 390×844 across entrance beats and every section. I'll inspect them myself and iterate on what I see: geometry, clipping, z-index, wrapping, pin lengths, overflow, contrast and nav timing.

**Gates before anything is called done:** `npm run typecheck`, `npm run lint`, `npm test`, `npm run test:e2e`, `npm run build`, all passing, plus the UI UX Pro Max pre-delivery checklist.

---

## 11. Delivery phases

This is one spec, with the plan split so each phase is independently verifiable.

- **A. Foundation:** baseline measurements; the test runner; tokens and type; `lib/timeline.ts`; the new shell (nav, footer, hero in normal flow).
- **B. Entrance runtime:** `FrameStore`, `FramePlayer`, `screenSurface`, `EntranceStage`, built and verified against **preview frames**, so the runtime doesn't wait for final renders.
- **C. Render:** art direction, then final landscape and portrait sequences in background chunks, encoding, and the manifest.
- **D. Sections:** the four project worlds, the more-work rows, About, Stack, Think/Build/Ship, Contact.
- **E. Cleanup and verification:** remove the superseded code and dependencies; the full gate run; the visual pass at four viewports; the performance trace; the pre-delivery checklist.

B and C run in parallel: renders are background jobs.

---

## 12. Risks

| Risk | Mitigation |
|---|---|
| Render time: ~2 min per final frame at 1080p on 4 cores, about 3.5 h total | Preview renders for all iteration; finals only after composition is locked; chunked and committed |
| The container is reclaimed mid-render | Chunks committed as they finish; the scene is code, so any frame can be regenerated |
| The procedural scene falls short of the concept | Depth of field and low-key lighting carry most of it. Detail goes where the camera focuses (the laptop). Background props stay defocused by design |
| Decode jank on low-end laptops | ImageBitmap decode window; 1280 tier by default; the fallback shows the nearest decoded frame |
| Text crispness under `matrix3d` | Verified in screenshots. It is only transformed while small; at identity it is plain text |
| Long page (entrance + four pinned scenes) | Pins only where the brief asks; nav jumps work at any point; mobile and reduced motion never pin |

---

## 13. Defaults I chose

Override any of these at review:

1. **About facts row:** B.Sc. · Full stack · 1,742 tests · ∞ still learning (§5.3).
2. **Nav:** Work · About · Stack · Contact, per the concept. Think/Build/Ship is reachable by scroll and the palette.
3. **Four flagship scenes** (T Poker, SentinelAI, DeveloperOS, GRAVITY FLOW), plus two "more work" rows, following the concept's 01–04 pager.
4. **No text on the rendered mug:** the notebook carries "Ideas / Build / Ship / Repeat.", and one slogan in frame is enough.
