"use client";

import { useTimerContext } from "@/context/TimerContext";
import { useTheme } from "@/context/ThemeContext";
import { PauseIcon, PlayIcon, ResetIcon, SkipIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export function Controls() {
  const { status, toggle, reset, skip, mode } = useTimerContext();
  const { theme } = useTheme();
  const isRunning = status === "running";
  const isDark = theme === "dark";

  const secondaryButtonClass = cn(
    "grid h-12 w-12 place-items-center rounded-full backdrop-blur-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-1",
    isDark
      ? "border border-white/15 bg-black/25 text-white/90 hover:border-white/30 hover:bg-black/35"
      : "border border-border/70 bg-card/70 text-foreground/75 hover:border-border hover:bg-card/90 hover:text-foreground",
  );

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={reset}
        aria-label="Reset timer"
        className={secondaryButtonClass}
      >
        <ResetIcon />
      </button>

      <button
        type="button"
        onClick={toggle}
        aria-label={isRunning ? "Pause timer" : "Start timer"}
        className={cn(
          "group grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-accent-1 to-accent-2 text-black transition-transform hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-1",
          isDark
            ? "shadow-[0_8px_30px_-6px_rgba(0,0,0,0.5)] ring-2 ring-white/25"
            : "shadow-[0_8px_24px_-6px_rgba(0,0,0,0.2)] ring-2 ring-black/5",
        )}
      >
        {isRunning ? (
          <PauseIcon width={26} height={26} />
        ) : (
          <PlayIcon width={26} height={26} className="translate-x-0.5" />
        )}
      </button>

      <button
        type="button"
        onClick={skip}
        aria-label={mode === "deepwork" ? "Restart deep work" : "Skip to next phase"}
        className={secondaryButtonClass}
      >
        <SkipIcon />
      </button>
    </div>
  );
}
