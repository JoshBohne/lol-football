import { cn } from "@/lib/utils";

interface Props {
  slot: string;
  /** "banner" = full-width responsive; "rect" = 300x250-ish. */
  variant?: "banner" | "rect";
  className?: string;
}

const ENABLED = import.meta.env.VITE_ADSENSE_CLIENT_ID && import.meta.env.VITE_ADSENSE_ENABLED === "true";

/**
 * AdSense placeholder. Renders an inert div until the ADSENSE_ENABLED feature
 * flag is on AND a client ID is configured. Reserves CLS-safe vertical space.
 */
export function AdSlot({ slot, variant = "banner", className }: Props) {
  const dimensions = variant === "banner" ? "h-20 sm:h-24" : "h-64 w-72";
  if (!ENABLED) {
    return (
      <div
        data-ad-slot={slot}
        className={cn(
          "flex items-center justify-center rounded-lg border border-dashed border-white/10 bg-navy-800/40 text-xs text-white/30",
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
