import { CHAMPIONS } from "@/lib/champions";
import { dateToSeed, mulberry32, pickN, puzzleNumber, todayKey } from "@/lib/seed";
import { OFFENSE_POSITIONS } from "@/data/positions";

export interface DailyLineup {
  dateKey: string;
  number: number;
  /** position.id → champion.id */
  answer: Record<string, string>;
}

/**
 * Deterministic daily lineup: pick 11 distinct champions for the offensive
 * positions. Same UTC date → identical lineup for every player.
 */
export function getDailyLineup(dateKey: string = todayKey()): DailyLineup {
  const rng = mulberry32(dateToSeed(`lineup:${dateKey}`));
  const picks = pickN(CHAMPIONS, OFFENSE_POSITIONS.length, rng);
  const answer: Record<string, string> = {};
  OFFENSE_POSITIONS.forEach((pos, i) => {
    answer[pos.id] = picks[i].id;
  });
  return {
    dateKey,
    number: puzzleNumber(dateKey),
    answer,
  };
}

export type SlotResult = "hit" | "near" | "miss" | "empty";

/** Score a guess slot-by-slot, Wordle-style. */
export function scoreGuess(
  guess: Record<string, string | null>,
  answer: Record<string, string>,
): Record<string, SlotResult> {
  const result: Record<string, SlotResult> = {};
  const answerChamps = new Set(Object.values(answer));
  for (const [posId, champId] of Object.entries(guess)) {
    if (!champId) {
      result[posId] = "empty";
      continue;
    }
    if (answer[posId] === champId) result[posId] = "hit";
    else if (answerChamps.has(champId)) result[posId] = "near";
    else result[posId] = "miss";
  }
  return result;
}

export function isWin(scored: Record<string, SlotResult>): boolean {
  return Object.values(scored).every((r) => r === "hit");
}
