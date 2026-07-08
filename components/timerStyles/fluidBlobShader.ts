import * as THREE from "three";
import type { Theme } from "@/lib/theme";

const SNOISE_GLSL = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0)) +
    i.y + vec4(0.0, i1.y, i2.y, 1.0)) +
    i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

const vertexShader = `
uniform float uTime;
uniform float uDistort;
uniform float uRadius;
uniform float uPhaseOffset;

varying vec3 vWorldPos;
varying vec3 vNormal;
varying float vNoise;

${SNOISE_GLSL}

void main() {
  float updateTime = uTime / 50.0 + uPhaseOffset;
  float noise = snoise(vec3(position / 2.0 + updateTime * 5.0));
  vNoise = noise;
  vec3 displaced = position * (noise * pow(uDistort, 2.0) + uRadius);

  vec4 worldPos = modelMatrix * vec4(displaced, 1.0);
  vWorldPos = worldPos.xyz;
  vNormal = normalize(normalMatrix * normal);

  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;

const fragmentShader = `
uniform vec2 uHotSpot;
uniform vec3 uLightPos;
uniform vec3 uViolet;
uniform vec3 uMagenta;
uniform vec3 uPink;
uniform vec3 uOrange;
uniform vec3 uRimColor;
uniform float uDiffuseBase;
uniform float uDiffuseScale;
uniform float uRimStrength;

varying vec3 vWorldPos;
varying vec3 vNormal;
varying float vNoise;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(cameraPosition - vWorldPos);
  vec3 lightDir = normalize(uLightPos - vWorldPos);

  float gradY = vWorldPos.y * 0.55 + vNoise * 0.35;
  float gradX = vWorldPos.x * 0.4;
  float blend = smoothstep(-0.8, 0.6, gradY + gradX);

  vec3 baseColor = mix(uViolet, uMagenta, blend);
  baseColor = mix(baseColor, uPink, smoothstep(0.2, 0.75, blend));

  vec2 hotDir = vec2(vWorldPos.x, vWorldPos.y) - uHotSpot;
  float hotDist = length(hotDir);
  float hotMask = smoothstep(1.1, 0.15, hotDist + vNoise * 0.2);
  baseColor = mix(baseColor, uOrange, hotMask * 0.85);

  float ndotl = max(dot(normal, lightDir), 0.0);
  float diffuse = uDiffuseBase + ndotl * uDiffuseScale;

  float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.5);
  float glow = hotMask * 0.35 + smoothstep(0.0, 1.0, blend) * 0.12;

  vec3 color = baseColor * diffuse;
  color += uRimColor * fresnel * uRimStrength;
  color += uOrange * glow;

  gl_FragColor = vec4(color, 1.0);
}
`;

export interface FluidPalette {
  violet: THREE.Color;
  magenta: THREE.Color;
  pink: THREE.Color;
  orange: THREE.Color;
  rim: THREE.Color;
  lightPos: THREE.Vector3;
  diffuseBase: number;
  diffuseScale: number;
  rimStrength: number;
}

export const FLUID_PALETTES: Record<Theme, FluidPalette> = {
  dark: {
    violet: new THREE.Color("#4c1d95"),
    magenta: new THREE.Color("#c026d3"),
    pink: new THREE.Color("#ec4899"),
    orange: new THREE.Color("#f97316"),
    rim: new THREE.Color("#a78bfa"),
    lightPos: new THREE.Vector3(2, 3, 4),
    diffuseBase: 0.42,
    diffuseScale: 0.38,
    rimStrength: 0.55,
  },
  light: {
    violet: new THREE.Color("#c4b5fd"),
    magenta: new THREE.Color("#f0abfc"),
    pink: new THREE.Color("#fda4af"),
    orange: new THREE.Color("#fdba74"),
    rim: new THREE.Color("#e9d5ff"),
    lightPos: new THREE.Vector3(2, 3, 4),
    diffuseBase: 0.55,
    diffuseScale: 0.28,
    rimStrength: 0.45,
  },
};

export function createFluidBlobMaterial(
  theme: Theme,
  hotSpot: [number, number],
  phaseOffset = 0,
): THREE.ShaderMaterial {
  const palette = FLUID_PALETTES[theme];

  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uDistort: { value: 0.38 },
      uRadius: { value: 1 },
      uPhaseOffset: { value: phaseOffset },
      uHotSpot: { value: new THREE.Vector2(hotSpot[0], hotSpot[1]) },
      uLightPos: { value: palette.lightPos.clone() },
      uViolet: { value: palette.violet.clone() },
      uMagenta: { value: palette.magenta.clone() },
      uPink: { value: palette.pink.clone() },
      uOrange: { value: palette.orange.clone() },
      uRimColor: { value: palette.rim.clone() },
      uDiffuseBase: { value: palette.diffuseBase },
      uDiffuseScale: { value: palette.diffuseScale },
      uRimStrength: { value: palette.rimStrength },
    },
    vertexShader,
    fragmentShader,
  });
}

export const FLUID_POINT_LIGHT: Record<Theme, string> = {
  dark: "#c4b5fd",
  light: "#fef3c7",
};
