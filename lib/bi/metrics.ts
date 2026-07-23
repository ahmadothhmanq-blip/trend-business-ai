import type { SupabaseClient } from "@supabase/supabase-js";
import type { IntegratedMetricSnapshot } from "./integrations";

export type BiMetricsSnapshot = {
  revenue: number;
  expenses: number;
  profit: number;
  conversionRate: number;
  pipelineValue: number;
  customerGrowth: number;
  inventoryValue: number;
  marketingRoi: number;
  byPeriod: Record<string, number>;
};

export function computeMetricsFromIntegrations(data: IntegratedMetricSnapshot): BiMetricsSnapshot {
  const revenue = data.erp.revenueCents / 100;
  const expenses = data.erp.expensesCents / 100;
  const profit = revenue - expenses;
  const pipelineValue = data.crm.pipelineValueCents / 100;
  const conversionRate = data.crm.conversionRate;
  const customerGrowth = data.crm.contactCount;
  const inventoryValue = data.erp.inventoryValueCents / 100;
  const marketingSpend = data.marketing.totalBudgetCents / 100;
  const marketingRoi = marketingSpend > 0 ? Math.round((revenue / marketingSpend) * 100) : 0;

  return {
    revenue,
    expenses,
    profit,
    conversionRate,
    pipelineValue,
    customerGrowth,
    inventoryValue,
    marketingRoi,
    byPeriod: {
      revenue,
      expenses,
      profit,
      pipeline: pipelineValue,
    },
  };
}

export async function ensureDefaultMetrics(supabase: SupabaseClient, userId: string) {
  const defaults = [
    { key: "revenue", label: "Revenue", formula: "sum(erp_invoices.paid)", unit: "USD", aggregation: "sum" },
    { key: "expenses", label: "Expenses", formula: "sum(erp_expenses.approved)", unit: "USD", aggregation: "sum" },
    { key: "profit", label: "Profit", formula: "revenue - expenses", unit: "USD", aggregation: "computed" },
    { key: "conversion_rate", label: "Conversion Rate", formula: "crm_leads.converted / crm_leads.total", unit: "%", aggregation: "avg" },
    { key: "pipeline_value", label: "Sales Pipeline", formula: "sum(crm_deals.open)", unit: "USD", aggregation: "sum" },
    { key: "customer_growth", label: "Customer Growth", formula: "count(crm_contacts)", unit: "count", aggregation: "count" },
    { key: "inventory_value", label: "Inventory Value", formula: "sum(erp_stock)", unit: "USD", aggregation: "sum" },
    { key: "marketing_roi", label: "Marketing ROI", formula: "revenue / marketing_spend", unit: "%", aggregation: "ratio" },
  ];

  const { data: existing } = await supabase.from("bi_metrics").select("id").eq("user_id", userId).limit(1);
  if (existing?.length) return;

  await supabase.from("bi_metrics").insert(
    defaults.map((m) => ({ user_id: userId, ...m, metadata: {} })),
  );
}
