"use client";

import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  changeEmail,
  changePassword,
  updateNotificationPreferences,
  updatePreferences,
} from "@/lib/auth/actions";
import type { NotificationPreferences, Profile } from "@/lib/types";
import { timezones } from "@/lib/timezones";
import { locales } from "@/i18n/config";
import { PasswordFields, validateNewPassword } from "@/components/auth/password-fields";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Frame, Eyebrow } from "@/components/ui/frame";
import { Icon } from "@/components/ui/icon";
import { Notice } from "@/components/ui/notice";
import { Switch } from "@/components/ui/switch";
import { Tabs } from "@/components/ui/tabs";

export type SettingsTab = "account" | "security" | "notifications";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const localeNames = { pt: "Português (Brasil)", en: "English" } as const;

type Feedback = { tone: "success" | "error"; text: string } | null;

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="grid gap-6 border-t border-white/10 py-8 first:border-t-0 first:pt-0 last:pb-0 xl:grid-cols-[0.8fr_1.2fr]">
      <div>
        <h2 className="text-xl font-medium tracking-tight">{title}</h2>
        {description && <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>}
      </div>
      <div>{children}</div>
    </section>
  );
}

function FeedbackRow({ feedback, children }: { feedback: Feedback; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div aria-live="polite">{feedback && <Notice tone={feedback.tone}>{feedback.text}</Notice>}</div>
      {children}
    </div>
  );
}

function AccountTab({ user }: { user: Profile }) {
  const t = useTranslations("settings.account");
  const tc = useTranslations("common");
  const te = useTranslations("errors");

  const [newEmail, setNewEmail] = useState("");
  const [emailError, setEmailError] = useState<string>();
  const [emailFeedback, setEmailFeedback] = useState<Feedback>(null);
  const [emailPending, startEmail] = useTransition();

  const [language, setLanguage] = useState<string>(user.locale);
  const [timezone, setTimezone] = useState(user.timezone);
  const [prefsFeedback, setPrefsFeedback] = useState<Feedback>(null);
  const [prefsPending, startPrefs] = useTransition();

  function onEmail(event: FormEvent) {
    event.preventDefault();
    const email = newEmail.trim();
    if (!EMAIL_RE.test(email)) {
      setEmailError(te("invalidEmail"));
      return;
    }
    setEmailError(undefined);
    startEmail(async () => {
      const result = await changeEmail(email);
      if (result.ok) {
        setEmailFeedback({ tone: "success", text: t("emailSent", { email }) });
        setNewEmail("");
      } else {
        setEmailFeedback({ tone: "error", text: te(result.error) });
      }
    });
  }

  function onPrefs(event: FormEvent) {
    event.preventDefault();
    startPrefs(async () => {
      const result = await updatePreferences({ locale: language, timezone });
      setPrefsFeedback(result.ok ? { tone: "success", text: tc("saved") } : { tone: "error", text: te(result.error) });
    });
  }

  return (
    <>
      <Section title={t("emailTitle")} description={t("emailBody")}>
        <form onSubmit={onEmail} noValidate className="space-y-4">
          <Field label={t("newEmail")} htmlFor="new-email" hint={t("currentEmail", { email: user.email })} error={emailError}>
            <Input
              id="new-email"
              type="email"
              autoComplete="email"
              value={newEmail}
              invalid={!!emailError}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </Field>
          <FeedbackRow feedback={emailFeedback}>
            <Button type="submit" variant="secondary" icon="solar:letter-linear" iconMotion="none" accentIcon disabled={emailPending}>
              {t("changeEmail")}
            </Button>
          </FeedbackRow>
        </form>
      </Section>

      <Section title={t("prefsTitle")}>
        <form onSubmit={onPrefs} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("language")} htmlFor="language">
              <Select id="language" value={language} onChange={(e) => { setLanguage(e.target.value); setPrefsFeedback(null); }}>
                {locales.map((l) => (
                  <option key={l} value={l}>
                    {localeNames[l]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t("timezone")} htmlFor="timezone">
              <Select id="timezone" value={timezone} onChange={(e) => { setTimezone(e.target.value); setPrefsFeedback(null); }}>
                {timezones.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz.replace("_", " ")}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <FeedbackRow feedback={prefsFeedback}>
            <Button type="submit" variant="submit" icon="solar:diskette-linear" iconMotion="none" disabled={prefsPending}>
              {prefsPending ? tc("saving") : tc("save")}
            </Button>
          </FeedbackRow>
        </form>
      </Section>
    </>
  );
}

function SecurityTab() {
  const t = useTranslations("settings.security");
  const tv = useTranslations("validation");
  const te = useTranslations("errors");
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [currentError, setCurrentError] = useState<string>();
  const [errors, setErrors] = useState<ReturnType<typeof validateNewPassword>>({});
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [pending, startTransition] = useTransition();

  function onPassword(event: FormEvent) {
    event.preventDefault();
    const next = validateNewPassword(password, confirm);
    setErrors(next);
    setCurrentError(current ? undefined : tv("required"));
    if (!current || next.password || next.confirm) return;
    startTransition(async () => {
      const result = await changePassword(current, password);
      if (result.ok) {
        setFeedback({ tone: "success", text: t("updated") });
        setCurrent("");
        setPassword("");
        setConfirm("");
      } else {
        setFeedback({ tone: "error", text: te(result.error) });
      }
    });
  }

  return (
    <>
      <Section title={t("passwordTitle")}>
        <form onSubmit={onPassword} noValidate className="space-y-4">
          <Field label={t("current")} htmlFor="current-password" error={currentError}>
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={current}
              invalid={!!currentError}
              onChange={(e) => { setCurrent(e.target.value); setFeedback(null); }}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <PasswordFields
              password={password}
              confirm={confirm}
              onPassword={(v) => { setPassword(v); setFeedback(null); }}
              onConfirm={(v) => { setConfirm(v); setFeedback(null); }}
              errors={errors}
              labels={{ password: t("new"), confirm: t("confirm") }}
            />
          </div>
          <FeedbackRow feedback={feedback}>
            <Button type="submit" variant="submit" icon="solar:lock-keyhole-linear" iconMotion="none" disabled={pending}>
              {t("submit")}
            </Button>
          </FeedbackRow>
        </form>
      </Section>

      <Section title={t("sessionsTitle")} description={t("sessionsBody")}>
        {/* Sessões em outros dispositivos: supabase.auth.signOut({ scope: "others" }) quando houver a lista. */}
        <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-md border border-white/10 bg-[#120B07]">
            <Icon name="solar:monitor-linear" className="text-xl text-[#FFA500]" />
          </span>
          <p className="min-w-0 flex-1 truncate text-sm font-medium text-white">{t("thisBrowser")}</p>
          <Badge tone="orange" dot>{t("current_session")}</Badge>
        </div>
      </Section>
    </>
  );
}

const notificationKeys = [
  { key: "securityAlerts", label: "security" },
  { key: "productNews", label: "product" },
  { key: "weeklySummary", label: "weekly" },
  { key: "teamActivity", label: "mentions" },
] as const;

function NotificationsTab({ initial }: { initial: NotificationPreferences }) {
  const t = useTranslations("settings.notifications");
  const tc = useTranslations("common");
  const te = useTranslations("errors");
  const [prefs, setPrefs] = useState(initial);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [pending, startTransition] = useTransition();

  function onSave() {
    startTransition(async () => {
      const result = await updateNotificationPreferences(prefs);
      setFeedback(result.ok ? { tone: "success", text: tc("saved") } : { tone: "error", text: te(result.error) });
    });
  }

  return (
    <Section title={t("title")}>
      <ul className="divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10 bg-[#090909]">
        {notificationKeys.map(({ key, label }) => (
          <li key={key} className="flex items-center justify-between gap-4 p-4 transition-all duration-300 hover:bg-[#FF6400]/[0.06]">
            <label htmlFor={`notif-${key}`} className="cursor-pointer">
              <span className="block text-base font-medium">{t(label)}</span>
              <span className="mt-1 block text-sm leading-6 text-zinc-400">{t(`${label}Hint`)}</span>
            </label>
            <Switch
              id={`notif-${key}`}
              label={t(label)}
              checked={prefs[key]}
              onChange={(checked) => { setPrefs((p) => ({ ...p, [key]: checked })); setFeedback(null); }}
            />
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <FeedbackRow feedback={feedback}>
          <Button variant="submit" icon="solar:diskette-linear" iconMotion="none" disabled={pending} onClick={onSave}>
            {pending ? tc("saving") : tc("save")}
          </Button>
        </FeedbackRow>
      </div>
    </Section>
  );
}

export function SettingsTabs({
  user,
  notifications,
  initialTab,
}: {
  user: Profile;
  notifications: NotificationPreferences;
  initialTab: SettingsTab;
}) {
  const t = useTranslations("settings");
  const [tab, setTab] = useState<SettingsTab>(initialTab);

  function change(next: SettingsTab) {
    setTab(next);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", next);
    window.history.replaceState(null, "", url);
  }

  return (
    <div className="space-y-6">
      <Tabs
        label={t("title")}
        value={tab}
        onChange={change}
        items={[
          { value: "account", label: t("tabs.account"), icon: "solar:user-id-linear" },
          { value: "security", label: t("tabs.security"), icon: "solar:shield-keyhole-linear" },
          { value: "notifications", label: t("tabs.notifications"), icon: "solar:bell-linear" },
        ]}
      />
      <Frame corners={tab === "security" ? "orange" : "neutral"} className="p-6 sm:p-8" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        <Eyebrow className="mb-6">{t(`tabs.${tab}`)}</Eyebrow>
        {tab === "account" && <AccountTab user={user} />}
        {tab === "security" && <SecurityTab />}
        {tab === "notifications" && <NotificationsTab initial={notifications} />}
      </Frame>
    </div>
  );
}
