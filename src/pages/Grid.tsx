import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { ChampionPicker } from "@/components/ChampionPicker";
import { ShareButton } from "@/components/ShareButton";
import { AdSlot } from "@/components/AdSlot";
import { buildPuzzle, isValidPick, type Constraint } from "@/lib/grid";
import { puzzleNumber, todayKey } from "@/lib/seed";
import { recordGridResult } from "@/lib/gridStats";
import { getChampion } from "@/lib/champions";
import { cn } from "@/lib/utils";

type CellPicks = (string | null)[][];

function emptyCells(): CellPicks {
  return [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];
}

export function GridPage() {
  const date = todayKey();
  const num = puzzleNumber(date);
  const puzzle = useMemo(() => buildPuzzle(date), [date]);

  const [cells, setCells] = useState<CellPicks>(emptyCells);
  const [active, setActive] = useState<{ row: number; col: number } | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const usedIds = useMemo(() => {
    const set = new Set<string>();
    cells.flat().forEach((id) => id && set.add(id));
    return set;
  }, [cells]);

  const filledCount = useMemo(() => cells.flat().filter(Boolean).length, [cells]);

  const score = useMemo(() => {
    let s = 0;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const id = cells[r][c];
        if (id && isValidPick(puzzle.rows[r], puzzle.cols[c], id)) s += 1;
      }
    }
    return s;
  }, [cells, puzzle]);

  function handleCellClick(row: number, col: number) {
    if (submitted) return;
    if (cells[row][col]) {
      setCells((prev) => {
        const next = prev.map((r) => r.slice());
        next[row][col] = null;
        return next;
      });
      return;
    }
    setActive(active?.row === row && active.col === col ? null : { row, col });
  }

  function handleSelect(championId: string) {
    if (!active) return;
    const { row, col } = active;
    if (!isValidPick(puzzle.rows[row], puzzle.cols[col], championId)) return;
    setCells((prev) => {
      const next = prev.map((r) => r.slice());
      next[row][col] = championId;
      return next;
    });
    // auto-advance to next empty cell
    const flat: Array<{ row: number; col: number }> = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) flat.push({ row: r, col: c });
    const after = flat.slice(flat.findIndex((p) => p.row === row && p.col === col) + 1);
    const nextEmpty = after.find((p) => !cells[p.row][p.col]);
    setActive(nextEmpty ?? null);
  }

  function handleClear() {
    setCells(emptyCells());
    setActive(null);
  }

  function handleSubmit() {
    setSubmitted(true);
    setActive(null);
    recordGridResult(date, score);
  }

  const shareText = useMemo(() => {
    if (!submitted) return "";
    const grid = cells
      .map((row, r) =>
        row
          .map((id, c) => {
            if (!id) return "⬛";
            return isValidPick(puzzle.rows[r], puzzle.cols[c], id) ? "🟩" : "🟥";
          })
          .join(""),
      )
      .join("\n");
    const url = typeof window !== "undefined" ? window.location.origin : "";
    return `LoL Football Grid #${num} — ${score}/9\n${grid}\n${url}`;
  }, [submitted, cells, puzzle, num, score]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-gold/80">Daily grid · #{num}</p>
          <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">Immaculate Grid</h1>
          <p className="mt-1 max-w-xl text-sm text-white/60">
            Pick one champion per cell that satisfies both the row and column constraint. Each champion can only be used once.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!submitted && (
            <>
              <button
                type="button"
                onClick={handleClear}
                disabled={filledCount === 0}
                className="inline-flex items-center gap-2 rounded-md border border-white/20 px-3 py-2 text-sm text-white/80 disabled:opacity-30 hover:enabled:bg-white/5"
              >
                <Trash2 className="h-4 w-4" /> Clear
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={filledCount === 0}
                className="inline-flex items-center gap-2 rounded-md bg-gold px-4 py-2 text-sm font-semibold text-navy-950 transition disabled:opacity-30 hover:enabled:bg-gold-dark hover:enabled:text-white"
              >
                Lock in
              </button>
            </>
          )}
          {submitted && <ShareButton text={shareText} label={`Share ${score}/9`} />}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <GridBoard
          puzzle={puzzle}
          cells={cells}
          active={active}
          submitted={submitted}
          onCellClick={handleCellClick}
        />
        <aside className="flex h-[28rem] min-h-0 flex-col gap-3 rounded-xl border border-white/10 bg-navy-900 p-4 lg:h-[42rem]">
          {submitted ? (
            <ResultPanel score={score} />
          ) : active ? (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Picking for</span>
                <span className="text-right font-semibold text-gold">
                  {puzzle.rows[active.row].label}
                  <span className="text-white/40"> × </span>
                  {puzzle.cols[active.col].label}
                </span>
              </div>
              <ChampionPicker
                onSelect={(c) => handleSelect(c.id)}
                excludeIds={usedIds}
                emptyHint="No champion in this pool yet"
                className="min-h-0 flex-1"
              />
            </>
          ) : (
            <p className="text-sm text-white/50">
              <span className="font-semibold text-white">Tap a cell</span> to pick a champion. Tap a filled cell to clear it.
            </p>
          )}
        </aside>
      </div>

      <AdSlot slot="grid-bottom" variant="banner" />
    </div>
  );
}

function GridBoard({
  puzzle,
  cells,
  active,
  submitted,
  onCellClick,
}: {
  puzzle: ReturnType<typeof buildPuzzle>;
  cells: CellPicks;
  active: { row: number; col: number } | null;
  submitted: boolean;
  onCellClick: (row: number, col: number) => void;
}) {
  return (
    <div className="grid grid-cols-[7rem_1fr_1fr_1fr] gap-1.5 sm:grid-cols-[8rem_1fr_1fr_1fr]">
      <div />
      {puzzle.cols.map((c, i) => (
        <ConstraintHeader key={`col-${i}`} constraint={c} />
      ))}
      {puzzle.rows.map((row, r) => (
        <RowGroup
          key={`row-${r}`}
          row={row}
          rIndex={r}
          cols={puzzle.cols}
          cells={cells[r]}
          activeCol={active?.row === r ? active.col : null}
          submitted={submitted}
          onCellClick={(c) => onCellClick(r, c)}
        />
      ))}
    </div>
  );
}

function RowGroup({
  row,
  rIndex,
  cols,
  cells,
  activeCol,
  submitted,
  onCellClick,
}: {
  row: Constraint;
  rIndex: number;
  cols: readonly Constraint[];
  cells: (string | null)[];
  activeCol: number | null;
  submitted: boolean;
  onCellClick: (col: number) => void;
}) {
  return (
    <>
      <ConstraintHeader constraint={row} />
      {cols.map((col, c) => (
        <Cell
          key={`cell-${rIndex}-${c}`}
          championId={cells[c]}
          row={row}
          col={col}
          active={activeCol === c}
          submitted={submitted}
          onClick={() => onCellClick(c)}
        />
      ))}
    </>
  );
}

function ConstraintHeader({ constraint }: { constraint: Constraint }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-white/10 bg-navy-900 p-2 text-center">
      <span
        className={cn(
          "text-[10px] font-semibold uppercase tracking-[0.2em]",
          constraint.kind === "region" ? "text-teal" : "text-ember",
        )}
      >
        {constraint.kind === "region" ? "Region" : "Class"}
      </span>
      <span className="mt-1 text-sm font-semibold text-white sm:text-base">{constraint.label}</span>
    </div>
  );
}

function Cell({
  championId,
  row,
  col,
  active,
  submitted,
  onClick,
}: {
  championId: string | null;
  row: Constraint;
  col: Constraint;
  active: boolean;
  submitted: boolean;
  onClick: () => void;
}) {
  const champion = championId ? getChampion(championId) ?? null : null;
  const valid = championId ? isValidPick(row, col, championId) : false;
  const ring = submitted
    ? championId
      ? valid
        ? "ring-feedback-hit"
        : "ring-feedback-miss"
      : "ring-white/10"
    : active
      ? "ring-gold ring-4 animate-pulse"
      : championId
        ? "ring-teal/60"
        : "ring-white/10";
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex aspect-square items-center justify-center rounded-lg bg-navy-900 ring-2 transition hover:ring-teal",
        ring,
      )}
    >
      {champion ? (
        <img
          src={champion.imageUrl}
          alt={champion.name}
          loading="lazy"
          className="h-full w-full rounded-md object-cover"
        />
      ) : (
        <span className="text-xs text-white/40">+</span>
      )}
    </button>
  );
}

function ResultPanel({ score }: { score: number }) {
  const headline = score === 9 ? "Immaculate." : score >= 7 ? "Almost flawless." : score >= 4 ? "Solid run." : "Tough one.";
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
      <p className="text-xs uppercase tracking-[0.4em] text-gold/80">Locked in</p>
      <p className="font-display text-5xl font-bold text-white">{score}/9</p>
      <p className="text-sm text-white/60">{headline}</p>
      <p className="mt-4 max-w-xs text-xs text-white/40">
        Come back tomorrow for a new grid. Streaks and stats are tracked locally.
      </p>
    </div>
  );
}
