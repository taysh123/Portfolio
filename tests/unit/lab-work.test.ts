// tests/unit/lab-work.test.ts — the Work slice in the cinematic language (PROTOTYPE, round 5; D1 reopened by Tay,
// 2026-11-18; D2 not reopened, so no WebGL). Branch proto/hero-a-cinematic only, never merged. Every visible fact must
// come from the site's own data, private repositories stay labels, and the slice stays inside the lab's .cine layer.
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import { projects, publicRepoUrl, PRIVATE_REPO_LABEL, PROJECT_GALLERIES } from "@/data/projects";
import { flagships } from "@/data/work";
import { IMAGES } from "@/data/images";
import { LAB_IMAGES, captureOf } from "@/data/lab-images";
import { dict } from "@/lib/dict";
import { panels, DOS_CHIPS, PHONE_CROP } from "@/app/lab/work/panels";
import { aboutBlock } from "@/app/lab/work/about";
import { stackBlock, SECURITY_ROWS, SECURITY_EVIDENCE } from "@/app/lab/work/stack";
import { skillGroups } from "@/data/skills";
import { projectsFor, lensProjects } from "@/data/stackLens";
import { fmt } from "@/lib/fmt";
import { about } from "@/data/about";
import { availability, resume, socials } from "@/data/socials";
import sharp from "sharp";
import { privateRepoLeaks } from "../support/private-repo";
import { namesAny } from "../support/institution";

const read = (f: string) => fs.readFileSync(f, "utf8").replace(/\r\n/g, "\n");
const page = read("app/lab/work/page.tsx");
const css = read("app/lab/work/work.css");
const data = read("app/lab/work/panels.ts");
const reel = read("app/lab/work/Reel.tsx");
const shot = read("app/lab/work/Shot.tsx");
/** Code without its comments (a comment saying "no WebGL" is not WebGL). */
const code = (t: string) => t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
const layer = read("app/lab/_cinematic/cinematic.css");
const project = (id: string) => projects.find((p) => p.id === id)!;

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
  it("links: the live product where one exists, else the public repository; GRAVITY FLOW has neither", () => {
    const by = Object.fromEntries(panels.map((p) => [p.id, p]));
    expect(by.poker.primary).toEqual({ href: project("poker").liveUrl, label: project("poker").liveLabel });
    expect(by.aegis.primary).toEqual({ href: publicRepoUrl(project("aegis")), label: dict.common.source });
    expect(by.developeros.primary).toEqual({ href: publicRepoUrl(project("developeros")), label: dict.common.source });
    expect(by["gravity-flow"].primary).toBeUndefined();
    for (const p of panels) expect(p.more).toEqual({ href: `/#work-${p.id}`, label: `More on ${p.name}` });
  });
  it("private repositories are labels, never links: no slug or URL in the slice's data, page or rendered values", () => {
    expect(panels.filter((p) => p.privateRepo).map((p) => p.id)).toEqual(["poker", "gravity-flow"]);
    for (const p of panels.filter((p) => p.privateRepo)) expect(project(p.id).repo.visibility).toBe("private");
    for (const t of [page, css, data, JSON.stringify(panels)]) expect(privateRepoLeaks(t)).toEqual([]);
    expect(JSON.stringify(panels)).not.toMatch(/github\.com\/[^"]*(poker|gravity)/i);
    expect(page).toMatch(/\{p\.privateRepo && <PrivateRepoLabel/);
    expect(PRIVATE_REPO_LABEL).toBe("Private repository");
  });
  it("names no institution, and claims no AI (Aegis's analysis is a deterministic mock; DeveloperOS's default is offline)", () => {
    for (const t of [page, data, JSON.stringify(panels)]) expect(namesAny(t)).toBe(false);
    expect(JSON.stringify(panels)).not.toMatch(/\bAI\b|LLM|model/i);
  });
  it("the title says projects, not products: not all four are shipped (Tay, round 5)", () => {
    expect(page).toMatch(/<h1[^>]*>Four projects, built end to end\.<\/h1>/);
    expect(page).not.toMatch(/Four products/);
  });
  it("adds no figures of its own: every number shown is in the project's data", () => {
    for (const p of panels) for (const n of `${p.line} ${p.state}`.match(/\d[\d.,]*/g) ?? [])
      expect(JSON.stringify(project(p.id)), `${p.id}: ${n}`).toContain(n);
    const jsx = code(page.slice(page.indexOf("  return (")));   // the markup only: sizes strings and comments are not copy
    const copy = [...jsx.replace(/<svg[\s\S]*?<\/svg>/g, "").replace(/className="[^"]*"/g, "").matchAll(/>([^<>{}]+)</g)].map((m) => m[1]).join(" ");
    expect(copy).not.toMatch(/\d/);
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
  it("is a separate export, not a field of the projects the live page and its case study read", () => {
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
  it("the lab's own captures: listed in data/lab-images.ts at their real sizes, never in data/images.ts", async () => {
    for (const [name, im] of Object.entries(LAB_IMAGES)) {
      expect(Object.keys(IMAGES), name).not.toContain(name);
      for (const w of im.widths) for (const ext of ["avif", "webp"]) {
        const m = await sharp(`public/work/${name}-${w}.${ext}`).metadata();
        expect(m.width, `${name}-${w}.${ext}`).toBe(w);
        if (w === im.w) expect(m.height, `${name}-${w}.${ext}`).toBe(im.h);
      }
      expect(im.widths.at(-1), name).toBe(im.w);
    }
    // The live About visual is client code that imports data/images.ts whole: a lab entry there would ship in /'s
    // first-load JavaScript. Only the lab (and data/projects.ts, for a type) may name data/lab-images.
    const files = (d: string): string[] => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? files(`${d}/${e.name}`) : [`${d}/${e.name}`]);
    const users = ["app", "components", "lib", "data"].flatMap(files).filter((f) => /\.(ts|tsx)$/.test(f) && /lab-images/.test(read(f)));
    expect(users.filter((f) => !f.startsWith("app/lab/"))).toEqual(["data/projects.ts"]);
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
  it("the phone crops are the ones the live chapters use below 640px", () => {
    const pairs = (f: string) => [...read(f).matchAll(/srcSet\("([\w-]+-phone)", "avif"\)[\s\S]*?srcSet\("([\w-]+)", "avif"\)/g)].map((m) => [m[2], m[1]]);
    expect(Object.entries(PHONE_CROP)).toEqual([...pairs("components/work/AegisChapter.tsx"), ...pairs("components/work/DeveloperOSChapter.tsx")]);
  });
  it("the DeveloperOS chips are the live chapter's own (copied, because the chapter does not export them)", () => {
    const chapter = read("components/work/DeveloperOSChapter.tsx");
    expect([...chapter.slice(chapter.indexOf("const CHIPS")).matchAll(/label: "([^"]+)"/g)].slice(0, 3).map((m) => m[1])).toEqual(DOS_CHIPS);
  });
  it("only the page's first capture loads eagerly at high priority; every other capture is lazy", () => {
    expect(page).toMatch(/<Shot \{\.\.\.p\.gallery\[0\]\} sizes=\{sizesOf\(p\.kind, false\)\} priority=\{i === 0\} \/>/);   // a still first panel
    expect(page).toMatch(/priority=\{i === 0 && k === 0\}/);                                                       // or a carousel's first capture
    expect(shot).toMatch(/loading=\{priority \? "eager" : "lazy"\} fetchPriority=\{priority \? "high" : undefined\}/);
  });
});

describe("structure", () => {
  it("leaves one labelled, empty, hidden slot per panel for the P4 demo: no demo and no placeholder", () => {
    expect(page).toMatch(/\{\/\* P4: the "try it" demo mounts here[\s\S]*?\*\/\}\n\s*<div className="wk__demo" data-demo-slot=\{p\.id\} hidden \/>/);
    expect(page.match(/data-demo-slot/g)).toHaveLength(1);   // one per panel, from the map
  });
  it("the carousel and Stack's filter are the slice's only client code: the page and its data stay on the server", () => {
    for (const t of [page, data, shot]) expect(t).not.toMatch(/^["']use client["']|useEffect|<canvas|getContext/m);
    expect(reel).toMatch(/^"use client";/);
    expect(code(reel)).not.toMatch(/<canvas|getContext|webgl|three|lenis/i);
    // It imports no data and no image table: the server renders every capture and hands them in (`shots`).
    expect(reel).not.toMatch(/from "\.\/panels"|from "\.\/Shot"|@\/data\//);
    expect(page).toMatch(/shots=\{p\.gallery\.map\(\(g, k\) => <Shot /);
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
  });
  it("every slide holds its capture's box, drawn or not (mixed shapes never shift the page), from the server's ratios", () => {
    expect(page).toMatch(/boxes=\{p\.gallery\.map\(\(g\) => \(\{ ratio: ratioOf\(g\.image\), \.\.\.\(g\.phone \? \{ phone: ratioOf\(g\.phone\) \} : null\) \}\)\)\}/);
    expect(shot).toMatch(/export const ratioOf = \(name: CaptureName\) => `\$\{captureOf\(name\)\.w\} \/ \$\{captureOf\(name\)\.h\}`;/);
    expect(css).toMatch(/\.wk__slide \.wk__device:empty::before \{ content: ""; display: block; aspect-ratio: var\(--wk-box\); \}/);
    expect(css).toMatch(/@media \(max-width: 639px\) \{[^@]*\.wk__slide \.wk__device:empty::before \{ aspect-ratio: var\(--wk-box-phone, var\(--wk-box\)\); \}/);
  });
  it("one opening reveal (eyebrow, the title settling, lede) and still panels", () => {
    expect(page.match(/\sdata-reveal(="settle")?[\s>]/g)).toHaveLength(3);
    expect(page).toMatch(/<h1[^>]*data-reveal="settle"/);
    expect([...css.matchAll(/--reveal-i: (\d+);/g)].map((m) => Number(m[1]))).toEqual([0, 1, 2]);
  });
  it("lifts on hover, keyboard focus and touch, and never moves with reduced motion", () => {
    expect(css).toMatch(/\.wk__panel:is\(:hover, :focus-within, :active\) \.wk__stage \{\s*translate: 0 var\(--cine-lift\);/);
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\) \{\s*\.wk__panel:is\(:hover, :focus-within, :active\) \.wk__stage \{ translate: none; \}/);
    expect(css).toMatch(/\[data-reduced-motion="true"\] \.wk__panel:is\(:hover, :focus-within, :active\) \.wk__stage \{ translate: none; \}/);
  });
});

describe("inside the cinematic layer", () => {
  it("every selector is scoped to the slice (.wk)", () => {
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
  it("lives under the /lab layout (noindex) and nothing on the live page links to it", () => {
    expect(fs.existsSync("app/lab/layout.tsx")).toBe(true);
    for (const f of ["app/page.tsx", "app/sitemap.ts", "app/robots.ts"]) expect(read(f), f).not.toMatch(/lab\/work/);
  });
});

// About (P3.3, session 12): Tay approved every word before it was built. Each string is held to its source, and the
// approved copy is pinned as well, so a change to either one shows up here.
describe("About (P3.3): the live About section's own words, and the live site's own links", () => {
  const block = read("app/lab/work/AboutBlock.tsx");
  const hero = read("app/lab/hero-a/page.tsx");
  const shown = [aboutBlock.eyebrow, ...aboutBlock.title, aboutBlock.lede, ...aboutBlock.facts, aboutBlock.availability ?? "",
    aboutBlock.resume.label, aboutBlock.resume.note, ...aboutBlock.profiles.map((p) => p.label)];

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
  it("the availability line is the one joined string: the live label, then the end of the live detail (Tay's choice)", () => {
    expect(aboutBlock.availability).toBe("Available for software engineering roles: on-site, hybrid, or remote.");
    expect(availability.open).toBe(true);
    expect(aboutBlock.availability!.startsWith(`${availability.label}: `)).toBe(true);
    expect(availability.detail.endsWith("—on-site, hybrid, or remote.")).toBe(true);
    expect(block).toMatch(/\{a\.availability && \(/);   // only while the site says it is open
  });
  it("links: the résumé, GitHub and LinkedIn at exactly the live site's targets", () => {
    expect(aboutBlock.resume.href).toBe(resume.href);
    expect(aboutBlock.resume.href).toBe("/resume/Tay-Shofer-Software-Engineer-Resume.pdf");
    expect(aboutBlock.resume.fileName).toBe(resume.fileName);
    expect(aboutBlock.profiles).toEqual([
      { href: socials.github.url, label: dict.contact.github },
      { href: socials.linkedin.url, label: dict.contact.linkedin },
    ]);
    expect(aboutBlock.profiles.map((p) => p.href)).toEqual(["https://github.com/taysh123", "https://www.linkedin.com/in/tay-shofer-1b2b54287"]);
    // The résumé is the locked hero's control: its label, its note, and a download of the same PDF.
    expect(hero).toContain(`${aboutBlock.resume.label}<span aria-hidden="true">↓</span>`);
    expect(aboutBlock.resume.note).toBe(" (PDF · two pages, 79 KB)");
    expect(block).toMatch(/<a href=\{a\.resume\.href\} download=\{a\.resume\.fileName\} type="application\/pdf"/);
    expect(block).toMatch(/target="_blank" rel="noopener noreferrer"/);
  });
  it("no photo, no capture, no institution, no year or number of its own, and no private repository", () => {
    expect(code(block)).not.toMatch(/<img|<picture|<Shot|<Pic|<Image/);
    for (const t of [block, read("app/lab/work/about.ts"), shown.join(" ")]) expect(namesAny(t)).toBe(false);
    expect(shown.join(" ")).not.toMatch(/\b(19|20)\d{2}\b/);
    expect(shown.join(" ").match(/\d+/g)).toEqual(["79"]);   // the résumé's size, the live site's own note
    expect(privateRepoLeaks(block + JSON.stringify(aboutBlock))).toEqual([]);
  });
  it("holds still and ships no client code: the page's one reveal stays the only one", () => {
    expect(block).not.toMatch(/data-reveal|"use client"|useState|useEffect/);
    expect(page).toMatch(/<AboutBlock \/>\n\s*<StackBlock \/>\n\s*<\/main>/);   // Stack follows it (session 13)
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
  const block = read("app/lab/work/StackBlock.tsx");
  const filter = read("app/lab/work/StackFilter.tsx");
  const src = read("app/lab/work/stack.ts");
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
  it("the filter is written from the options exactly as the live FILTER: only the project's tools, no empty group", () => {
    const live = read("components/sections/Stack.tsx");
    // The live rules: a tool whose data-p doesn't name the project goes, and so does a group left with none.
    expect(live).toContain('[data-tool]:not([data-p~="${id}"]){display:none}');
    expect(live).toContain('.sgroup:not(:has([data-p~="${id}"])){display:none}');
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
  it("under About inside <main>, and the page keeps its one opening reveal", () => {
    expect(page).toMatch(/<AboutBlock \/>\n\s*<StackBlock \/>\n\s*<\/main>/);
    expect(page.match(/\sdata-reveal(="settle")?[\s>]/g)).toHaveLength(3);
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
