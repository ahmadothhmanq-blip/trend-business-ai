import type { Metadata } from "next";
import { DashboardHeader } from "@/components/dashboard/header";
import { NotificationsPanel } from "@/components/dashboard/platform/notifications-panel";

export const metadata: Metadata = { title: "Notifications" };

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader title="Notifications" description="View and manage your notifications" />
      <NotificationsPanel />
    </div>
  );
}
