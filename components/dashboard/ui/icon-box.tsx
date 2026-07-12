import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function DashboardIconBox({
  icon: Icon,
  className,
  gold = true,
  size = "md",
}: {
  icon: LucideIcon;
  className?: string;
  gold?: boolean;
  size?: "sm" | "md";
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl ring-1",
        size === "sm" ? "size-9" : "size-10",
        gold
          ? "bg-gradient-to-br from-premium-gold/20 to-premium-gold/5 ring-premium-gold/25"
          : "bg-white/[0.04] ring-white/10",
        className,
      )}
    >
      <Icon
        className={cn(
          size === "sm" ? "size-4" : "size-5",
          gold ? "text-premium-gold-light" : "text-white/60",
        )}
        aria-hidden="true"
      />
    </div>
  );
}
