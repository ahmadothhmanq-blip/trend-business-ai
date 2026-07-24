import type { Metadata } from "next";
import { LocalizedDashboardHeader } from "@/components/dashboard/localized-header";
import { GrowthPanel } from "@/components/dashboard/platform/growth-panel";

export const metadata: Metadata = { title: "Growth Engine" };

export default function GrowthDashboardPage() {
  return (
    <div className="space-y-6">
      <LocalizedDashboardHeader pageId="growth"
      />
      <GrowthPanel />
    </div>
  );
}
