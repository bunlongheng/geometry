import type { Metadata } from "next";
import StudyBrowser from "@/components/StudyBrowser";

export const metadata: Metadata = {
  title: "Study shapes - Geometry",
  description:
    "Browse every 2D and 3D shape: names, colors, sides, faces, and fun facts.",
};

export default function StudyPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold">Meet the shapes</h1>
        <p className="mt-1 font-semibold text-ink-soft">
          Tap a shape to learn its name, its color, and a fun fact.
        </p>
      </div>
      <StudyBrowser />
    </div>
  );
}
