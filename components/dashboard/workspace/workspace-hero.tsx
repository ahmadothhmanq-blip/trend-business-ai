import { Sparkles } from "lucide-react";
import { DashboardPanel } from "@/components/dashboard/ui/dashboard-card";
import { DashboardIconBox } from "@/components/dashboard/ui/icon-box";
import type { WorkspaceMetadata } from "@/lib/workspace/metadata";

type WorkspaceHeroProps = {
  metadata: WorkspaceMetadata;
};

export function WorkspaceHero({ metadata }: WorkspaceHeroProps) {
  const Icon = metadata.icon;

  return (
    <DashboardPanel gold className="relative overflow-hidden">
      <div className="pointer-events-none absolute right-0 top-0 h-56 w-56 rounded-full bg-premium-gold/10 blur-3xl" />
      <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-premium-gold/25 bg-premium-gold/10 px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-premium-gold-light uppercase">
            <Sparkles className="size-3.5" />
            {metadata.eyebrow}
          </div>
          <div className="flex items-start gap-4">
            <DashboardIconBox icon={Icon} className="size-12 rounded-2xl" />
            <div>
              <h2 className="text-2xl font-bold tracking-[-0.03em] text-white sm:text-3xl">
                {metadata.title}
              </h2>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-white/55">
                {metadata.description}
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {metadata.metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-2xl border border-white/[0.08] bg-black/20 p-4"
            >
              <p className="text-[11px] font-medium text-white/35">{metric.label}</p>
              <p className="mt-1 text-xl font-bold text-white">{metric.value}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardPanel>
  );
}
