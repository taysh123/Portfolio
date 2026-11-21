import { projects, publicRepoUrl, PROJECT_GALLERIES, type Project } from "@/data/projects";
import { flagships, type WorldKey } from "@/data/work";
import { indexStateKey } from "@/data/proof";
import { captureOf, type CaptureName } from "@/data/lab-images";
import { dict } from "@/lib/dict";
import { fmt } from "@/lib/fmt";

/**
 * Work's four product panels (Concept A, round 5). Every word a reader sees comes from the site's own data:
 * the name and the one line (`tagline`) from data/projects.ts, the state from the interface's status table (as the
 * live hero reads it), the chips from the project's own stack, the links from its own URLs, the captures from the
 * project's gallery (data/projects.ts PROJECT_GALLERIES), their alt text from lib/dict.ts or the project's media.
 * tests/unit/lab-work.test.ts checks each against its source.
 */

/** A box the server draws on a capture (P4), in shares of the capture: left, top, width and height. */
export type Box = { l: string; t: string; w: string; h: string };
/** A mark on a capture (P4): where it sits on the capture, and on its phone crop below 640px. */
export type Mark = { box: Box; phone?: Box };

/** One capture in a panel's gallery. `phone` is the crop the live chapter swaps in below 640px, if it has one; `marks`
 *  are drawn on it by the server (Shot.tsx). */
export type Slide = { image: CaptureName; phone?: CaptureName; alt: string; marks?: Mark[] };

export type Panel = {
  id: WorldKey;
  name: string;
  line: string;
  state: string;
  chips: string[];
  /** The project's own destination: its live product, else its public repository; none for GRAVITY FLOW. */
  primary?: { href: string; label: string };
  /** T Poker and GRAVITY FLOW: shown as a label, never a link (no slug, no URL, anywhere). */
  privateRepo: boolean;
  /** The project's real captures, in order. One is a still capture; two or more are a carousel. */
  gallery: Slide[];
  /** Phone screens or desktop windows (every capture in a gallery is the same kind). */
  kind: "phone" | "window";
  /** Which side the capture takes on wide screens, alternating down the section. */
  side: "left" | "right";
  tone: "cyan" | "violet";
};

/** The first three file:line chips on the DeveloperOS search capture (1600×1027), measured: left, top, width and height
 *  in px. The Product Plates chapter's own (product-plates-final:components/work/DeveloperOSChapter.tsx, CHIPS: not
 *  exported, so the unit test holds this copy equal). Its phone crop is the capture's top-left 820×612, so the same
 *  pixels hold there. */
export const DOS_CHIP_BOXES = [
  { x: 21, y: 183, w: 394, h: 25, label: "devos/providers/ollama.py:1-50" },
  { x: 21, y: 339, w: 330, h: 25, label: "tests/test_ollama.py:1-50" },
  { x: 21, y: 495, w: 405, h: 25, label: "devos/providers/__init__.py:1-5" },
] as const;
/** The chips' names, as the capture's alt text gives them. */
export const DOS_CHIPS: string[] = DOS_CHIP_BOXES.map((c) => c.label);

const project = (id: string): Project => projects.find((p) => p.id === id)!;

/** The alt text the project's own media already gives one of its files (public/projects/<project>/<file>): its lead
 *  image's, or its gallery entry's. A capture in public/work that re-encodes that file (scripts/m10-images.mjs) takes
 *  it word for word; the unit test compares the pixels, so the text is the picture's. */
export function mediaAlt(id: string, file: string): string | undefined {
  const m = project(id).media;
  if (m?.image?.endsWith(`/${file}`)) return m.alt;
  return m?.gallery?.find((g) => g.src.endsWith(`/${file}`))?.alt;
}

/** The alt text for every capture a gallery can name, from where the site already says it: lib/dict.ts, or the
 *  project's own media. A gallery entry may carry its own instead ({ image, alt }); an image with neither fails the
 *  build (below) and the unit test. */
const ALT: Partial<Record<CaptureName, string>> = {
  "poker-home": dict.poker.alts[0],
  "poker-live": dict.poker.alts[1],
  "poker-settle": dict.poker.alts[2],
  "aegis-alerts": dict.aegis.alt,
  // The Incidents board crop (data/images.ts AEGIS_BOARD): public/projects/aegis/incident-board-open.webp is the same crop.
  "hero-aegis": mediaAlt("aegis", "incident-board-open.webp"),
  "dos-search": fmt(dict.dos.alt, { chips: DOS_CHIPS.join(", ") }),
  "gf-gameplay": dict.gf.alt,
  "gf-boss": mediaAlt("gravity-flow", "boss.webp"),
  // The lab's own captures (data/lab-images.ts), each a re-encode of the file named.
  "poker-podium": mediaAlt("poker", "podium.webp"),
  "poker-stats": mediaAlt("poker", "stats.webp"),
  "dos-learning": mediaAlt("developeros", "learning.webp"),
  "dos-career": mediaAlt("developeros", "career.webp"),
  "dos-dashboard": mediaAlt("developeros", "dashboard.webp"),
  "gf-gravity-run": mediaAlt("gravity-flow", "gravity-run.webp"),
  "gf-cosmetics": mediaAlt("gravity-flow", "cosmetics.webp"),
  "gf-win": mediaAlt("gravity-flow", "win.webp"),
};
/** The phone crops the Product Plates chapters used below 640px (product-plates-final:components/work/). */
export const PHONE_CROP: Partial<Record<CaptureName, CaptureName>> = { "aegis-alerts": "aegis-alerts-phone", "dos-search": "dos-search-phone" };
const KIND: Record<WorldKey, Panel["kind"]> = { poker: "phone", aegis: "window", developeros: "window", "gravity-flow": "phone" };

/** A rectangle of a capture, in px, as a share of that capture's real size. */
function boxOn(name: CaptureName, x: number, y: number, w: number, h: number): Box {
  const c = captureOf(name), pct = (v: number, of: number) => `${((v / of) * 100).toFixed(2)}%`;
  return { l: pct(x, c.w), t: pct(y, c.h), w: pct(w, c.w), h: pct(h, c.h) };
}
/** P4: the marks drawn on a capture, by the server, inside its carousel slide. DeveloperOS's search capture: a citation
 *  box on each of its first three file:line chips, framed 4px out on every side, as the Product Plates chapter drew them. */
const MARKS: Partial<Record<CaptureName, Mark[]>> = {
  "dos-search": DOS_CHIP_BOXES.map(({ x, y, w, h }) => ({
    box: boxOn("dos-search", x - 4, y - 4, w + 8, h + 8),
    phone: boxOn("dos-search-phone", x - 4, y - 4, w + 8, h + 8),
  })),
};

function galleryOf(id: WorldKey): Slide[] {
  return PROJECT_GALLERIES[id].map((e) => {
    const image = typeof e === "string" ? e : e.image;
    const alt = typeof e === "string" ? ALT[image] : e.alt;
    if (!alt) throw new Error(`${id}: capture "${image}" has no alt text (give its gallery entry one)`);
    return { image, alt, ...(PHONE_CROP[image] ? { phone: PHONE_CROP[image] } : null), ...(MARKS[image] ? { marks: MARKS[image] } : null) };
  });
}

/** The state, as the live hero's index reads it, except where that would repeat the link beside it: Aegis's index
 *  state is "Source on GitHub", so its own status ("Runs locally") is shown instead. DeveloperOS adds its version,
 *  from its own data. */
function stateOf(p: Project): string {
  const key = indexStateKey(p);
  const state = key === "source" ? dict.status[p.status] : dict.status[key];
  const version = p.status === "released" ? p.context.match(/\bv\d+\.\d+\.\d+\b/)?.[0] : undefined;
  return version ? `${state} · ${version}` : state;
}

/** Up to three: the stack's emphasised entries first, then the rest in the data's own order. */
const chipsOf = (p: Project) => [...p.stack.filter((s) => s.emphasis), ...p.stack.filter((s) => !s.emphasis)].slice(0, 3).map((s) => s.label);

function primaryOf(p: Project): Panel["primary"] {
  if (p.liveUrl) return { href: p.liveUrl, label: p.liveLabel ?? dict.poker.webApp };
  const repo = publicRepoUrl(p);
  return repo ? { href: repo, label: dict.common.source } : undefined;
}

export const panels: Panel[] = flagships.map((f, i) => {
  const p = project(f.id);
  return {
    id: f.id,
    name: p.name,
    line: p.tagline,
    state: stateOf(p),
    chips: chipsOf(p),
    primary: primaryOf(p),
    privateRepo: p.repo.visibility === "private",
    gallery: galleryOf(f.id),
    kind: KIND[f.id],
    side: i % 2 === 0 ? "left" : "right",
    tone: i % 2 === 0 ? "cyan" : "violet",
  };
});
