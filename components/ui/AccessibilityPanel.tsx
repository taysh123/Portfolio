"use client";

import { useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAccessibility } from "@/components/providers/AccessibilityProvider";
import { IconButton } from "@/components/ui/IconButton";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { XIcon } from "@/components/ui/icons";
import { DUR, easeOutExpo } from "@/lib/motion";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";
import { useOverlayState } from "@/lib/overlays";
import { cn } from "@/lib/cn";

const OPTIONS = [
  {
    key: "reducedMotion" as const,
    id: "a11y-reduced-motion",
    label: "Reduced motion",
    description: "Stops all animation, including the smooth scroll",
  },
  {
    key: "highContrast" as const,
    id: "a11y-high-contrast",
    label: "High contrast",
    description: "Raises text, border and surface contrast",
  },
  {
    key: "largeText" as const,
    id: "a11y-large-text",
    label: "Larger text",
    description: "Increases the base font size by 12.5%",
  },
];

/**
 * In-app accessibility controls.
 *
 * These now actually work. Previously the reduced-motion toggle reached 4 of
 * 17 animated components (everything else read the OS query directly), and
 * high contrast could only alter five variables while 109 hardcoded colour
 * literals ignored it. With every surface routed through tokens and every
 * animation through `useReducedMotionPref`, both switches change what you see.
 */
export function AccessibilityPanel() {
  // Opened from the chrome (nav on desktop, menu sheet on phones) — no floating corner button (lib/overlays.ts).
  const [open, setOpen] = useOverlayState("a11y");
  const prefs = useAccessibility();
  const reduced = useReducedMotionPref();
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), [setOpen]);
  useFocusTrap(panelRef, open, close, false);   // a non-modal popover: the page stays usable

  return (
    // Anchored under the nav's right edge, where its button lives; bounded to the viewport and scrollable.
    <div className="fixed right-3 top-[calc(var(--nav-h)+0.5rem)] z-[70] lg:right-6">
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-label="Accessibility settings"
            tabIndex={-1}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: DUR.mid, ease: easeOutExpo }}
            data-lenis-prevent
            className="glass edge-lit w-[min(19rem,calc(100vw-1.5rem))] max-h-[calc(100svh-var(--nav-h)-1.5rem)] overflow-y-auto overscroll-contain rounded-2xl border border-line p-5 shadow-float"
            style={{ background: "var(--bg-raised)" }}   /* solid: settings text must not show the page behind it */
          >
            <div className="flex items-center justify-between gap-3">
              <Eyebrow as="span">Accessibility</Eyebrow>
              <IconButton
                label="Close accessibility settings"
                size="sm"
                onClick={close}
                data-autofocus
              >
                <XIcon size={15} />
              </IconButton>
            </div>

            <div className="mt-3 divide-y divide-[var(--border-subtle)]">
              {OPTIONS.map((o) => (
                <ToggleRow
                  key={o.key}
                  id={o.id}
                  label={o.label}
                  description={o.description}
                  checked={prefs[o.key]}
                  onChange={() => prefs.toggle(o.key)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

function ToggleRow({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div className="min-w-0">
        <label htmlFor={id} className="block cursor-pointer text-sm font-medium text-fg">
          {label}
        </label>
        <p className="mt-0.5 text-xs leading-snug text-fg-muted">{description}</p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors duration-[var(--dur-mid)]",
          // Extends the hit target to 44px without changing the visual size.
          "before:absolute before:left-1/2 before:top-1/2 before:h-11 before:w-12 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']",
          checked
            ? "border-accent-line bg-accent-soft"
            : "border-line bg-surface-2",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none inline-block h-4 w-4 rounded-full transition-transform duration-[var(--dur-mid)]",
            checked ? "translate-x-[1.4rem] bg-accent" : "translate-x-0.5 bg-fg-subtle",
          )}
        />
      </button>
    </div>
  );
}
