import type { Metadata } from "next";
import { siteMeta } from "@/data/socials";
import { siteMetaHe } from "@/data/he/site";
import { homeOf, ogLocale, type Locale } from "@/lib/i18n";

/**
 * Each language's own title, description, social card and alternates. Both pages name each other (hreflang) and
 * themselves as canonical; English is the x-default. The English social card is app/opengraph-image.tsx; the Hebrew
 * one is a static image (app/he/opengraph-image.png), because the card renderer cannot lay out right-to-left text.
 */
export function pageMetadata(locale: Locale): Metadata {
  const m = locale === "he" ? { ...siteMeta, ...siteMetaHe } : siteMeta;
  const title = `${siteMeta.name} — ${m.role}`;
  const url = new URL(homeOf(locale), siteMeta.url).toString();
  return {
    title: { absolute: title },
    description: m.tagline,
    alternates: {
      canonical: homeOf(locale),
      languages: { en: "/", he: "/he", "x-default": "/" },
    },
    openGraph: {
      type: "profile",
      url,
      siteName: `${siteMeta.name} — Portfolio`,
      title,
      description: m.tagline,
      locale: ogLocale(locale),
      alternateLocale: ogLocale(locale === "he" ? "en" : "he"),
    },
    twitter: { card: "summary_large_image", title, description: m.tagline },
  };
}
