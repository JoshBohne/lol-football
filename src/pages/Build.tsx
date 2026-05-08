import { useEffect, useMemo, useState } from "react";
import { Shuffle, Trash2 } from "lucide-react";
import type { Lineup, Position } from "@/types";
import { POSITIONS, emptyLineup } from "@/data/positions";
import { CHAMPIONS } from "@/lib/champions";
import { FootballField } from "@/components/FootballField";
import { ChampionPicker } from "@/components/ChampionPicker";
import { ShareButton } from "@/components/ShareButton";
import { AdSlot } from "@/components/AdSlot";
import { decodeLineup, encodeLineup } from "@/lib/hashState";
import { mulberry32, pickN } from "@/lib/seed";

const HASH_PREFIX = "#/build/";

function readHash(): Lineup | null {
  if (typeof window === "undefined") return null;
  const h = window.location.hash;
  if (!h.startsWith(HASH_PREFIX)) return null;
  return decodeLineup(h.slice(HASH_PREFIX.length));
}

export function BuildPage() {
  const [lineup, setLineup] = useState<Lineup>(() => readHash() ?? emptyLineup());
  const [activePos, setActivePos] = useState<string | null>(null);

  // Sync URL hash whenever lineup changes (skip if it's already empty + no hash)
  useEffect(() => {
    const hasAny = Object.values(lineup).some(Boolean);
    if (!hasAny && !window.location.hash.startsWith(HASH_PREFIX)) return;
    const encoded = encodeLineup(lineup);
    const newHash = hasAny ? `${HASH_PREFIX}${encoded}` : "";
    if (window.location.hash !== newHash) {
      window.history.replaceState(null, "", `${window.location.pathname}${newHash}`);
    }
  }, [lineup]);

  const filledCount = useMemo(() => Object.values(lineup).filter(Boolean).length, [lineup]);
  const usedIds = useMemo(
    () => new Set(Object.values(lineup).filter((id): id is string => Boolean(id))),
    [lineup],
  );

  function handlePositionClick(pos: Position) {
    setActivePos(activePos === pos.id ? null : pos.id);
  }
  function handleRemove(pos: Position) {
    setLineup((prev) => ({ ...prev, [pos.id]: null }));
    if (activePos === pos.id) setActivePos(null);
  }
  function handleSelect(champId: string) {
    if (!activePos) return;
    setLineup((prev) => ({ ...prev, [activePos]: champId }));
    // auto-advance to next empty position on the same side
    const idx = POSITIONS.findIndex((p) => p.id === activePos);
    const next = POSITIONS.slice(idx + 1).find((p) => !lineup[p.id] && p.id !== activePos);
    setActivePos(next ? next.id : null);
  }
  function handleClear() {
    setLineup(emptyLineup());
    setActivePos(null);
    window.history.replaceState(null, "", window.location.pathname);
  }
  function handleRandomize() {
    const rng = mulberry32(Date.now() & 0xffffffff);
    const picks = pickN(CHAMPIONS, POSITIONS.length, rng);
    const next: Lineup = {};
    POSITIONS.forEach((p, i) => {
      next[p.id] = picks[i].id;
    });
    setLineup(next);
    setActivePos(null);
  }

  const shareText = useMemo(() => {
    if (filledCount === 0) return "";
    const url = `${window.location.origin}${window.location.pathname}${HASH_PREFIX}${encodeLineup(lineup)}`;
    return `My LoL Football roster (${filledCount}/22) — ${url}`;
  }, [lineup, filledCount]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-teal/80">Build mode</p>
          <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">Free play roster builder</h1>
          <p className="mt-1 text-sm text-white/60">
            Tap a position, pick a champion. Fill all 22 to share your dream lineup.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleRandomize}
            className="inline-flex items-center gap-2 rounded-md border border-white/20 px-3 py-2 text-sm text-white/80 hover:bg-white/5"
          >
            <Shuffle className="h-4 w-4" /> Randomize
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={filledCount === 0}
            className="inline-flex items-center gap-2 rounded-md border border-white/20 px-3 py-2 text-sm text-white/80 disabled:opacity-30 hover:enabled:bg-white/5"
          >
            <Trash2 className="h-4 w-4" /> Clear
          </button>
          {filledCount > 0 && <ShareButton text={shareText} />}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <FootballField
          lineup={lineup}
          activePositionId={activePos}
          onPositionClick={handlePositionClick}
          onChampionRemove={handleRemove}
        />
        <aside className="flex h-[28rem] min-h-0 flex-col gap-3 rounded-xl border border-white/10 bg-navy-900 p-4 lg:h-[42rem]">
          {activePos ? (
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Picking for</span>
              <span className="font-semibold text-gold">{POSITIONS.find((p) => p.id === activePos)?.label}</span>
            </div>
          ) : (
            <p className="text-sm text-white/50">
              <span className="font-semibold text-white">Tap a position</span> on the field to assign a champion.
            </p>
          )}
          <ChampionPicker
            onSelect={(c) => handleSelect(c.id)}
            excludeIds={usedIds}
            className="min-h-0 flex-1"
          />
        </aside>
      </div>

      <AdSlot slot="build-bottom" variant="banner" />
    </div>
  );
}
