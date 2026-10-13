import type { MetadataRoute } from "next";
import { siteMeta } from "@/data/socials";

/**
 * `lastModified: new Date()` reported "today" on every deploy regardless of
 * whether anything changed, which search engines learn to discount. This is a
 * real content date — bump it when the page content actually changes.
 */
const CONTENT_LAST_MODIFIED = "2026-10-13";   // M10: the owner's About and Contact copy, the restored assistant, the new About

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteMeta.url,
      lastModified: new Date(CONTENT_LAST_MODIFIED),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
