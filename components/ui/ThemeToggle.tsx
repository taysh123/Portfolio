"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "@/components/providers/ThemeProvider";
import { IconButton } from "@/components/ui/IconButton";
import { SunIcon, MoonIcon } from "@/components/ui/icons";
import { DUR } from "@/lib/motion";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const reduced = useReducedMotionPref();
  const isDark = theme === "dark";

  return (
    <IconButton
      size="sm"
      className={className}
      onClick={toggleTheme}
      label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={reduced ? false : { opacity: 0, rotate: -28, scale: 0.8 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, rotate: 28, scale: 0.8 }}
          transition={{ duration: DUR.fast }}
          className="absolute"
        >
          {isDark ? <MoonIcon size={16} /> : <SunIcon size={16} />}
        </motion.span>
      </AnimatePresence>
    </IconButton>
  );
}
