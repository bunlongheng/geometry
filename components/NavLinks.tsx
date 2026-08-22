"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Header nav pills - the current page's pill lights up in the accent color.
export default function NavLinks() {
  const pathname = usePathname();
  const links = [
    { href: "/study", label: "Study" },
    { href: "/quiz", label: "Quiz" },
  ] as const;

  return (
    <>
      {links.map((l) => {
        const active = pathname === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`sticker sticker-press px-4 py-1.5 font-display text-base font-semibold ${
              active ? "sticker-selected" : ""
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </>
  );
}
