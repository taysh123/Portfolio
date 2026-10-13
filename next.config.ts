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
     * Off since M10. The docs recommend inlining for small atomic CSS, but this
     * page now carries ~64 KiB of hand-written CSS, and inlining put it in the
     * HTML twice over (the <style> tags, and again in the React Server
     * Components payload): 317 KB of HTML instead of 148 KB. Measured with
     * Lighthouse mobile, 5 interleaved runs each, an external stylesheet won on
     * every metric: performance 95 vs 92, LCP 2.9 s vs 3.3 s, TBT 48 vs 96 ms.
     */
    inlineCss: false,
  },
};

export default nextConfig;
