import { useEffect, useState } from "react";
import { loadStats, MAX_LINEUP_GUESSES, type LineupStats } from "@/lib/stats";

export function StatsPage() {
  const [stats, setStats] = useState<LineupStats | null>(null);

  useEffect(() => {
    setStats(loadStats());
  }, []);

  if (!stats) {
    return <p className="text-sm text-white/50">Loading…</p>;
  }

  const winRate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
  const maxBucket = Math.max(1, ...stats.distribution);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs uppercase tracking-[0.4em] text-teal/80">Your stats</p>
        <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">Daily Lineup</h1>
        <p className="mt-1 text-sm text-white/60">Stats are stored locally in your browser.</p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Played" value={stats.played} />
        <Stat label="Win %" value={`${winRate}%`} />
        <Stat label="Streak" value={stats.currentStreak} />
        <Stat label="Max streak" value={stats.maxStreak} />
      </div>

      <div className="rounded-xl border border-white/10 bg-navy-900 p-5">
        <p className="mb-3 text-xs uppercase tracking-wider text-white/50">Guess distribution</p>
        <div className="flex flex-col gap-1.5">
          {stats.distribution.map((count, i) => {
            const pct = (count / maxBucket) * 100;
            return (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="w-4 text-white/60">{i + 1}</span>
                <div className="flex-1 rounded bg-white/5">
                  <div
                    className="rounded bg-gold/80 px-2 py-0.5 text-right text-xs font-semibold text-navy-950"
                    style={{ width: `${Math.max(pct, count > 0 ? 6 : 0)}%` }}
                  >
                    {count > 0 ? count : ""}
                  </div>
                </div>
              </div>
            );
          })}
          <p className="mt-2 text-xs text-white/40">Bars show wins by guesses used. Max {MAX_LINEUP_GUESSES}.</p>
        </div>
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
