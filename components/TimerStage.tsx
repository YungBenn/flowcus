"use client";

import { useTimerContext } from "@/context/TimerContext";
import { useAudioContext } from "@/context/AudioContext";
import { useTheme } from "@/context/ThemeContext";
import { getStyle } from "@/lib/timerStyles/registry";

const VIGNETTES = {
  dark: "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.35) 100%)",
  light:
    "radial-gradient(ellipse at center, transparent 42%, rgba(160, 150, 185, 0.16) 100%)",
} as const;

export function TimerStage({ styleId }: { styleId: string }) {
  const { progress, phase, mode, status } = useTimerContext();
  const { getAmplitude } = useAudioContext();
  const { theme } = useTheme();
  const Renderer = getStyle(styleId).component;

  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <Renderer
        progress={progress}
        phase={phase}
        mode={mode}
        status={status}
        getAmplitude={getAmplitude}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: VIGNETTES[theme] }}
        aria-hidden
      />
    </div>
  );
}
