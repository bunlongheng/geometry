import type { Metadata, Viewport } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import { headers } from "next/headers";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import "./globals.css";

const baloo = Baloo_2({ subsets: ["latin"], variable: "--font-baloo" });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });

export const metadata: Metadata = {
  metadataBase: new URL("https://geometry-bheng.vercel.app"),
  title: "Geometry - learn shapes, play quizzes",
  description:
    "A friendly geometry playground for kids: study every 2D and 3D shape, learn its color, then beat the quiz at 3 levels.",
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff6ec" },
    { media: "(prefers-color-scheme: dark)", color: "#1f1933" },
  ],
};

// Runs before first paint so there is no flash of the wrong theme. Falls back to
// the system preference when nothing is saved yet.
const themeScript = `try{var s=localStorage.getItem("geometry-theme");var t=s==="dark"||s==="light"?s:(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.theme=t}catch(e){}`;

function LogoMark() {
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8" aria-hidden>
      <circle cx="13" cy="14" r="9" fill="#ef4d4d" />
      <rect x="18" y="18" width="16" height="16" rx="3" fill="#3f7de0" opacity="0.92" />
      <polygon points="26,4 36,20 16,20" fill="#ffc93c" opacity="0.92" />
    </svg>
  );
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${baloo.variable} ${nunito.variable} min-h-dvh font-body antialiased`}>
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: themeScript }} />
        <header className="sticky top-0 z-40 border-b-2 border-line bg-bg/85 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2">
              <LogoMark />
              <span className="font-display text-2xl font-bold tracking-tight">Geometry</span>
            </Link>
            <nav className="flex items-center gap-2">
              <Link
                href="/study"
                className="sticker sticker-press px-4 py-1.5 font-display text-base font-semibold"
              >
                Study
              </Link>
              <Link
                href="/quiz"
                className="sticker sticker-press px-4 py-1.5 font-display text-base font-semibold"
              >
                Quiz
              </Link>
              <ThemeToggle />
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl px-4 pb-[calc(2.5rem+env(safe-area-inset-bottom))] pt-6">
          {children}
        </main>
      </body>
    </html>
  );
}
