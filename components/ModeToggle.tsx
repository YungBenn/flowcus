"use client";

import { useTimerContext } from "@/context/TimerContext";
import type { TimerMode } from "@/lib/timer/types";
import { chromePad, chromeRow, chromeSegment, chromeShell } from "@/lib/chrome";
import { cn } from "@/lib/utils";

const MODES: { id: TimerMode; label: string }[] = [
  { id: "pomodoro", label: "Pomodoro" },
  { id: "deepwork", label: "Deep Work" },
];

export function ModeToggle() {
  const { mode, setMode } = useTimerContext();

  return (
    <div
      role="tablist"
      aria-label="Timer mode"
      className={cn(chromeShell, chromeRow, chromePad, "gap-0.5")}
    >
      {MODES.map((m) => {
        const active = mode === m.id;
        return (
          <button
            key={m.id}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => setMode(m.id)}
            className={cn(
              "h-full px-4 text-[13px] font-medium whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              chromeSegment,
              active
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
