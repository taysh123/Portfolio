/** Fills `{name}` placeholders in a dictionary string (lib/dict.ts). An unknown placeholder is left as written, so a
 *  missing value shows up in review instead of disappearing. */
export function fmt(s: string, vars: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}
