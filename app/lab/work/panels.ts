import { projects, publicRepoUrl, PROJECT_GALLERIES, type Project } from "@/data/projects";
import { flagships, type WorldKey } from "@/data/work";
import { indexStateKey } from "@/data/proof";
import type { ImageName } from "@/data/images";
import { dict } from "@/lib/dict";
import { fmt } from "@/lib/fmt";

/**
 * The Work slice's four product panels (PROTOTYPE, round 5). Every word a reader sees comes from the site's own data:
 * the name and the one line (`tagline`) from data/projects.ts, the state from the interface's status table (as the
 * live hero reads it), the chips from the project's own stack, the links from its own URLs, the captures from the
 * project's gallery (data/projects.ts PROJECT_GALLERIES), their alt text from lib/dict.ts or the project's media.
 * tests/unit/lab-work.test.ts checks each against its source.
 */

/** One capture in a panel's gallery. `phone` is the crop the live chapter swaps in below 640px, if it has one. */
export type Slide = { image: ImageName; phone?: ImageName; alt: string };

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
  /** Its full chapter on the live page. */
  more: { href: string; label: string };
  /** The project's real captures, in order. One is a still capture; two or more are a carousel. */
  gallery: Slide[];
  /** Phone screens or desktop windows (every capture in a gallery is the same kind). */
  kind: "phone" | "window";
  /** Which side the capture takes on wide screens, alternating down the section. */
  side: "left" | "right";
  tone: "cyan" | "violet";
};

/** The three file:line chips on the DeveloperOS search capture, as the live chapter names them in its alt text
 *  (components/work/DeveloperOSChapter.tsx, CHIPS: not exported, so the unit test keeps this copy equal). */
export const DOS_CHIPS = ["devos/providers/ollama.py:1-50", "tests/test_ollama.py:1-50", "devos/providers/__init__.py:1-5"];

const project = (id: string): Project => projects.find((p) => p.id === id)!;

/** The alt text for every capture a gallery can name, from where the site already says it: lib/dict.ts, or the
 *  project's own media. A gallery entry may carry its own instead ({ image, alt }); an image with neither fails the
 *  build (below) and the unit test. */
const ALT: Partial<Record<ImageName, string>> = {
  "poker-home": dict.poker.alts[0],
  "poker-live": dict.poker.alts[1],
  "poker-settle": dict.poker.alts[2],
  "aegis-alerts": dict.aegis.alt,
  "hero-aegis": project("aegis").media!.alt!,   // the Incidents board crop (data/images.ts AEGIS_BOARD), if it is added
  "dos-search": fmt(dict.dos.alt, { chips: DOS_CHIPS.join(", ") }),
  "gf-gameplay": dict.gf.alt,
  // public/work/gf-boss is public/projects/gravity-flow/boss.webp re-encoded: its alt text is that gallery entry's.
  "gf-boss": project("gravity-flow").media!.gallery!.find((g) => g.src.endsWith("/boss.webp"))!.alt,
};
/** The phone crops the live chapters use below 640px (the unit test reads them from the chapters). */
export const PHONE_CROP: Partial<Record<ImageName, ImageName>> = { "aegis-alerts": "aegis-alerts-phone", "dos-search": "dos-search-phone" };
const KIND: Record<WorldKey, Panel["kind"]> = { poker: "phone", aegis: "window", developeros: "window", "gravity-flow": "phone" };

function galleryOf(id: WorldKey): Slide[] {
  return PROJECT_GALLERIES[id].map((e) => {
    const image = typeof e === "string" ? e : e.image;
    const alt = typeof e === "string" ? ALT[image] : e.alt;
    if (!alt) throw new Error(`${id}: capture "${image}" has no alt text (give its gallery entry one)`);
    return { image, alt, ...(PHONE_CROP[image] ? { phone: PHONE_CROP[image] } : null) };
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
    more: { href: `/#work-${p.id}`, label: `More on ${p.name}` },
    gallery: galleryOf(f.id),
    kind: KIND[f.id],
    side: i % 2 === 0 ? "left" : "right",
    tone: i % 2 === 0 ? "cyan" : "violet",
  };
});
