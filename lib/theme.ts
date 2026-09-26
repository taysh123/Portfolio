/**
 * Single source of truth for theme + accessibility preferences, persisted in
 * cookies so the server can render the correct `data-*` attributes on `<html>`
 * and match the client's first render exactly (no hydration mismatch, no flash).
 */

export type Theme = "dark" | "light";

export type A11yPrefs = {
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
};

export const THEME_COOKIE = "theme";
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

export function parseTheme(value: string | undefined): Theme {
  return value === "light" ? "light" : "dark";
}

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

/** Client-only cookie writer (1-year, lax). Server sets cookies via render-time props instead. */
export function writeCookie(name: string, value: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; samesite=lax`;
}
