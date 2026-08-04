"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "@/components/providers/ThemeProvider";
import { SearchIcon, ArrowUpRightIcon } from "@/components/ui/icons";
import { projects } from "@/data/projects";
import { socials } from "@/data/socials";
import { DUR, easeOutExpo } from "@/lib/motion";
import { useFocusTrap, useScrollLock } from "@/lib/useFocusTrap";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";
import { cn } from "@/lib/cn";

type Command = {
  id: string;
  label: string;
  category: string;
  hint?: string;
  external?: boolean;
  run: () => void;
};

const SECTIONS = [
  { id: "top", label: "Home" },
  { id: "about", label: "About" },
  { id: "work", label: "Selected work" },
  { id: "skills", label: "Toolkit" },
  { id: "approach", label: "Approach" },
  { id: "contact", label: "Contact" },
];

/**
 * Command palette.
 *
 * Everything is derived from `data/` now. The hand-maintained version had
 * drifted badly: it linked to a dead demo domain, used a project's old name,
 * and listed 2 of 6 projects.
 *
 * ARIA follows the combobox pattern properly — the input keeps focus and owns
 * `aria-activedescendant`, options are plain `<li role="option">` rather than
 * nested buttons (an option must not contain interactive descendants, and the
 * previous nesting made ↑/↓ announce nothing at all).
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const { theme, toggleTheme } = useTheme();
  const reduced = useReducedMotionPref();
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIdx(0);
  }, []);

  useFocusTrap(panelRef, open, close);
  useScrollLock(open);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("palette:open", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("palette:open", onOpen);
    };
  }, []);

  const commands: Command[] = useMemo(() => {
    const go = (id: string) => () => {
      close();
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };
    const openUrl = (url: string) => () => {
      close();
      window.open(url, "_blank", "noopener,noreferrer");
    };

    return [
      ...SECTIONS.map((s) => ({
        id: `nav-${s.id}`,
        label: s.label,
        category: "Navigate",
        run: go(s.id),
      })),
      ...projects.flatMap<Command>((p) => [
        {
          id: `repo-${p.id}`,
          label: p.name,
          category: "Projects",
          hint: "Source on GitHub",
          external: true,
          run: openUrl(p.repoUrl),
        },
        ...(p.liveUrl
          ? [
              {
                id: `live-${p.id}`,
                label: `${p.name} — live`,
                category: "Projects",
                hint: p.liveLabel ?? "Open",
                external: true,
                run: openUrl(p.liveUrl),
              },
            ]
          : []),
      ]),
      {
        id: "theme",
        label: theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
        category: "Actions",
        run: () => {
          toggleTheme();
          close();
        },
      },
      {
        id: "email",
        label: "Email Tay",
        category: "Contact",
        hint: socials.email,
        run: () => {
          close();
          window.location.href = `mailto:${socials.email}`;
        },
      },
      {
        id: "github",
        label: "GitHub profile",
        category: "Contact",
        external: true,
        run: openUrl(socials.github.url),
      },
      {
        id: "linkedin",
        label: "LinkedIn profile",
        category: "Contact",
        external: true,
        run: openUrl(socials.linkedin.url),
      },
    ];
  }, [theme, toggleTheme, close]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.hint?.toLowerCase().includes(q),
    );
  }, [commands, query]);

  // Reset the highlight when the result set changes — during render, which is
  // React's recommended pattern for deriving state from props/state.
  const [prevQuery, setPrevQuery] = useState(query);
  if (query !== prevQuery) {
    setPrevQuery(query);
    setActiveIdx(0);
  }

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>("[data-active='true']")
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => (filtered.length ? (i + 1) % filtered.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) =>
        filtered.length ? (i - 1 + filtered.length) % filtered.length : 0,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      filtered[activeIdx]?.run();
    }
  };

  const categories = Array.from(new Set(filtered.map((c) => c.category)));

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DUR.fast }}
            onClick={close}
            aria-hidden="true"
            className="fixed inset-0 z-[80] bg-[color-mix(in_oklab,var(--surface-0)_74%,transparent)] backdrop-blur-sm"
          />

          <motion.div
            key="panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: -8 }}
            transition={{ duration: DUR.mid, ease: easeOutExpo }}
            onKeyDown={onKeyDown}
            className="glass edge-lit fixed left-1/2 top-[16vh] z-[81] w-[min(36rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-2xl border border-line shadow-float"
          >
            <div className="flex items-center gap-3 border-b border-line-subtle px-4 py-3.5">
              <SearchIcon size={16} className="shrink-0 text-fg-subtle" />
              <input
                data-autofocus
                type="text"
                role="combobox"
                aria-expanded="true"
                aria-controls="palette-list"
                aria-activedescendant={
                  filtered[activeIdx] ? `cmd-${filtered[activeIdx].id}` : undefined
                }
                aria-label="Search commands"
                autoComplete="off"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Jump to a section, project, or action…"
                className="flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-fg-subtle"
              />
              <kbd className="label hidden rounded border border-line px-1.5 py-0.5 text-fg-subtle sm:block">
                Esc
              </kbd>
            </div>

            <ul
              id="palette-list"
              ref={listRef}
              role="listbox"
              aria-label="Commands"
              className="max-h-[min(24rem,50vh)] overflow-y-auto py-2"
            >
              {filtered.length === 0 && (
                <li className="px-4 py-10 text-center text-sm text-fg-subtle">
                  Nothing matches “{query}”.
                </li>
              )}

              {categories.map((cat) => (
                <li key={cat} role="presentation">
                  <p className="label px-4 pb-1 pt-3 text-fg-subtle">{cat}</p>
                  <ul role="presentation">
                    {filtered
                      .filter((c) => c.category === cat)
                      .map((cmd) => {
                        const idx = filtered.indexOf(cmd);
                        const isActive = idx === activeIdx;
                        return (
                          <li
                            key={cmd.id}
                            id={`cmd-${cmd.id}`}
                            role="option"
                            aria-selected={isActive}
                            data-active={isActive}
                            onClick={cmd.run}
                            onMouseEnter={() => setActiveIdx(idx)}
                            className={cn(
                              "flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-sm transition-colors",
                              isActive
                                ? "bg-accent-soft text-fg"
                                : "text-fg-muted hover:bg-surface-1 hover:text-fg",
                            )}
                          >
                            <span>{cmd.label}</span>
                            <span className="flex shrink-0 items-center gap-2 text-xs text-fg-subtle">
                              {cmd.hint}
                              {cmd.external && <ArrowUpRightIcon size={12} />}
                            </span>
                          </li>
                        );
                      })}
                  </ul>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-4 border-t border-line-subtle px-4 py-2.5">
              {[
                ["↑↓", "navigate"],
                ["↵", "select"],
                ["esc", "close"],
              ].map(([key, action]) => (
                <span key={key} className="label text-fg-subtle">
                  <kbd className="rounded border border-line px-1 py-0.5">{key}</kbd>{" "}
                  {action}
                </span>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
