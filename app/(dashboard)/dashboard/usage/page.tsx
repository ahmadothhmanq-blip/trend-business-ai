import { dashboardPageMetadata } from "@/lib/i18n/dashboard-metadata";
import { LocalizedDashboardHeader } from "@/components/dashboard/localized-header";
import { UsagePanel } from "@/components/dashboard/platform/usage-panel";

export async function generateMetadata() {
  return dashboardPageMetadata("usage");
}

export default function UsagePage() {
  return (
    <div className="space-y-6">
      <LocalizedDashboardHeader pageId="usage" />
      <UsagePanel />
    </div>
  );
}
