import Link from "next/link";
import ShapeSvg from "@/components/ShapeSvg";
import { SHAPES_2D, SHAPES_3D } from "@/lib/shapes";

// Decorative floating shapes behind the hero - purely visual, hidden from AT.
const FLOATERS = [
  { id: "star", color: "yellow", cls: "left-[4%] top-[8%] h-14 w-14", tilt: "-8deg", delay: "0s" },
  { id: "circle", color: "red", cls: "right-[6%] top-[4%] h-12 w-12", tilt: "0deg", delay: "0.8s" },
  { id: "triangle", color: "green", cls: "left-[12%] bottom-[6%] h-12 w-12", tilt: "10deg", delay: "1.6s" },
  { id: "cube", color: "blue", cls: "right-[12%] bottom-[10%] h-14 w-14", tilt: "-6deg", delay: "0.4s" },
  { id: "heart", color: "pink", cls: "left-[38%] top-[2%] h-9 w-9", tilt: "12deg", delay: "1.2s" },
  { id: "hexagon", color: "orange", cls: "right-[34%] bottom-[2%] h-10 w-10", tilt: "-12deg", delay: "2s" },
] as const;

export default function HomePage() {
  return (
    <div className="flex flex-col gap-10">
      <section className="relative overflow-hidden rounded-3xl bg-bg-soft px-6 pb-12 pt-14 text-center sm:pb-16 sm:pt-20">
        <div aria-hidden>
          {FLOATERS.map((f) => (
            <div
              key={f.id}
              className={`animate-float-slow absolute opacity-80 ${f.cls}`}
              style={{ "--tilt": f.tilt, animationDelay: f.delay } as React.CSSProperties}
            >
              <ShapeSvg shapeId={f.id} colorId={f.color} className="h-full w-full" />
            </div>
          ))}
        </div>
        <h1 className="animate-rise-in font-display text-5xl font-bold leading-tight sm:text-6xl">
          Shapes are <span className="text-accent">everywhere!</span>
        </h1>
        <p
          className="animate-rise-in mx-auto mt-4 max-w-md text-lg font-semibold text-ink-soft"
          style={{ animationDelay: "0.1s" }}
        >
          Meet all {SHAPES_2D.length} flat shapes and {SHAPES_3D.length} solid shapes, learn
          their colors, then beat the quiz!
        </p>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <Link
          href="/study"
          className="sticker sticker-press animate-rise-in flex flex-col items-center gap-3 p-8 text-center"
          style={{ animationDelay: "0.15s" }}
        >
          <div className="flex items-end gap-1">
            <ShapeSvg shapeId="circle" colorId="red" className="h-14 w-14" />
            <ShapeSvg shapeId="triangle" colorId="green" className="h-16 w-16" />
            <ShapeSvg shapeId="square" colorId="blue" className="h-14 w-14" />
          </div>
          <span className="font-display text-3xl font-bold">Study</span>
          <span className="font-semibold text-ink-soft">
            Browse every 2D and 3D shape - names, colors, and fun facts.
          </span>
        </Link>
        <Link
          href="/quiz"
          className="sticker sticker-press animate-rise-in flex flex-col items-center gap-3 p-8 text-center"
          style={{ animationDelay: "0.25s" }}
        >
          <div className="flex items-end gap-1">
            <ShapeSvg shapeId="star" colorId="yellow" className="h-16 w-16" />
            <ShapeSvg shapeId="sphere" colorId="purple" className="h-14 w-14" />
          </div>
          <span className="font-display text-3xl font-bold">Quiz</span>
          <span className="font-semibold text-ink-soft">
            3 levels, pick 2D or 3D, and win up to 3 stars!
          </span>
        </Link>
      </section>
    </div>
  );
}
