import { dashboardPageMetadata } from "@/lib/i18n/dashboard-metadata";
import { LocalizedDashboardHeader } from "@/components/dashboard/localized-header";
import { ApiKeysPanel } from "@/components/dashboard/platform/api-keys-panel";

export async function generateMetadata() {
  return dashboardPageMetadata("apiKeys");
}

export default function ApiKeysPage() {
  return (
    <div className="space-y-6">
      <LocalizedDashboardHeader pageId="apiKeys" />
      <ApiKeysPanel />
    </div>
  );
}
