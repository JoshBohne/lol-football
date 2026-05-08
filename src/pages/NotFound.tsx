import { Link } from "wouter";

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center gap-3 py-20 text-center">
      <p className="font-display text-4xl font-bold text-white">404</p>
      <p className="text-white/60">No champions on this side of the field.</p>
      <Link href="/" className="rounded-md bg-teal px-4 py-2 text-sm font-semibold text-navy-950">
        Back home
      </Link>
    </div>
  );
}
