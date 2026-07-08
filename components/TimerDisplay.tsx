"use client";

import { formatRemaining } from "@/lib/timer/machine";
import { useTimerContext } from "@/context/TimerContext";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

const PHASE_LABEL: Record<string, string> = {
  focus: "Focus",
  break: "Break",
};

const MODE_LABEL: Record<string, string> = {
  pomodoro: "Pomodoro",
  deepwork: "Deep Work",
};

export function TimerDisplay() {
  const { remainingMs, mode, phase, status, cyclesCompleted } =
    useTimerContext();
  const { theme } = useTheme();

  const phaseLabel =
    mode === "deepwork" ? MODE_LABEL.deepwork : PHASE_LABEL[phase];

  const isDark = theme === "dark";

  return (
    <div
      className={cn(
        "pointer-events-none flex select-none flex-col items-center gap-3 text-center",
        isDark
          ? "[text-shadow:0_2px_18px_rgba(0,0,0,0.45)]"
          : "[text-shadow:0_1px_12px_rgba(255,255,255,0.6)]",
      )}
    >
      <span
        className={cn(
          "text-[0.7rem] font-semibold uppercase tracking-[0.35em]",
          isDark ? "text-white/75" : "text-foreground/55",
        )}
      >
        {phaseLabel}
      </span>
      <span
        className={cn(
          "font-sans text-6xl font-semibold leading-none tabular-nums sm:text-8xl",
          isDark ? "text-white" : "text-foreground",
        )}
      >
        {formatRemaining(remainingMs)}
      </span>
      <span
        className={cn(
          "text-xs font-medium tracking-wide",
          isDark ? "text-white/70" : "text-foreground/50",
        )}
        aria-live="polite"
      >
        {status === "running"
          ? mode === "pomodoro"
            ? `${cyclesCompleted} focus ${cyclesCompleted === 1 ? "cycle" : "cycles"} done`
            : "In deep flow"
          : status === "paused"
            ? "Paused"
            : "Ready when you are"}
      </span>
    </div>
  );
}
