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
  /** Hide scoreboard chrome (offense/defense labels). */
  compact?: boolean;
}

const STATE_RING: Record<SlotState, string> = {
  default: "ring-foil-dim/40",
  active: "ring-foil ring-2 animate-pulse shadow-foil",
  hit: "ring-feedback-hit ring-2",
  near: "ring-feedback-near ring-2",
  miss: "ring-feedback-miss ring-2 opacity-60",
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
      {/* Scoreboard labels above the field */}
      {!compact && (
        <div className="mb-3 flex items-center justify-between text-[10px]">
          <span className="eyebrow text-foil">▸ Offense</span>
          <span className="rule-foil mx-4 flex-1 opacity-60" />
          <span className="eyebrow text-crimson">Defense ◂</span>
        </div>
      )}

      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-plate border border-foil-dim/40 bg-turf-deep shadow-card-deep sm:aspect-[4/5]">
        {/* Field gradient — moss tinted warm */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 50%, #1a2e27 0%, #0F1A18 70%, #07100E 100%)",
          }}
        />

        {/* Yard markings */}
        {!compact && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Midfield */}
            <div className="absolute inset-x-6 top-1/2 h-px bg-foil-dim/40" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[11px] font-bold uppercase tracking-caps-loose text-foil-dim/60">
              Midfield
            </div>
            {/* Yard lines */}
            {[10, 20, 30, 40].map((y) => (
              <YardLine key={`top-${y}`} y={y} label={50 - y} />
            ))}
            {[60, 70, 80, 90].map((y) => (
              <YardLine key={`bot-${y}`} y={y} label={y - 50} />
            ))}
            {/* Subtle vertical hash marks */}
            <div className="absolute inset-y-0 left-[33%] w-px bg-foil-dim/8" />
            <div className="absolute inset-y-0 right-[33%] w-px bg-foil-dim/8" />
            {/* Endzone labels */}
            <span className="absolute left-1/2 top-2 -translate-x-1/2 font-display text-[10px] font-bold uppercase tracking-caps text-foil-dim/60">
              End Zone
            </span>
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 font-display text-[10px] font-bold uppercase tracking-caps text-foil-dim/60">
              End Zone
            </span>
          </div>
        )}

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

        {/* Foil corner ornaments on the field plate itself */}
        <span aria-hidden className="pointer-events-none absolute left-2 top-2 h-3 w-3 border-l border-t border-foil-dim/70" />
        <span aria-hidden className="pointer-events-none absolute right-2 top-2 h-3 w-3 border-r border-t border-foil-dim/70" />
        <span aria-hidden className="pointer-events-none absolute bottom-2 left-2 h-3 w-3 border-b border-l border-foil-dim/70" />
        <span aria-hidden className="pointer-events-none absolute bottom-2 right-2 h-3 w-3 border-b border-r border-foil-dim/70" />
      </div>
    </div>
  );
}

function YardLine({ y, label }: { y: number; label: number }) {
  return (
    <>
      <div className="absolute inset-x-6 border-t border-turf-line" style={{ top: `${y}%` }} />
      <span
        className="absolute left-2 nums text-[9px] font-semibold text-foil-dim/60"
        style={{ top: `${y}%`, transform: "translateY(-50%)" }}
      >
        {label}
      </span>
      <span
        className="absolute right-2 nums text-[9px] font-semibold text-foil-dim/60"
        style={{ top: `${y}%`, transform: "translateY(-50%)" }}
      >
        {label}
      </span>
    </>
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
          "relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-sm bg-ink-900 ring-1 transition sm:h-14 sm:w-14",
          STATE_RING[state],
          "hover:ring-foil-bright focus-visible:ring-foil focus-visible:outline-none",
        )}
      >
        {champion ? (
          <img
            src={champion.imageUrl}
            alt={champion.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="font-display text-[10px] font-bold uppercase tracking-caps text-parchment-200">
            {position.abbr}
          </span>
        )}
        <span
          className={cn(
            "pointer-events-none absolute -bottom-[18px] left-1/2 -translate-x-1/2 whitespace-nowrap font-display text-[9px] font-bold uppercase tracking-caps",
            position.side === "offense" ? "text-foil" : "text-crimson",
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
          aria-label={`Remove ${champion?.name ?? "champion"}`}
          className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-ink-1000 text-[11px] leading-none text-parchment-200 ring-1 ring-foil-dim transition hover:bg-crimson hover:text-parchment-50 hover:ring-crimson"
        >
          ×
        </button>
      )}
    </div>
  );
}
