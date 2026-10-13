# Tay Shofer — Portfolio

[![Live Site](https://img.shields.io/badge/Live%20Site-tayshofer.dev-1a4fe0?style=flat-square&logo=vercel&logoColor=white)](https://tayshofer.dev)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

A software-engineering portfolio built to be checkable. Every claim on the site comes from
[`data/projects.ts`](data/projects.ts), which was checked against the repositories it describes, and every project
says what it *isn't* alongside what it is.

**Live:** [tayshofer.dev](https://tayshofer.dev) · **GitHub:** [taysh123](https://github.com/taysh123)

The site is in **English** (`/`) and **Hebrew** (`/he`, right to left): the same page, the same facts, two stable URLs.

---

## Design (M10: Product Plates)

An editorial product studio. The page is paper; each of the four products sits on its own **plate** — T Poker navy
with its own gold lockup, Aegis steel, DeveloperOS violet, GRAVITY FLOW teal — and every plate shows real captures
of the product, never invented UI. Light is the default theme; dark is the visitor's choice.

- **Tokens** live in [`app/globals.css`](app/globals.css). A plate is a tone scope: it re-declares the ink tokens it
  needs, so buttons, links and the focus ring read correctly on it. One interaction colour (`--accent`); borders are
  rgba so they sit on any plate. [`tests/unit/tokens.test.ts`](tests/unit/tokens.test.ts) holds the contrast floors
  for the page and every plate (text ≥ 15:1, muted ≥ 7:1, subtle ≥ 5.4:1, accent ≥ 4.5:1).
- **Type:** Geist via `next/font`; no monospace web font. No eyebrows, no decorative numbers, no metric tiles.
- **Type in Hebrew:** Heebo for Hebrew letters, Geist for every Latin one (names, code, numbers), so technical terms
  look the same in both languages.
- **Images:** AVIF with WebP fallbacks at explicit sizes, cut from the projects' own captures by
  [`scripts/m10-images.mjs`](scripts/m10-images.mjs) (crops only). About's visual is not an image of its own: it lays
  four of those captures out in HTML and CSS (`components/sections/AboutVisual.tsx`), with a scroll-driven settle and
  drift where the browser supports it.
- **No WebGL, no scroll library, no pinned scenes.** Interactions that matter work without JavaScript: T Poker's
  three-step walkthrough and the Stack's project filter are radio groups styled with `:has()`.

## Projects

| Project | Status | What it is |
|---|---|---|
| **T Poker** | Live: web, App Store, Google Play | Home-game manager and poker study app from one Expo codebase, ASP.NET Core CQRS backend, integer-cent settlement |
| **Aegis** | Runs locally · source on GitHub | Security operations centre: eight modules with no project references between them, RabbitMQ pipeline, live SignalR alerts |
| **DeveloperOS** | Released (v1.0.0) | Local-first code workspace that answers from your own files with file:line citations, or declines |
| **GRAVITY FLOW** | Release candidate | One-touch gravity puzzler in Phaser 3 and strict TypeScript, 150 levels across 15 worlds, Android and web |
| **Job Assistant** | Runs locally | Seven-adapter job pipeline delivering one Telegram digest |
| **Orders & Delivery** | Academic coursework | Hand-rolled JSON-over-TCP protocol with a JavaFX client |

Each entry carries an `honestNote` naming the system's limits.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2 (App Router, Turbopack) |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS v4 + CSS custom properties |
| Animation | CSS transitions and scroll-driven animations; Framer Motion only inside the case-study, accessibility and chat panels (loaded on demand) |
| Fonts | Geist and Heebo via `next/font` |
| Languages | English and Hebrew without an i18n library: `lib/i18n.ts` (routing), `lib/dict.ts` (interface), `data/he/` (copy) |
| Tests | Vitest (unit, content truth, contrast) · Playwright (e2e, axe, budgets) |

**One optional environment variable:** `GROQ_API_KEY`, for the portfolio assistant ([`app/api/chat/route.ts`](app/api/chat/route.ts),
Groq's `llama-3.1-8b-instant`). It is read on the server only. Without it the site works and the assistant answers
that it is offline.

## Layout

```
app/
  layout.tsx           # cookie-driven theme + accessibility modes; <html lang dir> from the page's path
  page.tsx, he/page.tsx  # the English and Hebrew pages (components/Site.tsx: Hero → Work → About → Stack → TBS → Contact)
  api/chat/route.ts    # the portfolio assistant's backend (rate-limited, server-side key)
  globals.css          # the token system and plate scopes
  opengraph-image.tsx  # the English social card; he/opengraph-image.png is the Hebrew one (scripts/og-he.mjs)
proxy.ts               # security headers, and the page's language for the root layout
components/
  sections/            # Hero · About · Stack (+ lens) · ThinkBuildShip · Contact
  work/                # PokerChapter · AegisChapter · DeveloperOSChapter · GravityChapter · MoreWork · case study host
  layout/              # Navbar · LanguageSwitch · Footer
  chat/                # ChatLauncher (always present) · ChatPanel (loaded on first use)
  ui/                  # Button · TextLink · Pic · StoreBadge · CaseStudyPanel · AccessibilityPanel · …
data/                  # projects (fact-checked) · work (chapter copy) · skills · images · socials
data/he/               # the Hebrew copy, parallel to data/ (facts and figures stay in the English records)
lib/                   # i18n · dict (interface strings, both languages) · content (a page's copy in one language) · bidi
public/work/           # the page's images (scripts/m10-images.mjs)
```

## Accessibility

- One `h1`; every product and section an `h2`. Skip link, landmarks, visible focus (solid accent, ≥ 3:1 on every
  surface), 44 px targets below desktop widths.
- Reduced motion from the OS or the in-app panel; high-contrast and larger-text modes resolve through the tokens.
- axe (WCAG 2.2 A/AA + best practice) runs in the e2e suite in both themes at 1440 and 390 px.

## Performance

- First-load JavaScript is budgeted in [`tests/e2e/budget.spec.ts`](tests/e2e/budget.spec.ts) (≤ 205.7 KiB gzip).
- The case study, accessibility and chat panels mount only when asked for; the chat's launcher is the one overlay
  control on the first load.
- An external stylesheet, not `experimental.inlineCss`: inlining duplicated ~64 KiB of CSS into the HTML and the
  RSC payload, and measured slower on mobile (see `next.config.ts`).
- Every image has its real dimensions; only the two largest first-screen images are fetched at high priority.

**Known tradeoff:** reading cookies in the root layout opts `/` and `/he` out of static generation — correct theme on
first paint over a CDN cache hit.

## Local development

```bash
npm ci
npm run dev          # http://localhost:3000
npm run build && npm start
npm run typecheck && npm run lint && npm test
npx playwright test  # needs `npm run build` and a Chromium (`npx playwright install chromium`)
```

**Requirements:** Node.js 20.9+.

---

## License

MIT — use it as inspiration, but please don't copy it wholesale without attribution.

---

*Designed and built by [Tay Shofer](https://tayshofer.dev).*
