"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getNextPhase,
  getPhaseDurationMs,
  isFocusPhase,
} from "@/lib/timer/machine";
import type {
  TimerMode,
  TimerPhase,
  TimerSettings,
  TimerStatus,
} from "@/lib/timer/types";
import { DEFAULT_SETTINGS } from "@/lib/timer/types";

export interface PhaseCompleteInfo {
  completedPhase: TimerPhase;
  nextPhase: TimerPhase;
  mode: TimerMode;
}

interface UseTimerOptions {
  initialSettings?: TimerSettings;
  initialMode?: TimerMode;
  onPhaseComplete?: (info: PhaseCompleteInfo) => void;
}

export interface UseTimerResult {
  mode: TimerMode;
  phase: TimerPhase;
  status: TimerStatus;
  settings: TimerSettings;
  /** Milliseconds remaining in the current phase. */
  remainingMs: number;
  /** Total milliseconds of the current phase. */
  durationMs: number;
  /** Elapsed fraction of the current phase, 0 (fresh) to 1 (complete). */
  progress: number;
  /** Number of completed focus phases this session. */
  cyclesCompleted: number;
  start: () => void;
  pause: () => void;
  toggle: () => void;
  reset: () => void;
  skip: () => void;
  setMode: (mode: TimerMode) => void;
  updateSettings: (patch: Partial<TimerSettings>) => void;
}

export function useTimer(options: UseTimerOptions = {}): UseTimerResult {
  const { initialSettings, initialMode, onPhaseComplete } = options;

  const [settings, setSettings] = useState<TimerSettings>(
    initialSettings ?? DEFAULT_SETTINGS,
  );
  const [mode, setModeState] = useState<TimerMode>(initialMode ?? "pomodoro");
  const [phase, setPhase] = useState<TimerPhase>("focus");
  const [status, setStatus] = useState<TimerStatus>("idle");

  const durationMs = getPhaseDurationMs(settings, mode, phase);
  const [remainingMs, setRemainingMs] = useState<number>(durationMs);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);

  // Wall-clock target so accuracy survives background tab throttling.
  const endTimeRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onPhaseComplete);
  // Latest values readable inside the rAF loop without re-subscribing.
  const stateRef = useRef({ mode, phase, settings });

  useEffect(() => {
    onCompleteRef.current = onPhaseComplete;
  }, [onPhaseComplete]);

  useEffect(() => {
    stateRef.current = { mode, phase, settings };
  }, [mode, phase, settings]);

  // Advances to the next phase; sets up the next run when auto-start is on.
  const advancePhase = useCallback(() => {
    const { mode: m, phase: p, settings: s } = stateRef.current;
    const next = getNextPhase(m, p);
    if (isFocusPhase(p)) {
      setCyclesCompleted((c) => c + 1);
    }
    onCompleteRef.current?.({ completedPhase: p, nextPhase: next, mode: m });

    const nextDuration = getPhaseDurationMs(s, m, next);
    setPhase(next);
    setRemainingMs(nextDuration);

    if (s.autoStartNext) {
      endTimeRef.current = Date.now() + nextDuration;
      setStatus("running");
    } else {
      endTimeRef.current = null;
      setStatus("idle");
    }
  }, []);

  const start = useCallback(() => {
    endTimeRef.current =
      Date.now() +
      (endTimeRef.current !== null
        ? Math.max(0, endTimeRef.current - Date.now())
        : remainingMs);
    setStatus("running");
  }, [remainingMs]);

  const pause = useCallback(() => {
    if (endTimeRef.current !== null) {
      setRemainingMs(Math.max(0, endTimeRef.current - Date.now()));
    }
    endTimeRef.current = null;
    setStatus((prev) => (prev === "running" ? "paused" : prev));
  }, []);

  const toggle = useCallback(() => {
    if (status === "running") pause();
    else start();
  }, [status, start, pause]);

  const reset = useCallback(() => {
    endTimeRef.current = null;
    setStatus("idle");
    setRemainingMs(
      getPhaseDurationMs(
        stateRef.current.settings,
        stateRef.current.mode,
        stateRef.current.phase,
      ),
    );
  }, []);

  const skip = useCallback(() => {
    endTimeRef.current = null;
    advancePhase();
  }, [advancePhase]);

  const setMode = useCallback((next: TimerMode) => {
    endTimeRef.current = null;
    setModeState(next);
    setPhase("focus");
    setStatus("idle");
    setCyclesCompleted(0);
    setRemainingMs(getPhaseDurationMs(stateRef.current.settings, next, "focus"));
  }, []);

  const updateSettings = useCallback(
    (patch: Partial<TimerSettings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...patch };
        if (status !== "running") {
          setRemainingMs(
            getPhaseDurationMs(next, stateRef.current.mode, stateRef.current.phase),
          );
          if (status === "idle") endTimeRef.current = null;
        }
        return next;
      });
    },
    [status],
  );

  // Drive the countdown while running. Defined entirely inside the effect so
  // there is no self-referential callback and refs are read, not written, here.
  useEffect(() => {
    if (status !== "running") return;
    let raf = 0;
    const loop = () => {
      if (endTimeRef.current === null) return;
      const remaining = endTimeRef.current - Date.now();
      if (remaining <= 0) {
        advancePhase();
        // Auto-start leaves endTimeRef set, so we roll straight on.
        if (endTimeRef.current !== null) {
          raf = requestAnimationFrame(loop);
        }
        return;
      }
      setRemainingMs(remaining);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [status, advancePhase]);

  const progress = durationMs > 0 ? 1 - remainingMs / durationMs : 0;

  return {
    mode,
    phase,
    status,
    settings,
    remainingMs,
    durationMs,
    progress: Math.min(1, Math.max(0, progress)),
    cyclesCompleted,
    start,
    pause,
    toggle,
    reset,
    skip,
    setMode,
    updateSettings,
  };
}
