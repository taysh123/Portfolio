/**
 * The site's two languages. English lives at the root URL and Hebrew at /he — two stable, shareable addresses for the
 * same page. The URL alone decides the language: a remembered preference (LOCALE_COOKIE) never redirects a visitor
 * away from a language URL they opened, it only chooses the language of pages that have no language in their address
 * (a mistyped address, which renders the 404 — proxy.ts).
 *
 * proxy.ts reads the path and passes the language to the root layout in LOCALE_HEADER, so <html lang dir> is right in
 * the first byte; each page also knows its own language and passes it down explicitly.
 */
export const LOCALES = ["en", "he"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_HEADER = "x-site-locale";
export const LOCALE_COOKIE = "lang";

export const isLocale = (v: unknown): v is Locale => v === "en" || v === "he";
export const dirOf = (l: Locale): "ltr" | "rtl" => (l === "he" ? "rtl" : "ltr");
/** The page's address in a language: "/" or "/he". */
export const homeOf = (l: Locale) => (l === "he" ? "/he" : "/");
/** The language a path is in: /he and everything under it is Hebrew; every other path is English. */
export const localeOfPath = (path: string): Locale => (path === "/he" || path.startsWith("/he/") ? "he" : "en");
/** Open Graph's locale tags. */
export const ogLocale = (l: Locale) => (l === "he" ? "he_IL" : "en_US");
export const otherLocale = (l: Locale): Locale => (l === "he" ? "en" : "he");
