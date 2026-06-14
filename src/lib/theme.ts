export const THEME_STORAGE_KEY = "bumpity-road-theme";

export type Theme = "light" | "night";

export function isNightTheme(theme: Theme) {
  return theme === "night";
}

export function themeToClass(theme: Theme) {
  return isNightTheme(theme) ? "dark" : "";
}

export function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "night" ? "night" : "light";
  } catch {
    return "light";
  }
}

export function applyThemeToDocument(theme: Theme) {
  document.documentElement.classList.toggle("dark", isNightTheme(theme));
}
