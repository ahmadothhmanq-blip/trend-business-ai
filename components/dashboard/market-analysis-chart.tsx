import { BarChart3 } from "lucide-react";
import { DashboardPanel } from "@/components/dashboard/ui/dashboard-card";
import { DashboardIconBox } from "@/components/dashboard/ui/icon-box";

type MarketAnalysisChartProps = {
  opportunities: string[];
  risks: string[];
  competitors: string[];
};

export function MarketAnalysisChart({
  opportunities,
  risks,
  competitors,
}: MarketAnalysisChartProps) {
  const items = [
    {
      label: "Opportunities",
      value: opportunities.length,
      gradient: "from-emerald-400/80 to-emerald-400/30",
    },
    {
      label: "Risks",
      value: risks.length,
      gradient: "from-amber-400/80 to-amber-400/30",
    },
    {
      label: "Competitors",
      value: competitors.length,
      gradient: "from-premium-gold/80 to-premium-gold/30",
    },
  ];
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <DashboardPanel>
      <div className="mb-5 flex items-center gap-3">
        <DashboardIconBox icon={BarChart3} />
        <div>
          <h3 className="font-bold text-white">Analysis Overview</h3>
          <p className="text-[13px] text-white/40">Distribution breakdown</p>
        </div>
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.label}>
            <div className="mb-2 flex justify-between text-[14px]">
              <span className="text-white/70">{item.label}</span>
              <span className="font-semibold tabular-nums text-premium-gold-light">
                {item.value}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.06] ring-1 ring-white/[0.04]">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${item.gradient} transition-all duration-700`}
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </DashboardPanel>
  );
}
