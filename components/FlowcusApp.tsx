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
import { TopBarActions } from "@/components/TopBarActions";
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

            <header className="absolute inset-x-0 top-0 z-20 grid grid-cols-[1fr_auto] items-start gap-4 sm:grid-cols-[1fr_auto_1fr] px-6 pt-6">
              <div className="min-w-0 w-full justify-self-start">
                <SoundPanel />
              </div>
              {/* Own row on phones: three columns cannot fit the sound pill. */}
              <div className="col-span-2 row-start-2 justify-self-center sm:col-span-1 sm:col-start-2 sm:row-start-1">
                <ModeToggle />
              </div>
              <div className="justify-self-end">
                <TopBarActions
                  styleId={styleId}
                  onStyleChange={setStyleId}
                />
              </div>
            </header>

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
