"use client";

import dynamic from "next/dynamic";

const FlowcusApp = dynamic(
  () => import("@/components/FlowcusApp").then((m) => m.FlowcusApp),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-dvh w-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-accent-1" />
      </div>
    ),
  },
);

export function FlowcusRoot() {
  return <FlowcusApp />;
}
