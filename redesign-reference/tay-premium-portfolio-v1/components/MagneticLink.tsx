"use client";

import type {
  AnchorHTMLAttributes,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from "react";
import { useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
};

export function MagneticLink({ children, className = "", ...props }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduced = useReducedMotion();

  const move = (event: ReactPointerEvent<HTMLAnchorElement>) => {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = event.clientX - (rect.left + rect.width / 2);
    const y = event.clientY - (rect.top + rect.height / 2);
    ref.current.style.transform = `translate3d(${x * 0.12}px, ${y * 0.16}px, 0)`;
  };

  const reset = () => {
    if (ref.current) ref.current.style.transform = "translate3d(0,0,0)";
  };

  return (
    <a
      ref={ref}
      onPointerMove={move}
      onPointerLeave={reset}
      className={`magnetic-link ${className}`}
      {...props}
    >
      {children}
    </a>
  );
}
