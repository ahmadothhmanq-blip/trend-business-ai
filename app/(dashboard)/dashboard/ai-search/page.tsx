import { dashboardPageMetadata } from "@/lib/i18n/dashboard-metadata";
import { LocalizedDashboardHeader } from "@/components/dashboard/localized-header";
import { AiSearchPanel } from "@/components/dashboard/platform/ai-search-panel";

export async function generateMetadata() {
  return dashboardPageMetadata("aiSearch");
}

export default function AiSearchDashboardPage() {
  return (
    <div className="space-y-6">
      <LocalizedDashboardHeader pageId="aiSearch"
      />
      <AiSearchPanel />
    </div>
  );
}
