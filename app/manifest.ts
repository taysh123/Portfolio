import type { MetadataRoute } from "next";
import { siteMeta } from "@/data/socials";
import { brand } from "@/lib/tokens";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteMeta.name} — ${siteMeta.role}`,
    short_name: siteMeta.name,
    description: siteMeta.tagline,
    start_url: "/",
    display: "standalone",
    background_color: brand.bg,
    theme_color: brand.bg,
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
