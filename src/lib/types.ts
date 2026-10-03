import type { Locale } from "@/i18n/config";
import type { Database } from "@/lib/database.types";

export type UserStatus = Database["public"]["Enums"]["user_status"];

/** Permissões definidas na tabela `permissions` (seed em 01_roles_permissions). */
export type Permission =
  | "dashboard.platform_metrics"
  | "users.read"
  | "users.invite"
  | "users.update_role"
  | "users.disable"
  | "roles.manage"
  | "audit.read_all";

export interface RoleSummary {
  id: number;
  key: string;
  name: string;
}

/** Linha de `public.profiles` + papel, no formato usado pela interface. */
export interface Profile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  role: RoleSummary;
  status: UserStatus;
  jobTitle: string;
  phone: string;
  bio: string;
  timezone: string;
  locale: Locale;
  createdAt: string;
  lastSignInAt: string | null;
}

/** Usuário logado: profile + permissões do papel. */
export interface SessionUser extends Profile {
  permissions: Permission[];
}

export type EditableProfile = Pick<Profile, "fullName" | "jobTitle" | "phone" | "bio" | "timezone">;

export interface NotificationPreferences {
  securityAlerts: boolean;
  productNews: boolean;
  weeklySummary: boolean;
  teamActivity: boolean;
}

/** `error` é uma chave de tradução em `errors.*`. */
export type ActionResult = { ok: true } | { ok: false; error: string };
