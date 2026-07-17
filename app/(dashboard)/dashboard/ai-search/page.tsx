import type { Metadata } from "next";
import { DashboardHeader } from "@/components/dashboard/header";
import { AiSearchPanel } from "@/components/dashboard/platform/ai-search-panel";

export const metadata: Metadata = { title: "AI Search Center" };

export default function AiSearchDashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader
        title="AI Search Center"
        description="Optimize for Google, AI Mode, ChatGPT, Gemini, Claude, Perplexity and Copilot"
      />
      <AiSearchPanel />
    </div>
  );
}
