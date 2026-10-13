# M8 reference research (2026-10-12)

**Source catalog:** `emmabostian/developer-portfolios` README, with 2,036 linked portfolios.

**Method, and its limits:**
- **Live sites unreachable.** This cloud environment's network policy rejects connections (proxy `403` to CONNECT) to the suggested live sites: adhamdannaway.com, terminal.iabhinav.me, abdulrehmanwaseem.me, akshay-santhoshkumar.vercel.app, aarav-sharma-liart.vercel.app, abhisheksharma.codes, plus brittanychiang.com and joshwcomeau.com. They were **not** inspected, and nothing below is inferred from them.
- **What was inspected instead:** the deployed source of catalog portfolios hosted on GitHub Pages. Anonymous git reads are allowed here.
  - From the 269 GitHub Pages entries, a sample of 60 was shallow-cloned. 54 cloned; 6 had no matching repo.
  - Each was scored for motion techniques (GSAP/ScrollTrigger, Three.js, canvas, IntersectionObserver, scroll-driven CSS, SVG line drawing).
  - Each was served on `localhost` and driven in headless Chromium in a disposable context, at 1440×900 and 390×844.
  - Captures included the hero, scroll frames taken twice (250 ms and 1.35 s after each scroll, to see motion settle), a hover state, and live animation counts.
  - Seven sites got scripted probes: time samples, finer scroll steps, clicks and hovers.
- **CDN libraries:** these were blocked too, so the exact versions each page requests (gsap 3.12.2, three r128, vanilla-tilt 1.8.0, typed.js 2.0.12) were served from local npm installs with install scripts disabled. Web fonts and analytics stayed blocked, so fallback fonts appear in some captures.
- **Raw captures:** scratchpad `research/obs/<slug>/` and `research/probe/<slug>/`, not committed.

## Inspected (15)

| Site (GitHub Pages) | What it does, as observed | Works | Could be better |
|---|---|---|---|
| oyi77.github.io | Hero terminal types commands over ~3 s (sampled at 0.9 s steps); a stats marquee drifts sideways; "Receipts, not promises" counters animate in on scroll; an upstream-PR table is dated "verified against the GitHub API on …" | Proof framed as checkable data, with a verification date | Marquee and terminal compete; green-on-black "hacker" costume |
| p-sushanth (portfolio) | "Are you a recruiter? YES/NO" gate before any content. After YES: a serif left index (About, Education, Projects…) with the active chapter underlined, and a top progress line that grows with scroll | A persistent chapter index that always says where you are | The gate blocks content; Three.js loaded but barely visible |
| anhnq15.github.io | The whole site is an IDE: clicking `lifecycle.yaml` or `ocr.py` in the explorer scrolls to that section and lights the matching tab and file; a 6-step Spec → Test lifecycle row | Navigation metaphor drawn from the craft, doubling as a location indicator | Monospace everywhere becomes a costume; the copy claims 10+ years |
| cristianbarreiro.github.io | A boot overlay ("Initializing portfolio") before content. Tech Stack toggles List ⇄ 3D Globe; the globe rotates technology icons; "Click a technology to explore it" panel | Technologies as something you can explore and relate | The boot screen delays content; icons broke offline; the globe adds spectacle, not meaning |
| qazimaazarshad.github.io | A monogram loader, then technology chips (React, TypeScript, Java, Spring Boot) orbit a portrait ring (they move between 1.2 s samples) | Orbit as a composition device around one focal object | The orbit is decoration; chips carry no information |
| abhish0 (My-Portfolio) | A typed role line with a blinking cursor; a twinkling starfield; GSAP ScrollTrigger reveals; projects with a Problem / Architecture / Challenges / Learned grid | A structured case-study grid that explains engineering, not just shows it | The typed line delays the key message; a gold glow on every card |
| devravik.github.io | Faint code snippets and cubes drift behind the hero (canvas; positions change between samples); a terminal card with a `tail -f work.log` | — | Ambient motion with no meaning; it competes with the portrait |
| rensithudara (portfolio) | A hero image carousel; giant ghost words ("Resume", "Skills") behind headings; skill **percentage bars** | Ghost type gives headings depth | Skill percentages are meaningless (avoid); the carousel hides content |
| saiteja13427.github.io | Illustration sections slide and fade in per heading (faint at 250 ms, settled at 1.35 s) | Clear scroll reveals | A shared template (identical to lucifernipun22); generic illustrations |
| lucifernipun22.github.io | The same template as saiteja13427 | — | Template look |
| ncsdecoopman.github.io | Particle background (tsParticles from a CDN, which failed here) and heavy CSS keyframes | — | Couldn't be judged fully: its particle library wasn't in the shim |
| bekahhw.github.io, sridattasai18 (neo-folio) | Static at rest (0 running animations measured) | Calm and readable | Little to learn for motion |
| developersharif (me), azwadfawadhasan (resume) | Rendered broken locally: a blank app built for another base path; missing jQuery and CSS | — | Not judged |

## Selected references (6) and the principle taken from each

1. **oyi77 → proof as checkable data.** The new hero graph is *derived* from `data/projects.ts`: an edge exists only where two projects list the same technology, and a unit test enforces it. Nothing is decorative telemetry.
2. **p-sushanth → a persistent chapter index with a location signal.** This becomes the **signal spine**: a fixed rail of chapters with a signal that rides the page's scroll position and lights the current chapter. No gate, and nothing is withheld.
3. **anhnq15 → navigation drawn from the craft.** The spine and the hero graph use the vocabulary of systems (nodes, edges, signal), not an IDE costume. The navbar stays plain English.
4. **cristianbarreiro → technologies you can explore.** Stack gains a **project lens**: choosing a project highlights the tools it actually uses. It is list-first, keyboard-operable and has no globe.
5. **qazimaazarshad → orbit as composition.** This is used only where orbit *means* something: GRAVITY FLOW's inverse-square well, drawn as a trajectory around the real gameplay.
6. **abhish0 → explain the engineering, in sequence.** The Aegis flow animates packets through its *implemented* stages (including the fan-out after alert generation found in the code). DeveloperOS shows its retrieval sequence: scan → FTS5 index → bm25 rank → cite or decline.

**Counter-examples deliberately avoided:**
- entry gates and boot screens (p-sushanth, cristianbarreiro, qazimaazarshad);
- skill percentages (rensithudara);
- ambient particles and drifting snippets with no meaning (devravik);
- typed text that delays the key message (abhish0, oyi77);
- template illustrations (saiteja13427, lucifernipun22).

## Why the result stays original
- **No layout, artwork, copy or code was copied.** The concept, a *living system map of Tay's own projects*, is built from his project data. Its graph topology is unique to his work: T Poker is the hub through C#, TypeScript and CI; DeveloperOS and Job Assistant are joined by Python and SQLite.
- **Each flagship's motion is drawn from that project's own mechanism:** settlement transfers, an event pipeline, retrieval with citations, and inverse-square gravity. None is a generic effect.
