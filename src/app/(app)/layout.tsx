import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUser } from "@/lib/auth/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const result = await getCurrentUser();
  if (result.status === "signed-out") redirect("/login");
  // Conta desativada durante o uso: encerra a sessão (o proxy não deixaria voltar ao /login logado).
  if (result.status === "disabled") redirect("/auth/signout?reason=accountDisabled");

  return <AppShell user={result.user}>{children}</AppShell>;
}
