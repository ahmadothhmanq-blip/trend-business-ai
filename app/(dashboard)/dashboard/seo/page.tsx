import type { Metadata } from "next";
import { LocalizedDashboardHeader } from "@/components/dashboard/localized-header";
import { SeoHealthPanel } from "@/components/dashboard/platform/seo-health-panel";

export const metadata: Metadata = { title: "SEO Health" };

export default function SeoDashboardPage() {
  return (
    <div className="space-y-6">
      <LocalizedDashboardHeader pageId="seo"
      />
      <SeoHealthPanel />
    </div>
  );
}
