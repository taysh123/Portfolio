import type { MetadataRoute } from "next";
import { siteMeta } from "@/data/socials";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // POST-only, so a crawl gets a 405 anyway — but saying so is free and
        // keeps the endpoint out of crawl budget.
        disallow: "/api/",
      },
    ],
    sitemap: `${siteMeta.url}/sitemap.xml`,
    // `host` was here previously: it is a Yandex-only directive that Google
    // ignores and some validators warn about. Dropped.
  };
}
