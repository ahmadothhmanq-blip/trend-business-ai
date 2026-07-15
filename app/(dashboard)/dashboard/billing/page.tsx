import type { Metadata } from "next";
import { DashboardHeader } from "@/components/dashboard/header";
import { BillingPanel } from "@/components/dashboard/platform/billing-panel";

export const metadata: Metadata = { title: "Billing & Plans" };

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader title="Billing & Plans" description="Manage your subscription and billing preferences" />
      <BillingPanel />
    </div>
  );
}
