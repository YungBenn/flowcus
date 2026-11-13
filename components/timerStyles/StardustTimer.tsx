"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { TimerStyleProps } from "@/lib/timerStyles/types";
import type { Theme } from "@/lib/theme";
import {
  MotionCanvas,
  type MotionScene,
} from "@/components/timerStyles/MotionCanvas";

const COUNT = 7000;
const ARMS = 3;
const MAX_RADIUS = 2.4;

const PALETTES: Record<Theme, { core: string; edge: string; blending: THREE.Blending }> = {
  // Additive light reads as glow on a dark sky...
  dark: { core: "#ffd6a8", edge: "#7c6cff", blending: THREE.AdditiveBlending },
  // ...but washes out to white on a light one, so plain alpha there.
  light: { core: "#e8875c", edge: "#7a6ad8", blending: THREE.NormalBlending },
};

const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uAmp;
uniform float uPixelRatio;
attribute float aRadius;
attribute float aAngle;
attribute float aSeed;
varying float vMix;
varying float vSeed;

void main() {
  float r = aRadius;
  // Rigid spin keeps the arms intact; the small wobble keeps it alive.
  float angle = aAngle + uTime * 0.06 + 0.04 * sin(uTime * 0.4 + aSeed * 6.2831);
  // Amplitude sends a ripple travelling outward through the disc.
  r *= 1.0 + 0.07 * uAmp * sin(r * 5.0 - uTime * 2.5);
  vec3 pos = vec3(cos(angle) * r, position.y * (1.0 + uAmp * 0.6), sin(angle) * r);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  float twinkle = 0.7 + 0.3 * sin(uTime * 2.0 + aSeed * 40.0);
  gl_PointSize = (4.0 + aSeed * 9.0) * twinkle * (1.0 + uAmp * 0.5) * uPixelRatio * (3.0 / -mv.z);

  vMix = r / ${MAX_RADIUS.toFixed(1)};
  vSeed = aSeed;
}
`;

const fragmentShader = /* glsl */ `
uniform vec3 uCore;
uniform vec3 uEdge;
varying float vMix;
varying float vSeed;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  vec3 col = mix(uCore, uEdge, smoothstep(0.0, 0.7, vMix + (vSeed - 0.5) * 0.25));
  // Dimmed core so the numerals sitting on top of it stay readable.
  float core = 0.35 + 0.65 * smoothstep(0.05, 0.3, vMix);
  gl_FragColor = vec4(col, a * a * (0.7 - vMix * 0.3) * core);
  #include <colorspace_fragment>
}
`;

function buildGalaxy(): THREE.BufferGeometry {
  const height = new Float32Array(COUNT * 3);
  const radius = new Float32Array(COUNT);
  const angle = new Float32Array(COUNT);
  const seed = new Float32Array(COUNT);
  const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

  for (let i = 0; i < COUNT; i++) {
    const r = 0.08 + Math.pow(Math.random(), 1.7) * MAX_RADIUS;
    const arm = (i % ARMS) * ((Math.PI * 2) / ARMS);
    // Scatter widens near the core so it blooms instead of forming hard arms.
    radius[i] = r;
    angle[i] = arm + r * 2.1 + gauss() * (0.14 + 0.3 / (r + 0.4));
    height[i * 3 + 1] = gauss() * 0.12 * (1 - r / (MAX_RADIUS + 0.4));
    seed[i] = Math.random();
  }

  const geometry = new THREE.BufferGeometry();
  // Only y is read from position; x/z come from radius + angle in the shader.
  geometry.setAttribute("position", new THREE.BufferAttribute(height, 3));
  geometry.setAttribute("aRadius", new THREE.BufferAttribute(radius, 1));
  geometry.setAttribute("aAngle", new THREE.BufferAttribute(angle, 1));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), MAX_RADIUS * 1.2);
  return geometry;
}

function Galaxy({ motionRef, ampRef, theme }: MotionScene) {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>>(null);
  const geometry = useMemo(() => buildGalaxy(), []);
  const palette = PALETTES[theme];

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uAmp: { value: 0 },
          uPixelRatio: { value: 1 },
          uCore: { value: new THREE.Color(palette.core) },
          uEdge: { value: new THREE.Color(palette.edge) },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: palette.blending,
      }),
    [palette],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  useFrame((state, delta) => {
    const u = pointsRef.current?.material.uniforms;
    if (!u) return;
    u.uTime.value += Math.min(delta, 0.1) * motionRef.current;
    u.uAmp.value = ampRef.current;
    u.uPixelRatio.value = state.gl.getPixelRatio();
    // Shrink on portrait screens so the disc is not cropped.
    groupRef.current?.scale.setScalar(0.82 * Math.min(1, state.viewport.aspect * 1.4));
  });

  return (
    <group ref={groupRef} rotation={[0.95, 0, 0.35]}>
      <points ref={pointsRef} geometry={geometry} material={material} />
    </group>
  );
}

export function StardustTimer(props: TimerStyleProps) {
  return <MotionCanvas {...props}>{(scene) => <Galaxy {...scene} />}</MotionCanvas>;
}
