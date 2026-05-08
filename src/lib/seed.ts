/**
 * Date-deterministic PRNG. Same UTC date → same sequence everywhere.
 * Used to generate the daily lineup and grid puzzles client-side without a server.
 */

/** Mulberry32 — fast, tiny, good enough for puzzle picks. */
export function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Convert "YYYY-MM-DD" to a stable 32-bit seed. */
export function dateToSeed(dateKey: string): number {
  let h = 2166136261;
  for (let i = 0; i < dateKey.length; i++) {
    h ^= dateKey.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** UTC date key in YYYY-MM-DD form. */
export function todayKey(now: Date = new Date()): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Days since the launch epoch — used as the puzzle number ("LoL Football #042"). */
export function puzzleNumber(dateKey: string, epoch = "2026-05-08"): number {
  const a = Date.parse(`${dateKey}T00:00:00Z`);
  const b = Date.parse(`${epoch}T00:00:00Z`);
  return Math.max(1, Math.round((a - b) / 86400000) + 1);
}

/** Fisher–Yates shuffle using the supplied RNG (mutates a copy, returns it). */
export function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Pick the first N from a shuffled copy. */
export function pickN<T>(items: readonly T[], n: number, rng: () => number): T[] {
  return shuffle(items, rng).slice(0, n);
}
