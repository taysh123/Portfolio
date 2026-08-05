"use client";

import dynamic from "next/dynamic";

/**
 * The render studio.
 *
 * A build-time tool, not a page. `design/render/capture.mjs` drives this in a
 * headless browser, waits for `data-render-ready`, screenshots the canvas at
 * 3840x2400, and reads the projected screen-quad corners out of the DOM.
 *
 * It lives under `app/` because that is the only way to get the project's own
 * three.js and module resolution without standing up a second build. It is
 * noindexed, unlinked, and carries no site chrome.
 */

const Studio = dynamic(() => import("./Studio").then((m) => m.Studio), {
  ssr: false,
});

export default function RenderStudio() {
  return (
    <main style={{ margin: 0, background: "#05060a" }}>
      <meta name="robots" content="noindex, nofollow" />
      <Studio />
    </main>
  );
}
