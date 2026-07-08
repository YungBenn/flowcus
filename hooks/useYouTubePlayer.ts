"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { loadYouTubeIframeApi } from "@/lib/audio/youtube";
import {
  DEFAULT_YOUTUBE_PLAYER_API,
  type YouTubePlayerApi,
} from "@/lib/audio/youtubePlayerApi";

function isPlayingState(state: number): boolean {
  return (
    state === window.YT.PlayerState.PLAYING ||
    state === window.YT.PlayerState.BUFFERING
  );
}

export function useYouTubePlayer(): {
  containerRef: React.RefObject<HTMLDivElement | null>;
  api: YouTubePlayerApi;
} {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YT.Player | null>(null);
  const stateListenersRef = useRef(new Set<(playing: boolean) => void>());
  const errorListenersRef = useRef(new Set<() => void>());
  const [isReady, setIsReady] = useState(false);

  const notifyState = useCallback((playing: boolean) => {
    stateListenersRef.current.forEach((listener) => listener(playing));
  }, []);

  const notifyError = useCallback(() => {
    errorListenersRef.current.forEach((listener) => listener());
  }, []);

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    if (!container) return;

    void loadYouTubeIframeApi()
      .then(() => {
        if (cancelled || !containerRef.current) return;

        const player = new window.YT.Player(containerRef.current, {
          height: "1",
          width: "1",
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            rel: 0,
            iv_load_policy: 3,
          },
          events: {
            onReady: () => {
              if (cancelled) return;
              playerRef.current = player;
              setIsReady(true);
            },
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.ENDED) {
                player.seekTo(0, true);
                player.playVideo();
                notifyState(true);
                return;
              }
              notifyState(isPlayingState(event.data));
            },
            onError: () => {
              notifyError();
              notifyState(false);
            },
          },
        });
      })
      .catch(() => {
        notifyError();
      });

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
      setIsReady(false);
    };
  }, [notifyError, notifyState]);

  const loadAndPlay = useCallback((videoId: string) => {
    const player = playerRef.current;
    if (!player) return;

    player.loadVideoById({
      videoId,
      startSeconds: 0,
    });
    player.playVideo();
  }, []);

  const pause = useCallback(() => {
    playerRef.current?.pauseVideo();
  }, []);

  const stop = useCallback(() => {
    playerRef.current?.stopVideo();
  }, []);

  const setVolume = useCallback((level: number) => {
    playerRef.current?.setVolume(Math.min(100, Math.max(0, level)));
  }, []);

  const subscribeStateChange = useCallback(
    (cb: (playing: boolean) => void) => {
      stateListenersRef.current.add(cb);
      return () => {
        stateListenersRef.current.delete(cb);
      };
    },
    [],
  );

  const subscribeError = useCallback((cb: () => void) => {
    errorListenersRef.current.add(cb);
    return () => {
      errorListenersRef.current.delete(cb);
    };
  }, []);

  const api = useMemo<YouTubePlayerApi>(() => {
    if (!isReady) {
      return {
        ...DEFAULT_YOUTUBE_PLAYER_API,
        subscribeStateChange,
        subscribeError,
      };
    }

    return {
      isReady,
      loadAndPlay,
      pause,
      stop,
      setVolume,
      subscribeStateChange,
      subscribeError,
    };
  }, [
    isReady,
    loadAndPlay,
    pause,
    stop,
    setVolume,
    subscribeStateChange,
    subscribeError,
  ]);

  return { containerRef, api };
}
