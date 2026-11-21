// tests/unit/lab-work.test.ts — everything under the hero on /, in the cinematic language: Work's four panels and their
// carousels, Two more, About, Stack, Think · Build · Ship and Contact (the release, R1–R15; D1 reopened by Tay,
// 2026-11-18; D2 not reopened, so no WebGL). Ported in S20 from the prototype's /lab/work test (the file keeps its name:
// the code's comments and docs/CINEMATIC_SYSTEM.md point here). Every visible fact must come from the site's own data,
// private repositories stay labels, and the sections stay inside the page's .cine layer. Where the prototype compared
// itself with the Product Plates page, which the release deleted, the comparison is now a fixed value, taken from
// product-plates-final (the tag on 443a1f9, the last Product Plates commit).
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import { projects, publicRepoUrl, PRIVATE_REPO_LABEL, PROJECT_GALLERIES } from "@/data/projects";
import { flagships, moreWork } from "@/data/work";
import { IMAGES } from "@/data/images";
import { LAB_IMAGES, captureOf } from "@/data/lab-images";
import { dict } from "@/lib/dict";
import { panels, DOS_CHIPS, PHONE_CROP } from "@/components/sections/panels";
import { aboutBlock } from "@/components/sections/aboutBlock";
import { stackBlock, SECURITY_ROWS, SECURITY_EVIDENCE } from "@/components/sections/stackBlock";
import { tbsBlock, DOS_EVIDENCE } from "@/components/sections/tbsBlock";
import { contactBlock } from "@/components/sections/contactBlock";
import { pillars } from "@/data/approach";
import { skillGroups } from "@/data/skills";
import { projectsFor, lensProjects } from "@/data/stackLens";
import { fmt } from "@/lib/fmt";
import { about } from "@/data/about";
import { availability, resume, socials } from "@/data/socials";
import sharp from "sharp";
import { privateRepoLeaks } from "../support/private-repo";
import { namesAny } from "../support/institution";

const read = (f: string) => fs.readFileSync(f, "utf8").replace(/\r\n/g, "\n");
const page = read("components/sections/Work.tsx");
const more = read("components/sections/MoreWork.tsx");
const home = read("app/page.tsx");
const css = read("components/sections/work.css");
const data = read("components/sections/panels.ts");
const reel = read("components/sections/Reel.tsx");
const shot = read("components/sections/Shot.tsx");
/** Code without its comments (a comment saying "no WebGL" is not WebGL). */
const code = (t: string) => t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
const layer = read("app/cinematic.css");
const project = (id: string) => projects.find((p) => p.id === id)!;
/** The page's sections under the hero, in order, inside `main` (app/page.tsx). */
const ORDER = /<Work \/>\n\s*<About \/>\n\s*<Stack \/>\n\s*<ThinkBuildShip \/>\n\s*<Contact \/>\n\s*<\/div>/;
const inMain = (tag: string) => home.indexOf('<main id="main">') < home.indexOf(tag) && home.indexOf(tag) < home.indexOf("</main>");

describe("honest content", () => {
  it("the four flagships, in Work order, with the correct names", () => {
    expect(panels.map((p) => p.id)).toEqual(flagships.map((f) => f.id));
    expect(panels.map((p) => p.name)).toEqual(["T Poker", "Aegis", "DeveloperOS", "GRAVITY FLOW"]);
  });
  it("each one line is the project's own tagline, word for word", () => {
    for (const p of panels) expect(p.line, p.id).toBe(project(p.id).tagline);
  });
  it("each state is the site's own status string (DeveloperOS adds the version its own data states)", () => {
    expect(Object.fromEntries(panels.map((p) => [p.id, p.state]))).toEqual({
      poker: dict.status.stores, aegis: dict.status.local, developeros: `${dict.status.released} · v1.0.0`, "gravity-flow": dict.status.rc });
    expect(project("developeros").context).toContain("v1.0.0");
    expect(project("gravity-flow").status).toBe("rc");   // a release candidate: never "live" or "published"
  });
  it("two or three chips each, all from the project's own stack, emphasised entries first", () => {
    for (const p of panels) {
      const stack = project(p.id).stack;
      expect(p.chips.length, p.id).toBeGreaterThanOrEqual(2);
      expect(p.chips.length, p.id).toBeLessThanOrEqual(3);
      for (const c of p.chips) expect(stack.map((s) => s.label), `${p.id}: ${c}`).toContain(c);
      const emphasised = stack.filter((s) => s.emphasis).map((s) => s.label);
      expect(p.chips.slice(0, emphasised.length), p.id).toEqual(emphasised.slice(0, 3));
    }
  });
  it("links: the live product where one exists, else the public repository; GRAVITY FLOW has neither; each opens its case study (R4)", () => {
    const by = Object.fromEntries(panels.map((p) => [p.id, p]));
    expect(by.poker.primary).toEqual({ href: project("poker").liveUrl, label: project("poker").liveLabel });
    expect(by.aegis.primary).toEqual({ href: publicRepoUrl(project("aegis")), label: dict.common.source });
    expect(by.developeros.primary).toEqual({ href: publicRepoUrl(project("developeros")), label: dict.common.source });
    expect(by["gravity-flow"].primary).toBeUndefined();
    // R4: "More on X" (a link to the live chapter the release removed) is a "Case study" button on the site's dialog.
    for (const p of panels) expect(Object.keys(p), p.id).not.toContain("more");
    expect(dict.common.caseStudy).toBe("Case study");
    const trigger = /<button type="button" className="wk__more case-study-trigger" data-case-study=\{p\.id\} aria-haspopup="dialog">\s*\{dict\.common\.caseStudy\}\s*<\/button>/;
    expect(page).toMatch(trigger);
    expect(code(page)).not.toMatch(/<Link|href=\{p\.more|#work-\$\{/);
  });
  it("private repositories are labels, never links: no slug or URL in the section's data, page or rendered values", () => {
    expect(panels.filter((p) => p.privateRepo).map((p) => p.id)).toEqual(["poker", "gravity-flow"]);
    for (const p of panels.filter((p) => p.privateRepo)) expect(project(p.id).repo.visibility).toBe("private");
    for (const t of [page, more, css, data, JSON.stringify(panels)]) expect(privateRepoLeaks(t)).toEqual([]);
    expect(JSON.stringify(panels)).not.toMatch(/github\.com\/[^"]*(poker|gravity)/i);
    expect(page).toMatch(/\{p\.privateRepo && <PrivateRepoLabel/);
    expect(PRIVATE_REPO_LABEL).toBe("Private repository");
  });
  it("names no institution, and claims no AI (Aegis's analysis is a deterministic mock; DeveloperOS's default is offline)", () => {
    for (const t of [page, more, data, JSON.stringify(panels)]) expect(namesAny(t)).toBe(false);
    expect(JSON.stringify(panels)).not.toMatch(/\bAI\b|LLM|model/i);
  });
  it("the title says projects, not products: not all four are shipped (Tay, round 5); under the hero's h1 it is an h2", () => {
    expect(page).toMatch(/<h2[^>]*>Four projects, built end to end\.<\/h2>/);
    expect(page).not.toMatch(/Four products|<h1/);
  });
  it("adds no figures of its own: every number shown is in the project's data", () => {
    for (const p of panels) for (const n of `${p.line} ${p.state}`.match(/\d[\d.,]*/g) ?? [])
      expect(JSON.stringify(project(p.id)), `${p.id}: ${n}`).toContain(n);
    for (const t of [page, more]) {
      const jsx = code(t.slice(t.indexOf("  return (")));   // the markup only: sizes strings and comments are not copy
      const copy = [...jsx.replace(/<svg[\s\S]*?<\/svg>/g, "").replace(/className="[^"]*"/g, "").matchAll(/>([^<>{}]+)</g)].map((m) => m[1]).join(" ");
      expect(copy).not.toMatch(/\d/);
    }
  });
});

// Two more (R5, S18+S19): the live block's words only, each project with its case study, so the page keeps six triggers.
describe("Two more (R5): the live block's words, each with its case study", () => {
  it("the live title and the two smaller systems, in the live order, from the site's data", () => {
    expect(dict.more.title).toBe("Two more");
    expect(more).toMatch(/<h2 id="more-work-title" className="wk__mw-title">\{dict\.more\.title\}<\/h2>/);
    expect(moreWork.map((m) => m.id)).toEqual(["job-assistant", "orders-delivery"]);
    expect(more).toMatch(/\{p\.name\}[\s\S]*\{p\.context\}[\s\S]*\{p\.summary\}/);
  });
  it("a public repository is a link that says it opens a new tab; a private one is the site's plain label; each has a case study", () => {
    expect(more).toMatch(/<a href=\{repo\} target="_blank" rel="noopener noreferrer" className="wk__go">\s*\{dict\.common\.source\}<ArrowUpRightIcon size=\{15\} \/><span className="sr-only">\{dict\.common\.newTab\}<\/span>/);
    expect(more).toMatch(/<PrivateRepoLabel className="wk__private" label=\{repoLabel\(p\)\} \/>/);
    expect(more).toMatch(/<button type="button" className="wk__more case-study-trigger" data-case-study=\{p\.id\} aria-haspopup="dialog">\s*\{dict\.common\.caseStudy\}\s*<\/button>/);
  });
  it("a server component inside Work that holds still: no client code, no reveal, no image", () => {
    expect(more).not.toMatch(/^["']use client["']|useState|useEffect|data-reveal/m);
    expect(code(more)).not.toMatch(/<img|<picture|<Shot|<Image|<canvas/);
    expect(page).toMatch(/<\/div>\n\n\s*<MoreWork \/>\n\s*<\/section>/);   // after the four panels, inside #work
  });
});

describe("real captures: each project's gallery (data/projects.ts PROJECT_GALLERIES)", () => {
  it("holds exactly the captures Tay listed (round 6, then session 11), in order, and feeds each panel", () => {
    // Session 11 (Tay's answers): T Poker's "final count" is already poker-settle, so it is not added twice; the
    // DeveloperOS refusal strip and its AI-features capture (the search capture's own screen) are left out.
    expect(PROJECT_GALLERIES).toEqual({
      poker: ["poker-home", "poker-live", "poker-settle", "poker-podium", "poker-stats"],
      aegis: ["aegis-alerts", "hero-aegis"],
      developeros: ["dos-search", "dos-learning", "dos-career", "dos-dashboard"],
      "gravity-flow": ["gf-gameplay", "gf-boss", "gf-gravity-run", "gf-cosmetics", "gf-win"] });
    for (const p of panels) expect(p.gallery.map((g) => g.image), p.id).toEqual(PROJECT_GALLERIES[p.id].map((e) => (typeof e === "string" ? e : e.image)));
    // One capture is a still; two or more, a carousel. All four are carousels now.
    expect(Object.fromEntries(panels.map((p) => [p.id, p.gallery.length]))).toEqual({ poker: 5, aegis: 2, developeros: 4, "gravity-flow": 5 });
    // No capture twice: each gallery entry is a different file, and a different source.
    const all = panels.flatMap((p) => p.gallery.map((g) => g.image));
    expect(new Set(all).size).toBe(all.length);
  });
  it("is a separate export, not a field of the projects the case study reads", () => {
    for (const p of projects) expect(Object.keys(p)).not.toContain("gallery");
    expect(read("data/projects.ts")).toMatch(/^import type \{ CaptureName \} from "@\/data\/lab-images";$/m);   // type-only: no runtime import
  });
  it("every capture, and every phone crop, exists in public/work at every width, in AVIF and WebP", () => {
    for (const p of panels) for (const g of p.gallery) for (const name of [g.image, ...(g.phone ? [g.phone] : [])]) {
      expect(captureOf(name), name).toBeDefined();
      for (const w of captureOf(name).widths) for (const ext of ["avif", "webp"]) expect(fs.existsSync(`public/work/${name}-${w}.${ext}`), `${name}-${w}.${ext}`).toBe(true);
    }
    expect(shot).toMatch(/width=\{im\.w\} height=\{im\.h\}/);   // real dimensions reserve the box
  });
  it("the newer captures: listed in data/lab-images.ts at their real sizes, never in data/images.ts, and named by server code only", async () => {
    for (const [name, im] of Object.entries(LAB_IMAGES)) {
      expect(Object.keys(IMAGES), name).not.toContain(name);
      for (const w of im.widths) for (const ext of ["avif", "webp"]) {
        const m = await sharp(`public/work/${name}-${w}.${ext}`).metadata();
        expect(m.width, `${name}-${w}.${ext}`).toBe(w);
        if (w === im.w) expect(m.height, `${name}-${w}.${ext}`).toBe(im.h);
      }
      expect(im.widths.at(-1), name).toBe(im.w);
    }
    // The image tables stay out of the first-load JavaScript: no client component may name them. On the prototype this
    // guarded the Product Plates About visual (client code that imported data/images.ts whole); on / it guards the
    // carousel, which receives server-rendered captures instead (the structure tests below). Only server code, and
    // data/projects.ts for a type, names data/lab-images.
    const files = (d: string): string[] => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? files(`${d}/${e.name}`) : [`${d}/${e.name}`]);
    const users = ["app", "components", "lib", "data"].flatMap(files).filter((f) => /\.(ts|tsx)$/.test(f) && /lab-images/.test(read(f)));
    expect(users.sort()).toEqual(["components/sections/Shot.tsx", "components/sections/panels.ts", "data/projects.ts"]);
    for (const f of users) expect(read(f), f).not.toMatch(/^["']use client["']/m);
    const clients = ["app", "components", "lib"].flatMap(files).filter((f) => /\.tsx?$/.test(f) && /^["']use client["']/m.test(read(f)));
    for (const f of clients) expect(read(f), f).not.toMatch(/from "@\/data\/(lab-)?images"/);
  });
  it("alt text is the site's own, already reviewed: lib/dict.ts or the project's media", () => {
    const alt = Object.fromEntries(panels.flatMap((p) => p.gallery.map((g) => [g.image, g.alt])));
    const media = (id: string, file: string) => {
      const m = project(id).media!;
      return m.image?.endsWith(`/${file}`) ? m.alt : m.gallery!.find((g) => g.src.endsWith(`/${file}`))!.alt;
    };
    expect(alt).toEqual({
      "poker-home": dict.poker.alts[0], "poker-live": dict.poker.alts[1], "poker-settle": dict.poker.alts[2],
      "poker-podium": media("poker", "podium.webp"), "poker-stats": media("poker", "stats.webp"),
      "aegis-alerts": dict.aegis.alt, "hero-aegis": media("aegis", "incident-board-open.webp"),
      "dos-search": dict.dos.alt.replace("{chips}", DOS_CHIPS.join(", ")),
      "dos-learning": media("developeros", "learning.webp"), "dos-career": media("developeros", "career.webp"),
      "dos-dashboard": media("developeros", "dashboard.webp"),
      "gf-gameplay": dict.gf.alt, "gf-boss": media("gravity-flow", "boss.webp"),
      "gf-gravity-run": media("gravity-flow", "gravity-run.webp"), "gf-cosmetics": media("gravity-flow", "cosmetics.webp"),
      "gf-win": media("gravity-flow", "win.webp"),
    });
    // The reviewed words themselves, so a change to the data shows up here.
    expect(alt).toMatchObject({
      "gf-boss": "World boss encounter",
      "poker-podium": "Tournament results podium", "poker-stats": "Lifetime statistics and profit/loss",
      "dos-learning": "Learning centre generated from indexed code", "dos-career": "Career tools—leads, CV match, interview prep",
      "dos-dashboard": "DeveloperOS dashboard overview",
      "gf-gravity-run": "Endless Gravity Run mode", "gf-cosmetics": "Cosmetics collection screen", "gf-win": "Three-star level completion",
    });
    expect(alt["hero-aegis"]).toMatch(/^The Aegis Incidents page/);
    for (const a of Object.values(alt)) expect(a).not.toMatch(/\{\w+\}/);
  });
  // Each capture that borrows a media entry's alt text must be that entry's file: the image script encodes it from
  // that file, and the pixels agree (a mean difference of a few levels of 255 is encoding; another screen is ~20).
  const REENCODED = {
    "gf-boss": "gravity-flow/boss.webp",
    "hero-aegis": "aegis/incident-board-open.webp",   // the same AEGIS_BOARD crop, from the owner's full capture
    "poker-podium": "poker/podium.webp", "poker-stats": "poker/stats.webp",
    "dos-learning": "developeros/learning.webp", "dos-career": "developeros/career.webp", "dos-dashboard": "developeros/dashboard.webp",
    "gf-gravity-run": "gravity-flow/gravity-run.webp", "gf-cosmetics": "gravity-flow/cosmetics.webp", "gf-win": "gravity-flow/win.webp",
  } as const;
  it("each capture that reuses a media entry's alt text really is that entry's file, re-encoded", async () => {
    const script = read("scripts/m10-images.mjs");
    for (const [name, src] of Object.entries(REENCODED)) {
      if (name !== "hero-aegis") expect(script, name).toContain(`{ name: "${name}", src: \`\${P}/${src}\``);
      const im = captureOf(name as keyof typeof REENCODED);
      const px = (f: string) => sharp(f).resize(48, Math.round((48 * im.h) / im.w), { fit: "fill" }).removeAlpha().raw().toBuffer();
      const [a, b] = await Promise.all([px(`public/projects/${src}`), px(`public/work/${name}-${im.w}.webp`)]);
      let d = 0; for (let i = 0; i < a.length; i++) d += Math.abs(a[i] - b[i]);
      expect(d / a.length, name).toBeLessThan(2);   // gf-boss measured 0.48 of 255: the same image
    }
  });
  it("adding a capture without alt text fails the build: the gallery resolver throws", () => {
    expect(data).toMatch(/if \(!alt\) throw new Error\(/);
  });
  it("the phone crops are the ones the Product Plates chapters used below 640px", () => {
    // Fixed values: the Aegis and DeveloperOS chapters (product-plates-final:components/work/AegisChapter.tsx and
    // DeveloperOSChapter.tsx) swapped in exactly these two crops under 640px.
    expect(PHONE_CROP).toEqual({ "aegis-alerts": "aegis-alerts-phone", "dos-search": "dos-search-phone" });
    expect(shot).toMatch(/media="\(max-width: 639px\)"/);
  });
  it("the DeveloperOS chips are the Product Plates chapter's own", () => {
    // Fixed values: the first three labels of CHIPS in product-plates-final:components/work/DeveloperOSChapter.tsx, the
    // file:line chips on the search capture.
    expect(DOS_CHIPS).toEqual(["devos/providers/ollama.py:1-50", "tests/test_ollama.py:1-50", "devos/providers/__init__.py:1-5"]);
  });
  it("no capture is a load priority on /: the hero fills the first screen, so every capture is lazy", () => {
    expect(code(page)).not.toMatch(/priority/);
    expect(shot).toMatch(/loading=\{priority \? "eager" : "lazy"\} fetchPriority=\{priority \? "high" : undefined\}/);
  });
});

describe("structure", () => {
  it("one labelled P4 slot per panel, in its own row (the panel's last child): it holds the panel's explainer once P4 has built it, and stays empty and hidden until then, with no placeholder", () => {
    // Tay, 2026-11-21, P4 plan decisions (docs/P4_PLAN.md, Q2 and §6): the slot leaves the words column for a row of
    // its own, after the capture. DeveloperOS's explainer is the first (S30); the other three stay empty and hidden.
    expect(page).toMatch(/<\/figure>\n\s*\{\/\* P4: the panel's explainer, in its own row[\s\S]*?\*\/\}\n\s*<div className="wk__demo" data-demo-slot=\{p\.id\} hidden=\{!EXPLAINERS\[p\.id\]\}>\{EXPLAINERS\[p\.id\]\}<\/div>\n\s*<\/article>/);
    expect(page.match(/data-demo-slot/g)).toHaveLength(1);   // one per panel, from the map
    expect(page).toMatch(/const EXPLAINERS: Partial<Record<Panel\["id"\], React\.ReactNode>> = \{ developeros: <DosExplainer \/> \};/);
  });
  it("the carousel and Stack's filter are the only client code under the hero: the sections and their data stay on the server", () => {
    for (const t of [page, more, data, shot, home]) expect(t).not.toMatch(/^["']use client["']|useEffect|<canvas|getContext/m);
    expect(reel).toMatch(/^"use client";/);
    expect(code(reel)).not.toMatch(/<canvas|getContext|webgl|three|lenis/i);
    // It imports no data and no image table: the server renders every capture and hands them in (`shots`).
    expect(reel).not.toMatch(/from "\.\/panels"|from "\.\/Shot"|@\/data\//);
    expect(page).toMatch(/shots=\{p\.gallery\.map\(\(g\) => <Shot /);
  });
  it("a single capture is a still, with no carousel chrome; two or more are a carousel", () => {
    expect(page).toMatch(/\{p\.gallery\.length === 1 \? \(\s*<div className="wk__device"><Shot \{\.\.\.p\.gallery\[0\]\}[\s\S]*?\) : \(\s*<Reel /);
  });
  it("the carousel: the WAI-ARIA tabbed pattern, arrows / Home / End, swipe, a polite announcement, and never autoplay", () => {
    expect(reel).toMatch(/role="region" aria-roledescription="carousel"/);
    expect(reel).toMatch(/role="tabpanel" aria-roledescription="slide"/);
    expect(reel).toMatch(/role="tablist"/);
    expect(reel).toMatch(/role="tab"[\s\S]*aria-selected=\{i === active\}[\s\S]*aria-controls=/);
    expect(reel).toMatch(/tabIndex=\{i === active \? 0 : -1\}/);   // roving: one tab stop for the dots
    for (const k of ["ArrowRight", "ArrowLeft", "Home", "End"]) expect(reel).toContain(`"${k}"`);
    expect(reel).toMatch(/aria-label="Previous capture"[\s\S]*aria-label="Next capture"/);
    expect(reel).toMatch(/Math\.abs\(dx\) > 40 && Math\.abs\(dx\) > Math\.abs\(dy\)/);
    expect(reel).toMatch(/aria-live="polite"/);
    expect(code(reel)).not.toMatch(/setInterval|setTimeout|requestAnimationFrame|autoplay/i);
  });
  it("no JS shows the first capture alone and hides the controls; reduced motion is a flat slider", () => {
    expect(reel).toMatch(/useSyncExternalStore\(noop, \(\) => true, \(\) => false\)/);
    expect(reel).toMatch(/const shown = front \|\| \(ready && !flat && Math\.abs\(d\) === 1\);/);
    expect(reel).toMatch(/<div className="wk__device" style=\{\{ "--wk-box": boxes\[i\]\.ratio, "--wk-box-phone": boxes\[i\]\.phone \} as CSSProperties\}>\{shown && shot\}<\/div>/);
    expect(css).toMatch(/\.wk__reel:not\(\[data-ready\]\) \.wk__controls \{ visibility: hidden; \}/);
    expect(css).toMatch(/\.wk__slide:not\(\[data-shown\]\) \{ visibility: hidden; \}/);
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\) \{[^@]*\.wk__slide:not\(\[data-offset="0"\]\) \{ transform: none; visibility: hidden; \}/);
    expect(css).toMatch(/\[data-reduced-motion="true"\] \.wk__slide:not\(\[data-offset="0"\]\) \{ transform: none; visibility: hidden; \}/);
    // A case study is a script-driven dialog: without JavaScript its triggers would do nothing, so the page hides them.
    expect(home).toMatch(/<noscript><style>\{"\.case-study-trigger\{display:none\}"\}<\/style><\/noscript>/);
  });
  it("every slide holds its capture's box, drawn or not (mixed shapes never shift the page), from the server's ratios", () => {
    expect(page).toMatch(/boxes=\{p\.gallery\.map\(\(g\) => \(\{ ratio: ratioOf\(g\.image\), \.\.\.\(g\.phone \? \{ phone: ratioOf\(g\.phone\) \} : null\) \}\)\)\}/);
    expect(shot).toMatch(/export const ratioOf = \(name: CaptureName\) => `\$\{captureOf\(name\)\.w\} \/ \$\{captureOf\(name\)\.h\}`;/);
    expect(css).toMatch(/\.wk__slide \.wk__device:empty::before \{ content: ""; display: block; aspect-ratio: var\(--wk-box\); \}/);
    expect(css).toMatch(/@media \(max-width: 639px\) \{[^@]*\.wk__slide \.wk__device:empty::before \{ aspect-ratio: var\(--wk-box-phone, var\(--wk-box\)\); \}/);
  });
  it("no reveal of its own and no lede (R10): the hero's reveal is the page's one; the panels hold still", () => {
    for (const t of [page, more, home]) expect(t).not.toMatch(/data-reveal/);
    expect(css).not.toMatch(/--reveal-i|data-reveal|\.wk__lede/);
    expect(code(page)).not.toMatch(/wk__lede|heroLead/);
  });
  it("lifts on hover, keyboard focus and touch, and never moves with reduced motion", () => {
    expect(css).toMatch(/\.wk__panel:is\(:hover, :focus-within, :active\) \.wk__stage \{\s*translate: 0 var\(--cine-lift\);/);
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\) \{\s*\.wk__panel:is\(:hover, :focus-within, :active\) \.wk__stage \{ translate: none; \}/);
    expect(css).toMatch(/\[data-reduced-motion="true"\] \.wk__panel:is\(:hover, :focus-within, :active\) \.wk__stage \{ translate: none; \}/);
  });
});

describe("inside the cinematic layer", () => {
  it("every selector is scoped to the region (.wk)", () => {
    const selectors = [...css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]+)\{/g)].map((m) => m[1].trim()).filter((s) => !s.startsWith("@"));
    expect(selectors.length).toBeGreaterThan(30);
    for (const sel of selectors) for (const part of sel.split(/,(?![^(]*\))/)) expect(part.trim(), sel).toMatch(/\.wk\b|\.wk__/);
  });
  it("declares no colour of its own, and every token it reads is defined in the layer", () => {
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,6}\b|rgba?\(/);
    const defined = new Set([...layer.matchAll(/(--cine-[\w-]+):/g)].map((m) => m[1]));
    const used = [...new Set([...css.matchAll(/var\((--cine-[\w-]+)/g)].map((m) => m[1]))];
    expect(used.filter((u) => !defined.has(u))).toEqual([]);
  });
  it("the round-5 and round-6 additions to the layer are marked, and the new values are named for review", () => {
    const round5 = layer.slice(layer.indexOf("Added by the Work slice"), layer.indexOf("Added by the carousel"));
    expect(round5.match(/NEW:/g)).toHaveLength(2);
    for (const t of ["--cine-lift", "--cine-glow-lift"]) expect(round5).toMatch(new RegExp(`${t}: [^;]+;\\s*/\\* NEW:`));
    const round6 = layer.slice(layer.indexOf("Added by the carousel"), layer.indexOf("/* The shared names"));
    expect(round6.match(/NEW:/g)).toHaveLength(3);
    for (const t of ["--cine-flow-turn", "--cine-flow-scale", "--cine-flow-dim"]) expect(round6).toMatch(new RegExp(`${t}: [^;]+;\\s*/\\* NEW:`));
    expect(round6).toMatch(/--cine-dur-move: var\(--dur-slow\);/);   // the site's own timing
  });
  it("is the page now: / composes the sections inside <main>, in the .cine root, and /lab is gone", () => {
    expect(fs.existsSync("app/lab")).toBe(false);
    for (const f of ["app/page.tsx", "app/sitemap.ts", "app/robots.ts"]) expect(read(f), f).not.toMatch(/lab\/work/);
    expect(home).toMatch(ORDER);
    expect(inMain("<Work />") && inMain("<Contact />")).toBe(true);
    expect(home).toMatch(/<main id="main">\n\s*<div className="cine" data-theme="dark">\n\s*<Hero c=\{c\} \/>\n\s*<div className="wk">/);
    expect(read("components/sections/Work.tsx")).toMatch(/import "\.\/work\.css";/);
  });
});

// About (P3.3, session 12): Tay approved every word before it was built. Each string is held to its source, and the
// approved copy is pinned as well, so a change to either one shows up here. Since R10 (S18+S19) it ends on the facts.
describe("About (P3.3): the live About section's own words, ending on the facts (R10)", () => {
  const block = read("components/sections/About.tsx");
  const hero = read("components/sections/Hero.tsx");
  const shown = [aboutBlock.eyebrow, ...aboutBlock.title, aboutBlock.lede, ...aboutBlock.facts];

  it("the eyebrow, the title and the four facts are the live ones, word for word", () => {
    expect(aboutBlock.eyebrow).toBe(dict.nav.about);
    expect(aboutBlock.title).toEqual(about.title);
    expect([...aboutBlock.title]).toEqual(["Engineer by training.", "Builder by nature."]);
    expect(aboutBlock.facts).toEqual(about.facts);
    expect([...aboutBlock.facts]).toEqual(["B.Sc. in Computer Science", "Full-stack: web, mobile, and backend", "Based in Israel", "Working in English and Hebrew"]);
  });
  it("the lede is two sentences of the live copy, word for word (who, then what with)", () => {
    const [who, what] = ["I'm a Computer Science graduate who enjoys turning complex ideas into useful, dependable software.",
      "Today, I work with C#/.NET, TypeScript, and Python, taking projects from an initial idea to working software."];
    expect(aboutBlock.lede).toBe(`${who} ${what}`);
    expect(about.paragraphs[0].startsWith(who)).toBe(true);
    expect(about.paragraphs[1]).toContain(` ${what} `);
  });
  it("R10: no availability line and no links; it ends on the facts", () => {
    expect(Object.keys(aboutBlock)).toEqual(["eyebrow", "title", "lede", "facts"]);
    expect(code(block)).not.toMatch(/<a\b|<button|availability|resume|profiles/);
    expect(block).toMatch(/\{a\.facts\.map\(\(f\) => <li key=\{f\}>\{f\}<\/li>\)\}\n\s*<\/ul>\n\s*<\/div>\n\s*<\/section>/);
  });
  it("the three links it dropped are still on the page, at exactly the live site's targets: the hero's résumé, and Contact's", () => {
    expect(resume.href).toBe("/resume/Tay-Shofer-Software-Engineer-Resume.pdf");
    expect([socials.github.url, socials.linkedin.url]).toEqual(["https://github.com/taysh123", "https://www.linkedin.com/in/tay-shofer-1b2b54287"]);
    // The hero's résumé: its label, its note, and a download of the same PDF (R9: the arrow is the site's SVG icon).
    expect(hero).toMatch(/<a href=\{resume\.href\} download=\{resume\.fileName\} type="application\/pdf" className="hxa__btn hxa__btn--ghost">\n\s*Download résumé<ArrowDownIcon size=\{17\} \/>\n\s*<span className="sr-only"> \(PDF\{t\.contact\.resumeNote\}\)<\/span>/);
    expect(dict.contact.resumeNote).toBe(" · two pages, 79 KB");
    // Contact's: the same PDF, GitHub and LinkedIn (held to their sources in Contact's tests below).
    expect(contactBlock.resume.href).toBe(resume.href);
    expect(contactBlock.profiles.map((p) => p.href).sort()).toEqual([socials.github.url, socials.linkedin.url].sort());
  });
  it("no photo, no capture, no institution, no year or number of its own, and no private repository", () => {
    expect(code(block)).not.toMatch(/<img|<picture|<Shot|<Pic|<Image/);
    for (const t of [block, read("components/sections/aboutBlock.ts"), shown.join(" ")]) expect(namesAny(t)).toBe(false);
    expect(shown.join(" ")).not.toMatch(/\d/);
    expect(privateRepoLeaks(block + JSON.stringify(aboutBlock))).toEqual([]);
  });
  it("holds still and ships no client code: the page's one reveal stays the hero's", () => {
    expect(block).not.toMatch(/data-reveal|"use client"|useState|useEffect/);
    expect(home).toMatch(ORDER);   // Work, then About, Stack (session 13), Think · Build · Ship (14), Contact (15)
  });
  it("adds no token: the layer still defines the same 76, and the About rules read only layer tokens", () => {
    const root = layer.slice(layer.indexOf(".cine[data-theme] {"));
    expect(new Set([...root.slice(0, root.indexOf("\n}")).matchAll(/(--cine-[\w-]+):/g)].map((m) => m[1])).size).toBe(76);
    const rules = css.slice(css.indexOf("/* ── About (P3.3"), css.indexOf("/* ── Smaller screens"));
    expect(rules).not.toMatch(/--cine-[\w-]+:|#[0-9a-fA-F]{3,6}\b|rgba?\(/);
    expect(rules.match(/var\(--cine-[\w-]+\)/g)!.length).toBeGreaterThan(20);
  });
});

// Stack (P3.4, session 13, rebuilt on Tay's review): the live Stack, restyled. Its groups, tools and evidence sentences
// word for word, the live mapping on each tool, a filter of the four flagships, and Tay's Security group. Every string is
// held to its source, and the approved rows are pinned, so a change to either one shows up here.
describe("Stack (P3.4): the live Stack's groups, tools and evidence, with a filter of the four flagships", () => {
  const block = read("components/sections/Stack.tsx");
  const filter = read("components/sections/StackFilter.tsx");
  const src = read("components/sections/stackBlock.ts");
  const FLAG = ["poker", "aegis", "developeros", "gravity-flow"];
  const { groups, filter: lens } = stackBlock;
  const tools = groups.flatMap((g) => g.tools);
  const shown = [stackBlock.eyebrow, stackBlock.title, lens.label, lens.all, ...lens.options.flatMap((o) => [o.name, o.status]),
    ...groups.flatMap((g) => [g.title, g.evidence]), ...tools.flatMap((t) => [t.label, t.names ?? ""])];

  it("the eyebrow, the title and the filter's words are the live Stack's; there is no lede", () => {
    expect([stackBlock.eyebrow, stackBlock.title, lens.label, lens.all]).toEqual([dict.nav.stack, dict.stack.title, dict.stack.filter, dict.stack.all]);
    expect([stackBlock.eyebrow, stackBlock.title, lens.label, lens.all]).toEqual(["Stack", "Tools behind the work.", "Filter by project", "All"]);
    expect(Object.keys(stackBlock)).toEqual(["eyebrow", "title", "filter", "groups"]);
  });
  it("the live groups in the live order, with Security after Services and APIs", () => {
    expect(groups.map((g) => g.title)).toEqual(["Languages", "Product and interface", "Services and APIs", "Security",
      "Data, search and models", "Delivery and testing", "Everyday tools"]);
    expect(groups.filter((g) => g.id !== "security").map((g) => g.title)).toEqual(skillGroups.map((g) => g.title));
  });
  it("each live group's evidence sentence, word for word", () => {
    for (const g of skillGroups) expect(groups.find((r) => r.id === g.id)!.evidence, g.id).toBe(g.evidence);
  });
  it("every live tool once, in its live group and order; JWT moves into Security, so it appears once", () => {
    for (const g of skillGroups) expect(groups.find((r) => r.id === g.id)!.tools.map((t) => t.label), g.id)
      .toEqual(g.items.map((i) => i.label).filter((l) => l !== "JWT"));
    expect(groups.find((g) => g.id === "security")!.tools.map((t) => t.label)).toEqual(["JWT", "Body HMAC", "CSRF token"]);
    const labels = tools.map((t) => t.label);
    expect(new Set(labels).size).toBe(labels.length);
    expect(labels.filter((l) => /JWT/.test(l))).toEqual(["JWT"]);
    expect(labels).toHaveLength(45);
  });
  it("each live tool carries exactly the flagships the live mapping finds for it (projectsFor), in Work order", () => {
    for (const g of groups) for (const t of g.tools) {
      if (SECURITY_ROWS.some((r) => r.label === t.label)) continue;
      expect(t.projects, t.label).toEqual(g.id === "workflow" ? [] : projectsFor(t.label).filter((id) => FLAG.includes(id)));
    }
    expect(groups.find((g) => g.id === "security")!.tools[0].projects).toEqual(["poker", "aegis"]);   // JWT: T Poker · Aegis
    // The approved mapping, pinned (a tool's accessible text and hover title: its flagships, as the live Stack says them).
    expect(Object.fromEntries(tools.map((t) => [t.label, t.names]))).toEqual({
      "C#": "T Poker, Aegis", TypeScript: "T Poker, Aegis, GRAVITY FLOW", Python: "DeveloperOS", Java: null,
      JavaScript: "DeveloperOS", SQL: "T Poker, Aegis, DeveloperOS", "C++": null, C: null,
      React: "T Poker, Aegis, DeveloperOS", "Next.js": "Aegis", "React Native / Expo": "T Poker", "Tailwind CSS": "Aegis",
      "Phaser 3": "GRAVITY FLOW", JavaFX: null, "Framer Motion": null,
      "ASP.NET Core": "T Poker, Aegis", "RabbitMQ / MassTransit": "Aegis", "CQRS / MediatR": "T Poker",
      "Clean Architecture": "T Poker, Aegis", SignalR: "Aegis", REST: "T Poker, Aegis",
      JWT: "T Poker, Aegis", "Body HMAC": "Aegis", "CSRF token": "DeveloperOS",
      PostgreSQL: "T Poker, Aegis", "SQLite / FTS5": "DeveloperOS", Redis: "Aegis", "EF Core": "T Poker, Aegis", Ollama: "DeveloperOS",
      Docker: "T Poker, Aegis", "GitHub Actions": "T Poker, DeveloperOS, GRAVITY FLOW", xUnit: "T Poker, Aegis",
      Testcontainers: "Aegis", Jest: "T Poker", Vitest: "GRAVITY FLOW", pytest: null, Playwright: null,
      Capacitor: "GRAVITY FLOW", PyInstaller: "DeveloperOS", Vercel: "T Poker", Railway: "T Poker", Firebase: "GRAVITY FLOW",
      Git: null, Linux: null, "Claude Code": null,
    });
  });
  it("a tool no flagship uses names no project, so it shows under All only; the live notes are not shown", () => {
    expect(tools.filter((t) => !t.projects.length).map((t) => t.label))
      .toEqual(["Java", "C++", "C", "JavaFX", "Framer Motion", "pytest", "Playwright", "Git", "Linux", "Claude Code"]);
    for (const t of tools.filter((t) => !t.projects.length)) expect(t.names, t.label).toBeNull();
    const notes = skillGroups.flatMap((g) => g.items.flatMap((i) => (i.note ? [i.note] : [])));
    for (const n of notes) expect(tools.map((t) => t.names ?? "").join(" | ")).not.toContain(n);
  });
  it("Security: Body HMAC and CSRF token in their projects' own words, each with the one flagship whose text says it", () => {
    expect(SECURITY_ROWS.map((r) => [r.label, [...r.projects]])).toEqual([["Body HMAC", ["aegis"]], ["CSRF token", ["developeros"]]]);
    expect(project("aegis").caseStudy.decisions.map((d) => d.title)).toContain("Agent ingestion authenticated by body HMAC");
    expect(project("developeros").caseStudy.decisions.find((d) => d.title === "Loopback API hardened like a public one")!.body)
      .toMatch(/^A per-instance CSRF token compared with hmac\.compare_digest/);
    for (const r of SECURITY_ROWS) for (const id of FLAG)
      expect(JSON.stringify(project(id)).toLowerCase().includes(r.label.toLowerCase()), `${r.label} in ${id}`).toBe((r.projects as readonly string[]).includes(id));
  });
  it("Security's one sentence is built only from its cited source lines", () => {
    expect(SECURITY_EVIDENCE).toBe("Aegis authenticates agent ingestion by body HMAC and uses JWT (RS256); DeveloperOS compares a per-instance CSRF token with hmac.compare_digest.");
    expect(groups.find((g) => g.id === "security")!.evidence).toBe(SECURITY_EVIDENCE);
    // Each phrase is in the project's own text: Aegis's decision title and stack entry, DeveloperOS's decision.
    const aegis = JSON.stringify(project("aegis")), dos = JSON.stringify(project("developeros"));
    for (const phrase of ["agent ingestion authenticated by body HMAC", "JWT (RS256)"]) expect(aegis.toLowerCase(), phrase).toContain(phrase.toLowerCase());
    for (const phrase of ["per-instance CSRF token compared with hmac.compare_digest"]) expect(dos, phrase).toContain(phrase);
  });
  it("the filter: All and the four flagships in Work order, each with its count and the live status line", () => {
    expect(lens.options.map((o) => [o.id, o.name])).toEqual([["poker", "T Poker"], ["aegis", "Aegis"], ["developeros", "DeveloperOS"], ["gravity-flow", "GRAVITY FLOW"]]);
    for (const o of lens.options) {
      expect(o.count, o.id).toBe(tools.filter((t) => t.projects.includes(o.id)).length);
      expect(o.status).toBe(fmt(dict.stack.showing, { n: o.count, name: o.name }));
      expect(lensProjects.map((l) => l.id)).toContain(o.id);   // the live lens's own projects, never a fifth
    }
    expect(lens.options.map((o) => o.status)).toEqual(["Showing the 18 tools T Poker uses.", "Showing the 19 tools Aegis uses.",
      "Showing the 9 tools DeveloperOS uses.", "Showing the 6 tools GRAVITY FLOW uses."]);
  });
  it("the filter is written from the options exactly as the Product Plates FILTER was: only the project's tools, no empty group", () => {
    // Fixed values: the Product Plates Stack (product-plates-final:components/sections/Stack.tsx) wrote, per project, a tool
    // whose data-p doesn't name it `[data-tool]:not([data-p~="<id>"]){display:none}`, and a group left with none
    // `<group>:not(:has([data-p~="<id>"])){display:none}`. The release writes the same two rules, on its own classes.
    for (const { id } of lens.options) {
      expect(lens.css).toContain(`.wk__stack-groups[data-lens="${id}"] [data-tool]:not([data-p~="${id}"]){display:none}`);
      expect(lens.css).toContain(`.wk__stack-groups[data-lens="${id}"] .wk__stack-group:not(:has([data-p~="${id}"])){display:none}`);
    }
    expect(lens.css.match(/\{[^}]*\}/g)).toHaveLength(8);
    expect(lens.css.match(/\{[^}]*\}/g)!.every((d) => d === "{display:none}")).toBe(true);
    expect(block).toMatch(/<style>\{s\.filter\.css\}<\/style>/);
    expect(block).toMatch(/<li key=\{t\.label\} data-tool data-p=\{t\.projects\.join\(" "\) \|\| undefined\} title=\{t\.names \?\? undefined\}>/);
    expect(block).toMatch(/\{t\.label\}\{t\.names && <span className="sr-only"> \(\{t\.names\}\)<\/span>\}/);   // the live accessible text
  });
  it("the filter is one small island: real toggle buttons, labelled, no data of its own, shown only once it works", () => {
    expect(filter).toMatch(/^"use client";/);
    expect([...filter.matchAll(/^import .* from "([^"]+)";$/gm)].map((m) => m[1])).toEqual(["react"]);   // no data, no @/ module
    expect(filter).toMatch(/<button key=\{o\.id \|\| "all"\} type="button" className="wk__lens-chip" aria-pressed=\{lens === o\.id\} onClick=\{\(\) => press\(o\.id\)\}>/);
    // No scroll jump: the groups hold enough height for the page to reach the view's bottom; All lets go.
    expect(filter).toMatch(/setHold\(Math\.max\(0, Math\.ceil\(innerHeight - r\.top - after\)\)\);\s*\} else setHold\(0\);/);
    expect(filter).toMatch(/style=\{hold \? \{ minHeight: hold \} : undefined\}/);
    expect(filter).toMatch(/<div role="group" aria-labelledby="wk-lens-label" className="wk__lens-chips">/);
    expect(filter).toMatch(/aria-live="polite"/);
    expect(filter).toMatch(/useSyncExternalStore\(noop, \(\) => true, \(\) => false\)/);
    expect(css).toMatch(/\.wk__lens:not\(\[data-ready\]\) \{ visibility: hidden; \}/);
    expect(code(filter)).not.toMatch(/useEffect|setTimeout|setInterval|requestAnimationFrame|<canvas|getContext/);
    expect(block).not.toMatch(/"use client"|data-reveal/);
    expect(src).not.toMatch(/"use client"/);
  });
  it("no AI claim, no levels or percentages, no years, no logo, no institution, no private repository", () => {
    const text = shown.join(" | ");
    expect(text).not.toMatch(/\bAI\b|LLM|machine learning|\bML\b|%|\byears?\b|expert|proficient|beginner|level/i);
    expect(text).not.toMatch(/\b(19|20)\d{2}\b/);
    for (const t of [block, filter, src, text]) expect(namesAny(t)).toBe(false);
    expect(privateRepoLeaks(block + filter + src + JSON.stringify(stackBlock))).toEqual([]);
    expect(code(block)).not.toMatch(/<img|<svg|<picture|<Pic|<Image|<Shot/);
  });
  it("under About inside <main>, and the page keeps the hero's one opening reveal", () => {
    expect(home).toMatch(ORDER);   // About above it; Think · Build · Ship (session 14), then Contact (15), below it
    expect(inMain("<Stack />")).toBe(true);
    for (const t of [block, home]) expect(t).not.toMatch(/data-reveal/);
  });
  it("adds no token; pills outlined under All, filled for a project, evidence only under All; no transition when reduced", () => {
    const rules = css.slice(css.indexOf("/* ── Stack (P3.4"), css.indexOf("/* ── Smaller screens"));
    expect(rules.length).toBeGreaterThan(500);
    expect(rules).not.toMatch(/--cine-[\w-]+:|#[0-9a-fA-F]{3,6}\b|rgba?\(/);
    expect(rules.match(/var\(--cine-[\w-]+\)/g)!.length).toBeGreaterThan(20);
    expect(rules).toMatch(/\.wk__stack-tools \[data-tool\] \{\s*padding: var\(--cine-space-1\) var\(--cine-space-3\);\s*border: 1px solid var\(--cine-edge\);\s*border-radius: var\(--cine-radius-pill\);/);
    expect(rules).toMatch(/\.wk__stack-groups\[data-lens\] \[data-tool\] \{ border-color: var\(--cine-cyan\); background: var\(--cine-cyan\); color: var\(--cine-on-accent\); \}/);
    expect(rules).toMatch(/\.wk__stack-groups\[data-lens\] \.wk__stack-evidence \{ display: none; \}/);
    // The only transition in Stack is the buttons', and reduced motion drops it.
    expect(rules.match(/transition:/g)).toHaveLength(3);
    expect(rules).toMatch(/@media \(prefers-reduced-motion: reduce\) \{\s*\.wk__lens-chip \{ transition: none; \}/);
    expect(rules).toMatch(/\[data-reduced-motion="true"\] \.wk__lens-chip \{ transition: none; \}/);
  });
});

// Think · Build · Ship (P3.5, session 14): the live section's title and rows, word for word, plus one DeveloperOS line in
// Tay's wording, so all four flagships appear. Each string is held to its source, and the approved copy is pinned, so
// a change to either one shows up here.
describe("Think · Build · Ship (P3.5): the live section's words, with evidence from all four flagships", () => {
  const block = read("components/sections/ThinkBuildShip.tsx");
  const src = read("components/sections/tbsBlock.ts");
  const { rows } = tbsBlock;
  const shown = [tbsBlock.title, ...rows.flatMap((r) => [r.word, r.line, r.summary, ...r.evidence.map((e) => e.text)])];

  it("the live title, and no eyebrow (the live section has none)", () => {
    expect(tbsBlock.title).toBe(dict.tbs.title);
    expect(tbsBlock.title).toBe("Think. Build. Ship.");
    expect(Object.keys(tbsBlock)).toEqual(["title", "rows"]);
  });
  it("each row's word, line and summary are the live ones, word for word, in the live order", () => {
    expect(rows.map((r) => [r.word, r.line, r.summary])).toEqual(pillars.map((p) => [p.word, p.line, p.summary]));
    expect(rows.map((r) => [r.word, r.line, r.summary])).toEqual([
      ["Think", "Find the hard part.", "Usually, one constraint shapes everything else."],
      ["Build", "Make the safe path the easy one.", "Encode constraints in types, interfaces, and data models—not just in documentation."],
      ["Ship", "Ship it honestly.", "Make the project reproducible, testable, and explicit about its known gaps."],
    ]);
  });
  it("each live example is kept word for word, first in its row; DeveloperOS's line joins Build (Tay, session 14)", () => {
    for (const [i, p] of pillars.entries()) expect(rows[i].evidence[0].text, p.word).toBe(p.example);
    expect(rows.map((r) => r.evidence.map((e) => e.name))).toEqual([["T Poker"], ["GRAVITY FLOW", "DeveloperOS"], ["Aegis"]]);
    expect(rows.map((r) => r.evidence.map((e) => e.text))).toEqual([
      ["T Poker: the money has to be exact to the cent, even in a guest game on a phone with no signal."],
      ["GRAVITY FLOW: cosmetic items are defined by visual fields only, and every purchase grants cosmetics or ad removal—nothing that changes gameplay.",
        "DeveloperOS: it declines when the index doesn't support an answer—before the provider is ever reached."],
      ["Aegis starts from one launcher script, and its repository keeps an audit document that lists the work still open."],
    ]);
    for (const e of rows.flatMap((r) => r.evidence)) expect(e.name + e.rest, e.name).toBe(e.text);   // the name, set apart
  });
  it("DeveloperOS's line is built only from DeveloperOS's own text: its description and its refusal decision", () => {
    expect(DOS_EVIDENCE).toBe("DeveloperOS: it declines when the index doesn't support an answer—before the provider is ever reached.");
    const dos = project("developeros");
    expect(dos.description).toContain("declines outright when the index doesn't support an answer");
    const refusal = dos.caseStudy.decisions.find((d) => d.title === "Refusal as a first-class code path")!;
    expect(refusal.body).toContain("before the provider is ever reached");
    // Nothing else: the line's words, less the connectives, are all in those two sources.
    const own = `${dos.name} ${dos.description} ${refusal.body}`.toLowerCase();
    for (const w of DOS_EVIDENCE.toLowerCase().match(/[a-z']+/g)!.filter((w) => !["it"].includes(w))) expect(own, w).toContain(w);
  });
  it("each live example rests on its project's own data", () => {
    const text = (id: string) => JSON.stringify(project(id));
    expect(text("poker")).toContain("keeping the money exact to the cent, including in a guest game run entirely on a phone with no signal");
    expect(text("gravity-flow")).toContain("Cosmetic items are defined by visual fields only, every purchase grants cosmetics or ad removal");
    expect(text("aegis")).toContain("one launcher script");
    expect(text("aegis")).toContain("audit document");
  });
  it("names all four flagships, each once; no figure, year, institution, AI claim or private repository", () => {
    const names = rows.flatMap((r) => r.evidence.map((e) => e.name));
    expect([...names].sort()).toEqual(panels.map((p) => p.name).sort());   // the four flagships Work shows
    const text = shown.join(" | ");
    expect(text).not.toMatch(/\d/);
    expect(text).not.toMatch(/\bAI\b|LLM|\bmodel\b|machine learning|\bML\b|microservice/i);
    for (const t of [block, src, text]) expect(namesAny(t)).toBe(false);
    expect(privateRepoLeaks(block + src + JSON.stringify(tbsBlock))).toEqual([]);
  });
  it("a server component under Stack inside <main>: no client code, no reveal, no link, no image", () => {
    for (const t of [block, src]) expect(t).not.toMatch(/^["']use client["']|useState|useEffect|data-reveal/m);
    expect(code(block)).not.toMatch(/<a\b|<Link|<button|<img|<svg|<picture|<Pic|<Image|<Shot/);
    expect(home).toMatch(ORDER);   // Contact follows it (session 15)
    expect(inMain("<ThinkBuildShip />")).toBe(true);
    expect(home).not.toMatch(/data-reveal/);
    // The live structure: an ordered list of rows, each word an h3 with the live screen-reader colon.
    expect(block).toMatch(/<ol className="wk__tbs-rows">/);
    expect(block).toMatch(/<h3 className="wk__tbs-word">\{r\.word\}<span className="sr-only">:<\/span><\/h3>/);
    expect(block).toMatch(/<span className="wk__tbs-project">\{e\.name\}<\/span>\{e\.rest\}/);
  });
  it("adds no token and no motion; the rows sit on About's and Stack's grid from 1024px", () => {
    const rules = css.slice(css.indexOf("/* ── Think · Build · Ship (P3.5"), css.indexOf("/* ── Contact (P3.6"));
    expect(rules.length).toBeGreaterThan(500);
    expect(rules).not.toMatch(/--cine-[\w-]+:|#[0-9a-fA-F]{3,6}\b|rgba?\(|transition|animation|data-reveal/);
    expect(rules.match(/var\(--cine-[\w-]+\)/g)!.length).toBeGreaterThan(20);
    expect(rules).toMatch(/@media \(min-width: 1024px\) \{\s*\.wk__tbs-row \{ grid-template-columns: minmax\(0, 5fr\) minmax\(0, 7fr\); column-gap: clamp\(40px, 5vw, 80px\); \}/);
    expect(css).toMatch(/\.wk__about-title, \.wk__stack-title, \.wk__tbs-title, \.wk__mw-title, \.wk__contact-title \{/);
  });
});

// Contact (P3.6, session 15): the live Contact section's own words and links, under Think · Build · Ship. Tay approved
// the copy before it was built: the live title (not the reference images' draft), the live mailto with its subject, the
// nav's "Contact" as the eyebrow, and the lead only while the site says it is open. Each string and target is held to its
// source, and the approved copy is pinned, so a change to either one shows up here. The prototype also read the Product
// Plates Contact (components/sections/Contact.tsx then); the release replaced that file, so those reads are the fixed
// values below, as product-plates-final has them.
describe("Contact (P3.6): the live Contact section's own words, and its four links at the live targets", () => {
  const block = read("components/sections/Contact.tsx");
  const src = read("components/sections/contactBlock.ts");
  const c = contactBlock;
  const shown = [c.eyebrow, ...c.title, c.lead ?? "", c.email.label, ...c.profiles.map((p) => p.label), c.resume.label, c.resume.note];

  it("the eyebrow is the nav's, and the title and the lead are the live section's, word for word", () => {
    expect(c.eyebrow).toBe(dict.nav.contact);
    expect(c.eyebrow).toBe("Contact");
    expect(c.title).toEqual(dict.contact.title);
    expect([...c.title]).toEqual(["Let's build something", "people use."]);   // the live title (Tay, session 15)
    expect(c.title.join(" ")).not.toMatch(/meaningful/);                       // not the reference images' draft
    expect(c.lead).toBe(availability.detail);
    expect(c.lead).toBe("I'm looking for a software engineering opportunity that fits my skills—on-site, hybrid, or remote.");
    expect(block).toMatch(/<span>\{c\.title\[0\]\}<\/span> <span>\{c\.title\[1\]\}<\/span>/);   // each half on its own line, as live
  });
  it("the lead shows only while the site says it is open (Tay, session 15)", () => {
    expect(availability.open).toBe(true);
    expect(src).toMatch(/lead: availability\.open \? availability\.detail : null,/);
    expect(block).toMatch(/\{c\.lead && <p className="wk__contact-lead">\{c\.lead\}<\/p>\}/);
  });
  it("email: the live Contact's mailto, with its subject, in the same tab", () => {
    expect(c.email.href).toBe(`mailto:${socials.email}?subject=${encodeURIComponent(dict.contact.subject)}`);
    expect(c.email.href).toBe(`mailto:${socials.email}?subject=Hello%20Tay`);
    expect(c.email.label).toBe("Email me");
    expect(block).toMatch(/<a href=\{c\.email\.href\} className="wk__go wk__go--fill" data-email>\{c\.email\.label\}<\/a>/);
  });
  it("the two profiles: the live labels, order and targets, each in a new tab and saying so", () => {
    expect(c.profiles).toEqual([
      { href: socials.linkedin.url, label: dict.contact.linkedin },
      { href: socials.github.url, label: dict.contact.github },
    ]);
    // The live order, LinkedIn first, as fixed values.
    expect(c.profiles.map((p) => [p.label, p.href])).toEqual([
      ["LinkedIn", "https://www.linkedin.com/in/tay-shofer-1b2b54287"], ["GitHub", "https://github.com/taysh123"]]);
    expect(block).toMatch(/<a key=\{p\.href\} href=\{p\.href\} target="_blank" rel="noopener noreferrer" className="wk__go" data-profile>/);
    expect(block).toContain('<span className="sr-only">{dict.common.newTab}</span>');
  });
  it("the résumé: the live label and note, the same file and download; its size never breaks across a line; the PDF is untouched", () => {
    expect(c.resume.href).toBe(resume.href);
    expect(c.resume.fileName).toBe(resume.fileName);
    expect(c.resume.label).toBe(dict.contact.resume);
    expect(c.resume.label).toBe("Download résumé (PDF)");
    expect(c.resume.note).toBe(" · two pages, 79 KB");   // the live note, its size joined by a no-break space
    expect(dict.contact.resumeNote).toBe(" · two pages, 79 KB");
    expect(block).toContain('<a href={c.resume.href} download={c.resume.fileName} type="application/pdf" data-resume>{c.resume.label}</a>');
    // As on the Product Plates Contact, "79 KB" never splits; and the whole note is one unbreakable run.
    expect(block).toContain("<span>{c.resume.note}</span>");
    expect(css).toMatch(/\.wk__contact-resume span \{ white-space: nowrap; \}/);
  });
  it("no form and no backend: four plain links; no client code, no reveal, and it ends the page inside <main>", () => {
    for (const t of [block, src]) expect(t).not.toMatch(/^["']use client["']|useState|useEffect|data-reveal|fetch\(|action=/m);
    expect(code(block)).not.toMatch(/<form|<input|<textarea|<button|<img|<picture|<Pic|<Image|<Shot|<canvas/);
    expect(code(block).match(/<a /g)).toHaveLength(3);   // the email, the profiles (one, mapped), the résumé
    expect(home).toMatch(/<ThinkBuildShip \/>\n\s*<Contact \/>\n\s*<\/div>/);   // the last section; the footer follows <main>
    expect(inMain("<Contact />")).toBe(true);
    expect(home).not.toMatch(/data-reveal/);
  });
  it("no institution, no year, no figure but the résumé's size, no private repository, no availability claim beyond the live lead", () => {
    const text = shown.join(" | ");
    for (const t of [block, src, text]) expect(namesAny(t)).toBe(false);
    expect(text).not.toMatch(/\b(19|20)\d{2}\b/);
    expect(text.match(/\d+/g)).toEqual(["79"]);   // the résumé's size, the live site's own note
    expect(shown.filter((t) => /availab|looking|open to|hiring|freelance|full-time|part-time|immediate|start/i.test(t))).toEqual([availability.detail]);
    expect(privateRepoLeaks(block + src + JSON.stringify(c))).toEqual([]);
  });
  it("adds no token and no motion; its rules read only layer tokens, on About's grid from 1100px (stacked below: Tay)", () => {
    const rules = css.slice(css.indexOf("/* ── Contact (P3.6"), css.indexOf("/* ── Smaller screens"));
    expect(rules.length).toBeGreaterThan(500);
    expect(rules).not.toMatch(/--cine-[\w-]+:|#[0-9a-fA-F]{3,6}\b|rgba?\(|transition|animation|data-reveal/);
    expect(rules.match(/var\(--cine-[\w-]+\)/g)!.length).toBeGreaterThan(15);
    expect(rules).toMatch(/@media \(min-width: 1100px\) \{\s*\.wk__contact \{ grid-template-columns: minmax\(0, 5fr\) minmax\(0, 7fr\); column-gap: clamp\(40px, 5vw, 80px\); \}/);
    expect(rules).not.toMatch(/min-width: 1024px/);   // Contact alone: About, Stack and Think · Build · Ship keep 1024
    expect(css).toMatch(/\.wk__about-eyebrow, \.wk__stack-eyebrow, \.wk__contact-eyebrow \{/);
    expect(css).toMatch(/\.wk__about-title span, \.wk__contact-title span \{ display: block; \}/);
    expect(css).toMatch(/\.wk__about-lede, \.wk__contact-lead \{/);
  });
});
