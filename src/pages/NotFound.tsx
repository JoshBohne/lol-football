import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Eyebrow } from "@/components/Eyebrow";

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-start gap-6 py-16 sm:py-24">
      <Eyebrow>Error · 404</Eyebrow>
      <p className="nums font-display text-[clamp(6rem,16vw,12rem)] font-extrabold leading-none text-foil">
        404
      </p>
      <p className="display-lg max-w-2xl">No champions on this side of the field.</p>
      <p className="max-w-prose text-base text-parchment-200">
        The route you're looking for doesn't exist. Either it was retired, or you mistyped a path.
      </p>
      <Link href="/" className="btn-foil">
        <ArrowLeft className="h-4 w-4" /> Back to Lineup
      </Link>
    </div>
  );
}
