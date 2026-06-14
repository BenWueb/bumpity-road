"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

type Props = {
  collapsed: boolean;
};

export default function NightModeToggle({ collapsed }: Props) {
  const { theme, toggleTheme } = useTheme();
  const isNight = theme === "night";
  const label = isNight ? "Day mode" : "Night mode";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      title={collapsed ? label : undefined}
      aria-pressed={isNight}
    >
      {isNight ? (
        <Sun className="h-5 w-5 shrink-0 text-amber-500/90" />
      ) : (
        <Moon className="h-5 w-5 shrink-0 text-sky-700/80 dark:text-sky-300" />
      )}
      <span
        className={["truncate font-medium", collapsed ? "md:hidden" : ""].join(
          " ",
        )}
      >
        {label}
      </span>
    </button>
  );
}
