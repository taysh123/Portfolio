<!--
CREATIVE DIRECTION — proposed target experience. This is a design brief, NOT
authorization to redesign or deploy. Prototype-first: build and measure a 3D hero
proof-of-concept with a performance budget and a non-3D fallback before touching the
live site. Resolved (2026-11-18): the institution is NOT named, not even abbreviated;
featured projects = T Poker, Aegis, DeveloperOS, GRAVITY FLOW. Reference images (reference-01..04) are
AI-generated mood/direction only — never copy them into production assets.
-->

> **Status update 2026-11-18 (Tay; D1/D2 in `docs/RESEARCH_AND_DECISIONS.md`):** the direction is
> **calm / premium, evolving the existing Product Plates design** with restrained cyan/violet accents,
> following the reference README's take / do-NOT-take. **No 3D now** (a future, separate, measured
> prototype at most). Where this brief says dark cinematic, futuristic, bloom/glow, or a 3D hero
> (§2, §3, §5.1 visual sequence, §7), D1/D2 win. Everything else here still applies.

# Tay Shofer — Interactive Engineering Studio
## Creative Direction & Experience Brief

**Status:** Proposed target direction for review. This is a creative brief, not authorization to implement or deploy.

## 1. Vision

Create a distinctive, high-end digital portfolio that feels like entering a futuristic engineering studio. Combine 3D, carefully choreographed motion, real product visuals, interactive project objects, cinematic lighting, and professional storytelling.

**Core principle:** The design should impress the recruiter. The content should convince them to interview Tay.

The result should feel like a premium technology product and a creative developer portfolio, while remaining immediately understandable and useful to recruiters and engineering managers.

## 2. Art direction

- Experience: Dark Cinematic, Premium Tech, Interactive 3D, Advanced Motion.
- Base palette: deep black, midnight navy, dark blue.
- Accents: electric cyan/turquoise and violet/purple, with white/near-white text.
- Typography: modern geometric, distinctive, readable, with clear hierarchy.
- Materials: controlled glass surfaces, illuminated edges, layered depth, reflections, subtle bloom/glow.
- Atmosphere: precise, futuristic, premium, immersive, but not cluttered.
- Avoid: generic AI template aesthetics, random neon gradients, excessive glass cards, unreadable text, fake metrics, fake terminal/code content, irrelevant 3D objects, excessive motion.

## 3. Main concept — Interactive Engineering Studio

The visitor enters a futuristic digital workspace. A 3D workstation, monitors, floating project objects, ambient particles, lighting and depth create a coherent environment. The environment can react gently to pointer movement and scroll.

Project objects and monitors represent actual products and link to the related portfolio content. Use real screenshots and truthful product imagery. Never make a 3D scene the only navigation path to essential content.

The 3D experience is progressive enhancement: the website must remain useful and legible when WebGL is unavailable, disabled, or too expensive for the device.

## 4. Inspiration

### Bruno Simon — https://bruno-simon.com/
Learn from: memorable 3D storytelling, coherent spatial interaction, pointer response.
Do not copy: navigation requiring a visitor to play or learn controls.

### Henry Heffernan — https://henryheffernan.com/
Learn from: 3D workstation environment; monitors and objects act as portals into work.

### Brittany Chiang — https://brittanychiang.com/
Learn from: professional clarity, readable information hierarchy, project presentation, skills and contact accessibility.

### Tay's uploaded image references
Review every uploaded image individually. Record its composition, colors, lighting, typography, perspective, materials, object placement, interaction ideas, and which principles should be adapted. Do not copy images literally or treat generated reference artwork as actual site screenshots/assets.

## 5. Experience architecture

### 5.1 Hero / Opening

Draft content direction:
- `TAY SHOFER / PORTFOLIO`
- `Available for opportunities`
- `Building software. Turning ideas into products.`
- `Hi, I'm Tay Shofer.`
- `Software Engineer focused on full-stack development, intelligent systems and interactive experiences.`
- `Explore my work ↗`
- `Download CV ↓`
- Optional: `SCROLL TO EXPLORE`

Visual sequence:
1. Brief, non-blocking reveal of the 3D environment.
2. Camera gently reveals or approaches the workstation.
3. Ambient lighting and particles begin subtle motion.
4. Hero copy animates in with clear hierarchy.
5. Pointer movement adds controlled camera/parallax response.
6. Monitors can show genuine product captures or truthful previews.
7. A coherent transition can lead into projects.

No long preload, blocking splash, or heavy autoplay video. Content and CTA must appear quickly.

### 5.2 About / Who Am I

A concise professional introduction: Computer Science graduate, Software Engineer, building full-stack systems, intelligent platforms, and interactive experiences. Include approved education details, real core strengths, GitHub, LinkedIn, and CV.

Potential visual: an elegant 3D/holographic profile panel with restrained floating technology labels. All technology labels must be verified against actual project evidence. Earlier site content deliberately omitted the university/institution; do not add it without explicit owner confirmation.

### 5.3 Featured Projects

Four products should receive primary visual emphasis, subject to verification against current local data:
- T Poker — published mobile/web product.
- Aegis — security operations platform, formerly SentinelAI.
- GRAVITY FLOW — physics puzzle game, formerly referred to in older materials as Gravity Game.
- DeveloperOS — local-first developer tool.

Projects should feel like independent product stories, not small generic cards. Each card/object can have controlled elevation, glow, preview, and hover/focus/touch response.

Every project story/case study should include as applicable:
- genuine preview/capture or working demo
- overview and problem
- Tay's specific contribution
- architecture/system flow diagram
- verified technology stack
- engineering decisions, challenges, solutions
- tests and verification evidence
- measurable results only when actually measured
- honest current status and limitations
- live/demo/repository links, observing privacy

Consider dedicated case-study routes so content is shareable, indexable, and has per-project metadata.

### 5.4 Technical Arsenal

Organize languages, frontend, backend, data/messaging/infrastructure, testing/delivery, and tools. Connect skills to projects as evidence. Avoid a wall of logos and unsupported proficiency claims.

### 5.5 Engineering Journey

A factual timeline of education, key projects, published products and professional development only if it adds meaningful context. Never invent jobs, dates or outcomes.

### 5.6 Contact

Closing statement such as `Let's build something meaningful.` Provide working email, LinkedIn, GitHub and Download CV. Keep the contact action obvious and simple.

## 6. Motion and interactivity

Potential layers:
- ambient particle system with restrained pointer response
- 3D parallax and subtle camera movement
- scroll-driven choreography and transitions
- project objects/cards with useful hover, focus, keyboard, and touch states
- real or clearly labeled illustrative data graphics
- polished micro-interactions

Effects must be coherent and purposeful. Respect `prefers-reduced-motion`; replace large positional movement with simpler opacity/state changes where appropriate. Pause animations when off-screen or the tab is hidden. Provide manual interaction alternatives and avoid hijacking scroll.

## 7. Proposed technology responsibilities

Research compatibility and trade-offs before choosing:
- Three.js / React Three Fiber / Drei: 3D environment and interaction.
- GSAP + ScrollTrigger: complex, choreographed scene timelines and scroll sequences if justified.
- Motion for React: UI-level transitions and micro-interactions.
- Blender: custom 3D asset creation and optimized GLB/glTF export; not a browser runtime dependency.
- CSS/Web Animations API: simple transitions where lighter and easier.
- Optional Lenis: only if there is demonstrated benefit and compatibility with native scroll, accessibility, and ScrollTrigger.
- Lucide: consistent UI iconography.

Do not run multiple animation systems over the same properties. Do not add every library simply because it is available.

## 8. Performance, accessibility and robustness

Core Web Vitals good thresholds:
- LCP <= 2.5 seconds.
- INP <= 200 milliseconds.
- CLS <= 0.1.
Use 75th percentile field data when assessing real user experience; lab scores are proxies, not equivalent evidence.

Additional requirements:
- aim for 60 FPS desktop 3D only where measured on representative hardware
- adaptive mobile graphics and a designed fallback
- lazy-load 3D assets and sections
- optimize GLB geometry, texture size/format, compression, DPR and draw calls
- bound particle counts and expensive shader/postprocessing work
- stop or reduce rendering when scenes are off-screen/hidden
- handle WebGL unavailable/context loss gracefully
- support keyboard, touch, focus visibility, contrast, semantic HTML, labels and alt text
- honor OS/browser reduced-motion settings
- ensure content is not only available inside a canvas
- keep content, navigation and CV available without waiting for the 3D scene
- preserve SEO, metadata, canonical routes, sitemap, robots and Open Graph

## 9. Project phases

- M0: audit, research, creative direction, tool/environment inventory, canonical docs.
- M1: approved art direction, design system, page layouts, storyboard, motion spec.
- M2: 3D hero proof of concept, fallbacks and performance measurements.
- M3: main portfolio sections and responsive layout.
- M4: motion system and scroll choreography.
- M5: individual project case studies and genuine project assets.
- M6: performance, accessibility, security, SEO, visual and responsive QA.
- M7: release candidate, preview review, owner approval, controlled production release.

No major implementation begins until Tay reviews and approves the concrete visual plan, including moodboard, typography, tokens, page layouts, hero storyboard and motion behavior.

## 10. Decision rule

The goal is not to maximize visual complexity. It is to maximize a distinctive, memorable experience while preserving clarity, credibility, speed, accessibility, and recruiter conversion. When a visual effect harms those goals, simplify or remove it.
