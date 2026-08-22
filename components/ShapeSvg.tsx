import { useId } from "react";
import { getColor, shade, type ColorId } from "@/lib/colors";

// Every shape in the app is drawn here from a single palette color - flat fills
// with a darker outline for 2D, lightened/darkened faces for 3D solids.
// viewBox is always 0 0 100 100 so callers size shapes with width/height alone.

function regularPolygon(n: number, cx: number, cy: number, r: number, rotate = -90): string {
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = ((rotate + (360 / n) * i) * Math.PI) / 180;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(" ");
}

function starPoints(cx: number, cy: number, outer: number, inner: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = ((-90 + 36 * i) * Math.PI) / 180;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(" ");
}

interface ShapeSvgProps {
  shapeId: string;
  colorId: ColorId;
  className?: string;
  title?: string;
}

export default function ShapeSvg({ shapeId, colorId, className, title }: ShapeSvgProps) {
  const uid = useId();
  const fill = getColor(colorId).hex;
  const line = shade(fill, -0.35);
  const lite = shade(fill, 0.28);
  const dark = shade(fill, -0.18);
  const stroke = { stroke: line, strokeWidth: 4, strokeLinejoin: "round" as const };

  let body: React.ReactNode;
  switch (shapeId) {
    // ---- 2D ----
    case "circle":
      body = <circle cx="50" cy="50" r="38" fill={fill} {...stroke} />;
      break;
    case "square":
      body = <rect x="16" y="16" width="68" height="68" rx="8" fill={fill} {...stroke} />;
      break;
    case "rectangle":
      body = <rect x="8" y="27" width="84" height="46" rx="8" fill={fill} {...stroke} />;
      break;
    case "triangle":
      body = (
        <path d="M50 13 L89 82 Q90 86 85 86 L15 86 Q10 86 11 82 Z" fill={fill} {...stroke} />
      );
      break;
    case "oval":
      body = <ellipse cx="50" cy="50" rx="42" ry="29" fill={fill} {...stroke} />;
      break;
    case "star":
      body = <polygon points={starPoints(50, 53, 42, 18)} fill={fill} {...stroke} />;
      break;
    case "heart":
      body = (
        <path
          d="M50 86 C22 64 10 48 10 33 C10 20 20 12 30 12 C39 12 46 17 50 25 C54 17 61 12 70 12 C80 12 90 20 90 33 C90 48 78 64 50 86 Z"
          fill={fill}
          {...stroke}
        />
      );
      break;
    case "diamond":
      body = <polygon points="50,8 88,50 50,92 12,50" fill={fill} {...stroke} />;
      break;
    case "pentagon":
      body = <polygon points={regularPolygon(5, 50, 53, 41)} fill={fill} {...stroke} />;
      break;
    case "hexagon":
      body = <polygon points={regularPolygon(6, 50, 50, 41)} fill={fill} {...stroke} />;
      break;
    case "octagon":
      body = <polygon points={regularPolygon(8, 50, 50, 41, -67.5)} fill={fill} {...stroke} />;
      break;
    case "trapezoid":
      body = <polygon points="28,27 72,27 92,73 8,73" fill={fill} {...stroke} />;
      break;
    case "parallelogram":
      body = <polygon points="28,28 92,28 72,72 8,72" fill={fill} {...stroke} />;
      break;
    case "semicircle":
      body = <path d="M10 66 A40 40 0 0 1 90 66 Z" fill={fill} {...stroke} />;
      break;
    case "crescent":
      body = (
        <path
          d="M63 10 A41 41 0 1 0 63 90 A33 33 0 1 1 63 10 Z"
          fill={fill}
          {...stroke}
        />
      );
      break;
    // ---- 3D ----
    case "sphere":
      body = (
        <>
          <defs>
            <radialGradient id={`${uid}-s`} cx="0.36" cy="0.32" r="0.85">
              <stop offset="0%" stopColor={lite} />
              <stop offset="70%" stopColor={fill} />
              <stop offset="100%" stopColor={dark} />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="38" fill={`url(#${uid}-s)`} {...stroke} />
          <ellipse cx="38" cy="36" rx="11" ry="7" fill="#ffffff" opacity="0.45" transform="rotate(-25 38 36)" />
        </>
      );
      break;
    case "cube":
      body = (
        <>
          <polygon points="50,10 84,26 50,42 16,26" fill={lite} {...stroke} />
          <polygon points="16,26 50,42 50,90 16,74" fill={fill} {...stroke} />
          <polygon points="84,26 50,42 50,90 84,74" fill={dark} {...stroke} />
        </>
      );
      break;
    case "cuboid":
      body = (
        <>
          <polygon points="30,22 92,22 78,38 8,38" fill={lite} {...stroke} />
          <polygon points="8,38 78,38 78,78 8,78" fill={fill} {...stroke} />
          <polygon points="78,38 92,22 92,64 78,78" fill={dark} {...stroke} />
        </>
      );
      break;
    case "cylinder":
      body = (
        <>
          <path d="M22 26 L22 74 A28 12 0 0 0 78 74 L78 26" fill={fill} {...stroke} />
          <ellipse cx="50" cy="26" rx="28" ry="12" fill={lite} {...stroke} />
        </>
      );
      break;
    case "cone":
      body = (
        <>
          <path d="M50 8 L81 74 A31 12 0 0 1 19 74 Z" fill={fill} {...stroke} />
          <path d="M19 74 A31 12 0 0 0 81 74 A31 12 0 0 0 19 74" fill={dark} {...stroke} />
        </>
      );
      break;
    case "pyramid":
      body = (
        <>
          <polygon points="50,10 20,78 50,90" fill={lite} {...stroke} />
          <polygon points="50,10 80,78 50,90" fill={dark} {...stroke} />
        </>
      );
      break;
    case "prism":
      body = (
        <>
          <polygon points="30,20 58,74 2,74" fill={lite} transform="translate(14 4)" {...stroke} />
          <polygon points="44,24 84,36 84,84 58,78" fill={dark} {...stroke} />
        </>
      );
      break;
    case "torus":
      body = (
        <>
          <path
            d="M50 14 A36 30 0 1 0 50 86 A36 30 0 1 0 50 14 M50 40 A12 11 0 1 1 50 62 A12 11 0 1 1 50 40"
            fill={fill}
            fillRule="evenodd"
            {...stroke}
          />
          <ellipse cx="38" cy="30" rx="12" ry="6" fill={lite} opacity="0.8" transform="rotate(-16 38 30)" />
        </>
      );
      break;
    case "hemisphere":
      body = (
        <>
          <path d="M12 58 A38 38 0 0 1 88 58 Z" fill={fill} {...stroke} />
          <ellipse cx="50" cy="58" rx="38" ry="13" fill={lite} {...stroke} />
        </>
      );
      break;
    case "octahedron":
      body = (
        <>
          <polygon points="50,6 22,50 50,94" fill={lite} {...stroke} />
          <polygon points="50,6 78,50 50,94" fill={dark} {...stroke} />
        </>
      );
      break;
    default:
      body = <circle cx="50" cy="50" r="38" fill={fill} {...stroke} />;
  }

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label={title ?? shapeId}
    >
      {title ? <title>{title}</title> : null}
      {body}
    </svg>
  );
}
