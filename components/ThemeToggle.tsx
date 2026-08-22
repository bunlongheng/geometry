"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "geometry-theme";

// The pre-paint script in layout.tsx has already set data-theme by the time this
// mounts, so we read the resolved value from the DOM instead of guessing.
export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private-mode Safari - the theme just will not persist.
    }
    setTheme(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="sticker sticker-press flex h-10 w-10 items-center justify-center text-lg"
      style={{ borderRadius: "9999px" }}
    >
      {theme === null ? (
        <span className="h-5 w-5 rounded-full bg-line" aria-hidden />
      ) : theme === "dark" ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-sunny" aria-hidden>
          <path d="M12 4.5a1 1 0 0 1-1-1v-1a1 1 0 1 1 2 0v1a1 1 0 0 1-1 1Zm0 18a1 1 0 0 1-1-1v-1a1 1 0 1 1 2 0v1a1 1 0 0 1-1 1ZM4.5 12a1 1 0 0 1-1 1h-1a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1Zm18 0a1 1 0 0 1-1 1h-1a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1ZM6.34 6.34a1 1 0 0 1-1.41 0l-.71-.71a1 1 0 0 1 1.41-1.41l.71.71a1 1 0 0 1 0 1.41Zm13.44 13.44a1 1 0 0 1-1.41 0l-.71-.71a1 1 0 0 1 1.41-1.41l.71.71a1 1 0 0 1 0 1.41ZM6.34 17.66a1 1 0 0 1 0 1.41l-.71.71a1 1 0 1 1-1.41-1.41l.71-.71a1 1 0 0 1 1.41 0ZM19.78 4.22a1 1 0 0 1 0 1.41l-.71.71a1 1 0 1 1-1.41-1.41l.71-.71a1 1 0 0 1 1.41 0ZM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-ink" aria-hidden>
          <path d="M20.6 14.5A8.5 8.5 0 0 1 9.5 3.4 8.5 8.5 0 1 0 20.6 14.5Z" />
        </svg>
      )}
    </button>
  );
}
