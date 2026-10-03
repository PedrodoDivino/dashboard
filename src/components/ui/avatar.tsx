import { cn } from "@/lib/cn";

const sizes = {
  sm: "size-8 text-[0.6875rem]",
  md: "size-12 text-sm",
  lg: "size-20 text-xl",
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function Avatar({
  src,
  name,
  size = "md",
  className,
}: {
  src: string | null;
  name: string;
  size?: keyof typeof sizes;
  className?: string;
}) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element -- também exibe blob: da pré-visualização local
    return <img src={src} alt={name} className={cn("shrink-0 rounded-full object-cover", sizes[size], className)} />;
  }
  return (
    <span
      aria-label={name}
      className={cn(
        "grid shrink-0 place-items-center rounded-full border border-[#FF6400]/30 bg-[#331B0E] font-mono font-semibold tracking-tighter text-orange-100",
        sizes[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
