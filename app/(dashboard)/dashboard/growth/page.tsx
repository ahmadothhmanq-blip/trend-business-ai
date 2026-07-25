import { dashboardPageMetadata } from "@/lib/i18n/dashboard-metadata";
import { LocalizedDashboardHeader } from "@/components/dashboard/localized-header";
import { GrowthPanel } from "@/components/dashboard/platform/growth-panel";

export async function generateMetadata() {
  return dashboardPageMetadata("growth");
}

export default function GrowthDashboardPage() {
  return (
    <div className="space-y-6">
      <LocalizedDashboardHeader pageId="growth"
      />
      <GrowthPanel />
    </div>
  );
}
