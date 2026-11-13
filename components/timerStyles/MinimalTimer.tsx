"use client";

import { useTheme } from "@/context/ThemeContext";
import type { TimerStyleProps } from "@/lib/timerStyles/types";
import { cn } from "@/lib/utils";

// Drawn in a fixed 200x200 user space and scaled by CSS, so one set of
// numbers holds at every viewport size.
const RADIUS = 98;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * A single hairline ring that depletes as the phase elapses. No ambient
 * motion in any state, and no reaction to audio - stillness is the point,
 * which also means there is nothing for prefers-reduced-motion to turn off.
 */
export function MinimalTimer({ progress, status }: TimerStyleProps) {
  const isDark = useTheme().theme === "dark";

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <svg
        viewBox="0 0 200 200"
        className={cn(
          // -rotate-90 starts the arc at 12 o'clock.
          "size-[min(86vmin,36rem)] -rotate-90 transition-opacity duration-500",
          status === "paused" ? "opacity-40" : "opacity-100",
        )}
        aria-hidden
      >
        <circle
          cx="100"
          cy="100"
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.45"
          className={isDark ? "text-white/10" : "text-foreground/10"}
        />
        <circle
          cx="100"
          cy="100"
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.7"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * progress}
          className={isDark ? "text-white/70" : "text-foreground/45"}
        />
      </svg>
    </div>
  );
}
