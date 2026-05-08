import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  /** Optional ordinal — rendered in tabular nums before the label, e.g. "01" */
  index?: string | number;
  children: ReactNode;
  tone?: "foil" | "dim";
  className?: string;
}

export function Eyebrow({ index, children, tone = "foil", className }: Props) {
  return (
    <p className={cn(tone === "foil" ? "eyebrow" : "eyebrow-dim", className)}>
      {index !== undefined && (
        <>
          <span className="nums text-parchment-300">{String(index).padStart(2, "0")}</span>
          <span className="mx-2 text-parchment-300">·</span>
        </>
      )}
      {children}
    </p>
  );
}
