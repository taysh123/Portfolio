"use client";

import { useRef, useState, useSyncExternalStore, type ReactNode } from "react";

const noop = () => () => {};

type Option = { id: string; name: string; status: string };

/**
 * Stack's "Filter by project" (Concept A): All and the four flagships, as toggle buttons
 * (aria-pressed), one pressed at a time. Pressing a project sets `data-lens` on the groups (`children`, rendered on the
 * server); the filtering itself is CSS written from the same options (stackBlock.ts), the way the live Stack filters: only
 * that project's tools remain, and a polite line says so, in the live Stack's words.
 *
 * - The buttons stay mounted, so focus stays on the one pressed.
 * - No scroll jump: a shorter list would pull the page up under the reader whenever what follows Stack (Think · Build ·
 *   Ship and Contact since sessions 14 and 15, then the page's bottom padding) can't fill the rest of the view. On each
 *   press the results (the status line and the groups) hold just enough height that the page still reaches the bottom
 *   of the view, and no more: the hold is 0 whenever that is already so (docs/ROADMAP.md #14). All lets go (it is the
 *   tallest).
 * - Without JavaScript, and until hydration: the full list (All), and the buttons are not shown (they would do nothing).
 *   Their space is kept, so nothing shifts when they appear.
 * - It imports no data: the server hands in the options, their status lines and the groups.
 */
export function StackFilter({ label, all, options, children }: { label: string; all: string; options: Option[]; children: ReactNode }) {
  const [lens, setLens] = useState("");
  const [hold, setHold] = useState(0);
  const results = useRef<HTMLDivElement>(null);
  // false on the server and in the hydration pass, true after: the same markup on both sides, then the enhancement.
  const ready = useSyncExternalStore(noop, () => true, () => false);
  const current = options.find((o) => o.id === lens);
  const press = (id: string) => {
    const g = results.current;
    if (id && g) {
      // What follows the results (the rest of Stack, the sections below it, the page's bottom padding) stays; the
      // results (the status line and the groups: the line's height changes with the name, so it is held too) must reach
      // far enough that the page still ends at or below the view's bottom edge.
      const r = g.getBoundingClientRect();
      const after = document.documentElement.scrollHeight - (scrollY + r.bottom);
      setHold(Math.max(0, Math.ceil(innerHeight - r.top - after)));
    } else setHold(0);
    setLens(id);
  };
  return (
    <>
      <div className="wk__lens" data-ready={ready ? "" : undefined}>
        <p id="wk-lens-label" className="wk__lens-label">{label}</p>
        <div role="group" aria-labelledby="wk-lens-label" className="wk__lens-chips">
          {[{ id: "", name: all }, ...options].map((o) => (
            <button key={o.id || "all"} type="button" className="wk__lens-chip" aria-pressed={lens === o.id} onClick={() => press(o.id)}>
              {o.name}
            </button>
          ))}
        </div>
      </div>
      <div ref={results} style={hold ? { minHeight: hold } : undefined}>
        <p className="wk__lens-status" aria-live="polite">{current?.status ?? ""}</p>
        <div className="wk__stack-groups" data-lens={lens || undefined}>{children}</div>
      </div>
    </>
  );
}
