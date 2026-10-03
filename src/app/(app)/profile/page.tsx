import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { requireUser } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/frame";
import { Reveal } from "@/components/ui/reveal";
import { ProfileForm } from "./profile-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("profile") };
}

export default async function ProfilePage() {
  const user = await requireUser();
  const t = await getTranslations("profile");

  return (
    <>
      <Reveal>
        <PageHeader eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />
      </Reveal>
      <Reveal delay={0.05}>
        <ProfileForm key={user.id} user={user} />
      </Reveal>
    </>
  );
}
