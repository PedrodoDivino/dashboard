"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { cn } from "@/lib/cn";

/**
 * Entrada `.reveal` do template: y 28 → 0, opacidade 0 → 1, blur 0.75rem → 0,
 * 0.9s power3.out. No painel roda uma vez ao montar (sem ScrollTrigger).
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tween = gsap.fromTo(
      el,
      { y: 28, autoAlpha: 0, filter: "blur(0.75rem)" },
      { y: 0, autoAlpha: 1, filter: "blur(0rem)", duration: 0.9, delay: Math.min(delay, 0.2), ease: "power3.out", clearProps: "transform,filter" },
    );
    return () => {
      tween.kill();
    };
  }, [delay]);

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
