import ShapeSvg from "@/components/ShapeSvg";
import type { ColorId } from "@/lib/colors";

// App-wide ambient background: faded colorful shapes drifting slowly behind the
// content. Low opacity + slow float so it reads as atmosphere, never noise.
const FLOATERS: {
  id: string;
  color: ColorId;
  cls: string;
  tilt: string;
  delay: string;
  dur: string;
}[] = [
  { id: "circle", color: "red", cls: "left-[3%] top-[12%] h-16 w-16", tilt: "0deg", delay: "0s", dur: "7s" },
  { id: "star", color: "yellow", cls: "right-[5%] top-[8%] h-20 w-20", tilt: "-10deg", delay: "1.2s", dur: "8s" },
  { id: "triangle", color: "green", cls: "left-[10%] top-[46%] h-14 w-14", tilt: "12deg", delay: "2.4s", dur: "6.5s" },
  { id: "square", color: "blue", cls: "right-[9%] top-[38%] h-12 w-12", tilt: "8deg", delay: "0.6s", dur: "7.5s" },
  { id: "heart", color: "pink", cls: "left-[4%] bottom-[14%] h-12 w-12", tilt: "-8deg", delay: "1.8s", dur: "8.5s" },
  { id: "hexagon", color: "orange", cls: "right-[14%] bottom-[8%] h-16 w-16", tilt: "14deg", delay: "3s", dur: "7s" },
  { id: "diamond", color: "teal", cls: "left-[30%] top-[6%] h-10 w-10", tilt: "0deg", delay: "2s", dur: "9s" },
  { id: "crescent", color: "yellow", cls: "right-[32%] bottom-[20%] h-12 w-12", tilt: "-14deg", delay: "0.9s", dur: "8s" },
  { id: "pentagon", color: "purple", cls: "left-[22%] bottom-[4%] h-10 w-10", tilt: "10deg", delay: "2.7s", dur: "7.2s" },
  { id: "oval", color: "purple", cls: "right-[3%] top-[64%] h-14 w-14", tilt: "-6deg", delay: "1.5s", dur: "6.8s" },
  { id: "semicircle", color: "pink", cls: "left-[44%] bottom-[10%] h-10 w-10", tilt: "6deg", delay: "3.4s", dur: "9s" },
  { id: "octagon", color: "red", cls: "right-[44%] top-[20%] h-9 w-9", tilt: "-4deg", delay: "4s", dur: "8.2s" },
];

export default function FloatingShapes() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      {FLOATERS.map((f) => (
        <div
          key={`${f.id}-${f.cls}`}
          className={`animate-float-slow absolute opacity-[0.13] ${f.cls}`}
          style={
            {
              "--tilt": f.tilt,
              animationDelay: f.delay,
              animationDuration: f.dur,
            } as React.CSSProperties
          }
        >
          <ShapeSvg shapeId={f.id} colorId={f.color} className="h-full w-full" />
        </div>
      ))}
    </div>
  );
}
