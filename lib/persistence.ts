import { DEFAULT_SETTINGS, type TimerMode, type TimerSettings } from "@/lib/timer/types";
import { DEFAULT_STYLE_ID } from "@/lib/timerStyles/registry";
import { getTrackById } from "@/lib/audio/tracks";
import { DEFAULT_THEME, isTheme, type Theme } from "@/lib/theme";

const STORAGE_KEY = "flowcus:state:v1";

export interface PersistedState {
  settings: TimerSettings;
  mode: TimerMode;
  styleId: string;
  volume: number;
  trackId: string | null;
  theme: Theme;
}

export const DEFAULT_PERSISTED: PersistedState = {
  settings: DEFAULT_SETTINGS,
  mode: "pomodoro",
  styleId: DEFAULT_STYLE_ID,
  volume: 0.6,
  trackId: null,
  theme: DEFAULT_THEME,
};

export function loadState(): PersistedState {
  if (typeof window === "undefined") return DEFAULT_PERSISTED;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PERSISTED;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
      mode: parsed.mode === "deepwork" ? "deepwork" : "pomodoro",
      styleId: parsed.styleId ?? DEFAULT_STYLE_ID,
      volume:
        typeof parsed.volume === "number"
          ? Math.min(1, Math.max(0, parsed.volume))
          : DEFAULT_PERSISTED.volume,
      trackId: getTrackById(parsed.trackId ?? null)
        ? (parsed.trackId ?? null)
        : null,
      theme: isTheme(parsed.theme) ? parsed.theme : DEFAULT_PERSISTED.theme,
    };
  } catch {
    return DEFAULT_PERSISTED;
  }
}

export function saveState(state: PersistedState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage full or unavailable - non-fatal */
  }
}
