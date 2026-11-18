// T Poker's and GRAVITY FLOW's repositories are private, and their addresses are not kept anywhere in this public
// repository — not even in the tests. Leak checks compare SHA-256 digests of every candidate token instead of the
// plain names.
import { createHash } from "node:crypto";

/** sha256 of each private repository's slug (lower-case). */
export const PRIVATE_SLUGS: ReadonlySet<string> = new Set([
  "309591399bc75dc420c224f63604531eaebd3a30b1f11a38926086e2a198d6b9", // T Poker
  "2157fcbe2aa16d0a96584672dcac8c0e1ae1b0f2e82db5c1eda956f1d86d8c74", // GRAVITY FLOW (owner decision 2026-11-18, N8)
]);

/** The digest a slug is pinned by: sha256 of its lower-case form. */
export const slugDigest = (s: string) => createHash("sha256").update(s.toLowerCase()).digest("hex");

/** Every token that could be a repository or project name: letters, digits, dot, hyphen, underscore. Each slug is
 *  also checked as each hyphen-prefix of a longer token, so a suffix cannot hide it (the retired Vercel project
 *  was T Poker's slug plus "-three"). `slugs` defaults to the pinned set; tests inject throwaway digests. */
export function privateRepoLeaks(text: string, slugs: ReadonlySet<string> = PRIVATE_SLUGS): string[] {
  const hits = new Set<string>();
  for (const t of new Set(text.match(/[A-Za-z0-9][A-Za-z0-9._-]{2,120}/g) ?? [])) {
    const parts = t.split(/[./]/);
    for (const p of parts) {
      const segs = p.split("-");
      for (let i = 1; i <= segs.length; i++) {
        const d = slugDigest(segs.slice(0, i).join("-"));
        if (slugs.has(d)) hits.add(`a token hashing to ${d.slice(0, 8)}…`);
      }
    }
  }
  return [...hits];
}
