"use client";

import dynamic from "next/dynamic";
import { ThemeProvider } from "./ThemeProvider";
import { AccessibilityProvider } from "./AccessibilityProvider";
import { SmoothScroll } from "./SmoothScroll";
import type { Theme, A11yPrefs } from "@/lib/theme";

/**
 * Three overlays that are invisible until the visitor asks for them, so none
 * of them belong in the first load. Together they were ~750 lines shipped
 * eagerly for UI most visitors never open — there was no `next/dynamic`
 * anywhere in the codebase.
 *
 * `ssr: false` is correct here: all three are portal/floating UI with no
 * server-rendered content worth streaming.
 */
const CommandPalette = dynamic(
  () => import("@/components/ui/CommandPalette").then((m) => m.CommandPalette),
  { ssr: false },
);
const AIChatWidget = dynamic(
  () => import("@/components/ui/AIChatWidget").then((m) => m.AIChatWidget),
  { ssr: false },
);
const AccessibilityPanel = dynamic(
  () => import("@/components/ui/AccessibilityPanel").then((m) => m.AccessibilityPanel),
  { ssr: false },
);

export function Providers({
  children,
  initialTheme,
  initialA11y,
}: {
  children: React.ReactNode;
  initialTheme: Theme;
  initialA11y: A11yPrefs;
}) {
  return (
    <ThemeProvider initialTheme={initialTheme}>
      <AccessibilityProvider initialPrefs={initialA11y}>
        <SmoothScroll />
        {children}
        <CommandPalette />
        <AIChatWidget />
        <AccessibilityPanel />
      </AccessibilityProvider>
    </ThemeProvider>
  );
}
