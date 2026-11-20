import type { MetadataRoute } from "next";
import { siteMeta } from "@/data/socials";
import { cine } from "@/lib/tokens";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteMeta.name} — ${siteMeta.role}`,
    short_name: siteMeta.name,
    description: siteMeta.tagline,
    start_url: "/",
    display: "standalone",
    // Dark only (R3): the field's colour, as the page's browser chrome (app/layout.tsx).
    background_color: cine.abyss,
    theme_color: cine.abyss,
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
