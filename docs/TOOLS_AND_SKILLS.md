<!--
TOOLS / SKILLS / MCP — research checklist, NOT an install script.
Policy:
  1) The first audit is READ-ONLY. Only inventory what exists:
     claude --version · claude plugin list · claude mcp list · npx skills list
  2) Install nothing until Tay approves. Approve items ONE AT A TIME, after seeing the
     exact command and its permission scope.
  3) Commands and versions below were noted 2026-11-18 and go stale. VERIFY each one
     against the official docs on the day you install it.
  4) No duplicates: check for an existing project-local / global / plugin install first.
Keep a live inventory here: tool, version, install location, connection status, permission
scope, and why it's needed.
-->

# Portfolio — Skills, MCP & Tool Research Checklist

This document is an initial research inventory. The local Claude Code environment must be inspected before installing anything. Verify official sources and current compatibility on the day of setup.

## Skills

| Skill | Priority | Purpose | Official/source link | Suggested current install path | First action |
|---|---|---|---|---|---|
| Anthropic Frontend Design | Required | Distinctive production-grade frontends; intentional typography, color, composition, spatial design and purposeful motion | https://claude.com/plugins/frontend-design | Install official Anthropic Claude Code plugin after checking current marketplace instructions | Verify existing plugin and invoke it for the visual direction |
| Impeccable | High | Critique/refine UI hierarchy, spacing, typography, polish and detail | https://impeccable.style/docs/ | `npx impeccable install` or documented Claude plugin marketplace installation | Inspect project/global copies first; avoid duplicate overlapping skills |
| UI UX Pro Max | High | UI patterns, styles, palettes, typography, design-system generation, React/Tailwind guidance | https://github.com/nextlevelbuilder/ui-ux-pro-max-skill | `/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill` then `/plugin install ui-ux-pro-max@ui-ux-pro-max-skill`; alternatively `npx ui-ux-pro-max-cli init --ai claude` | Check for existing `.claude/skills/ui-ux-pro-max`, plugin or global install |
| Vercel Web Design Guidelines | High | Audit interface quality, accessibility, responsive behavior, interactions and frontend guidelines | https://github.com/vercel-labs/agent-skills | `npx skills add vercel-labs/agent-skills --skill web-design-guidelines -a claude-code` | Check `npx skills list` and local skill directories first |
| Superpowers | High | Brainstorming, plan-first workflows, TDD, debugging, reviews and systematic implementation | https://github.com/obra/superpowers | `/plugin install superpowers@claude-plugins-official` or author's marketplace | Verify existing install/version; user indicated possible prior use |

## MCP / external connections

| MCP | Priority | Purpose | Official documentation | Current suggested setup | Notes |
|---|---|---|---|---|---|
| Playwright | High | Browser automation, inspect live site, interaction/responsive verification | https://playwright.dev/docs/getting-started-mcp | `claude mcp add playwright npx @playwright/mcp@latest` | Separate from project's Playwright test package; inspect first |
| Context7 | High | Version-specific docs for Next.js, React, Three.js, R3F, GSAP, Motion, Tailwind | https://context7.com/docs/clients/claude-code | `npx ctx7 setup --claude` | Choose MCP or CLI+Skills mode, do not install both redundantly |
| GitHub | High | Repository, commit, PR, issue and CI inspection | https://claude.com/plugins/github | Official plugin; check current Claude Code plugin manager | Respect least privilege; no push/merge in setup session |
| Figma | Conditional high | Read design files, frames, components, variables and layouts; possible code-to-canvas workflows | https://help.figma.com/hc/en-us/articles/39888612464151-Claude-Code-and-Figma-Set-up-the-MCP-server | `claude plugin install figma@claude-plugins-official` | Requires account authorization; only if Tay intends to use Figma |
| Vercel | Medium/optional | Inspect project/deployment information and preview status | https://vercel.com/docs | Research whether an official/current MCP exists and which permissions it needs | Prefer read-only access; do not change production settings |

## Runtime/library candidates — research, do not install in the initial audit

| Tool | Candidate role | Key risks/trade-offs to research |
|---|---|---|
| Three.js | Browser 3D renderer | Runtime/bundle, shaders, device compatibility, context loss, asset pipeline |
| React Three Fiber | React renderer/reconciler for Three.js | Compatibility with installed React version, rendering model, component boundaries |
| Drei | Useful R3F helpers | Version compatibility, dependency surface, whether helpers can be implemented more simply |
| GSAP + ScrollTrigger | Sequenced animations and scroll choreography | Scroll ownership, plugin behavior, cleanup, reduced motion, conflicts with other animation libs |
| Motion for React | UI transitions and micro-interactions | Existing `framer-motion` package may already be present; check migration and avoid duplicate packages |
| Blender | Create custom optimized assets | Local install/license/workflow; export optimization, polygon and texture budget |
| glTF/GLB + compression | Delivery of 3D models | KTX2/Basis, meshopt/draco trade-offs, mobile decode cost |
| Lenis | Optional smooth scrolling | Accessibility, native scroll behavior, ScrollTrigger synchronization, interaction bugs, added runtime |
| Lucide | Icons | Keep one consistent icon family; use existing icons if present |

## Safe inventory commands to consider

Run only after checking shell/OS context and current directory:

```bash
pwd
node --version
npm --version
claude --version
claude plugin list
claude mcp list
npx skills list
npx skills ls -g
```

Some CLI commands may vary by installed version; check `--help` before relying on them. Do not dump `.env`, credentials, tokens, or full environment variables.

## External source checks

- Frontend Design: https://claude.com/plugins/frontend-design
- Impeccable: https://impeccable.style/docs/
- UI UX Pro Max: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- Vercel Skills CLI: https://github.com/vercel-labs/skills
- Superpowers: https://github.com/obra/superpowers
- Figma MCP: https://help.figma.com/hc/en-us/articles/39888612464151-Claude-Code-and-Figma-Set-up-the-MCP-server
- Playwright MCP: https://playwright.dev/docs/getting-started-mcp
- Context7: https://context7.com/docs/clients/claude-code
- Motion reduced motion: https://motion.dev/docs/react-accessibility
- Core Web Vitals: https://web.dev/articles/vitals

Research notes dated: 2026-11-18. Re-verify before installation because plugin repositories, commands, versions, and compatibility can change.
