// The quiz color palette. Every color a question can ask about lives here, so the
// quiz generator, the study browser, and the SVG renderer all agree on names + hexes.
export type ColorId =
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "teal"
  | "blue"
  | "purple"
  | "pink"
  | "brown";

export interface QuizColor {
  id: ColorId;
  name: string;
  hex: string;
}

export const COLORS: QuizColor[] = [
  { id: "red", name: "Red", hex: "#ef4d4d" },
  { id: "orange", name: "Orange", hex: "#f78c2a" },
  { id: "yellow", name: "Yellow", hex: "#f7c526" },
  { id: "green", name: "Green", hex: "#3cb96e" },
  { id: "teal", name: "Teal", hex: "#2ab5b0" },
  { id: "blue", name: "Blue", hex: "#3f7de0" },
  { id: "purple", name: "Purple", hex: "#8e5fd8" },
  { id: "pink", name: "Pink", hex: "#f06ea9" },
  { id: "brown", name: "Brown", hex: "#a06a3f" },
];

const BY_ID = new Map(COLORS.map((c) => [c.id, c]));

export function getColor(id: ColorId): QuizColor {
  const color = BY_ID.get(id);
  if (!color) throw new Error(`Unknown color: ${id}`);
  return color;
}

// Lighten (amt > 0) or darken (amt < 0) a hex color. Used to shade the faces of
// 3D shapes so a single palette color reads as a lit solid.
export function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => {
    const scaled = amt >= 0 ? v + (255 - v) * amt : v * (1 + amt);
    return Math.round(Math.min(255, Math.max(0, scaled)));
  };
  const r = ch((n >> 16) & 255);
  const g = ch((n >> 8) & 255);
  const b = ch(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
