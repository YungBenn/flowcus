import type { ComponentType } from "react";
import type { TimerMode, TimerPhase, TimerStatus } from "@/lib/timer/types";

/** Props every timer-style renderer receives. */
export interface TimerStyleProps {
  /** Elapsed fraction of the current phase, 0..1. */
  progress: number;
  phase: TimerPhase;
  mode: TimerMode;
  status: TimerStatus;
  /** Reads the current normalized audio amplitude (0..1). Stable identity. */
  getAmplitude: () => number;
}

export interface TimerStyleRenderer {
  id: string;
  label: string;
  component: ComponentType<TimerStyleProps>;
}
