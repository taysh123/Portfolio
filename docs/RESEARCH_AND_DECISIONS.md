# Research & Decisions

Decision log plus the tool, skill, and MCP research for the redesign. Labels: **VL** = verified
locally (this machine, plus read-only GitHub/live-site checks), **VD** = verified from official docs
(URL given), **NC** = needs confirmation. Created 2026-11-18 (M0 audit); decisions recorded the same day.
Tay decides everything here.

---

## 1. Decisions

### Resolved (Tay, 2026-11-18)

**D1 — Design direction: CALM / PREMIUM, evolving Product Plates (not a full replacement).**
- Evolve the existing "Product Plates" design (M10) rather than replace it. Use **restrained**
  cyan/violet accents.
- Follow the reference README's "take / do NOT take" exactly. That file exists only on the stale branch:
  `git show reference/premium-redesign-package:design/references/README.md`. Its rules:
  - **Take:** the dual-monitor composition (large primary square to camera, smaller secondary angled
    in); the camera just above desk height; the desk layout; the portfolio itself on the primary screen
    and real engineering surfaces on the secondary; "the product-photograph feeling — an object staged
    deliberately, not a snapshot of a room."
  - **Do NOT take:** the purple and green LED wash ("Not RGB everywhere"); the floating holographic cube
    ("Not futuristic"); the circuit-board desk mat; the neon under-shelf and under-desk strips; **the
    fabricated on-screen stats** ("50+ Projects", "10M+ Events Processed", "99.99% Uptime"); and any
    obviously AI-generated artwork or artefacts.
  - Mood: calm, focused, premium, quiet, intentional. Materials: walnut, matte black, oak, brushed
    aluminium. References: Apple, Linear, Stripe, Vercel, Raycast.
- `docs/CREATIVE_DIRECTION.md` still applies for structure, content, accessibility, and performance. Its
  "dark cinematic / futuristic / bloom" art direction (§2–§3) and its 3D-hero plan are **superseded** by
  D1 and D2.

**D2 — 3D: NOT now.**
- No 3D or WebGL in the current work. A 3D hero stays a possible **future, separate, measured
  prototype** (ROADMAP M2, deferred).
- The production guard tests are **not** modified in this work: the `three`/`lenis`/WebGL/`<canvas>`
  bans in `tests/unit/dead-code.test.ts`, `tests/e2e/budget.spec.ts:47` and `tests/e2e/page.spec.ts`,
  and the first-load JS budget (≤ 205.7 KiB gzip) in `tests/e2e/budget.spec.ts:7`.

**D3 — Docs branch:** done. The M0 docs are on `docs/m0-audit`, cut from `origin/main` (`3f0c5e5`),
**PR #4, merged 2026-11-18** (merge commit `661dce1`).

**D4 — Duplicate `ui-ux-pro-max`:** done. The project-local copy is gone from the working folder: it
was never on `main`, and the leftover ignored `__pycache__` files were deleted. The user-scope plugin
2.11.0 stays installed and enabled. The old copy remains only inside the stale branch's history,
untouched. Nothing references the removed path (VL).

**D5 — Public git history:** leave as-is. No history rewrite, and the repo stays public.

**D6 — Content fixes:** approved and shipped. **PR #5, merged and deployed 2026-11-18** (merge commit
`841d062`; commits `7bddd19`, `36f6001`, `e105917`; see N5 for the last two):
- `data/projects.ts:150`: T Poker billing no longer presented as "a swappable detail". It now reads
  "Billing verifies Apple and Google Play purchases, and its disabled mode fails closed."
- `data/projects.ts:396`: "each of the seven mechanics" → "each of the **other six** mechanics", which
  matches its six-item list. Not a bare "six": the game has seven mechanics, the attractor plus six
  `LevelConfig` mechanics (verified in the game repo; see WORKLOG session 2). So the "seven core mechanics"
  copy (`:356`) and the "7" stat (`:367`) stay correct and consistent.
- `data/projects.ts:172` ("guest progress carries into the new account") is **unchanged** and stays
  **NC** until it is checked against the T Poker repo.

**D7 — Language:** Claude Code talks to Tay in **English**; Chat Claude (claude.ai) talks to Tay in
**Hebrew**. `docs/PROJECT_CONTEXT.md` §9 is updated to match.

**D9 — Tool installs:** Context7 **installed** on Tay's go (§3.1). Web-design-guidelines: not yet.
Impeccable: skip. GitHub plugin: skip (`gh` covers it).

**N5 — GRAVITY FLOW repository: stays private (Tay).** The fix is in the data, not by exposing code. PR #5:
- `36f6001`: `data/projects.ts:359` is `repo: { visibility: "private" }`, like T Poker. The dead link is
  gone from the chapter, case study, JSON-LD and assistant prompt; the case study shows "Private repository".
  `tests/unit/private-repo.test.ts` pins it.
- `e105917`: the **served résumé PDF** (`public/resume/Tay-Shofer-Software-Engineer-Resume.pdf`) no longer
  links `github.com/taysh123/Gravity-Game`. On page 2 the line ends "| Live web build". URI links went
  13 → 12, and all other links are kept. The file is still two pages, now **80,593 bytes** (was 81,782). The
  Contact label is "two pages, **79 KB**" (`lib/dict.ts:49`), and `tests/e2e/lower.spec.ts` pins 80593 and
  "79 KB". Tay's personal résumé copies were already clean.
- Verified on the final tree: build ✓, typecheck ✓, lint ✓, Playwright **132/132**, unit 118/119 (N6 only).

### Still open

- **D8 — Branch cleanup:** local `docs/m0-audit` and `fix/content-accuracy` were deleted after merging;
  local `main` is current. Still to decide: local `feature/premium-portfolio-redesign` and
  `reference/premium-redesign-package`, and on GitHub `production/no-entrance`, `feature/portfolio-polish`,
  five `review/m10-*` snapshots, `reference/premium-redesign-package`, and the merged `docs/m0-audit` /
  `fix/content-accuracy`. Keep or prune? Nothing gets deleted without an explicit yes per branch.
- **N1 — Reference README on `main`?** D1 relies on `design/references/README.md`, but it exists only on
  the stale branch (the rules are quoted above so the decision stands on its own). Should its text be
  copied onto `main`, for example under `docs/`? The PNG is AI-generated and probably should not be.
- **N2 — Literal institution abbreviation in docs.** Production's guard deliberately stores the
  institution as hashes "because review snapshots of this repository are public"
  (`tests/support/institution.ts`). The tests scan site code, not docs, so docs don't fail them. Still,
  four lines written for agents spell the abbreviation out (`CLAUDE.md` standing constraints,
  `claude/START-HERE.md` standing rules, and the header comments of `docs/PROJECT_CONTEXT.md` and
  `docs/CREATIVE_DIRECTION.md`), and since PR #4 they are in the public tree.
  Replace them with "the institution"? Not changed: they are Tay's own wording.
- ~~N3 — GRAVITY FLOW mechanics count~~ **Resolved:** seven is correct (game repo `MechanicId` lists 7);
  PROJECT_CONTEXT §4.4 needs no change.
- ~~N5 — GRAVITY FLOW repo link 404s for visitors~~ **Resolved and live** (see N5 under Resolved; PR #5,
  deployed 2026-11-18).
- **N6 — Windows-only false failure in `tests/unit/site.test.ts:78`** (path separators). Optional one-line
  test fix; the guarded invariant holds.
- **N4 — Why was October's entrance pulled?** This is no longer blocking (D2 = not now), but answer it
  before any future M2 prototype.

---

## 2. Inventory: TOOLS_AND_SKILLS.md checklist vs what is installed (VL, 2026-11-18)

Environment: `claude` 2.1.327 · Node v24.18.0 · npm 11.16.0 · Windows 11.

| Item (checklist priority) | Status | Where / version / scope | Action |
|---|---|---|---|
| Frontend Design (Required) | **INSTALLED** | `frontend-design@claude-plugins-official` 1.1.1, user | None |
| Impeccable (High) | MISSING, **skipped** (D9) | none | Do not install (§3.4) |
| UI UX Pro Max (High) | **INSTALLED** | `ui-ux-pro-max@ui-ux-pro-max-skill` 2.11.0, user. Project-local duplicate removed 2026-11-18 (D4) | Do not reinstall |
| Vercel web-design-guidelines (High) | MISSING, **not yet** (D9) | none | Later, on Tay's go (§3.2) |
| Superpowers (High) | **INSTALLED** | `superpowers@superpowers-marketplace` 7.0.0, user | **Do not** also install `superpowers@claude-plugins-official` (duplicate) |
| Playwright MCP (High) | **INSTALLED, connected** | `playwright@claude-plugins-official` plugin, runs `npx @playwright/mcp@latest` | **Do not** run `claude mcp add playwright …` (duplicate). Note: `@latest` is unpinned |
| Context7 (High) | **INSTALLED** 2026-11-18 (D9) | `context7@claude-plugins-official` e6143c9807a0, user scope, enabled; MCP `plugin:context7:context7` (HTTP) shows "Needs authentication" | Tay: run `/mcp` → context7 → sign in once |
| GitHub (High) | PARTIAL, plugin **skipped** | `gh` CLI authenticated, scopes `repo`, `read:org`, `gist` | Use `gh` |
| Figma (Conditional) | **CONNECTED** | claude.ai Figma connector (MCP connected) | **Do not** install the Figma plugin unless you want its bundled skills |
| Vercel (Optional) | **CONNECTED** | claude.ai Vercel connector, with **write-capable** tools (deployments, env, domains, rollback) | Use read-only tools only; never write without your explicit ask |
| Not in checklist | present | `typescript-lsp` 1.0.0 plugin; Canva, Drive, Gmail, Calendar, Claude Docs connectors; career plugins (unrelated) | None |
| `npx skills list` / `npx skills ls -g` | **NOT RUN** | The `skills` CLI isn't on this machine; `npx --no` refused to download `skills@1.9.0` | Runs as part of §3.2 if approved |

Skill folders: `~/.claude/skills/` holds only the claude.ai `synced/` set. `~/.agents/skills` is absent.
The working folder has no project `.claude/` directory any more (D4).

---

## 3. One-at-a-time install plan (approve each separately)

Commands are as the official sources state them on 2026-11-18. Re-check on install day, per TOOLS_AND_SKILLS policy.

### 3.1 Context7: version-specific docs (Next 16.3, React 19, Motion; three/GSAP later if M2 happens). INSTALLED 2026-11-18

Result: `claude plugin install context7@claude-plugins-official --scope user` succeeded. `claude plugin list`
shows it enabled (user scope); `claude mcp list` shows `plugin:context7:context7 … (HTTP) - ! Needs
authentication`. A one-time browser sign-in via `/mcp` completes it. The plan as approved follows.

- **Command:** `claude plugin install context7@claude-plugins-official --scope user`. The scope options
  are `user` (default, `~/.claude/settings.json`, all projects), `project` (`.claude/settings.json`,
  committed to the repo), or `local` (this project on this machine only). The marketplace entry is VL
  (`external_plugins/context7`: a remote HTTP MCP at `https://mcp.context7.com/mcp`). The flags are VL
  from `claude plugin install --help`. The `name@claude-plugins-official` pattern is VD
  (github.com/anthropics/claude-plugins-official).
- **Permissions and data flow:** no local process (hosted MCP). Context7 may ask for a browser sign-in on
  first use. Doc queries (library names and questions) go to context7.com. An API key is optional
  (higher rate limits). VD: context7.com/docs/clients/claude-code, github.com/upstash/context7.
- **Overlap:** for Next.js itself, AGENTS.md already points to `node_modules/next/dist/docs`. Install only
  **one** Context7 route. Setup, plugin, and a manual `claude mcp add` each register a separate `context7` server (VD).
- **Verify:** `claude plugin list` and `claude mcp list` show `context7`.
  **Undo:** `claude plugin uninstall context7@claude-plugins-official`.

### 3.2 Vercel web-design-guidelines: UI/a11y audit pass. NOT YET (D9)

- **Command (user scope keeps skill folders out of the repo, as in M10):**
  PowerShell: `$env:DISABLE_TELEMETRY=1; npx skills add vercel-labs/agent-skills --skill web-design-guidelines -a claude-code -g`
  Project scope instead: drop `-g`. That writes `.claude/skills/` plus `skills-lock.json` into the repo.
  VD: github.com/vercel-labs/skills (README, docs/commands.md, docs/agents.md).
- **Permissions and data flow:** `npx` downloads the `skills` CLI from npm (`skills@1.9.0` at audit time,
  VL). The CLI sends telemetry and audit requests unless `DISABLE_TELEMETRY=1` or `DO_NOT_TRACK=1` is set
  (VD). **The skill fetches its rules at run time** from
  `raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md` (VD).
- **Verify:** `npx skills ls -g`. **Undo:** remove it via the CLI (exact subcommand NC) or delete its folder under `~/.claude/skills/`.

### 3.3 GitHub plugin: SKIPPED

`claude plugin install github@claude-plugins-official` would add a remote MCP
(`https://api.githubcopilot.com/mcp/`) needing a PAT in `GITHUB_PERSONAL_ACCESS_TOKEN`, acting across
every repo that token reaches (VL from the marketplace `.mcp.json`). `gh` already covers read-only
inspection. If ever wanted, use a fine-grained, read-only PAT for `taysh123/Portfolio` only.

### 3.4 Impeccable: SKIPPED

Overlaps the installed design skills. Its README notes "Hooks run outside model approval", and its Live
mode can launch the `claude` CLI with `--permission-mode bypassPermissions`. Telemetry is on by default (VD:
impeccable.style/docs, github.com/pbakaus/impeccable).

### Not to install (already present; would duplicate)

Playwright MCP, Superpowers, UI UX Pro Max, Frontend Design, the Figma plugin (connector already connected).

---

## 4. Runtime library notes (research only; nothing installed)

| Tool | Facts so far | Label |
|---|---|---|
| Motion for React | `framer-motion` 12.40.0 is already a dependency and lazy-only (Chat/A11y/CaseStudy panels). No need for a second animation package. | VL |
| Three.js / R3F / Drei | Not now (D2). Banned by production tests. Compatibility with React 19.2 / Next 16.3 to be confirmed only if a future M2 is approved. | VL (ban) / NC (compat) |
| GSAP + ScrollTrigger | Not present. Only relevant if M4 needs choreography Framer Motion can't do. Must not animate the same properties as Framer Motion. | NC |
| Lenis | Banned by `dead-code.test.ts` and `budget.spec.ts:47`; out of scope under D2. | VL |
| Blender / GLB | Production `design/studio/*.py` are prep scripts; the October entrance used Blender sources (commit `0c39a3e`). | VL / NC |
| Lucide | Not present; the site uses its own `components/ui/icons.tsx`. Keep one icon family. | VL |

## 5. Decision history

| Date | Decision | By |
|---|---|---|
| 2026-11-18 | N5: GRAVITY FLOW repo stays private; fixed in data (marked private) and in the served résumé PDF (dead link removed). Context7 installed (user scope) | Tay |
| 2026-11-18 | D1 calm/premium, evolve Product Plates, restrained cyan/violet; D2 no 3D now, guards and budget untouched; D3 docs branch; D4 duplicate removed; D5 history as-is; D6 content fixes; D7 English for Claude Code, Hebrew for Chat Claude; D9 Context7 only | Tay |
| 2026-11-18 | Institution not named; featured projects T Poker, Aegis, DeveloperOS, GRAVITY FLOW; names Aegis and GRAVITY FLOW | Tay (per PROJECT_CONTEXT header) |
| 2026-10-13 | English-only site; `/he` → `/` (308); assistant restored on Groq | Tay (M10, per commit `fddc36e`) |
