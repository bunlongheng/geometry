"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ShapeSvg from "@/components/ShapeSvg";
import { RetryIcon, TargetIcon, TrophyIcon } from "@/components/Icons";
import { RocketFlyer, ShootingStarFlyer, SuperKidFlyer } from "@/components/Flyers";
import { speak, stopSpeaking } from "@/components/speak";
import { playCorrect, playHover, playLose, playTick, playWin, playWrong } from "@/components/sound";
import { getColor } from "@/lib/colors";
import {
  generateQuiz,
  gradeFor,
  QUIZ_LENGTH,
  type Level,
  type Question,
  type QuizSettings,
  type Scope,
} from "@/lib/quiz";

const SETTINGS_KEY = "geometry-quiz-settings";
const SOUND_KEY = "geometry-sound";

const DEFAULT_SETTINGS: QuizSettings = { level: "easy", scope: "2d", count: QUIZ_LENGTH };

// Per-question countdown shrinks as the level goes up (countries quiz pattern).
// Difficulty reads as a star rating: 1, 2, or 3 stars.
const LEVEL_META: { id: Level; label: string; hint: string; stars: number; secs: number }[] = [
  { id: "easy", label: "Easy", hint: "Find the shape - 20s", stars: 1, secs: 20 },
  { id: "medium", label: "Medium", hint: "Shapes + colors - 15s", stars: 2, secs: 15 },
  { id: "hard", label: "Hard", hint: "Tricky questions - 10s", stars: 3, secs: 10 },
];

// Each scope shows 1 shape from its own pool as its icon.
const SCOPE_META: {
  id: Scope;
  label: string;
  hint: string;
  icon: { id: string; color: "red" | "green" | "blue" | "orange" | "purple" };
}[] = [
  { id: "2d", label: "2D", hint: "Flat shapes", icon: { id: "circle", color: "red" } },
  { id: "3d", label: "3D", hint: "Solid shapes", icon: { id: "cube", color: "green" } },
  { id: "lines", label: "Lines", hint: "Rays + more", icon: { id: "line", color: "blue" } },
  { id: "angles", label: "Angles", hint: "Corners!", icon: { id: "right-angle", color: "orange" } },
  { id: "mixed", label: "All", hint: "Everything!", icon: { id: "hexagon", color: "purple" } },
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
    return { level, scope, count: QUIZ_LENGTH };
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

function makeConfetti(gold: boolean): ConfettiPiece[] {
  const hues = gold
    ? ["#ffc93c", "#f7c526", "#ffe08a", "#f7a826", "#fff3c4"]
    : ["#ef4d4d", "#f7c526", "#3cb96e", "#3f7de0", "#f06ea9", "#8e5fd8"];
  return Array.from({ length: 36 }, (_, i) => ({
    left: `${4 + Math.random() * 92}%`,
    top: `${2 + Math.random() * 30}%`,
    color: hues[i % hues.length],
    cx: `${(Math.random() - 0.5) * 240}px`,
    cy: `${100 + Math.random() * 200}px`,
    cr: `${(Math.random() - 0.5) * 720}deg`,
    delay: `${Math.random() * 0.5}s`,
  }));
}

type Picked = number | "timeout" | null;
type Outcome = "correct" | "wrong";

function OptionCard({
  question,
  index,
  picked,
  onPick,
  onHover,
}: {
  question: Question;
  index: number;
  picked: Picked;
  onPick: (i: number) => void;
  onHover: () => void;
}) {
  const option = question.options[index];
  const answered = picked !== null;
  const isPicked = picked === index;
  const isRight = isPicked && index === question.answerIndex;
  // Owner rule: only the tapped option gets colored - green if right, red if
  // wrong. Everything else stays untouched.
  return (
    <button
      type="button"
      disabled={answered}
      onClick={() => onPick(index)}
      onMouseEnter={onHover}
      onFocus={onHover}
      className={`sticker flex h-full flex-col items-center justify-center gap-1 p-4 ${
        !answered ? "sticker-press" : ""
      }`}
      style={
        isPicked
          ? isRight
            ? { borderColor: "var(--good)", borderWidth: 3 }
            : { borderColor: "var(--bad)", borderWidth: 3 }
          : undefined
      }
      aria-label={
        option.kind === "text"
          ? option.label
          : `${getColor(option.colorId).name} shape option ${index + 1}`
      }
    >
      {option.kind === "shape" ? (
        <ShapeSvg shapeId={option.shapeId} colorId={option.colorId} className="h-full max-h-36 w-auto min-h-20" />
      ) : (
        <span className="font-display text-5xl font-bold">{option.label}</span>
      )}
    </button>
  );
}

export default function QuizGame() {
  const [phase, setPhase] = useState<"setup" | "play" | "done">("setup");
  const [settings, setSettings] = useState<QuizSettings>(DEFAULT_SETTINGS);
  const [soundOn, setSoundOn] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [picked, setPicked] = useState<Picked>(null);
  const [results, setResults] = useState<Outcome[]>([]);
  const [remaining, setRemaining] = useState(0);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [flyer, setFlyer] = useState<"super" | "star" | "rocket" | null>(null);
  const flyerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deadlineRef = useRef(0);
  const tickAtRef = useRef(0);
  // Which question index has been read aloud - each question is spoken EXACTLY
  // once (owner rule), never re-read on rerenders or dev double-effects.
  const spokenRef = useRef(-1);

  const secsPerQ = LEVEL_META.find((l) => l.id === settings.level)?.secs ?? 20;
  const correctCount = results.filter((r) => r === "correct").length;

  useEffect(() => {
    setSettings(loadSettings());
    try {
      setSoundOn(localStorage.getItem(SOUND_KEY) !== "off");
    } catch {
      /* default on */
    }
    // The sound + gear buttons live in the app header (QuizHeaderControls) and
    // talk to the game through these window events.
    const onSound = (e: Event) => setSoundOn(Boolean((e as CustomEvent).detail));
    const onOpenSettings = () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      stopSpeaking();
      setPicked(null);
      setConfetti([]);
      setPhase("setup");
    };
    window.addEventListener("geometry-sound", onSound);
    window.addEventListener("geometry-quiz-open-settings", onOpenSettings);
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      if (flyerTimer.current) clearTimeout(flyerTimer.current);
      stopSpeaking();
      window.removeEventListener("geometry-sound", onSound);
      window.removeEventListener("geometry-quiz-open-settings", onOpenSettings);
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
    const qs = generateQuiz(settings, Date.now() >>> 0);
    setQuestions(qs);
    setCurrent(0);
    setPicked(null);
    setResults([]);
    setConfetti([]);
    setPhase("play");
    // Called from the Start tap (a user gesture) - this unlocks speech on iOS
    // and reads the 1st question right away.
    spokenRef.current = 0;
    if (soundOn && qs[0]) speak(qs[0].prompt);
  };

  const question = questions[current];

  const pickOption = useCallback(
    (index: number | "timeout") => {
      if (picked !== null || !question) return;
      setPicked(index);
      const correct = index !== "timeout" && index === question.answerIndex;
      setResults((r) => [...r, correct ? "correct" : "wrong"]);
      stopSpeaking();
      if (soundOn) {
        if (correct) playCorrect();
        else playWrong();
      }
      // Motivation fly-bys: 1st correct, 5th correct, and question 9 no matter
      // what - a little cheer to carry her to the finish line.
      const newCorrect = correctCount + (correct ? 1 : 0);
      let cheer: "super" | "star" | "rocket" | null = null;
      if (correct && newCorrect === 1) cheer = "super";
      else if (correct && newCorrect === 5) cheer = "star";
      else if (current + 1 === 9) cheer = "rocket";
      if (cheer) {
        setFlyer(cheer);
        if (flyerTimer.current) clearTimeout(flyerTimer.current);
        flyerTimer.current = setTimeout(() => setFlyer(null), 1900);
      }
      advanceTimer.current = setTimeout(
        () => {
          setPicked(null);
          if (current + 1 >= questions.length) {
            setPhase("done");
          } else {
            setCurrent((i) => i + 1);
          }
        },
        correct ? 1300 : 2300,
      );
    },
    [picked, question, soundOn, current, questions.length, correctCount],
  );

  // Countdown for the active, unanswered question (deadline-based, 100ms tick).
  useEffect(() => {
    if (phase !== "play" || picked !== null) return;
    deadlineRef.current = performance.now() + secsPerQ * 1000;
    tickAtRef.current = secsPerQ;
    setRemaining(secsPerQ * 1000);
    const id = setInterval(() => {
      const left = Math.max(0, deadlineRef.current - performance.now());
      // Background tab: freeze the countdown so a forgotten quiz never times
      // out and plays sounds on its own.
      if (document.hidden) {
        deadlineRef.current = performance.now() + left;
        return;
      }
      setRemaining(left);
      const secs = Math.ceil(left / 1000);
      if (secs <= 5 && secs > 0 && secs < tickAtRef.current) {
        tickAtRef.current = secs;
        if (soundOn) playTick();
      }
      if (left <= 0) {
        clearInterval(id);
        pickOption("timeout");
      }
    }, 100);
    return () => clearInterval(id);
  }, [phase, current, picked, secsPerQ, pickOption, soundOn]);

  // Read each new question aloud ONCE (the 1st is spoken from the Start tap).
  useEffect(() => {
    if (phase !== "play" || !question || picked !== null) return;
    if (spokenRef.current === current) return;
    spokenRef.current = current;
    if (soundOn) speak(question.prompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- speak once per question
  }, [current, phase]);

  // End-of-quiz celebration: confetti ONLY here, and only for a passing grade.
  useEffect(() => {
    if (phase !== "done") return;
    const grade = gradeFor(correctCount, questions.length);
    if (grade.band === "perfect" || grade.band === "pass") {
      setConfetti(makeConfetti(grade.band === "perfect"));
      if (soundOn) playWin();
    } else if (soundOn) {
      playLose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once on entering done
  }, [phase]);

  const secondsLeft = Math.ceil(remaining / 1000);
  const timeLow = picked === null && secondsLeft <= 5;

  let content: React.ReactNode = null;

  if (phase === "setup") {
    content = (
      <>
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold">Quiz time!</h1>
          <p className="mt-1 font-semibold text-ink-soft">
            Pick your level and shapes, beat the timer, score up to 100!
          </p>
        </div>
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
                  settings.level === l.id ? "sticker-selected" : ""
                }`}
              >
                <span className="flex gap-0.5" aria-hidden>
                  {Array.from({ length: l.stars }, (_, i) => (
                    <ShapeSvg key={i} shapeId="star" colorId="yellow" className="h-6 w-6" />
                  ))}
                </span>
                <span className="font-display text-lg font-bold">{l.label}</span>
                <span className="text-center text-xs font-semibold leading-tight text-ink-soft">
                  {l.hint}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-xl font-bold">Which shapes?</h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {SCOPE_META.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => updateSettings({ scope: s.id })}
                aria-pressed={settings.scope === s.id}
                className={`sticker sticker-press flex flex-col items-center gap-1 px-2 py-4 ${
                  settings.scope === s.id ? "sticker-selected" : ""
                }`}
              >
                <span aria-hidden>
                  <ShapeSvg shapeId={s.icon.id} colorId={s.icon.color} className="h-7 w-7" />
                </span>
                <span className="font-display text-xl font-bold">{s.label}</span>
                <span className="text-xs font-semibold text-ink-soft">{s.hint}</span>
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
      </>
    );
  } else if (phase === "play" && question) {
    content = (
      <div className="flex min-h-[calc(100dvh-11rem)] flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <span className="font-display text-lg font-bold text-ink-soft">
            {current + 1} / {questions.length}
          </span>
          <span
            className={`font-display text-xl font-bold tabular-nums ${
              timeLow ? "text-bad" : "text-ink"
            }`}
            aria-label={`${secondsLeft} seconds left`}
          >
            {secondsLeft}s
          </span>
        </div>

        {/* Time bar - green draining to red when low */}
        <div className="h-2.5 overflow-hidden rounded-full bg-bg-soft" aria-hidden>
          <div
            className="h-full rounded-full transition-[width] duration-100 ease-linear"
            style={{
              width: `${(remaining / (secsPerQ * 1000)) * 100}%`,
              background: timeLow ? "var(--bad)" : "var(--good)",
            }}
          />
        </div>

        <h2 key={current} className="animate-rise-in text-center font-display text-3xl font-bold">
          {question.prompt}
        </h2>

        <div
          key={`options-${current}`}
          className="animate-rise-in grid flex-1 grid-cols-2 grid-rows-2 gap-3"
        >
          {question.options.map((_, i) => (
            <OptionCard
              key={i}
              question={question}
              index={i}
              picked={picked}
              onPick={pickOption}
              onHover={() => {
                if (soundOn && picked === null) playHover();
              }}
            />
          ))}
        </div>

        <div className="min-h-10 text-center" aria-live="polite">
          {picked !== null ? (
            <p
              className={`animate-pop-in font-display text-2xl font-bold ${
                picked !== "timeout" && picked === question.answerIndex
                  ? "text-good"
                  : "text-bad"
              }`}
            >
              {picked === "timeout"
                ? "Time's up!"
                : picked === question.answerIndex
                  ? "Yes!"
                  : "Almost!"}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  // done - countries-style grade screen, confetti only on a passing grade
  const grade = gradeFor(correctCount, questions.length);
  const ringColor =
    grade.band === "perfect"
      ? "var(--sunny)"
      : grade.band === "pass"
        ? "var(--good)"
        : grade.band === "close"
          ? "#f78c2a"
          : "var(--bad)";
  const title =
    grade.band === "perfect"
      ? "Perfect!"
      : grade.band === "pass"
        ? "Winner!"
        : grade.band === "close"
          ? "So close!"
          : "Nice try!";
  const resultIcon =
    grade.band === "perfect" || grade.band === "pass" ? (
      <TrophyIcon className="h-14 w-14 text-sunny" />
    ) : grade.band === "close" ? (
      <TargetIcon className="h-14 w-14 text-[#f78c2a]" />
    ) : (
      <RetryIcon className="h-14 w-14 text-ink-soft" />
    );

  if (phase === "done") {
    content = (
      <div className="relative flex flex-col items-center gap-5 text-center">
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
                  animation: `confetti-fall 1.3s ease-out ${p.delay} both`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      ) : null}

      <span className="pt-2" aria-hidden>
        {resultIcon}
      </span>
      <h2 className="animate-pop-in font-display text-4xl font-bold">{title}</h2>

      <div
        className="animate-pop-in grid h-36 w-36 place-items-center rounded-full border-8 bg-card"
        style={{ borderColor: ringColor }}
        aria-label={`Score ${grade.score} out of 100`}
      >
        <div>
          <div className="font-display text-5xl font-bold tabular-nums">{grade.score}</div>
          <div className="text-xs font-bold uppercase tracking-widest text-ink-soft">/ 100</div>
        </div>
      </div>

      <p className="text-lg font-semibold text-ink-soft">
        <span className="text-ink">{correctCount}</span> out of{" "}
        <span className="text-ink">{questions.length}</span> correct
        {grade.band === "close" ? " - get 80 to win!" : ""}
      </p>

      <div className="flex w-full flex-col gap-3">
        <button
          type="button"
          onClick={start}
          className="sticker sticker-press bg-good py-3.5 font-display text-xl font-bold text-white"
          style={{ borderColor: "transparent" }}
        >
          Play again
        </button>
      </div>
    </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-5">
      {flyer ? (
        <div className="pointer-events-none fixed left-0 top-[30%] z-50 w-full" aria-hidden>
          <div className="animate-fly-across w-32 sm:w-40">
            {flyer === "super" ? (
              <SuperKidFlyer className="h-auto w-full" />
            ) : flyer === "star" ? (
              <ShootingStarFlyer className="h-auto w-full" />
            ) : (
              <RocketFlyer className="h-auto w-full" />
            )}
          </div>
        </div>
      ) : null}
      {content}
    </div>
  );
}
