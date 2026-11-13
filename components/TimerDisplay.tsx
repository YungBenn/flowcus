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
          "flex items-center gap-2 text-sm font-medium",
          isDark ? "text-white/80" : "text-foreground/70",
        )}
      >
        <span
          className="size-2 rounded-full bg-accent-1 transition-colors duration-700"
          aria-hidden
        />
        {phaseLabel}
      </span>
      <span
        className={cn(
          "font-display text-7xl font-normal leading-none tracking-[-0.03em] tabular-nums sm:text-9xl",
          isDark ? "text-white" : "text-foreground",
        )}
      >
        {formatRemaining(remainingMs)}
      </span>
      <span
        className={cn(
          "text-sm",
          isDark ? "text-white/70" : "text-foreground/60",
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
