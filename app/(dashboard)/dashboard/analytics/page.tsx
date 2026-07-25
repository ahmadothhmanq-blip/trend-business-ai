import { dashboardPageMetadata } from "@/lib/i18n/dashboard-metadata";
import { LocalizedDashboardHeader } from "@/components/dashboard/localized-header";
import { UsagePanel } from "@/components/dashboard/platform/usage-panel";
import { ActivityPanel } from "@/components/dashboard/platform/activity-panel";

export async function generateMetadata() {
  return dashboardPageMetadata("analytics");
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <LocalizedDashboardHeader pageId="analytics" />
      <UsagePanel />
      <ActivityPanel />
    </div>
  );
}
