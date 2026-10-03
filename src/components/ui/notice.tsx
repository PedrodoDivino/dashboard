import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

/** Mensagem de retorno (sucesso/erro) no estilo do card de status do rodapé. */
export function Notice({
  tone = "success",
  children,
  className,
}: {
  tone?: "success" | "error";
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm",
        tone === "success" ? "border-[#FFA500]/30 bg-[#FFA500]/10 text-orange-100" : "border-red-400/30 bg-red-400/10 text-red-200",
        className,
      )}
    >
      <Icon
        name={tone === "success" ? "solar:check-circle-linear" : "solar:danger-circle-linear"}
        className={cn("mt-0.5 text-base", tone === "success" ? "text-[#FFA500]" : "text-red-300")}
      />
      <span>{children}</span>
    </p>
  );
}
