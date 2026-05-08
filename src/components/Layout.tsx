import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { PATCH_VERSION } from "@/lib/champions";
import { todayKey } from "@/lib/seed";

const LINKS = [
  { href: "/", label: "Create Lineup" },
  { href: "/grid", label: "Daily Grid" },
  { href: "/stats", label: "Stats" },
];

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const date = todayKey();
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-ink-700/60">
        {/* Thin foil rule across the very top */}
        <div className="h-px bg-gradient-to-r from-transparent via-foil-dim/80 to-transparent" />
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-8 sm:py-5">
          <Link href="/" className="group flex items-center gap-3">
            <Crest />
            <span className="flex flex-col leading-none">
              <span className="font-display text-xl font-extrabold uppercase tracking-caps-tight text-parchment-50 transition group-hover:text-foil-bright sm:text-2xl">
                LoL Football
              </span>
              <span className="eyebrow-dim mt-1.5">Daily Roster Puzzles</span>
            </span>
          </Link>
          <nav className="flex items-stretch gap-1 sm:gap-0">
            {LINKS.map((link) => {
              const active =
                location === link.href || (link.href !== "/" && location.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "group relative px-3 py-2 font-display text-xs font-semibold uppercase tracking-caps transition sm:px-5 sm:text-sm",
                    active ? "text-foil" : "text-parchment-200 hover:text-parchment-50",
                  )}
                >
                  {link.label}
                  <span
                    className={cn(
                      "absolute inset-x-3 bottom-0 h-px origin-left transition-transform sm:inset-x-5",
                      active ? "scale-x-100 bg-foil" : "scale-x-0 bg-foil-dim group-hover:scale-x-100",
                    )}
                  />
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8 sm:py-14">
        {children}
      </main>

      <footer className="mt-12 border-t border-ink-700/60 bg-ink-900/40">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-8 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Crest small />
              <span className="font-display text-sm font-bold uppercase tracking-caps text-parchment-100">
                LoL Football
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
              <span className="eyebrow-dim nums">Patch {PATCH_VERSION}</span>
              <span className="eyebrow-dim nums">{date}</span>
              <a
                href="https://buymeacoffee.com"
                target="_blank"
                rel="noreferrer"
                className="eyebrow-dim transition hover:text-foil"
              >
                Buy me a coffee
              </a>
            </div>
          </div>
          <div className="rule-foil opacity-50" />
          <p className="max-w-3xl text-xs leading-relaxed text-parchment-300">
            LoL Football isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or
            anyone officially involved in producing or managing League of Legends. League of Legends and Riot
            Games are trademarks or registered trademarks of Riot Games, Inc. League of Legends © Riot Games, Inc.
          </p>
        </div>
      </footer>
    </div>
  );
}

function Crest({ small }: { small?: boolean }) {
  const size = small ? "h-7 w-7" : "h-9 w-9";
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-sm border border-foil-dim/70 bg-ink-900 font-display font-extrabold uppercase tracking-caps-tight text-foil shadow-plate",
        small ? "text-[10px]" : "text-xs",
        size,
      )}
      aria-hidden
    >
      LF
    </span>
  );
}
