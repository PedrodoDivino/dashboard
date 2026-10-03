"use client";

import { Icon as Iconify } from "@iconify/react";
import { cn } from "@/lib/cn";

/** Ícones Solar Linear (mesmo set do template). Tamanho via font-size, cor via currentColor. */
export function Icon({ name, className }: { name: string; className?: string }) {
  return <Iconify icon={name} className={cn("inline-block shrink-0", className)} aria-hidden="true" />;
}
