import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type DashboardStatCardProps = {
  label: string;
  value: number | string;
  change?: string;
  description?: string;
  icon: LucideIcon;
  className?: string;
};

export function DashboardStatCard({
  label,
  value,
  change,
  description,
  icon: Icon,
  className,
}: DashboardStatCardProps) {
  return (
    <div
      className={cn(
        "group dashboard-stat-card rounded-2xl border border-white/[0.09] glass-panel glass-panel-premium p-5 transition-all duration-300 hover:border-premium-gold/25 hover:shadow-gold-sm sm:p-6",
        className,
      )}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex size-11 items-center justify-center rounded-xl bg-premium-gold/10 ring-1 ring-premium-gold/25 transition-colors group-hover:bg-premium-gold/15">
          <Icon className="size-5 text-premium-gold-light" aria-hidden="true" />
        </div>
        {change && (
          <span className="inline-flex items-center rounded-full bg-premium-gold/10 px-2 py-0.5 text-[11px] font-semibold text-premium-gold-light ring-1 ring-premium-gold/20">
            {change}
          </span>
        )}
      </div>
      <p className="text-[13px] font-medium text-white/45">{label}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-white sm:text-[2rem]">
        {value}
      </p>
      {description && (
        <p className="mt-2 text-[12px] leading-relaxed text-white/35">
          {description}
        </p>
      )}
    </div>
  );
}
