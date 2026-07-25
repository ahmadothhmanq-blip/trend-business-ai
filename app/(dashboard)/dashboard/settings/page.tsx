import { dashboardPageMetadata } from "@/lib/i18n/dashboard-metadata";
import { LocalizedDashboardHeader } from "@/components/dashboard/localized-header";
import { SettingsPanel } from "@/components/dashboard/platform/settings-panel";

export async function generateMetadata() {
  return dashboardPageMetadata("settings");
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <LocalizedDashboardHeader pageId="settings" />
      <SettingsPanel />
    </div>
  );
}
