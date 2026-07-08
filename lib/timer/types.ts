export type TimerMode = "pomodoro" | "deepwork";

export type TimerPhase = "focus" | "break";

export type TimerStatus = "idle" | "running" | "paused";

export interface TimerSettings {
  /** Pomodoro focus length in minutes */
  pomodoroFocusMin: number;
  /** Pomodoro break length in minutes */
  pomodoroBreakMin: number;
  /** Deep work focus length in minutes */
  deepWorkMin: number;
  /** Automatically start the next phase when one completes */
  autoStartNext: boolean;
}

export const DEFAULT_SETTINGS: TimerSettings = {
  pomodoroFocusMin: 25,
  pomodoroBreakMin: 5,
  deepWorkMin: 90,
  autoStartNext: false,
};

export const SETTINGS_BOUNDS = {
  pomodoroFocusMin: { min: 1, max: 120 },
  pomodoroBreakMin: { min: 1, max: 60 },
  deepWorkMin: { min: 10, max: 240 },
} as const;
