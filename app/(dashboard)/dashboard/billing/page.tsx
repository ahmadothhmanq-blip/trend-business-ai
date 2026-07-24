import type { Metadata } from "next";
import { LocalizedDashboardHeader } from "@/components/dashboard/localized-header";
import { BillingPanel } from "@/components/dashboard/platform/billing-panel";

export const metadata: Metadata = { title: "Billing & Plans" };

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <LocalizedDashboardHeader pageId="billing" />
      <BillingPanel />
    </div>
  );
}
