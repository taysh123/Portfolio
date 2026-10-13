import { publicRepoUrl, type Project } from "@/data/projects";
import { flagships, projectOf } from "@/data/work";

/**
 * Figures derived from the project data rather than typed a second time.
 *
 * M9: the summed test figure the hero and Stack used to show was removed: three quarters of it came from T Poker's
 * private repository, Aegis has no CI behind its count, and a sum of test volume is activity, not an outcome. Each
 * project's own, checkable figure stays in its own chapter.
 */

/** One honest state per flagship for the hero's index, read from the project's own status, stores and repo — as a key
 *  into the interface dictionary's `status` table (lib/dict.ts), so both languages say the same thing. */
export type IndexState = "stores" | "storesNoWeb" | "source" | Project["status"];
export function indexStateKey(p: Project): IndexState {
  const live = new Set(p.stores?.filter((s) => s.status === "live" && s.url).map((s) => s.platform));
  // T Poker: both store listings and the web app are live (the owner confirmed all three).
  if (p.status === "live" && live.has("ios") && live.has("android")) return p.liveUrl ? "stores" : "storesNoWeb";
  // "Source on GitHub", not "Open source": Aegis's repository carries no licence (M9 claims audit AE18).
  if (p.status === "local" && publicRepoUrl(p)) return "source";
  return p.status;
}
const STATE_EN: Record<IndexState, string> = {
  stores: "Available on iOS, Android, and the web", storesNoWeb: "Available on iOS and Android", source: "Source on GitHub",
  live: "Live", released: "Released", rc: "Release candidate", coursework: "Coursework", local: "Runs locally",
};
/** The English state (the social card and the tests read it; the page reads the dictionary). */
export const indexState = (p: Project): string => STATE_EN[indexStateKey(p)];

export const heroIndex = flagships.map((f) => {
  const p = projectOf(f.id);
  return { id: p.id, name: p.name, state: indexState(p), href: `#work-${p.id}` };
});
