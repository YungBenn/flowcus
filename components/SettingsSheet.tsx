"use client";

import type { ReactNode } from "react";
import { useTimerContext } from "@/context/TimerContext";
import { SETTINGS_BOUNDS } from "@/lib/timer/types";
import { clampSetting } from "@/lib/timer/machine";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Minus, Plus, Settings } from "lucide-react";

interface StepperProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}

function Stepper({ id, label, value, min, max, onChange }: StepperProps) {
  return (
    <div className="flex items-center justify-between gap-6">
      <Label htmlFor={id} className="text-sm text-muted-foreground">
        {label}
      </Label>
      <div className="flex items-center rounded-full bg-muted/50 p-0.5 ring-1 ring-border/50">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={`Decrease ${label}`}
          className="size-7 rounded-full text-muted-foreground hover:bg-background/50 hover:text-foreground"
          onClick={() => onChange(clampSetting(value - 1, min, max))}
        >
          <Minus className="size-3.5" />
        </Button>
        <Input
          id={id}
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={(e) =>
            onChange(clampSetting(Number(e.target.value), min, max))
          }
          onBlur={(e) =>
            onChange(clampSetting(Number(e.target.value) || min, min, max))
          }
          className="h-7 w-10 border-0 bg-transparent px-0 text-center text-sm font-medium tabular-nums shadow-none focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={`Increase ${label}`}
          className="size-7 rounded-full text-muted-foreground hover:bg-background/50 hover:text-foreground"
          onClick={() => onChange(clampSetting(value + 1, min, max))}
        >
          <Plus className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
      {children}
    </p>
  );
}

export function SettingsSheet() {
  const { settings, updateSettings } = useTimerContext();

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open settings"
            className="text-muted-foreground hover:text-foreground"
          />
        }
      >
        <Settings />
      </DialogTrigger>
      <DialogContent className="gap-0 overflow-hidden rounded-2xl border-border/60 p-0 sm:max-w-xs">
        <DialogHeader className="border-b border-border/50 px-5 py-4">
          <DialogTitle className="text-sm font-semibold tracking-tight">
            Settings
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6 px-5 py-5">
          <section className="flex flex-col gap-3.5">
            <SectionLabel>Pomodoro</SectionLabel>
            <Stepper
              id="pomodoro-focus"
              label="Focus"
              value={settings.pomodoroFocusMin}
              min={SETTINGS_BOUNDS.pomodoroFocusMin.min}
              max={SETTINGS_BOUNDS.pomodoroFocusMin.max}
              onChange={(v) => updateSettings({ pomodoroFocusMin: v })}
            />
            <Stepper
              id="pomodoro-break"
              label="Break"
              value={settings.pomodoroBreakMin}
              min={SETTINGS_BOUNDS.pomodoroBreakMin.min}
              max={SETTINGS_BOUNDS.pomodoroBreakMin.max}
              onChange={(v) => updateSettings({ pomodoroBreakMin: v })}
            />
          </section>

          <div className="h-px bg-border/50" />

          <section className="flex flex-col gap-3.5">
            <SectionLabel>Deep Work</SectionLabel>
            <Stepper
              id="deepwork-focus"
              label="Focus"
              value={settings.deepWorkMin}
              min={SETTINGS_BOUNDS.deepWorkMin.min}
              max={SETTINGS_BOUNDS.deepWorkMin.max}
              onChange={(v) => updateSettings({ deepWorkMin: v })}
            />
          </section>

          <div className="h-px bg-border/50" />

          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="auto-start" className="text-sm font-medium">
                Auto-start next phase
              </Label>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Roll straight into the next focus or break
              </p>
            </div>
            <Switch
              id="auto-start"
              checked={settings.autoStartNext}
              onCheckedChange={(checked) =>
                updateSettings({ autoStartNext: checked })
              }
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
