"use client";

import type { CrmAnalyticsSummary } from "@/lib/crm/analytics";
import type { CRMDeal, CRMLead } from "@/types/crm";
import { useWorkspaceT } from "@/lib/i18n/use-scoped-t";
import { useFormatMoney } from "@/lib/i18n/use-formatter";

type Props = {
  summary: CrmAnalyticsSummary;
  deals: CRMDeal[];
  leads: CRMLead[];
};

export function CrmOverview({ summary, deals, leads }: Props) {
  const wt = useWorkspaceT("crm");
  const formatMoney = useFormatMoney();

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: wt("overview.metrics.pipelineValue"), value: formatMoney(summary.pipelineValueCents) },
          { label: wt("overview.metrics.winRate"), value: `${summary.winRate}%` },
          { label: wt("overview.metrics.leadConversion"), value: `${summary.conversionRate}%` },
          { label: wt("overview.metrics.forecast"), value: formatMoney(summary.forecastCents) },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
            <p className="text-xs uppercase text-white/40">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <p className="text-xs uppercase text-white/40">{wt("overview.metrics.openDeals")}</p>
          <p className="mt-1 text-lg text-white">{summary.openDeals}</p>
          <ul className="mt-3 space-y-1 text-sm text-white/60">
            {deals.filter((d) => d.stage !== "won" && d.stage !== "lost").slice(0, 5).map((d) => (
              <li key={d.id}>{d.title} — {formatMoney(d.value_cents)}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <p className="text-xs uppercase text-white/40">{wt("overview.recentLeads")}</p>
          <ul className="mt-3 space-y-1 text-sm text-white/60">
            {leads.slice(0, 5).map((l) => (
              <li key={l.id}>{l.name || l.email} — {wt("overview.score")} {l.score}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
