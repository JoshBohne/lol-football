import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CHAMPIONS } from "@/lib/champions";
import { ChampionTile } from "@/components/ChampionTile";
import type { Champion } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  onSelect: (champion: Champion) => void;
  excludeIds?: ReadonlySet<string>;
  /** Highlight tag chips with active filter. */
  showTags?: boolean;
  className?: string;
  emptyHint?: string;
}

const TAG_OPTIONS = ["Fighter", "Tank", "Mage", "Marksman", "Assassin", "Support"] as const;

export function ChampionPicker({ onSelect, excludeIds, showTags = true, className, emptyHint }: Props) {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<(typeof TAG_OPTIONS)[number] | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CHAMPIONS.filter((c) => {
      if (excludeIds?.has(c.id)) return false;
      if (tag && !c.tags.includes(tag)) return false;
      if (!q) return true;
      return c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
    });
  }, [query, tag, excludeIds]);

  return (
    <div className={cn("flex h-full flex-col gap-3", className)}>
      <div className="relative">
        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search champion..."
          className="w-full rounded-md border border-white/10 bg-navy-900 py-2 pl-8 pr-3 text-sm text-white placeholder:text-white/40 focus:border-teal focus:outline-none"
        />
      </div>
      {showTags && (
        <div className="flex flex-wrap gap-1.5">
          <TagChip active={tag === null} onClick={() => setTag(null)}>All</TagChip>
          {TAG_OPTIONS.map((t) => (
            <TagChip key={t} active={tag === t} onClick={() => setTag(tag === t ? null : t)}>
              {t}
            </TagChip>
          ))}
        </div>
      )}
      <div className="grid flex-1 grid-cols-5 gap-2 overflow-y-auto pr-1 sm:grid-cols-6 md:grid-cols-7">
        {filtered.map((c) => (
          <ChampionTile key={c.id} champion={c} size="md" onClick={() => onSelect(c)} />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-6 text-center text-sm text-white/50">
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
        "rounded-full border px-2.5 py-0.5 text-xs font-medium transition",
        active
          ? "border-teal bg-teal/20 text-teal"
          : "border-white/15 bg-transparent text-white/60 hover:border-white/30 hover:text-white",
      )}
    >
      {children}
    </button>
  );
}
