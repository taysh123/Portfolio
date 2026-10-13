"use client";

import { createContext, useContext, useState } from "react";
import {
  A11Y_COOKIE,
  A11Y_ATTR,
  writeCookie,
  type A11yPrefs,
} from "@/lib/theme";

type A11yContextValue = A11yPrefs & {
  toggle: (key: keyof A11yPrefs) => void;
};

const A11yContext = createContext<A11yContextValue>({
  reducedMotion: false,
  highContrast: false,
  largeText: false,
  toggle: () => {},
});

export function useAccessibility() {
  return useContext(A11yContext);
}

export function AccessibilityProvider({
  children,
  initialPrefs,
}: {
  children: React.ReactNode;
  initialPrefs: A11yPrefs;
}) {
  // Server rendered the matching data-* attributes from the same cookie value,
  // so initial state matches the DOM — no mount effect needed.
  const [prefs, setPrefs] = useState<A11yPrefs>(initialPrefs);

  const toggle = (key: keyof A11yPrefs) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      document.documentElement.setAttribute(A11Y_ATTR[key], String(next[key]));
      writeCookie(A11Y_COOKIE, JSON.stringify(next));
      return next;
    });
  };

  return (
    <A11yContext.Provider value={{ ...prefs, toggle }}>
      {children}
    </A11yContext.Provider>
  );
}
