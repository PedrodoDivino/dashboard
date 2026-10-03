import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getNotificationPreferences, requireUser } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/frame";
import { Reveal } from "@/components/ui/reveal";
import { SettingsTabs, type SettingsTab } from "./settings-tabs";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("settings") };
}

const tabs: SettingsTab[] = ["account", "security", "notifications"];

export default async function SettingsPage({ searchParams }: PageProps<"/settings">) {
  const user = await requireUser();
  const notifications = await getNotificationPreferences(user.id);
  const t = await getTranslations("settings");
  const requested = (await searchParams).tab;
  const initialTab = tabs.find((tab) => tab === requested) ?? "account";

  return (
    <>
      <Reveal>
        <PageHeader eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />
      </Reveal>
      <Reveal delay={0.05}>
        <SettingsTabs key={user.id} user={user} notifications={notifications} initialTab={initialTab} />
      </Reveal>
    </>
  );
}
