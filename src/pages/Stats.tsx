import { useEffect, useState } from "react";
import { loadGridStats, type GridStats } from "@/lib/gridStats";

export function StatsPage() {
  const [stats, setStats] = useState<GridStats | null>(null);

  useEffect(() => {
    setStats(loadGridStats());
  }, []);

  if (!stats) {
    return <p className="text-sm text-white/50">Loading…</p>;
  }

  const avgScore = stats.played > 0 ? (stats.cellsFilled / stats.played).toFixed(1) : "—";
  const perfectRate = stats.played > 0 ? Math.round((stats.perfectDays / stats.played) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs uppercase tracking-[0.4em] text-teal/80">Your stats</p>
        <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">Daily Grid</h1>
        <p className="mt-1 text-sm text-white/60">Stats are stored locally in your browser.</p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Played" value={stats.played} />
        <Stat label="Avg / 9" value={avgScore} />
        <Stat label="Streak" value={stats.currentStreak} />
        <Stat label="Max streak" value={stats.maxStreak} />
      </div>

      <div className="rounded-xl border border-white/10 bg-navy-900 p-5">
        <p className="mb-3 text-xs uppercase tracking-wider text-white/50">Immaculate days</p>
        <p className="text-3xl font-bold text-gold">
          {stats.perfectDays}{" "}
          <span className="text-base font-normal text-white/50">({perfectRate}% of plays)</span>
        </p>
        <p className="mt-2 text-xs text-white/40">
          A perfect run fills all 9 cells correctly. Keep your streak alive by going immaculate every day.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-navy-900 p-4 text-center">
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wider text-white/50">{label}</p>
    </div>
  );
}
