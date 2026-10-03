"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { signIn, type SignInState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/frame";
import { Field, Input } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";

export function LoginForm({ initialError }: { initialError?: string }) {
  const t = useTranslations("auth.login");
  const te = useTranslations("errors");
  const [state, action, pending] = useActionState<SignInState, FormData>(signIn, { error: initialError });

  return (
    <div className="mx-auto max-w-md">
      <Eyebrow>{t("eyebrow")}</Eyebrow>
      <h2 className="mt-4 text-4xl font-medium leading-tight tracking-tight">{t("title")}</h2>
      <p className="mt-3 text-base leading-7 text-zinc-400">{t("subtitle")}</p>

      <form action={action} className="mt-8 space-y-4">
        {state.error && <Notice tone="error">{te(state.error)}</Notice>}
        <Field label={t("email")} htmlFor="email">
          <Input id="email" name="email" type="email" autoComplete="email" required placeholder={t("emailPlaceholder")} />
        </Field>
        <Field label={t("password")} htmlFor="password">
          <Input id="password" name="password" type="password" autoComplete="current-password" required placeholder={t("passwordPlaceholder")} />
        </Field>
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="font-mono text-xs text-zinc-400 underline-offset-4 transition-colors hover:text-white hover:underline"
          >
            {t("forgot")}
          </Link>
        </div>
        <Button type="submit" variant="submit" icon="solar:arrow-right-linear" className="mt-2 w-full" disabled={pending}>
          {pending ? t("submitting") : t("submit")}
        </Button>
      </form>

      <p className="mt-6 text-sm leading-6 text-zinc-500">{t("noAccount")}</p>
    </div>
  );
}
