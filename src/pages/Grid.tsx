import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { ChampionPicker } from "@/components/ChampionPicker";
import { ShareButton } from "@/components/ShareButton";
import { AdSlot } from "@/components/AdSlot";
import { PageHeader } from "@/components/PageHeader";
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

  const activePool = useMemo(() => {
    if (!active) return undefined;
    return new Set(puzzle.solutions[active.row][active.col]);
  }, [active, puzzle]);

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

  const today = new Date(`${date}T00:00:00Z`);
  const dateLabel = today.toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-12">
      <PageHeader
        index={2}
        eyebrow="Daily Grid"
        title={
          submitted ? (
            <>
              Final score:{" "}
              <span className="nums text-foil">
                {score}
                <span className="text-parchment-300"> / 9</span>
              </span>
            </>
          ) : (
            <>
              Find a champion that fits <span className="text-foil">both axes</span>.
            </>
          )
        }
        description={
          submitted
            ? "Each correct pick is locked in green. Misses sit in crimson. Come back tomorrow for a fresh grid."
            : "Pick one champion per cell that satisfies both the row and column constraint. Each champion can only appear once."
        }
        meta={
          <span className="flex items-center gap-3">
            <span>
              Puzzle <span className="nums text-parchment-50">#{num}</span>
            </span>
            <span className="text-parchment-400">·</span>
            <span>{dateLabel} UTC</span>
          </span>
        }
        actions={
          submitted ? (
            <ShareButton text={shareText} label={`Share ${score}/9`} />
          ) : (
            <>
              <button
                type="button"
                onClick={handleClear}
                disabled={filledCount === 0}
                className="btn-ghost"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={filledCount === 0}
                className="btn-foil"
              >
                Lock In
              </button>
            </>
          )
        }
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="card-plate p-5 sm:p-7 animate-fade-up">
          <GridBoard
            puzzle={puzzle}
            cells={cells}
            active={active}
            submitted={submitted}
            onCellClick={handleCellClick}
          />
        </div>

        <aside className="card-plate flex h-[32rem] min-h-0 flex-col gap-4 p-5 lg:h-auto lg:max-h-[44rem]">
          {submitted ? (
            <ResultPanel score={score} />
          ) : active ? (
            <>
              <div className="border-b border-ink-700 pb-3">
                <span className="eyebrow">Picking For</span>
                <p className="mt-2 flex items-baseline gap-2 font-display text-base font-bold uppercase tracking-caps-tight text-foil">
                  <span>{puzzle.rows[active.row].label}</span>
                  <span className="text-parchment-300">×</span>
                  <span>{puzzle.cols[active.col].label}</span>
                </p>
              </div>
              <ChampionPicker
                onSelect={(c) => handleSelect(c.id)}
                excludeIds={usedIds}
                poolIds={activePool}
                emptyHint="No valid champions available"
                className="min-h-0 flex-1"
              />
            </>
          ) : (
            <EmptyPanel filledCount={filledCount} />
          )}
        </aside>
      </div>

      <AdSlot slot="grid-bottom" variant="banner" />
    </div>
  );
}

function EmptyPanel({ filledCount }: { filledCount: number }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="font-display text-lg font-bold uppercase tracking-caps-tight text-parchment-50">
        Tap a cell
      </p>
      <p className="max-w-[18rem] text-sm leading-relaxed text-parchment-200">
        Select an empty cell to see the qualifying champion pool. Tap a filled cell to clear it.
      </p>
      <p className="mt-2 eyebrow-dim nums">
        {filledCount} / 9 Placed
      </p>
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
    <div className="grid grid-cols-[6rem_repeat(3,minmax(0,1fr))] gap-2 sm:grid-cols-[7rem_repeat(3,minmax(0,1fr))] sm:gap-3">
      <div />
      {puzzle.cols.map((c, i) => (
        <ConstraintHeader key={`col-${i}`} constraint={c} axis="col" />
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
      <ConstraintHeader constraint={row} axis="row" />
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

function ConstraintHeader({ constraint, axis }: { constraint: Constraint; axis: "row" | "col" }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 rounded-sm border border-ink-700 bg-ink-900/60 p-2 text-center sm:p-3",
        axis === "row" && "min-h-[5.5rem]",
      )}
    >
      <span
        className={cn(
          "font-display text-[9px] font-bold uppercase tracking-caps",
          constraint.kind === "region" ? "text-foil" : "text-crimson",
        )}
      >
        {constraint.kind === "region" ? "Region" : "Class"}
      </span>
      <span className="font-display text-sm font-extrabold uppercase tracking-caps-tight text-parchment-50 sm:text-base">
        {constraint.label}
      </span>
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

  let ringClass = "ring-1 ring-foil-dim/30";
  if (submitted && championId) {
    ringClass = valid ? "ring-2 ring-feedback-hit" : "ring-2 ring-feedback-miss opacity-70";
  } else if (active) {
    ringClass = "ring-2 ring-foil shadow-foil animate-pulse";
  } else if (championId) {
    ringClass = "ring-1 ring-foil-dim/70";
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex aspect-square items-center justify-center overflow-hidden rounded-sm bg-ink-900 transition",
        ringClass,
        !submitted && "hover:ring-foil-bright hover:shadow-foil",
      )}
    >
      {champion ? (
        <>
          <img
            src={champion.imageUrl}
            alt={champion.name}
            loading="lazy"
            className={cn(
              "h-full w-full object-cover transition",
              submitted && !valid && "grayscale",
            )}
          />
          {submitted && (
            <span
              aria-hidden
              className={cn(
                "absolute inset-x-0 bottom-0 px-1.5 py-1 text-center font-display text-[9px] font-bold uppercase tracking-caps",
                valid ? "bg-feedback-hit/90 text-ink-1000" : "bg-feedback-miss/90 text-parchment-50",
              )}
            >
              {valid ? "Hit" : "Miss"}
            </span>
          )}
        </>
      ) : (
        <span className="font-display text-2xl font-bold text-parchment-300/50 transition group-hover:text-foil">
          +
        </span>
      )}
      {/* corner cropmarks */}
      {!submitted && (
        <span aria-hidden className="pointer-events-none absolute inset-0">
          <span className="absolute left-1 top-1 h-1.5 w-1.5 border-l border-t border-foil-dim/50" />
          <span className="absolute right-1 top-1 h-1.5 w-1.5 border-r border-t border-foil-dim/50" />
          <span className="absolute bottom-1 left-1 h-1.5 w-1.5 border-b border-l border-foil-dim/50" />
          <span className="absolute bottom-1 right-1 h-1.5 w-1.5 border-b border-r border-foil-dim/50" />
        </span>
      )}
    </button>
  );
}

function ResultPanel({ score }: { score: number }) {
  const headline = score === 9 ? "Immaculate." : score >= 7 ? "Almost flawless." : score >= 4 ? "Solid run." : "Tough one.";
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-4 py-8 text-center">
      <span className="eyebrow">Locked In</span>
      <p className="nums font-display text-7xl font-extrabold leading-none text-foil sm:text-8xl">
        {score}
        <span className="text-parchment-400">/9</span>
      </p>
      <p className="font-display text-lg font-bold uppercase tracking-caps-tight text-parchment-50">
        {headline}
      </p>
      <div className="rule-foil mt-4 w-2/3 opacity-50" />
      <p className="mt-2 max-w-[18rem] text-xs leading-relaxed text-parchment-300">
        Stats are stored locally. Come back tomorrow for a new grid — streaks reset on missed days.
      </p>
    </div>
  );
}
