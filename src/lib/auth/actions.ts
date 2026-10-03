"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isLocale, LOCALE_COOKIE } from "@/i18n/config";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ActionResult, EditableProfile, NotificationPreferences, UserStatus } from "@/lib/types";
import { getCurrentUser } from "./session";

const YEAR = 60 * 60 * 24 * 365;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const ok = (): ActionResult => ({ ok: true });
const fail = (error: string): ActionResult => ({ ok: false, error });

type Supabase = Awaited<ReturnType<typeof createClient>>;

/** Registra no audit_log em nome do usuário logado (falha silenciosa: auditoria não bloqueia a ação). */
async function logEvent(supabase: Supabase, action: string, target?: { id?: string; email?: string }) {
  await supabase.rpc("log_event", {
    p_action: action,
    p_target_id: target?.id,
    p_target_email: target?.email,
  });
}

async function setLocaleCookie(locale: string) {
  if (isLocale(locale)) (await cookies()).set(LOCALE_COOKIE, locale, { path: "/", maxAge: YEAR });
}

// ───────────────────────── Acesso ─────────────────────────

export interface SignInState {
  error?: string;
}

export async function signIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!EMAIL_RE.test(email) || !password) return { error: "invalidCredentials" };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: "invalidCredentials" };

  const { data: profile } = await supabase.from("profiles").select("status, locale").eq("id", data.user.id).single();
  if (!profile || profile.status === "disabled") {
    await supabase.auth.signOut();
    return { error: "accountDisabled" };
  }

  await setLocaleCookie(profile.locale);
  await logEvent(supabase, "sign_in");
  redirect("/home");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/** Envia o e-mail de redefinição. Sempre responde ok para não revelar quais e-mails existem. */
export async function requestPasswordReset(email: string): Promise<ActionResult> {
  if (!EMAIL_RE.test(email)) return fail("invalidEmail");
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${siteUrl()}/auth/confirm?next=/reset-password`,
  });
  return ok();
}

/** Define a nova senha usando a sessão aberta pelo link do e-mail (reset ou convite). */
export async function updatePassword(password: string): Promise<ActionResult> {
  if (password.length < 8) return fail("tooShort");
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) return fail("linkExpired");

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return fail(error.code === "same_password" ? "samePassword" : "generic");
  await logEvent(supabase, "password_reset");
  return ok();
}

// ───────────────────────── Conta (usuário logado) ─────────────────────────

export async function changePassword(current: string, next: string): Promise<ActionResult> {
  if (next.length < 8) return fail("tooShort");
  const me = await getCurrentUser();
  if (me.status !== "ok") return fail("signedOut");

  const supabase = await createClient();
  // Confere a senha atual antes de trocar.
  const { error: wrong } = await supabase.auth.signInWithPassword({ email: me.user.email, password: current });
  if (wrong) return fail("wrongPassword");

  const { error } = await supabase.auth.updateUser({ password: next });
  if (error) return fail(error.code === "same_password" ? "samePassword" : "generic");
  await logEvent(supabase, "password_reset");
  return ok();
}

export async function changeEmail(email: string): Promise<ActionResult> {
  if (!EMAIL_RE.test(email)) return fail("invalidEmail");
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser(
    { email: email.trim() },
    { emailRedirectTo: `${siteUrl()}/auth/confirm?next=/settings` },
  );
  return error ? fail(error.code === "email_exists" ? "emailExists" : "generic") : ok();
}

export async function updateProfile(profile: EditableProfile): Promise<ActionResult> {
  const me = await getCurrentUser();
  if (me.status !== "ok") return fail("signedOut");
  if (!profile.fullName.trim()) return fail("required");

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: profile.fullName.trim(),
      job_title: profile.jobTitle.trim(),
      phone: profile.phone.trim(),
      bio: profile.bio.trim(),
      timezone: profile.timezone,
    })
    .eq("id", me.user.id);
  if (error) return fail("generic");

  await logEvent(supabase, "profile_update");
  revalidatePath("/", "layout");
  return ok();
}

/** Salva a URL do avatar (o upload em si é feito no navegador, direto no Storage). */
export async function updateAvatar(avatarUrl: string | null): Promise<ActionResult> {
  const me = await getCurrentUser();
  if (me.status !== "ok") return fail("signedOut");
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", me.user.id);
  if (error) return fail("generic");
  revalidatePath("/", "layout");
  return ok();
}

export async function updatePreferences(prefs: { locale: string; timezone: string }): Promise<ActionResult> {
  const me = await getCurrentUser();
  if (me.status !== "ok") return fail("signedOut");
  if (!isLocale(prefs.locale)) return fail("generic");

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ locale: prefs.locale, timezone: prefs.timezone })
    .eq("id", me.user.id);
  if (error) return fail("generic");

  await setLocaleCookie(prefs.locale);
  revalidatePath("/", "layout");
  return ok();
}

export async function updateNotificationPreferences(prefs: NotificationPreferences): Promise<ActionResult> {
  const me = await getCurrentUser();
  if (me.status !== "ok") return fail("signedOut");
  const supabase = await createClient();
  const { error } = await supabase
    .from("notification_preferences")
    .update({
      security_alerts: prefs.securityAlerts,
      product_news: prefs.productNews,
      weekly_summary: prefs.weeklySummary,
      team_activity: prefs.teamActivity,
    })
    .eq("user_id", me.user.id);
  return error ? fail("generic") : ok();
}

/** Troca de idioma pelo seletor PT/EN: cookie + profile (se logado). */
export async function setLocale(locale: string): Promise<void> {
  if (!isLocale(locale)) return;
  await setLocaleCookie(locale);
  const me = await getCurrentUser();
  if (me.status === "ok") {
    const supabase = await createClient();
    await supabase.from("profiles").update({ locale }).eq("id", me.user.id);
  }
  revalidatePath("/", "layout");
}

// ───────────────────────── Administração de usuários ─────────────────────────

/** Cadastra um usuário já ativo, com e-mail e senha definidos pelo admin (sem e-mail de confirmação). */
export async function createUser(email: string, password: string, roleId: number): Promise<ActionResult> {
  const normalized = email.trim().toLowerCase();
  if (!EMAIL_RE.test(normalized)) return fail("invalidEmail");
  if (password.length < 8) return fail("tooShort");

  const me = await getCurrentUser();
  if (me.status !== "ok" || !me.user.permissions.includes("users.invite")) return fail("forbidden");

  const admin = createAdminClient();
  if (!admin) return fail("missingSecretKey");

  const supabase = await createClient();
  // 1) Registra o papel escolhido (RLS exige users.invite). O trigger handle_new_user lê o papel daqui.
  const { error: inviteRowError } = await supabase
    .from("invitations")
    .insert({ email: normalized, role_id: roleId, invited_by: me.user.id });
  if (inviteRowError) return fail(inviteRowError.code === "23505" ? "alreadyInvited" : "generic");

  // 2) Cria o usuário no Auth já confirmado; o profile nasce com status "active".
  const { data, error } = await admin.auth.admin.createUser({ email: normalized, password, email_confirm: true });
  if (error) {
    await supabase.from("invitations").update({ status: "revoked" }).eq("email", normalized).eq("status", "pending");
    if (error.code === "email_exists") return fail("emailExists");
    if (error.code === "weak_password") return fail("weakPassword");
    return fail("generic");
  }

  await supabase
    .from("invitations")
    .update({ status: "accepted", accepted_at: new Date().toISOString() })
    .eq("email", normalized)
    .eq("status", "pending");
  await logEvent(supabase, "user_create", { id: data.user.id, email: normalized });
  revalidatePath("/admin/users");
  return ok();
}

/** Reenvia o acesso a um convidado (link para definir a senha). */
export async function resendInvite(email: string): Promise<ActionResult> {
  const me = await getCurrentUser();
  if (me.status !== "ok" || !me.user.permissions.includes("users.invite")) return fail("forbidden");
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl()}/auth/confirm?next=/reset-password`,
  });
  return error ? fail("generic") : ok();
}

export async function updateUserRole(userId: string, roleId: number): Promise<ActionResult> {
  const supabase = await createClient();
  // RLS + trigger protect_profile_columns validam users.update_role e bloqueiam o próprio papel.
  const { data, error } = await supabase.from("profiles").update({ role_id: roleId }).eq("id", userId).select("email");
  if (error || !data?.length) return fail("forbidden");
  await logEvent(supabase, "role_change", { id: userId, email: data[0].email });
  revalidatePath("/admin/users");
  return ok();
}

export async function setUserStatus(userId: string, status: Extract<UserStatus, "active" | "disabled">): Promise<ActionResult> {
  const supabase = await createClient();
  // RLS + trigger validam users.disable e bloqueiam alterar o próprio status.
  const { data, error } = await supabase.from("profiles").update({ status }).eq("id", userId).select("email");
  if (error || !data?.length) return fail("forbidden");
  await logEvent(supabase, status === "disabled" ? "user_disable" : "user_enable", { id: userId, email: data[0].email });
  revalidatePath("/admin/users");
  return ok();
}
