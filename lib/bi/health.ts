export type BiHealthReport = {
  status: "ok" | "degraded";
  modules: string[];
  migration: string;
  timestamp: string;
};

export async function buildBiHealthReport(): Promise<BiHealthReport> {
  return {
    status: "ok",
    modules: ["data-sources", "datasets", "metrics", "dashboards", "widgets", "reports", "queries", "alerts", "analytics", "assistant", "integrations"],
    migration: "068_bi_platform.sql",
    timestamp: new Date().toISOString(),
  };
}
