import type { Position } from "@/types";

/**
 * 22-position roster: 11 offense, 11 defense.
 * Coordinates are percentages of the field's bounding box (0–100).
 * Offense fills the bottom half; defense the top half.
 */
export const POSITIONS: Position[] = [
  // Offense — bottom half (y: 55–95)
  { id: "QB", label: "Quarterback", abbr: "QB", side: "offense", x: 50, y: 88 },
  { id: "RB", label: "Running Back", abbr: "RB", side: "offense", x: 38, y: 92 },
  { id: "FB", label: "Fullback", abbr: "FB", side: "offense", x: 62, y: 92 },
  { id: "WR1", label: "Wide Receiver", abbr: "WR", side: "offense", x: 8, y: 78 },
  { id: "WR2", label: "Wide Receiver", abbr: "WR", side: "offense", x: 92, y: 78 },
  { id: "TE", label: "Tight End", abbr: "TE", side: "offense", x: 78, y: 76 },
  { id: "LT", label: "Left Tackle", abbr: "LT", side: "offense", x: 22, y: 76 },
  { id: "LG", label: "Left Guard", abbr: "LG", side: "offense", x: 36, y: 76 },
  { id: "C", label: "Center", abbr: "C", side: "offense", x: 50, y: 76 },
  { id: "RG", label: "Right Guard", abbr: "RG", side: "offense", x: 64, y: 76 },
  { id: "RT", label: "Right Tackle", abbr: "RT", side: "offense", x: 70, y: 76 },

  // Defense — top half (y: 5–45)
  { id: "DE1", label: "Defensive End", abbr: "DE", side: "defense", x: 26, y: 22 },
  { id: "DE2", label: "Defensive End", abbr: "DE", side: "defense", x: 74, y: 22 },
  { id: "DT1", label: "Defensive Tackle", abbr: "DT", side: "defense", x: 42, y: 22 },
  { id: "DT2", label: "Defensive Tackle", abbr: "DT", side: "defense", x: 58, y: 22 },
  { id: "OLB1", label: "Outside Linebacker", abbr: "OLB", side: "defense", x: 18, y: 36 },
  { id: "OLB2", label: "Outside Linebacker", abbr: "OLB", side: "defense", x: 82, y: 36 },
  { id: "MLB", label: "Middle Linebacker", abbr: "MLB", side: "defense", x: 50, y: 36 },
  { id: "CB1", label: "Cornerback", abbr: "CB", side: "defense", x: 8, y: 18 },
  { id: "CB2", label: "Cornerback", abbr: "CB", side: "defense", x: 92, y: 18 },
  { id: "FS", label: "Free Safety", abbr: "FS", side: "defense", x: 38, y: 8 },
  { id: "SS", label: "Strong Safety", abbr: "SS", side: "defense", x: 62, y: 8 },
];

export const OFFENSE_POSITIONS = POSITIONS.filter((p) => p.side === "offense");
export const DEFENSE_POSITIONS = POSITIONS.filter((p) => p.side === "defense");

export function emptyLineup(positions: Position[] = POSITIONS) {
  return Object.fromEntries(positions.map((p) => [p.id, null])) as Record<string, string | null>;
}
