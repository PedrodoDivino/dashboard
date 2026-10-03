"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { signOut } from "@/lib/auth/actions";
import type { SessionUser } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { Brand } from "./brand";
import { LocaleSwitcher } from "./locale-switcher";

interface NavItem {
  href: string;
  key: "home" | "profile" | "settings" | "users";
  icon: string;
}

const mainNav: NavItem[] = [
  { href: "/home", key: "home", icon: "solar:home-2-linear" },
  { href: "/profile", key: "profile", icon: "solar:user-circle-linear" },
  { href: "/settings", key: "settings", icon: "solar:settings-linear" },
];

const adminNav: NavItem[] = [{ href: "/admin/users", key: "users", icon: "solar:users-group-rounded-linear" }];

function NavLink({ item, active, onNavigate }: { item: NavItem; active: boolean; onNavigate: () => void }) {
  const t = useTranslations("nav");
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-lg border px-3 py-2.5 font-mono text-xs font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFA500]/50",
        active
          ? "border-[#FF6400]/20 bg-[#FF6400]/10 text-orange-100 hover:bg-[#FF6400]/15"
          : "border-transparent text-zinc-400 hover:bg-white/5 hover:text-white",
      )}
    >
      <Icon name={item.icon} className={cn("text-lg", active ? "text-[#FFA500]" : "text-zinc-500")} />
      {t(item.key)}
    </Link>
  );
}

export function AppShell({ user, children }: { user: SessionUser; children: ReactNode }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const displayName = user.fullName.trim() || user.email;
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const close = () => setOpen(false);

  const sidebar = (
    <div className="flex h-full flex-col gap-6 p-3">
      <div className="flex items-center justify-between">
        <Brand />
        <button
          type="button"
          onClick={close}
          aria-label={t("closeMenu")}
          className="grid size-9 place-items-center rounded-lg border border-white/10 text-zinc-400 transition-all duration-300 hover:bg-white/5 hover:text-white lg:hidden"
        >
          <Icon name="solar:close-circle-linear" className="text-xl" />
        </button>
      </div>

      <nav aria-label={t("section")} className="flex flex-1 flex-col gap-6">
        <div>
          <p className="mb-2 px-3 font-mono text-[0.625rem] uppercase tracking-[0.16rem] text-zinc-600">{t("section")}</p>
          <div className="flex flex-col gap-1">
            {mainNav.map((item) => (
              <NavLink key={item.href} item={item} active={isActive(item.href)} onNavigate={close} />
            ))}
          </div>
        </div>
        {user.permissions.includes("users.read") && (
          <div>
            <p className="mb-2 px-3 font-mono text-[0.625rem] uppercase tracking-[0.16rem] text-zinc-600">{t("adminSection")}</p>
            <div className="flex flex-col gap-1">
              {adminNav.map((item) => (
                <NavLink key={item.href} item={item} active={isActive(item.href)} onNavigate={close} />
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
        <div className="flex items-center gap-3">
          <Avatar src={user.avatarUrl} name={displayName} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{displayName}</p>
            <p className="truncate font-mono text-[0.6875rem] text-zinc-500">{user.role.name}</p>
          </div>
        </div>
        <form action={signOut} className="mt-3">
          <button
            type="submit"
            className="group flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-xs font-medium text-zinc-300 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            <Icon name="solar:logout-2-linear" className="text-base text-[#FFA500] transition-transform duration-300 group-hover:translate-x-1" />
            {t("signOut")}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen">
      <div aria-hidden className="nx-grid-texture pointer-events-none fixed inset-0 z-0 opacity-[0.1]" />
      <div aria-hidden className="nx-glow-soft pointer-events-none fixed inset-0 z-0" />

      {/* Sidebar fixa (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-white/10 bg-[#070707]/80 backdrop-blur-xl lg:block">
        {sidebar}
      </aside>

      {/* Gaveta (mobile/tablet) */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", !open && "pointer-events-none")} aria-hidden={!open}>
        <div
          onClick={close}
          className={cn("absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300", open ? "opacity-100" : "opacity-0")}
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-white/10 bg-[#070707] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {open && sidebar}
        </aside>
      </div>

      <div className="relative z-10 lg:pl-64">
        <header className="sticky top-0 z-20 px-4 pt-4 sm:px-6">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#070707]/80 p-1.5 shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] backdrop-blur-xl">
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label={t("openMenu")}
                aria-expanded={open}
                className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-zinc-300 transition-all duration-300 hover:border-[#FF6400]/40 hover:bg-[#FF6400]/10 lg:hidden"
              >
                <Icon name="solar:hamburger-menu-linear" className="text-xl" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <LocaleSwitcher className="hidden sm:inline-flex" />
              <Link
                href="/profile"
                aria-label={t("profile")}
                className="rounded-full transition-all duration-300 hover:ring-2 hover:ring-[#FF6400]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFA500]/50"
              >
                <Avatar src={user.avatarUrl} name={displayName} size="sm" />
              </Link>
            </div>
          </div>
        </header>

        <main id="main" className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
