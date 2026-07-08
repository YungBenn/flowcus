import { parseYouTubeId } from "./youtube";

export interface Track {
  id: string;
  title: string;
  category: string;
  youtubeId: string;
}

/**
 * YouTube music tracks. Add entries here once video URLs are available.
 * Use parseYouTubeId() from ./youtube to extract IDs from URLs.
 */
export const MUSIC_TRACKS: Track[] = [
  {
    id: "1",
    title: "Hans Zimmer - Interstellar (Space Sounds) by dhe perissann",
    category: "🚀 Cinematic",
    youtubeId: parseYouTubeId(
      "https://youtu.be/5gO0xpY_Y3E?si=HATu-btAXcgkNJ4Z",
    )!,
  },
  {
    id: "2",
    title: "lofi hip hop radio - beats to study/relax to by Chillhop Music",
    category: "☕️ Lofi",
    youtubeId: parseYouTubeId(
      "https://www.youtube.com/live/7NOSDKb0HlU?si=eHH5-vGCGnupcTfT",
    )!,
  },
  {
    id: "3",
    title: "4K Cozy Coffee Shop with Smooth Piano Jazz Music for Relaxing, Studying and Working by Relaxing Jazz Piano",
    category: "🎷 Jazz",
    youtubeId: parseYouTubeId(
      "https://youtu.be/MYPVQccHhAQ?si=wxDA7rMo1gSbR9OF",
    )!,
  },
];

export const ALL_TRACKS: Track[] = [...MUSIC_TRACKS];

export function getTrackById(id: string | null): Track | undefined {
  if (!id) return undefined;
  return ALL_TRACKS.find((t) => t.id === id);
}

export function groupTracksByCategory(
  tracks: Track[],
): { category: string; tracks: Track[] }[] {
  const groups = new Map<string, Track[]>();
  for (const track of tracks) {
    const list = groups.get(track.category) ?? [];
    list.push(track);
    groups.set(track.category, list);
  }
  return Array.from(groups, ([category, categoryTracks]) => ({
    category,
    tracks: categoryTracks,
  }));
}
