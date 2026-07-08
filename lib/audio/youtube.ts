const YOUTUBE_IFRAME_API_SRC = "https://www.youtube.com/iframe_api";

let apiLoadPromise: Promise<void> | null = null;

/** Extract a YouTube video ID from common URL formats. */
export function parseYouTubeId(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id ?? null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname === "/watch") {
        return parsed.searchParams.get("v");
      }
      const liveMatch = parsed.pathname.match(/^\/live\/([^/?]+)/);
      if (liveMatch) return liveMatch[1];
      const embedMatch = parsed.pathname.match(/^\/embed\/([^/?]+)/);
      if (embedMatch) return embedMatch[1];
      const shortsMatch = parsed.pathname.match(/^\/shorts\/([^/?]+)/);
      if (shortsMatch) return shortsMatch[1];
    }
  } catch {
    /* not a valid URL - fall through to bare-id check */
  }

  if (/^[\w-]{11}$/.test(trimmed)) return trimmed;
  return null;
}

/** Load the YouTube IFrame API script once and wait until YT is ready. */
export function loadYouTubeIframeApi(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("YouTube IFrame API requires a browser"));
  }

  if (window.YT?.Player) {
    return Promise.resolve();
  }

  apiLoadPromise ??= new Promise<void>((resolve, reject) => {
    const previousCallback = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      resolve();
    };

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${YOUTUBE_IFRAME_API_SRC}"]`,
    );
    if (existing) return;

    const script = document.createElement("script");
    script.src = YOUTUBE_IFRAME_API_SRC;
    script.async = true;
    script.onerror = () => {
      apiLoadPromise = null;
      reject(new Error("Failed to load YouTube IFrame API"));
    };
    document.head.appendChild(script);
  });

  return apiLoadPromise;
}
