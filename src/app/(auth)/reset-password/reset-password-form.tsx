"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { updatePassword } from "@/lib/auth/actions";
import { PasswordFields, validateNewPassword } from "@/components/auth/password-fields";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/frame";
import { Icon } from "@/components/ui/icon";
import { Notice } from "@/components/ui/notice";

export function ResetPasswordForm() {
  const t = useTranslations("auth.reset");
  const te = useTranslations("errors");
  const [serverError, setServerError] = useState<string>();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<ReturnType<typeof validateNewPassword>>({});
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next = validateNewPassword(password, confirm);
    setErrors(next);
    if (next.password || next.confirm) return;
    startTransition(async () => {
      const result = await updatePassword(password);
      if (result.ok) setDone(true);
      else setServerError(result.error);
    });
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md" aria-live="polite">
        <Eyebrow>{t("eyebrow")}</Eyebrow>
        <span className="mt-6 grid size-12 place-items-center rounded-xl border border-[#FF6400]/20 bg-[#FF6400]/10">
          <Icon name="solar:shield-check-linear" className="text-2xl text-[#FFA500]" />
        </span>
        <h2 className="mt-5 text-4xl font-medium leading-tight tracking-tight">{t("doneTitle")}</h2>
        <p className="mt-3 text-base leading-7 text-zinc-400">{t("doneBody")}</p>
        <Button href="/home" variant="submit" icon="solar:arrow-right-linear" className="mt-8 w-full">
          {t("goHome")}
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <Eyebrow>{t("eyebrow")}</Eyebrow>
      <h2 className="mt-4 text-4xl font-medium leading-tight tracking-tight">{t("title")}</h2>
      <p className="mt-3 text-base leading-7 text-zinc-400">{t("subtitle")}</p>
      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-4">
        {serverError && <Notice tone="error">{te(serverError)}</Notice>}
        <PasswordFields
          password={password}
          confirm={confirm}
          onPassword={setPassword}
          onConfirm={setConfirm}
          errors={errors}
          labels={{ password: t("password"), confirm: t("confirm") }}
          hint={t("hint")}
        />
        <Button type="submit" variant="submit" icon="solar:lock-keyhole-linear" iconMotion="none" className="w-full" disabled={pending}>
          {t("submit")}
        </Button>
      </form>
    </div>
  );
}
