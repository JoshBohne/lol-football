import type { Champion } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  champion: Champion;
  size?: "sm" | "md" | "lg";
  selected?: boolean;
  className?: string;
  onClick?: () => void;
}

const SIZES = {
  sm: "h-10 w-10",
  md: "h-14 w-14",
  lg: "h-20 w-20",
};

export function ChampionTile({ champion, size = "md", selected, className, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={`${champion.name} — ${champion.title}`}
      className={cn(
        "group relative overflow-hidden rounded-md ring-2 ring-transparent transition",
        "hover:ring-teal focus-visible:ring-teal focus-visible:outline-none",
        selected && "ring-gold",
        SIZES[size],
        className,
      )}
    >
      <img
        src={champion.imageUrl}
        alt={champion.name}
        loading="lazy"
        className="h-full w-full object-cover"
      />
    </button>
  );
}
