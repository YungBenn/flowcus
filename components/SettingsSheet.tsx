"use client";

import type { ReactNode } from "react";
import { useTimerContext } from "@/context/TimerContext";
import { SETTINGS_BOUNDS } from "@/lib/timer/types";
import { clampSetting } from "@/lib/timer/machine";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  chromeIcon,
  chromeInset,
  chromePad,
  chromeRow,
  chromeSegment,
  chromeShell,
} from "@/lib/chrome";
import { cn } from "@/lib/utils";
import { Minus, Plus, Settings, X } from "lucide-react";

const settingsControlCol =
  "flex w-[6.25rem] shrink-0 items-center justify-end";

function SettingsRow({
  label,
  control,
}: {
  label: ReactNode;
  control: ReactNode;
}) {
  return (
    <div className="grid min-h-9 grid-cols-[1fr_6.25rem] items-center gap-x-3">
      <div className="min-w-0">{label}</div>
      <div className={settingsControlCol}>{control}</div>
    </div>
  );
}

interface StepperProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}

function Stepper({ id, label, value, min, max, onChange }: StepperProps) {
  const track = (
    <div
      className={cn(
        chromePad,
        chromeRow,
        "w-full justify-between rounded-lg bg-muted/50 py-0",
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Decrease ${label}`}
        className={cn(
          chromeSegment,
          "size-7 shrink-0 text-muted-foreground hover:bg-background/50 hover:text-foreground",
        )}
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
        className="h-7 w-9 border-0 bg-transparent px-0 text-center text-sm font-medium tabular-nums shadow-none [appearance:textfield] focus-visible:border-transparent focus-visible:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none dark:bg-transparent"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Increase ${label}`}
        className={cn(
          chromeSegment,
          "size-7 shrink-0 text-muted-foreground hover:bg-background/50 hover:text-foreground",
        )}
        onClick={() => onChange(clampSetting(value + 1, min, max))}
      >
        <Plus className="size-3.5" />
      </Button>
    </div>
  );

  return (
    <SettingsRow
      label={
        <Label htmlFor={id} className="text-sm font-medium text-foreground/80">
          {label}
        </Label>
      }
      control={track}
    />
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-0.5 text-[13px] font-medium text-muted-foreground">
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
            size="icon-sm"
            aria-label="Open settings"
            className={cn(chromeSegment, chromeIcon)}
          />
        }
      >
        <Settings />
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className={cn(
          chromeShell,
          "gap-0 overflow-hidden p-0 ring-0 sm:max-w-sm",
        )}
      >
        <div
          className={cn(
            chromeRow,
            chromeInset,
            "shrink-0 justify-between gap-2 border-b border-border/60",
          )}
        >
          <DialogTitle className="font-display text-base font-medium leading-none">
            Settings
          </DialogTitle>
          <DialogClose
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Close settings"
                className={cn(
                  chromeSegment,
                  "size-7 shrink-0 text-muted-foreground hover:text-foreground",
                )}
              />
            }
          >
            <X className="size-4" />
          </DialogClose>
        </div>

        <div className="flex flex-col py-3">
          <section className={cn(chromeInset, "flex flex-col gap-3 py-4")}>
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

          <div className="h-px bg-border/60" />

          <section className={cn(chromeInset, "flex flex-col gap-3 py-4")}>
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

          <div className="h-px bg-border/60" />

          <section className={cn(chromeInset, "py-4")}>
            <SettingsRow
              label={
                <div className="flex flex-col gap-0.5">
                  <Label htmlFor="auto-start" className="text-sm font-medium">
                    Auto-start next phase
                  </Label>
                  <p className="text-[13px] leading-relaxed text-muted-foreground">
                    Roll straight into the next focus or break
                  </p>
                </div>
              }
              control={
                <Switch
                  id="auto-start"
                  checked={settings.autoStartNext}
                  onCheckedChange={(checked) =>
                    updateSettings({ autoStartNext: checked })
                  }
                />
              }
            />
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
