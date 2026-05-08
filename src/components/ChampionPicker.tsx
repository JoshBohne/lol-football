import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CHAMPIONS } from "@/lib/champions";
import { ChampionTile } from "@/components/ChampionTile";
import type { Champion } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  onSelect: (champion: Champion) => void;
  excludeIds?: ReadonlySet<string>;
  /** Restrict the visible champion pool (used by Grid mode for valid picks per cell). */
  poolIds?: ReadonlySet<string>;
  showTags?: boolean;
  className?: string;
  emptyHint?: string;
}

const TAG_OPTIONS = ["Fighter", "Tank", "Mage", "Marksman", "Assassin", "Support"] as const;

export function ChampionPicker({
  onSelect,
  excludeIds,
  poolIds,
  showTags = true,
  className,
  emptyHint,
}: Props) {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<(typeof TAG_OPTIONS)[number] | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CHAMPIONS.filter((c) => {
      if (poolIds && !poolIds.has(c.id)) return false;
      if (excludeIds?.has(c.id)) return false;
      if (tag && !c.tags.includes(tag)) return false;
      if (!q) return true;
      return c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
    });
  }, [query, tag, excludeIds, poolIds]);

  const total = poolIds ? poolIds.size : CHAMPIONS.length;

  return (
    <div className={cn("flex h-full flex-col gap-4", className)}>
      <div className="flex items-baseline justify-between">
        <span className="eyebrow-dim">Champion Pool</span>
        <span className="eyebrow-dim nums">
          {filtered.length} <span className="text-parchment-400">/ {total}</span>
        </span>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-parchment-300" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search champion…"
          className="w-full rounded-sm border border-ink-600 bg-ink-900 py-2.5 pl-10 pr-3 text-sm text-parchment-50 placeholder:text-parchment-300/70 transition focus:border-foil focus:outline-none focus:ring-1 focus:ring-foil/40"
        />
      </div>

      {showTags && (
        <div className="flex flex-wrap gap-1">
          <TagChip active={tag === null} onClick={() => setTag(null)}>
            All
          </TagChip>
          {TAG_OPTIONS.map((t) => (
            <TagChip key={t} active={tag === t} onClick={() => setTag(tag === t ? null : t)}>
              {t}
            </TagChip>
          ))}
        </div>
      )}

      <div className="grid flex-1 grid-cols-4 content-start gap-3 overflow-y-auto pr-1 sm:grid-cols-5 md:grid-cols-6 xl:grid-cols-5">
        {filtered.map((c) => (
          <ChampionTile
            key={c.id}
            champion={c}
            size="md"
            withCaption
            onClick={() => onSelect(c)}
          />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-parchment-300">
            {emptyHint ?? "No champions match"}
          </p>
        )}
      </div>
    </div>
  );
}

function TagChip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-sm px-2.5 py-1 font-display text-[10px] font-bold uppercase tracking-caps transition",
        active
          ? "bg-foil text-ink-1000 shadow-foil"
          : "border border-ink-600 text-parchment-200 hover:border-foil-dim hover:text-foil",
      )}
    >
      {children}
    </button>
  );
}
