"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

/**
 * The two panels: accessibility (opened from the site chrome — the header on desktop, the menu sheet on phones) and
 * the portfolio assistant (opened from its floating launcher, components/chat/ChatLauncher.tsx).
 *
 * Both panels are dynamic chunks, so a request made before a panel has mounted is recorded and honoured by its
 * initial state. The panels report their open state here so their triggers can expose it as aria-expanded.
 */
export type Overlay = "chat" | "a11y";

const pending: Record<Overlay, boolean> = { chat: false, a11y: false };
const open: Record<Overlay, boolean> = { chat: false, a11y: false };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

/** Open (or, if already open, close) a panel. */
export function toggleOverlay(name: Overlay) {
  if (open[name]) { window.dispatchEvent(new CustomEvent("overlay:close", { detail: name })); return; }
  // One panel at a time: opening one closes the other rather than stacking them (review-final #2).
  const other: Overlay = name === "chat" ? "a11y" : "chat";
  if (open[other]) window.dispatchEvent(new CustomEvent("overlay:close", { detail: other }));
  pending[name] = true;
  window.dispatchEvent(new CustomEvent("overlay:open", { detail: name }));
}

/** Whether an open was requested and not yet handled (a panel's initial state reads this). */
export function overlayRequested(name: Overlay): boolean { return pending[name]; }
function clearOverlayRequest(name: Overlay) { pending[name] = false; }

/** Panels report their state; chrome buttons read it. */
function setOverlayOpen(name: Overlay, v: boolean) { if (open[name] !== v) { open[name] = v; emit(); } }
export function useOverlayOpen(name: Overlay): boolean {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => open[name],
    () => false,
  );
}

/** A panel's open state: honours an early request, listens for chrome open/close requests, reports its state. */
export function useOverlayState(name: Overlay): [boolean, (v: boolean) => void] {
  const [isOpen, setIsOpen] = useState(() => overlayRequested(name));
  useEffect(() => {
    const onOpen = (e: Event) => { if ((e as CustomEvent).detail === name) { clearOverlayRequest(name); setIsOpen(true); } };
    const onClose = (e: Event) => { if ((e as CustomEvent).detail === name) setIsOpen(false); };
    window.addEventListener("overlay:open", onOpen); window.addEventListener("overlay:close", onClose);
    // A request made between render and this effect (the event fired with no listener) is honoured now.
    if (overlayRequested(name)) queueMicrotask(() => onOpen(new CustomEvent("overlay:open", { detail: name })));
    return () => { window.removeEventListener("overlay:open", onOpen); window.removeEventListener("overlay:close", onClose); };
  }, [name]);
  useEffect(() => { setOverlayOpen(name, isOpen); }, [name, isOpen]);
  return [isOpen, setIsOpen];
}
