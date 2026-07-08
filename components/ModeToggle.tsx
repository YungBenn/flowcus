"use client";

import { useTimerContext } from "@/context/TimerContext";
import type { TimerMode } from "@/lib/timer/types";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const MODES: { id: TimerMode; label: string }[] = [
  { id: "pomodoro", label: "Pomodoro" },
  { id: "deepwork", label: "Deep Work" },
];

export function ModeToggle() {
  const { mode, setMode } = useTimerContext();

  return (
    <div className="rounded-xl border border-border/60 bg-card p-1 shadow-sm">
      <ToggleGroup
        value={mode ? [mode] : []}
        onValueChange={(values) => {
          const next = values[0] as TimerMode | undefined;
          if (next) setMode(next);
        }}
        spacing={0}
        className="w-full rounded-full bg-muted/50 p-0.5"
        aria-label="Timer mode"
      >
        {MODES.map((m) => (
          <ToggleGroupItem
            key={m.id}
            value={m.id}
            className="!rounded-full flex-1 border-0 px-4 py-1.5 text-center text-sm font-medium text-muted-foreground shadow-none transition-all hover:bg-transparent hover:text-foreground focus-visible:ring-2 aria-pressed:bg-white/10 aria-pressed:font-semibold aria-pressed:text-foreground aria-pressed:shadow-sm data-pressed:bg-white/10 data-pressed:font-semibold data-pressed:text-foreground data-pressed:shadow-sm"
          >
            {m.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
