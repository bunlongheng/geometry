import { COLORS, getColor, type ColorId } from "./colors.ts";
import { getShape, SHAPES, type Dimension, type Shape } from "./shapes.ts";
import { createRng, pick, shuffle, type Rng } from "./rng.ts";

export type Level = "easy" | "medium" | "hard";
export type Scope = "2d" | "3d" | "lines" | "angles" | "mixed";

export interface QuizSettings {
  level: Level;
  scope: Scope;
  count: number;
}

export type QuestionKind =
  | "find-shape" // "Tap the circle"
  | "find-color-shape" // "Tap the blue circle"
  | "count" // "How many sides does a square have?"
  | "which-property"; // "Which shape has 6 sides?"

export interface ShapeOption {
  kind: "shape";
  shapeId: string;
  colorId: ColorId;
}

export interface TextOption {
  kind: "text";
  label: string;
}

export type QuizOption = ShapeOption | TextOption;

export interface Question {
  kind: QuestionKind;
  prompt: string;
  options: QuizOption[];
  answerIndex: number;
  // Shown after answering, right or wrong: "An octagon has 8 sides!"
  explain: string;
}

interface LevelConfig {
  choices: number;
  kinds: QuestionKind[];
}

// Every question shows 4 choices (owner request) - levels differ by question
// kinds, not option count.
const LEVELS: Record<Level, LevelConfig> = {
  easy: { choices: 4, kinds: ["find-shape"] },
  medium: { choices: 4, kinds: ["find-shape", "find-color-shape", "count"] },
  hard: { choices: 4, kinds: ["find-color-shape", "count", "which-property"] },
};

// Every quiz is exactly 10 questions (owner rule) - 10 points each, score /100.
export const QUIZ_LENGTH = 10;

function poolFor(scope: Scope): Shape[] {
  if (scope === "mixed") return SHAPES;
  return SHAPES.filter((s) => s.dimension === scope);
}

// The property a counting question asks about, per dimension.
function countable(shape: Shape): { value: number; noun: string } | null {
  if (shape.dimension === "2d") {
    if (shape.sides === undefined || shape.sides === 0) return null;
    return { value: shape.sides, noun: "sides" };
  }
  if (shape.dimension !== "3d" || shape.faces === undefined) return null;
  return { value: shape.faces, noun: "faces" };
}

function makeFindShape(target: Shape, pool: Shape[], choices: number, rng: Rng): Question {
  const distractors = shuffle(
    pool.filter((s) => s.id !== target.id),
    rng,
  ).slice(0, choices - 1);
  const options: QuizOption[] = shuffle(
    [target, ...distractors].map((s) => ({
      kind: "shape" as const,
      shapeId: s.id,
      colorId: s.color,
    })),
    rng,
  );
  return {
    kind: "find-shape",
    prompt: `Tap the ${target.name.toLowerCase()}!`,
    options,
    answerIndex: options.findIndex((o) => o.kind === "shape" && o.shapeId === target.id),
    explain: `${target.fact}`,
  };
}

function makeFindColorShape(
  target: Shape,
  pool: Shape[],
  choices: number,
  rng: Rng,
): Question {
  const color = pick(COLORS, rng);
  const others = shuffle(
    pool.filter((s) => s.id !== target.id),
    rng,
  );
  const otherColors = shuffle(
    COLORS.filter((c) => c.id !== color.id),
    rng,
  );
  // Distractors mix both kinds of "almost right": the same shape in a wrong
  // color, and other shapes in the asked-for color.
  const pairs: ShapeOption[] = [
    { kind: "shape", shapeId: target.id, colorId: otherColors[0].id },
    { kind: "shape", shapeId: others[0].id, colorId: color.id },
  ];
  let i = 1;
  while (pairs.length < choices - 1 && i < others.length) {
    pairs.push({
      kind: "shape",
      shapeId: others[i].id,
      colorId: pick(COLORS, rng).id,
    });
    i++;
  }
  const answer: ShapeOption = { kind: "shape", shapeId: target.id, colorId: color.id };
  const options = shuffle<QuizOption>([answer, ...pairs.slice(0, choices - 1)], rng);
  return {
    kind: "find-color-shape",
    prompt: `Tap the ${color.name.toLowerCase()} ${target.name.toLowerCase()}!`,
    options,
    answerIndex: options.findIndex(
      (o) => o.kind === "shape" && o.shapeId === target.id && o.colorId === color.id,
    ),
    explain: `That is a ${color.name.toLowerCase()} ${target.name.toLowerCase()}. ${target.fact}`,
  };
}

function makeCount(target: Shape, choices: number, rng: Rng): Question {
  const info = countable(target);
  if (!info) throw new Error(`Shape ${target.id} has nothing to count`);
  const wanted = Math.min(choices, 4);
  const numbers = new Set<number>([info.value]);
  let step = 1;
  while (numbers.size < wanted) {
    const candidate = rng() < 0.5 ? info.value - step : info.value + step;
    if (candidate > 0) numbers.add(candidate);
    if (rng() < 0.4) step++;
    if (step > 6) step = 1;
  }
  const options: QuizOption[] = shuffle(
    [...numbers].map((n) => ({ kind: "text" as const, label: String(n) })),
    rng,
  );
  return {
    kind: "count",
    prompt: `How many ${info.noun} does a ${target.name.toLowerCase()} have?`,
    options,
    answerIndex: options.findIndex(
      (o) => o.kind === "text" && o.label === String(info.value),
    ),
    explain: `A ${target.name.toLowerCase()} has ${info.value} ${info.noun}.`,
  };
}

function makeWhichProperty(target: Shape, pool: Shape[], choices: number, rng: Rng): Question {
  const info = countable(target);
  if (!info) throw new Error(`Shape ${target.id} has nothing to count`);
  // Distractors must have a DIFFERENT count so the answer is unique.
  const distractors = shuffle(
    pool.filter((s) => {
      if (s.id === target.id || s.dimension !== target.dimension) return false;
      const c = countable(s);
      return c === null || c.value !== info.value;
    }),
    rng,
  ).slice(0, choices - 1);
  const options: QuizOption[] = shuffle(
    [target, ...distractors].map((s) => ({
      kind: "shape" as const,
      shapeId: s.id,
      colorId: s.color,
    })),
    rng,
  );
  return {
    kind: "which-property",
    prompt: `Which shape has ${info.value} ${info.noun}?`,
    options,
    answerIndex: options.findIndex((o) => o.kind === "shape" && o.shapeId === target.id),
    explain: `A ${target.name.toLowerCase()} has ${info.value} ${info.noun}.`,
  };
}

export function generateQuiz(settings: QuizSettings, seed: number): Question[] {
  const rng = createRng(seed);
  const config = LEVELS[settings.level];
  const pool = poolFor(settings.scope);
  const countPool = pool.filter((s) => countable(s) !== null);

  // Cycle through a shuffled pool so the same shape is never asked twice in a row
  // and every shape shows up before any repeats.
  let order = shuffle(pool, rng);
  let cursor = 0;
  const nextTarget = (needsCount: boolean): Shape => {
    for (let hop = 0; hop < order.length; hop++) {
      const shape = order[(cursor + hop) % order.length];
      if (!needsCount || countable(shape) !== null) {
        cursor = (cursor + hop + 1) % order.length;
        if (cursor === 0) {
          order = shuffle(order, rng);
          // Never let the reshuffled cycle start with the shape just asked -
          // that reads as "the same question twice in a row".
          if (order.length > 1 && order[0].id === shape.id) {
            order.push(order.shift() as Shape);
          }
        }
        return shape;
      }
    }
    return pick(countPool, rng);
  };

  const questions: Question[] = [];
  for (let i = 0; i < settings.count; i++) {
    let kind = pick(config.kinds, rng);
    // Counting questions need shapes with countable properties in the pool.
    if ((kind === "count" || kind === "which-property") && countPool.length < 2) {
      kind = "find-shape";
    }
    const needsCount = kind === "count" || kind === "which-property";
    const target = nextTarget(needsCount);
    switch (kind) {
      case "find-shape":
        questions.push(makeFindShape(target, pool, config.choices, rng));
        break;
      case "find-color-shape":
        questions.push(makeFindColorShape(target, pool, config.choices, rng));
        break;
      case "count":
        questions.push(makeCount(target, config.choices, rng));
        break;
      case "which-property":
        questions.push(makeWhichProperty(target, pool, config.choices, rng));
        break;
    }
  }
  return questions;
}

// Grade bands mirror the countries quiz: score is out of 100, 100% = perfect
// (gold), 80%+ = pass (confetti), 50-79% = close (orange), below 50% = miss.
export type GradeBand = "perfect" | "pass" | "close" | "miss";

export interface QuizGrade {
  score: number;
  band: GradeBand;
}

export function gradeFor(correct: number, total: number): QuizGrade {
  if (total <= 0) return { score: 0, band: "miss" };
  const score = Math.round((correct / total) * 100);
  const band =
    correct === total ? "perfect" : score >= 80 ? "pass" : score >= 50 ? "close" : "miss";
  return { score, band };
}

// 3 stars for 90%+, 2 for 60%+, 1 for 30%+, 0 below.
export function starsFor(correct: number, total: number): 0 | 1 | 2 | 3 {
  if (total <= 0) return 0;
  const pct = correct / total;
  if (pct >= 0.9) return 3;
  if (pct >= 0.6) return 2;
  if (pct >= 0.3) return 1;
  return 0;
}

export function describeOption(option: QuizOption): string {
  if (option.kind === "text") return option.label;
  return `${getColor(option.colorId).name} ${getShape(option.shapeId).name}`.toLowerCase();
}

export const DIMENSION_LABELS: Record<Dimension, string> = {
  "2d": "2D",
  "3d": "3D",
  lines: "Lines",
  angles: "Angles",
};
