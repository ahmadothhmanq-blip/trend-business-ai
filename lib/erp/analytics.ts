import type { SupabaseClient } from "@supabase/supabase-js";
import { computeInventoryValueCents } from "./inventory";

export type ErpAnalyticsSummary = {
  revenueCents: number;
  expensesCents: number;
  profitCents: number;
  inventoryValueCents: number;
  openInvoices: number;
  paidInvoices: number;
  salesOrders: number;
  purchaseOrders: number;
  activeEmployees: number;
  pendingApprovals: number;
  cashFlowCents: number;
  byInvoiceStatus: Record<string, number>;
};

export function computeErpAnalytics(input: {
  invoices: Array<{ status: string; amount_cents: number }>;
  expenses: Array<{ amount_cents: number; status: string }>;
  payments: Array<{ amount_cents: number; status: string }>;
  salesOrders: Array<{ status: string }>;
  purchaseOrders: Array<{ status: string }>;
  employees: Array<{ is_active: boolean }>;
  approvals: Array<{ status: string }>;
  inventoryValueCents: number;
}): ErpAnalyticsSummary {
  const paidInvoices = input.invoices.filter((i) => i.status === "paid");
  const revenueCents = paidInvoices.reduce((s, i) => s + Number(i.amount_cents ?? 0), 0);
  const expensesCents = input.expenses
    .filter((e) => e.status === "approved" || e.status === "paid")
    .reduce((s, e) => s + Number(e.amount_cents ?? 0), 0);
  const cashIn = input.payments.filter((p) => p.status === "completed").reduce((s, p) => s + Number(p.amount_cents ?? 0), 0);
  const cashOut = expensesCents;
  const byInvoiceStatus: Record<string, number> = {};
  for (const inv of input.invoices) {
    byInvoiceStatus[inv.status] = (byInvoiceStatus[inv.status] ?? 0) + 1;
  }

  return {
    revenueCents,
    expensesCents,
    profitCents: revenueCents - expensesCents,
    inventoryValueCents: input.inventoryValueCents,
    openInvoices: input.invoices.filter((i) => i.status === "sent" || i.status === "overdue").length,
    paidInvoices: paidInvoices.length,
    salesOrders: input.salesOrders.length,
    purchaseOrders: input.purchaseOrders.length,
    activeEmployees: input.employees.filter((e) => e.is_active).length,
    pendingApprovals: input.approvals.filter((a) => a.status === "pending").length,
    cashFlowCents: cashIn - cashOut,
    byInvoiceStatus,
  };
}

export async function getErpAnalytics(supabase: SupabaseClient, userId: string, companyId?: string) {
  const base = (table: string, select: string) => {
    let q = supabase.from(table).select(select).eq("user_id", userId);
    if (companyId) q = q.eq("company_id", companyId);
    return q;
  };

  const [invoicesRes, expensesRes, paymentsRes, soRes, poRes, empRes, apprRes] = await Promise.all([
    base("erp_invoices", "status, amount_cents"),
    base("erp_expenses", "amount_cents, status"),
    base("erp_payments", "amount_cents, status"),
    base("erp_sales_orders", "status"),
    base("erp_purchase_orders", "status"),
    base("erp_employees", "is_active"),
    base("erp_approvals", "status"),
  ]);

  let inventoryValueCents = 0;
  if (companyId) {
    try {
      inventoryValueCents = await computeInventoryValueCents(supabase, userId, companyId);
    } catch {
      inventoryValueCents = 0;
    }
  }

  const summary = computeErpAnalytics({
    invoices: (invoicesRes.data ?? []) as unknown as Array<{ status: string; amount_cents: number }>,
    expenses: (expensesRes.data ?? []) as unknown as Array<{ amount_cents: number; status: string }>,
    payments: (paymentsRes.data ?? []) as unknown as Array<{ amount_cents: number; status: string }>,
    salesOrders: (soRes.data ?? []) as unknown as Array<{ status: string }>,
    purchaseOrders: (poRes.data ?? []) as unknown as Array<{ status: string }>,
    employees: (empRes.data ?? []) as unknown as Array<{ is_active: boolean }>,
    approvals: (apprRes.data ?? []) as unknown as Array<{ status: string }>,
    inventoryValueCents,
  });

  return {
    summary,
    error:
      invoicesRes.error ??
      expensesRes.error ??
      paymentsRes.error ??
      soRes.error ??
      poRes.error ??
      empRes.error ??
      apprRes.error,
  };
}
