"use client";

import { useEffect, useRef } from "react";
import { ChatIcon, XIcon } from "@/components/ui/icons";
import { toggleOverlay, useOverlayOpen } from "@/lib/overlays";
import { clientDict as t } from "@/lib/dict-client";
import "./chat.css";

/**
 * The assistant's floating launcher: a speech-bubble pill at the bottom-right corner, clear of the safe area, with a
 * round chat icon and a label that says what it is — a chat with the assistant, never a person. Phones show the
 * short label; the accessible name is always the full one.
 *
 * It is the only part of the chat in the first load (a few hundred bytes and one stylesheet): the panel and the
 * animation library come on first use (Providers.tsx), warmed when a pointer or focus reaches this button. One
 * entrance on arrival (chat.css), no pulsing, none with reduced motion. It sits under every modal overlay, and the
 * footer keeps a strip clear for it so the end of the page is never covered.
 *
 * While the reader scrolls down through the page it tucks in to its round icon (data-compact), so it covers as little
 * of what they are reading as it can; scrolling up, reaching the top or the end, hovering, focusing or opening it
 * brings the label back. The accessible name never changes.
 */
export function ChatLauncher() {
  const open = useOverlayOpen("chat");
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    let last = window.scrollY, raf = 0;
    const read = () => {
      raf = 0;
      const y = window.scrollY, end = document.documentElement.scrollHeight - innerHeight - y < 24;
      let compact = el.dataset.compact !== undefined;
      if (y < innerHeight * 0.5 || end) compact = false;          // the first screen and the end of the page: full label
      else if (y - last > 24) compact = true;                     // reading on, down the page
      else if (last - y > 24) compact = false;                    // heading back up
      else return;                                                // too small a move to change anything
      last = y;
      if (compact !== (el.dataset.compact !== undefined)) { if (compact) el.dataset.compact = ""; else delete el.dataset.compact; }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(read); };
    // Nothing to read until the page moves (it starts with the full label): no layout read during hydration.
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);
  useEffect(() => {
    // #21 (F1): Firefox's own focus scroll skips the page's bottom scroll padding (#16, chat.css) for a control that is
    // already on screen, so a Tab could leave one partly under this launcher. Once the browser's own scroll for a Tab
    // has settled, a control still under the launcher is moved up to the padding's edge, where Chromium and Safari put
    // it themselves (for them this finds nothing to do). Only a Tab press counts: a pointer, a touch or a script giving
    // focus back never moves the page. Never inside an overlay, nor while a modal is open: its focus trap owns focus.
    const el = ref.current; if (!el) return;
    let tab = false, raf = 0;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || e.ctrlKey || e.metaKey) return;
      tab = true; setTimeout(() => { tab = false; });   // the focus move happens within this same key press
    };
    const onFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (!tab || el.contains(target) || target.closest('[role="dialog"]') || document.querySelector('[aria-modal="true"]')) return;
      cancelAnimationFrame(raf);
      let y = scrollY, still = 0, frames = 0;
      const check = () => {
        // Wait out the browser's own scroll (smooth unless motion is reduced): three frames without a move.
        if (scrollY !== y) { y = scrollY; still = 0; } else still++;
        if (still < 3 && ++frames < 90) { raf = requestAnimationFrame(check); return; }
        if (document.activeElement !== target) return;
        const r = target.getBoundingClientRect(), c = el.getBoundingClientRect();
        if (r.right <= c.left + 1 || r.left >= c.right - 1 || r.bottom <= c.top + 1 || r.top >= c.bottom - 1) return;
        const pad = getComputedStyle(document.documentElement);
        // Just far enough for its foot to meet the padding's edge, and never so far that its head goes under the header.
        const by = Math.min(r.bottom - (innerHeight - (parseFloat(pad.scrollPaddingBottom) || 0)), r.top - (parseFloat(pad.scrollPaddingTop) || 0));
        if (by > 0) scrollBy({ top: by });   // the page's own scroll: smooth, or instant when motion is reduced
      };
      raf = requestAnimationFrame(check);
    };
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("focusin", onFocus);
    return () => {
      document.removeEventListener("keydown", onKey, true); document.removeEventListener("focusin", onFocus);
      cancelAnimationFrame(raf);
    };
  }, []);
  useEffect(() => {
    const w = window as Window & { __chatReady?: boolean; __chatEarly?: number };
    w.__chatReady = true;
    if (w.__chatEarly) { w.__chatEarly = 0; toggleOverlay("chat"); }
  }, []);
  return (
    <>
      {/* A press before hydration is remembered by lib/earlyChat.ts (inline in the layout) and replayed above. */}
      <button ref={ref} type="button" className="chat-launcher" data-chat-launcher data-overlay-trigger="chat"
        aria-label={t.chat.launcher} aria-haspopup="dialog" aria-expanded={open} onClick={() => toggleOverlay("chat")}>
        <span className="chat-launcher__icon" aria-hidden="true">{open ? <XIcon size={18} /> : <ChatIcon size={18} />}</span>
        <span className="chat-launcher__label" aria-hidden="true"><span>
          <span className="chat-launcher__full">{t.chat.launcher}</span>
          <span className="chat-launcher__short">{t.chat.launcherShort}</span>
        </span></span>
      </button>
    </>
  );
}
