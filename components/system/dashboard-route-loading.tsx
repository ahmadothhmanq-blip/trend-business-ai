import { Loader2 } from "lucide-react";
import {
  DashboardCardSkeleton,
  DashboardSkeleton,
} from "@/components/dashboard/ui/dashboard-skeleton";

export function DashboardRouteLoading() {
  return (
    <div aria-busy="true" aria-live="polite" role="status">
      <header className="dashboard-header border-b border-white/[0.08] px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 pl-12 sm:flex-row sm:items-center sm:justify-between lg:pl-0">
          <div className="space-y-2">
            <DashboardSkeleton className="h-8 w-48" />
            <DashboardSkeleton className="h-4 w-64" />
          </div>
          <DashboardSkeleton className="h-10 w-10 rounded-full" />
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-white/[0.08] glass-panel p-5 sm:p-6"
            >
              <DashboardSkeleton className="mb-4 size-11 rounded-xl" />
              <DashboardSkeleton className="mb-2 h-8 w-16" />
              <DashboardSkeleton className="h-4 w-24" />
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <DashboardCardSkeleton rows={4} />
          <DashboardCardSkeleton rows={4} />
        </div>

        <div className="sr-only flex items-center gap-2 pt-8">
          <Loader2 className="size-4 animate-spin text-premium-gold" aria-hidden="true" />
          Loading dashboard
        </div>
      </main>
    </div>
  );
}
