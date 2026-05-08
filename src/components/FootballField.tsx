import type { Champion, Lineup, Position } from "@/types";
import { POSITIONS } from "@/data/positions";
import { getChampion } from "@/lib/champions";
import { cn } from "@/lib/utils";

export type SlotState = "default" | "active" | "hit" | "near" | "miss";

interface Props {
  lineup: Lineup;
  states?: Record<string, SlotState>;
  activePositionId?: string | null;
  positions?: readonly Position[];
  onPositionClick?: (position: Position) => void;
  onChampionRemove?: (position: Position) => void;
  /** Hide the field markings showing offense/defense halves. */
  compact?: boolean;
}

const STATE_RING: Record<SlotState, string> = {
  default: "ring-white/20",
  active: "ring-gold ring-4 animate-pulse",
  hit: "ring-feedback-hit ring-4",
  near: "ring-feedback-near ring-4",
  miss: "ring-feedback-miss ring-4 opacity-70",
};

export function FootballField({
  lineup,
  states,
  activePositionId,
  positions = POSITIONS,
  onPositionClick,
  onChampionRemove,
  compact,
}: Props) {
  return (
    <div className="relative w-full">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-900 shadow-xl sm:aspect-[4/5]">
        {/* Field markings */}
        <div className="absolute inset-0 pointer-events-none">
          {!compact && (
            <>
              <div className="absolute inset-x-0 top-0 h-1/2 border-b border-white/30" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] uppercase tracking-[0.4em] text-white/40">
                50
              </div>
              {[10, 20, 30, 40].map((y) => (
                <div
                  key={`top-${y}`}
                  className="absolute inset-x-0 border-t border-white/15"
                  style={{ top: `${y}%` }}
                />
              ))}
              {[60, 70, 80, 90].map((y) => (
                <div
                  key={`bot-${y}`}
                  className="absolute inset-x-0 border-t border-white/15"
                  style={{ top: `${y}%` }}
                />
              ))}
            </>
          )}
        </div>

        {positions.map((pos) => {
          const champId = lineup[pos.id];
          const champ = champId ? getChampion(champId) ?? null : null;
          const state = states?.[pos.id] ?? (activePositionId === pos.id ? "active" : "default");
          return (
            <PositionSlot
              key={pos.id}
              position={pos}
              champion={champ}
              state={state}
              onClick={() => onPositionClick?.(pos)}
              onRemove={champ ? () => onChampionRemove?.(pos) : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}

function PositionSlot({
  position,
  champion,
  state,
  onClick,
  onRemove,
}: {
  position: Position;
  champion: Champion | null;
  state: SlotState;
  onClick: () => void;
  onRemove?: () => void;
}) {
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
    >
      <button
        type="button"
        onClick={onClick}
        title={position.label}
        className={cn(
          "relative flex h-12 w-12 items-center justify-center rounded-full bg-navy-900/80 ring-2 transition sm:h-14 sm:w-14",
          STATE_RING[state],
          "hover:ring-teal focus-visible:ring-teal focus-visible:outline-none",
        )}
      >
        {champion ? (
          <img src={champion.imageUrl} alt={champion.name} className="h-full w-full rounded-full object-cover" />
        ) : (
          <span className="text-xs font-semibold tracking-wide text-white/70">{position.abbr}</span>
        )}
        <span
          className={cn(
            "pointer-events-none absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-navy-950/80 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            position.side === "offense" ? "text-teal" : "text-ember",
          )}
        >
          {position.abbr}
        </span>
      </button>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          title="Remove"
          className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-navy-950 text-xs text-white/80 ring-1 ring-white/30 hover:bg-ember hover:text-white"
        >
          ×
        </button>
      )}
    </div>
  );
}
