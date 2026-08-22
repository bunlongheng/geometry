// Tiny Web Audio helper for the quiz - no audio files, everything synthesized.
// Each cue is a short envelope of oscillator notes. Muted is caller-controlled.
// First call must come from a user gesture (Start button) so the context resumes.

let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!ctx) ctx = new AC();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

// Play a sequence of notes: [frequency(Hz), startOffset(s), duration(s)].
function notes(seq: [number, number, number][], type: OscillatorType, gain: number) {
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime;
  for (const [freq, off, dur] of seq) {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const start = t0 + off;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(gain, start + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(g).connect(c.destination);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }
}

// Feather-soft blip when a finger/cursor lands on an option.
export function playHover() {
  notes([[740, 0, 0.05]], "sine", 0.06);
}

// Bright ascending arpeggio - "you got it right".
export function playCorrect() {
  notes(
    [
      [660, 0, 0.12],
      [880, 0.09, 0.12],
      [1320, 0.18, 0.22],
    ],
    "triangle",
    0.18,
  );
}

// Clear low "uh-oh" buzz - wrong or time-out. Audible but never harsh.
export function playWrong() {
  notes(
    [
      [220, 0, 0.2],
      [165, 0.18, 0.32],
    ],
    "triangle",
    0.26,
  );
}

// Quiet tick for the last few seconds on the clock.
export function playTick() {
  notes([[1000, 0, 0.04]], "square", 0.04);
}

// Victory fanfare - triumphant rising run, played when the quiz is won.
export function playWin() {
  notes(
    [
      [523, 0, 0.16],
      [659, 0.14, 0.16],
      [784, 0.28, 0.16],
      [1047, 0.44, 0.4],
    ],
    "triangle",
    0.2,
  );
}

// Gentle descending "try again" - never harsh, she is 4.
export function playLose() {
  notes(
    [
      [494, 0, 0.18],
      [440, 0.16, 0.18],
      [392, 0.32, 0.3],
    ],
    "sine",
    0.14,
  );
}
