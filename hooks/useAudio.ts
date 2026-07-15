"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ALL_TRACKS, getTrackById, getTracksInCategory, type Track } from "@/lib/audio/tracks";
import type { YouTubePlayerApi } from "@/lib/audio/youtubePlayerApi";
import { DEFAULT_YOUTUBE_PLAYER_API } from "@/lib/audio/youtubePlayerApi";

export interface UseAudioResult {
  currentTrackId: string | null;
  currentTrack: Track | undefined;
  isPlaying: boolean;
  volume: number;
  /** Track ids whose video failed to load or play. */
  unavailable: Set<string>;
  selectTrack: (id: string) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  togglePlay: () => void;
  stop: () => void;
  setVolume: (v: number) => void;
  getAmplitude: () => number;
}

interface UseAudioOptions {
  initialVolume?: number;
  initialTrackId?: string | null;
  youtubeApi?: YouTubePlayerApi;
}

export function useAudio(options: UseAudioOptions = {}): UseAudioResult {
  const {
    initialVolume = 0.6,
    initialTrackId = null,
    youtubeApi = DEFAULT_YOUTUBE_PLAYER_API,
  } = options;

  const [currentTrackId, setCurrentTrackId] = useState<string | null>(
    initialTrackId,
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(initialVolume);
  const [unavailable, setUnavailable] = useState<Set<string>>(new Set());

  const volumeRef = useRef(initialVolume);
  const smoothedRef = useRef(0);
  const phaseRef = useRef(0);
  const youtubeApiRef = useRef(youtubeApi);

  useEffect(() => {
    youtubeApiRef.current = youtubeApi;
    if (youtubeApi.isReady) {
      youtubeApi.setVolume(Math.round(volumeRef.current * 100));
    }
  }, [youtubeApi]);

  const play = useCallback((track: Track) => {
    const api = youtubeApiRef.current;
    if (!api.isReady) return;
    api.loadAndPlay(track.youtubeId);
  }, []);

  const selectTrack = useCallback(
    (id: string) => {
      const track = getTrackById(id);
      if (!track || unavailable.has(id)) return;
      setCurrentTrackId(id);
      play(track);
    },
    [play, unavailable],
  );

  const step = useCallback(
    (direction: 1 | -1) => {
      const currentTrack = getTrackById(currentTrackId);
      const pool = currentTrack
        ? getTracksInCategory(currentTrack.categoryId)
        : ALL_TRACKS;
      const count = pool.length;
      if (count === 0) return;
      const currentIndex = pool.findIndex((t) => t.id === currentTrackId);
      const from = currentIndex === -1 ? (direction === 1 ? -1 : 0) : currentIndex;

      for (let i = 1; i <= count; i++) {
        const next = pool[(from + direction * i + count * count) % count];
        if (!unavailable.has(next.id)) {
          setCurrentTrackId(next.id);
          play(next);
          return;
        }
      }
    },
    [currentTrackId, unavailable, play],
  );

  const nextTrack = useCallback(() => step(1), [step]);
  const prevTrack = useCallback(() => step(-1), [step]);

  const stop = useCallback(() => {
    youtubeApiRef.current.stop();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      youtubeApiRef.current.pause();
      setIsPlaying(false);
      return;
    }
    const track = getTrackById(currentTrackId);
    if (track) play(track);
  }, [isPlaying, currentTrackId, play]);

  const setVolume = useCallback((v: number) => {
    const clamped = Math.min(1, Math.max(0, v));
    volumeRef.current = clamped;
    setVolumeState(clamped);
    youtubeApiRef.current.setVolume(Math.round(clamped * 100));
  }, []);

  const getAmplitude = useCallback(() => {
    if (!isPlaying) {
      smoothedRef.current *= 0.9;
      return smoothedRef.current;
    }

    phaseRef.current += 0.08;
    const level =
      0.35 + Math.sin(phaseRef.current) * 0.12 + Math.sin(phaseRef.current * 2.3) * 0.06;
    smoothedRef.current += (level - smoothedRef.current) * 0.2;
    return smoothedRef.current;
  }, [isPlaying]);

  useEffect(() => {
    const unsubscribeState = youtubeApi.subscribeStateChange(setIsPlaying);
    const unsubscribeError = youtubeApi.subscribeError(() => {
      const id = currentTrackId;
      if (id) setUnavailable((prev) => new Set(prev).add(id));
      setIsPlaying(false);
    });
    return () => {
      unsubscribeState();
      unsubscribeError();
    };
  }, [youtubeApi, currentTrackId]);

  return {
    currentTrackId,
    currentTrack: getTrackById(currentTrackId),
    isPlaying,
    volume,
    unavailable,
    selectTrack,
    nextTrack,
    prevTrack,
    togglePlay,
    stop,
    setVolume,
    getAmplitude,
  };
}
