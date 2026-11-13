"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { TimerStyleProps } from "@/lib/timerStyles/types";
import type { Theme } from "@/lib/theme";
import {
  MotionCanvas,
  type MotionScene,
} from "@/components/timerStyles/MotionCanvas";

/**
 * Fullscreen-shader motions: one quad, one draw call, no geometry. Each
 * motion is just a fragment shader plus a light/dark palette of vec3 uniforms.
 *
 * Shared uniforms: uTime (advances only while there is motion, so it eases to a
 * stop), uAmp (0..1 smoothed music amplitude), uAspect, uProgress (0..1 phase).
 */

const VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const COMMON = /* glsl */ `
uniform float uTime;
uniform float uAmp;
uniform float uAspect;
uniform float uProgress;
varying vec2 vUv;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 r = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = r * p * 2.02;
    a *= 0.5;
  }
  return v;
}
`;

/** uniform name -> hex colour (vec3) or plain number (float). */
type Palette = Record<string, string | number>;

interface ShaderMotionSpec {
  /** GLSL with palette uniform declarations and main(); COMMON is prepended. */
  fragment: string;
  /** Same keys for both themes. */
  palettes: Record<Theme, Palette>;
}

function ShaderPlane({
  spec,
  progress,
  motionRef,
  ampRef,
  theme,
}: MotionScene & { spec: ShaderMotionSpec; progress: number }) {
  const invalidate = useThree((s) => s.invalidate);
  const meshRef = useRef<THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>>(null);

  // Parsed once; useFrame assigns the active theme's values by reference.
  const palettes = useMemo(() => {
    const parse = (palette: Palette) =>
      Object.fromEntries(
        Object.entries(palette).map(([key, value]) => [
          key,
          typeof value === "string" ? new THREE.Color(value) : value,
        ]),
      );
    return { dark: parse(spec.palettes.dark), light: parse(spec.palettes.light) };
  }, [spec]);

  const material = useMemo(() => {
    const uniforms: Record<string, THREE.IUniform> = {
      uTime: { value: 0 },
      uAmp: { value: 0 },
      uAspect: { value: 1 },
      uProgress: { value: 0 },
    };
    for (const [key, value] of Object.entries(palettes.dark)) {
      uniforms[key] = { value };
    }
    return new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERTEX,
      fragmentShader: COMMON + spec.fragment,
      depthTest: false,
      depthWrite: false,
    });
  }, [spec, palettes]);

  useEffect(() => () => material.dispose(), [material]);

  // Theme flips while idle still need one fresh frame.
  useEffect(() => invalidate(), [theme, invalidate]);

  useFrame((state, delta) => {
    const u = meshRef.current?.material.uniforms;
    if (!u) return;
    for (const [key, value] of Object.entries(palettes[theme])) {
      u[key].value = value;
    }
    // Clamp: the first frame after a long on-demand idle can carry a huge delta.
    u.uTime.value += Math.min(delta, 0.1) * motionRef.current;
    u.uAmp.value = ampRef.current;
    u.uAspect.value = state.size.width / state.size.height;
    u.uProgress.value = progress;
  });

  return (
    <mesh ref={meshRef} material={material} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}

function createShaderMotion(spec: ShaderMotionSpec) {
  return function ShaderMotion(props: TimerStyleProps) {
    return (
      <MotionCanvas {...props}>
        {(scene) => (
          <ShaderPlane {...scene} spec={spec} progress={props.progress} />
        )}
      </MotionCanvas>
    );
  };
}

/** Northern-lights curtains over a starry sky; amplitude brightens and lifts them. */
export const AuroraTimer = createShaderMotion({
  palettes: {
    dark: {
      uSkyLow: "#0e1733",
      uSkyHigh: "#05060f",
      uAuroraLow: "#3ef0a8",
      uAuroraHigh: "#7c5cff",
      uStar: "#c8d2ff",
      uIntensity: 1,
    },
    light: {
      uSkyLow: "#ede4f2",
      uSkyHigh: "#d2cbee",
      uAuroraLow: "#0fb38c",
      uAuroraHigh: "#6a55e6",
      uStar: "#000000",
      // Light curtains must out-shout a bright sky, so they need more coverage.
      uIntensity: 1.7,
    },
  },
  fragment: /* glsl */ `
uniform vec3 uSkyLow;
uniform vec3 uSkyHigh;
uniform vec3 uAuroraLow;
uniform vec3 uAuroraHigh;
uniform vec3 uStar;
uniform float uIntensity;

void main() {
  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
  float t = uTime;
  vec3 col = mix(uSkyLow, uSkyHigh, smoothstep(-0.5, 0.5, p.y));

  vec2 sp = p * 160.0;
  float h = hash(floor(sp));
  float star = step(0.992, h) * smoothstep(0.4, 0.0, length(fract(sp) - 0.5));
  star *= 0.6 + 0.4 * sin(t * 1.5 + h * 60.0);
  col += uStar * star * smoothstep(-0.3, 0.4, p.y);

  float energy = (0.75 + 0.6 * uAmp) * uIntensity;
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float x = p.x * (0.8 + 0.3 * fi) + fi * 2.3;
    float drift = t * (0.035 + 0.015 * fi);
    float wave = fbm(vec2(x * 1.2 + drift, fi * 3.7 + t * 0.02)) - 0.5;
    float base = -0.12 + 0.13 * fi + 0.3 * wave * (1.0 + 0.5 * uAmp);
    float d = p.y - base;
    float curtain = smoothstep(-0.02, 0.025, d) * exp(-max(d, 0.0) * (3.2 + fi * 1.2));
    float rays = 0.45 + 0.55 * noise(vec2(x * 34.0 + 5.0 * fbm(vec2(x * 1.5, t * 0.08)), t * 0.3 + fi * 7.0));
    vec3 c = mix(uAuroraLow, uAuroraHigh, clamp(d * 2.5 + fi * 0.3, 0.0, 1.0));
    col = mix(col, c, clamp(curtain * rays * (0.7 - fi * 0.15) * energy, 0.0, 1.0));
  }

  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`,
});

/** Sunlight caustics rippling across a pool floor; amplitude sharpens and stirs them. */
export const CausticsTimer = createShaderMotion({
  palettes: {
    dark: {
      uDeep: "#03141f",
      uShallow: "#0b3a4a",
      uLight: "#86ecff",
    },
    light: {
      uDeep: "#7cc9d2",
      uShallow: "#c8ecec",
      uLight: "#ffffff",
    },
  },
  fragment: /* glsl */ `
uniform vec3 uDeep;
uniform vec3 uShallow;
uniform vec3 uLight;

// Distance to the nearest edge of a drifting cell network (Voronoi F2 - F1).
float cellEdge(vec2 p, float t) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float f1 = 8.0;
  float f2 = 8.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 g = vec2(float(x), float(y));
      vec2 o = vec2(hash(i + g), hash(i + g + 17.31));
      o = 0.5 + 0.42 * sin(t + 6.2831 * o);
      float d = length(g + o - f);
      if (d < f1) { f2 = f1; f1 = d; } else if (d < f2) { f2 = d; }
    }
  }
  return f2 - f1;
}

void main() {
  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
  float t = uTime * 0.6;

  vec2 warp = vec2(fbm(p * 1.6 + t * 0.12), fbm(p * 1.6 - t * 0.12 + 9.1)) - 0.5;
  vec2 q = p + warp * (0.45 + 0.2 * uAmp);

  float c1 = exp(-cellEdge(q * 3.2, t) * 12.0);
  float c2 = exp(-cellEdge(q * 4.6 + 3.7, t * 1.3) * 14.0);
  // Crossings of the two layers are where real caustics focus brightest.
  float light = c1 * 0.3 + c2 * 0.25 + c1 * c2 * 1.6;
  // Sunlight reaches the floor in drifting patches, not uniformly.
  light *= 0.35 + 0.9 * smoothstep(0.3, 0.7, fbm(p * 1.1 + t * 0.04));

  float depth = smoothstep(-0.7, 0.7, p.y + 0.3 * (noise(p * 1.5 + t * 0.05) - 0.5));
  vec3 col = mix(uDeep, uShallow, depth);
  col *= 0.9 + 0.1 * noise(p * 3.0 - t * 0.1);
  col = mix(col, uLight, clamp(light * (0.5 + 0.45 * uAmp), 0.0, 1.0));

  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`,
});

/**
 * A sun (moon in dark mode) rising over still water as the phase elapses:
 * the one shader motion that encodes progress. Amplitude stirs the reflection.
 */
export const HorizonTimer = createShaderMotion({
  palettes: {
    dark: {
      uSkyHigh: "#070a1c",
      uSkyLow: "#2b2452",
      uSun: "#f1ecff",
      uGlow: "#8b7fd6",
      uHills: "#15133a",
      uWater: "#0a0c22",
    },
    light: {
      uSkyHigh: "#b7c4ee",
      uSkyLow: "#fad5c6",
      uSun: "#fff0cc",
      uGlow: "#ffae85",
      uHills: "#c4b3d9",
      uWater: "#a3b2de",
    },
  },
  fragment: /* glsl */ `
uniform vec3 uSkyHigh;
uniform vec3 uSkyLow;
uniform vec3 uSun;
uniform vec3 uGlow;
uniform vec3 uHills;
uniform vec3 uWater;

const float HORIZON = -0.2;

vec3 sky(vec2 q, vec2 sun, float rise) {
  float h = smoothstep(HORIZON, 0.55, q.y);
  vec3 col = mix(uSkyLow, uSkyHigh, sqrt(h));
  float d = length(q - sun);
  col += uGlow * (exp(-d * 5.0) * 0.55 + exp(-d * 1.6) * 0.2) * (0.5 + 0.5 * rise);
  col = mix(col, uSun, smoothstep(0.072, 0.066, d));
  float hill = HORIZON + 0.022 + 0.06 * fbm(vec2(q.x * 2.2 + 3.0, 0.5));
  return mix(col, uHills, smoothstep(hill + 0.002, hill - 0.002, q.y));
}

void main() {
  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
  float t = uTime;
  float rise = smoothstep(0.0, 1.0, uProgress);
  vec2 sun = vec2(0.2 * min(uAspect, 1.6), mix(HORIZON - 0.04, 0.3, rise));

  vec3 col;
  if (p.y >= HORIZON) {
    col = sky(p, sun, rise);
  } else {
    float depth = HORIZON - p.y;
    float wz = 0.08 / (depth + 0.012);
    float wx = p.x * wz;
    float stir = 0.6 + 0.8 * uAmp;
    float w = noise(vec2(wx * 4.0, wz * 6.0 - t * 0.6)) - 0.5;
    vec2 r = vec2(p.x + w * 0.02 * stir, 2.0 * HORIZON - p.y + w * depth * 0.3 * stir);
    col = mix(sky(r, sun, rise), uWater, 0.3 + 0.35 * smoothstep(0.0, 0.3, depth));

    float glint = smoothstep(0.72, 0.95, noise(vec2(wx * 24.0, wz * 10.0 - t * 1.2)));
    float path = exp(-abs(p.x - sun.x) * 10.0 / (0.4 + depth * 3.0));
    col += uSun * glint * path * smoothstep(HORIZON - 0.02, HORIZON + 0.05, sun.y) * (0.5 + 0.6 * uAmp);
  }
  col = mix(col, uSkyLow, exp(-abs(p.y - HORIZON) * 70.0) * 0.35);

  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`,
});
