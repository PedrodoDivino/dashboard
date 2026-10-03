import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "./login-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.login");
  return { title: t("title") };
}

const KNOWN_ERRORS = ["link", "accountDisabled"] as const;

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const raw = (await searchParams).error;
  const initialError = KNOWN_ERRORS.find((e) => e === raw);
  return <LoginForm initialError={initialError === "link" ? "linkExpired" : initialError} />;
}
