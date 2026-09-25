# Claude Code Handoff Prompt

You are integrating a premium cinematic redesign into Tay Shofer's existing portfolio repository.

First, do not modify code yet. Read the full repository, especially `CLAUDE.md`, `AGENTS.md`, `README.md`, `app/`, `components/`, `data/`, `lib/`, `proxy.ts`, package scripts, API routes, accessibility/theme providers, SEO and existing project data. Then read this redesign package and all files in `docs/`.

Goal: migrate the redesign into the existing site without losing production behavior or rich case-study content.

Non-negotiable experience:
- Dark, restrained, premium product-launch aesthetic.
- Opening scroll sequence: developer desk -> closed laptop -> lid opens with scrolling -> boot sequence -> Tay Shofer identity -> camera push into screen -> portfolio.
- Avoid generic hacker/neon styling and avoid copying Apple assets/logos.
- One major idea per viewport.
- T Poker, SentinelAI, DeveloperOS and GRAVITY FLOW should each have a distinct visual world using the real existing screenshots.
- Live graphics should remain subtle and performant.
- Mobile must have its own lighter composition, not just a crushed desktop layout.
- `prefers-reduced-motion` must remain a first-class experience.
- Preserve contact/security/SEO/accessibility functionality from the existing repository.

Implementation guidance:
- Keep Next.js 16 / React 19 / Tailwind 4 compatibility.
- Add GSAP + ScrollTrigger for scrubbed motion.
- Start with the CSS/DOM laptop implementation from `components/IntroScene.tsx`; only add React Three Fiber later if it materially improves the result and performance remains strong.
- Adapt visual components to the existing richer `data/projects.ts` rather than replacing that data with the simplified version in this package.
- Reuse existing `/public/projects/**` images in place.
- Keep components modular. Do not create one giant page component.
- No unnecessary dependencies.

Before declaring complete, run all repository quality gates, fix every failure, and review desktop/mobile behavior. Summarize what changed, what was preserved, and any remaining optional polish.
