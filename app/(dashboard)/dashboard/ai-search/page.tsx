import type { Metadata } from "next";
import { LocalizedDashboardHeader } from "@/components/dashboard/localized-header";
import { AiSearchPanel } from "@/components/dashboard/platform/ai-search-panel";

export const metadata: Metadata = { title: "AI Search Center" };

export default function AiSearchDashboardPage() {
  return (
    <div className="space-y-6">
      <LocalizedDashboardHeader pageId="aiSearch"
      />
      <AiSearchPanel />
    </div>
  );
}
