"use client";

import { useState } from "react";
import ShapeSvg from "@/components/ShapeSvg";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/Icons";
import { speak } from "@/components/speak";
import { COLORS, getColor, type ColorId } from "@/lib/colors";
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

// Study mode: browse shapes by 2D/3D, tap one to open its card - big drawing,
// signature color, countable facts, a fun fact, and a "paint it" color row so
// kids connect each shape with every color, not just its signature one.

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-bg-soft px-4 py-2">
      <span className="font-display text-2xl font-bold">{value}</span>
      <span className="text-xs font-bold uppercase tracking-wide text-ink-soft">{label}</span>
    </div>
  );
}

function ShapeDetail({ shape, onClose }: { shape: Shape; onClose: () => void }) {
  const [paint, setPaint] = useState<ColorId>(shape.color);
  const color = getColor(paint);

  // Left/right chevrons rotate through the colors - the shape itself never
  // changes inside this card (owner rule: pick a new shape from the grid).
  const rotateColor = (dir: 1 | -1) => {
    const i = COLORS.findIndex((c) => c.id === paint);
    const next = COLORS[(i + dir + COLORS.length) % COLORS.length];
    setPaint(next.id);
    speakIfOn(`${next.name.toLowerCase()} ${shape.name.toLowerCase()}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={shape.name}
    >
      <div
        className="sticker animate-pop-in detail-card relative flex max-h-[94dvh] w-full max-w-md flex-col gap-4 overflow-y-auto px-12 py-4 text-center sm:py-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-bg-soft font-display text-lg font-bold text-ink-soft"
        >
          x
        </button>
        <button
          type="button"
          onClick={() => rotateColor(-1)}
          aria-label="Previous color"
          className="sticker sticker-press absolute left-1.5 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center"
          style={{ borderRadius: "9999px" }}
        >
          <ChevronLeftIcon className="h-6 w-6" />
        </button>
        <button
          type="button"
          onClick={() => rotateColor(1)}
          aria-label="Next color"
          className="sticker sticker-press absolute right-1.5 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center"
          style={{ borderRadius: "9999px" }}
        >
          <ChevronRightIcon className="h-6 w-6" />
        </button>
        <div className="detail-shape mx-auto mt-2 h-36 w-36 sm:h-40 sm:w-40">
          <ShapeSvg
            key={paint}
            shapeId={shape.id}
            colorId={paint}
            title={`${color.name} ${shape.name}`}
            className="animate-pop-in h-full w-full"
          />
        </div>
        <div>
          <h2 className="font-display text-4xl font-bold">{shape.name}</h2>
          <p className="mt-1 font-bold text-ink-soft">
            This one is{" "}
            <span style={{ color: color.hex }} className="font-display text-lg">
              {color.name.toLowerCase()}
            </span>
            !
          </p>
        </div>
        {shape.dimension === "2d" && shape.sides !== undefined ? (
          <div className="detail-mid flex justify-center gap-3">
            <StatChip label="sides" value={shape.sides} />
            <StatChip label="corners" value={shape.corners ?? 0} />
          </div>
        ) : null}
        {shape.dimension === "3d" && shape.faces !== undefined ? (
          <div className="detail-mid flex justify-center gap-3">
            <StatChip label="faces" value={shape.faces} />
            <StatChip label="edges" value={shape.edges ?? 0} />
            <StatChip label="corners" value={shape.vertices ?? 0} />
          </div>
        ) : null}
        <p className="detail-mid text-balance font-semibold">{shape.fact}</p>
        <p className="detail-mid font-semibold text-ink-soft">
          You can spot one in real life: <span className="text-ink">{shape.example}</span>.
        </p>
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wide text-ink-soft">
            Paint it!
          </span>
          <div className="-mx-8 flex flex-nowrap justify-center gap-1.5 sm:mx-0 sm:gap-2">
            {COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setPaint(c.id);
                  // Say the new combo out loud ("yellow circle") so she hears
                  // the color + shape pairing as she paints.
                  speakIfOn(`${c.name.toLowerCase()} ${shape.name.toLowerCase()}`);
                }}
                aria-label={`Paint it ${c.name.toLowerCase()}`}
                aria-pressed={paint === c.id}
                className="h-7 w-7 shrink-0 rounded-full border-2 transition-transform active:scale-90 sm:h-9 sm:w-9"
                style={{
                  backgroundColor: c.hex,
                  borderColor: paint === c.id ? "var(--ink)" : "transparent",
                  transform: paint === c.id ? "scale(1.15)" : undefined,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StudyBrowser() {
  const [dimension, setDimension] = useState<Dimension>("2d");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-center gap-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setDimension(t.id);
              setOpenIndex(null);
            }}
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
            onClick={() => {
              setOpenIndex(i);
              speakIfOn(`${getColor(shape.color).name} ${shape.name}`.toLowerCase());
            }}
            className="sticker sticker-press animate-rise-in flex flex-col items-center gap-2 p-5"
            style={{ animationDelay: `${Math.min(i * 0.04, 0.6)}s` }}
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

      {openIndex !== null ? (
        <ShapeDetail shape={shapes[openIndex]} onClose={() => setOpenIndex(null)} />
      ) : null}
    </div>
  );
}
