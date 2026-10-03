import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ResetPasswordForm } from "./reset-password-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.reset");
  return { title: t("eyebrow") };
}

// Com o Supabase, o link do e-mail (reset ou convite) cai aqui com a sessão de recuperação
// já trocada pelo callback; o formulário só chama supabase.auth.updateUser({ password }).
export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
