import Link from "next/link";
import { cn } from "@/lib/cn";

/** Marca "NX Nexus" do template. */
export function Brand({ href = "/home", className }: { href?: string; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 transition-all duration-300 hover:border-[#FF6400]/40 hover:bg-[#FF6400]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFA500]/50",
        className,
      )}
    >
      <span className="grid size-7 place-items-center rounded-md bg-[#FF6400] font-mono text-xs font-semibold tracking-tighter text-white">
        NX
      </span>
      <span className="text-sm font-medium tracking-tight text-white">Nexus</span>
    </Link>
  );
}
