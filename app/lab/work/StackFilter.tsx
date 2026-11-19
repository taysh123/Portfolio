"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";

const noop = () => () => {};

type Option = { id: string; name: string; status: string };

/**
 * Stack's "Filter by project" (PROTOTYPE, the lab's Work slice): All and the four flagships, as toggle buttons
 * (aria-pressed), one pressed at a time. Pressing a project sets `data-lens` on the groups (`children`, rendered on the
 * server); the highlight itself is CSS written from the same options (stack.ts), the way the live Stack filters, and a
 * polite line says what changed, in the live Stack's words.
 *
 * - Without JavaScript, and until hydration: the full list (All), and the buttons are not shown (they would do nothing).
 *   Their space is kept, so nothing shifts when they appear.
 * - It imports no data: the server hands in the options, their status lines and the groups.
 */
export function StackFilter({ label, all, options, children }: { label: string; all: string; options: Option[]; children: ReactNode }) {
  const [lens, setLens] = useState("");
  // false on the server and in the hydration pass, true after: the same markup on both sides, then the enhancement.
  const ready = useSyncExternalStore(noop, () => true, () => false);
  const current = options.find((o) => o.id === lens);
  return (
    <>
      <div className="wk__lens" data-ready={ready ? "" : undefined}>
        <p id="wk-lens-label" className="wk__lens-label">{label}</p>
        <div role="group" aria-labelledby="wk-lens-label" className="wk__lens-chips">
          {[{ id: "", name: all }, ...options].map((o) => (
            <button key={o.id || "all"} type="button" className="wk__lens-chip" aria-pressed={lens === o.id} onClick={() => setLens(o.id)}>
              {o.name}
            </button>
          ))}
        </div>
        <p className="wk__lens-status" aria-live="polite">{current?.status ?? ""}</p>
      </div>
      <div className="wk__stack-groups" data-lens={lens || undefined}>{children}</div>
    </>
  );
}
