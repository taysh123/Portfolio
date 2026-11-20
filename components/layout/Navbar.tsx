"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/ui/Logo";
import { IconButton } from "@/components/ui/IconButton";
import { AvailabilityPill } from "@/components/layout/AvailabilityPill";
import { MenuIcon, CloseIcon, AccessibilityIcon } from "@/components/ui/icons";
import { useFocusTrap, useScrollLock } from "@/lib/useFocusTrap";
import { toggleOverlay, useOverlayOpen } from "@/lib/overlays";
import { clientDict as t } from "@/lib/dict-client";
import { siteMeta } from "@/data/socials";
import { fmt } from "@/lib/fmt";

const LINKS = [
  { href: "#work", key: "work" },
  { href: "#about", key: "about" },
  { href: "#skills", key: "stack" },
  { href: "#contact", key: "contact" },
] as const;

/** Where a section becomes current: its top crossing this line, 40% of the way down the screen. */
const LINE = 0.4;
/** Hysteresis: a boundary must pass the line by this much before the current section changes, so a section resting on
 *  the line, or a scroll that wobbles across it, cannot make the underline bounce. */
const BAND = 32;

/**
 * The site header (M10's behaviour, re-toned in the cinematic layer for Concept A: R2). The locked hero's wordmark and
 * availability pill, four destinations with the current-section underline, the accessibility control, and one Contact
 * action; on phones, the menu sheet. No theme control: the site is dark only (R3). No command palette. The assistant
 * has its own floating launcher (components/chat/ChatLauncher.tsx), not a header button.
 *
 * Over the hero, at the top of the page, it shows no surface, so the first screen still reads as the locked hero. Once
 * the page has moved it is one surface on every section: the field, frosted over whatever passes beneath it
 * (app/cinematic.css), with a hairline. It never repaints with the content.
 *
 * Two readers, one per state. Whether the page has moved is set in the scroll event itself, so the surface is there in
 * the same frame as the scroll that needs it (in a frame of its own it would lag one frame behind the first move).
 * Which section is current is decided once per animation frame, from the scroll position, so a slow scroll, a fast
 * one, a reversal, a touch fling and an anchor jump all resolve the same way.
 */
export function Navbar() {
  const header = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");
  const menuRef = useRef<HTMLDivElement>(null);
  // The sheet stays mounted for its CSS exit (140ms) after `open` turns false.
  const [mounted, setMounted] = useState(false);
  const unmount = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const openMenu = useCallback(() => { clearTimeout(unmount.current); setMounted(true); setOpen(true); }, []);
  const closeMenu = useCallback(() => {
    setOpen(false);
    clearTimeout(unmount.current); unmount.current = setTimeout(() => setMounted(false), 200);
  }, []);
  useFocusTrap(menuRef, open, closeMenu);
  useScrollLock(open);

  useEffect(() => {
    const el = header.current;
    const sections = LINKS.map((l) => document.getElementById(l.href.slice(1))).filter((s): s is HTMLElement => Boolean(s));
    if (!el || sections.length === 0) return;
    let raf = 0, current = -1, atEnd = false;
    const moved = () => {
      const scrolled = window.scrollY > 8;
      if (scrolled !== (el.dataset.scrolled !== undefined)) { if (scrolled) el.dataset.scrolled = ""; else delete el.dataset.scrolled; }
    };
    const read = () => {
      raf = 0;
      const line = window.innerHeight * LINE;
      const tops = sections.map((s) => s.getBoundingClientRect().top);
      // The end of the page makes the last section current (Contact is shorter than a screen, so its top may never
      // reach the line); leaving the end takes BAND px of scroll, like every other change.
      const left = document.documentElement.scrollHeight - (window.innerHeight + window.scrollY);
      if (left <= 2) atEnd = true; else if (left > BAND) atEnd = false;
      // Otherwise: the last section whose top has passed the line.
      let next = -1;
      tops.forEach((t, i) => { if (t <= line) next = i; });
      if (atEnd) next = sections.length - 1;
      // Forward: the new section's top must be BAND past the line. Back: the current section's top must be BAND below it.
      if (next > current) { if (atEnd || tops[next] <= line - BAND) current = next; }
      else if (next < current) { if (current < 0 || tops[current] >= line + BAND) current = next; }
      const key = current >= 0 ? `#${sections[current].id}` : "";
      if (el.dataset.active !== key) { el.dataset.active = key; setActive(key); }
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(read); };
    const onScroll = () => { moved(); schedule(); };
    moved(); read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", schedule); cancelAnimationFrame(raf); };
  }, []);

  const a11yOpen = useOverlayOpen("a11y");

  return (
    <>
      <header ref={header} data-site-nav className="site-nav fixed inset-x-0 top-0 z-50">
        <nav aria-label={t.nav.label} className="site-nav__row shell flex h-[var(--nav-h)] items-center justify-between gap-4" data-reveal>
          <Logo label={fmt(t.nav.home, { name: siteMeta.name })} />

          <ul className="hidden items-center gap-1 lg:flex">
            {LINKS.map((l) => {
              const isActive = active === l.href;
              return (
                <li key={l.href}>
                  <a href={l.href} aria-current={isActive ? "true" : undefined}
                    className={cn("relative inline-flex h-11 items-center px-3.5 text-[0.9375rem] transition-[color] duration-150", isActive ? "text-fg" : "text-fg-muted hover:text-fg")}>
                    {t.nav[l.key]}
                    <span aria-hidden="true" className="nav-underline absolute inset-x-3.5 bottom-2 h-px" />
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="hidden items-center gap-1.5 lg:flex">
            <AvailabilityPill className="site-nav__pill" />
            <IconButton label={t.nav.a11y} data-overlay-trigger="a11y" size="sm" tone="bare" aria-expanded={a11yOpen} onClick={() => toggleOverlay("a11y")}>
              <AccessibilityIcon size={17} />
            </IconButton>
            <a href="#contact" className="site-nav__cta">{t.nav.getInTouch}</a>
          </div>

          <div className="flex items-center gap-1 lg:hidden">
            <IconButton label={t.nav.openMenu} tone="bare" aria-expanded={open} aria-controls="mobile-menu" onClick={openMenu}>
              <MenuIcon size={20} />
            </IconButton>
          </div>
        </nav>
      </header>

      {(open || mounted) && (
        <div id="mobile-menu" data-state={open ? "open" : "closed"} className="menu-sheet fixed inset-0 z-[60] lg:hidden">
          <div aria-hidden="true" onClick={closeMenu} className="absolute inset-0 bg-[color-mix(in_oklab,var(--surface-0)_80%,transparent)]" />
          <div ref={menuRef} role="dialog" aria-modal="true" aria-label={t.nav.menu} tabIndex={-1}
            // Scrolls when the viewport is short (a landscape phone), so the last control stays reachable.
            className="menu-sheet__panel absolute inset-x-3 top-3 flex max-h-[calc(100%-1.5rem)] flex-col overflow-y-auto overscroll-contain rounded-2xl border border-line bg-raised p-5 shadow-e3">
            <div className="flex items-center justify-between">
              <span className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-fg">{siteMeta.name}</span>
              <IconButton label={t.nav.closeMenu} tone="bare" onClick={closeMenu} data-autofocus>
                <CloseIcon size={20} />
              </IconButton>
            </div>
            <ul className="mt-4 flex flex-col">
              {LINKS.map((l) => (
                <li key={l.href} className="border-t border-line first:border-t-0">
                  <a href={l.href} onClick={closeMenu}
                    className="flex min-h-14 items-center justify-between py-3 text-[1.375rem] font-medium tracking-[-0.02em] text-fg">
                    {t.nav[l.key]}<span aria-hidden="true" className="text-fg-subtle">→</span>
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center gap-3 border-t border-line pt-4">
              {/* After the sheet's own focus restore, so the panel returns focus to the menu button on close. */}
              <button type="button" data-overlay-trigger="a11y" onClick={() => { closeMenu(); setTimeout(() => toggleOverlay("a11y"), 0); }}
                className="inline-flex min-h-11 items-center gap-2.5 rounded-full pr-3 text-[0.9375rem] text-fg-muted hover:text-fg">
                <AccessibilityIcon size={18} />{t.nav.a11y}
              </button>
            </div>
            <a href="#contact" onClick={closeMenu} className="hxa__btn hxa__btn--primary mt-5 w-full">{t.nav.getInTouch}</a>
          </div>
        </div>
      )}
    </>
  );
}
