"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconButton } from "@/components/ui/IconButton";
import { ChatIcon, SendIcon, XIcon } from "@/components/ui/icons";
import { DUR, easeOutExpo } from "@/lib/motion";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";
import { cn } from "@/lib/cn";

type Message = { id: string; role: "user" | "assistant"; text: string };

let seq = 0;
const nextId = () => String(++seq);

const GREETING =
  "Ask me anything about Tay's projects, stack, or how he works. I'll point you at the repo if I don't know.";

/**
 * Portfolio assistant.
 *
 * Two things were rebuilt here beyond tokens:
 *
 * 1. The typewriter used a 14ms setInterval calling setMessages, re-rendering
 *    the whole list ~70×/second, each render followed by a synchronous
 *    `scrollTop = scrollHeight` write — a forced layout per character. It now
 *    writes text through a ref straight into the DOM node and only commits to
 *    React state once, at the end.
 * 2. The entire scroll container was `aria-live="polite"`, so a 200-character
 *    reply produced 200 live-region mutations. Only the settled message is
 *    announced, once.
 */
export function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: nextId(), role: "assistant", text: GREETING },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const reduced = useReducedMotionPref();
  const scrollRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<HTMLParagraphElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const history = useRef<{ role: "user" | "assistant"; content: string }[]>([]);

  const close = useCallback(() => setOpen(false), []);
  useFocusTrap(panelRef, open, close);

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

    let answer =
      "Something went wrong on my end. Try again, or email Tay at tayshofer05@gmail.com.";
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.current.slice(-2) }),
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
    setAnnouncement(answer);
    setBusy(false);
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Ask Tay AI"
            tabIndex={-1}
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: DUR.mid, ease: easeOutExpo }}
            className="glass edge-lit flex w-[min(23rem,calc(100vw-3rem))] flex-col overflow-hidden rounded-2xl border border-line shadow-float"
            style={{ height: "min(30rem, calc(100dvh - 8rem))" }}
          >
            {/*
              A <header> here would create a second `banner` landmark, since
              its nearest sectioning ancestor is a plain div. Plain div + a
              heading instead.
            */}
            <div className="flex items-center justify-between gap-3 border-b border-line-subtle px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="relative flex h-8 w-8 items-center justify-center rounded-full border border-accent-line bg-accent-soft text-accent"
                >
                  <ChatIcon size={14} />
                </span>
                <div>
                  <h2 className="text-sm font-medium text-fg">Ask Tay AI</h2>
                  <p className="text-[0.7rem] text-fg-subtle">
                    Answers from this portfolio only
                  </p>
                </div>
              </div>
              <IconButton label="Close chat" size="sm" onClick={close} data-autofocus>
                <XIcon size={15} />
              </IconButton>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((m) => (
                <Bubble key={m.id} role={m.role}>
                  {m.text}
                </Bubble>
              ))}

              {busy && (
                <Bubble role="assistant">
                  <p ref={streamRef} className="min-h-[1.25rem]" />
                  {reduced && <span className="sr-only">Thinking…</span>}
                </Bubble>
              )}
            </div>

            {/* Only the settled answer is announced — once. */}
            <p className="sr-only" role="status" aria-live="polite">
              {announcement}
            </p>

            <div className="border-t border-line-subtle p-3">
              <div className="flex items-center gap-2 rounded-xl border border-line bg-surface-1 px-3 py-1.5 transition-colors focus-within:border-accent-line">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="What's SentinelAI?"
                  aria-label="Ask a question"
                  disabled={busy}
                  className="h-9 flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-fg-subtle disabled:opacity-50"
                />
                <IconButton
                  label="Send message"
                  size="sm"
                  tone="solid"
                  onClick={send}
                  disabled={!input.trim() || busy}
                  className="h-8 w-8 disabled:opacity-40"
                >
                  <SendIcon size={14} />
                </IconButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <IconButton
        label={open ? "Close chat" : "Open Ask Tay AI"}
        aria-expanded={open}
        tone="solid"
        onClick={() => setOpen((v) => !v)}
        className="h-13 w-13 shadow-float"
      >
        {open ? <XIcon size={19} /> : <ChatIcon size={19} />}
      </IconButton>
    </div>
  );
}

function Bubble({
  role,
  children,
}: {
  role: "user" | "assistant";
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex", role === "user" ? "justify-end" : "justify-start")}>
      <div
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
