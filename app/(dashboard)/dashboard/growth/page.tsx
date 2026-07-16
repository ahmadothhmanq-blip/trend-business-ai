import type { Metadata } from "next";
import { DashboardHeader } from "@/components/dashboard/header";
import { GrowthPanel } from "@/components/dashboard/platform/growth-panel";

export const metadata: Metadata = { title: "Growth Engine" };

export default function GrowthDashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Growth Engine"
        description="Affiliates, referrals, leads, CRM, email, A/B tests and automations"
      />
      <GrowthPanel />
    </div>
  );
}
