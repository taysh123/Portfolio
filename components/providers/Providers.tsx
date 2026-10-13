"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { overlayRequested } from "@/lib/overlays";
import { ThemeProvider } from "./ThemeProvider";
import { AccessibilityProvider } from "./AccessibilityProvider";
import type { Theme, A11yPrefs } from "@/lib/theme";

/**
 * The accessibility panel is invisible until the visitor asks for it, so it is not in the first load and is not
 * MOUNTED until asked for either (a dynamic component that renders on load still fetches its chunk right after
 * hydration). lib/overlays.ts records a request made before the chunk arrives; the chunk is warmed on intent —
 * pointer or focus reaching a trigger — so the first open rarely waits on the network.
 *
 * M10 removed the command palette and the AI chat, the other two overlays that used to live here.
 */
const loadA11y = () => import("@/components/ui/AccessibilityPanel").then((m) => m.AccessibilityPanel);
const AccessibilityPanel = dynamic(loadA11y, { ssr: false });

function useA11yRequested(): boolean {
  const [on, setOn] = useState(() => overlayRequested("a11y"));
  useEffect(() => {
    if (on) return;
    const onOverlay = (e: Event) => { if ((e as CustomEvent).detail === "a11y") setOn(true); };
    const onIntent = (e: Event) => {
      if ((e.target as Element | null)?.closest?.('[data-overlay-trigger="a11y"]')) void loadA11y();
    };
    window.addEventListener("overlay:open", onOverlay);
    document.addEventListener("pointerover", onIntent, { passive: true });
    document.addEventListener("focusin", onIntent);
    return () => {
      window.removeEventListener("overlay:open", onOverlay);
      document.removeEventListener("pointerover", onIntent);
      document.removeEventListener("focusin", onIntent);
    };
  }, [on]);
  return on;
}

export function Providers({ children, initialTheme, initialA11y }: { children: React.ReactNode; initialTheme: Theme; initialA11y: A11yPrefs }) {
  const a11y = useA11yRequested();
  return (
    <ThemeProvider initialTheme={initialTheme}>
      <AccessibilityProvider initialPrefs={initialA11y}>
        {children}
        {a11y && <AccessibilityPanel />}
      </AccessibilityProvider>
    </ThemeProvider>
  );
}
