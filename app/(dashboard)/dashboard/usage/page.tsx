import type { Metadata } from "next";
import { DashboardHeader } from "@/components/dashboard/header";
import { UsagePanel } from "@/components/dashboard/platform/usage-panel";

export const metadata: Metadata = { title: "Usage & Monitoring" };

export default function UsagePage() {
  return (
    <div className="space-y-6">
      <DashboardHeader title="Usage & Monitoring" description="Track your AI generation usage and resource consumption" />
      <UsagePanel />
    </div>
  );
}
