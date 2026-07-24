import type { Metadata } from "next";
import { LocalizedDashboardHeader } from "@/components/dashboard/localized-header";
import { NotificationsPanel } from "@/components/dashboard/platform/notifications-panel";

export const metadata: Metadata = { title: "Notifications" };

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <LocalizedDashboardHeader pageId="notifications" />
      <NotificationsPanel />
    </div>
  );
}
