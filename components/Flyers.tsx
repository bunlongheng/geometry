// Milestone fly-by characters (no emoji - hand-drawn SVGs). They streak across
// the screen at the 1st correct answer, the 5th correct answer, and question 9.

export function SuperKidFlyer({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 60" className={className} aria-hidden>
      {/* cape */}
      <path d="M38 30 L10 14 L22 30 L8 44 Z" fill="#ef4d4d" />
      {/* body flying horizontally */}
      <ellipse cx="58" cy="30" rx="24" ry="11" fill="#3f7de0" />
      {/* head */}
      <circle cx="88" cy="26" r="10" fill="#ffd9b3" />
      <path d="M80 18 A10 10 0 0 1 96 20 L80 22 Z" fill="#43356b" />
      {/* fist forward */}
      <circle cx="108" cy="28" r="6" fill="#ffd9b3" />
      <rect x="94" y="25" width="14" height="6" rx="3" fill="#3f7de0" />
      {/* legs */}
      <rect x="26" y="24" width="16" height="5" rx="2.5" fill="#ef4d4d" />
      <rect x="24" y="31" width="16" height="5" rx="2.5" fill="#ef4d4d" />
      {/* chest star */}
      <path d="M60 25 l2 4 4.4 .4 -3.3 3 1 4.3 -4.1 -2.3 -4.1 2.3 1 -4.3 -3.3 -3 4.4 -.4 Z" fill="#ffc93c" />
      {/* speed lines */}
      <rect x="0" y="22" width="14" height="3" rx="1.5" fill="#a99ccf" opacity="0.7" />
      <rect x="4" y="36" width="10" height="3" rx="1.5" fill="#a99ccf" opacity="0.5" />
    </svg>
  );
}

export function ShootingStarFlyer({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 60" className={className} aria-hidden>
      <rect x="0" y="20" width="52" height="4" rx="2" fill="#ffc93c" opacity="0.45" />
      <rect x="8" y="30" width="60" height="5" rx="2.5" fill="#f78c2a" opacity="0.6" />
      <rect x="2" y="40" width="44" height="4" rx="2" fill="#ffc93c" opacity="0.45" />
      <path
        d="M92 8 l6.5 13.2 14.6 2.1 -10.6 10.3 2.5 14.5 -13 -6.9 -13 6.9 2.5 -14.5 -10.6 -10.3 14.6 -2.1 Z"
        fill="#ffc93c"
        stroke="#d9a410"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <circle cx="88" cy="26" r="2.5" fill="#43356b" />
      <circle cx="98" cy="26" r="2.5" fill="#43356b" />
      <path d="M89 33 Q93 37 97 33" fill="none" stroke="#43356b" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function RocketFlyer({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 60" className={className} aria-hidden>
      {/* exhaust */}
      <path d="M2 30 L30 22 L30 38 Z" fill="#ffc93c" opacity="0.8" />
      <path d="M12 30 L32 26 L32 34 Z" fill="#ff7a59" />
      {/* body */}
      <path d="M28 22 L78 22 Q96 30 78 38 L28 38 Q34 30 28 22 Z" fill="#ef4d4d" />
      <path d="M78 22 Q96 30 78 38 L74 38 Q88 30 74 22 Z" fill="#c23434" />
      {/* nose */}
      <path d="M92 26 L108 30 L92 34 Q95 30 92 26 Z" fill="#43356b" />
      {/* window */}
      <circle cx="58" cy="30" r="7" fill="#bfe3ff" stroke="#43356b" strokeWidth="3" />
      {/* fins */}
      <path d="M34 22 L26 10 L44 20 Z" fill="#3f7de0" />
      <path d="M34 38 L26 50 L44 40 Z" fill="#3f7de0" />
    </svg>
  );
}
