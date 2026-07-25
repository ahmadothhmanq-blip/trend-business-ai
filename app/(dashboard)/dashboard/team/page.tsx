import { dashboardPageMetadata } from "@/lib/i18n/dashboard-metadata";
import { LocalizedDashboardHeader } from "@/components/dashboard/localized-header";
import { TeamPanel } from "@/components/dashboard/platform/team-panel";

export async function generateMetadata() {
  return dashboardPageMetadata("team");
}

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <LocalizedDashboardHeader pageId="team" />
      <TeamPanel />
    </div>
  );
}
