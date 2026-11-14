# Ideas

Candidate features for Flowcus, with the reasoning attached so they do not get
re-litigated from scratch. Written 2026-08-21.

Nothing here is committed work. The README describes what exists; this file
describes what might.

## Principles these were filtered through

Three decisions constrain everything below. They are the reason most of a
normal focus-timer feature list appears under "Rejected".

1. **Flowcus is an ambient instrument, not a productivity tool.** The visual and
   the sound are the product; the timer is the excuse. Engineering has gone into
   a fluid shader and a music player, not a task list, and that is the correct
   emphasis. Competing with Pomofocus/Session on features means competing where
   Flowcus has no edge, on a screen that is supposed to be calm.
2. **Client-side is a hard constraint.** No backend, no accounts, no sync. The
   appeal is a URL that loads instantly and asks nothing of you. An account
   screen is a tax on a focus tool. `localStorage` covers what needs covering.
3. **Timer visuals may express `phase`/`progress`, but are not required to.**
   Per-motion choice, not a contract. A minimal ring showing progress is useful;
   the bubble encoding progress as colour would be unreadable.

## Accepted

### 1. Warm/cool phase palette on the bubble

The README promised this for a while before anyone noticed the shader did not do
it (corrected 2026-08-21). It is still the right idea: `fluidBlobShader` lerps its
palette on `phase`, so a break *feels* different without needing a label to say
so. This is the one place `phase` clearly earns its keep in the bubble.

Open question deferred: whether a warm/cool shift survives both light and dark
themes without going muddy. That is a design exercise, not a coding one.

### 2. Fullscreen / zen mode

One keypress hides all chrome, leaving only the motion and the numerals. Native
Fullscreen API, roughly fifteen lines. Highest ratio of felt-calm to code in the
whole list, and it needs no new state, no persistence, no settings entry.

### 3. Keyboard shortcuts

Space to start/pause, `R` reset, `S` skip, `F` fullscreen. A focus tool you have
to aim a mouse at is a focus tool that breaks focus. Pairs directly with zen
mode, which is unusable without them.

### 4. Phase transition ceremony

The end of a focus block currently plays a chime and swaps a text label. It
could be the most satisfying second in the app: motion swells, palette shifts,
numerals recompose, then settle. Pure ambience layered on a transition that
already exists in `useTimer.advancePhase` and `onPhaseComplete`. No new state.

Overlaps with idea 1 (both touch the phase boundary); building 1 first makes 4
cheaper.

## Done

- **More motions.** Once deferred because two styles covered "beautiful" and
  "still". Shipped 2026-11 as Aurora, Stardust (the particle drift idea), Caustics
  and Horizon/Sunrise, alongside Bubble and Minimal. All share `MotionCanvas` and
  follow the light/dark theme. Horizon is the one that expresses `progress`: the
  sun or moon rises over the session.

## Considered, not taken

- **Real audio amplitude.** The bubble reacts to a *simulated* signal; YouTube
  gives no access to the stream. Self-hosted audio plus a WebAudio
  `AnalyserNode` would make it real. Held back because it changes what the
  product is, not just what it has: it means abandoning the YouTube catalogue.
- **Session length presets** (Quick 15 / Standard 25 / Long 50) instead of number
  inputs. Less config, more choosing. Small, pleasant, not urgent.
- **Volume ducking on break.** Might read as thoughtful, might read as broken.
- **Custom YouTube URL input.** Genuinely useful and a tiny diff, but in tension
  with the curated-catalogue feel.

## Rejected

- **Task list / todos.** Puts work on the screen you are trying to be calm in
  front of. Directly against principle 1.
- **Session history, streaks, stats.** Measurement is the opposite of flow, and
  this is productivity-tool territory, not ambient-instrument territory.
- **Notifications / desktop alerts.** A permission prompt on a page whose entire
  pitch is that it asks nothing of you.
- **Sharing, sync, accounts.** Principle 2.
- **Spotify integration.** OAuth needs a backend. Principle 2.
- **Breathing pacer.** A real idea, but it is a feature wearing a timer style's
  clothes. If it is ever built it should be an explicit mode, not a motion that
  quietly paces your breathing without asking.
