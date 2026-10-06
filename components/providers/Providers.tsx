"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { paletteOpenRequested, requestPaletteOpen } from "@/lib/palette";
import { overlayRequested } from "@/lib/overlays";
import { ThemeProvider } from "./ThemeProvider";
import { AccessibilityProvider } from "./AccessibilityProvider";
import { SmoothScroll } from "./SmoothScroll";
import type { Theme, A11yPrefs } from "@/lib/theme";

/**
 * Three overlays that are invisible until the visitor asks for them, so none of them belong in the first
 * load — and none of them are MOUNTED until asked for either: a dynamic component that renders on load
 * still fetches its chunk right after hydration, on every visit, competing with the entrance frames (the
 * palette's chunk carries the full project data; each also carries its own copy of framer-motion's
 * shared modules). The review measured ~450 KB of idle fetches (review #5).
 *
 * So each overlay mounts on its first request. The request modules (lib/palette.ts, lib/overlays.ts) record
 * a request made before the chunk arrives, and each overlay's initial state honours it. The chunk is
 * warmed on intent — pointer or focus reaching a trigger — so the first open rarely waits on the network.
 *
 * `ssr: false` is correct here: all three are portal UI with no server-rendered content worth streaming.
 */
const loadPalette = () => import("@/components/ui/CommandPalette").then((m) => m.CommandPalette);
const loadChat = () => import("@/components/ui/AIChatWidget").then((m) => m.AIChatWidget);
const loadA11y = () => import("@/components/ui/AccessibilityPanel").then((m) => m.AccessibilityPanel);
const CommandPalette = dynamic(loadPalette, { ssr: false });
const AIChatWidget = dynamic(loadChat, { ssr: false });
const AccessibilityPanel = dynamic(loadA11y, { ssr: false });
const PREFETCH = { palette: loadPalette, chat: loadChat, a11y: loadA11y } as const;
type Kind = keyof typeof PREFETCH;

/** Which overlays have been asked for (and so are mounted). Ctrl/⌘+K is heard here until the palette
 *  mounts and takes the shortcut over. */
function useRequestedOverlays(): Record<Kind, boolean> {
  const [on, setOn] = useState<Record<Kind, boolean>>(() => ({
    palette: paletteOpenRequested(), chat: overlayRequested("chat"), a11y: overlayRequested("a11y"),
  }));
  useEffect(() => {
    const mount = (k: Kind) => setOn((v) => (v[k] ? v : { ...v, [k]: true }));
    const onPalette = () => mount("palette");
    const onOverlay = (e: Event) => { const d = (e as CustomEvent).detail; if (d === "chat" || d === "a11y") mount(d); };
    const onKey = (e: KeyboardEvent) => {
      if (on.palette || !(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== "k") return;
      e.preventDefault();
      requestPaletteOpen();
    };
    const onIntent = (e: Event) => {
      const k = (e.target as Element | null)?.closest?.("[data-overlay-trigger]")?.getAttribute("data-overlay-trigger");
      if (k && k in PREFETCH) void PREFETCH[k as Kind]();
    };
    window.addEventListener("palette:open", onPalette);
    window.addEventListener("overlay:open", onOverlay);
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerover", onIntent, { passive: true });
    document.addEventListener("focusin", onIntent);
    return () => {
      window.removeEventListener("palette:open", onPalette);
      window.removeEventListener("overlay:open", onOverlay);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerover", onIntent);
      document.removeEventListener("focusin", onIntent);
    };
  }, [on.palette]);
  return on;
}

export function Providers({
  children,
  initialTheme,
  initialA11y,
}: {
  children: React.ReactNode;
  initialTheme: Theme;
  initialA11y: A11yPrefs;
}) {
  const mounted = useRequestedOverlays();
  return (
    <ThemeProvider initialTheme={initialTheme}>
      <AccessibilityProvider initialPrefs={initialA11y}>
        <SmoothScroll />
        {children}
        {mounted.palette && <CommandPalette />}
        {mounted.chat && <AIChatWidget />}
        {mounted.a11y && <AccessibilityPanel />}
      </AccessibilityProvider>
    </ThemeProvider>
  );
}
