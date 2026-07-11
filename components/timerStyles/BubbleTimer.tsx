"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { useAudioContext } from "@/context/AudioContext";
import { useTheme } from "@/context/ThemeContext";
import type { TimerStyleProps } from "@/lib/timerStyles/types";
import { CANVAS_BG } from "@/lib/theme";
import {
  createFluidBlobMaterial,
  FLUID_POINT_LIGHT,
} from "@/components/timerStyles/fluidBlobShader";

const MOTION_THRESHOLD = 0.02;

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

function MotionWindDown({
  motionRef,
  onWindDownChange,
}: {
  motionRef: RefObject<number>;
  onWindDownChange: (winding: boolean) => void;
}) {
  const prev = useRef(false);
  useFrame(() => {
    const winding = (motionRef.current ?? 0) > MOTION_THRESHOLD;
    if (winding !== prev.current) {
      prev.current = winding;
      onWindDownChange(winding);
    }
  });
  return null;
}

interface FluidBlobProps {
  position: [number, number, number];
  radius: number;
  hotSpot: [number, number];
  phaseOffset: number;
  geometryDetail: number;
  motionRef: RefObject<number>;
  ampRef: RefObject<number>;
  floatSpeed: number;
  floatIntensity: number;
  rotationIntensity: number;
  theme: "light" | "dark";
}

function FluidBlob({
  position,
  radius,
  hotSpot,
  phaseOffset,
  geometryDetail,
  motionRef,
  ampRef,
  floatSpeed,
  floatIntensity,
  rotationIntensity,
  theme,
}: FluidBlobProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const hotSpotX = hotSpot[0];
  const hotSpotY = hotSpot[1];
  const basePosition = useMemo(() => new THREE.Vector3(...position), [position]);

  const material = useMemo(
    () => createFluidBlobMaterial(theme, [hotSpotX, hotSpotY], phaseOffset),
    [theme, hotSpotX, hotSpotY, phaseOffset],
  );

  useEffect(() => () => material.dispose(), [material]);

  useFrame((state, delta) => {
    const mat = meshRef.current?.material;
    if (!(mat instanceof THREE.ShaderMaterial)) return;

    const motion = motionRef.current ?? 0;
    const amplitude = ampRef.current ?? 0;
    const t = state.clock.elapsedTime;

    mat.uniforms.uTime.value = t;
    mat.uniforms.uDistort.value = 0.2 + motion * (0.18 + amplitude * 0.35);

    if (meshRef.current) {
      const scale = radius * (1 + motion * amplitude * 0.1);
      meshRef.current.scale.setScalar(
        THREE.MathUtils.lerp(meshRef.current.scale.x, scale, delta * 6),
      );

      meshRef.current.position.set(
        basePosition.x +
          Math.sin(t * floatSpeed + phaseOffset) * 0.06 * motion * floatIntensity,
        basePosition.y +
          Math.cos(t * floatSpeed * 0.85 + phaseOffset) *
            0.05 *
            motion *
            floatIntensity,
        basePosition.z,
      );
      meshRef.current.rotation.y += delta * rotationIntensity * motion * 0.15;
      meshRef.current.rotation.z +=
        delta * rotationIntensity * motion * 0.04 * Math.sin(t * 0.5 + phaseOffset);
    }
  });

  return (
    <mesh ref={meshRef} position={position} material={material}>
      <icosahedronGeometry args={[1, geometryDetail]} key={geometryDetail} />
    </mesh>
  );
}

interface FluidBlobsProps {
  status: TimerStyleProps["status"];
  isPlaying: boolean;
  getAmplitude: () => number;
  reduced: boolean;
  quality: number;
  motionRef: RefObject<number>;
  theme: "light" | "dark";
}

function FluidBlobs({
  status,
  isPlaying,
  getAmplitude,
  reduced,
  quality,
  motionRef,
  theme,
}: FluidBlobsProps) {
  const smoothAmp = useRef(0);
  const geometryDetail = quality >= 0.75 ? 28 : 20;

  useFrame((_, delta) => {
    const motionTarget =
      !reduced && (isPlaying || status === "running") ? 1 : 0;
    const rate = motionTarget > (motionRef.current ?? 0) ? 6 : 1.8;
    motionRef.current = THREE.MathUtils.lerp(
      motionRef.current ?? 0,
      motionTarget,
      Math.min(1, delta * rate),
    );

    if (isPlaying) {
      const amp = getAmplitude();
      smoothAmp.current += (amp - smoothAmp.current) * Math.min(1, delta * 6);
    } else {
      smoothAmp.current = THREE.MathUtils.lerp(
        smoothAmp.current,
        0,
        Math.min(1, delta * 3),
      );
    }
  });

  return (
    <>
      <color attach="background" args={[CANVAS_BG[theme]]} />
      <ambientLight intensity={theme === "light" ? 0.5 : 0.35} />
      <pointLight
        position={[2, 3, 4]}
        intensity={12}
        distance={20}
        color={FLUID_POINT_LIGHT[theme]}
      />

      <FluidBlob
        position={[-1.05, 0.6, 0]}
        radius={1.35}
        hotSpot={[-0.3, -0.4]}
        phaseOffset={0}
        geometryDetail={geometryDetail}
        motionRef={motionRef}
        ampRef={smoothAmp}
        floatSpeed={1.1}
        floatIntensity={0.55}
        rotationIntensity={0.25}
        theme={theme}
      />
      <FluidBlob
        position={[1.0, -0.65, 0.15]}
        radius={0.72}
        hotSpot={[-0.2, 0.1]}
        phaseOffset={1.7}
        geometryDetail={geometryDetail}
        motionRef={motionRef}
        ampRef={smoothAmp}
        floatSpeed={0.85}
        floatIntensity={0.4}
        rotationIntensity={0.18}
        theme={theme}
      />
    </>
  );
}

function Scene({
  progress,
  phase,
  status,
  getAmplitude,
  isPlaying,
  reduced,
  quality,
  demandMode,
  motionRef,
  onWindDownChange,
  theme,
}: {
  progress: number;
  phase: TimerStyleProps["phase"];
  status: TimerStyleProps["status"];
  getAmplitude: TimerStyleProps["getAmplitude"];
  isPlaying: boolean;
  reduced: boolean;
  quality: number;
  demandMode: boolean;
  motionRef: RefObject<number>;
  onWindDownChange: (winding: boolean) => void;
  theme: "light" | "dark";
}) {
  return (
    <>
      {demandMode && (
        <InvalidateOnChange progress={progress} phase={phase} status={status} />
      )}
      <AdaptiveDpr />
      <MotionWindDown motionRef={motionRef} onWindDownChange={onWindDownChange} />
      <FluidBlobs
        status={status}
        isPlaying={isPlaying}
        getAmplitude={getAmplitude}
        reduced={reduced}
        quality={quality}
        motionRef={motionRef}
        theme={theme}
      />
    </>
  );
}

export function BubbleTimer({
  progress,
  phase,
  status,
  getAmplitude,
}: TimerStyleProps) {
  const reduced = useReducedMotion();
  const visible = usePageVisible();
  const { isPlaying } = useAudioContext();
  const { theme } = useTheme();
  const [quality, setQuality] = useState(1);
  const [windingDown, setWindingDown] = useState(false);
  const motionRef = useRef(0);

  const needsAnimation = status === "running" || isPlaying;
  const frameloop =
    !visible ? "never" : needsAnimation || windingDown ? "always" : "demand";
  const demandMode = frameloop === "demand";

  const handleWindDownChange = useCallback((winding: boolean) => {
    setWindingDown(winding);
  }, []);

  useEffect(() => {
    if (!needsAnimation && (motionRef.current ?? 0) > MOTION_THRESHOLD) {
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
      dpr={[1, 1.5]}
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
      <Scene
        progress={progress}
        phase={phase}
        status={status}
        getAmplitude={getAmplitude}
        isPlaying={isPlaying}
        reduced={reduced}
        quality={quality}
        demandMode={demandMode}
        motionRef={motionRef}
        onWindDownChange={handleWindDownChange}
        theme={theme}
      />
    </Canvas>
  );
}
