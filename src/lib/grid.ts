import type { Champion } from "@/types";
import { CHAMPIONS } from "@/lib/champions";
import { CHAMPION_REGIONS, REGIONS, TAGS, type Region, type Tag } from "@/data/attributes";
import { dateToSeed, mulberry32, shuffle } from "@/lib/seed";

export type Constraint =
  | { kind: "region"; value: Region; label: string }
  | { kind: "tag"; value: Tag; label: string };

export interface GridPuzzle {
  date: string;
  rows: [Constraint, Constraint, Constraint];
  cols: [Constraint, Constraint, Constraint];
  /** valid champion ids for each (row, col) pair, used by the picker + scoring */
  solutions: string[][][];
}

function constraintMatches(c: Constraint, champ: Champion): boolean {
  if (c.kind === "tag") return champ.tags.includes(c.value);
  const regions = CHAMPION_REGIONS[champ.id] ?? ["Runeterra"];
  return regions.includes(c.value);
}

export function championsFor(row: Constraint, col: Constraint): Champion[] {
  return CHAMPIONS.filter((c) => constraintMatches(row, c) && constraintMatches(col, c));
}

export function isValidPick(row: Constraint, col: Constraint, championId: string): boolean {
  const champ = CHAMPIONS.find((c) => c.id === championId);
  if (!champ) return false;
  return constraintMatches(row, champ) && constraintMatches(col, champ);
}

const REGION_CONSTRAINTS: Constraint[] = REGIONS.map((r) => ({
  kind: "region",
  value: r,
  label: r,
}));
const TAG_CONSTRAINTS: Constraint[] = TAGS.map((t) => ({
  kind: "tag",
  value: t,
  label: t,
}));

const ALL_CONSTRAINTS: Constraint[] = [...REGION_CONSTRAINTS, ...TAG_CONSTRAINTS];

const MIN_SOLUTIONS = 3;

function constraintKey(c: Constraint): string {
  return `${c.kind}:${c.value}`;
}

/**
 * Build a daily 3×3 grid where every cell has ≥ MIN_SOLUTIONS champions.
 * Picks a balanced row/col mix (regions vs classes) so the puzzle isn't all one axis.
 */
export function buildPuzzle(dateKey: string): GridPuzzle {
  const rng = mulberry32(dateToSeed(dateKey));

  // Try until we find a 3+3 set with valid intersections. ~Always succeeds in <10 tries.
  for (let attempt = 0; attempt < 200; attempt++) {
    const regions = shuffle(REGION_CONSTRAINTS, rng);
    const tags = shuffle(TAG_CONSTRAINTS, rng);

    // 3 rows, 3 cols. Mix varies by attempt parity to keep puzzles diverse.
    const rowMix = attempt % 2 === 0 ? [regions[0], regions[1], tags[0]] : [regions[0], tags[0], tags[1]];
    const colMix =
      attempt % 2 === 0 ? [tags[1], regions[2], tags[2]] : [regions[1], regions[2], tags[2]];

    const rows = shuffle(rowMix, rng) as [Constraint, Constraint, Constraint];
    const cols = shuffle(colMix, rng) as [Constraint, Constraint, Constraint];

    const used = new Set<string>();
    let dup = false;
    for (const c of [...rows, ...cols]) {
      const k = constraintKey(c);
      if (used.has(k)) {
        dup = true;
        break;
      }
      used.add(k);
    }
    if (dup) continue;

    const solutions = rows.map((r) => cols.map((c) => championsFor(r, c).map((x) => x.id)));
    const minCell = Math.min(...solutions.flat().map((s) => s.length));
    if (minCell < MIN_SOLUTIONS) continue;

    return { date: dateKey, rows, cols, solutions };
  }

  // Fallback: brute-force search if random tries fail (very unlikely).
  for (let i = 0; i < ALL_CONSTRAINTS.length - 5; i++) {
    for (let j = i + 1; j < ALL_CONSTRAINTS.length - 4; j++) {
      for (let k = j + 1; k < ALL_CONSTRAINTS.length - 3; k++) {
        for (let a = k + 1; a < ALL_CONSTRAINTS.length - 2; a++) {
          for (let b = a + 1; b < ALL_CONSTRAINTS.length - 1; b++) {
            for (let c = b + 1; c < ALL_CONSTRAINTS.length; c++) {
              const rows = [ALL_CONSTRAINTS[i], ALL_CONSTRAINTS[j], ALL_CONSTRAINTS[k]] as [
                Constraint,
                Constraint,
                Constraint,
              ];
              const cols = [ALL_CONSTRAINTS[a], ALL_CONSTRAINTS[b], ALL_CONSTRAINTS[c]] as [
                Constraint,
                Constraint,
                Constraint,
              ];
              const sols = rows.map((r) => cols.map((c2) => championsFor(r, c2).map((x) => x.id)));
              const minCell = Math.min(...sols.flat().map((s) => s.length));
              if (minCell >= MIN_SOLUTIONS) {
                return { date: dateKey, rows, cols, solutions: sols };
              }
            }
          }
        }
      }
    }
  }

  throw new Error("Could not generate a solvable grid");
}

export function constraintBadge(c: Constraint): string {
  return c.kind === "region" ? "REGION" : "CLASS";
}
