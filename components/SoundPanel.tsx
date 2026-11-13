"use client";

import { useEffect, useRef, useState } from "react";
import { useAudioContext } from "@/context/AudioContext";
import { getCategoryById, groupTracksByCategory, MUSIC_TRACKS } from "@/lib/audio/tracks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { MarqueeText } from "@/components/MarqueeText";
import { chromeInset, chromeRow, chromeSegment, chromeShell } from "@/lib/chrome";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

function Equalizer() {
  return (
    <span className="flex h-4 items-end gap-0.5" aria-hidden>
      <span
        className="w-0.5 origin-bottom animate-[eq_0.9s_ease-in-out_infinite] rounded-full bg-primary"
        style={{ height: "60%" }}
      />
      <span
        className="w-0.5 origin-bottom animate-[eq_0.9s_ease-in-out_infinite_0.2s] rounded-full bg-primary"
        style={{ height: "100%" }}
      />
      <span
        className="w-0.5 origin-bottom animate-[eq_0.9s_ease-in-out_infinite_0.4s] rounded-full bg-primary"
        style={{ height: "40%" }}
      />
    </span>
  );
}

export function SoundPanel() {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    nextTrack,
    prevTrack,
    volume,
    setVolume,
    unavailable,
    selectTrack,
  } = useAudioContext();

  const reducedMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);

  const trackLine = currentTrack
    ? currentTrack.title
    : MUSIC_TRACKS.length === 0
      ? "Add YouTube tracks to play music"
      : "Pick a sound";

  const categoryLabel =
    getCategoryById(currentTrack?.categoryId ?? "")?.label ?? "Pick a sound";
  const hasTracks = MUSIC_TRACKS.length > 0;
  const trackGroups = groupTracksByCategory(MUSIC_TRACKS);

  const transitionClass = reducedMotion
    ? ""
    : "transition-[width,height,opacity,max-height,padding] duration-200 ease-out";

  useEffect(() => {
    if (!expanded) return;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Element;
      if (cardRef.current?.contains(target)) return;
      if (target.closest('[data-slot="dropdown-menu-content"]')) return;
      if (categoryMenuOpen) return;
      setExpanded(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [expanded, categoryMenuOpen]);

  useEffect(() => {
    if (!expanded) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !categoryMenuOpen) {
        setExpanded(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [expanded, categoryMenuOpen]);

  return (
    <Card
      ref={cardRef}
      size="sm"
      role="region"
      aria-label="Music player"
      data-expanded={expanded}
      className={cn(
        chromeShell,
        "gap-0 py-0 ring-0 [--card-spacing:0.75rem]",
        transitionClass,
        expanded
          ? "w-80 max-w-[min(20rem,calc(100vw-12rem))]"
          : "w-60 max-w-full",
      )}
    >
      <CardContent
        className={cn(
          chromeRow,
          chromeInset,
          "h-[2.625rem] gap-3 py-0",
          transitionClass,
        )}
      >
        {expanded ? (
          <div className="flex h-full min-w-0 flex-1 items-center overflow-hidden">
            <MarqueeText text={trackLine} active={isPlaying} />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            aria-label={`Expand music player: ${trackLine}`}
            aria-expanded={false}
            className="group relative grid h-full min-w-0 w-full cursor-pointer grid-cols-[1rem_1fr] items-center gap-2 text-left"
          >
            <span className="flex w-4 shrink-0 items-center justify-center">
              {isPlaying && currentTrack ? <Equalizer /> : null}
            </span>
            <span
              className={cn(
                "min-w-0 w-full pr-0 transition-[padding] ease-out",
                "group-hover:pr-5 group-focus-visible:pr-5",
                "[@media(hover:none)]:pr-5",
                reducedMotion ? "" : "duration-200",
                "group-hover:[&>div]:[mask-image:linear-gradient(to_right,transparent,black_8%,black_93%,transparent)]",
                "group-focus-visible:[&>div]:[mask-image:linear-gradient(to_right,transparent,black_8%,black_93%,transparent)]",
                "[@media(hover:none)]:[&>div]:[mask-image:linear-gradient(to_right,transparent,black_8%,black_93%,transparent)]",
              )}
            >
              <MarqueeText
                text={trackLine}
                active={isPlaying}
                fade="both"
              />
            </span>
            <ChevronDown
              aria-hidden
              className={cn(
                "pointer-events-none absolute right-0 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground opacity-0 [@media(hover:none)]:opacity-50",
                reducedMotion
                  ? "group-hover:opacity-100 group-focus-visible:opacity-100"
                  : "transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100",
              )}
            />
          </button>
        )}

        <div
          className={cn(
            "shrink-0 overflow-hidden",
            transitionClass,
            expanded ? "w-auto opacity-100" : "w-0 opacity-0",
          )}
        >
          <DropdownMenu
            open={categoryMenuOpen}
            onOpenChange={setCategoryMenuOpen}
          >
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    chromeSegment,
                    "h-8 max-w-[9rem] shrink-0 gap-1 px-3 text-[13px]",
                  )}
                />
              }
            >
              <span className="truncate">{categoryLabel}</span>
              <ChevronDown className="size-3 shrink-0 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {MUSIC_TRACKS.length === 0 ? (
                <DropdownMenuGroup>
                  <DropdownMenuItem disabled>
                    <span className="text-sm text-muted-foreground">
                      No tracks configured yet
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              ) : (
                <DropdownMenuGroup>
                  {trackGroups.map(({ category, tracks }) => {
                    const isUnavailable = tracks.every((t) =>
                      unavailable.has(t.id),
                    );
                    const firstAvailable = tracks.find(
                      (t) => !unavailable.has(t.id),
                    );

                    return (
                      <DropdownMenuItem
                        key={category.id}
                        disabled={isUnavailable || !firstAvailable}
                        onClick={() => {
                          if (firstAvailable) selectTrack(firstAvailable.id);
                        }}
                        className="flex items-center"
                      >
                        <span className="text-sm">{category.label}</span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuGroup>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>

      <CardFooter
        className={cn(
          "flex items-center gap-2 overflow-hidden border-border/60 bg-transparent px-3",
          transitionClass,
          expanded
            ? "max-h-16 border-t py-2 opacity-100"
            : "max-h-0 border-t-0 py-0 opacity-0",
        )}
      >
        <div className="flex shrink-0 items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={prevTrack}
            disabled={!hasTracks}
            aria-label="Previous sound"
            className="size-9 [&_svg]:!size-4"
          >
            <SkipBack />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={togglePlay}
            disabled={!currentTrack}
            aria-label={isPlaying ? "Pause sound" : "Play sound"}
            className={cn(chromeSegment, "mx-0.5 size-9")}
          >
            {isPlaying ? <Pause /> : <Play />}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={nextTrack}
            disabled={!hasTracks}
            aria-label="Next sound"
            className="size-9 [&_svg]:!size-4"
          >
            <SkipForward />
          </Button>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <Volume2 className="size-3.5 shrink-0 text-muted-foreground" />
          <Slider
            aria-label="Volume"
            value={[Math.round(volume * 100)]}
            max={100}
            step={1}
            onValueChange={(value) => {
              const level = Array.isArray(value) ? value[0] : value;
              setVolume((level ?? 0) / 100);
            }}
            className="w-full"
          />
        </div>
      </CardFooter>
    </Card>
  );
}
