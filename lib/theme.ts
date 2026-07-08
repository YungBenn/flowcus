export type Theme = "light" | "dark";

export const DEFAULT_THEME: Theme = "light";

export function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

export function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export const CANVAS_BG: Record<Theme, string> = {
  dark: "#0a0a1f",
  light: "#e6e1f0",
};
