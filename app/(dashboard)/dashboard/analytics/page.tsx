import type { Metadata } from "next";
import { LocalizedDashboardHeader } from "@/components/dashboard/localized-header";
import { UsagePanel } from "@/components/dashboard/platform/usage-panel";
import { ActivityPanel } from "@/components/dashboard/platform/activity-panel";

export const metadata: Metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <LocalizedDashboardHeader pageId="analytics" />
      <UsagePanel />
      <ActivityPanel />
    </div>
  );
}
