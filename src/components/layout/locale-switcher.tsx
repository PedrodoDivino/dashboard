"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { setLocale } from "@/lib/auth/actions";
import { locales } from "@/i18n/config";
import { cn } from "@/lib/cn";

/** Alterna PT/EN gravando o cookie de idioma. */
export function LocaleSwitcher({ className }: { className?: string }) {
  const t = useTranslations("topbar");
  const current = useLocale();
  const [pending, startTransition] = useTransition();

  return (
    <div
      role="group"
      aria-label={t("language")}
      className={cn("inline-flex rounded-lg border border-white/10 bg-white/[0.03] p-0.5", pending && "opacity-60", className)}
    >
      {locales.map((locale) => {
        const active = locale === current;
        return (
          <button
            key={locale}
            type="button"
            aria-pressed={active}
            disabled={pending}
            onClick={() => !active && startTransition(() => setLocale(locale))}
            className={cn(
              "rounded-md px-2.5 py-1 font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.12rem] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFA500]/50",
              active ? "bg-[#FF6400]/15 text-orange-100" : "text-zinc-500 hover:bg-white/5 hover:text-white",
            )}
          >
            {locale}
          </button>
        );
      })}
    </div>
  );
}
