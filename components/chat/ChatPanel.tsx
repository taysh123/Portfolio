"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconButton } from "@/components/ui/IconButton";
import { ChatIcon, SendIcon, XIcon } from "@/components/ui/icons";
import { DUR, easeOutExpo } from "@/lib/motion";
import { useFocusTrap, useScrollLock } from "@/lib/useFocusTrap";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { useOverlayState } from "@/lib/overlays";
import { useLocale } from "@/components/providers/LocaleProvider";
import { socials } from "@/data/socials";
import { fmt } from "@/lib/fmt";
import { cn } from "@/lib/cn";

type Message = { id: string; role: "user" | "assistant"; text: string };

let seq = 0;
const nextId = () => String(++seq);
/** A message's own language, from its script: the assistant may answer in English on the Hebrew page (and a visitor
 *  may type Hebrew on the English one), and a screen reader should read each in the right voice. */
const langOf = (text: string) => (/[\u0590-\u05ff]/.test(text) ? "he" : "en");

/**
 * The portfolio assistant — the original chat widget (components/ui/AIChatWidget.tsx as it shipped on main, removed in
 * M10 Stage B) restored, not rebuilt. Kept as it was: the same /api/chat backend and request (the last two turns, every
 * answer — or the fallback — added to the history), the greeting and the panel's words, the typewriter that writes
 * through a ref and commits once, the single polite announcement per settled answer, the transcript that scrolls on
 * its own.
 *
 * What changed, and only this: it opens from a floating launcher (ChatLauncher) instead of a header button, so it sits
 * above that launcher at the end corner on wide screens and rises as a sheet from the bottom on phones, where it is
 * modal (the page behind is locked and Tab stays inside); on wide screens it stays a non-modal dialog, as before. Every
 * string is in the page's language (English unchanged), the language travels with each question, and each message
 * carries its own language and direction. The field stays enabled while an answer is on its way, so focus never drops
 * to the page, and a repeated answer is announced again.
 */
export function ChatPanel() {
  const [open, setOpen] = useOverlayState("chat");
  const { t, locale } = useLocale();
  const [messages, setMessages] = useState<Message[]>(() => [{ id: nextId(), role: "assistant", text: t.chat.greeting }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const reduced = useReducedMotionPref();
  const sheet = useMediaQuery("(max-width: 639px)");
  const scrollRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<HTMLParagraphElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const history = useRef<{ role: "user" | "assistant"; content: string }[]>([]);

  const close = useCallback(() => setOpen(false), [setOpen]);
  useFocusTrap(panelRef, open, close, sheet);   // modal as a phone sheet; a non-modal popover on wide screens
  useScrollLock(open && sheet);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  const type = useCallback(
    (text: string) =>
      new Promise<void>((resolve) => {
        const node = streamRef.current;
        if (reduced || !node) {
          resolve();
          return;
        }
        let i = 0;
        const step = () => {
          i += 2;
          node.textContent = text.slice(0, i);
          const el = scrollRef.current;
          if (el) el.scrollTop = el.scrollHeight;
          if (i < text.length) {
            window.setTimeout(step, 16);
          } else {
            resolve();
          }
        };
        step();
      }),
    [reduced],
  );

  async function send() {
    const text = input.trim();
    if (!text || busy) return;

    setInput("");
    setBusy(true);
    setMessages((prev) => [...prev, { id: nextId(), role: "user", text }]);
    history.current = [...history.current, { role: "user", content: text }];

    let answer = fmt(t.chat.error, { email: socials.email });
    try {
      // The language rides in the URL too, so even a refusal written before the body is read is in the page's language.
      const res = await fetch(`/api/chat?locale=${locale}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.current.slice(-2), locale }),
      });
      const data = await res.json();
      if (data?.message) answer = data.message;
    } catch {
      // keep the fallback
    }

    history.current = [...history.current, { role: "assistant", content: answer }];
    await type(answer);
    if (streamRef.current) streamRef.current.textContent = "";
    setMessages((prev) => [...prev, { id: nextId(), role: "assistant", text: answer }]);
    // Cleared first, so the same words twice in a row (the offline message, say) are still announced the second time.
    setAnnouncement("");
    window.setTimeout(() => setAnnouncement(answer), 60);
    setBusy(false);
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {sheet && (
            <motion.div key="scrim" aria-hidden="true" onClick={close} className="chat-scrim"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: DUR.fast }} />
          )}
          <motion.div
            key="panel"
            ref={panelRef}
            role="dialog"
            aria-modal={sheet ? "true" : undefined}
            aria-labelledby="chat-title"
            aria-describedby="chat-subtitle"
            tabIndex={-1}
            data-chat-panel
            // In from the launcher (transform-origin in chat.css), out a little faster than in.
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: sheet ? 28 : 8, scale: sheet ? 1 : 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.24, ease: easeOutExpo } }}
            exit={reduced ? { opacity: 0, transition: { duration: DUR.fast } } : { opacity: 0, y: sheet ? 28 : 8, scale: sheet ? 1 : 0.96, transition: { duration: 0.16, ease: easeOutExpo } }}
            className="chat-panel"
          >
            {/* A <header> here would create a second `banner` landmark; a plain div and a heading instead. */}
            <div className="flex items-start justify-between gap-3 border-b border-line-subtle px-4 py-3.5">
              <div className="flex min-w-0 items-start gap-2.5">
                <span aria-hidden="true" className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-solid text-white">
                  <ChatIcon size={14} />
                </span>
                <div className="min-w-0">
                  <h2 id="chat-title" className="text-sm font-semibold text-fg">{t.chat.title}</h2>
                  <p id="chat-subtitle" className="text-xs leading-snug text-fg-muted">{t.chat.subtitle}</p>
                </div>
              </div>
              <IconButton label={t.chat.close} size="sm" onClick={close} data-autofocus>
                <XIcon size={15} />
              </IconButton>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4" data-chat-transcript>
              {messages.map((m) => (
                <Bubble key={m.id} role={m.role} lang={langOf(m.text)}>
                  {m.text}
                </Bubble>
              ))}
              {/* The Hebrew page says what the model can do in Hebrew before the first question (empty in English). */}
              {messages.length === 1 && t.chat.languageNote && <p className="px-1 text-xs leading-relaxed text-fg-subtle">{t.chat.languageNote}</p>}
              {busy && (
                <Bubble role="assistant">
                  <p ref={streamRef} className="min-h-[1.25rem]" />
                  {reduced && <span className="sr-only">{t.chat.thinking}</span>}
                </Bubble>
              )}
            </div>

            {/* Only the settled answer is announced — once. */}
            <p className="sr-only" role="status" aria-live="polite" lang={announcement ? langOf(announcement) : undefined}>{announcement}</p>

            <form className="border-t border-line-subtle p-3" onSubmit={(e) => { e.preventDefault(); void send(); }}>
              <div className="flex items-center gap-2 rounded-xl border border-line bg-surface-1 ps-3 pe-1.5 py-1.5 transition-colors focus-within:border-accent-line">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t.chat.placeholder}
                  aria-label={t.chat.input}
                  enterKeyHint="send"
                  autoComplete="off"
                  aria-busy={busy}
                  className="h-10 min-w-0 flex-1 bg-transparent text-[1rem] text-fg outline-none placeholder:text-fg-subtle sm:text-sm"
                />
                <IconButton type="submit" label={t.chat.send} tone="solid" disabled={!input.trim() || busy} className="h-10 w-10 disabled:opacity-40">
                  <SendIcon size={15} className="dir-icon" />
                </IconButton>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Bubble({ role, lang, children }: { role: "user" | "assistant"; lang?: string; children: React.ReactNode }) {
  return (
    <div className={cn("flex", role === "user" ? "justify-end" : "justify-start")}>
      <div
        dir="auto"
        lang={lang}
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
          role === "user"
            ? "border border-accent-line bg-accent-soft text-fg"
            : "border border-line-subtle bg-surface-2 text-fg-muted",
        )}
      >
        {children}
      </div>
    </div>
  );
}
