import type { Metadata } from "next";
import QuizGame from "@/components/QuizGame";

export const metadata: Metadata = {
  title: "Shape quiz - Geometry",
  description:
    "Pick a level, choose 2D or 3D shapes, and answer questions like 'Tap the blue circle' before the timer runs out - score up to 100.",
};

export default function QuizPage() {
  return <QuizGame />;
}
