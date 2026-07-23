"use client";

import type { ErpAnalyticsSummary } from "@/lib/erp/analytics";
import type { ErpCompany } from "@/types/erp";

type Props = { summary: ErpAnalyticsSummary; companies: ErpCompany[] };

export function ErpOverview({ summary, companies }: Props) {
  const money = (c: number) => `$${(c / 100).toLocaleString()}`;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Revenue", value: money(summary.revenueCents) },
          { label: "Expenses", value: money(summary.expensesCents) },
          { label: "Profit", value: money(summary.profitCents) },
          { label: "Inventory value", value: money(summary.inventoryValueCents) },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
            <p className="text-xs uppercase text-white/40">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <p className="text-xs uppercase text-white/40">Operations</p>
          <p className="mt-2 text-sm text-white/60">Sales orders: {summary.salesOrders}</p>
          <p className="text-sm text-white/60">Purchase orders: {summary.purchaseOrders}</p>
          <p className="text-sm text-white/60">Pending approvals: {summary.pendingApprovals}</p>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <p className="text-xs uppercase text-white/40">Companies</p>
          <ul className="mt-2 space-y-1 text-sm text-white/60">
            {companies.slice(0, 5).map((c) => (
              <li key={c.id}>{c.name} · {c.currency}</li>
            ))}
            {companies.length === 0 && <li>No companies yet — create one in Finance.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
