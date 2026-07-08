"use client";

import { useEffect } from "react";
import { useTimerContext } from "@/context/TimerContext";
import { useAudioContext } from "@/context/AudioContext";
import { useTheme } from "@/context/ThemeContext";
import { saveState } from "@/lib/persistence";

const ACCENTS = {
  focus: { a1: "#f97362", a2: "#f5b04c" },
  break: { a1: "#38bdf8", a2: "#34d3a6" },
};

/**
 * Side-effect only: persists user state and keeps the CSS accent variables in
 * sync with the current phase so the whole UI shifts warm (focus) or cool (break).
 */
export function AppSync({ styleId }: { styleId: string }) {
  const { settings, mode, phase } = useTimerContext();
  const { volume, currentTrackId } = useAudioContext();
  const { theme } = useTheme();

  useEffect(() => {
    saveState({
      settings,
      mode,
      styleId,
      volume,
      trackId: currentTrackId,
      theme,
    });
  }, [settings, mode, styleId, volume, currentTrackId, theme]);

  useEffect(() => {
    const accent = phase === "break" ? ACCENTS.break : ACCENTS.focus;
    const root = document.documentElement;
    root.style.setProperty("--accent-1", accent.a1);
    root.style.setProperty("--accent-2", accent.a2);
  }, [phase]);

  return null;
}
