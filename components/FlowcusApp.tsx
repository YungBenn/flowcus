"use client";

import { useMemo, useState } from "react";
import { TimerProvider } from "@/context/TimerContext";
import { AudioProvider } from "@/context/AudioContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { TimerDisplay } from "@/components/TimerDisplay";
import { Controls } from "@/components/Controls";
import { ModeToggle } from "@/components/ModeToggle";
import { SoundPanel } from "@/components/SoundPanel";
import { TimerStage } from "@/components/TimerStage";
import { SettingsSheet } from "@/components/SettingsSheet";
import { ThemeToggle } from "@/components/ThemeToggle";
import { VisualStyleToggle } from "@/components/VisualStyleToggle";
import { AppSync } from "@/components/AppSync";
import { loadState } from "@/lib/persistence";
import { playChime } from "@/lib/audio/chime";

export function FlowcusApp() {
  const initial = useMemo(() => loadState(), []);
  const [styleId, setStyleId] = useState(initial.styleId);

  return (
    <ThemeProvider initialTheme={initial.theme}>
      <AudioProvider
        initialVolume={initial.volume}
        initialTrackId={initial.trackId}
      >
        <TimerProvider
          initialSettings={initial.settings}
          initialMode={initial.mode}
          onPhaseComplete={() => playChime()}
        >
          <AppSync styleId={styleId} />

          <main className="relative flex h-dvh w-full flex-col items-center justify-center overflow-hidden">
            <TimerStage styleId={styleId} />

            <div className="absolute left-6 top-6 z-20">
              <SoundPanel />
            </div>

            <div className="absolute left-1/2 top-6 z-20 -translate-x-1/2">
              <ModeToggle />
            </div>

            <div className="absolute right-6 top-6 z-20 flex items-center gap-1">
              <ThemeToggle />
              <VisualStyleToggle
                styleId={styleId}
                onStyleChange={setStyleId}
              />
              <SettingsSheet />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-12">
              <TimerDisplay />
              <Controls />
            </div>
          </main>
        </TimerProvider>
      </AudioProvider>
    </ThemeProvider>
  );
}
