import type { Metadata } from "next";
import { DashboardHeader } from "@/components/dashboard/header";
import { UsagePanel } from "@/components/dashboard/platform/usage-panel";
import { ActivityPanel } from "@/components/dashboard/platform/activity-panel";

export const metadata: Metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader title="Analytics" description="View your AI usage analytics and activity history" />
      <UsagePanel />
      <ActivityPanel />
    </div>
  );
}
