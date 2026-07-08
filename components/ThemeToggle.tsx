"use client";

import { Button } from "@/components/ui/button";
import { chromeSegment } from "@/lib/chrome";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(chromeSegment, "text-muted-foreground hover:text-foreground")}
    >
      {theme === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
}
