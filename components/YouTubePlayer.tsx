"use client";

import { useEffect } from "react";
import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";
import type { YouTubePlayerApi } from "@/lib/audio/youtubePlayerApi";

interface YouTubePlayerProps {
  onApiChange: (api: YouTubePlayerApi) => void;
}

export function YouTubePlayer({ onApiChange }: YouTubePlayerProps) {
  const { containerRef, api } = useYouTubePlayer();

  useEffect(() => {
    onApiChange(api);
  }, [api, onApiChange]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed -left-[9999px] top-0 h-px w-px opacity-0"
      aria-hidden
    />
  );
}
