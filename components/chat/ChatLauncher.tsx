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
