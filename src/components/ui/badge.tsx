import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const tones = {
  /** Pill do hero: #FF6400/10 com ponto #FFA500. */
  orange: "border-[#FF6400]/20 bg-[#FF6400]/10 text-orange-100",
  /** Chip "Popular": #FFA500/10. */
  amber: "border-[#FFA500]/30 bg-[#FFA500]/10 text-orange-100",
  neutral: "border-white/10 bg-white/[0.04] text-zinc-300",
  muted: "border-white/10 bg-transparent text-zinc-500",
} as const;

export function Badge({
  tone = "neutral",
  dot,
  className,
  children,
}: {
  tone?: keyof typeof tones;
  dot?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1 font-mono text-xs",
        tones[tone],
        className,
      )}
    >
      {dot && (
        <span
          className={cn(
            "size-1.5 rounded-full",
            tone === "muted" ? "bg-zinc-600" : tone === "neutral" ? "bg-white/40" : "bg-[#FFA500]",
          )}
        />
      )}
      {children}
    </span>
  );
}
