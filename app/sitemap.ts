import type { MetadataRoute } from "next";
import { siteMeta } from "@/data/socials";

/**
 * `lastModified: new Date()` reported "today" on every deploy regardless of
 * whether anything changed, which search engines learn to discount. This is a
 * real content date — bump it when the page content actually changes.
 */
const CONTENT_LAST_MODIFIED = "2026-10-13";   // English and Hebrew, the restored assistant, the new About

/** Both languages, each naming the other (the same alternates as the pages' own <link rel="alternate">). */
export default function sitemap(): MetadataRoute.Sitemap {
  const languages = { en: siteMeta.url, he: `${siteMeta.url}/he` };
  return [
    { url: siteMeta.url, lastModified: new Date(CONTENT_LAST_MODIFIED), changeFrequency: "monthly", priority: 1, alternates: { languages } },
    { url: `${siteMeta.url}/he`, lastModified: new Date(CONTENT_LAST_MODIFIED), changeFrequency: "monthly", priority: 0.9, alternates: { languages } },
  ];
}
