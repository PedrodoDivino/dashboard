import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

// Classes do formulário de contato do template (estado focus em #FF6400).
const control =
  "w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-all duration-300 placeholder:text-zinc-600 focus:border-[#FF6400]/60 focus:bg-[#FF6400]/5 focus:ring-2 focus:ring-[#FF6400]/20 disabled:cursor-not-allowed disabled:text-zinc-500 read-only:text-zinc-400 read-only:focus:border-white/10 read-only:focus:bg-white/[0.04] read-only:focus:ring-0";

const invalidControl = "border-red-400/50 focus:border-red-400/70 focus:ring-red-400/20";

export function Field({
  label,
  hint,
  error,
  htmlFor,
  className,
  children,
}: {
  label: string;
  hint?: ReactNode;
  error?: string;
  htmlFor: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("block", className)}>
      <label htmlFor={htmlFor} className="font-mono text-xs font-semibold uppercase tracking-[0.14rem] text-zinc-500">
        {label}
      </label>
      <div className="mt-2">{children}</div>
      {error ? (
        <p role="alert" className="mt-2 text-xs text-red-300">
          {error}
        </p>
      ) : (
        hint && <p className="mt-2 text-xs leading-5 text-zinc-500">{hint}</p>
      )}
    </div>
  );
}

export function Input({ className, invalid, ...rest }: ComponentProps<"input"> & { invalid?: boolean }) {
  return <input aria-invalid={invalid || undefined} className={cn(control, invalid && invalidControl, className)} {...rest} />;
}

export function Textarea({ className, ...rest }: ComponentProps<"textarea">) {
  return <textarea className={cn(control, "resize-none", className)} {...rest} />;
}

export function Select({ className, children, ...rest }: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select className={cn(control, "appearance-none pr-10 [&>option]:bg-[#090909]", className)} {...rest}>
        {children}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#FFA500]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 9L12 15L5 9" />
      </svg>
    </div>
  );
}
