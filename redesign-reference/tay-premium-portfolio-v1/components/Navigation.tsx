"use client";

import { useEffect, useState } from "react";

const links = [
  ["Work", "#work"],
  ["About", "#about"],
  ["Stack", "#stack"],
  ["Contact", "#contact"],
] as const;

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const introThreshold = window.innerHeight * (reduced ? 0.7 : window.innerWidth <= 800 ? 1.9 : 3.2);
      setEntered(window.scrollY > introThreshold);
      setScrolled(window.scrollY > introThreshold + 80);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <header className={`site-nav ${entered ? "is-visible" : ""} ${scrolled ? "is-scrolled" : ""}`}>
      <a href="#top" className="brand-mark" aria-label="Tay Shofer — home">TS</a>
      <nav aria-label="Primary navigation">
        {links.map(([label, href]) => <a href={href} key={href}>{label}</a>)}
      </nav>
      <a className="availability" href="#contact"><span aria-hidden="true" /> Available for work</a>
    </header>
  );
}
