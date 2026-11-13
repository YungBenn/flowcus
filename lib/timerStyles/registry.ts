import dynamic from "next/dynamic";
import { MinimalTimer } from "@/components/timerStyles/MinimalTimer";
import type { TimerStyleRenderer } from "./types";

// The 3D canvas must only run client-side (no SSR WebGL).
const BubbleTimer = dynamic(
  () => import("@/components/timerStyles/BubbleTimer").then((m) => m.BubbleTimer),
  { ssr: false },
);
const AuroraTimer = dynamic(
  () => import("@/components/timerStyles/ShaderMotions").then((m) => m.AuroraTimer),
  { ssr: false },
);
const StardustTimer = dynamic(
  () => import("@/components/timerStyles/StardustTimer").then((m) => m.StardustTimer),
  { ssr: false },
);
const CausticsTimer = dynamic(
  () => import("@/components/timerStyles/ShaderMotions").then((m) => m.CausticsTimer),
  { ssr: false },
);
const HorizonTimer = dynamic(
  () => import("@/components/timerStyles/ShaderMotions").then((m) => m.HorizonTimer),
  { ssr: false },
);

export const TIMER_STYLES: TimerStyleRenderer[] = [
  { id: "bubble", label: "3D Bubble", component: BubbleTimer },
  { id: "aurora", label: "Aurora", component: AuroraTimer },
  { id: "stardust", label: "Stardust", component: StardustTimer },
  { id: "caustics", label: "Caustics", component: CausticsTimer },
  { id: "horizon", label: "Horizon", component: HorizonTimer },
  // SSR-safe, so no dynamic import needed - the registry only cares about id -> component.
  { id: "minimal", label: "Minimal", component: MinimalTimer },
];

export const DEFAULT_STYLE_ID = "bubble";

export function getStyle(id: string): TimerStyleRenderer {
  return TIMER_STYLES.find((s) => s.id === id) ?? TIMER_STYLES[0];
}
