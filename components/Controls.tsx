"use client";

import { useTimerContext } from "@/context/TimerContext";
import { PauseIcon, PlayIcon, ResetIcon, SkipIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export function Controls() {
  const { status, toggle, reset, skip, mode } = useTimerContext();
  const isRunning = status === "running";

  // Step up 1px on hover, sink 1px and scale .985 on press (taste-skill motion layer).
  const motion =
    "transition-[transform,background-color,border-color,color] duration-150 ease-[cubic-bezier(.2,.8,.2,1)] hover:-translate-y-px active:translate-y-px active:scale-[.985] active:duration-[90ms] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

  const secondaryButtonClass = cn(
    "grid size-12 place-items-center rounded-full border border-border bg-card text-foreground/80 hover:border-foreground/25 hover:bg-muted hover:text-foreground",
    motion,
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
          "grid size-16 place-items-center rounded-full bg-foreground text-background hover:bg-[color-mix(in_oklab,var(--foreground),var(--background)_14%)]",
          motion,
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
