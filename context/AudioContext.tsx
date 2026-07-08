"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { useAudio, type UseAudioResult } from "@/hooks/useAudio";
import { YouTubePlayer } from "@/components/YouTubePlayer";
import {
  DEFAULT_YOUTUBE_PLAYER_API,
  type YouTubePlayerApi,
} from "@/lib/audio/youtubePlayerApi";

const AudioCtx = createContext<UseAudioResult | null>(null);

interface AudioProviderProps {
  children: ReactNode;
  initialVolume?: number;
  initialTrackId?: string | null;
}

export function AudioProvider({
  children,
  initialVolume,
  initialTrackId,
}: AudioProviderProps) {
  const [youtubeApi, setYoutubeApi] = useState<YouTubePlayerApi>(
    DEFAULT_YOUTUBE_PLAYER_API,
  );

  const handleApiChange = useCallback((api: YouTubePlayerApi) => {
    setYoutubeApi(api);
  }, []);

  const audio = useAudio({ initialVolume, initialTrackId, youtubeApi });

  return (
    <AudioCtx.Provider value={audio}>
      <YouTubePlayer onApiChange={handleApiChange} />
      {children}
    </AudioCtx.Provider>
  );
}

export function useAudioContext(): UseAudioResult {
  const ctx = useContext(AudioCtx);
  if (!ctx) {
    throw new Error("useAudioContext must be used within an AudioProvider");
  }
  return ctx;
}
