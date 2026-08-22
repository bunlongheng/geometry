import { test } from "node:test";
import assert from "node:assert/strict";
import { SHAPES, SHAPES_2D, SHAPES_3D, SHAPES_LINES, SHAPES_ANGLES, getShape } from "../lib/shapes.ts";
import { COLORS, getColor, shade } from "../lib/colors.ts";

test("shape ids are unique", () => {
  const ids = SHAPES.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("every shape has a valid signature color", () => {
  const colorIds = new Set(COLORS.map((c) => c.id));
  for (const shape of SHAPES) {
    assert.ok(colorIds.has(shape.color), `${shape.id} has unknown color ${shape.color}`);
  }
});

test("all 4 pools are non-empty and cover all shapes", () => {
  assert.ok(SHAPES_2D.length >= 10);
  assert.ok(SHAPES_3D.length >= 16);
  assert.ok(SHAPES_LINES.length >= 8);
  assert.ok(SHAPES_ANGLES.length >= 6);
  assert.equal(
    SHAPES_2D.length + SHAPES_3D.length + SHAPES_LINES.length + SHAPES_ANGLES.length,
    SHAPES.length,
  );
});

test("lines and angles never carry counts", () => {
  for (const s of [...SHAPES_LINES, ...SHAPES_ANGLES]) {
    assert.equal(s.sides, undefined, `${s.id} has sides`);
    assert.equal(s.faces, undefined, `${s.id} has faces`);
  }
});

test("2D shapes never carry 3D counts and vice versa", () => {
  for (const s of SHAPES_2D) {
    assert.equal(s.faces, undefined, `${s.id} is 2D but has faces`);
    assert.equal(s.edges, undefined, `${s.id} is 2D but has edges`);
    assert.equal(s.vertices, undefined, `${s.id} is 2D but has vertices`);
  }
  for (const s of SHAPES_3D) {
    assert.equal(s.sides, undefined, `${s.id} is 3D but has sides`);
    assert.equal(s.corners, undefined, `${s.id} is 3D but has corners`);
  }
});

test("polygon sides match corners", () => {
  for (const s of SHAPES_2D) {
    if (s.sides !== undefined && s.sides > 0) {
      assert.equal(s.sides, s.corners, `${s.id} sides != corners`);
    }
  }
});

test("polyhedra satisfy Euler's formula (V - E + F = 2)", () => {
  for (const s of SHAPES_3D) {
    if (s.faces !== undefined) {
      assert.equal(
        (s.vertices ?? 0) - (s.edges ?? 0) + s.faces,
        2,
        `${s.id} fails Euler's formula`,
      );
    }
  }
});

test("every shape has a fact and a real-world example", () => {
  for (const s of SHAPES) {
    assert.ok(s.fact.length > 10, `${s.id} fact too short`);
    assert.ok(s.example.length > 2, `${s.id} example too short`);
  }
});

test("getShape returns the shape or throws", () => {
  assert.equal(getShape("circle").name, "Circle");
  assert.throws(() => getShape("nope"));
});

test("getColor returns the color or throws", () => {
  assert.equal(getColor("blue").name, "Blue");
  assert.throws(() => getColor("nope" as never));
});

test("shade lightens and darkens hex colors", () => {
  assert.equal(shade("#000000", 1), "#ffffff");
  assert.equal(shade("#ffffff", -1), "#000000");
  assert.equal(shade("#3f7de0", 0), "#3f7de0");
  assert.match(shade("#3f7de0", 0.3), /^#[0-9a-f]{6}$/);
});
