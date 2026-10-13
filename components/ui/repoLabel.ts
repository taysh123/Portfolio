import type { Project } from "@/data/projects";
import type { ClientDict } from "@/lib/dict-client";

/** What a project shows instead of a source link, in the page's language — or undefined when there is a public link
 *  (data/projects.ts repoLabel() is the English original). */
export function repoLabelOf(p: Pick<Project, "repo">, t: Pick<ClientDict, "common">): string | undefined {
  return p.repo.visibility === "private" ? t.common.privateRepo : p.repo.visibility === "unavailable" ? t.common.unavailableRepo : undefined;
}
