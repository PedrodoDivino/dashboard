"use client";

import { cn } from "@/lib/cn";
import { Icon } from "./icon";

export interface TabItem<T extends string> {
  value: T;
  label: string;
  icon?: string;
}

/** Abas no estilo dos links da navegação do template (ativo = pill laranja). */
export function Tabs<T extends string>({
  items,
  value,
  onChange,
  label,
}: {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="nx-scroll flex gap-1 overflow-x-auto rounded-xl border border-white/10 bg-[#070707]/80 p-1.5"
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            id={`tab-${item.value}`}
            aria-selected={active}
            aria-controls={`panel-${item.value}`}
            onClick={() => onChange(item.value)}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 font-mono text-xs font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFA500]/50",
              active
                ? "border-[#FF6400]/20 bg-[#FF6400]/10 text-orange-100 hover:bg-[#FF6400]/15"
                : "border-transparent text-zinc-400 hover:bg-white/5 hover:text-white",
            )}
          >
            {item.icon && <Icon name={item.icon} className={cn("text-base", active && "text-[#FFA500]")} />}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
