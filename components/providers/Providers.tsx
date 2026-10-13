"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { overlayRequested, type Overlay } from "@/lib/overlays";
import { ChatLauncher } from "@/components/chat/ChatLauncher";
import { ThemeProvider } from "./ThemeProvider";
import { AccessibilityProvider } from "./AccessibilityProvider";
import type { Theme, A11yPrefs } from "@/lib/theme";

/**
 * The accessibility panel and the assistant's panel are invisible until the visitor asks for them, so neither is in
 * the first load nor MOUNTED until asked for (a dynamic component that renders on load still fetches its chunk right
 * after hydration). lib/overlays.ts records a request made before a chunk arrives; each chunk is warmed on intent —
 * pointer or focus reaching its trigger — so the first open rarely waits on the network. The assistant's launcher is
 * the one piece always present (components/chat/ChatLauncher.tsx).
 *
 * M10 removed the command palette for good; the chat came back on 2026-10-13 behind its own launcher.
 */
const loadA11y = () => import("@/components/ui/AccessibilityPanel").then((m) => m.AccessibilityPanel);
const AccessibilityPanel = dynamic(loadA11y, { ssr: false });
const loadChat = () => import("@/components/chat/ChatPanel").then((m) => m.ChatPanel);
const ChatPanel = dynamic(loadChat, { ssr: false });
const PRELOAD: Record<Overlay, () => Promise<unknown>> = { a11y: loadA11y, chat: loadChat };

function useRequested(name: Overlay): boolean {
  const [on, setOn] = useState(() => overlayRequested(name));
  useEffect(() => {
    if (on) return;
    const onOverlay = (e: Event) => { if ((e as CustomEvent).detail === name) setOn(true); };
    const onIntent = (e: Event) => {
      if ((e.target as Element | null)?.closest?.(`[data-overlay-trigger="${name}"]`)) void PRELOAD[name]();
    };
    window.addEventListener("overlay:open", onOverlay);
    document.addEventListener("pointerover", onIntent, { passive: true });
    document.addEventListener("focusin", onIntent);
    return () => {
      window.removeEventListener("overlay:open", onOverlay);
      document.removeEventListener("pointerover", onIntent);
      document.removeEventListener("focusin", onIntent);
    };
  }, [on, name]);
  return on;
}

export function Providers({ children, initialTheme, initialA11y }: { children: React.ReactNode; initialTheme: Theme; initialA11y: A11yPrefs }) {
  const a11y = useRequested("a11y");
  const chat = useRequested("chat");
  return (
    <ThemeProvider initialTheme={initialTheme}>
      <AccessibilityProvider initialPrefs={initialA11y}>
        {children}
        {a11y && <AccessibilityPanel />}
        <ChatLauncher />
        {chat && <ChatPanel />}
      </AccessibilityProvider>
    </ThemeProvider>
  );
}
