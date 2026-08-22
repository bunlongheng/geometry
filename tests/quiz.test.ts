import { test } from "node:test";
import assert from "node:assert/strict";
import {
  generateQuiz,
  starsFor,
  describeOption,
  type Level,
  type Question,
  type Scope,
} from "../lib/quiz.ts";
import { getShape } from "../lib/shapes.ts";
import { createRng, shuffle, pick } from "../lib/rng.ts";

const LEVELS: Level[] = ["easy", "medium", "hard"];
const SCOPES: Scope[] = ["2d", "3d", "mixed"];

function assertValid(q: Question, choices: number) {
  assert.ok(q.prompt.length > 5, "prompt present");
  assert.ok(q.explain.length > 5, "explain present");
  assert.equal(q.options.length, q.kind === "count" ? Math.min(choices, 4) : choices);
  assert.ok(q.answerIndex >= 0 && q.answerIndex < q.options.length, "answer in range");
  // No duplicate options - a duplicate of the answer would make 2 right answers.
  const keys = q.options.map((o) =>
    o.kind === "text" ? `t:${o.label}` : `s:${o.shapeId}:${o.colorId}`,
  );
  assert.equal(new Set(keys).size, keys.length, `duplicate options in ${q.prompt}`);
}

test("rng is deterministic and uniform-ish", () => {
  const a = createRng(42);
  const b = createRng(42);
  for (let i = 0; i < 5; i++) assert.equal(a(), b());
  const vals = Array.from({ length: 1000 }, createRng(7));
  assert.ok(vals.every((v) => v >= 0 && v < 1));
});

test("shuffle keeps all items and is seed-stable", () => {
  const rng = createRng(1);
  const out = shuffle([1, 2, 3, 4, 5], rng);
  assert.deepEqual([...out].sort(), [1, 2, 3, 4, 5]);
  assert.deepEqual(shuffle([1, 2, 3, 4, 5], createRng(9)), shuffle([1, 2, 3, 4, 5], createRng(9)));
});

test("pick throws on empty list", () => {
  assert.throws(() => pick([], createRng(1)));
});

test("generateQuiz is deterministic for the same seed", () => {
  const settings = { level: "medium" as const, scope: "mixed" as const, count: 10 };
  assert.deepEqual(generateQuiz(settings, 123), generateQuiz(settings, 123));
});

test("every level x scope x seed produces valid questions", () => {
  const choicesFor: Record<Level, number> = { easy: 4, medium: 4, hard: 4 };
  for (const level of LEVELS) {
    for (const scope of SCOPES) {
      for (const seed of [1, 99, 2026]) {
        const qs = generateQuiz({ level, scope, count: 15 }, seed);
        assert.equal(qs.length, 15);
        for (const q of qs) assertValid(q, choicesFor[level]);
      }
    }
  }
});

test("easy level only asks find-shape", () => {
  const qs = generateQuiz({ level: "easy", scope: "2d", count: 15 }, 5);
  assert.ok(qs.every((q) => q.kind === "find-shape"));
});

test("scope filters shapes by dimension", () => {
  for (const scope of ["2d", "3d"] as const) {
    const qs = generateQuiz({ level: "easy", scope, count: 15 }, 11);
    for (const q of qs) {
      for (const o of q.options) {
        if (o.kind === "shape") {
          assert.equal(getShape(o.shapeId).dimension, scope);
        }
      }
    }
  }
});

test("find-color-shape has exactly 1 option matching the asked shape + color", () => {
  for (const seed of [3, 33, 333]) {
    const qs = generateQuiz({ level: "hard", scope: "mixed", count: 15 }, seed);
    for (const q of qs) {
      if (q.kind !== "find-color-shape") continue;
      const answer = q.options[q.answerIndex];
      assert.equal(answer.kind, "shape");
      if (answer.kind !== "shape") continue;
      const matches = q.options.filter(
        (o) =>
          o.kind === "shape" &&
          o.shapeId === answer.shapeId &&
          o.colorId === answer.colorId,
      );
      assert.equal(matches.length, 1, `ambiguous: ${q.prompt}`);
    }
  }
});

test("count questions have the true count as the answer", () => {
  for (const seed of [8, 88]) {
    const qs = generateQuiz({ level: "medium", scope: "mixed", count: 15 }, seed);
    for (const q of qs) {
      if (q.kind !== "count") continue;
      const answer = q.options[q.answerIndex];
      assert.equal(answer.kind, "text");
      if (answer.kind !== "text") continue;
      assert.ok(Number(answer.label) > 0);
      assert.ok(q.explain.includes(answer.label), `${q.explain} vs ${answer.label}`);
    }
  }
});

test("which-property distractors never share the asked count", () => {
  for (const seed of [4, 44, 444]) {
    const qs = generateQuiz({ level: "hard", scope: "2d", count: 15 }, seed);
    for (const q of qs) {
      if (q.kind !== "which-property") continue;
      const match = q.prompt.match(/has (\d+) (sides|faces)/);
      assert.ok(match, q.prompt);
      const wanted = Number(match![1]);
      const prop = match![2];
      let matching = 0;
      for (const o of q.options) {
        if (o.kind !== "shape") continue;
        const s = getShape(o.shapeId);
        const value = prop === "sides" ? s.sides : s.faces;
        if (value === wanted) matching++;
      }
      assert.equal(matching, 1, `ambiguous: ${q.prompt}`);
    }
  }
});

test("starsFor boundaries", () => {
  assert.equal(starsFor(10, 10), 3);
  assert.equal(starsFor(9, 10), 3);
  assert.equal(starsFor(8, 10), 2);
  assert.equal(starsFor(6, 10), 2);
  assert.equal(starsFor(5, 10), 1);
  assert.equal(starsFor(3, 10), 1);
  assert.equal(starsFor(2, 10), 0);
  assert.equal(starsFor(0, 10), 0);
  assert.equal(starsFor(0, 0), 0);
});

test("describeOption renders both option kinds", () => {
  assert.equal(describeOption({ kind: "text", label: "4" }), "4");
  assert.equal(
    describeOption({ kind: "shape", shapeId: "circle", colorId: "blue" }),
    "blue circle",
  );
});
