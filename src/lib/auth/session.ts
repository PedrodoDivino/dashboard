import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isLocale } from "@/i18n/config";
import type { Database } from "@/lib/database.types";
import type { NotificationPreferences, Permission, Profile, RoleSummary, SessionUser } from "@/lib/types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"] & {
  role: { id: number; key: string; name: string } | null;
};

const PROFILE_SELECT = "*, role:roles!profiles_role_id_fkey(id, key, name)";

export function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    role: row.role ?? { id: row.role_id, key: "user", name: "" },
    status: row.status,
    jobTitle: row.job_title,
    phone: row.phone,
    bio: row.bio,
    timezone: row.timezone,
    locale: isLocale(row.locale) ? row.locale : "pt",
    createdAt: row.created_at,
    lastSignInAt: row.last_sign_in_at,
  };
}

export type CurrentUserResult =
  | { status: "signed-out" }
  | { status: "disabled" }
  | { status: "ok"; user: SessionUser };

/**
 * Usuário logado (validado pelo Supabase Auth) + profile + permissões.
 * `cache` evita consultas repetidas na mesma requisição (layout + página).
 */
export const getCurrentUser = cache(async (): Promise<CurrentUserResult> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return { status: "signed-out" };

  const [{ data: row }, { data: permissions }] = await Promise.all([
    supabase.from("profiles").select(PROFILE_SELECT).eq("id", userId).single<ProfileRow>(),
    supabase.rpc("my_permissions"),
  ]);

  if (!row) return { status: "signed-out" };
  if (row.status === "disabled") return { status: "disabled" };

  return {
    status: "ok",
    user: { ...toProfile(row), permissions: (permissions ?? []) as Permission[] },
  };
});

/** Atalho para páginas dentro do layout do app (que já garante o login). */
export async function requireUser(): Promise<SessionUser> {
  const result = await getCurrentUser();
  if (result.status !== "ok") throw new Error("Sessão ausente — o layout do app deveria ter redirecionado.");
  return result.user;
}

export async function listUsers(): Promise<Profile[]> {
  // RLS: só retorna todos para quem tem `users.read`.
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select(PROFILE_SELECT).order("created_at").returns<ProfileRow[]>();
  return (data ?? []).map(toProfile);
}

export async function listRoles(): Promise<RoleSummary[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("roles").select("id, key, name").order("id");
  return data ?? [];
}

export async function getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
  const supabase = await createClient();
  const { data } = await supabase.from("notification_preferences").select("*").eq("user_id", userId).single();
  return {
    securityAlerts: data?.security_alerts ?? true,
    productNews: data?.product_news ?? false,
    weeklySummary: data?.weekly_summary ?? true,
    teamActivity: data?.team_activity ?? true,
  };
}

export interface ActivityItem {
  id: number;
  action: string;
  actorId: string | null;
  actorName: string;
  targetEmail: string | null;
  createdAt: string;
}

export async function listActivity(limit = 6): Promise<ActivityItem[]> {
  // RLS: o próprio usuário vê só os seus eventos; com `audit.read_all`, os de todos.
  const supabase = await createClient();
  const { data } = await supabase
    .from("audit_log")
    .select("id, action, actor_id, target_email, created_at, actor:profiles!audit_log_actor_id_fkey(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<
      Array<{
        id: number;
        action: string;
        actor_id: string | null;
        target_email: string | null;
        created_at: string;
        actor: { full_name: string; email: string } | null;
      }>
    >();

  return (data ?? []).map((a) => ({
    id: a.id,
    action: a.action,
    actorId: a.actor_id,
    actorName: a.actor?.full_name || a.actor?.email || "—",
    targetEmail: a.target_email,
    createdAt: a.created_at,
  }));
}
