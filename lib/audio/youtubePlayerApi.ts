export interface YouTubePlayerApi {
  isReady: boolean;
  loadAndPlay: (videoId: string) => void;
  pause: () => void;
  stop: () => void;
  setVolume: (level: number) => void;
  subscribeStateChange: (cb: (playing: boolean) => void) => () => void;
  subscribeError: (cb: () => void) => () => void;
}

export const DEFAULT_YOUTUBE_PLAYER_API: YouTubePlayerApi = {
  isReady: false,
  loadAndPlay: () => {},
  pause: () => {},
  stop: () => {},
  setVolume: () => {},
  subscribeStateChange: () => () => {},
  subscribeError: () => () => {},
};
