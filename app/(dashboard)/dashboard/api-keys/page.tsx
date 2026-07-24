import type { Metadata } from "next";
import { LocalizedDashboardHeader } from "@/components/dashboard/localized-header";
import { ApiKeysPanel } from "@/components/dashboard/platform/api-keys-panel";

export const metadata: Metadata = { title: "API Keys" };

export default function ApiKeysPage() {
  return (
    <div className="space-y-6">
      <LocalizedDashboardHeader pageId="apiKeys" />
      <ApiKeysPanel />
    </div>
  );
}
