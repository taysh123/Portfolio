# Tay Shofer — Portfolio

[![Live Site](https://img.shields.io/badge/Live%20Site-tayshofer.dev-5b8def?style=flat-square&logo=vercel&logoColor=white)](https://tayshofer.dev)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

A software-engineering portfolio built to be checkable. Every number on the site is
verifiable from the repository it describes, and every project says what it *isn't*
alongside what it is.

**Live:** [tayshofer.dev](https://tayshofer.dev) · **GitHub:** [taysh123](https://github.com/taysh123)

---

## Design system

Everything resolves through semantic tokens in [`app/globals.css`](app/globals.css).
There are no hardcoded colour literals in components — a constraint the light theme
depends on.

**Two rules the system enforces:**

1. **Accent role split.** `--accent` (blue) is the only *interaction* colour: links,
   focus rings, primary CTA, emphasis. `--glow` (violet) is atmospheric only — bloom
   behind solid objects, never text and never a border. Each theme carries its own
   accent value so both clear WCAG AA as text (6.15:1 dark / 4.83:1 light).
2. **Headlines use a luminance ramp, not a chromatic gradient.** `.text-sheen` runs
   `--fg → --fg/72%`, which behaves identically in both themes.

| Layer | Tokens |
|---|---|
| Surfaces | `--surface-0` (page) → `-1` (panel) → `-2` (raised) → `-3` (overlay) |
| Text | `--fg` · `--fg-muted` · `--fg-subtle` — all ≥ 5.5:1 in both themes |
| Borders | `--border-subtle` · `--border` · `--border-strong`, rgba only |
| Radius | `xs 8 · sm 12 · md 16 · lg 20 · xl 24 · 2xl 28 · 3xl 36` (monotonic) |
| Type | `--text-display / -h1 / -h2 / -h3 / -lead / -label`, fluid `clamp()` |
| Elevation | `--shadow-1..3` + `--shadow-float`, separate per theme |
| Motion | `--ease-out-expo` · `--ease-spring` · `--dur-fast/mid/slow` |

Panels are **translucent, not blurred**. The page field already carries a soft aurora,
so a low-alpha surface reads as glass without `backdrop-filter`. Real blur (`.glass`)
is reserved for nav and overlays, where it signals elevation and dismissal.

### Primitives

`Panel` · `Button` / `ButtonLink` · `IconButton` · `Eyebrow` · `Logo` · `Tag` /
`StatusChip` · `MaskReveal` · `Section` / `SectionHeader` · `Reveal` / `RevealItem` ·
`ProjectImage`.

---

## Projects

Ordered by verified strength. Status is stated honestly — a visitor never has to guess
whether something is deployed.

| Project | Status | What it is | Verified |
|---|---|---|---|
| **T Poker** | Live: web, App Store, Google Play | Poker study platform + home-game manager from one Expo codebase, ASP.NET Core CQRS backend | 892 tests · 5 CI jobs |
| **Aegis** (formerly SentinelAI) | Runs locally | SOC platform where module isolation is enforced by the compiler | 8 bounded contexts · 0 cross-context refs · 105 tests |
| **DeveloperOS** | Released | Local-first code workspace that refuses to answer without a file:line citation | 363 tests · 0.82:1 to source · 34 ADRs · 0 runtime deps |
| **GRAVITY FLOW** | v1.0.0-rc | One-touch Phaser 3 physics puzzler, Android-only | 150 levels · 220 tests |
| **Job Assistant** | Runs locally | Seven-adapter job pipeline delivering one Telegram digest | 162 tests · 310 filter terms |
| **Orders & Delivery** | University coursework | Hand-rolled JSON-over-TCP protocol, JavaFX client, Dijkstra routing | 16 protocol routes |

Content lives in [`data/projects.ts`](data/projects.ts). Each entry carries a
`honestNote` field naming the system's limits — the mock AI providers, the unpublished
builds, the local-only leaderboard, the missing CI.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2 (App Router, Turbopack) |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS v4 + CSS custom properties |
| Animation | Framer Motion 12 |
| Smooth scroll | Lenis (disabled entirely under reduced motion) |
| Fonts | Geist Sans + Geist Mono via `next/font` |
| Icons | Custom SVG — no icon library |
| Assistant | Groq `llama-3.1-8b-instant` via `/api/chat` |
| Deployment | Vercel |

**Environment:** `GROQ_API_KEY` is required for the chat assistant. Without it the
route returns HTTP 503 and a message pointing at email — it does not fail silently.

---

## Architecture

```
app/
  layout.tsx           # cookie-driven theme + a11y, metadata, JSON-LD
  page.tsx             # section order
  globals.css          # the token system
  api/chat/route.ts    # assistant; system prompt generated from data/
  opengraph-image.tsx  # Satori social card (Node runtime)
  manifest.ts · sitemap.ts · robots.ts · not-found.tsx · error.tsx
  
components/
  sections/            # Hero · About · Projects · Skills · EngineeringPanel · Contact
  effects/             # Workstation · ScreenUI · ArchitectureBoard · PipelineRun · HeroVisual · OrbitField · AmbientGlow
  ui/                  # the design system + overlays
  layout/              # Navbar · Footer
  providers/           # Theme · Accessibility · SmoothScroll
  seo/                 # JsonLd

data/
  projects.ts          # fact-checked project content + case studies
  skills.ts · approach.ts · socials.ts

lib/
  tokens.ts            # TS mirror of the tokens, for Satori and inline SVG
  motion.ts            # variants + easing + duration scale
  useReducedMotionPref.ts   # THE motion gate (OS query OR in-app toggle)
  useFocusTrap.ts      # focus trap + scroll lock for every overlay
  cn.ts · theme.ts · obfuscate.ts

proxy.ts               # security headers (Next 16 middleware rename)
```

### Visuals are code

Every illustration is original SVG/CSS in the design system — no stock art, no
external assets, no third-party brand marks.

- **`Workstation`** + **`ScreenUI`** (intro) — a laptop built from layered CSS gradients in
  a `preserve-3d` scene: chamfer, specular-band aluminium, hinge barrel, a tapered deck
  with a six-row keyboard, and a display holding **live DOM** — which is what lets the
  camera push through it and keep the boot log crisp.
- **`ArchitectureBoard`** (about) — five layers with continuous packet traffic descending
  the request rail and returning up the response rail.
- **`PipelineRun`** (approach) — five stations on a track the reader's own scroll fills;
  a horizontal board on desktop, a vertical job log on mobile.
- **`HeroVisual`** (hero) — the layered interface/services/data planes.

Contact deliberately carries **no illustration at all**: its atmosphere is a horizon —
a soft pool of light with a single hairline through it — because a generic orbit motif
said nothing about the work and cost 19rem of scroll on a phone to say it.

The Toolkit deliberately has **no per-technology brand logos**. Redrawing ~35
third-party marks from memory produces subtly wrong logos, which reads worse than none;
each group instead carries one purpose-drawn glyph in the site's own visual language.

---

## Accessibility

Verified by an automated pass (39 checks) across both themes, three viewports, and
reduced motion:

- **One motion gate.** `useReducedMotionPref` combines the OS media query with the
  in-app toggle, and every animated component routes through it. A CSS kill-switch
  cannot stop a `requestAnimationFrame` loop, so JS-driven motion has to be gated in JS.
- **Real focus traps.** `useFocusTrap` cycles Tab inside every overlay and restores
  focus to the control that opened it. Verified: focus stays inside the command palette
  across 30 tabs and the case study panel across 40.
- **Contrast.** `--fg` 17.9:1 · `--fg-muted` 9.0:1 · `--fg-subtle` 6.5:1 · `--accent`
  6.2:1 (dark); 18.0 / 8.2 / 5.5 / 4.8 (light).
- Sequential heading hierarchy, one `h1`, one `banner`, one `contentinfo`.
- Every control has an accessible name; hit areas ≥ 44px via transparent `::before`
  expanders where the visual is smaller.
- High contrast and larger-text modes actually take effect, because every surface and
  border resolves through a token.
- Status is never conveyed by colour alone — every status dot carries a text label.

---

## Performance

- **Transform/opacity only.** No animation touches width, height, or `filter`.
- **`AmbientGlow`** converges and stops its rAF loop, halts on `visibilitychange`, and
  never starts on touch input.
- **Continuous motion is CSS**, so it is compositor-driven and the reduced-motion
  kill-switch reaches it.
- **`next/dynamic`** for the command palette, chat widget and accessibility panel —
  none of them are in the first load.
- **Screenshots are WebP** (4.47 MB → 1.85 MB, 59% smaller); `next.config.ts` serves
  AVIF first and allowlists `quality: 90` (Next 16 silently clamps to `[75]` otherwise).
- **`experimental.inlineCss`** — the Next docs recommend it for atomic CSS like Tailwind.
- `preload` (not the deprecated `priority`) on the single LCP image.

**Known tradeoff:** reading cookies in the root layout opts `/` out of static
generation. That is deliberate — correct theme on first paint over a CDN cache hit.
Moving to a blocking inline script would restore static rendering if TTFB ever matters
more.

---

## Local development

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
npx next start       # serve the build
npx tsc --noEmit     # typecheck
npx eslint .         # lint
```

**Requirements:** Node.js 20+.

---

## License

MIT — use it as inspiration, but please don't copy it wholesale without attribution.

---

*Designed and built by [Tay Shofer](https://tayshofer.dev).*
