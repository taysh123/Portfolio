// tests/support/institution.ts — the institution the site never names (the owner's decision, 2026-10-13), checked
// without spelling it out: review snapshots of this repository are public. Each entry is the SHA-256 of a term —
// its abbreviation (a whole word, case-sensitive), its city in English and Hebrew (anywhere inside a word), and the
// phrases of its name in English and Hebrew (the Hebrew ones also with a one- or two-letter prefix: ב־, ה־, ו־, וב־…).
import { createHash } from "node:crypto";

export const sha256 = (s: string) => createHash("sha256").update(s, "utf8").digest("hex");

export type Terms = { word: Set<string>; part: Map<number, Set<string>>; phrase: Set<string> };

export const INSTITUTION: Terms = {
  word: new Set(["52d5e72d08fd23a7f77d846c2139b9ecec31eae32c59171d8391ed5d14edba56"]),
  part: new Map([[5, new Set(["eebe49c50da5f9ecc3574f96ec4a83ad5615e9816577403384a985d79763c5f8", "3d8e20aa8d911109a6b0c986ee6bb521aaa90cf1c9141c99f2d3143c872db2e8"])]]),
  phrase: new Set(["9681012aca3620dae3be50e9df951039868f0e03c7a486160f1217788c1182ef", "b977dbe45893baafa2cd3f97033007a972e82b5e8df9d37160c21270e2d3c3e6", "68b8571112eb3e1bfc27c5e96989a57e005426f6da96296af9b0f0e8286d2254"]),
};

const hebrew = /[\u0590-\u05ff]/;
/** True when the text names any of the terms. */
export function namesAny(text: string, t: Terms = INSTITUTION): boolean {
  const words = text.match(/[\p{L}\p{M}]+/gu) ?? [];
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (t.word.has(sha256(w))) return true;
    for (const [len, set] of t.part) for (let k = 0; k + len <= w.length; k++) if (set.has(sha256(w.slice(k, k + len)))) return true;
    const firsts = hebrew.test(w) ? [w, w.slice(1), w.slice(2)] : [w];
    for (const f of firsts) for (const n of [2, 3]) {
      if (i + n > words.length) continue;
      if (t.phrase.has(sha256([f, ...words.slice(i + 1, i + n)].join(" ")))) return true;
    }
  }
  return false;
}
