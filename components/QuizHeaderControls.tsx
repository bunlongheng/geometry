"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { GearIcon, SpeakerOffIcon, SpeakerOnIcon } from "@/components/Icons";
import { stopSpeaking } from "@/components/speak";

const SOUND_KEY = "geometry-sound";

// Quiz controls that live IN the app header (owner rule: all controls top
// right, in the top bar). They only render on /quiz and talk to QuizGame via
// window events so the header can stay a server component around them.
export default function QuizHeaderControls() {
  const pathname = usePathname();
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    try {
      setSoundOn(localStorage.getItem(SOUND_KEY) !== "off");
    } catch {
      /* default on */
    }
  }, []);

  if (pathname !== "/quiz") return null;

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    try {
      localStorage.setItem(SOUND_KEY, next ? "on" : "off");
    } catch {
      /* fine */
    }
    if (!next) stopSpeaking();
    window.dispatchEvent(new CustomEvent("geometry-sound", { detail: next }));
  };

  const openSettings = () => {
    window.dispatchEvent(new CustomEvent("geometry-quiz-open-settings"));
  };

  return (
    <>
      <button
        type="button"
        onClick={toggleSound}
        aria-label={soundOn ? "Turn sound off" : "Turn sound on"}
        className="sticker sticker-press flex h-10 w-10 items-center justify-center"
        style={{ borderRadius: "9999px" }}
      >
        {soundOn ? <SpeakerOnIcon className="h-5 w-5" /> : <SpeakerOffIcon className="h-5 w-5" />}
      </button>
      <button
        type="button"
        onClick={openSettings}
        aria-label="Quiz settings"
        className="sticker sticker-press flex h-10 w-10 items-center justify-center"
        style={{ borderRadius: "9999px" }}
      >
        <GearIcon className="h-5 w-5" />
      </button>
    </>
  );
}
