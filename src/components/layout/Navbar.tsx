"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/ask", label: "Ask" },
  { href: "/players", label: "Players" },
  { href: "/compare", label: "Compare" },
  { href: "/draft", label: "Draft" },
] as const;

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-edge bg-canvas/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-baseline gap-1 group">
          <span className="font-display text-3xl tracking-wider text-slate-100 transition-colors group-hover:text-white">
            Court
          </span>
          <span className="font-display text-3xl tracking-wider text-orange-500 transition-colors group-hover:text-orange-400">
            IQ
          </span>
        </Link>

        <ul className="flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={[
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "text-orange-500"
                      : "text-slate-400 hover:text-slate-100",
                  ].join(" ")}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
