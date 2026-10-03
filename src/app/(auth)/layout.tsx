import { getTranslations } from "next-intl/server";
import { Brand } from "@/components/layout/brand";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { HeroCanvas } from "@/components/ui/hero-canvas";
import { Eyebrow, MonoLabel } from "@/components/ui/frame";
import { Reveal } from "@/components/ui/reveal";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("auth.panel");

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <HeroCanvas />
      <div aria-hidden className="nx-grid-texture pointer-events-none fixed inset-0 z-0 opacity-[0.16]" />
      <div aria-hidden className="nx-glow pointer-events-none fixed inset-0 z-0" />

      <header className="relative z-10 px-4 pt-5">
        <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-xl border border-white/10 bg-[#070707]/80 p-1.5 shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] backdrop-blur-xl">
          <Brand href="/login" />
          <LocaleSwitcher className="mr-1" />
        </nav>
      </header>

      <main className="relative z-10 flex min-h-[calc(100vh-5.5rem)] items-center px-4 py-10">
        <div className="relative mx-auto grid w-full max-w-6xl items-stretch gap-6 rounded-2xl border border-white/10 bg-[#030303]/35 p-4 shadow-[0_2.8px_2.2px_rgba(0,_0,_0,_0.034),_0_6.7px_5.3px_rgba(0,_0,_0,_0.048),_0_12.5px_10px_rgba(0,_0,_0,_0.06),_0_22.3px_17.9px_rgba(0,_0,_0,_0.072),_0_41.8px_33.4px_rgba(0,_0,_0,_0.086),_0_100px_80px_rgba(0,_0,_0,_0.12)] backdrop-blur-[0.125rem] sm:p-6 lg:grid-cols-[1.05fr_0.95fr] lg:p-8">
          <span aria-hidden className="absolute left-3 top-3 h-6 w-6 border-l border-t border-[#FF6400]/60" />
          <span aria-hidden className="absolute right-3 top-3 h-6 w-6 border-r border-t border-[#FF6400]/60" />
          <span aria-hidden className="absolute bottom-3 left-3 h-6 w-6 border-b border-l border-[#FF6400]/60" />
          <span aria-hidden className="absolute bottom-3 right-3 h-6 w-6 border-b border-r border-[#FF6400]/60" />

          <Reveal className="hidden flex-col justify-between py-6 lg:flex lg:py-10">
            <div>
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#FF6400]/20 bg-[#FF6400]/10 px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-[0.18rem] text-orange-100">
                <span className="size-1.5 rounded-full bg-[#FFA500]" />
                {t("eyebrow")}
              </div>
              <h1 className="max-w-xl text-5xl font-medium leading-[0.98] tracking-tight text-white xl:text-6xl">{t("title")}</h1>
              <p className="mt-7 max-w-md text-lg leading-7 text-zinc-400">{t("body")}</p>
            </div>
            <div className="mt-10 grid max-w-sm grid-cols-2 gap-3">
              <div className="rounded-lg border border-white/10 bg-[#120B07]/80 p-4">
                <MonoLabel>{t("statLabel")}</MonoLabel>
                <p className="mt-3 text-3xl font-medium tracking-tight">{t("statValue")}</p>
                <p className="mt-1 text-sm text-zinc-500">{t("statHint")}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-[#120B07]/80 p-4">
                <MonoLabel>API</MonoLabel>
                <p className="mt-3 text-3xl font-medium tracking-tight">24ms</p>
                <Eyebrow className="mt-2 text-[0.625rem] tracking-[0.14rem]">p50</Eyebrow>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08} className="flex">
            <div className="relative w-full rounded-xl border border-white/10 bg-[#0A0A0A]/75 p-3 shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_1px_-0.5px_rgba(0,0,0,0.06),0px_3px_3px_-1.5px_rgba(0,0,0,0.06),_0px_6px_6px_-3px_rgba(0,0,0,0.06),0px_12px_12px_-6px_rgba(0,0,0,0.06),0px_24px_24px_-12px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between border-b border-white/10 px-3 py-3">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-[#FF6400]" />
                  <span className="size-2.5 rounded-full bg-[#FFA500]/70" />
                  <span className="size-2.5 rounded-full bg-white/20" />
                </div>
                <span className="font-mono text-xs font-medium uppercase tracking-[0.16rem] text-zinc-500">auth.session</span>
              </div>
              <div className="px-3 py-8 sm:px-6 sm:py-10">{children}</div>
            </div>
          </Reveal>
        </div>
      </main>
    </div>
  );
}
