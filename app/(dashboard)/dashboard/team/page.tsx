import type { Metadata } from "next";
import { LocalizedDashboardHeader } from "@/components/dashboard/localized-header";
import { TeamPanel } from "@/components/dashboard/platform/team-panel";

export const metadata: Metadata = { title: "Team & Workspace" };

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <LocalizedDashboardHeader pageId="team" />
      <TeamPanel />
    </div>
  );
}
