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
- Follow the reference README's "take / do NOT take" exactly. Its text is on `main` as
  `docs/references/premium-redesign-README.md` (N1): a byte-for-byte copy of the stale branch's
  `design/references/README.md`, with no image. Its rules:
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
- **Reopened for one measured prototype** (Tay, 2026-11-18, session 10): Concept A, a dark cinematic direction.
  - It lives only on `proto/hero-a-cinematic` (draft PR #18; never merged; `/lab` routes under noindex).
  - Its live elements are a 2D canvas and CSS 3D, with **no WebGL, three or lenis**.
  - `main`'s guards are unchanged; none needed editing. The prototype routes meet the same 205.7 KiB budget.
  - For `main`, D1 and D2 still stand.

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
- `data/projects.ts:172` (guest → account upgrade): **checked against the T Poker repo in session 4 and
  corrected** on `fix/m0-followups` (`37ba41c`, not yet merged). Details under "Resolved in session 4" below.

**D7 — Language:** Claude Code talks to Tay in **English**; Chat Claude (claude.ai) talks to Tay in
**Hebrew**. `docs/PROJECT_CONTEXT.md` §9 is updated to match.

**D9 — Tool installs:** Context7 **installed** on Tay's go (§3.1). Web-design-guidelines: not yet.
Impeccable: skip. GitHub plugin: skip (`gh` covers it).

**N5 — GRAVITY FLOW repository: stays private (Tay).** The fix is in the data, not by exposing code. PR #5:
- `36f6001`: `data/projects.ts:359` is `repo: { visibility: "private" }`, like T Poker. The dead link is
  gone from the chapter, case study, JSON-LD and assistant prompt; the case study shows "Private repository".
  `tests/unit/private-repo.test.ts` pins it.
- `e105917`: the **served résumé PDF** (`public/resume/Tay-Shofer-Software-Engineer-Resume.pdf`) no longer
  links the private GRAVITY FLOW repository. On page 2 the line ends "| Live web build". URI links went
  13 → 12, and all other links are kept. The file is still two pages, now **80,593 bytes** (was 81,782). The
  Contact label is "two pages, **79 KB**" (`lib/dict.ts:49`), and `tests/e2e/lower.spec.ts` pins 80593 and
  "79 KB". Tay's personal résumé copies were already clean.
- Verified on the final tree: build ✓, typecheck ✓, lint ✓, Playwright **132/132**, unit 118/119 (N6 only).

### Resolved in session 4 (2026-11-18, Tay's task list)

**D8 — Branch cleanup: merged branches deleted.** Rule: a branch is deleted only if its tip is an ancestor
of `origin/main` (`git merge-base --is-ancestor`, 0 commits ahead). Verified per branch, then deleted:
- local `feature/premium-portfolio-redesign` (`3ab2cf8`), with `git branch -d`;
- on GitHub: `docs/m0-audit` (`814e309`, PR #4 head), `fix/content-accuracy` (`e105917`, PR #5 head),
  `production/no-entrance` (`566904c`, PR #2 head), `review/m10-final-preview-20261013` (`fddc36e`, PR #3
  head), with `git push origin --delete`. Each can be restored with the PR page's "Restore branch" button,
  or `git push origin <sha>:refs/heads/<name>`.

**Kept (not fully merged, or excluded):** `reference/premium-redesign-package` (local and remote; Tay
excluded it); `docs/m0-closeout` (open PR #6); and six remote branches with commits not in `main`
(`git cherry` shows all of them as unique):
- `feature/portfolio-polish` (+4: the October polish plan, hero, chapters and rhythm work);
- `feature/premium-portfolio-redesign-1mqmgf` (+4: entrance v2/v3, the M2 prior art);
- `review/m10-premium-preview` (+5: the same four commits plus a snapshot);
- `review/m10-bilingual-chat-preview-20261013`, `review/m10-english-chat-fix-20261013`, and
  `review/m10-premium-preview-final-20261013` (+1 each: a review-only snapshot commit).

Deleting any of these loses commits, so each needs its own yes.

**N6 — fixed** on `fix/m0-followups` (`b4d5c73`, not yet merged). `tests/unit/site.test.ts:78` now compares
against `path.join("app", "api") + path.sep`, the same pattern as lines 19 and 26. Red/green on Windows:
1 failed → 20/20. On Windows the filter excludes exactly `app\api\chat\route.ts`, and a probe file outside
`app/api` naming the key still fails the test. POSIX behaviour is unchanged.

**`data/projects.ts:172` — corrected** on `fix/m0-followups` (`37ba41c`, not yet merged). Checked against
the private T Poker repository @ `91d2b97` (the local clone equals GitHub `main`):
- *"an invite link opened while signed out is completed after sign-in"* overstated it.
  `apps/poker-mobile/src/utils/pendingInvite.ts` stashes the invite for 15 minutes and brings the person
  back to that invite's screen after sign-in, "never into an automatic join". Joining still takes a tap
  (pinned by `AppNavigator.inviteResume.test.tsx`).
- *"guest progress carries into the new account"* is true but needed scoping. `claimGuestStudy`,
  `claimGuestEngagement`, `claimGuestPersona` and `claimGuestBankroll` copy the guest bucket into the account
  **on the same device**, automatically, and **never over the account's own data**. Study progress and XP
  are claimed once per device. Nothing is uploaded: the cloud sync for local games exists in code but is
  hard-gated off (`cloud_sync` is `comingSoon: true`; `cloudSyncEnabled()` blocks any network call). So
  `tests/unit/work.test.ts:25` ("guest games never reach the server and nothing syncs on reconnect") still
  holds.
- New line: "Guest → account upgrade: an invite link opened while signed out reopens after sign-in, and
  guest progress on that device is claimed into the account—never over data the account already has".
- Consistency: this line renders only in the lazy case-study panel. The assistant prompt uses tagline and
  summary, not `challenges`, and its rule "Do not claim cross-device sync on reconnect" agrees. Metadata
  and `/privacy` don't mention it. **VL**

### Resolved in session 8 (2026-11-18, Tay's brief)

**N1 — Reference README text on `main`: done.**
- `docs/references/premium-redesign-README.md` holds the stale branch's `design/references/README.md` (blob
  `1a39ff2`, last changed in `4df968d`, 2026-08-05) under a short provenance header.
- The 52 lines below the header are byte-identical: `git hash-object` of the body equals the source blob. **VL**
- Text only. The AI-generated PNG and every other image stay out.
- Both guard functions (`namesAny`, `privateRepoLeaks`) scan the file clean. D1 now points to it.

**N2 — The institution abbreviation is out of the agent docs: done.**
- The four lines that spelled it out now say "the institution", plus "not even abbreviated", so the rule still covers
  the abbreviation:
  - `CLAUDE.md` standing constraints;
  - `claude/START-HERE.md` standing rules;
  - the header comments of `docs/PROJECT_CONTEXT.md` and `docs/CREATIVE_DIRECTION.md`.
- `git grep -w` finds it in no tracked file. The guard's own `namesAny`, run over every tracked and new text file
  (docs included), finds no hit. Before the edit it found exactly those four files. **VL**
- History keeps the old lines (D5).
- The guard itself still scans only site code (`app`, `components`, `data`, `lib`, `public`). Widening it to the docs
  would be a test change, so it was not made.

### Still open

- **N7 — Cloudflare in front of the site.** Found in session 4, investigated in session 8, then partly resolved. The
  `/privacy` wording is **deferred to the end of the build** (Tay, 2026-11-18):
  - **Dashboard toggles: done** (Tay, 2026-11-18). Web Analytics is set to Disable, and Email Address Obfuscation is
    Off.
  - **Verified live at the session 8 close (VL):** with browser headers, `/` and `/privacy` have no beacon, no
    `email-protection` link and no decode script. The plain `mailto:` links are back (2 and 1). Cloudflare still
    proxies (`Server: cloudflare`).
  - So "loads no third-party scripts" holds again.
  - **The `/privacy` wording: deferred to the end of the build.** Tay decided this at the session 9 close
    (2026-11-18). It is not a now-task, so don't raise it as pending. The draft below is kept for then.

  The findings that led here:
  - **Nothing in the code (VL).**
    - No tracked file mentions Cloudflare except these docs.
    - The app ships plain `mailto:` links: `app/error.tsx:37`, `app/privacy/page.tsx:103`,
      `components/layout/Footer.tsx:9` and `components/sections/Contact.tsx:19`.
    - A local `next start` of `536e34b`, fetched with browser headers, has no beacon and no external
      `<script src>` on `/` or on `/privacy`.
  - **At the edge (VL).**
    - `tayshofer.dev` uses Cloudflare nameservers, and `www` resolves to Cloudflare addresses.
    - Responses carry `Server: cloudflare` and `CF-RAY` in front of Vercel's `x-vercel-id`.
    - Cloudflare's proxy changes the HTML in two ways, and only for requests that accept HTML. A plain `curl` gets
      neither change.
  - **1. The Web Analytics beacon.** The page gets `<script type="module"
    src="https://static.cloudflareinsights.com/beacon.min.js/…" data-cf-beacon=…>`.
    - Chromium blocks it under the CSP: the console logs "violates … script-src 'self' 'unsafe-inline'", the request
      fails with `csp`, and `window.__cfBeacon` is undefined.
    - So no analytics run, but every page load logs an error.
  - **2. Email Address Obfuscation (new in session 8).**
    - Every `mailto:` link is rewritten to `/cdn-cgi/l/email-protection#…`: 2 on `/`, 1 on `/privacy`.
    - The page also gets `/cdn-cgi/scripts/…/cloudflare-static/email-decode.min.js`. It comes from the site's own
      origin, so the CSP's `'self'` allows it, and **it runs**.
    - After load, "Email me" and "Email" are `mailto:` links again. The script is 1,239 bytes and calls no network
      or storage API.
    - Without JavaScript, though, the email links go to a Cloudflare page instead of the mail app (**NC**: what that
      page shows).
    - And a Cloudflare script now runs on a site whose `/privacy` says it "loads no third-party scripts".
  - No `Set-Cookie` on `/` or `/privacy`, so "Visiting sets no cookies" still holds.
  - E2E can't see any of this, because it runs `next start` locally.
  - **Tay's manual steps in the Cloudflare dashboard (both done 2026-11-18).** The paths are **VD**, from the official docs read on
    2026-11-18:
    1. **Web Analytics:** on the **Web Analytics** page, find the site, then **Manage site** → **Disable**.
       The docs: "The JS Snippet will not be injected"
       (developers.cloudflare.com/web-analytics/get-started/).
    2. **Email Address Obfuscation:** on the zone's Security **Settings** page (filter: **Client-side abuse**),
       switch **Email Address Obfuscation** to **Off**. It is on by default
       (developers.cloudflare.com/waf/tools/scrape-shield/email-address-obfuscation/).

    The alternative is DNS-only (grey-cloud) records. They take Cloudflare out of the request path, and then
    `/privacy` needs no change. Either way, keep the CSP as is.
  - App-side workarounds exist: a `no-transform` Cache-Control (stops the beacon, per the Web Analytics FAQ) and
    `<!--email_off-->` markers. Both are code changes, so neither was made. The two toggles make them unnecessary.
  - **`/privacy`: deferred to the end of the build (Tay, 2026-11-18), not edited.** If Cloudflare stays a proxy
    (orange cloud), the "Hosting and logs" paragraph should name it. Draft, kept within Cloudflare's privacy policy (§2 "End Users": "IP addresses, traffic
    routing data, system configuration information, and other information about traffic to and from Customers'
    websites"; §6: a data processor "on behalf of its Customers"):

    > The site is hosted on Vercel. As with any web host, Vercel's infrastructure processes ordinary request
    > information — such as your IP address, the approximate location derived from it, your browser and the page
    > requested — to deliver the site and keep it secure, and may keep it in short-lived logs: [Vercel's privacy
    > notice]. Requests reach Vercel through Cloudflare, which sits in front of the site as its network proxy and
    > processes information about that traffic, such as your IP address, on the site's behalf: [Cloudflare's privacy
    > policy](https://www.cloudflare.com/privacypolicy/). The site's own code logs only technical errors, never chat
    > messages.

    - If Email Address Obfuscation stays on, "loads no third-party scripts or fonts" also needs a change.
    - If the records go DNS-only, no change is needed.
    - Shipping the draft needs an approved edit to `tests/e2e/privacy.spec.ts`: it pins exactly **2** outbound links
      (this adds a third) and the copied phrases.
    - It also needs a new "Last updated" date, and an update to the comment at `app/privacy/page.tsx:26` ("The two
      provider pages").
- ~~N8 — GRAVITY FLOW's private repository name in the docs~~ **Resolved in session 9** (Tay's brief). Merged in PR #16,
  with the guard change approved, and live at `a7a89fd`.
  - Logged in session 8: nine lines in `docs/` named GRAVITY FLOW's repository (PROJECT_CONTEXT §4.4,
    RESEARCH_AND_DECISIONS N5, ROADMAP M0.5, and six in the WORKLOG), and the guard hashed only T Poker's name.
  - Now each of the nine says "the private GRAVITY FLOW repository", with its meaning kept. `git grep` finds the slug
    nowhere in the tree.
  - **The guard pins both** (`tests/support/private-repo.ts`): `PRIVATE_SLUGS` holds the SHA-256 digests of both
    lower-cased slugs, T Poker's unchanged. `privateRepoLeaks` tests every candidate token against the set. Only the
    digests are stored.
  - `tests/unit/private-repo.test.ts` checks that exactly two digests are pinned. It also proves detection on an
    injected throwaway pair, the way the institution self-test does, so neither real slug is written.
  - This is a guard-test change, so the PR flags it for Tay's explicit approval at merge.
  - The name is still in public git history from before PR #5 (D5: history left as is).
- ~~N3 — GRAVITY FLOW mechanics count~~ **Resolved:** seven is correct (game repo `MechanicId` lists 7);
  PROJECT_CONTEXT §4.4 needs no change.
- ~~N5 — GRAVITY FLOW repo link 404s for visitors~~ **Resolved and live** (see N5 under Resolved; PR #5,
  deployed 2026-11-18).
- ~~N6 — Windows-only false failure in `tests/unit/site.test.ts:78`~~ **Fixed** on `fix/m0-followups`
  (see "Resolved in session 4"); it reaches `main` when that branch merges.
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
| 2026-11-18/19 | Session 10: D2 reopened for one measured prototype, Concept A, on `proto/hero-a-cinematic` (draft PR #18, never merged; no WebGL; `main`'s guards unchanged). Hero locked; the `--cine-*` design system extracted; the Projects section with 3D coverflow carousels and the phone fix, on the Preview at `0f38825`. The Projects title is "Four projects, built end to end." (not all four are shipped). | Tay |
| 2026-11-18 | Session 9 close: PR #16 (N8) merged (`a7a89fd`, live). The N7 `/privacy` wording is deferred to the end of the build. Move F is to be built on a preview branch next session | Tay |
| 2026-11-18 | Session 9: N8. GRAVITY FLOW's private repository name is out of the docs, and the private-repo guard pins both private repos by digest (a guard-test change for Tay's approval at merge). `docs/session-7-closeout` and `docs/session-8-closeout` deleted | Tay (brief) |
| 2026-11-18 | Session 8 close: PR #14 (N1, N2) merged (`d80cb4c`). N7: Cloudflare Web Analytics set to Disable and Email Address Obfuscation set to Off. Still open: the `/privacy` wording; N8 goes to the next session | Tay |
| 2026-11-18 | Session 8: N1 (copy the reference README's text) and N2 (the abbreviation out of the agent docs) done; N7 investigated only, its two dashboard toggles and the `/privacy` wording wait on Tay | Tay (brief) |
| 2026-11-18 | M1: moves A–E approved, F deferred until A–E are previewed, keep Geist; PR 1 (A, C, D) merged (#8). Next: B plus the dark "Email me" button a11y fix | Tay |
| 2026-11-18 | Session 4 task list: delete merged branches (D8, done), fix N6, verify and correct `data/projects.ts:172`, start M1 as a plan only; N1/N2 stay Tay's calls | Tay |
| 2026-11-18 | N5: GRAVITY FLOW repo stays private; fixed in data (marked private) and in the served résumé PDF (dead link removed). Context7 installed (user scope) | Tay |
| 2026-11-18 | D1 calm/premium, evolve Product Plates, restrained cyan/violet; D2 no 3D now, guards and budget untouched; D3 docs branch; D4 duplicate removed; D5 history as-is; D6 content fixes; D7 English for Claude Code, Hebrew for Chat Claude; D9 Context7 only | Tay |
| 2026-11-18 | Institution not named; featured projects T Poker, Aegis, DeveloperOS, GRAVITY FLOW; names Aegis and GRAVITY FLOW | Tay (per PROJECT_CONTEXT header) |
| 2026-10-13 | English-only site; `/he` → `/` (308); assistant restored on Groq | Tay (M10, per commit `fddc36e`) |
