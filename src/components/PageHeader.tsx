import type { ReactNode } from "react";
import { Eyebrow } from "@/components/Eyebrow";

interface Props {
  index?: string | number;
  eyebrow: string;
  /** Display headline. */
  title: ReactNode;
  /** Optional subline / description. */
  description?: ReactNode;
  /** Right-aligned actions. */
  actions?: ReactNode;
  /** Right-aligned metadata (e.g. "PUZZLE #042 · MAY 8 UTC"). */
  meta?: ReactNode;
}

export function PageHeader({ index, eyebrow, title, description, actions, meta }: Props) {
  return (
    <header className="flex flex-col gap-6 animate-fade-up">
      <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-3">
        <Eyebrow index={index}>{eyebrow}</Eyebrow>
        {meta && <div className="eyebrow-dim nums">{meta}</div>}
      </div>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
        <div className="flex max-w-3xl flex-col gap-4">
          <h1 className="display-xl">{title}</h1>
          {description && (
            <p className="max-w-prose text-base leading-relaxed text-parchment-200 sm:text-lg">{description}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      <div className="rule-foil" />
    </header>
  );
}
