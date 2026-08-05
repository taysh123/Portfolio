"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAccessibility } from "@/components/providers/AccessibilityProvider";
import { IconButton } from "@/components/ui/IconButton";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { AccessibilityIcon, XIcon } from "@/components/ui/icons";
import { DUR, easeOutExpo } from "@/lib/motion";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";
import { useScrollIdle } from "@/lib/useScrollIdle";
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
  const [open, setOpen] = useState(false);
  const prefs = useAccessibility();
  const reduced = useReducedMotionPref();
  const panelRef = useRef<HTMLDivElement>(null);
  const retract = useScrollIdle() && !open;

  const close = useCallback(() => setOpen(false), []);
  useFocusTrap(panelRef, open, close);

  return (
    <div
      className={cn(
        "fixed left-6 z-50 flex flex-col items-start gap-3",
        "bottom-[max(1.5rem,env(safe-area-inset-bottom))]",
        // See the note in AIChatWidget: two fixed controls in the bottom
        // corners of a phone cover exactly the actions a reader is aiming for.
        "transition-[transform,opacity] duration-[var(--dur-slow)] ease-[var(--ease-out-expo)] lg:translate-y-0 lg:opacity-100",
        retract && "translate-y-[160%] opacity-0",
      )}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Accessibility settings"
            tabIndex={-1}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: DUR.mid, ease: easeOutExpo }}
            className="glass edge-lit w-[19rem] overflow-hidden rounded-2xl border border-line p-5 shadow-float"
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

      <IconButton
        label="Accessibility settings"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="glass shadow-float"
      >
        <AccessibilityIcon size={18} />
      </IconButton>
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
