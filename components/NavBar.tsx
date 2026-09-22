"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/equipes", label: "Équipes" },
  { href: "/direct", label: "Direct" },
  { href: "/classement", label: "Classement" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur sticky top-0 z-10">
      <nav className="max-w-5xl mx-auto flex items-center gap-1 px-4 py-3 overflow-x-auto">
        <span className="font-bold text-lg mr-4 whitespace-nowrap">⚽ Ligue 1 · Ligue 2</span>
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                active
                  ? "bg-emerald-600 text-white"
                  : "text-zinc-600 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/10"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
