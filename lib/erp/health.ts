export type ErpHealthReport = {
  status: "ok" | "degraded";
  modules: string[];
  migration: string;
  timestamp: string;
};

export async function buildErpHealthReport(): Promise<ErpHealthReport> {
  return {
    status: "ok",
    modules: [
      "companies",
      "branches",
      "finance",
      "accounting",
      "invoices",
      "expenses",
      "payments",
      "inventory",
      "products",
      "warehouses",
      "suppliers",
      "procurement",
      "sales-orders",
      "hr",
      "employees",
      "analytics",
      "assistant",
      "integrations",
    ],
    migration: "067_erp_platform.sql",
    timestamp: new Date().toISOString(),
  };
}
