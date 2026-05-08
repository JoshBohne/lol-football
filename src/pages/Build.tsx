import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Shuffle, Trash2, ArrowRight } from "lucide-react";
import type { Lineup, Position } from "@/types";
import { POSITIONS, emptyLineup } from "@/data/positions";
import { CHAMPIONS } from "@/lib/champions";
import { FootballField } from "@/components/FootballField";
import { ChampionPicker } from "@/components/ChampionPicker";
import { ShareButton } from "@/components/ShareButton";
import { AdSlot } from "@/components/AdSlot";
import { PageHeader } from "@/components/PageHeader";
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

  const activePosition = activePos ? POSITIONS.find((p) => p.id === activePos) : null;

  return (
    <div className="flex flex-col gap-12">
      <PageHeader
        index={1}
        eyebrow="Create Lineup"
        title={
          <>
            Draft your <span className="text-foil">22-champion</span> football roster.
          </>
        }
        description={
          <>
            Tap a position on the field, pick a champion. Fill all 22 to share your dream lineup.{" "}
            <Link href="/grid" className="inline-flex items-center gap-1 text-foil hover:text-foil-bright">
              Or play today's grid <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </>
        }
        meta={
          <span>
            <span className="nums text-parchment-50">{filledCount}</span>
            <span className="text-parchment-300"> / 22 placed</span>
          </span>
        }
        actions={
          <>
            <button type="button" onClick={handleRandomize} className="btn-ghost">
              <Shuffle className="h-3.5 w-3.5" /> Randomize
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={filledCount === 0}
              className="btn-ghost"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </button>
            {filledCount > 0 && <ShareButton text={shareText} label="Share Roster" />}
          </>
        }
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="animate-fade-up">
          <FootballField
            lineup={lineup}
            activePositionId={activePos}
            onPositionClick={handlePositionClick}
            onChampionRemove={handleRemove}
          />
        </div>

        <aside className="card-plate flex h-[32rem] min-h-0 flex-col gap-4 p-5 lg:h-auto lg:max-h-[44rem]">
          <div className="flex items-baseline justify-between border-b border-ink-700 pb-3">
            <span className="eyebrow">{activePosition ? "Picking For" : "Roster Pool"}</span>
            {activePosition && (
              <span className="font-display text-base font-bold uppercase tracking-caps-tight text-foil">
                {activePosition.label}
              </span>
            )}
          </div>
          {activePosition ? (
            <ChampionPicker
              onSelect={(c) => handleSelect(c.id)}
              excludeIds={usedIds}
              className="min-h-0 flex-1"
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
              <p className="font-display text-lg font-bold uppercase tracking-caps-tight text-parchment-50">
                Tap a position
              </p>
              <p className="max-w-[18rem] text-sm leading-relaxed text-parchment-200">
                Select an open slot on the field to draft a champion. Filled slots can be tapped to clear.
              </p>
              <p className="mt-4 eyebrow-dim">22 Slots · 11 Off · 11 Def</p>
            </div>
          )}
        </aside>
      </div>

      <AdSlot slot="build-bottom" variant="banner" />
    </div>
  );
}
