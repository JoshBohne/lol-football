import { Link } from "wouter";
import { puzzleNumber, todayKey } from "@/lib/seed";
import { AdSlot } from "@/components/AdSlot";
import { ArrowRight, Calendar, Layout as LayoutIcon } from "lucide-react";
import type { ReactNode } from "react";

export function HomePage() {
  const num = puzzleNumber(todayKey());
  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-xl border border-white/10 bg-gradient-to-br from-navy-800 to-navy-900 p-6 shadow-xl sm:p-10">
        <p className="text-xs uppercase tracking-[0.4em] text-gold/80">Daily puzzle</p>
        <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-white sm:text-5xl">
          Build a football roster<br className="hidden sm:block" /> from League of Legends.
        </h1>
        <p className="mt-3 max-w-xl text-sm text-white/70 sm:text-base">
          A new puzzle every day. Six guesses. Wordle-style feedback. Streaks, share grids, and a free-build sandbox for your dream 22-champion roster.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/lineup"
            className="inline-flex items-center gap-2 rounded-md bg-gold px-5 py-2.5 text-sm font-semibold text-navy-950 transition hover:bg-gold-dark hover:text-white"
          >
            Play today's puzzle <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/build"
            className="inline-flex items-center gap-2 rounded-md border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/5"
          >
            Free Build mode
          </Link>
        </div>
      </section>

      <AdSlot slot="home-top" variant="banner" />

      <section className="grid gap-4 sm:grid-cols-2">
        <ModeCard
          title="Daily Lineup"
          subtitle={`Puzzle #${num} · today`}
          description="Guess the 11-champion offensive lineup. 6 attempts. Color-coded feedback per slot."
          href="/lineup"
          icon={<Calendar className="h-5 w-5" />}
          accent="bg-gold/10 text-gold border-gold/30"
        />
        <ModeCard
          title="Build Mode"
          subtitle="Free play"
          description="Drag champions to all 22 positions. Save and share your roster via link."
          href="/build"
          icon={<LayoutIcon className="h-5 w-5" />}
          accent="bg-teal/10 text-teal border-teal/30"
        />
        <ModeCard
          title="Immaculate Grid"
          subtitle="Coming soon"
          description="3×3 trivia grid. Match champions to region × class × role constraints."
          href="#"
          icon={<LayoutIcon className="h-5 w-5" />}
          accent="bg-white/5 text-white/40 border-white/10"
          disabled
        />
        <ModeCard
          title="Connections"
          subtitle="Coming soon"
          description="16 champions, 4 hidden squads. Group them all to win — 4 mistakes allowed."
          href="#"
          icon={<LayoutIcon className="h-5 w-5" />}
          accent="bg-white/5 text-white/40 border-white/10"
          disabled
        />
      </section>
    </div>
  );
}

function ModeCard({
  title,
  subtitle,
  description,
  href,
  icon,
  accent,
  disabled,
}: {
  title: string;
  subtitle: string;
  description: string;
  href: string;
  icon: ReactNode;
  accent: string;
  disabled?: boolean;
}) {
  const content = (
    <div
      className={`group flex h-full flex-col gap-2 rounded-xl border bg-navy-900 p-5 transition ${
        disabled ? "cursor-not-allowed" : "hover:border-white/30 hover:bg-navy-800"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-0.5 text-xs ${accent}`}>
          {icon}
          {subtitle}
        </span>
        {!disabled && <ArrowRight className="h-4 w-4 text-white/40 transition group-hover:translate-x-0.5 group-hover:text-white" />}
      </div>
      <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm text-white/60">{description}</p>
    </div>
  );
  if (disabled) return content;
  return <Link href={href}>{content}</Link>;
}
