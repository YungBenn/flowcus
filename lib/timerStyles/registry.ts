import dynamic from "next/dynamic";
import type { TimerStyleRenderer } from "./types";

// The 3D canvas must only run client-side (no SSR WebGL).
const BubbleTimer = dynamic(
  () => import("@/components/timerStyles/BubbleTimer").then((m) => m.BubbleTimer),
  { ssr: false },
);

export const TIMER_STYLES: TimerStyleRenderer[] = [
  { id: "bubble", label: "3D Bubble", component: BubbleTimer },
];

export const DEFAULT_STYLE_ID = "bubble";

export function getStyle(id: string): TimerStyleRenderer {
  return TIMER_STYLES.find((s) => s.id === id) ?? TIMER_STYLES[0];
}
