import { dashboardPageMetadata } from "@/lib/i18n/dashboard-metadata";
import { LocalizedDashboardHeader } from "@/components/dashboard/localized-header";
import { SeoHealthPanel } from "@/components/dashboard/platform/seo-health-panel";

export async function generateMetadata() {
  return dashboardPageMetadata("seo");
}

export default function SeoDashboardPage() {
  return (
    <div className="space-y-6">
      <LocalizedDashboardHeader pageId="seo"
      />
      <SeoHealthPanel />
    </div>
  );
}
