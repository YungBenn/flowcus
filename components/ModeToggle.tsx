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
              "h-full px-3 text-xs font-medium whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              chromeSegment,
              active
                ? "bg-white font-semibold text-foreground shadow-sm dark:bg-white/10"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
