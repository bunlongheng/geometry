"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import ShapeSvg from "@/components/ShapeSvg";
import { getColor } from "@/lib/colors";
import {
  generateQuiz,
  QUESTION_COUNTS,
  starsFor,
  type Level,
  type Question,
  type QuizSettings,
  type Scope,
} from "@/lib/quiz";

const SETTINGS_KEY = "geometry-quiz-settings";

const DEFAULT_SETTINGS: QuizSettings = { level: "easy", scope: "2d", count: 5 };

const LEVEL_META: { id: Level; label: string; hint: string; emoji: string }[] = [
  { id: "easy", label: "Easy", hint: "Find the shape", emoji: "🌱" },
  { id: "medium", label: "Medium", hint: "Shapes + colors + counting", emoji: "🌟" },
  { id: "hard", label: "Hard", hint: "Tricky questions, 6 choices", emoji: "🔥" },
];

const SCOPE_META: { id: Scope; label: string; hint: string }[] = [
  { id: "2d", label: "2D", hint: "Flat shapes" },
  { id: "3d", label: "3D", hint: "Solid shapes" },
  { id: "mixed", label: "Both", hint: "Everything!" },
];

function loadSettings(): QuizSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<QuizSettings>;
    const level = LEVEL_META.some((l) => l.id === parsed.level)
      ? (parsed.level as Level)
      : DEFAULT_SETTINGS.level;
    const scope = SCOPE_META.some((s) => s.id === parsed.scope)
      ? (parsed.scope as Scope)
      : DEFAULT_SETTINGS.scope;
    const count = QUESTION_COUNTS.includes(
      parsed.count as (typeof QUESTION_COUNTS)[number],
    )
      ? (parsed.count as number)
      : DEFAULT_SETTINGS.count;
    return { level, scope, count };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

interface ConfettiPiece {
  left: string;
  top: string;
  color: string;
  cx: string;
  cy: string;
  cr: string;
  delay: string;
}

function makeConfetti(): ConfettiPiece[] {
  const hues = ["#ef4d4d", "#f7c526", "#3cb96e", "#3f7de0", "#f06ea9", "#8e5fd8"];
  return Array.from({ length: 18 }, (_, i) => ({
    left: `${8 + Math.random() * 84}%`,
    top: `${20 + Math.random() * 30}%`,
    color: hues[i % hues.length],
    cx: `${(Math.random() - 0.5) * 160}px`,
    cy: `${60 + Math.random() * 120}px`,
    cr: `${(Math.random() - 0.5) * 720}deg`,
    delay: `${Math.random() * 0.15}s`,
  }));
}

function OptionCard({
  question,
  index,
  picked,
  onPick,
}: {
  question: Question;
  index: number;
  picked: number | null;
  onPick: (i: number) => void;
}) {
  const option = question.options[index];
  const answered = picked !== null;
  const isAnswer = index === question.answerIndex;
  const isPicked = picked === index;
  const state = !answered
    ? "idle"
    : isAnswer
      ? "correct"
      : isPicked
        ? "wrong"
        : "dim";

  return (
    <button
      type="button"
      disabled={answered}
      onClick={() => onPick(index)}
      className={`sticker flex min-h-24 flex-col items-center justify-center gap-1 p-4 transition-all ${
        state === "idle" ? "sticker-press" : ""
      } ${state === "correct" && answered ? "animate-bounce-big" : ""} ${
        state === "wrong" ? "animate-shake" : ""
      } ${state === "dim" ? "opacity-40" : ""}`}
      style={
        state === "correct" && answered
          ? { borderColor: "var(--good)", boxShadow: "0 5px 0 var(--good)" }
          : state === "wrong"
            ? { borderColor: "var(--bad)", boxShadow: "0 5px 0 var(--bad)" }
            : undefined
      }
      aria-label={
        option.kind === "text"
          ? option.label
          : `${getColor(option.colorId).name} shape option ${index + 1}`
      }
    >
      {option.kind === "shape" ? (
        <ShapeSvg shapeId={option.shapeId} colorId={option.colorId} className="h-20 w-20 sm:h-24 sm:w-24" />
      ) : (
        <span className="font-display text-4xl font-bold">{option.label}</span>
      )}
    </button>
  );
}

export default function QuizGame() {
  const [phase, setPhase] = useState<"setup" | "play" | "done">("setup");
  const [settings, setSettings] = useState<QuizSettings>(DEFAULT_SETTINGS);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSettings(loadSettings());
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

  const updateSettings = (patch: Partial<QuizSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      } catch {
        // Not persisted - fine.
      }
      return next;
    });
  };

  const start = () => {
    setQuestions(generateQuiz(settings, Date.now() >>> 0));
    setCurrent(0);
    setPicked(null);
    setCorrectCount(0);
    setConfetti([]);
    setPhase("play");
  };

  const question = questions[current];

  const pickOption = (index: number) => {
    if (picked !== null || !question) return;
    setPicked(index);
    const correct = index === question.answerIndex;
    if (correct) {
      setCorrectCount((n) => n + 1);
      setConfetti(makeConfetti());
    }
    advanceTimer.current = setTimeout(
      () => {
        setConfetti([]);
        setPicked(null);
        if (current + 1 >= questions.length) {
          setPhase("done");
        } else {
          setCurrent((i) => i + 1);
        }
      },
      correct ? 1100 : 1900,
    );
  };

  const stars = useMemo(
    () => starsFor(correctCount, questions.length),
    [correctCount, questions.length],
  );

  if (phase === "setup") {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-xl font-bold">How tricky?</h2>
          <div className="grid grid-cols-3 gap-3">
            {LEVEL_META.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => updateSettings({ level: l.id })}
                aria-pressed={settings.level === l.id}
                className={`sticker sticker-press flex flex-col items-center gap-1 px-2 py-4 ${
                  settings.level === l.id ? "bg-accent text-white" : ""
                }`}
                style={settings.level === l.id ? { borderColor: "transparent" } : undefined}
              >
                <span className="text-2xl" aria-hidden>
                  {l.emoji}
                </span>
                <span className="font-display text-lg font-bold">{l.label}</span>
                <span
                  className={`text-center text-xs font-semibold leading-tight ${
                    settings.level === l.id ? "text-white/85" : "text-ink-soft"
                  }`}
                >
                  {l.hint}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-xl font-bold">Which shapes?</h2>
          <div className="grid grid-cols-3 gap-3">
            {SCOPE_META.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => updateSettings({ scope: s.id })}
                aria-pressed={settings.scope === s.id}
                className={`sticker sticker-press flex flex-col items-center gap-1 px-2 py-4 ${
                  settings.scope === s.id ? "bg-accent text-white" : ""
                }`}
                style={settings.scope === s.id ? { borderColor: "transparent" } : undefined}
              >
                <span className="font-display text-2xl font-bold">{s.label}</span>
                <span
                  className={`text-xs font-semibold ${
                    settings.scope === s.id ? "text-white/85" : "text-ink-soft"
                  }`}
                >
                  {s.hint}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-xl font-bold">How many questions?</h2>
          <div className="grid grid-cols-3 gap-3">
            {QUESTION_COUNTS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => updateSettings({ count: n })}
                aria-pressed={settings.count === n}
                className={`sticker sticker-press py-3 font-display text-2xl font-bold ${
                  settings.count === n ? "bg-accent text-white" : ""
                }`}
                style={settings.count === n ? { borderColor: "transparent" } : undefined}
              >
                {n}
              </button>
            ))}
          </div>
        </section>

        <button
          type="button"
          onClick={start}
          className="sticker sticker-press mt-2 bg-good py-4 font-display text-2xl font-bold text-white"
          style={{ borderColor: "transparent" }}
        >
          Start!
        </button>
      </div>
    );
  }

  if (phase === "play" && question) {
    const answeredCorrect = picked !== null && picked === question.answerIndex;
    return (
      <div className="relative mx-auto flex w-full max-w-lg flex-col gap-5">
        {confetti.length > 0 ? (
          <div className="pointer-events-none absolute inset-0 z-10" aria-hidden>
            {confetti.map((p, i) => (
              <span
                key={i}
                className="absolute h-3 w-3 rounded-sm"
                style={
                  {
                    left: p.left,
                    top: p.top,
                    backgroundColor: p.color,
                    "--cx": p.cx,
                    "--cy": p.cy,
                    "--cr": p.cr,
                    animation: `confetti-fall 0.9s ease-out ${p.delay} both`,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-3">
          <span className="font-display text-lg font-bold text-ink-soft">
            {current + 1} / {questions.length}
          </span>
          <div
            className="h-3 flex-1 overflow-hidden rounded-full bg-bg-soft"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={questions.length}
            aria-valuenow={current + 1}
          >
            <div
              className="h-full rounded-full bg-accent transition-all duration-500"
              style={{ width: `${((current + 1) / questions.length) * 100}%` }}
            />
          </div>
          <span className="font-display text-lg font-bold text-good">{correctCount} ✓</span>
        </div>

        <h2 key={current} className="animate-rise-in text-center font-display text-3xl font-bold">
          {question.prompt}
        </h2>

        <div
          key={`options-${current}`}
          className={`animate-rise-in grid gap-3 ${
            question.options.length > 4 ? "grid-cols-3" : "grid-cols-2"
          }`}
        >
          {question.options.map((_, i) => (
            <OptionCard
              key={i}
              question={question}
              index={i}
              picked={picked}
              onPick={pickOption}
            />
          ))}
        </div>

        <div className="min-h-14 text-center" aria-live="polite">
          {picked !== null ? (
            <p className="animate-pop-in font-semibold">
              <span
                className={`font-display text-xl font-bold ${
                  answeredCorrect ? "text-good" : "text-bad"
                }`}
              >
                {answeredCorrect ? "Yes! " : "Almost! "}
              </span>
              {question.explain}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  // done
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-6 text-center">
      <div className="flex gap-2 pt-4" aria-label={`${stars} out of 3 stars`}>
        {[0, 1, 2].map((i) => (
          <svg
            key={i}
            viewBox="0 0 24 24"
            className={`h-16 w-16 ${i < stars ? "animate-star-pop" : ""}`}
            style={{ animationDelay: `${0.2 + i * 0.25}s` }}
            aria-hidden
          >
            <path
              d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.7L12 16.8 5.9 20.3l1.5-6.7L2.2 9l6.9-.7Z"
              fill={i < stars ? "#ffc93c" : "var(--line)"}
              stroke={i < stars ? "#d9a410" : "var(--ink-soft)"}
              strokeWidth="1"
              strokeLinejoin="round"
            />
          </svg>
        ))}
      </div>
      <div>
        <h2 className="font-display text-4xl font-bold">
          {stars === 3
            ? "Amazing!"
            : stars === 2
              ? "Great job!"
              : stars === 1
                ? "Good try!"
                : "Keep practicing!"}
        </h2>
        <p className="mt-2 text-lg font-semibold text-ink-soft">
          You got <span className="text-ink">{correctCount}</span> out of{" "}
          <span className="text-ink">{questions.length}</span> right.
        </p>
      </div>
      <div className="flex w-full flex-col gap-3">
        <button
          type="button"
          onClick={start}
          className="sticker sticker-press bg-good py-3.5 font-display text-xl font-bold text-white"
          style={{ borderColor: "transparent" }}
        >
          Play again
        </button>
        <button
          type="button"
          onClick={() => setPhase("setup")}
          className="sticker sticker-press py-3.5 font-display text-xl font-bold"
        >
          Change settings
        </button>
        <Link
          href="/study"
          className="sticker sticker-press py-3.5 font-display text-xl font-bold"
        >
          Study the shapes
        </Link>
      </div>
    </div>
  );
}
