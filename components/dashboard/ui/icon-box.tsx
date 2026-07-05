import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function DashboardIconBox({
  icon: Icon,
  className,
  gold = true,
}: {
  icon: LucideIcon;
  className?: string;
  gold?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-xl ring-1",
        gold
          ? "bg-gradient-to-br from-premium-gold/20 to-premium-gold/5 ring-premium-gold/25"
          : "bg-white/[0.04] ring-white/10",
        className,
      )}
    >
      <Icon
        className={cn("size-5", gold ? "text-premium-gold-light" : "text-white/60")}
        aria-hidden="true"
      />
    </div>
  );
}
