"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { updateAvatar, updateProfile } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/client";
import type { EditableProfile, Profile } from "@/lib/types";
import { timezones } from "@/lib/timezones";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Frame, MonoLabel } from "@/components/ui/frame";
import { Notice } from "@/components/ui/notice";

export function ProfileForm({ user }: { user: Profile }) {
  const t = useTranslations("profile");
  const tc = useTranslations("common");
  const tv = useTranslations("validation");
  const te = useTranslations("errors");
  const format = useFormatter();

  const [values, setValues] = useState<EditableProfile>({
    fullName: user.fullName,
    jobTitle: user.jobTitle,
    phone: user.phone,
    bio: user.bio,
    timezone: user.timezone,
  });
  const [avatar, setAvatar] = useState<string | null>(user.avatarUrl);
  const [nameError, setNameError] = useState<string>();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string>();
  const [avatarError, setAvatarError] = useState<string>();
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof EditableProfile>(key: K, value: EditableProfile[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setSaved(false);
  }

  /** Envia a foto direto para o Storage (bucket avatars, pasta do próprio usuário) e salva a URL no profile. */
  async function onAvatar(file: File | undefined) {
    if (!file) return;
    setAvatarError(undefined);
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 2 * 1024 * 1024) {
      setAvatarError(te("invalidImage"));
      return;
    }
    setUploading(true);
    const supabase = createClient();
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { contentType: file.type });
    if (uploadError) {
      setUploading(false);
      setAvatarError(te("generic"));
      return;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const result = await updateAvatar(data.publicUrl);
    setUploading(false);
    if (result.ok) setAvatar(data.publicUrl);
    else setAvatarError(te(result.error));
  }

  async function onRemoveAvatar() {
    const result = await updateAvatar(null);
    if (result.ok) setAvatar(null);
    else setAvatarError(te(result.error));
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!values.fullName.trim()) {
      setNameError(tv("required"));
      return;
    }
    setNameError(undefined);
    startTransition(async () => {
      const result = await updateProfile({ ...values, fullName: values.fullName.trim() });
      setSaved(result.ok);
      setError(result.ok ? undefined : te(result.error));
    });
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <Frame corners="orange" className="h-fit p-6">
        <MonoLabel>{t("avatar")}</MonoLabel>
        <div className="mt-5 flex items-center gap-4">
          <Avatar src={avatar} name={values.fullName.trim() || user.email} size="lg" />
          <div className="flex flex-col items-start gap-2">
            <Button size="sm" variant="secondary" icon="solar:camera-linear" iconMotion="rotate" accentIcon disabled={uploading} onClick={() => fileRef.current?.click()}>
              {t("changeAvatar")}
            </Button>
            {avatar && (
              <button type="button" onClick={onRemoveAvatar} className="font-mono text-xs text-zinc-500 transition-colors hover:text-white">
                {t("removeAvatar")}
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              tabIndex={-1}
              aria-hidden
              onChange={(e) => onAvatar(e.target.files?.[0])}
            />
          </div>
        </div>
        {avatarError ? (
          <Notice tone="error" className="mt-4">{avatarError}</Notice>
        ) : (
          <p className="mt-4 text-xs leading-5 text-zinc-500">{uploading ? tc("saving") : t("avatarHint")}</p>
        )}

        <dl className="mt-6 grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10">
          <div className="flex items-center justify-between gap-3 bg-[#090909] px-4 py-3">
            <dt className="font-mono text-xs text-zinc-500">{t("role")}</dt>
            <dd>
              <Badge tone={user.role.key === "admin" ? "amber" : "neutral"}>{user.role.name}</Badge>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3 bg-[#090909] px-4 py-3">
            <dt className="font-mono text-xs text-zinc-500">{t("memberSince")}</dt>
            <dd className="text-sm text-zinc-300">{format.dateTime(new Date(user.createdAt), { dateStyle: "medium" })}</dd>
          </div>
          <div className="flex items-center justify-between gap-3 bg-[#090909] px-4 py-3">
            <dt className="font-mono text-xs text-zinc-500">{t("lastSignIn")}</dt>
            <dd className="text-sm text-zinc-300">
              {user.lastSignInAt ? format.dateTime(new Date(user.lastSignInAt), { dateStyle: "medium", timeStyle: "short" }) : tc("never")}
            </dd>
          </div>
        </dl>
      </Frame>

      <Frame corners="neutral" className="p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("fullName")} htmlFor="fullName" error={nameError}>
            <Input id="fullName" autoComplete="name" value={values.fullName} invalid={!!nameError} onChange={(e) => set("fullName", e.target.value)} />
          </Field>
          <Field label={t("email")} htmlFor="email" hint={t("emailHint")}>
            <Input id="email" type="email" value={user.email} placeholder={tc("noEmail")} readOnly />
          </Field>
          <Field label={t("jobTitle")} htmlFor="jobTitle">
            <Input id="jobTitle" autoComplete="organization-title" value={values.jobTitle} onChange={(e) => set("jobTitle", e.target.value)} />
          </Field>
          <Field label={t("phone")} htmlFor="phone">
            <Input id="phone" type="tel" autoComplete="tel" value={values.phone} onChange={(e) => set("phone", e.target.value)} />
          </Field>
          <Field label={t("timezone")} htmlFor="timezone" className="sm:col-span-2">
            <Select id="timezone" value={values.timezone} onChange={(e) => set("timezone", e.target.value)}>
              {timezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz.replace("_", " ")}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("bio")} htmlFor="bio" className="sm:col-span-2">
            <Textarea id="bio" rows={4} placeholder={t("bioPlaceholder")} value={values.bio} onChange={(e) => set("bio", e.target.value)} />
          </Field>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div aria-live="polite">{saved && <Notice>{tc("saved")}</Notice>}{error && <Notice tone="error">{error}</Notice>}</div>
          <Button type="submit" variant="submit" icon="solar:diskette-linear" iconMotion="none" disabled={pending}>
            {pending ? tc("saving") : tc("save")}
          </Button>
        </div>
      </Frame>
    </form>
  );
}
