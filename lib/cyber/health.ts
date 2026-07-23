export type CyberHealthReport = {
  status: "ok" | "degraded";
  modules: string[];
  migration: string;
  timestamp: string;
};

export async function buildCyberHealthReport(): Promise<CyberHealthReport> {
  return {
    status: "ok",
    modules: ["threats", "intelligence", "osint", "assets", "vulnerabilities", "scans", "alerts", "incidents", "cases", "playbooks", "monitoring", "analytics", "assistant", "integrations"],
    migration: "070_cybersecurity_platform.sql",
    timestamp: new Date().toISOString(),
  };
}
