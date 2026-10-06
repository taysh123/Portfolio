// T Poker's repository is private, and its address is not kept anywhere in this public repository — not even in
// the tests. Leak checks compare SHA-256 digests of every candidate token instead of the plain name.
import { createHash } from "node:crypto";

/** sha256 of the private repository's slug (lower-case). */
const PRIVATE_SLUG = "309591399bc75dc420c224f63604531eaebd3a30b1f11a38926086e2a198d6b9";

const sha = (s: string) => createHash("sha256").update(s.toLowerCase()).digest("hex");

/** Every token that could be a repository or project name: letters, digits, dot, hyphen, underscore. The slug is
 *  also checked as each hyphen-prefix of a longer token, so a suffix cannot hide it (the retired Vercel project
 *  was the slug plus "-three"). */
export function privateRepoLeaks(text: string): string[] {
  const hits = new Set<string>();
  for (const t of new Set(text.match(/[A-Za-z0-9][A-Za-z0-9._-]{2,120}/g) ?? [])) {
    const parts = t.split(/[./]/);
    for (const p of parts) {
      const segs = p.split("-");
      for (let i = 1; i <= segs.length; i++) {
        const cand = segs.slice(0, i).join("-");
        if (sha(cand) === PRIVATE_SLUG) hits.add(`a token hashing to ${sha(cand).slice(0, 8)}…`);
      }
    }
  }
  return [...hits];
}
