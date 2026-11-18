import { projects, publicRepoUrl, type Project } from "@/data/projects";
import { flagships, type WorldKey } from "@/data/work";
import { indexStateKey } from "@/data/proof";
import type { ImageName } from "@/data/images";
import { dict } from "@/lib/dict";
import { fmt } from "@/lib/fmt";

/**
 * The Work slice's four product panels (PROTOTYPE, round 5). Every word a reader sees comes from the site's own data:
 * the name and the one line (`tagline`) from data/projects.ts, the state from the interface's status table (as the
 * live hero reads it), the chips from the project's own stack, the links from its own URLs, the alt text from
 * lib/dict.ts or the project's media. tests/unit/lab-work.test.ts checks each against its source.
 */

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
  capture: { image: ImageName; kind: "phone" | "window"; alt: string };
  /** Which side the capture takes on wide screens, alternating down the section. */
  side: "left" | "right";
  tone: "cyan" | "violet";
};

/** The three file:line chips on the DeveloperOS search capture, as the live chapter names them in its alt text
 *  (components/work/DeveloperOSChapter.tsx, CHIPS: not exported, so the unit test keeps this copy equal). */
export const DOS_CHIPS = ["devos/providers/ollama.py:1-50", "tests/test_ollama.py:1-50", "devos/providers/__init__.py:1-5"];

const project = (id: string): Project => projects.find((p) => p.id === id)!;

const CAPTURES: Record<WorldKey, Panel["capture"]> = {
  // The live tournament dashboard: the phone capture with the most going on.
  poker: { image: "poker-live", kind: "phone", alt: dict.poker.alts[1] },
  // The Incidents board crop (data/images.ts AEGIS_BOARD): the same capture the case study shows, with its alt text.
  aegis: { image: "hero-aegis", kind: "window", alt: project("aegis").media!.alt! },
  developeros: { image: "dos-search", kind: "window", alt: fmt(dict.dos.alt, { chips: DOS_CHIPS.join(", ") }) },
  "gravity-flow": { image: "gf-gameplay", kind: "phone", alt: dict.gf.alt },
};

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
    capture: CAPTURES[f.id],
    side: i % 2 === 0 ? "left" : "right",
    tone: i % 2 === 0 ? "cyan" : "violet",
  };
});
