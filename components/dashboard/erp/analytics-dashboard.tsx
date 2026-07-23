"use client";

import { useEffect, useState } from "react";
import type { ErpAnalyticsSummary } from "@/lib/erp/analytics";

export function AnalyticsDashboard({ initialSummary, companyId }: { initialSummary?: ErpAnalyticsSummary; companyId?: string }) {
  const [summary, setSummary] = useState(initialSummary ?? null);

  useEffect(() => {
    const q = companyId ? `?companyId=${companyId}` : "";
    void fetch(`/api/erp/analytics${q}`)
      .then((r) => r.json())
      .then((d) => d.summary && setSummary(d.summary))
      .catch(() => undefined);
  }, [companyId]);

  if (!summary) return <p className="text-sm text-white/30">Loading analytics…</p>;

  const money = (c: number) => `$${(c / 100).toLocaleString()}`;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[
        { label: "Revenue", value: money(summary.revenueCents) },
        { label: "Expenses", value: money(summary.expensesCents) },
        { label: "Profit", value: money(summary.profitCents) },
        { label: "Cash flow", value: money(summary.cashFlowCents) },
        { label: "Inventory", value: money(summary.inventoryValueCents) },
        { label: "Active employees", value: String(summary.activeEmployees) },
        { label: "Sales orders", value: String(summary.salesOrders) },
        { label: "Purchase orders", value: String(summary.purchaseOrders) },
        { label: "Open invoices", value: String(summary.openInvoices) },
      ].map(({ label, value }) => (
        <div key={label} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <p className="text-xs uppercase text-white/40">{label}</p>
          <p className="mt-1 text-xl font-semibold text-white">{value}</p>
        </div>
      ))}
    </div>
  );
}
