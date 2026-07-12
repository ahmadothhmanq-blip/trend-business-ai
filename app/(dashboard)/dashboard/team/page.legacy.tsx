import type { Metadata } from "next";
import { PlatformDashboardPage } from "@/components/dashboard/platform-dashboard-page";
import { DASHBOARD_PLATFORM_PAGES } from "@/lib/constants/dashboard-platform-pages";

export const metadata: Metadata = { title: "Team & Workspace" };

export default function TeamPage() {
  return <PlatformDashboardPage config={DASHBOARD_PLATFORM_PAGES.team} />;
}

