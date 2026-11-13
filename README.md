# Flowcus

A calm, client-side focus timer that pairs a living 3D motion bubble with
ambient sound. Built with Next.js, react-three-fiber, and the YouTube IFrame API.

## Features

- **Timer modes**
  - Pomodoro - 25 min focus / 5 min break, fully customizable
  - Deep Work - one long 90 min focus block (customizable)
  - Accurate `requestAnimationFrame` + wall-clock timing that survives
    background tab throttling
- **Ambient music player** (top-left `SoundPanel`)
  - YouTube streams via a hidden iframe player
  - Categories with stable IDs (`cinematic`, `lofi`, `jazz`, `rainstorm`) and display labels
  - Multiple tracks per category; skip next/prev cycles within the active category only
  - Category dropdown switches category; unavailable videos are skipped gracefully
  - Simulated amplitude drives the 3D bubble visuals
- **Timer visuals** (center, switchable from the top bar)
  - **3D Bubble** - fluid blobs that distort and pulse to the music amplitude,
    winding down to stillness when nothing is playing or running
  - **Aurora** - northern-lights curtains over a starry sky (a pastel dawn in light mode)
  - **Stardust** - a slowly turning particle galaxy; music sends ripples through the disc
  - **Caustics** - sunlight caustics drifting across a pool floor
  - **Horizon** - a sun (moon in dark mode) rises over still water as the phase elapses
  - All 3D motions are single-draw-call shaders sharing one canvas shell
    (`MotionCanvas`): on-demand rendering while idle, paused in background tabs,
    DPR drops on slow devices
  - **Minimal** - a single hairline ring that depletes as the phase elapses,
    with no ambient motion at all (SVG, no WebGL)
  - Pluggable renderer registry so new timer styles slot in easily
- **Chrome controls** (top bar)
  - Light/dark theme toggle
  - Visual style switcher (timer style registry)
- **Settings** - custom durations and auto-start next phase
- **Persistence** - preferences saved to `localStorage`
- Respects `prefers-reduced-motion`

## Getting started

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Adding music tracks

Edit [`lib/audio/tracks.ts`](lib/audio/tracks.ts).

1. Add a category to `MUSIC_CATEGORIES` (if needed):

```ts
{ id: "cinematic", label: "🚀 Cinematic" }
```

2. Append a track entry referencing `categoryId` and a YouTube URL via `parseYouTubeId()`:

```ts
{
  id: "7",
  title: "Track title",
  categoryId: "cinematic",
  youtubeId: parseYouTubeId("https://youtu.be/...")!,
}
```

Each track needs a unique `id` string. Skip navigation stays within the same `categoryId`.

## Architecture

```
app/                      Next.js App Router entry + global styles
components/               UI (controls, display, settings, top bar)
components/SoundPanel.tsx Expandable music chrome
components/YouTubePlayer.tsx  Hidden iframe player
components/timerStyles/   Timer-style renderers (3D bubble)
context/                  Timer, Audio, and Theme React contexts
hooks/                    useTimer (rAF engine), useAudio (YouTube orchestration)
lib/timer/                Pure timer state machine + types
lib/audio/                Track manifest, YouTube helpers, phase chime
lib/chrome.ts             Shared top-bar surface tokens
lib/timerStyles/          Renderer registry + types
lib/persistence.ts        Typed localStorage load/save
```

## Deploy

The project includes [`netlify.toml`](netlify.toml) with `@netlify/plugin-nextjs`.
Run `bun run build` and deploy the output with any Netlify-compatible workflow.

## Scripts

- `bun run dev` - start the dev server
- `bun run build` - production build
- `bun run lint` - lint
