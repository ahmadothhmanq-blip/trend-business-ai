import type { Metadata } from "next";
import { DashboardHeader } from "@/components/dashboard/header";
import { SeoHealthPanel } from "@/components/dashboard/platform/seo-health-panel";

export const metadata: Metadata = { title: "SEO Health" };

export default function SeoDashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader
        title="SEO Engine"
        description="Sitewide SEO health, sitemap coverage, and AI page analyzer"
      />
      <SeoHealthPanel />
    </div>
  );
}
