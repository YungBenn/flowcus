"use client";

import { TIMER_STYLES } from "@/lib/timerStyles/registry";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Layers2 } from "lucide-react";

interface VisualStyleToggleProps {
  styleId: string;
  onStyleChange: (id: string) => void;
}

export function VisualStyleToggle({
  styleId,
  onStyleChange,
}: VisualStyleToggleProps) {
  const activeStyle =
    TIMER_STYLES.find((s) => s.id === styleId) ?? TIMER_STYLES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Change visual style (${activeStyle.label})`}
            className="text-muted-foreground hover:text-foreground"
          />
        }
      >
        <Layers2 />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {TIMER_STYLES.map((style) => (
          <DropdownMenuItem
            key={style.id}
            onClick={() => onStyleChange(style.id)}
          >
            {style.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
