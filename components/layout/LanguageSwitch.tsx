"use client";

import { cn } from "@/lib/cn";
import { useLocale } from "@/components/providers/LocaleProvider";
import { LOCALES, LOCALE_COOKIE, homeOf, type Locale } from "@/lib/i18n";

/** The sections a reader can be "in", top to bottom: switching language keeps the reader where they were. */
const SECTIONS = ["hero", "work-poker", "work-aegis", "work-developeros", "work-gravity-flow", "more-work", "about", "skills", "approach", "contact"];

/** The section whose top last crossed 40% of the viewport (the header's own rule for "current"). */
function currentSection(): string {
  const line = window.innerHeight * 0.4;
  let id = "";
  for (const s of SECTIONS) {
    const el = document.getElementById(s);
    if (el && el.getBoundingClientRect().top <= line) id = s;
  }
  return id && id !== "hero" ? `#${id}` : "";
}

/** Remember the choice (LOCALE_COOKIE): it only decides the language of pages that have none in their address. */
function remember(l: Locale) {
  try { document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`; } catch { /* storage blocked: the URL still decides */ }
}

/**
 * EN / עב: two real links to the two language URLs (they work without JavaScript and can be opened in a new tab). In the
 * header each shows its short code, and its name begins with that code and goes on to the language's full name ("EN
 * English") — so a voice-control user can say what they see (WCAG 2.5.3, Label in Name).
 * With JavaScript, a press also carries the current section across and remembers the choice (LOCALE_COOKIE) — which
 * only decides the language of pages that have none in their address; it never redirects (lib/i18n.ts).
 */
export function LanguageSwitch({ variant = "compact", className }: { variant?: "compact" | "full"; className?: string }) {
  const { locale, t } = useLocale();
  const go = (e: React.MouseEvent<HTMLAnchorElement>, l: Locale) => {
    if (l === locale) { e.preventDefault(); return; }
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;   // a new tab gets the plain URL
    remember(l);
    e.currentTarget.href = homeOf(l) + currentSection();
  };
  return (
    <div role="group" aria-label={t.lang.label} data-lang-switch={variant}
      className={cn(variant === "compact" ? "lang-switch" : "lang-switch lang-switch--full", className)}>
      {LOCALES.map((l) => (
        <a key={l} href={homeOf(l)} hrefLang={l} lang={l} aria-current={l === locale ? "true" : undefined}
          onClick={(e) => go(e, l)} className="lang-switch__opt">
          {variant === "compact" ? <>{t.lang[`${l}Short`]}<span className="sr-only"> {t.lang[l]}</span></> : t.lang[l]}
        </a>
      ))}
    </div>
  );
}
