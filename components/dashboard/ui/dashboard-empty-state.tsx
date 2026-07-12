import { type LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type DashboardEmptyStateProps = {
  icon: LucideIcon;
  title?: string;
  description: string;
  className?: string;
  action?: { label: string; href: string };
};

export function DashboardEmptyState({
  icon: Icon,
  title,
  description,
  className,
  action,
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
      {action && (
        <Button
          asChild
          className="mt-6 rounded-xl bg-[linear-gradient(180deg,#FFD700,#D4AF37)] text-[#111] hover:brightness-110"
        >
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}
