import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Moldura de seção (`.frame`) com cantos: laranja (#FF6400/50) ou neutra (white/20). */
export function Frame({
  corners = "orange",
  className,
  children,
  ...rest
}: ComponentProps<"div"> & { corners?: "orange" | "neutral" | "none" }) {
  const cornerColor = corners === "orange" ? "border-[#FF6400]/50" : "border-white/20";
  return (
    <div
      className={cn("relative rounded-2xl border border-white/10 bg-[#050505]/75 p-6 sm:p-8", className)}
      {...rest}
    >
      {corners !== "none" && (
        <>
          <span aria-hidden className={cn("pointer-events-none absolute left-3 top-3 z-10 h-5 w-5 border-l border-t", cornerColor)} />
          <span aria-hidden className={cn("pointer-events-none absolute bottom-3 right-3 z-10 h-5 w-5 border-b border-r", cornerColor)} />
        </>
      )}
      {children}
    </div>
  );
}

/** Eyebrow mono em #FFA500 (ex.: "03 / Capabilities"). */
export function Eyebrow({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <p className={cn("font-mono text-xs font-semibold uppercase tracking-[0.18rem] text-[#FFA500]", className)}>
      {children}
    </p>
  );
}

/** Rótulo mono pequeno (ex.: "Intent", "Live intent trace"). */
export function MonoLabel({ className, children }: { className?: string; children: React.ReactNode }) {
  return <p className={cn("font-mono text-xs uppercase tracking-[0.16rem] text-zinc-500", className)}>{children}</p>;
}

const cardVariants = {
  /** Card bento neutro, com elevação no hover. */
  bento: "rounded-xl border border-white/10 bg-[#0B0B0B] p-6",
  /** Card quente (#120B07). */
  warm: "rounded-xl border border-white/10 bg-[#120B07] p-6",
  /** Destaque (#4D2915/60) — métrica principal, plano Scale. */
  highlight: "rounded-xl border border-[#FF6400]/25 bg-[#4D2915]/60 p-6",
  /** Card de conteúdo (#090909) — preços, depoimentos. */
  plain: "rounded-xl border border-white/10 bg-[#090909] p-6",
  /** Card interno translúcido (white/3%). */
  inset: "rounded-xl border border-white/10 bg-white/[0.03] p-4",
} as const;

const hoverVariants = {
  bento: "transition-all duration-300 hover:-translate-y-1 hover:border-[#FF6400]/40",
  warm: "transition-all duration-300 hover:-translate-y-1 hover:border-[#FF6400]/40",
  highlight: "transition-all duration-300 hover:-translate-y-1 hover:border-[#FFA500]/50",
  plain: "transition-all duration-300 hover:-translate-y-1 hover:border-white/20",
  inset: "transition-all duration-300 hover:border-[#FF6400]/30 hover:bg-[#FF6400]/10",
} as const;

export function Card({
  variant = "plain",
  interactive = false,
  className,
  ...rest
}: ComponentProps<"div"> & { variant?: keyof typeof cardVariants; interactive?: boolean }) {
  return <div className={cn(cardVariants[variant], interactive && hoverVariants[variant], className)} {...rest} />;
}

/** Cabeçalho de página: eyebrow + H2 + subtítulo, como nas seções do template. */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div className="max-w-2xl">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-4 text-3xl font-medium leading-tight tracking-tight text-white sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-3 text-base leading-7 text-zinc-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>}
    </div>
  );
}
