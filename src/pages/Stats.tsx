import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { loadGridStats, type GridStats } from "@/lib/gridStats";
import { Eyebrow } from "@/components/Eyebrow";
import { PageHeader } from "@/components/PageHeader";

export function StatsPage() {
  const [stats, setStats] = useState<GridStats | null>(null);

  useEffect(() => {
    setStats(loadGridStats());
  }, []);

  if (!stats) {
    return <p className="text-sm text-parchment-300">Loading…</p>;
  }

  const avgScore = stats.played > 0 ? (stats.cellsFilled / stats.played).toFixed(1) : "—";
  const perfectRate = stats.played > 0 ? Math.round((stats.perfectDays / stats.played) * 100) : 0;
  const isEmpty = stats.played === 0;

  return (
    <div className="flex flex-col gap-12">
      <PageHeader
        index={3}
        eyebrow="Your Stats"
        title={
          <>
            The card back, where the <span className="text-foil">numbers</span> live.
          </>
        }
        description="Tracked locally in your browser. No accounts. Clear your storage and they're gone."
      />

      {isEmpty ? <EmptyState /> : <Filled stats={stats} avgScore={avgScore} perfectRate={perfectRate} />}
    </div>
  );
}

function Filled({
  stats,
  avgScore,
  perfectRate,
}: {
  stats: GridStats;
  avgScore: string;
  perfectRate: number;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Hero stat: current streak */}
      <section className="card-plate bg-guilloche flex flex-col justify-between gap-6 p-8 lg:col-span-7 lg:p-10 animate-fade-up">
        <Eyebrow>Current Streak · Daily Grid</Eyebrow>
        <div className="flex items-baseline gap-6">
          <span className="nums font-display text-[clamp(5rem,12vw,9rem)] font-extrabold leading-none text-foil">
            {stats.currentStreak}
          </span>
          <span className="flex flex-col gap-1">
            <span className="font-display text-base font-bold uppercase tracking-caps text-parchment-50">
              Day{stats.currentStreak === 1 ? "" : "s"}
            </span>
            <span className="text-sm text-parchment-300">
              Max <span className="nums text-parchment-50">{stats.maxStreak}</span>
            </span>
          </span>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-parchment-200">
          A streak survives only on immaculate days. Miss a single cell — or skip a day — and it resets.
        </p>
      </section>

      {/* Side stack: played + immaculate rate */}
      <div className="flex flex-col gap-6 lg:col-span-5">
        <BigStat label="Days Played" value={stats.played} />
        <BigStat label="Avg Score / 9" value={avgScore} />
      </div>

      {/* Immaculate breakdown */}
      <section className="card-plate flex flex-col justify-between gap-5 p-7 lg:col-span-7">
        <div className="flex items-baseline justify-between gap-6">
          <Eyebrow>Immaculate Days</Eyebrow>
          <span className="eyebrow-dim nums">{perfectRate}% rate</span>
        </div>
        <p className="nums font-display text-6xl font-extrabold leading-none text-parchment-50">
          {stats.perfectDays}
          <span className="ml-2 text-3xl text-parchment-300">/ {stats.played}</span>
        </p>
        <ProgressBar percent={perfectRate} />
        <p className="text-xs leading-relaxed text-parchment-300">
          A perfect run fills all 9 cells correctly. Keep the streak alive by going immaculate every day.
        </p>
      </section>

      {/* Total cells */}
      <BigStat
        label="Cells Hit (All-Time)"
        value={stats.cellsFilled}
        sub={`Across ${stats.played} day${stats.played === 1 ? "" : "s"}`}
        large
        className="lg:col-span-5"
      />

      <Link
        href="/grid"
        className="card-plate group flex items-center justify-between gap-6 p-7 transition hover:border-foil lg:col-span-12"
      >
        <div>
          <Eyebrow>Today's Grid</Eyebrow>
          <p className="mt-2 font-display text-2xl font-bold uppercase tracking-caps-tight text-parchment-50 group-hover:text-foil sm:text-3xl">
            Play the daily puzzle →
          </p>
        </div>
        <ArrowRight className="h-7 w-7 text-foil-dim transition group-hover:translate-x-1 group-hover:text-foil" />
      </Link>
    </div>
  );
}

function BigStat({
  label,
  value,
  sub,
  large,
  className,
}: {
  label: string;
  value: string | number;
  sub?: string;
  large?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`card-plate flex flex-1 flex-col justify-between gap-4 p-7 animate-fade-up ${className ?? ""}`}
    >
      <Eyebrow>{label}</Eyebrow>
      <p
        className={`nums font-display font-extrabold leading-none text-parchment-50 ${
          large ? "text-7xl" : "text-6xl"
        }`}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-parchment-300">{sub}</p>}
    </div>
  );
}

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-ink-700">
      <div
        className="h-full bg-foil transition-all duration-500"
        style={{ width: `${Math.min(100, percent)}%` }}
      />
    </div>
  );
}

function EmptyState() {
  return (
    <section className="card-plate flex flex-col items-start gap-5 p-10 text-left">
      <Eyebrow>Empty Card Back</Eyebrow>
      <p className="display-lg max-w-2xl">No grids played yet. The numbers will fill in once you do.</p>
      <p className="max-w-prose text-base leading-relaxed text-parchment-200">
        Stats are stored locally in your browser. Play today's daily grid to start tracking your streak,
        average score, and immaculate-day count.
      </p>
      <Link href="/grid" className="btn-foil mt-2">
        Play Today's Grid <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}
