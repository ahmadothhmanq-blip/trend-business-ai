import { dashboardPageMetadata } from "@/lib/i18n/dashboard-metadata";
import { LocalizedDashboardHeader } from "@/components/dashboard/localized-header";
import { NotificationsPanel } from "@/components/dashboard/platform/notifications-panel";

export async function generateMetadata() {
  return dashboardPageMetadata("notifications");
}

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <LocalizedDashboardHeader pageId="notifications" />
      <NotificationsPanel />
    </div>
  );
}
