import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/header";
import { ErpWorkspace } from "@/components/dashboard/erp/erp-workspace";
import { getErpAnalytics } from "@/lib/erp/analytics";
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

export const metadata: Metadata = { title: "AI ERP Platform" };

export default async function ErpPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const userMeta = user.user_metadata ?? {};
  let companyId = "";
  let initialCompanies: ErpCompany[] = [];
  let initialAccounts: ErpAccount[] = [];
  let initialInvoices: ErpInvoice[] = [];
  let initialExpenses: ErpExpense[] = [];
  let initialProducts: ErpProduct[] = [];
  let initialWarehouses: ErpWarehouse[] = [];
  let initialSuppliers: ErpSupplier[] = [];
  let initialSalesOrders: ErpSalesOrder[] = [];
  let initialPurchaseOrders: ErpPurchaseOrder[] = [];
  let initialApprovals: ErpApproval[] = [];
  let initialEmployees: ErpEmployee[] = [];
  let analyticsSummary = {
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
    byInvoiceStatus: {} as Record<string, number>,
  };

  try {
    const { data } = await supabase.from("erp_companies").select("*").eq("user_id", user.id).order("updated_at", { ascending: false }).range(0, 19);
    initialCompanies = (data ?? []) as ErpCompany[];
    companyId = initialCompanies[0]?.id ?? "";
  } catch {
    // migration may not be applied
  }

  if (companyId) {
    const load = async <T,>(table: string): Promise<T[]> => {
      try {
        const { data } = await supabase.from(table).select("*").eq("user_id", user.id).eq("company_id", companyId).range(0, 99);
        return (data ?? []) as T[];
      } catch {
        return [];
      }
    };
    [initialAccounts, initialInvoices, initialExpenses, initialProducts, initialWarehouses, initialSuppliers, initialSalesOrders, initialPurchaseOrders, initialApprovals, initialEmployees] =
      await Promise.all([
        load<ErpAccount>("erp_accounts"),
        load<ErpInvoice>("erp_invoices"),
        load<ErpExpense>("erp_expenses"),
        load<ErpProduct>("erp_products"),
        load<ErpWarehouse>("erp_warehouses"),
        load<ErpSupplier>("erp_suppliers"),
        load<ErpSalesOrder>("erp_sales_orders"),
        load<ErpPurchaseOrder>("erp_purchase_orders"),
        load<ErpApproval>("erp_approvals"),
        load<ErpEmployee>("erp_employees"),
      ]);
    try {
      const { summary } = await getErpAnalytics(supabase, user.id, companyId);
      analyticsSummary = summary;
    } catch {
      // optional
    }
  }

  const { data: profile } = await supabase.from("profiles").select("full_name, avatar_url").eq("id", user.id).single();

  return (
    <>
      <DashboardHeader
        title="AI ERP Platform"
        description="Finance, inventory, operations, HR, analytics, and AI assistant"
        userEmail={user.email}
        userName={(profile?.full_name as string | undefined) ?? (userMeta.full_name as string | undefined)}
        avatarUrl={profile?.avatar_url as string | undefined}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
        <ErpWorkspace
          companyId={companyId}
          initialCompanies={initialCompanies}
          initialAccounts={initialAccounts}
          initialInvoices={initialInvoices}
          initialExpenses={initialExpenses}
          initialProducts={initialProducts}
          initialWarehouses={initialWarehouses}
          initialSuppliers={initialSuppliers}
          initialSalesOrders={initialSalesOrders}
          initialPurchaseOrders={initialPurchaseOrders}
          initialApprovals={initialApprovals}
          initialEmployees={initialEmployees}
          analyticsSummary={analyticsSummary}
        />
      </main>
    </>
  );
}
