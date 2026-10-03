import type { Metadata } from "next";
import Link from "next/link";
import { getFormatter, getTranslations } from "next-intl/server";
import { listActivity, requireUser } from "@/lib/auth/session";
import { metricsByScope, seriesByScope, type Metric } from "@/lib/mock/dashboard";
import { Card, Eyebrow, Frame, MonoLabel, PageHeader } from "@/components/ui/frame";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/cn";
import { RequestsChart } from "./requests-chart";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("home") };
}

const metricIcons: Record<Metric["key"], string> = {
  activeUsers: "solar:users-group-rounded-linear",
  revenue: "solar:wallet-money-linear",
  requests: "solar:graph-up-linear",
  uptime: "solar:shield-check-linear",
  myRequests: "solar:graph-up-linear",
  planUsage: "solar:pie-chart-2-linear",
  savedViews: "solar:bookmark-linear",
  latency: "solar:bolt-linear",
};

// Ações registradas em public.audit_log → ícone.
const activityIcons: Record<string, string> = {
  sign_in: "solar:login-2-linear",
  invite: "solar:letter-linear",
  user_create: "solar:user-plus-linear",
  role_change: "solar:user-id-linear",
  password_reset: "solar:lock-keyhole-linear",
  profile_update: "solar:pen-linear",
  user_disable: "solar:user-block-linear",
  user_enable: "solar:user-check-linear",
};

export default async function HomePage() {
  const user = await requireUser();
  const t = await getTranslations("home");
  const tc = await getTranslations("common");
  const format = await getFormatter();

  const platform = user.permissions.includes("dashboard.platform_metrics");
  const scope = platform ? "platform" : "personal";
  const metrics = metricsByScope[scope];
  const series = seriesByScope[scope];
  const activity = await listActivity();
  const now = new Date();

  const formatMetric = (m: Metric) => {
    switch (m.format) {
      case "currency":
        return format.number(m.value, { style: "currency", currency: "BRL", notation: "compact", maximumFractionDigits: 1 });
      case "compact":
        return format.number(m.value, { notation: "compact", maximumFractionDigits: 1 });
      case "percent":
        return format.number(m.value, { style: "percent", maximumFractionDigits: 2 });
      case "ms":
        return `${format.number(m.value)} ms`;
      default:
        return format.number(m.value);
    }
  };

  const shortcuts = [
    { href: "/profile", label: t("shortcuts.profile"), icon: "solar:user-circle-linear" },
    { href: "/settings", label: t("shortcuts.settings"), icon: "solar:settings-linear" },
    { href: "/settings?tab=security", label: t("shortcuts.security"), icon: "solar:lock-keyhole-linear" },
    ...(user.permissions.includes("users.invite") ? [{ href: "/admin/users", label: t("shortcuts.users"), icon: "solar:user-plus-linear" }] : []),
  ];

  const firstName = user.fullName.trim().split(" ")[0];

  return (
    <>
      <Reveal>
        <PageHeader
          eyebrow={t("eyebrow")}
          title={firstName ? t("greeting", { name: firstName }) : t("greetingAnonymous")}
          subtitle={platform ? t("subtitleAdmin") : t("subtitleUser")}
        />
      </Reveal>

      <Reveal delay={0.05}>
        <div className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((m, i) => {
            const good = m.lowerIsBetter ? m.delta <= 0 : m.delta >= 0;
            const highlight = i === 0;
            return (
              <div
                key={m.key}
                className={cn(
                  "p-5 transition-all duration-300 sm:p-6",
                  highlight ? "bg-[#4D2915]/60 hover:bg-[#4D2915]/70" : "bg-[#090909] hover:bg-[#FF6400]/10",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <MonoLabel className={highlight ? "text-orange-100" : undefined}>{t(`metrics.${m.key}`)}</MonoLabel>
                  <Icon name={metricIcons[m.key]} className="text-xl text-[#FFA500]" />
                </div>
                <p className="mt-5 text-3xl font-medium tracking-tight sm:text-4xl">{formatMetric(m)}</p>
                <p className={cn("mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 font-mono text-xs", highlight ? "text-orange-100/70" : "text-zinc-500")}>
                  <span className={good ? "text-[#FFA500]" : "text-red-300"}>
                    {m.delta >= 0 ? "▲" : "▼"} {format.number(Math.abs(m.delta), { maximumFractionDigits: 2 })}%
                  </span>
                  {t("vsPrevious")}
                </p>
              </div>
            );
          })}
        </div>
      </Reveal>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Reveal delay={0.1}>
          <Frame corners="orange" className="h-full p-5 sm:p-6">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <Eyebrow>{t("chart.subtitle")}</Eyebrow>
                <h2 className="mt-3 text-2xl font-medium tracking-tight">
                  {platform ? t("chart.titleAdmin") : t("chart.titleUser")}
                </h2>
              </div>
              <p className="font-mono text-sm text-orange-100">
                {format.number(
                  series.reduce((sum, p) => sum + p.value, 0),
                  { notation: "compact", maximumFractionDigits: 1 },
                )}
              </p>
            </div>
            <RequestsChart data={series} />
          </Frame>
        </Reveal>

        <Reveal delay={0.15}>
          <Frame corners="neutral" className="h-full p-5 sm:p-6">
            <Eyebrow>{t("activity.title")}</Eyebrow>
            {activity.length === 0 && (
              <div className="mt-5 flex flex-col items-center gap-3 rounded-lg border border-dashed border-white/10 px-4 py-10 text-center">
                <Icon name="solar:history-linear" className="text-3xl text-zinc-600" />
                <p className="max-w-xs text-sm leading-6 text-zinc-500">{t("activity.empty")}</p>
              </div>
            )}
            <ul className="mt-5 space-y-2 empty:hidden">
              {activity.map((a) => (
                <li key={a.id} className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 transition-all duration-300 hover:border-[#FF6400]/30 hover:bg-[#FF6400]/10">
                  <span className="grid size-9 shrink-0 place-items-center rounded-md border border-[#FF6400]/20 bg-[#FF6400]/10">
                    <Icon name={activityIcons[a.action] ?? "solar:history-linear"} className="text-lg text-[#FFA500]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-6 text-zinc-300">
                      {t(`activity.${a.action}`, { actor: a.actorId === user.id ? tc("you") : a.actorName, target: a.targetEmail ?? "" })}
                    </p>
                    <p className="font-mono text-[0.6875rem] text-zinc-500">{format.relativeTime(new Date(a.createdAt), now)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Frame>
        </Reveal>
      </div>

      <Reveal delay={0.2} className="mt-6">
        <Eyebrow className="mb-4">{t("shortcuts.title")}</Eyebrow>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {shortcuts.map((s) => (
            <Link key={s.href} href={s.href} className="group">
              <Card variant="bento" interactive className="flex items-center justify-between gap-3 p-5">
                <span className="flex items-center gap-3">
                  <Icon name={s.icon} className="text-2xl text-[#FFA500]" />
                  <span className="text-lg font-medium tracking-tight">{s.label}</span>
                </span>
                <Icon name="solar:arrow-right-linear" className="text-base text-zinc-500 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[#FFA500]" />
              </Card>
            </Link>
          ))}
        </div>
      </Reveal>
    </>
  );
}
