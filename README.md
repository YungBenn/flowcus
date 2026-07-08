# Flowcus

A calm, client-side focus timer that pairs a living 3D motion bubble with
ambient sound. Built with Next.js, react-three-fiber, and the Web Audio API.

## Features

- **Timer modes**
  - Pomodoro - 25 min focus / 5 min break, fully customizable
  - Deep Work - one long 90 min focus block (customizable)
  - Accurate `requestAnimationFrame` + wall-clock timing that survives
    background tab throttling
- **Ambient music player** (top-left)
  - Synthesized noise: rain, brown, pink, white (Web Audio, no files needed)
  - Bundled lofi slots that gracefully degrade until you add audio files
  - Shared `AudioContext` + `AnalyserNode` so visuals react to sound
- **3D motion bubble** (center)
  - Distorts and pulses to live music amplitude
  - Color shifts with timer progress; warm palette for focus, cool for breaks
  - Pluggable renderer registry so new timer styles slot in easily
- **Settings** - custom durations and auto-start next phase
- **Persistence** - preferences saved to `localStorage`
- Respects `prefers-reduced-motion`

## Getting started

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Adding lofi tracks

Drop royalty-free `.mp3` files into [`public/audio`](public/audio) matching the
`src` entries in [`lib/audio/tracks.ts`](lib/audio/tracks.ts). Missing files are
shown greyed out and skipped; the synthesized noise voices always work.

## Architecture

```
app/                 Next.js App Router entry + global styles
components/           UI (player, controls, display, settings, switcher)
components/timerStyles/  Timer-style renderers (3D bubble)
context/              Timer + Audio React contexts
hooks/                useTimer (rAF engine), useAudio (Web Audio graph)
lib/timer/            Pure timer state machine + types
lib/audio/            Noise generators, track manifest, chime
lib/timerStyles/      Renderer registry + types
lib/persistence.ts    Typed localStorage load/save
```

## Scripts

- `bun run dev` - start the dev server
- `bun run build` - production build
- `bun run lint` - lint
