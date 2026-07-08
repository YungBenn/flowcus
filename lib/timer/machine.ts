import type { TimerMode, TimerPhase, TimerSettings } from "./types";

/**
 * Pure helpers describing how the timer transitions between phases.
 * Kept side-effect free so they are trivial to reason about and test.
 */

const MINUTE_MS = 60_000;

/** Duration in milliseconds for a given mode + phase. */
export function getPhaseDurationMs(
  settings: TimerSettings,
  mode: TimerMode,
  phase: TimerPhase,
): number {
  if (mode === "deepwork") {
    // Deep work is a single long focus block with no scheduled break.
    return settings.deepWorkMin * MINUTE_MS;
  }
  return phase === "focus"
    ? settings.pomodoroFocusMin * MINUTE_MS
    : settings.pomodoroBreakMin * MINUTE_MS;
}

/**
 * The phase to move to after the current one completes.
 * Pomodoro alternates focus <-> break. Deep work always returns to focus
 * (a fresh session) since it has no break concept.
 */
export function getNextPhase(mode: TimerMode, phase: TimerPhase): TimerPhase {
  if (mode === "deepwork") return "focus";
  return phase === "focus" ? "break" : "focus";
}

/** Whether completing this phase counts as a finished focus cycle. */
export function isFocusPhase(phase: TimerPhase): boolean {
  return phase === "focus";
}

/** MM:SS from a millisecond remainder, rounding up so the last second shows 00:01. */
export function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function clampSetting(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}
