"use client";

import Link from "next/link";
import { useState, useTransition, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { requestPasswordReset } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/frame";
import { Field, Input } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordForm() {
  const t = useTranslations("auth.forgot");
  const tv = useTranslations("validation");
  const tl = useTranslations("auth.login");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [sentTo, setSentTo] = useState<string>();
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setError(tv("invalidEmail"));
      return;
    }
    setError(undefined);
    startTransition(async () => {
      const result = await requestPasswordReset(email);
      if (result.ok) setSentTo(email);
    });
  }

  return (
    <div className="mx-auto max-w-md">
      <Eyebrow>{t("eyebrow")}</Eyebrow>

      {sentTo ? (
        <div aria-live="polite">
          <span className="mt-6 grid size-12 place-items-center rounded-xl border border-[#FF6400]/20 bg-[#FF6400]/10">
            <Icon name="solar:letter-linear" className="text-2xl text-[#FFA500]" />
          </span>
          <h2 className="mt-5 text-4xl font-medium leading-tight tracking-tight">{t("sentTitle")}</h2>
          <p className="mt-3 text-base leading-7 text-zinc-400">{t("sentBody", { email: sentTo })}</p>
          <div className="mt-8 flex flex-col gap-3">
            <Link href="/login" className="text-center font-mono text-xs text-zinc-400 transition-colors hover:text-white">
              {t("back")}
            </Link>
          </div>
        </div>
      ) : (
        <>
          <h2 className="mt-4 text-4xl font-medium leading-tight tracking-tight">{t("title")}</h2>
          <p className="mt-3 text-base leading-7 text-zinc-400">{t("subtitle")}</p>
          <form onSubmit={onSubmit} noValidate className="mt-8 space-y-4">
            <Field label={tl("email")} htmlFor="email" error={error}>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={tl("emailPlaceholder")}
                value={email}
                invalid={!!error}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Button type="submit" variant="submit" icon="solar:plain-linear" iconMotion="send" className="w-full" disabled={pending}>
              {t("submit")}
            </Button>
          </form>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center gap-2 font-mono text-xs text-zinc-400 transition-colors hover:text-white"
          >
            <Icon name="solar:arrow-left-linear" className="text-base text-[#FFA500]" />
            {t("back")}
          </Link>
        </>
      )}
    </div>
  );
}
