"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";
import { useMagnetic } from "./use-magnetic";

// Classes copiadas de design-system.html (seção Componentes › Botões).
const variants = {
  primary:
    "group relative inline-flex items-center justify-center overflow-hidden rounded-lg border border-[#FF6400]/40 bg-[#FF6400] px-5 py-3 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#FFA500] hover:text-[#030303] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFA500]/60 active:translate-y-0",
  submit:
    "group inline-flex items-center justify-center gap-2 rounded-lg border border-[#FF6400]/40 bg-[#FF6400] px-5 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-[#FFA500] hover:text-[#030303] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFA500]/60 active:scale-[0.99]",
  secondary:
    "group inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 active:translate-y-0",
  cta: "group inline-flex items-center gap-2 rounded-lg border border-[#66381D] bg-[#331B0E] px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:border-[#FF6400]/70 hover:bg-[#4D2915] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFA500]/50",
  ghost:
    "group inline-flex items-center gap-2 rounded-lg px-3 py-2 font-mono text-xs font-medium text-zinc-400 transition-all duration-300 hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
} as const;

const sizes = {
  md: "",
  sm: "px-3 py-2 text-xs",
};

const iconMotion = {
  right: "group-hover:translate-x-1",
  down: "group-hover:translate-y-1",
  rotate: "group-hover:rotate-6",
  send: "group-hover:translate-x-1 group-hover:-translate-y-1",
  none: "",
};

type Variant = keyof typeof variants;

interface BaseProps {
  variant?: Variant;
  size?: keyof typeof sizes;
  icon?: string;
  iconMotion?: keyof typeof iconMotion;
  /** Ícone em #FFA500 (secundário/CTA) em vez de herdar a cor do texto. */
  accentIcon?: boolean;
  magnetic?: boolean;
  className?: string;
  children: ReactNode;
}

type ButtonProps = BaseProps & Omit<ComponentProps<"button">, keyof BaseProps> & { href?: undefined };
type LinkProps = BaseProps & Omit<ComponentProps<typeof Link>, keyof BaseProps> & { href: string };

export function Button(props: ButtonProps | LinkProps) {
  const {
    variant = "primary",
    size = "md",
    icon,
    iconMotion: motion = "right",
    accentIcon,
    magnetic,
    className,
    children,
    ...rest
  } = props;
  const isMagnetic = magnetic ?? (variant === "primary" || variant === "secondary" || variant === "cta");
  const ref = useMagnetic<HTMLAnchorElement & HTMLButtonElement>(isMagnetic);

  const classes = cn(
    variants[variant],
    sizes[size],
    "disabled:pointer-events-none disabled:opacity-50",
    className,
  );
  const iconEl = icon ? (
    <Icon
      name={icon}
      className={cn(
        "text-lg transition-transform duration-300",
        variant === "cta" && "text-base",
        accentIcon && "text-[#FFA500]",
        iconMotion[motion],
      )}
    />
  ) : null;

  const content =
    variant === "primary" ? (
      <>
        <span className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-300 group-hover:translate-y-0" />
        <span className="relative flex items-center gap-2">
          {children}
          {iconEl}
        </span>
      </>
    ) : (
      <>
        {children}
        {iconEl}
      </>
    );

  if (rest.href !== undefined) {
    return (
      <Link ref={ref} className={classes} {...(rest as Omit<LinkProps, keyof BaseProps>)}>
        {content}
      </Link>
    );
  }

  const { type = "button", ...buttonRest } = rest as Omit<ButtonProps, keyof BaseProps>;
  return (
    <button ref={ref} type={type} className={classes} {...buttonRest}>
      {content}
    </button>
  );
}
