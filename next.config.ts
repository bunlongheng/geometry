import type { NextConfig } from "next";

// The Content-Security-Policy is set per-request in proxy.ts so script-src can carry a
// fresh nonce instead of 'unsafe-inline'. The static headers below apply to every route.
const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  devIndicators: false,
  // All shapes are drawn in-app (SVG/CSS) - no remote asset hosts needed.
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Never cache the HTML document, so a new deploy is picked up immediately
      // (the hashed /_next/static assets it points to stay immutably cached).
      {
        source: "/",
        headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }],
      },
    ];
  },
};

export default nextConfig;
