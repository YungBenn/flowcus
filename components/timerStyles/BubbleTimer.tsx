"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { TimerStyleProps } from "@/lib/timerStyles/types";
import {
  MotionCanvas,
  type MotionScene,
} from "@/components/timerStyles/MotionCanvas";
import {
  createFluidBlobMaterial,
  FLUID_POINT_LIGHT,
} from "@/components/timerStyles/fluidBlobShader";

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
        // Clamp: after an idle stretch in demand mode delta can be seconds,
        // and an unclamped factor overshoots (huge or negative blob).
        THREE.MathUtils.lerp(meshRef.current.scale.x, scale, Math.min(1, delta * 6)),
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

function FluidBlobs({ motionRef, ampRef, quality, theme }: MotionScene) {
  const geometryDetail = quality >= 0.75 ? 28 : 20;

  return (
    <>
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
        ampRef={ampRef}
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
        ampRef={ampRef}
        floatSpeed={0.85}
        floatIntensity={0.4}
        rotationIntensity={0.18}
        theme={theme}
      />
    </>
  );
}

export function BubbleTimer(props: TimerStyleProps) {
  return (
    <MotionCanvas {...props}>{(scene) => <FluidBlobs {...scene} />}</MotionCanvas>
  );
}
