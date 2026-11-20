/**
 * Single source of truth for the accessibility preferences, persisted in a cookie so the server can render the correct
 * `data-*` attributes on `<html>` and match the client's first render exactly (no hydration mismatch, no flash). The
 * site is dark only (Concept A, R3), so this is its one preference cookie; /privacy names it.
 */

export type A11yPrefs = {
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
};

export const A11Y_COOKIE = "a11y";

const DEFAULT_A11Y: A11yPrefs = {
  reducedMotion: false,
  highContrast: false,
  largeText: false,
};

/** Maps each a11y preference to the `data-*` attribute its CSS selector uses. */
export const A11Y_ATTR: Record<keyof A11yPrefs, string> = {
  reducedMotion: "data-reduced-motion",
  highContrast: "data-high-contrast",
  largeText: "data-large-text",
};

export function parseA11y(value: string | undefined): A11yPrefs {
  if (!value) return DEFAULT_A11Y;
  try {
    // writeCookie() URL-encodes the JSON; Next's cookies().get().value is not
    // auto-decoded, so decode before parsing. decodeURIComponent is a no-op on
    // already-plain JSON, so this also tolerates an unencoded value.
    const parsed = JSON.parse(decodeURIComponent(value)) as Partial<A11yPrefs>;
    return {
      reducedMotion: Boolean(parsed.reducedMotion),
      highContrast: Boolean(parsed.highContrast),
      largeText: Boolean(parsed.largeText),
    };
  } catch {
    return DEFAULT_A11Y;
  }
}

/** Client-only cookie writer (1-year, lax, and Secure whenever the page is served over HTTPS — every deployment; a
 *  local http server is the only exception). Server sets cookies via render-time props instead. The one cookie holds
 *  the visitor's own accessibility preferences and nothing else (app/privacy/page.tsx says so). */
export function writeCookie(name: string, value: string): void {
  if (typeof document === "undefined") return;
  const secure = typeof location !== "undefined" && location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; samesite=lax${secure}`;
}
