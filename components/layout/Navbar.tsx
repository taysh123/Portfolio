"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/ui/Logo";
import { IconButton } from "@/components/ui/IconButton";
import { ButtonLink } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { MenuIcon, CloseIcon, SearchIcon } from "@/components/ui/icons";
import { DUR, easeOutExpo } from "@/lib/motion";
import { useFocusTrap, useScrollLock } from "@/lib/useFocusTrap";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";

const LINKS = [
  { href: "#work", label: "Work" },
  { href: "#about", label: "About" },
  { href: "#skills", label: "Stack" },
  { href: "#contact", label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");
  const menuRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotionPref();

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  });

  const closeMenu = useCallback(() => setOpen(false), []);
  useFocusTrap(menuRef, open, closeMenu);
  useScrollLock(open);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Highlights the section currently in view, so the nav reports position
  // rather than just offering destinations.
  useEffect(() => {
    const sections = LINKS.map((l) => document.getElementById(l.href.slice(1))).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    if (sections.length === 0) return;

    // Tracks every observed section's state rather than reacting to the delta,
    // so when the reader is in the hero — which is not a nav destination —
    // nothing is highlighted. Reacting to entries alone left whichever section
    // reported last stuck as "active" at the top of the page.
    const visible = new Set<string>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        }
        const first = sections.find((s) => visible.has(s.id));
        setActive(first ? `#${first.id}` : "");
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  const openPalette = () => {
    window.dispatchEvent(new CustomEvent("palette:open"));
  };

  return (
    <>
      <header
        data-entrance-nav
        className={cn(
          // Hidden while the entrance runs; the stage sets data-entrance-done at the portal (or at once in static mode).
          "fixed inset-x-0 top-0 z-50 opacity-0 [html[data-entrance-done=true]_&]:opacity-100 focus-within:opacity-100 transition-[background-color,border-color,backdrop-filter,opacity] duration-[var(--dur-slow)] ease-[var(--ease-out-expo)]",
          scrolled
            ? "glass border-b border-line-subtle"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <nav
          aria-label="Primary"
          className="mx-auto flex h-[var(--nav-h)] w-full max-w-[var(--stage)] items-center justify-between px-[calc(var(--gutter)+var(--panel-p)*0.42)]"
        >
          <Logo />

          <ul className="hidden items-center gap-1 lg:flex">
            {LINKS.map((l) => {
              const isActive = active === l.href;
              return (
                <li key={l.href}>
                  <a
                    href={l.href}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "relative inline-flex h-11 items-center rounded-full px-3.5 text-sm transition-colors duration-[var(--dur-mid)]",
                      isActive ? "text-fg" : "text-fg-muted hover:text-fg",
                    )}
                  >
                    {l.label}
                    {isActive && (
                      <motion.span
                        layoutId={reduced ? undefined : "nav-active"}
                        aria-hidden="true"
                        className="absolute inset-x-3 -bottom-px h-px bg-accent"
                        transition={{ duration: DUR.mid, ease: easeOutExpo }}
                      />
                    )}
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="hidden items-center gap-2 lg:flex">
            <IconButton
              // Platform-agnostic: detecting the modifier would need client state and a
              // hydration-safe fallback, for a string most users never hear.
              label="Open command palette (Ctrl or Cmd + K)"
              size="sm"
              onClick={openPalette}
            >
              <SearchIcon size={15} />
            </IconButton>
            <ThemeToggle />
            <ButtonLink href="#contact" size="sm" variant="secondary">
              Get in touch
            </ButtonLink>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <IconButton
              label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen(true)}
            >
              <MenuIcon size={20} />
            </IconButton>
          </div>
        </nav>

        <motion.span
          aria-hidden="true"
          style={{ scaleX: progress }}
          className={cn(
            "absolute bottom-0 left-0 h-px w-full origin-left bg-accent transition-opacity duration-[var(--dur-slow)]",
            scrolled ? "opacity-100" : "opacity-0",
          )}
        />
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-[60] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DUR.mid }}
          >
            <div
              aria-hidden="true"
              onClick={closeMenu}
              className="absolute inset-0 bg-[color-mix(in_oklab,var(--surface-0)_82%,transparent)] backdrop-blur-xl"
            />
            <motion.div
              ref={menuRef}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
              tabIndex={-1}
              className="glass absolute inset-x-3 bottom-3 top-[calc(var(--nav-h)+0.75rem)] flex flex-col overflow-hidden rounded-2xl border border-line p-6"
              initial={reduced ? { opacity: 0 } : { y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduced ? { opacity: 0 } : { y: 16, opacity: 0 }}
              transition={{ duration: DUR.slow, ease: easeOutExpo }}
            >
              <div className="flex items-center justify-between">
                <span className="label text-fg-subtle">Menu</span>
                <IconButton label="Close menu" onClick={closeMenu} data-autofocus>
                  <CloseIcon size={20} />
                </IconButton>
              </div>

              <ul className="mt-8 flex flex-col gap-1">
                {LINKS.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      onClick={closeMenu}
                      className="flex items-center justify-between rounded-xl px-3 py-4 text-2xl font-medium tracking-[var(--tracking-heading)] text-fg transition-colors hover:bg-surface-1"
                    >
                      {l.label}
                      <span aria-hidden="true" className="text-fg-subtle">
                        →
                      </span>
                    </a>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-8">
                <ButtonLink href="#contact" onClick={closeMenu} size="lg" className="w-full">
                  Get in touch
                </ButtonLink>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
