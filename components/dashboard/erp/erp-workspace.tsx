"use client";

import { useState } from "react";
import {
  BarChart3,
  Boxes,
  Briefcase,
  LayoutDashboard,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ErpOverview } from "@/components/dashboard/erp/erp-overview";
import { FinanceDashboard } from "@/components/dashboard/erp/finance-dashboard";
import { InventoryDashboard } from "@/components/dashboard/erp/inventory-dashboard";
import { OperationsDashboard } from "@/components/dashboard/erp/operations-dashboard";
import { HrDashboard } from "@/components/dashboard/erp/hr-dashboard";
import { AnalyticsDashboard } from "@/components/dashboard/erp/analytics-dashboard";
import { AssistantPanel } from "@/components/dashboard/erp/assistant-panel";
import type { ErpAnalyticsSummary } from "@/lib/erp/analytics";
import type {
  ErpAccount,
  ErpApproval,
  ErpCompany,
  ErpEmployee,
  ErpExpense,
  ErpInvoice,
  ErpProduct,
  ErpPurchaseOrder,
  ErpSalesOrder,
  ErpSupplier,
  ErpWarehouse,
} from "@/types/erp";

type Tab = "overview" | "finance" | "inventory" | "operations" | "hr" | "analytics" | "assistant";

type Props = {
  companyId: string;
  initialCompanies?: ErpCompany[];
  initialAccounts?: ErpAccount[];
  initialInvoices?: ErpInvoice[];
  initialExpenses?: ErpExpense[];
  initialProducts?: ErpProduct[];
  initialWarehouses?: ErpWarehouse[];
  initialSuppliers?: ErpSupplier[];
  initialSalesOrders?: ErpSalesOrder[];
  initialPurchaseOrders?: ErpPurchaseOrder[];
  initialApprovals?: ErpApproval[];
  initialEmployees?: ErpEmployee[];
  analyticsSummary?: ErpAnalyticsSummary;
};

export function ErpWorkspace({
  companyId,
  initialCompanies = [],
  initialAccounts = [],
  initialInvoices = [],
  initialExpenses = [],
  initialProducts = [],
  initialWarehouses = [],
  initialSuppliers = [],
  initialSalesOrders = [],
  initialPurchaseOrders = [],
  initialApprovals = [],
  initialEmployees = [],
  analyticsSummary,
}: Props) {
  const [tab, setTab] = useState<Tab>("overview");
  const summary = analyticsSummary ?? {
    revenueCents: 0,
    expensesCents: 0,
    profitCents: 0,
    inventoryValueCents: 0,
    openInvoices: 0,
    paidInvoices: 0,
    salesOrders: 0,
    purchaseOrders: 0,
    activeEmployees: 0,
    pendingApprovals: 0,
    cashFlowCents: 0,
    byInvoiceStatus: {},
  };

  const tabs = [
    { key: "overview" as const, label: "Overview", icon: LayoutDashboard },
    { key: "finance" as const, label: "Finance", icon: Wallet },
    { key: "inventory" as const, label: "Inventory", icon: Boxes },
    { key: "operations" as const, label: "Operations", icon: Briefcase },
    { key: "hr" as const, label: "HR", icon: Users },
    { key: "analytics" as const, label: "Analytics", icon: BarChart3 },
    { key: "assistant" as const, label: "AI Assistant", icon: Sparkles },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium min-w-[90px]",
              tab === key ? "bg-premium-gold/15 text-premium-gold-light" : "text-white/40 hover:bg-white/5",
            )}
          >
            <Icon className="size-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {tab === "overview" && <ErpOverview summary={summary} companies={initialCompanies} />}
      {tab === "finance" && (
        <FinanceDashboard
          companyId={companyId}
          initialCompanies={initialCompanies}
          initialAccounts={initialAccounts}
          initialInvoices={initialInvoices}
          initialExpenses={initialExpenses}
        />
      )}
      {tab === "inventory" && (
        <InventoryDashboard
          companyId={companyId}
          initialProducts={initialProducts}
          initialWarehouses={initialWarehouses}
          initialSuppliers={initialSuppliers}
        />
      )}
      {tab === "operations" && (
        <OperationsDashboard
          companyId={companyId}
          initialSalesOrders={initialSalesOrders}
          initialPurchaseOrders={initialPurchaseOrders}
          initialApprovals={initialApprovals}
        />
      )}
      {tab === "hr" && <HrDashboard companyId={companyId} initialEmployees={initialEmployees} />}
      {tab === "analytics" && <AnalyticsDashboard initialSummary={summary} companyId={companyId} />}
      {tab === "assistant" && <AssistantPanel />}
    </div>
  );
}
