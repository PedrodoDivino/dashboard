"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useFormatter, useTranslations } from "next-intl";
import { createUser, resendInvite, setUserStatus, updateUserRole } from "@/lib/auth/actions";
import type { ActionResult, Profile, RoleSummary, UserStatus } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Frame, Eyebrow } from "@/components/ui/frame";
import { Icon } from "@/components/ui/icon";
import { Notice } from "@/components/ui/notice";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const statusTone: Record<UserStatus, "orange" | "amber" | "muted"> = {
  active: "orange",
  invited: "amber",
  disabled: "muted",
};

interface Can {
  invite: boolean;
  updateRole: boolean;
  disable: boolean;
}

type Feedback = { tone: "success" | "error"; text: string } | null;

export function UsersManager({
  users,
  roles,
  currentUserId,
  can,
}: {
  users: Profile[];
  roles: RoleSummary[];
  currentUserId: string;
  can: Can;
}) {
  const t = useTranslations("users");
  const te = useTranslations("errors");
  const tc = useTranslations("common");
  const format = useFormatter();
  const router = useRouter();

  const defaultRoleId = roles.find((r) => r.key === "user")?.id ?? roles[0]?.id ?? 0;
  const [query, setQuery] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePassword, setInvitePassword] = useState("");
  const [passwordError, setPasswordError] = useState<string>();
  const [inviteRole, setInviteRole] = useState<number>(defaultRoleId);
  const [inviteError, setInviteError] = useState<string>();
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, query]);

  /** Executa uma ação no servidor e atualiza a lista. */
  function run(action: () => Promise<ActionResult>, successText?: string) {
    setFeedback(null);
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        if (successText) setFeedback({ tone: "success", text: successText });
        router.refresh();
      } else {
        setFeedback({ tone: "error", text: te(result.error) });
      }
    });
  }

  function onInvite(event: FormEvent) {
    event.preventDefault();
    const email = inviteEmail.trim().toLowerCase();
    const emailError = EMAIL_RE.test(email) ? undefined : te("invalidEmail");
    const pwError = invitePassword.length >= 8 ? undefined : te("tooShort");
    setInviteError(emailError);
    setPasswordError(pwError);
    if (emailError || pwError) return;
    setFeedback(null);
    startTransition(async () => {
      const result = await createUser(email, invitePassword, inviteRole);
      if (!result.ok) {
        if (result.error === "tooShort" || result.error === "weakPassword") setPasswordError(te(result.error));
        else setInviteError(te(result.error));
        return;
      }
      setFeedback({ tone: "success", text: t("invited", { email }) });
      setInviteEmail("");
      setInvitePassword("");
      setInviteRole(defaultRoleId);
      setInviteOpen(false);
      router.refresh();
    });
  }

  const roleSelect = (u: Profile, self: boolean, className: string) => (
    <Select
      aria-label={t("columns.role")}
      value={u.role.id}
      disabled={self || !can.updateRole || pending}
      onChange={(e) => run(() => updateUserRole(u.id, Number(e.target.value)))}
      className={className}
    >
      {roles.map((r) => (
        <option key={r.id} value={r.id}>
          {r.name}
        </option>
      ))}
    </Select>
  );

  const rowActions = (u: Profile, self: boolean) => (
    <RowActions
      user={u}
      self={self}
      can={can}
      pending={pending}
      onResend={() => run(() => resendInvite(u.email), t("resent", { email: u.email }))}
      onStatus={(status) => run(() => setUserStatus(u.id, status))}
    />
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Icon name="solar:minimalistic-magnifer-linear" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[#FFA500]" />
          <Input aria-label={t("search")} placeholder={t("search")} value={query} onChange={(e) => setQuery(e.target.value)} className="pl-11" />
        </div>
        {can.invite && (
          <Button icon="solar:user-plus-linear" iconMotion="rotate" onClick={() => { setInviteOpen((v) => !v); setFeedback(null); }} aria-expanded={inviteOpen}>
            {t("invite")}
          </Button>
        )}
      </div>

      {feedback && <Notice tone={feedback.tone}>{feedback.text}</Notice>}

      {inviteOpen && (
        <Frame corners="orange" className="p-6">
          <form onSubmit={onInvite} noValidate>
            <Eyebrow>{t("inviteTitle")}</Eyebrow>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{t("inviteBody")}</p>
            <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr_12rem]">
              <Field label={t("inviteEmail")} htmlFor="invite-email" error={inviteError}>
                <Input
                  id="invite-email"
                  type="email"
                  autoFocus
                  autoComplete="off"
                  placeholder={t("invitePlaceholder")}
                  value={inviteEmail}
                  invalid={!!inviteError}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </Field>
              <Field label={t("invitePassword")} htmlFor="invite-password" error={passwordError}>
                <Input
                  id="invite-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder={t("invitePasswordPlaceholder")}
                  value={invitePassword}
                  invalid={!!passwordError}
                  onChange={(e) => setInvitePassword(e.target.value)}
                />
              </Field>
              <Field label={t("inviteRole")} htmlFor="invite-role">
                <Select id="invite-role" value={inviteRole} onChange={(e) => setInviteRole(Number(e.target.value))}>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => { setInviteOpen(false); setInvitePassword(""); }}>
                {tc("cancel")}
              </Button>
              <Button type="submit" variant="submit" icon="solar:user-plus-linear" iconMotion="rotate" disabled={pending}>
                {t("sendInvite")}
              </Button>
            </div>
          </form>
        </Frame>
      )}

      <Frame corners="neutral" className={cn("overflow-hidden p-0 sm:p-0", pending && "opacity-80")}>
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <span className="font-mono text-xs uppercase tracking-[0.16rem] text-zinc-500">{t("count", { count: filtered.length })}</span>
        </div>

        {filtered.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-zinc-500">{users.length === 0 ? t("emptyAll") : t("empty")}</p>
        ) : (
          <>
            {/* Tabela (xl+) */}
            <div className="nx-scroll hidden overflow-x-auto xl:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-[#090909]">
                    {(["user", "role", "status", "lastSignIn", "actions"] as const).map((col) => (
                      <th
                        key={col}
                        scope="col"
                        className={cn("px-5 py-3 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.12rem] text-zinc-500", col === "actions" && "text-right")}
                      >
                        {t(`columns.${col}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => {
                    const self = u.id === currentUserId;
                    return (
                      <tr key={u.id} className={cn("border-b border-white/[0.06] transition-colors duration-300 last:border-0 hover:bg-[#FF6400]/[0.06]", u.status === "disabled" && "opacity-60")}>
                        <td className="px-5 py-4">
                          <UserCell user={u} self={self} selfLabel={t("self")} />
                        </td>
                        <td className="px-5 py-4">{roleSelect(u, self, "w-40 py-2")}</td>
                        <td className="px-5 py-4">
                          <Badge tone={statusTone[u.status]} dot>
                            {t(`status.${u.status}`)}
                          </Badge>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-zinc-400">
                          {u.lastSignInAt ? format.dateTime(new Date(u.lastSignInAt), { dateStyle: "medium" }) : tc("never")}
                        </td>
                        <td className="px-5 py-4 text-right">{rowActions(u, self)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Cards (abaixo de xl) */}
            <ul className="divide-y divide-white/10 xl:hidden">
              {filtered.map((u) => {
                const self = u.id === currentUserId;
                return (
                  <li key={u.id} className={cn("space-y-4 p-5", u.status === "disabled" && "opacity-60")}>
                    <div className="flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <UserCell user={u} self={self} selfLabel={t("self")} />
                      </div>
                      <Badge tone={statusTone[u.status]} dot>
                        {t(`status.${u.status}`)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      {roleSelect(u, self, "py-2")}
                      {rowActions(u, self)}
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </Frame>
    </div>
  );
}

function UserCell({ user, self, selfLabel }: { user: Profile; self: boolean; selfLabel: string }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar src={user.avatarUrl} name={user.fullName || user.email} size="sm" />
      <div className="min-w-0">
        <p className="truncate font-medium text-white">
          {user.fullName || user.email}
          {self && <span className="ml-2 font-mono text-[0.6875rem] text-[#FFA500]">({selfLabel})</span>}
        </p>
        {user.fullName && <p className="truncate font-mono text-xs text-zinc-500">{user.email}</p>}
      </div>
    </div>
  );
}

function RowActions({
  user,
  self,
  can,
  pending,
  onResend,
  onStatus,
}: {
  user: Profile;
  self: boolean;
  can: Can;
  pending: boolean;
  onResend: () => void;
  onStatus: (status: "active" | "disabled") => void;
}) {
  const t = useTranslations("users");
  if (self) return null;

  const base =
    "inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 font-mono text-xs font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:pointer-events-none disabled:opacity-50";

  return (
    <div className="flex justify-end gap-2">
      {user.status === "invited" && can.invite && (
        <button type="button" disabled={pending} onClick={onResend} className={cn(base, "border-white/10 bg-white/[0.04] text-zinc-300 hover:border-white/20 hover:bg-white/[0.08] hover:text-white")}>
          <Icon name="solar:letter-linear" className="text-sm text-[#FFA500]" />
          {t("resend")}
        </button>
      )}
      {can.disable &&
        (user.status === "disabled" ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => onStatus("active")}
            className={cn(base, "border-[#FF6400]/30 bg-[#FF6400]/10 text-orange-100 hover:bg-[#FF6400]/15")}
          >
            {t("enable")}
          </button>
        ) : (
          <button
            type="button"
            disabled={pending}
            onClick={() => onStatus("disabled")}
            className={cn(base, "border-white/10 bg-transparent text-zinc-400 hover:border-red-400/40 hover:bg-red-400/10 hover:text-red-200")}
          >
            {t("disable")}
          </button>
        ))}
    </div>
  );
}
