import { parseYouTubeId } from "./youtube";

export interface MusicCategory {
  id: string;
  label: string;
}

export const MUSIC_CATEGORIES: MusicCategory[] = [
  { id: "cinematic", label: "🚀 Cinematic" },
  { id: "lofi", label: "☕️ Lofi" },
  { id: "jazz", label: "🎷 Jazz" },
  { id: "rainstorm", label: "🌧️ Rainstorm" },
];

export interface Track {
  id: string;
  title: string;
  categoryId: string;
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
    categoryId: "cinematic",
    youtubeId: parseYouTubeId(
      "https://youtu.be/5gO0xpY_Y3E?si=HATu-btAXcgkNJ4Z",
    )!,
  },
  {
    id: "2",
    title: "lofi hip hop radio - beats to study/relax to by Chillhop Music",
    categoryId: "lofi",
    youtubeId: parseYouTubeId(
      "https://www.youtube.com/live/7NOSDKb0HlU?si=eHH5-vGCGnupcTfT",
    )!,
  },
  {
    id: "3",
    title: "4K Cozy Coffee Shop with Smooth Piano Jazz Music for Relaxing, Studying and Working by Relaxing Jazz Piano",
    categoryId: "jazz",
    youtubeId: parseYouTubeId(
      "https://youtu.be/MYPVQccHhAQ?si=wxDA7rMo1gSbR9OF",
    )!,
  },
  {
    id: "4",
    title: "Rainstorm Sounds for Relaxing, Focus or Deep Sleep by Calm",
    categoryId: "rainstorm",
    youtubeId: parseYouTubeId(
      "https://youtu.be/yIQd2Ya0Ziw?si=5C8c8DNbjnk9N0zr",
    )!,
  },
  {
    id: "5",
    title: "lofi hip hop radio 📚 beats to relax/study to by Lofi Girl",
    categoryId: "lofi",
    youtubeId: parseYouTubeId("https://www.youtube.com/live/X4VbdwhkE10?si=sVhd13TWhvUmUFjC")!,
  },
  {
    id: "6",
    title: "Relaxing Jazz Piano Radio - Slow Jazz Music - 24/7 Live Stream - Music For Work & Study by Cafe Music BGM channel",
    categoryId: "jazz",
    youtubeId: parseYouTubeId("https://www.youtube.com/live/Dx5qFachd3A?si=3LseEWsQ4FqED0SY")!,
  }
];

export const ALL_TRACKS: Track[] = [...MUSIC_TRACKS];

export function getCategoryById(id: string): MusicCategory | undefined {
  return MUSIC_CATEGORIES.find((c) => c.id === id);
}

export function getTrackById(id: string | null): Track | undefined {
  if (!id) return undefined;
  return ALL_TRACKS.find((t) => t.id === id);
}

export function getTracksInCategory(categoryId: string): Track[] {
  return ALL_TRACKS.filter((t) => t.categoryId === categoryId);
}

export function groupTracksByCategory(
  tracks: Track[],
): { category: MusicCategory; tracks: Track[] }[] {
  const groups = new Map<string, Track[]>();
  for (const track of tracks) {
    const list = groups.get(track.categoryId) ?? [];
    list.push(track);
    groups.set(track.categoryId, list);
  }

  return Array.from(groups, ([categoryId, categoryTracks]) => {
    const category = getCategoryById(categoryId);
    if (!category) return null;
    return { category, tracks: categoryTracks };
  }).filter((group): group is { category: MusicCategory; tracks: Track[] } =>
    group !== null,
  );
}
