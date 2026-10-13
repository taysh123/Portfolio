"use client";

import { createContext, useContext } from "react";
import type { Locale } from "@/lib/i18n";
import { CLIENT_DICT, type ClientDict } from "@/lib/dict-client";

/**
 * The page's language and its interface strings, for client components (server components read lib/dict.ts and the
 * locale prop directly). Only the language crosses from the server; the strings come from lib/dict-client.ts.
 */
const Ctx = createContext<{ locale: Locale; t: ClientDict } | null>(null);

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <Ctx.Provider value={{ locale, t: CLIENT_DICT[locale] }}>{children}</Ctx.Provider>;
}

export function useLocale(): { locale: Locale; t: ClientDict } {
  const v = useContext(Ctx);
  if (!v) throw new Error("useLocale outside LocaleProvider");
  return v;
}
