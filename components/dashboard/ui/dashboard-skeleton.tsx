import { cn } from "@/lib/utils";

export function DashboardSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-gradient-to-r from-white/[0.06] via-white/[0.03] to-white/[0.06]",
        className,
      )}
    />
  );
}

export function DashboardCardSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] glass-panel p-6">
      <DashboardSkeleton className="mb-4 h-5 w-2/3" />
      <DashboardSkeleton className="mb-6 h-4 w-full" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <DashboardSkeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
}

export function DashboardListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <DashboardCardSkeleton key={i} rows={3} />
      ))}
    </div>
  );
}
