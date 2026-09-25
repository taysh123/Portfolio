"use client";
// One delegated listener; lights only the hovered card; off on touch and reduced motion.
import { useEffect } from "react";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";
export function PointerLight() {
  const reduced = useReducedMotionPref();
  useEffect(() => {
    const clear = () => document.querySelectorAll<HTMLElement>("[data-pointer-light] [data-card]").forEach((c) => { c.style.removeProperty("--mx"); c.style.removeProperty("--my"); });
    if (reduced) { clear(); return; }
    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const card = (e.target as Element).closest?.<HTMLElement>("[data-pointer-light] [data-card]"); if (!card) return;
      const r = card.getBoundingClientRect(); card.style.setProperty("--mx", `${e.clientX - r.left}px`); card.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    const leave = (e: PointerEvent) => {
      const c = (e.target as Element).closest?.<HTMLElement>("[data-pointer-light] [data-card]");
      if (c && e.relatedTarget instanceof Node && c.contains(e.relatedTarget)) return;   // moving between the card's own children
      c?.style.removeProperty("--mx"); c?.style.removeProperty("--my");
    };
    document.addEventListener("pointermove", move, { passive: true }); document.addEventListener("pointerout", leave, { passive: true });
    return () => { document.removeEventListener("pointermove", move); document.removeEventListener("pointerout", leave); clear(); };
  }, [reduced]);
  return null;
}
