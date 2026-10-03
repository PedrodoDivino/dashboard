"use client";

import { cn } from "@/lib/cn";

/** Interruptor montado com as cores do design (trilho #FF6400 quando ligado). */
export function Switch({
  checked,
  onChange,
  label,
  id,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  id?: string;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFA500]/60",
        checked ? "border-[#FF6400]/40 bg-[#FF6400]" : "border-white/10 bg-white/[0.06] hover:bg-white/[0.1]",
      )}
    >
      <span
        className={cn(
          "inline-block size-4 rounded-full shadow transition-transform duration-300",
          checked ? "translate-x-[1.375rem] bg-white" : "translate-x-1 bg-zinc-400",
        )}
      />
    </button>
  );
}
