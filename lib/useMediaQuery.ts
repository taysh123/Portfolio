"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Matches a media query, `false` on the server.
 *
 * `useSyncExternalStore` rather than `useState` + `useEffect`: a media query
 * IS an external store, and subscribing to one properly avoids the cascading
 * render that setting state inside an effect causes.
 *
 * The `false`-on-server behaviour is deliberate and load-bearing where this is
 * used. The server renders the simpler layout, so that layout is what lands in
 * the HTML for crawlers and for anyone without JavaScript; the richer variant
 * is a progressive enhancement rather than the only way to read the content.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
