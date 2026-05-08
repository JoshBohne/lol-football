import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { copyToClipboard } from "@/lib/clipboard";
import { cn } from "@/lib/utils";

interface Props {
  text: string;
  label?: string;
  className?: string;
}

export function ShareButton({ text, label = "Share", className }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-md bg-teal px-4 py-2 text-sm font-semibold text-navy-950 transition hover:bg-teal-dark hover:text-white",
        className,
      )}
    >
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
      {copied ? "Copied!" : label}
    </button>
  );
}
