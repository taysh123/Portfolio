"use client";

import { useTheme } from "@/components/providers/ThemeProvider";
import { IconButton } from "@/components/ui/IconButton";
import { SunIcon, MoonIcon } from "@/components/ui/icons";

/** Both glyphs are always present; CSS cross-fades them (globals.css .theme-glyph). No animation library. */
export function ThemeToggle({ className, tone, size = "sm" }: { className?: string; tone?: "default" | "bare"; size?: "sm" | "md" }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <IconButton size={size} tone={tone} className={className} onClick={toggleTheme} label={isDark ? "Switch to light mode" : "Switch to dark mode"}>
      <span className="theme-glyph absolute" data-on={isDark ? "" : undefined}><MoonIcon size={16} /></span>
      <span className="theme-glyph absolute" data-on={!isDark ? "" : undefined}><SunIcon size={16} /></span>
    </IconButton>
  );
}
