import { cn } from "@/lib/utils";

interface Props {
  slot: string;
  /** "banner" = full-width responsive; "rect" = 300x250-ish. */
  variant?: "banner" | "rect";
  className?: string;
}

const ENABLED = import.meta.env.VITE_ADSENSE_CLIENT_ID && import.meta.env.VITE_ADSENSE_ENABLED === "true";

export function AdSlot({ slot, variant = "banner", className }: Props) {
  const dimensions = variant === "banner" ? "h-20 sm:h-24" : "h-64 w-72";
  if (!ENABLED) {
    return (
      <div
        data-ad-slot={slot}
        className={cn(
          "flex items-center justify-center rounded-sm border border-dashed border-ink-600/60 bg-ink-900/40 font-display text-[10px] uppercase tracking-caps text-parchment-300/60",
          dimensions,
          className,
        )}
        aria-hidden
      >
        ad slot · {slot}
      </div>
    );
  }
  return (
    <ins
      className={cn("adsbygoogle block", dimensions, className)}
      data-ad-client={import.meta.env.VITE_ADSENSE_CLIENT_ID}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
