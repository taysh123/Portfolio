import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every response was leaking `X-Powered-By: Next.js`.
  poweredByHeader: false,

  images: {
    // AVIF first, WebP fallback. The project screenshots are large PNGs, so
    // this is the single biggest transfer win available.
    formats: ["image/avif", "image/webp"],

    /**
     * Next 16 defaults `qualities` to `[75]` and SILENTLY coerces any other
     * value to the nearest allowed one. Screenshots of dense UI (alert tables,
     * code panels) visibly mush at 75, so 90 is allowlisted for those.
     */
    qualities: [75, 90],

    minimumCacheTTL: 31_536_000,
  },

  experimental: {
    /**
     * Inlines CSS as a <style> tag instead of a <link>. The Next docs
     * recommend this specifically for atomic CSS like Tailwind — it removes a
     * render-blocking round trip, which matters most for the hero's LCP.
     */
    inlineCss: true,
  },
};

export default nextConfig;
