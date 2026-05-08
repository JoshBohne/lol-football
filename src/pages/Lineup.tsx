import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Trash2 } from "lucide-react";
import { OFFENSE_POSITIONS } from "@/data/positions";
import { CHAMPIONS, getChampion } from "@/lib/champions";
import { puzzleNumber, todayKey } from "@/lib/seed";
import { getDailyLineup, isWin, scoreGuess, type SlotResult } from "@/lib/lineup";
import {
  MAX_LINEUP_GUESSES,
  clearLineupStateIfStale,
  loadLineupState,
  recordResult,
  saveLineupState,
  type LineupState,
} from "@/lib/stats";
import { buildLineupShareText } from "@/lib/share";
import { FootballField, type SlotState } from "@/components/FootballField";
import { ChampionPicker } from "@/components/ChampionPicker";
import { ShareButton } from "@/components/ShareButton";
import { AdSlot } from "@/components/AdSlot";
import type { Position } from "@/types";

type WorkingLineup = Record<string, string | null>;

function emptyOffense(): WorkingLineup {
  return Object.fromEntries(OFFENSE_POSITIONS.map((p) => [p.id, null]));
}

export function LineupPage() {
  const dateKey = todayKey();
  const daily = useMemo(() => getDailyLineup(dateKey), [dateKey]);
  const [picks, setPicks] = useState<WorkingLineup>(emptyOffense);
  const [activePos, setActivePos] = useState<string | null>(OFFENSE_POSITIONS[0]?.id ?? null);
  const [history, setHistory] = useState<LineupState["guesses"]>([]);
  const [status, setStatus] = useState<LineupState["status"]>("playing");

  // Hydrate persisted state for today
  useEffect(() => {
    clearLineupStateIfStale(dateKey);
    const persisted = loadLineupState();
    if (persisted && persisted.dateKey === dateKey) {
      setHistory(persisted.guesses);
      setStatus(persisted.status);
    }
  }, [dateKey]);

  // Persist whenever history/status changes
  useEffect(() => {
    saveLineupState({ dateKey, guesses: history, status });
  }, [dateKey, history, status]);

  const guessesUsed = history.length;
  const guessesLeft = MAX_LINEUP_GUESSES - guessesUsed;
  const isOver = status !== "playing";
  const allFilled = OFFENSE_POSITIONS.every((p) => picks[p.id]);

  // For ChampionPicker: champions already locked-in (green) shouldn't be used again
  const lockedChamps = useMemo(() => {
    const locked = new Set<string>();
    if (history.length === 0) return locked;
    const last = history[history.length - 1];
    for (const pos of OFFENSE_POSITIONS) {
      if (last.result[pos.id] === "hit" && last.picks[pos.id]) {
        locked.add(last.picks[pos.id] as string);
      }
    }
    return locked;
  }, [history]);

  // Slot rendering: show last guess feedback for already-submitted positions
  const slotStates = useMemo(() => {
    const states: Record<string, SlotState> = {};
    if (history.length > 0) {
      const last = history[history.length - 1];
      for (const pos of OFFENSE_POSITIONS) {
        const r = last.result[pos.id];
        if (r === "hit") states[pos.id] = "hit";
        else if (r === "near") states[pos.id] = "near";
        else if (r === "miss") states[pos.id] = "miss";
      }
    }
    if (activePos && !isOver) states[activePos] = "active";
    return states;
  }, [history, activePos, isOver]);

  // Display lineup combines locked greens + current working picks
  const displayLineup = useMemo(() => {
    const merged: WorkingLineup = { ...picks };
    if (history.length > 0) {
      const last = history[history.length - 1];
      for (const pos of OFFENSE_POSITIONS) {
        if (last.result[pos.id] === "hit") merged[pos.id] = last.picks[pos.id];
      }
    }
    return merged;
  }, [picks, history]);

  function handlePositionClick(pos: Position) {
    if (isOver) return;
    if (history.length > 0 && history[history.length - 1].result[pos.id] === "hit") return;
    setActivePos(activePos === pos.id ? null : pos.id);
  }

  function handleSelectChamp(champId: string) {
    if (!activePos || isOver) return;
    setPicks((prev) => ({ ...prev, [activePos]: champId }));
    const idx = OFFENSE_POSITIONS.findIndex((p) => p.id === activePos);
    const next = OFFENSE_POSITIONS.slice(idx + 1).find(
      (p) => !displayLineup[p.id] && !lockedChamps.has(displayLineup[p.id] ?? ""),
    );
    setActivePos(next ? next.id : null);
  }

  function handleRemove(pos: Position) {
    if (isOver) return;
    if (history.length > 0 && history[history.length - 1].result[pos.id] === "hit") return;
    setPicks((prev) => ({ ...prev, [pos.id]: null }));
  }

  function handleSubmit() {
    if (!allFilled || isOver) return;
    const submission: WorkingLineup = { ...displayLineup };
    const result = scoreGuess(submission, daily.answer);
    const won = isWin(result);
    const nextHistory = [...history, { picks: submission, result }];
    const nextStatus: LineupState["status"] = won ? "won" : nextHistory.length >= MAX_LINEUP_GUESSES ? "lost" : "playing";
    setHistory(nextHistory);
    setStatus(nextStatus);
    if (nextStatus !== "playing") {
      recordResult({ dateKey, won, guessCount: nextHistory.length });
    }
    // Reset working picks except for new greens (handled by displayLineup)
    setPicks(emptyOffense());
    setActivePos(OFFENSE_POSITIONS.find((p) => result[p.id] !== "hit")?.id ?? null);
  }

  function handleClear() {
    if (isOver) return;
    setPicks(emptyOffense());
    setActivePos(OFFENSE_POSITIONS[0]?.id ?? null);
  }

  // For the ChampionPicker excludeIds: champs locked as green (already known correct)
  const excludeIds = lockedChamps;

  const shareText = useMemo(
    () =>
      buildLineupShareText({
        puzzleNumber: daily.number,
        guesses: history.map((g) => g.result),
        won: status === "won",
      }),
    [history, status, daily.number],
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-gold/80">Daily Lineup</p>
          <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
            Puzzle #{puzzleNumber(dateKey)} · {dateKey}
          </h1>
          <p className="mt-1 text-sm text-white/60">
            Guess all 11 offensive positions. 🟩 right champ, right slot. 🟨 right champ, wrong slot. ⬛ not in today's lineup.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 text-sm">
          <span className="text-white/60">Guesses left</span>
          <div className="flex gap-1">
            {Array.from({ length: MAX_LINEUP_GUESSES }).map((_, i) => (
              <span
                key={i}
                className={
                  i < guessesUsed
                    ? "h-2.5 w-6 rounded-full bg-gold/60"
                    : "h-2.5 w-6 rounded-full bg-white/15"
                }
              />
            ))}
          </div>
          <span className="text-xs text-white/40">{guessesLeft} of {MAX_LINEUP_GUESSES}</span>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="flex flex-col gap-4">
          <FootballField
            lineup={displayLineup}
            states={slotStates}
            activePositionId={activePos}
            positions={OFFENSE_POSITIONS}
            onPositionClick={handlePositionClick}
            onChampionRemove={handleRemove}
            compact
          />

          {!isOver && (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-navy-900 p-3">
              <div className="text-xs text-white/60">
                <span className="font-semibold text-white">{Object.values(displayLineup).filter(Boolean).length}/11</span> positions filled
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center gap-1.5 rounded-md border border-white/15 px-3 py-1.5 text-xs text-white/70 hover:bg-white/5"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Clear
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!allFilled}
                  className="inline-flex items-center gap-1.5 rounded-md bg-gold px-4 py-1.5 text-xs font-semibold text-navy-950 disabled:opacity-30 hover:enabled:bg-gold-dark hover:enabled:text-white"
                >
                  Submit guess <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {isOver && (
            <div className="rounded-xl border border-white/10 bg-navy-900 p-5 text-center">
              <p className="font-display text-2xl font-bold text-white">
                {status === "won" ? "🏆 Touchdown!" : "💀 Out of guesses"}
              </p>
              <p className="mt-1 text-sm text-white/60">
                {status === "won"
                  ? `Solved in ${history.length}/${MAX_LINEUP_GUESSES}`
                  : "Better luck tomorrow."}
              </p>
              {status === "lost" && (
                <div className="mt-4">
                  <p className="text-xs uppercase tracking-wider text-white/40">Today's lineup</p>
                  <div className="mt-2 flex flex-wrap justify-center gap-2">
                    {OFFENSE_POSITIONS.map((p) => {
                      const c = getChampion(daily.answer[p.id]);
                      if (!c) return null;
                      return (
                        <div key={p.id} className="flex flex-col items-center gap-1">
                          <img src={c.imageUrl} alt={c.name} className="h-10 w-10 rounded-md object-cover" />
                          <span className="text-[10px] uppercase tracking-wide text-white/50">{p.abbr}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="mt-5 flex justify-center">
                <ShareButton text={shareText} />
              </div>
            </div>
          )}
        </div>

        {!isOver ? (
          <aside className="flex h-[28rem] min-h-0 flex-col gap-3 rounded-xl border border-white/10 bg-navy-900 p-4 lg:h-[42rem]">
            {activePos ? (
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Picking for</span>
                <span className="font-semibold text-gold">
                  {OFFENSE_POSITIONS.find((p) => p.id === activePos)?.label}
                </span>
              </div>
            ) : (
              <p className="text-sm text-white/50">Tap a position on the field to assign a champion.</p>
            )}
            <ChampionPicker
              onSelect={(c) => handleSelectChamp(c.id)}
              excludeIds={excludeIds}
              className="min-h-0 flex-1"
            />
            <p className="text-xs text-white/40">
              {CHAMPIONS.length} champions · patch deterministic per UTC date
            </p>
          </aside>
        ) : (
          <aside className="flex flex-col gap-3">
            <GuessHistory history={history} />
            <AdSlot slot="lineup-end" variant="rect" className="self-center" />
          </aside>
        )}
      </div>

      {!isOver && history.length > 0 && <GuessHistory history={history} />}
    </div>
  );
}

function GuessHistory({ history }: { history: LineupState["guesses"] }) {
  return (
    <div className="rounded-xl border border-white/10 bg-navy-900 p-4">
      <p className="mb-2 text-xs uppercase tracking-wider text-white/50">Previous guesses</p>
      <ol className="space-y-2">
        {history.map((g, i) => (
          <li key={i} className="flex items-center gap-1 text-lg leading-none">
            <span className="mr-2 text-xs font-semibold text-white/40">{i + 1}</span>
            {OFFENSE_POSITIONS.map((p) => (
              <ResultDot key={p.id} result={g.result[p.id]} />
            ))}
          </li>
        ))}
      </ol>
    </div>
  );
}

function ResultDot({ result }: { result: SlotResult }) {
  const cls =
    result === "hit"
      ? "bg-feedback-hit"
      : result === "near"
        ? "bg-feedback-near"
        : "bg-feedback-miss";
  return <span className={`inline-block h-4 w-4 rounded ${cls}`} />;
}
