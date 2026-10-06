# Premium Portfolio Redesign — Design Spec

**Date:** 2026-08-04
**Branch:** `feature/premium-portfolio-redesign`
**Status:** approved to implement (decisions confirmed by Tay)

---

## 1. Goal

Transform `tayshofer.dev` from a spacious-but-empty single-column page into a composed,
panel-framed product that reads as *engineering*, not marketing — while correcting a set of
factual, accessibility, security and performance defects found during discovery.

The identity (deep near-black field, blue/violet accents, Geist type, custom SVG icons)
is preserved. The composition, copy, and infrastructure are rebuilt.

## 2. Confirmed decisions

| # | Decision | Chosen |
|---|---|---|
| 1 | Projects presentation | **Case-study grid** — one featured panel + responsive card grid. The 3D carousel is removed. |
| 2 | Orders & Delivery entry | **Rewrite truthfully, labelled university coursework**, placed last. |
| 3 | Hero headline | **"I build production software that solves real problems."** (Tay's wording) |
| 4 | GRAVITY FLOW links | **Drop the Play/live CTA.** GitHub + Case Study only; status labelled `v1.0.0-rc`. |
| 5 | Standing directive | Authenticity over spectacle. Surface the strongest *true* engineering story. Build visuals natively (SVG/CSS/React); external assets only when clearly better. |

## 3. Design language — "Instrument Panel"

The reference image's premium quality comes from **containment and layered depth**: every
piece of content sits inside a bordered, rounded, internally-lit panel on a dark field, and
lighting sits *behind solid objects* rather than smeared across text.

### 3.1 Two corrections applied against the reference

1. **No chromatic gradient text.** `ui-ux-pro-max` flags "AI purple/pink gradients" as the
   6th-most-common anti-pattern in its corpus (13 rows), and the current
   `#5b8def → #b47cff → #f0c0ff` treatment measures ~1.2:1 in light mode. Premium headlines
   instead use a **luminance** gradient (`fg → fg/70`), with emphasis carried by a single
   solid accent.
2. **Accent role split.** No database row supports two chromatic accents. Therefore:
   - **Blue `--accent`** = the *interaction* accent — links, focus rings, primary CTA,
     active states, emphasis text. Always meets contrast in both themes.
   - **Violet `--accent-glow`** = *atmospheric only* — bloom behind solid objects, aurora
     stops, never a text or border colour.
3. **Blur is not decoration.** Per `blur-purpose`, real `backdrop-filter` is reserved for
   nav, overlays and a small number of floating hero elements (down from ~20 layers).
   Cards use a cheaper layered-surface treatment that is visually equivalent on dark.

### 3.2 Token system (`app/globals.css`)

Semantic, theme-responsive, mirrored in `lib/tokens.ts` for contexts that cannot read CSS
(OG image, inline SVG).

- **Surfaces:** `--surface-0` (page) → `--surface-1` (panel) → `--surface-2` (raised) →
  `--surface-3` (floating/overlay). rgba-based, never solid grey borders.
- **Borders:** `--border-subtle` / `--border` / `--border-strong` — all theme-aware. All
  `border-white/x` and `bg-white/x` utilities are removed (~90 occurrences) so the light
  theme stops needing an escape hatch.
- **Radius (fixed, monotonic):** `xs 8 · sm 12 · md 16 · lg 20 · xl 24 · 2xl 28 · 3xl 36`.
  `--radius-2xl` is now explicitly declared — previously it silently kept Tailwind's 1rem
  default, making `rounded-xl` (1.75rem) *larger* than `rounded-2xl`.
- **Type scale:** display 700 / −1.5 tracking; h1–h2 600 / −0.5; body 400 / 16px;
  labels Geist Mono 500 uppercase / +0.18em. Fluid `clamp()` steps as tokens, not inline styles.
- **Elevation:** four-step shadow scale, separate dark/light values.
- **Motion:** `--ease-out-expo`, `--ease-spring`, plus duration tokens. Premium range
  400–600ms for reveals, 150–300ms for micro-interactions.
- **Accent:** `--accent`, `--accent-contrast`, `--accent-glow`, `--accent-ring`, plus
  `--status-live` / `--status-wip` semantic states.

### 3.3 Primitives (built before any section)

`Panel` · `Button` · `IconButton` · `Eyebrow` · `Logo` · `Stat` · `MaskReveal` ·
`FocusTrap` · `Tag`. These replace 8 hand-rolled glass recipes, 5 icon-button sizes,
6 eyebrow sizes and 11 copies of the brand gradient.

## 4. Page composition

Target: **~4 viewport-heights** (from 7.6). Section rhythm tightened from ~290px padding +
80px header margin to a token-driven scale.

| # | Section | Composition |
|---|---|---|
| 1 | **Hero** | Two-column. Left: status pill, display headline, supporting paragraph, two CTAs, 4 verified stat cards. Right: `SystemDiagram` — a layered, labelled architecture visual with travelling data pulses and a floating "now building" card. Scroll cue. |
| 2 | **About** | Copy column + `LayerStack` — an isometric, interactive stack of labelled layers (UI → API → Domain → Data → Infra) with the real technologies used at each. |
| 3 | **Projects** | Featured panel (largest project, screenshot-led, verified metrics) + responsive card grid. Each card: thumbnail, glass surface, hover lift, animated border, stack tags, status chip, Case Study entry. |
| 4 | **Toolkit** | Grouped by Languages / Frontend / Backend & Data / Platforms & Tools / AI. Each entry is a tile with a hand-drawn monochrome brand glyph (`currentColor`), label, hover lift. |
| 5 | **Approach** | Process flow — Understand → Design → Build → Verify → Ship — each step carrying a *real example* from a real project, connected by a line that draws on scroll. |
| 6 | **Contact** | Email-as-headline, contact links, availability status, plus an original `OrbitField` visual (node network + orbit rings, pure SVG/CSS). |
| 7 | **Footer** | Minimal. |

## 5. Content strategy

Every line of copy is rewritten against fact-checked repo data. Corrections applied:

| Project | Correction |
|---|---|
| SentinelAI | `.NET 8` → **.NET 10**. "AI-generated" → deterministic template provider, stated plainly. Surface **8 bounded contexts / 27 projects / 0 cross-context references** and the explainable threat-score breakdown. |
| DeveloperOS | Grounded-answer claim qualified (mock provider by default, Ollama opt-in). Surface **363 tests, 0.82:1 test-to-source, 34 ADRs, zero runtime dependencies, vendored React with no build step**. |
| T Poker | "shipped on Android" → **web is live, Android built but unpublished**. Live URL → canonical `app.tpoker.app`. "Shared test suite" → mirrored fixtures. Surface **677 + 215 tests, 5 CI jobs, MediatR CQRS, 4 billing verifiers**. |
| GRAVITY FLOW | iOS claim removed (Android only). `103 tests` → **~220**. "Weekly leaderboards" → local, no server. Play CTA removed; status `v1.0.0-rc`. |
| Job Assistant | "No AI in v1" is stale → Claude re-ranking now exists, cost-capped, off by default. **7 adapters** (incl. LinkedIn via IMAP alert emails). 162 tests. |
| Orders & Delivery | Full rewrite: Java + JavaFX + JSON-over-TCP + 10-thread pool + generic DAO + Dijkstra routing. Labelled university coursework. Placed last. |

Project ordering is by verified strength: **T Poker (8) → SentinelAI (7) → DeveloperOS (7)
→ GRAVITY FLOW (7) → Job Assistant (7) → Orders & Delivery (4, coursework)**.

## 6. Defect fixes in scope

**P0 — correctness/security**
- `maskReveal` `clipPath` bug hiding all five section headings (already fixed).
- `api/chat`: role whitelist, type validation, rate-limit key, unbounded maps, ordering,
  non-200 upstream status, and a system prompt **generated from `data/`** so the bot knows
  all six projects.

**Accessibility**
- Real `FocusTrap` + focus restoration on all overlays.
- One `useMotionPref` hook routed through every animated component (was 4 of 17).
- `--fg-subtle` raised to pass AA in both themes; `.text-gradient` replaced.
- h1 double-announcement; duplicate `banner`/`contentinfo` landmarks; touch targets ≥ 44px;
  `<button>`-wrapping-`<article>` removed with the carousel.

**Performance**
- Delete `BootSequence` (~1.3s opaque overlay on every load).
- `AmbientGlow`: converge-and-stop rAF, `visibilitychange` gating, mouse-only, no
  `transition: background`.
- `next/dynamic` for CommandPalette / ChatWidget / CaseStudy / A11yPanel.
- Screenshots → WebP/AVIF; `next.config.ts` image config (`qualities`, `formats`);
  `priority` → `preload` (deprecated in Next 16); LCP image hinted.
- `experimental.inlineCss` (docs recommend it specifically for Tailwind).

**SEO**
- `JsonLd`: `alumniOf` currently names the *degree* as the institution — corrected to a
  `ProfilePage` + `@graph` with `hasCredential`.
- OG image: load Geist explicitly (Satori has no system fonts, so it silently renders in
  Noto); de-hardcode the year.
- `manifest.ts`, `not-found.tsx`, `error.tsx` added.

## 7. Dependencies

- **`lenis`** (~3kb) — smooth scroll, explicitly requested. Disabled entirely under reduced
  motion, native scroll on touch, conservative lerp. Tradeoff noted: momentum scrolling is a
  mild form of scroll-jacking; settings are chosen to stay well clear of motion sickness.

No other runtime dependencies. All visuals are code.

## 8. Verification

Production build; screenshots at 390 / 768 / 1440 / 1920; both themes; reduced-motion pass;
keyboard-only pass; heading-hierarchy and contrast checks; page-height comparison against the
6,852px baseline.
