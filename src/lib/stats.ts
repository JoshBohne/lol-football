import type { SlotResult } from "@/lib/lineup";

const STORAGE_KEY = "lolfb.stats.v1";
const STATE_KEY = "lolfb.lineup.v1";

export interface LineupStats {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  /** index = guesses used (1..MAX_GUESSES). Losses tracked separately. */
  distribution: number[];
  losses: number;
  lastWonDateKey: string | null;
  lastPlayedDateKey: string | null;
}

export interface LineupState {
  dateKey: string;
  guesses: Array<{
    picks: Record<string, string | null>;
    result: Record<string, SlotResult>;
  }>;
  status: "playing" | "won" | "lost";
}

const MAX_GUESSES = 6;

const emptyStats: LineupStats = {
  played: 0,
  wins: 0,
  currentStreak: 0,
  maxStreak: 0,
  distribution: Array(MAX_GUESSES).fill(0),
  losses: 0,
  lastWonDateKey: null,
  lastPlayedDateKey: null,
};

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadStats(): LineupStats {
  if (!isBrowser()) return { ...emptyStats };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...emptyStats };
    const parsed = JSON.parse(raw) as Partial<LineupStats>;
    return { ...emptyStats, ...parsed, distribution: parsed.distribution ?? Array(MAX_GUESSES).fill(0) };
  } catch {
    return { ...emptyStats };
  }
}

export function saveStats(stats: LineupStats) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

export function recordResult(args: {
  dateKey: string;
  won: boolean;
  guessCount: number;
}): LineupStats {
  const prev = loadStats();
  const { dateKey, won, guessCount } = args;
  if (prev.lastPlayedDateKey === dateKey) return prev;
  const next: LineupStats = { ...prev };
  next.played += 1;
  next.lastPlayedDateKey = dateKey;
  if (won) {
    next.wins += 1;
    next.distribution = prev.distribution.slice();
    if (guessCount >= 1 && guessCount <= MAX_GUESSES) {
      next.distribution[guessCount - 1] += 1;
    }
    const yesterday = yesterdayOf(dateKey);
    next.currentStreak = prev.lastWonDateKey === yesterday ? prev.currentStreak + 1 : 1;
    next.maxStreak = Math.max(next.currentStreak, prev.maxStreak);
    next.lastWonDateKey = dateKey;
  } else {
    next.losses += 1;
    next.currentStreak = 0;
  }
  saveStats(next);
  return next;
}

function yesterdayOf(dateKey: string): string {
  const d = Date.parse(`${dateKey}T00:00:00Z`);
  const y = new Date(d - 86400000);
  return `${y.getUTCFullYear()}-${String(y.getUTCMonth() + 1).padStart(2, "0")}-${String(y.getUTCDate()).padStart(2, "0")}`;
}

export function loadLineupState(): LineupState | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STATE_KEY);
    return raw ? (JSON.parse(raw) as LineupState) : null;
  } catch {
    return null;
  }
}

export function saveLineupState(state: LineupState) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

export function clearLineupStateIfStale(dateKey: string) {
  const state = loadLineupState();
  if (state && state.dateKey !== dateKey) {
    if (isBrowser()) window.localStorage.removeItem(STATE_KEY);
  }
}

export const MAX_LINEUP_GUESSES = MAX_GUESSES;
