import type { Metadata } from "next";
import QuizGame from "@/components/QuizGame";

export const metadata: Metadata = {
  title: "Shape quiz - Geometry",
  description:
    "Pick a level, choose 2D or 3D shapes, and answer questions like 'Tap the blue circle' to win stars.",
};

export default function QuizPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold">Quiz time!</h1>
        <p className="mt-1 font-semibold text-ink-soft">
          Pick your level and shapes, then win up to 3 stars.
        </p>
      </div>
      <QuizGame />
    </div>
  );
}
