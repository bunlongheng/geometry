"use client";

import { useRef, useState } from "react";
import ShapeSvg from "@/components/ShapeSvg";
import { speak } from "@/components/speak";
import {
  SHAPES_2D,
  SHAPES_3D,
  SHAPES_ANGLES,
  SHAPES_LINES,
  type Dimension,
  type Shape,
} from "@/lib/shapes";

// Speak only when the sound toggle (shared with the quiz) is on.
function speakIfOn(text: string) {
  try {
    if (localStorage.getItem("geometry-sound") === "off") return;
  } catch {
    /* default on */
  }
  speak(text);
}

// Study mode: tap a shape, hear its name. That is the whole game - no modal,
// no extra lesson (owner rule).
export default function StudyBrowser() {
  const [dimension, setDimension] = useState<Dimension>("2d");
  const [bounced, setBounced] = useState<string | null>(null);
  const bounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const POOLS: Record<Dimension, Shape[]> = {
    "2d": SHAPES_2D,
    "3d": SHAPES_3D,
    lines: SHAPES_LINES,
    angles: SHAPES_ANGLES,
  };
  const TABS: { id: Dimension; label: string }[] = [
    { id: "2d", label: "2D" },
    { id: "3d", label: "3D" },
    { id: "lines", label: "Lines" },
    { id: "angles", label: "Angles" },
  ];
  const shapes = POOLS[dimension];

  const tapShape = (shape: Shape) => {
    speakIfOn(shape.name.toLowerCase());
    setBounced(shape.id);
    if (bounceTimer.current) clearTimeout(bounceTimer.current);
    bounceTimer.current = setTimeout(() => setBounced(null), 550);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-center gap-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setDimension(t.id)}
            aria-pressed={dimension === t.id}
            className={`sticker sticker-press px-6 py-2.5 font-display text-xl font-bold ${
              dimension === t.id ? "sticker-selected" : ""
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {shapes.map((shape, i) => (
          <button
            key={shape.id}
            type="button"
            onClick={() => tapShape(shape)}
            className={`sticker sticker-press animate-rise-in flex flex-col items-center gap-2 p-5 ${
              bounced === shape.id ? "animate-bounce-big" : ""
            }`}
            style={{ animationDelay: bounced === shape.id ? "0s" : `${Math.min(i * 0.04, 0.6)}s` }}
          >
            <ShapeSvg
              shapeId={shape.id}
              colorId={shape.color}
              title={shape.name}
              className="h-20 w-20"
            />
            <span className="font-display text-lg font-bold leading-tight">{shape.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
