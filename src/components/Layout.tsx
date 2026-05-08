import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { PATCH_VERSION } from "@/lib/champions";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/lineup", label: "Daily Lineup" },
  { href: "/build", label: "Build" },
  { href: "/stats", label: "Stats" },
];

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return (
    <div className="flex min-h-dvh flex-col bg-navy-950">
      <header className="border-b border-white/5 bg-navy-900/60 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="font-display text-lg font-bold tracking-wider text-gold sm:text-xl">
              LoL FOOTBALL
            </span>
            <span className="hidden text-xs text-white/40 sm:inline">daily roster puzzles</span>
          </Link>
          <nav className="flex gap-1 text-sm">
            {LINKS.map((link) => {
              const active =
                location === link.href || (link.href !== "/" && location.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded px-2 py-1 transition",
                    active ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
      <footer className="border-t border-white/5 bg-navy-900/60 px-4 py-6 text-xs text-white/40">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 sm:flex-row">
          <p>
            LoL Football isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot
            Games or anyone officially involved in producing or managing League of Legends. League of
            Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc. League
            of Legends © Riot Games, Inc.
          </p>
        </div>
        <div className="mx-auto mt-3 flex max-w-5xl items-center justify-between gap-4 text-white/30">
          <span>patch {PATCH_VERSION}</span>
          <a href="https://buymeacoffee.com" target="_blank" rel="noreferrer" className="hover:text-white/60">
            ☕ Buy me a coffee
          </a>
        </div>
      </footer>
    </div>
  );
}
