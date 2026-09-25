# Tay Shofer — Premium Portfolio Redesign

A production-oriented redesign starter for `tayshofer.dev`, built around a cinematic, product-launch style experience rather than a conventional developer portfolio.

## What is already built

- Scroll-driven opening scene: developer desk → laptop lid opens → screen boots → Tay identity → camera push into the portfolio.
- CSS/DOM premium laptop scene with no licensed Apple assets or logo dependencies.
- Pointer-reactive ambient particle field and subtle live lighting.
- Glass navigation with availability status.
- Large editorial hero: **I build software people can actually use.**
- Six full project scenes with a different visual language per product.
- T Poker phone composition, SentinelAI SOC monitor, DeveloperOS floating workspace, GRAVITY FLOW orbital scene, Orders workflow, Job Assistant terminal pipeline.
- About, metrics, technology bento, Think/Build/Ship, cinematic contact section.
- GSAP + ScrollTrigger for scrubbed animation; Framer Motion remains available for future component motion.
- Responsive layouts and a dedicated mobile intro timeline.
- `prefers-reduced-motion` fallback.
- Metadata, robots, sitemap, semantic headings, skip link, keyboard-safe links.

## Tech

The versions intentionally match the current portfolio repository as closely as possible:

- Next.js 16.2.6
- React 19.2.4
- TypeScript
- Tailwind CSS 4
- GSAP 3 + ScrollTrigger
- Framer Motion 12

## Start

```bash
npm install
npm run sync:assets
npm run dev
```

Then open `http://localhost:3000`.

`sync:assets` pulls the real project screenshots from the existing public `taysh123/Portfolio` GitHub repository. Placeholder artwork is included so the project still has a complete structure before syncing.

## Validation

```bash
npm run typecheck
npm run lint
npm run build
# or
npm run verify
```

## Recommended integration into the existing repo

Do **not** blindly overwrite the entire current portfolio. Claude Code should:

1. Create a branch such as `feat/premium-cinematic-redesign`.
2. Read the existing `CLAUDE.md`, `AGENTS.md`, theme/a11y provider, API routes, contact handling, SEO and security code first.
3. Keep production behavior that is not represented in this standalone visual build.
4. Port the new sections/component structure into the existing app.
5. Reuse the existing real `public/projects/**` assets rather than duplicating them.
6. Merge existing contact/security/accessibility behavior into the new UI.
7. Run the existing repo quality gates before replacing the deployed design.

See `docs/MIGRATION_MAP.md` and `PROMPT_FOR_CLAUDE_CODE.md`.

## Motion architecture

The opening laptop sequence is intentionally isolated in `components/IntroScene.tsx`. The laptop is CSS/DOM pseudo-3D, which makes it:

- fast to iterate,
- responsive,
- accessible,
- easy to deploy,
- independent of an external `.glb` model.

If a true 3D asset is later desired, Claude Code can replace only that scene with React Three Fiber without changing the rest of the site. See `docs/3D_UPGRADE.md`.

## Design principle

The target is not an Apple clone. The design borrows the useful principles: restraint, product-scale typography, one idea at a time, polished scroll choreography, large whitespace, and premium lighting — while keeping a distinct developer/product identity.
