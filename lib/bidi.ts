/**
 * Hebrew prose carries Latin technical names, and a few of them end in characters the Unicode bidi algorithm treats as
 * neutral: "C++", "C#", "decimal(18,2)". Followed by Hebrew, those neutrals take the paragraph's right-to-left
 * direction and jump to the wrong side ("++C"). A left-to-right mark (U+200E, invisible and silent) after such a name
 * keeps it whole. Applied when the Hebrew page's text is assembled (lib/content.ts, lib/projects.ts), so the source
 * strings stay exactly as written.
 */
const LRM = "‎";
const TOKEN = /[A-Za-z][A-Za-z0-9]*(?:[+#]+|\([^()֐-׿]*\))(?!‎)/g;

export const fixBidi = (s: string): string => s.replace(TOKEN, (m) => m + LRM);

/** fixBidi over every string in a plain object or array (copy only: ids and links never pass through here). */
export function fixBidiDeep<T>(v: T): T {
  if (typeof v === "string") return fixBidi(v) as T;
  if (Array.isArray(v)) return v.map(fixBidiDeep) as T;
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, fixBidiDeep(x)])) as T;
  return v;
}
