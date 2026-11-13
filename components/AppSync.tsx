"use client";

import { useEffect } from "react";
import { useTimerContext } from "@/context/TimerContext";
import { useAudioContext } from "@/context/AudioContext";
import { useTheme } from "@/context/ThemeContext";
import { saveState } from "@/lib/persistence";

const ACCENTS = {
  focus: "#f97362",
  break: "#38bdf8",
};

/**
 * Side-effect only: persists user state and keeps the CSS accent variables in
 * sync with the current phase: warm (focus) or cool (break).
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
    document.documentElement.style.setProperty("--accent-1", ACCENTS[phase]);
  }, [phase]);

  return null;
}
