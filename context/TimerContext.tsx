"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useTimer, type UseTimerResult, type PhaseCompleteInfo } from "@/hooks/useTimer";
import type { TimerMode, TimerSettings } from "@/lib/timer/types";

const TimerContext = createContext<UseTimerResult | null>(null);

interface TimerProviderProps {
  children: ReactNode;
  initialSettings?: TimerSettings;
  initialMode?: TimerMode;
  onPhaseComplete?: (info: PhaseCompleteInfo) => void;
}

export function TimerProvider({
  children,
  initialSettings,
  initialMode,
  onPhaseComplete,
}: TimerProviderProps) {
  const timer = useTimer({ initialSettings, initialMode, onPhaseComplete });
  return <TimerContext.Provider value={timer}>{children}</TimerContext.Provider>;
}

export function useTimerContext(): UseTimerResult {
  const ctx = useContext(TimerContext);
  if (!ctx) {
    throw new Error("useTimerContext must be used within a TimerProvider");
  }
  return ctx;
}
