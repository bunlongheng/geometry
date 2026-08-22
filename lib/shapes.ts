import type { ColorId } from "./colors.ts";

export type Dimension = "2d" | "3d";

export interface Shape {
  id: string;
  name: string;
  dimension: Dimension;
  // Signature color - the color this shape "wears" in study mode, so kids build
  // a shape-to-color association (octagon is red like a stop sign, etc).
  color: ColorId;
  // 2D counts. Omitted for curvy shapes (heart, crescent, semicircle) so the
  // quiz never asks a question with a debatable answer.
  sides?: number;
  corners?: number;
  // 3D counts. Only set for polyhedra - curved solids (sphere, cone, torus...)
  // omit them for the same reason.
  faces?: number;
  edges?: number;
  vertices?: number;
  fact: string;
  example: string;
}

export const SHAPES: Shape[] = [
  // ---- 2D ----
  {
    id: "circle",
    name: "Circle",
    dimension: "2d",
    color: "red",
    sides: 0,
    corners: 0,
    fact: "A circle is perfectly round - every point on its edge is the same distance from the middle.",
    example: "a pizza",
  },
  {
    id: "square",
    name: "Square",
    dimension: "2d",
    color: "blue",
    sides: 4,
    corners: 4,
    fact: "All 4 sides of a square are exactly the same length.",
    example: "a cracker",
  },
  {
    id: "triangle",
    name: "Triangle",
    dimension: "2d",
    color: "green",
    sides: 3,
    corners: 3,
    fact: "The triangle is the strongest shape - builders use it in bridges and roofs.",
    example: "a slice of pizza",
  },
  {
    id: "rectangle",
    name: "Rectangle",
    dimension: "2d",
    color: "orange",
    sides: 4,
    corners: 4,
    fact: "A rectangle has 2 long sides and 2 short sides, with 4 square corners.",
    example: "a door",
  },
  {
    id: "oval",
    name: "Oval",
    dimension: "2d",
    color: "purple",
    sides: 0,
    corners: 0,
    fact: "An oval is a stretched circle - longer 1 way than the other.",
    example: "an egg",
  },
  {
    id: "star",
    name: "Star",
    dimension: "2d",
    color: "yellow",
    sides: 10,
    corners: 10,
    fact: "A 5-pointed star actually has 10 sides and 10 corners - count them!",
    example: "a starfish",
  },
  {
    id: "heart",
    name: "Heart",
    dimension: "2d",
    color: "pink",
    fact: "A heart has 2 round bumps on top and 1 point at the bottom.",
    example: "a valentine card",
  },
  {
    id: "diamond",
    name: "Diamond",
    dimension: "2d",
    color: "teal",
    sides: 4,
    corners: 4,
    fact: "A diamond is a square standing on its tippy-toe. Its real math name is rhombus.",
    example: "a kite",
  },
  {
    id: "pentagon",
    name: "Pentagon",
    dimension: "2d",
    color: "green",
    sides: 5,
    corners: 5,
    fact: "Penta means 5 - a pentagon has 5 sides and 5 corners.",
    example: "home plate in baseball",
  },
  {
    id: "hexagon",
    name: "Hexagon",
    dimension: "2d",
    color: "orange",
    sides: 6,
    corners: 6,
    fact: "Bees build their honeycomb from hexagons because they fit together perfectly.",
    example: "honeycomb",
  },
  {
    id: "octagon",
    name: "Octagon",
    dimension: "2d",
    color: "red",
    sides: 8,
    corners: 8,
    fact: "Octo means 8 - and every stop sign in the world is a red octagon.",
    example: "a stop sign",
  },
  {
    id: "trapezoid",
    name: "Trapezoid",
    dimension: "2d",
    color: "brown",
    sides: 4,
    corners: 4,
    fact: "A trapezoid has exactly 1 pair of sides that run in the same direction.",
    example: "a lampshade",
  },
  {
    id: "parallelogram",
    name: "Parallelogram",
    dimension: "2d",
    color: "purple",
    sides: 4,
    corners: 4,
    fact: "A parallelogram is a rectangle that leaned over - its opposite sides stay parallel.",
    example: "a leaning stack of books",
  },
  {
    id: "semicircle",
    name: "Semicircle",
    dimension: "2d",
    color: "pink",
    fact: "Semi means half - a semicircle is exactly half of a circle.",
    example: "a rainbow",
  },
  {
    id: "crescent",
    name: "Crescent",
    dimension: "2d",
    color: "yellow",
    fact: "A crescent is the shape of the moon when we only see a sliver of it.",
    example: "the moon",
  },
  // ---- 3D ----
  {
    id: "sphere",
    name: "Sphere",
    dimension: "3d",
    color: "blue",
    fact: "A sphere is round in every direction - it can roll anywhere.",
    example: "a basketball",
  },
  {
    id: "cube",
    name: "Cube",
    dimension: "3d",
    color: "green",
    faces: 6,
    edges: 12,
    vertices: 8,
    fact: "A cube has 6 square faces that are all exactly the same size.",
    example: "a dice",
  },
  {
    id: "cuboid",
    name: "Cuboid",
    dimension: "3d",
    color: "orange",
    faces: 6,
    edges: 12,
    vertices: 8,
    fact: "A cuboid is a stretched cube - its faces are rectangles.",
    example: "a cereal box",
  },
  {
    id: "cylinder",
    name: "Cylinder",
    dimension: "3d",
    color: "purple",
    fact: "A cylinder has 2 flat circle ends and 1 curved side - it rolls in a straight line.",
    example: "a soup can",
  },
  {
    id: "cone",
    name: "Cone",
    dimension: "3d",
    color: "pink",
    fact: "A cone has a flat circle bottom and comes to 1 point at the top.",
    example: "an ice cream cone",
  },
  {
    id: "pyramid",
    name: "Pyramid",
    dimension: "3d",
    color: "yellow",
    faces: 5,
    edges: 8,
    vertices: 5,
    fact: "A pyramid has a square bottom and 4 triangle faces that meet at 1 point.",
    example: "the pyramids in Egypt",
  },
  {
    id: "prism",
    name: "Triangular Prism",
    dimension: "3d",
    color: "teal",
    faces: 5,
    edges: 9,
    vertices: 6,
    fact: "A triangular prism is a triangle stretched into 3D - like a tent.",
    example: "a camping tent",
  },
  {
    id: "torus",
    name: "Torus",
    dimension: "3d",
    color: "brown",
    fact: "A torus is a ring with a hole in the middle - the fancy name for a donut shape.",
    example: "a donut",
  },
  {
    id: "hemisphere",
    name: "Hemisphere",
    dimension: "3d",
    color: "red",
    fact: "Hemi means half - a hemisphere is half of a sphere with 1 flat circle face.",
    example: "an upside-down bowl",
  },
  {
    id: "octahedron",
    name: "Octahedron",
    dimension: "3d",
    color: "teal",
    faces: 8,
    edges: 12,
    vertices: 6,
    fact: "An octahedron is 2 pyramids glued together - it has 8 triangle faces.",
    example: "a cut gemstone",
  },
];

export const SHAPES_2D = SHAPES.filter((s) => s.dimension === "2d");
export const SHAPES_3D = SHAPES.filter((s) => s.dimension === "3d");

const BY_ID = new Map(SHAPES.map((s) => [s.id, s]));

export function getShape(id: string): Shape {
  const shape = BY_ID.get(id);
  if (!shape) throw new Error(`Unknown shape: ${id}`);
  return shape;
}
