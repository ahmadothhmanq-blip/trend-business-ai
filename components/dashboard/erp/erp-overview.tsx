"use client";

import type { ErpAnalyticsSummary } from "@/lib/erp/analytics";
import type { ErpCompany } from "@/types/erp";
import { useWorkspaceT } from "@/lib/i18n/use-scoped-t";

type Props = { summary: ErpAnalyticsSummary; companies: ErpCompany[] };

export function ErpOverview({ summary, companies }: Props) {
  const wt = useWorkspaceT("erp");
  const money = (c: number) => `$${(c / 100).toLocaleString()}`;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: wt("overview.metrics.revenue"), value: money(summary.revenueCents) },
          { label: wt("overview.metrics.expenses"), value: money(summary.expensesCents) },
          { label: wt("overview.metrics.profit"), value: money(summary.profitCents) },
          { label: wt("overview.metrics.inventoryValue"), value: money(summary.inventoryValueCents) },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
            <p className="text-xs uppercase text-white/40">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <p className="text-xs uppercase text-white/40">{wt("overview.operations")}</p>
          <p className="mt-2 text-sm text-white/60">{wt("overview.salesOrders")}: {summary.salesOrders}</p>
          <p className="text-sm text-white/60">{wt("overview.purchaseOrders")}: {summary.purchaseOrders}</p>
          <p className="text-sm text-white/60">{wt("overview.pendingApprovals")}: {summary.pendingApprovals}</p>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <p className="text-xs uppercase text-white/40">{wt("overview.companies")}</p>
          <ul className="mt-2 space-y-1 text-sm text-white/60">
            {companies.slice(0, 5).map((c) => (
              <li key={c.id}>{c.name} · {c.currency}</li>
            ))}
            {companies.length === 0 && <li>{wt("overview.noCompanies")}</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
