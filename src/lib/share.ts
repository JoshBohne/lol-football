import type { SlotResult } from "@/lib/lineup";
import { OFFENSE_POSITIONS } from "@/data/positions";
import { MAX_LINEUP_GUESSES } from "@/lib/stats";

const EMOJI: Record<SlotResult, string> = {
  hit: "🟩",
  near: "🟨",
  miss: "⬛",
  empty: "⬜",
};

export function buildLineupShareText(args: {
  puzzleNumber: number;
  guesses: Array<Record<string, SlotResult>>;
  won: boolean;
  url?: string;
}) {
  const { puzzleNumber, guesses, won } = args;
  const score = won ? `${guesses.length}/${MAX_LINEUP_GUESSES}` : `X/${MAX_LINEUP_GUESSES}`;
  const header = `LoL Football #${puzzleNumber} — Daily Lineup ${score}`;
  const rows = guesses.map((g) => OFFENSE_POSITIONS.map((p) => EMOJI[g[p.id] ?? "empty"]).join(""));
  const url = args.url ?? (typeof window !== "undefined" ? window.location.origin : "");
  return [header, "", ...rows, "", url].filter(Boolean).join("\n");
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.clipboard) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
