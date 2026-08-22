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
  // Straight-edged shapes keep TRUE sharp corners (owner rule: a rounded
  // rectangle confuses corner-learning) - miter join, no corner radius.
  const sharp = { stroke: line, strokeWidth: 4, strokeLinejoin: "miter" as const };
  // Line/angle glyphs are stroke drawings in the palette color itself.
  const lineStroke = {
    stroke: fill,
    strokeWidth: 6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  let body: React.ReactNode;
  switch (shapeId) {
    // ---- 2D ----
    case "circle":
      body = <circle cx="50" cy="50" r="38" fill={fill} {...stroke} />;
      break;
    case "square":
      body = <rect x="16" y="16" width="68" height="68" fill={fill} {...sharp} />;
      break;
    case "rectangle":
      body = <rect x="8" y="27" width="84" height="46" fill={fill} {...sharp} />;
      break;
    case "triangle":
      body = <polygon points="50,13 89,85 11,85" fill={fill} {...sharp} />;
      break;
    case "oval":
      body = <ellipse cx="50" cy="50" rx="42" ry="29" fill={fill} {...stroke} />;
      break;
    case "star":
      body = <polygon points={starPoints(50, 53, 42, 18)} fill={fill} {...sharp} />;
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
      body = <polygon points="50,8 88,50 50,92 12,50" fill={fill} {...sharp} />;
      break;
    case "pentagon":
      body = <polygon points={regularPolygon(5, 50, 53, 41)} fill={fill} {...sharp} />;
      break;
    case "hexagon":
      body = <polygon points={regularPolygon(6, 50, 50, 41)} fill={fill} {...sharp} />;
      break;
    case "octagon":
      body = <polygon points={regularPolygon(8, 50, 50, 41, -67.5)} fill={fill} {...sharp} />;
      break;
    case "trapezoid":
      body = <polygon points="28,27 72,27 92,73 8,73" fill={fill} {...sharp} />;
      break;
    case "parallelogram":
      body = <polygon points="28,28 92,28 72,72 8,72" fill={fill} {...sharp} />;
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
    case "cross":
      body = (
        <polygon
          points="38,10 62,10 62,38 90,38 90,62 62,62 62,90 38,90 38,62 10,62 10,38 38,38"
          fill={fill}
          {...sharp}
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
      // Tent orientation: sloped roof face behind, triangular front face on top.
      body = (
        <>
          <polygon points="36,26 64,16 88,66 60,76" fill={dark} {...stroke} />
          <polygon points="36,26 60,76 12,76" fill={lite} {...stroke} />
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
          <path d="M26 34 A30 20 0 0 1 74 34" fill="none" stroke={lite} strokeWidth="6" strokeLinecap="round" opacity="0.7" />
        </>
      );
      break;
    case "hemisphere":
      // Dome sitting flat-side down: the dark underside lip peeks out below.
      body = (
        <>
          <ellipse cx="50" cy="60" rx="38" ry="12" fill={dark} {...stroke} />
          <path d="M12 60 A38 38 0 0 1 88 60 L12 60 Z" fill={fill} {...stroke} />
        </>
      );
      break;
    case "octahedron":
      // 4 visible faces around a raised middle edge - reads as 2 glued pyramids.
      body = (
        <>
          <polygon points="50,6 16,46 50,58" fill={lite} {...stroke} />
          <polygon points="50,6 84,46 50,58" fill={fill} {...stroke} />
          <polygon points="16,46 50,58 50,94" fill={dark} {...stroke} />
          <polygon points="84,46 50,58 50,94" fill={shade(fill, -0.34)} {...stroke} />
        </>
      );
      break;
    case "tetrahedron":
      body = (
        <>
          <polygon points="50,10 14,78 60,86" fill={lite} {...stroke} />
          <polygon points="50,10 86,72 60,86" fill={dark} {...stroke} />
        </>
      );
      break;
    case "hexprism":
      // Vertical pencil-style prism: squashed hex top + 2 body faces.
      body = (
        <>
          <polygon points="26,28 38,18 62,18 74,28 50,38" fill={lite} {...stroke} />
          <polygon points="26,28 50,38 50,88 26,78" fill={fill} {...stroke} />
          <polygon points="50,38 74,28 74,78 50,88" fill={dark} {...stroke} />
        </>
      );
      break;
    case "pentprism":
      // Extruded pentagon: dark back face peeking behind the light front.
      body = (
        <>
          <polygon points={regularPolygon(5, 60, 44, 32)} fill={dark} {...stroke} />
          <polygon points={regularPolygon(5, 42, 56, 32)} fill={lite} {...stroke} />
        </>
      );
      break;
    case "dodecahedron":
      // d12 dice: pentagon face framed by a 10-sided shaded ring.
      body = (
        <>
          <polygon points={regularPolygon(10, 50, 50, 42, -90)} fill={dark} {...stroke} />
          <polygon points={regularPolygon(5, 50, 50, 25)} fill={lite} {...stroke} />
        </>
      );
      break;
    case "ellipsoid":
      body = (
        <>
          <defs>
            <radialGradient id={`${uid}-e`} cx="0.36" cy="0.32" r="0.9">
              <stop offset="0%" stopColor={lite} />
              <stop offset="70%" stopColor={fill} />
              <stop offset="100%" stopColor={dark} />
            </radialGradient>
          </defs>
          <ellipse cx="50" cy="50" rx="42" ry="27" fill={`url(#${uid}-e)`} {...stroke} />
          <ellipse cx="36" cy="40" rx="12" ry="6" fill="#ffffff" opacity="0.4" transform="rotate(-18 36 40)" />
        </>
      );
      break;
    case "frustum":
      // Flowerpot: sliced cone with a light top ellipse and dark bottom curve.
      body = (
        <>
          <path d="M30 30 L16 72 A34 11 0 0 0 84 72 L70 30" fill={fill} {...stroke} />
          <path d="M16 72 A34 11 0 0 0 84 72 A34 11 0 0 0 16 72" fill={dark} {...stroke} />
          <ellipse cx="50" cy="30" rx="20" ry="8" fill={lite} {...stroke} />
        </>
      );
      break;
    // ---- Lines ---- (stroke drawings; arrowheads come from the shared marker)
    case "line":
      body = <line x1="8" y1="50" x2="92" y2="50" {...lineStroke} />;
      break;
    case "segment":
      body = (
        <>
          <line x1="18" y1="50" x2="82" y2="50" {...lineStroke} />
          <circle cx="18" cy="50" r="6" fill={fill} />
          <circle cx="82" cy="50" r="6" fill={fill} />
        </>
      );
      break;
    case "ray":
      body = (
        <>
          <line x1="18" y1="50" x2="92" y2="50" {...lineStroke} />
          <circle cx="18" cy="50" r="7" fill={fill} />
        </>
      );
      break;
    case "parallel":
      body = (
        <>
          <line x1="14" y1="38" x2="86" y2="38" {...lineStroke} />
          <line x1="14" y1="62" x2="86" y2="62" {...lineStroke} />
        </>
      );
      break;
    case "perpendicular":
      body = (
        <>
          <line x1="12" y1="70" x2="88" y2="70" {...lineStroke} />
          <line x1="50" y1="12" x2="50" y2="70" {...lineStroke} />
          <path d="M50 54 L66 54 L66 70" fill="none" stroke={dark} strokeWidth="3" />
        </>
      );
      break;
    case "intersecting":
      body = (
        <>
          <line x1="16" y1="28" x2="84" y2="72" {...lineStroke} />
          <line x1="16" y1="72" x2="84" y2="28" {...lineStroke} />
        </>
      );
      break;
    case "curve":
      body = (
        <path d="M14 68 C32 22 58 84 86 34" fill="none" {...lineStroke} />
      );
      break;
    case "zigzag":
      body = (
        <polyline points="12,68 32,32 52,68 72,32 88,54" fill="none" {...lineStroke} />
      );
      break;
    // ---- Angles ---- (2 rays from a vertex + an arc marking the opening)
    case "right-angle":
      body = (
        <>
          <path d="M26 60 L44 60 L44 78" fill="none" stroke={dark} strokeWidth="3.5" />
          <line x1="26" y1="78" x2="90" y2="78" {...lineStroke} />
          <line x1="26" y1="78" x2="26" y2="14" {...lineStroke} />
          <circle cx="26" cy="78" r="5" fill={fill} />
        </>
      );
      break;
    case "acute-angle":
      body = (
        <>
          <path d="M52 78 A28 28 0 0 0 43 58" fill="none" stroke={dark} strokeWidth="3.5" />
          <line x1="24" y1="78" x2="90" y2="78" {...lineStroke} />
          <line x1="24" y1="78" x2="70" y2="28" {...lineStroke} />
          <circle cx="24" cy="78" r="5" fill={fill} />
        </>
      );
      break;
    case "obtuse-angle":
      body = (
        <>
          <path d="M58 72 A24 24 0 0 0 19 54" fill="none" stroke={dark} strokeWidth="3.5" />
          <line x1="34" y1="72" x2="94" y2="72" {...lineStroke} />
          <line x1="34" y1="72" x2="6" y2="36" {...lineStroke} />
          <circle cx="34" cy="72" r="5" fill={fill} />
        </>
      );
      break;
    case "straight-angle":
      body = (
        <>
          <path d="M74 60 A24 24 0 0 0 26 60" fill="none" stroke={dark} strokeWidth="3.5" />
          <line x1="8" y1="60" x2="92" y2="60" {...lineStroke} />
          <circle cx="50" cy="60" r="6" fill={fill} />
        </>
      );
      break;
    case "reflex-angle":
      body = (
        <>
          <path d="M72 56 A22 22 0 1 1 36 38" fill="none" stroke={dark} strokeWidth="3.5" />
          <line x1="50" y1="56" x2="92" y2="56" {...lineStroke} />
          <line x1="50" y1="56" x2="24" y2="22" {...lineStroke} />
          <circle cx="50" cy="56" r="5" fill={fill} />
        </>
      );
      break;
    case "full-angle":
      body = (
        <>
          <circle cx="50" cy="50" r="30" fill="none" {...lineStroke} />
          <circle cx="50" cy="50" r="6" fill={fill} />
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
