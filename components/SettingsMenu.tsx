"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { GearIcon, SpeakerOffIcon, SpeakerOnIcon } from "@/components/Icons";
import { stopSpeaking } from "@/components/speak";

const SOUND_KEY = "geometry-sound";
const THEME_KEY = "geometry-theme";

function SunIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 4.5a1 1 0 0 1-1-1v-1a1 1 0 1 1 2 0v1a1 1 0 0 1-1 1Zm0 18a1 1 0 0 1-1-1v-1a1 1 0 1 1 2 0v1a1 1 0 0 1-1 1ZM4.5 12a1 1 0 0 1-1 1h-1a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1Zm18 0a1 1 0 0 1-1 1h-1a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1ZM6.34 6.34a1 1 0 0 1-1.41 0l-.71-.71a1 1 0 0 1 1.41-1.41l.71.71a1 1 0 0 1 0 1.41Zm13.44 13.44a1 1 0 0 1-1.41 0l-.71-.71a1 1 0 0 1 1.41-1.41l.71.71a1 1 0 0 1 0 1.41ZM6.34 17.66a1 1 0 0 1 0 1.41l-.71.71a1 1 0 1 1-1.41-1.41l.71-.71a1 1 0 0 1 1.41 0ZM19.78 4.22a1 1 0 0 1 0 1.41l-.71.71a1 1 0 1 1-1.41-1.41l.71-.71a1 1 0 0 1 1.41 0ZM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M20.6 14.5A8.5 8.5 0 0 1 9.5 3.4 8.5 8.5 0 1 0 20.6 14.5Z" />
    </svg>
  );
}

// The header gear: 1 menu holding sound + theme (and quiz options on /quiz),
// so the top bar stays just Study / Quiz / gear.
export default function SettingsMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    try {
      setSoundOn(localStorage.getItem(SOUND_KEY) !== "off");
    } catch {
      /* default on */
    }
    setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  }, []);

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

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* not persisted - fine */
    }
    setTheme(next);
  };

  const openQuizSettings = () => {
    window.dispatchEvent(new CustomEvent("geometry-quiz-open-settings"));
    setOpen(false);
  };

  const row =
    "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 font-display text-base font-semibold hover:bg-bg-soft";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Settings"
        aria-expanded={open}
        className={`sticker sticker-press flex h-10 w-10 items-center justify-center ${
          open ? "sticker-selected" : ""
        }`}
        style={{ borderRadius: "9999px" }}
      >
        <GearIcon className="h-5 w-5" />
      </button>

      {open ? (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div className="sticker animate-pop-in absolute right-0 top-12 z-50 flex w-52 flex-col gap-1 p-2">
            <button type="button" onClick={toggleSound} className={row}>
              {soundOn ? (
                <SpeakerOnIcon className="h-5 w-5" />
              ) : (
                <SpeakerOffIcon className="h-5 w-5" />
              )}
              Sound {soundOn ? "on" : "off"}
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className={row}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <SunIcon className="h-5 w-5 text-sunny" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
            {pathname === "/quiz" ? (
              <button type="button" onClick={openQuizSettings} className={row}>
                <GearIcon className="h-5 w-5" />
                Quiz options
              </button>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
