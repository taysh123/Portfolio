"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/ui/Logo";
import { IconButton } from "@/components/ui/IconButton";
import { ButtonLink } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { MenuIcon, CloseIcon, AccessibilityIcon } from "@/components/ui/icons";
import { useFocusTrap, useScrollLock } from "@/lib/useFocusTrap";
import { toggleOverlay, useOverlayOpen } from "@/lib/overlays";

const LINKS = [
  { href: "#work", label: "Work" },
  { href: "#about", label: "About" },
  { href: "#skills", label: "Stack" },
  { href: "#contact", label: "Contact" },
];

type Zone = { id: string; top: number; bottom: number; dark: boolean; bg: string };

/**
 * The site header (M10): name, four destinations, the theme and accessibility controls, and one clear Contact
 * action. No command palette and no chat (M10 brief): neither answered a tested need.
 *
 * The bar takes the tone of the plate directly beneath it — navy over T Poker, steel over Aegis, violet over DeveloperOS,
 * teal over GRAVITY FLOW, paper elsewhere — so it reads as part of each chapter instead of a strip laid over it.
 * The plates' rects and colours are measured on the first scroll (and again after a reflow or a theme change); the
 * scroll handler then only compares numbers and writes the result straight onto the element in the same frame, so
 * the ink and the surface never disagree with what is underneath, even for a frame.
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
    if (!el) return;
    // Measured lazily: nothing is needed while the page sits at the top (the bar is paper over the hero), so the first
    // measurement waits for the first scroll — when layout is already fresh — instead of forcing one during hydration.
    let zones: Zone[] | null = null;
    let raf = 0;
    const measure = () => {
      // Every section with a surface of its own: the plates, and the white sections between them (About, Stack,
      // Contact). A transparent section is the page itself.
      zones = [...document.querySelectorAll<HTMLElement>("main section[id]")].map((s) => {
        const r = s.getBoundingClientRect(), top = r.top + window.scrollY, bg = getComputedStyle(s).backgroundColor;
        return { id: s.id, top, bottom: top + r.height, dark: s.dataset.theme === "dark", bg };
      }).filter((z) => z.bg !== "rgba(0, 0, 0, 0)" && z.bg !== "transparent");
      delete el.dataset.zone;   // colours may have changed (theme): re-apply whatever zone we are in
    };
    const apply = () => {
      const scrolled = window.scrollY > 8;
      if (scrolled !== (el.dataset.scrolled !== undefined)) { if (scrolled) el.dataset.scrolled = ""; else delete el.dataset.scrolled; }
      if (!zones) { if (!scrolled && el.dataset.zone) return; if (!scrolled) { el.dataset.zone = "page"; return; } measure(); }
      // The zone directly beneath the bar's bottom edge: an anchor lands a section right there, and the bar takes
      // that section's tone in the same frame.
      const y = window.scrollY + el.offsetHeight + 1;
      const z = zones!.find((s) => y >= s.top && y < s.bottom);
      const key = z?.id ?? "page";
      if (el.dataset.zone !== key) {
        el.dataset.zone = key;
        if (z?.dark) el.dataset.theme = "dark"; else delete el.dataset.theme;
        if (z) el.style.setProperty("--nav-bg", z.bg); else el.style.removeProperty("--nav-bg");
      }
    };
    // Reflow or a theme change: forget the measurements; the next scroll (or this frame, if we are not at the top)
    // measures again.
    const stale = () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; zones = null; delete el.dataset.zone; apply(); }); };
    apply();
    window.addEventListener("scroll", apply, { passive: true });
    let first = true;
    const ro = new ResizeObserver(() => { if (first) { first = false; return; } stale(); }); ro.observe(document.body);
    const mo = new MutationObserver(stale); mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-large-text"] });
    return () => { window.removeEventListener("scroll", apply); ro.disconnect(); mo.disconnect(); cancelAnimationFrame(raf); };
  }, []);

  // The nav reports position, not only destinations: the section in the middle of the screen is current.
  useEffect(() => {
    const sections = LINKS.map((l) => document.getElementById(l.href.slice(1))).filter((el): el is HTMLElement => Boolean(el));
    if (sections.length === 0) return;
    const visible = new Set<string>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) { if (e.isIntersecting) visible.add(e.target.id); else visible.delete(e.target.id); }
      const first = sections.find((s) => visible.has(s.id));
      setActive(first ? `#${first.id}` : "");
    }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  const a11yOpen = useOverlayOpen("a11y");

  return (
    <>
      <header ref={header} data-site-nav className="site-nav fixed inset-x-0 top-0 z-50">
        <nav aria-label="Primary" className="shell flex h-[var(--nav-h)] items-center justify-between gap-4">
          <Logo />

          <ul className="hidden items-center gap-1 lg:flex">
            {LINKS.map((l) => {
              const isActive = active === l.href;
              return (
                <li key={l.href}>
                  <a href={l.href} aria-current={isActive ? "true" : undefined}
                    className={cn("relative inline-flex h-11 items-center px-3.5 text-[0.9375rem] transition-colors duration-150", isActive ? "text-fg" : "text-fg-muted hover:text-fg")}>
                    {l.label}
                    <span aria-hidden="true" className="nav-underline absolute inset-x-3.5 bottom-2 h-px bg-fg" />
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="hidden items-center gap-1.5 lg:flex">
            <IconButton label="Accessibility settings" data-overlay-trigger="a11y" size="sm" tone="bare" aria-expanded={a11yOpen} onClick={() => toggleOverlay("a11y")}>
              <AccessibilityIcon size={17} />
            </IconButton>
            <ThemeToggle tone="bare" />
            <ButtonLink href="#contact" size="sm" className="ml-2">Get in touch</ButtonLink>
          </div>

          <div className="flex items-center gap-1 lg:hidden">
            <ThemeToggle tone="bare" size="md" />
            <IconButton label="Open menu" tone="bare" aria-expanded={open} aria-controls="mobile-menu" onClick={openMenu}>
              <MenuIcon size={20} />
            </IconButton>
          </div>
        </nav>
      </header>

      {(open || mounted) && (
        <div id="mobile-menu" data-state={open ? "open" : "closed"} className="menu-sheet fixed inset-0 z-[60] lg:hidden">
          <div aria-hidden="true" onClick={closeMenu} className="absolute inset-0 bg-[color-mix(in_oklab,var(--surface-0)_80%,transparent)]" />
          <div ref={menuRef} role="dialog" aria-modal="true" aria-label="Navigation" tabIndex={-1}
            // Scrolls when the viewport is short (a landscape phone), so the last control stays reachable.
            className="menu-sheet__panel absolute inset-x-3 top-3 flex max-h-[calc(100%-1.5rem)] flex-col overflow-y-auto overscroll-contain rounded-2xl border border-line bg-raised p-5 shadow-e3">
            <div className="flex items-center justify-between">
              <span className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-fg">Tay Shofer</span>
              <IconButton label="Close menu" tone="bare" onClick={closeMenu} data-autofocus>
                <CloseIcon size={20} />
              </IconButton>
            </div>
            <ul className="mt-4 flex flex-col">
              {LINKS.map((l) => (
                <li key={l.href} className="border-t border-line first:border-t-0">
                  <a href={l.href} onClick={closeMenu}
                    className="flex min-h-14 items-center justify-between py-3 text-[1.375rem] font-medium tracking-[-0.02em] text-fg">
                    {l.label}<span aria-hidden="true" className="text-fg-subtle">→</span>
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center gap-3 border-t border-line pt-4">
              {/* After the sheet's own focus restore, so the panel returns focus to the menu button on close. */}
              <button type="button" data-overlay-trigger="a11y" onClick={() => { closeMenu(); setTimeout(() => toggleOverlay("a11y"), 0); }}
                className="inline-flex min-h-11 items-center gap-2.5 rounded-full pr-3 text-[0.9375rem] text-fg-muted hover:text-fg">
                <AccessibilityIcon size={18} />Accessibility settings
              </button>
            </div>
            <ButtonLink href="#contact" onClick={closeMenu} size="lg" className="mt-5 w-full">Get in touch</ButtonLink>
          </div>
        </div>
      )}
    </>
  );
}
