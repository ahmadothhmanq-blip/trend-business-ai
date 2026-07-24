import type { Metadata } from "next";
import { LocalizedDashboardHeader } from "@/components/dashboard/localized-header";
import { UsagePanel } from "@/components/dashboard/platform/usage-panel";

export const metadata: Metadata = { title: "Usage & Monitoring" };

export default function UsagePage() {
  return (
    <div className="space-y-6">
      <LocalizedDashboardHeader pageId="usage" />
      <UsagePanel />
    </div>
  );
}
