"use client";

import { SettingsSheet } from "@/components/SettingsSheet";
import { ThemeToggle } from "@/components/ThemeToggle";
import { VisualStyleToggle } from "@/components/VisualStyleToggle";
import { chromePad, chromeRow, chromeShell } from "@/lib/chrome";
import { cn } from "@/lib/utils";

interface TopBarActionsProps {
  styleId: string;
  onStyleChange: (id: string) => void;
}

export function TopBarActions({ styleId, onStyleChange }: TopBarActionsProps) {
  return (
    <div className={cn(chromeShell, chromeRow, chromePad, "gap-0.5")}>
      <ThemeToggle />
      <VisualStyleToggle styleId={styleId} onStyleChange={onStyleChange} />
      <SettingsSheet />
    </div>
  );
}
