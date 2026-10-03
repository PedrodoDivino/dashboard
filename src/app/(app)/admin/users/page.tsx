import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { listRoles, listUsers, requireUser } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Frame, PageHeader } from "@/components/ui/frame";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { UsersManager } from "./users-manager";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("users") };
}

export default async function AdminUsersPage() {
  const user = await requireUser();
  const t = await getTranslations("users");

  // Camada visual; a proteção real é a RLS no banco.
  if (!user.permissions.includes("users.read")) {
    return (
      <Reveal>
        <Frame corners="orange" className="mx-auto mt-10 max-w-lg p-8 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-xl border border-[#FF6400]/20 bg-[#FF6400]/10">
            <Icon name="solar:lock-keyhole-linear" className="text-3xl text-[#FFA500]" />
          </span>
          <h1 className="mt-6 text-3xl font-medium tracking-tight">{t("denied.title")}</h1>
          <p className="mt-3 text-base leading-7 text-zinc-400">{t("denied.body")}</p>
          <Button href="/home" variant="secondary" icon="solar:arrow-left-linear" iconMotion="none" accentIcon className="mt-8">
            {t("denied.back")}
          </Button>
        </Frame>
      </Reveal>
    );
  }

  const [users, roles] = await Promise.all([listUsers(), listRoles()]);

  return (
    <>
      <Reveal>
        <PageHeader eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />
      </Reveal>
      <Reveal delay={0.05}>
        <UsersManager
          users={users}
          roles={roles}
          currentUserId={user.id}
          can={{
            invite: user.permissions.includes("users.invite"),
            updateRole: user.permissions.includes("users.update_role"),
            disable: user.permissions.includes("users.disable"),
          }}
        />
      </Reveal>
    </>
  );
}
