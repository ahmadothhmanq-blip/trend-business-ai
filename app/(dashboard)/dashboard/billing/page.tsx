import { dashboardPageMetadata } from "@/lib/i18n/dashboard-metadata";
import { LocalizedDashboardHeader } from "@/components/dashboard/localized-header";
import { BillingPanel } from "@/components/dashboard/platform/billing-panel";

export async function generateMetadata() {
  return dashboardPageMetadata("billing");
}

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <LocalizedDashboardHeader pageId="billing" />
      <BillingPanel />
    </div>
  );
}
