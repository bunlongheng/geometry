// Speak quiz text aloud using the browser's built-in speech synthesis, so a
// pre-reader can play. No-op when unsupported; each call cancels the previous
// utterance so rapid taps do not queue up. iOS unlocks speech on the first
// user-gesture call (the Start button), after which auto-speaks work.
export function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  } catch {
    /* speech not available - silently ignore */
  }
}

export function stopSpeaking() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
}
