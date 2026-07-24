"use client";

import { useEffect, useState } from "react";
import type { ErpAnalyticsSummary } from "@/lib/erp/analytics";
import { useWorkspaceT } from "@/lib/i18n/use-scoped-t";

export function AnalyticsDashboard({ initialSummary, companyId }: { initialSummary?: ErpAnalyticsSummary; companyId?: string }) {
  const wt = useWorkspaceT("erp");
  const [summary, setSummary] = useState(initialSummary ?? null);

  useEffect(() => {
    const q = companyId ? `?companyId=${companyId}` : "";
    void fetch(`/api/erp/analytics${q}`)
      .then((r) => r.json())
      .then((d) => d.summary && setSummary(d.summary))
      .catch(() => undefined);
  }, [companyId]);

  if (!summary) return <p className="text-sm text-white/30">{wt("panels.analytics.loading")}</p>;

  const money = (c: number) => `$${(c / 100).toLocaleString()}`;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[
        { label: wt("overview.metrics.revenue"), value: money(summary.revenueCents) },
        { label: wt("overview.metrics.expenses"), value: money(summary.expensesCents) },
        { label: wt("overview.metrics.profit"), value: money(summary.profitCents) },
        { label: wt("panels.analytics.cashFlow"), value: money(summary.cashFlowCents) },
        { label: wt("panels.analytics.inventory"), value: money(summary.inventoryValueCents) },
        { label: wt("panels.analytics.activeEmployees"), value: String(summary.activeEmployees) },
        { label: wt("panels.analytics.salesOrders"), value: String(summary.salesOrders) },
        { label: wt("panels.analytics.purchaseOrders"), value: String(summary.purchaseOrders) },
        { label: wt("panels.analytics.openInvoices"), value: String(summary.openInvoices) },
      ].map(({ label, value }) => (
        <div key={label} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <p className="text-xs uppercase text-white/40">{label}</p>
          <p className="mt-1 text-xl font-semibold text-white">{value}</p>
        </div>
      ))}
    </div>
  );
}
