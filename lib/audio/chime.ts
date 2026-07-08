let chimeCtx: AudioContext | null = null;

/**
 * Plays a soft two-note bell to mark a phase change. Uses its own lightweight
 * AudioContext so it works even when no music is playing.
 */
export function playChime(): void {
  if (typeof window === "undefined") return;
  try {
    chimeCtx ??= new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();
    const ctx = chimeCtx;
    void ctx.resume();

    const now = ctx.currentTime;
    const notes = [660, 880];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;

      const start = now + i * 0.16;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.22, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.1);

      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 1.2);
    });
  } catch {
    /* audio unavailable - non-fatal */
  }
}
