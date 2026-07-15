import type { Metadata } from "next";
import { DashboardHeader } from "@/components/dashboard/header";
import { ApiKeysPanel } from "@/components/dashboard/platform/api-keys-panel";

export const metadata: Metadata = { title: "API Keys" };

export default function ApiKeysPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader title="API Keys" description="Create and manage API keys for programmatic access" />
      <ApiKeysPanel />
    </div>
  );
}
