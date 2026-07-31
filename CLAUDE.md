# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

Flowcus is a client-side focus timer (Pomodoro / Deep Work) with a live 3D motion
bubble (react-three-fiber) that reacts to ambient music amplitude, played via a
hidden YouTube IFrame player. Next.js App Router, no backend - all state is
local/localStorage.

## Commands

```bash
bun install      # install deps (README uses bun; a package-lock.json also exists - check with the user before switching package managers)
bun run dev       # start dev server at http://localhost:3000
bun run build     # production build
bun run lint      # eslint (eslint-config-next core-web-vitals + typescript)
```

There is no test suite/framework configured in this repo.

## Next.js version warning

This project pins a Next.js version that has breaking API/convention changes vs.
your training data. Before writing Next.js-specific code (routing, data fetching,
config, etc.), read the relevant guide under `node_modules/next/dist/docs/`.

## Architecture

```
app/                      Next.js App Router entry + global styles
components/               UI (controls, display, settings, top bar)
components/SoundPanel.tsx Expandable music chrome
components/YouTubePlayer.tsx  Hidden iframe player
components/timerStyles/   Timer-style renderers (3D bubble + shader)
context/                  Timer, Audio, and Theme React contexts
hooks/                    useTimer (rAF engine), useAudio (YouTube orchestration)
lib/timer/                Pure timer state machine + types
lib/audio/                Track manifest, YouTube helpers, phase chime
lib/chrome.ts             Shared top-bar surface tokens
lib/timerStyles/          Renderer registry + types
lib/persistence.ts        Typed localStorage load/save
```

Key design points to know before making changes:

- **Timer engine is pure + side-effect-free.** `lib/timer/machine.ts` only computes
  phase durations/transitions from `TimerSettings`; `hooks/useTimer.ts` owns the
  actual `requestAnimationFrame` + wall-clock loop (survives background-tab
  throttling) and exposes it through `context/TimerContext.tsx`. Keep new timer
  logic in the pure `lib/timer/` layer where possible so it stays easy to reason
  about.
- **Timer visuals are pluggable.** `lib/timerStyles/registry.ts` maps a style id to
  a dynamically-imported (`ssr: false`) component, since WebGL/three.js canvases
  can't run server-side. Add new visual styles by registering them here, not by
  branching in the consumer.
- **Music tracks are a static manifest.** `lib/audio/tracks.ts` defines
  `MUSIC_CATEGORIES` (stable ids like `cinematic`, `lofi`, `jazz`, `rainstorm`) and
  a flat track list referencing `categoryId` + a YouTube id via `parseYouTubeId()`.
  Next/prev skip navigation stays within the active category. See README's
  "Adding music tracks" section for the exact steps.
- **Audio amplitude is simulated, not measured** from the actual YouTube stream
  (no direct audio API access to the iframe) - `useAudio`/`useYouTubePlayer` drive
  a synthetic amplitude signal that feeds the bubble's shader distortion.
- **Persistence is one typed blob.** `lib/persistence.ts` load/saves a single
  `PersistedState` object (settings, mode, styleId, volume, trackId, theme) under
  one localStorage key, with defensive defaulting/clamping on load so malformed or
  outdated stored state never crashes the app.
- **Contexts are split by concern**: Timer, Audio, Theme are separate React
  contexts (`context/`) composed in `components/FlowcusRoot.tsx` /
  `components/FlowcusApp.tsx`, not one mega-context.
- shadcn/ui components live under `components/ui/` (`components.json` configures
  the CLI); prefer extending/using those over hand-rolling primitives.
