import type { Champion } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  champion: Champion;
  size?: "sm" | "md" | "lg";
  selected?: boolean;
  className?: string;
  onClick?: () => void;
  /** Show champion name caption below the portrait. */
  withCaption?: boolean;
}

const SIZES = {
  sm: "h-12 w-12",
  md: "h-16 w-16",
  lg: "h-24 w-24",
};

export function ChampionTile({ champion, size = "md", selected, className, onClick, withCaption }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={`${champion.name} — ${champion.title}`}
      className={cn(
        "group relative flex flex-col items-center gap-1.5",
        onClick ? "cursor-pointer" : "cursor-default",
        className,
      )}
    >
      <span
        className={cn(
          "relative block overflow-hidden rounded-sm bg-ink-900 transition",
          SIZES[size],
          selected
            ? "ring-2 ring-foil shadow-foil"
            : "ring-1 ring-foil-dim/40 group-hover:ring-foil-bright group-hover:shadow-foil",
        )}
      >
        <img
          src={champion.imageUrl}
          alt={champion.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
        />
        {/* Foil corner cropmarks */}
        <CornerMarks />
        {/* Subtle top sheen */}
        <span className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-foil/10 to-transparent" />
      </span>
      {withCaption && (
        <span className="block max-w-[5rem] truncate text-[10px] uppercase tracking-caps text-parchment-200 group-hover:text-foil">
          {champion.name}
        </span>
      )}
    </button>
  );
}

function CornerMarks() {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      <span className="absolute left-1 top-1 h-1.5 w-1.5 border-l border-t border-foil-bright/60" />
      <span className="absolute right-1 top-1 h-1.5 w-1.5 border-r border-t border-foil-bright/60" />
      <span className="absolute bottom-1 left-1 h-1.5 w-1.5 border-b border-l border-foil-bright/60" />
      <span className="absolute bottom-1 right-1 h-1.5 w-1.5 border-b border-r border-foil-bright/60" />
    </span>
  );
}
