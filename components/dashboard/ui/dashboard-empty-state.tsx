import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type DashboardEmptyStateProps = {
  icon: LucideIcon;
  title?: string;
  description: string;
  className?: string;
};

export function DashboardEmptyState({
  icon: Icon,
  title,
  description,
  className,
}: DashboardEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.02] px-6 py-16 text-center sm:py-20",
        className,
      )}
    >
      <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-premium-gold/10 ring-1 ring-premium-gold/20">
        <Icon className="size-8 text-premium-gold/60" aria-hidden="true" />
      </div>
      {title && (
        <h3 className="mb-2 text-lg font-semibold text-white/80">{title}</h3>
      )}
      <p className="max-w-md text-[14px] leading-relaxed text-white/45 sm:text-[15px]">
        {description}
      </p>
    </div>
  );
}
