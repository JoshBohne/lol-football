/**
 * Per-mode stats stored in localStorage. No accounts, no server.
 * Each daily grid result is keyed by UTC date so replays don't double-count.
 */

const STORAGE_KEY = "lolfb.grid.stats.v1";

export interface GridStats {
  played: number;
  /** Sum of cells correctly filled across all played days. */
  cellsFilled: number;
  /** Days where all 9 cells were filled correctly. */
  perfectDays: number;
  currentStreak: number;
  maxStreak: number;
  /** ISO date of last finished grid, used to compute streak gaps. */
  lastDate: string | null;
  /** Map of dateKey → result so we ignore duplicate submits from refreshes. */
  results: Record<string, { score: number; perfect: boolean }>;
}

function emptyStats(): GridStats {
  return {
    played: 0,
    cellsFilled: 0,
    perfectDays: 0,
    currentStreak: 0,
    maxStreak: 0,
    lastDate: null,
    results: {},
  };
}

export function loadGridStats(): GridStats {
  if (typeof window === "undefined") return emptyStats();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStats();
    return { ...emptyStats(), ...(JSON.parse(raw) as GridStats) };
  } catch {
    return emptyStats();
  }
}

function save(stats: GridStats) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

function isConsecutive(prev: string, next: string): boolean {
  const a = Date.parse(`${prev}T00:00:00Z`);
  const b = Date.parse(`${next}T00:00:00Z`);
  return Math.round((b - a) / 86400000) === 1;
}

export function recordGridResult(dateKey: string, score: number): GridStats {
  const stats = loadGridStats();
  if (stats.results[dateKey]) return stats; // already recorded today
  const perfect = score === 9;
  stats.results[dateKey] = { score, perfect };
  stats.played += 1;
  stats.cellsFilled += score;
  if (perfect) stats.perfectDays += 1;

  if (stats.lastDate && isConsecutive(stats.lastDate, dateKey) && perfect) {
    stats.currentStreak += 1;
  } else if (perfect) {
    stats.currentStreak = 1;
  } else {
    stats.currentStreak = 0;
  }
  stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
  stats.lastDate = dateKey;
  save(stats);
  return stats;
}

export function resetGridStats(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
