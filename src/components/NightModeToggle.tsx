"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export default function NightModeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isNight = theme === "night";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isNight}
      aria-label={isNight ? "Switch to day mode" : "Switch to night mode"}
      onClick={toggleTheme}
      className={[
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-colors",
        isNight
          ? "border-teal-700/50 bg-teal-950/80"
          : "border-border bg-muted",
      ].join(" ")}
    >
      <span
        className={[
          "pointer-events-none absolute inline-flex h-4 w-4 items-center justify-center rounded-full bg-background shadow-sm transition-transform",
          isNight ? "translate-x-6" : "translate-x-1",
        ].join(" ")}
      >
        {isNight ? (
          <Moon className="h-2.5 w-2.5 text-teal-300" />
        ) : (
          <Sun className="h-2.5 w-2.5 text-amber-500" />
        )}
      </span>
    </button>
  );
}
