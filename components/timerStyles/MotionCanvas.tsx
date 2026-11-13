"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { useAudioContext } from "@/context/AudioContext";
import { useTheme } from "@/context/ThemeContext";
import type { TimerStyleProps } from "@/lib/timerStyles/types";
import { CANVAS_BG, type Theme } from "@/lib/theme";

const MOTION_THRESHOLD = 0.02;

/** What every 3D motion scene gets from the shared canvas shell. */
export interface MotionScene {
  /** 0..1, eases to 1 while the timer runs or music plays, winds down to 0 otherwise. */
  motionRef: RefObject<number>;
  /** Smoothed audio amplitude, 0..1 (decays to 0 when nothing plays). */
  ampRef: RefObject<number>;
  /** 0.5..1, lowered by PerformanceMonitor on slow devices. */
  quality: number;
  theme: Theme;
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

function usePageVisible(): boolean {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  return visible;
}

function InvalidateOnChange({
  progress,
  phase,
  status,
}: Pick<TimerStyleProps, "progress" | "phase" | "status">) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    invalidate();
  }, [progress, phase, status, invalidate]);
  return null;
}

/** Eases the shared motion/amplitude signals and reports wind-down changes. */
function MotionDriver({
  status,
  isPlaying,
  getAmplitude,
  reduced,
  motionRef,
  ampRef,
  onWindDownChange,
}: {
  status: TimerStyleProps["status"];
  isPlaying: boolean;
  getAmplitude: () => number;
  reduced: boolean;
  motionRef: RefObject<number>;
  ampRef: RefObject<number>;
  onWindDownChange: (winding: boolean) => void;
}) {
  const winding = useRef(false);

  useFrame((_, delta) => {
    const motionTarget =
      !reduced && (isPlaying || status === "running") ? 1 : 0;
    const rate = motionTarget > motionRef.current ? 6 : 1.8;
    motionRef.current = THREE.MathUtils.lerp(
      motionRef.current,
      motionTarget,
      Math.min(1, delta * rate),
    );

    const ampTarget = isPlaying ? getAmplitude() : 0;
    const ampRate = isPlaying ? 6 : 3;
    ampRef.current += (ampTarget - ampRef.current) * Math.min(1, delta * ampRate);

    const nowWinding = motionRef.current > MOTION_THRESHOLD;
    if (nowWinding !== winding.current) {
      winding.current = nowWinding;
      onWindDownChange(nowWinding);
    }
  });
  return null;
}

/**
 * Shared R3F canvas for every 3D timer motion: renders on demand while idle,
 * continuously while running/playing (plus a wind-down tail), never while the
 * tab is hidden, and drops DPR/quality on slow devices.
 */
export function MotionCanvas({
  progress,
  phase,
  status,
  getAmplitude,
  children,
}: Omit<TimerStyleProps, "mode"> & {
  children: (scene: MotionScene) => ReactNode;
}) {
  const reduced = useReducedMotion();
  const visible = usePageVisible();
  const { isPlaying } = useAudioContext();
  const { theme } = useTheme();
  const [quality, setQuality] = useState(1);
  const [windingDown, setWindingDown] = useState(false);
  const motionRef = useRef(0);
  const ampRef = useRef(0);

  const needsAnimation = status === "running" || isPlaying;
  const frameloop =
    !visible ? "never" : needsAnimation || windingDown ? "always" : "demand";

  useEffect(() => {
    if (!needsAnimation && motionRef.current > MOTION_THRESHOLD) {
      setWindingDown(true);
    }
  }, [needsAnimation]);

  const handleDecline = useCallback(() => {
    setQuality((q) => Math.max(0.5, q - 0.25));
  }, []);
  const handleIncline = useCallback(() => {
    setQuality((q) => Math.min(1, q + 0.25));
  }, []);

  return (
    <Canvas
      frameloop={frameloop}
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, quality >= 0.75 ? 1.5 : 1]}
      performance={{ min: 0.5, max: 1, debounce: 400 }}
      gl={{
        antialias: true,
        alpha: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
      }}
      className="!absolute inset-0"
    >
      <PerformanceMonitor onDecline={handleDecline} onIncline={handleIncline} />
      {frameloop === "demand" && (
        <InvalidateOnChange progress={progress} phase={phase} status={status} />
      )}
      <AdaptiveDpr />
      <MotionDriver
        status={status}
        isPlaying={isPlaying}
        getAmplitude={getAmplitude}
        reduced={reduced}
        motionRef={motionRef}
        ampRef={ampRef}
        onWindDownChange={setWindingDown}
      />
      <color attach="background" args={[CANVAS_BG[theme]]} />
      {children({ motionRef, ampRef, quality, theme })}
    </Canvas>
  );
}
