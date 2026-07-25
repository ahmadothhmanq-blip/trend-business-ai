import { redirect } from "next/navigation";
import { LocalizedDashboardHeader } from "@/components/dashboard/localized-header";
import { AdminPanel } from "@/components/dashboard/platform/admin-panel";
import { createClient } from "@/lib/supabase/server";
import { dashboardPageMetadata } from "@/lib/i18n/dashboard-metadata";

export async function generateMetadata() {
  return dashboardPageMetadata("admin");
}

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const appMetadata = user?.app_metadata ?? {};
  const isAdmin = appMetadata.role === "admin" || appMetadata.is_admin === true;

  if (!isAdmin) redirect("/dashboard");

  return (
    <div className="space-y-6">
      <LocalizedDashboardHeader pageId="admin" />
      <AdminPanel />
    </div>
  );
}
