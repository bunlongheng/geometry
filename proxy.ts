import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Per-request Content-Security-Policy with a fresh nonce, so script-src no longer
// needs 'unsafe-inline'. Next.js reads the nonce from the CSP header we set here and
// stamps it onto every framework/inline script it emits; 'strict-dynamic' then trusts
// the chunks those nonced scripts load. Next 16 renamed `middleware` -> `proxy`.
//
// Dev keeps 'unsafe-eval' (React uses eval for richer error stacks) and 'unsafe-inline'
// on style-src; iOS Safari enforces CSP strictly, so the dev bundle needs both to run.
// style-src keeps 'unsafe-inline' in prod too - React sets inline style attributes,
// which the script hardening does not cover. Only script-src is hardened here.
export function proxy(request: NextRequest) {
  const isDev = process.env.NODE_ENV !== "production";
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const csp = [
    "default-src 'self'",
    "img-src 'self' data:",
    "media-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "worker-src 'self'",
    "manifest-src 'self'",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  // Run on document requests only: skip Next internals and any static file (has an
  // extension), and skip link-prefetches, so nonce generation never touches assets.
  matcher: [
    {
      source: "/((?!_next/|.*\\.[\\w]+$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
