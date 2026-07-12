import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PlatformDashboardPage } from "@/components/dashboard/platform-dashboard-page";
import { DASHBOARD_PLATFORM_PAGES } from "@/lib/constants/dashboard-platform-pages";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const appMetadata = user?.app_metadata ?? {};
  const isAdmin =
    appMetadata.role === "admin" ||
    appMetadata.is_admin === true;

  if (!isAdmin) {
    redirect("/dashboard");
  }

  return <PlatformDashboardPage config={DASHBOARD_PLATFORM_PAGES.admin} />;
}
