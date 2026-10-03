"use client";

import { useTranslations } from "next-intl";
import { Field, Input } from "@/components/ui/field";

/** Valida nova senha + confirmação. Retorna chaves de `validation.*`. */
export function validateNewPassword(password: string, confirm: string): { password?: "tooShort"; confirm?: "mismatch" } {
  const errors: { password?: "tooShort"; confirm?: "mismatch" } = {};
  if (password.length < 8) errors.password = "tooShort";
  if (confirm !== password) errors.confirm = "mismatch";
  return errors;
}

export function PasswordFields({
  password,
  confirm,
  onPassword,
  onConfirm,
  errors,
  labels,
  hint,
}: {
  password: string;
  confirm: string;
  onPassword: (value: string) => void;
  onConfirm: (value: string) => void;
  errors: { password?: "tooShort"; confirm?: "mismatch" };
  labels: { password: string; confirm: string };
  hint?: string;
}) {
  const tv = useTranslations("validation");
  return (
    <>
      <Field label={labels.password} htmlFor="new-password" hint={hint} error={errors.password && tv(errors.password)}>
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          value={password}
          invalid={!!errors.password}
          onChange={(e) => onPassword(e.target.value)}
        />
      </Field>
      <Field label={labels.confirm} htmlFor="confirm-password" error={errors.confirm && tv(errors.confirm)}>
        <Input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          value={confirm}
          invalid={!!errors.confirm}
          onChange={(e) => onConfirm(e.target.value)}
        />
      </Field>
    </>
  );
}
